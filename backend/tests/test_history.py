from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import ModelVersion, Prediction

URL = "/api/v1/predictions"


def create(client, headers, application, **changes) -> dict:
    response = client.post(URL, json={**application, **changes}, headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def spread_timestamps(db_engine) -> None:
    """Give rows distinct, increasing created_at values in insertion order."""
    with Session(db_engine) as session:
        rows = session.scalars(select(Prediction)).all()
        base = datetime(2026, 1, 1, tzinfo=UTC)
        for offset, row in enumerate(sorted(rows, key=lambda r: r.loan_amnt)):
            row.created_at = base + timedelta(minutes=offset)
        session.commit()


def test_model_version_is_registered_as_active(client, db_engine):
    with Session(db_engine) as session:
        versions = session.scalars(select(ModelVersion)).all()
    assert [(v.version, v.is_active) for v in versions] == [("1.0.0", True)]
    assert versions[0].algorithm == "xgboost.XGBClassifier"
    assert {"overall", "no_default"} <= versions[0].metrics.keys()
    assert len(versions[0].data_sha256) == 64


def test_prediction_is_stored_with_inputs_and_result(client, auth_a, application, db_engine):
    created = create(client, auth_a, application)

    with Session(db_engine) as session:
        row = session.scalars(select(Prediction)).one()
    assert str(row.id) == created["id"]
    assert str(row.user_id) == "11111111-1111-4111-8111-111111111111"
    assert row.model_version == "1.0.0"
    assert row.person_income == 60000
    assert row.loan_percent_income == 0.2
    assert row.probability == created["probability"]
    assert row.threshold == created["threshold"]
    assert row.approved == created["approved"]
    assert len(row.factors) == 12
    assert not hasattr(row, "person_gender")


def test_detail_returns_inputs_and_result(client, auth_a, application):
    created = create(client, auth_a, application)

    response = client.get(f"{URL}/{created['id']}", headers=auth_a)
    assert response.status_code == 200
    body = response.json()
    assert body["input"] == {**application, "loan_percent_income": 0.2}
    for key in ("id", "probability", "threshold", "approved", "band", "model_version"):
        assert body[key] == created[key]
    assert body["factors"] == created["factors"]


def test_list_is_newest_first_and_paginated(client, auth_a, application, db_engine):
    for amount in (1000, 2000, 3000, 4000, 5000):
        create(client, auth_a, application, loan_amnt=amount)
    spread_timestamps(db_engine)

    first = client.get(URL, params={"page": 1, "page_size": 2}, headers=auth_a).json()
    assert first["total"] == 5
    assert (first["page"], first["page_size"]) == (1, 2)
    assert [item["loan_amnt"] for item in first["items"]] == [5000, 4000]
    assert set(first["items"][0]) == {
        "id", "created_at", "loan_amnt", "loan_intent", "probability", "threshold", "approved",
        "band",
    }  # fmt: skip

    last = client.get(URL, params={"page": 3, "page_size": 2}, headers=auth_a).json()
    assert [item["loan_amnt"] for item in last["items"]] == [1000]

    beyond = client.get(URL, params={"page": 9, "page_size": 2}, headers=auth_a).json()
    assert beyond["items"] == []
    assert beyond["total"] == 5


@pytest.mark.parametrize("params", [{"page": 0}, {"page_size": 0}, {"page_size": 101}])
def test_list_rejects_bad_paging(client, auth_a, params):
    assert client.get(URL, params=params, headers=auth_a).status_code == 422


def test_list_can_filter_by_outcome(client, auth_a, application):
    create(client, auth_a, application, previous_loan_defaults_on_file=True)  # always rejected
    create(client, auth_a, application, person_income=9000, loan_amnt=5000)

    rejected = client.get(URL, params={"approved": "false"}, headers=auth_a).json()
    approved = client.get(URL, params={"approved": "true"}, headers=auth_a).json()
    assert rejected["total"] + approved["total"] == 2
    assert all(item["approved"] is False for item in rejected["items"])
    assert all(item["approved"] is True for item in approved["items"])
    assert rejected["total"] >= 1


def test_users_only_see_their_own_predictions(client, auth_a, auth_b, application):
    mine = create(client, auth_a, application)
    theirs = create(client, auth_b, application, loan_amnt=9999)

    a_list = client.get(URL, headers=auth_a).json()
    b_list = client.get(URL, headers=auth_b).json()
    assert [item["id"] for item in a_list["items"]] == [mine["id"]]
    assert [item["id"] for item in b_list["items"]] == [theirs["id"]]


def test_another_users_record_looks_like_it_does_not_exist(client, auth_a, auth_b, application):
    theirs = create(client, auth_b, application)
    missing = "44444444-4444-4444-8444-444444444444"

    for method in ("GET", "DELETE"):
        other = client.request(method, f"{URL}/{theirs['id']}", headers=auth_a)
        absent = client.request(method, f"{URL}/{missing}", headers=auth_a)
        assert other.status_code == absent.status_code == 404
        # Identical bodies: nothing distinguishes "not yours" from "not there".
        assert other.json() == absent.json()

    # The owner's record survived the other user's delete attempt.
    assert client.get(f"{URL}/{theirs['id']}", headers=auth_b).status_code == 200


def test_delete_own_prediction(client, auth_a, application):
    created = create(client, auth_a, application)

    deleted = client.delete(f"{URL}/{created['id']}", headers=auth_a)
    assert deleted.status_code == 204
    assert deleted.content == b""
    assert client.get(f"{URL}/{created['id']}", headers=auth_a).status_code == 404
    assert client.delete(f"{URL}/{created['id']}", headers=auth_a).status_code == 404


def test_delete_all_only_removes_the_callers_predictions(client, auth_a, auth_b, application):
    for _ in range(3):
        create(client, auth_a, application)
    create(client, auth_b, application)

    response = client.delete("/api/v1/me/predictions", headers=auth_a)
    assert response.status_code == 200
    assert response.json() == {"deleted": 3}
    assert client.get(URL, headers=auth_a).json()["total"] == 0
    assert client.get(URL, headers=auth_b).json()["total"] == 1

    assert client.delete("/api/v1/me/predictions", headers=auth_a).json() == {"deleted": 0}


def test_malformed_id_is_a_validation_error(client, auth_a):
    assert client.get(f"{URL}/not-a-uuid", headers=auth_a).status_code == 422


def test_rate_limit_is_per_user(client, auth_a, auth_b, application):
    for _ in range(20):
        assert client.post(URL, json=application, headers=auth_a).status_code == 201

    limited = client.post(URL, json=application, headers=auth_a)
    assert limited.status_code == 429
    assert limited.json()["error"]["code"] == "rate_limited"
    assert "Çok fazla istek" in limited.json()["error"]["message"]

    # Another user is unaffected, and reading history is not limited.
    assert client.post(URL, json=application, headers=auth_b).status_code == 201
    assert client.get(URL, headers=auth_a).json()["total"] == 20
