import logging

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def details_by_field(response) -> dict[str, str]:
    return {d["field"]: d["message"] for d in response.json()["error"]["details"]}


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "model_loaded": True,
        "model_version": "1.0.0",
        "app_version": app.version,
    }


def test_health_reports_missing_model(client):
    bundle, app.state.bundle = app.state.bundle, None
    try:
        health = client.get("/health")
        prediction = client.post("/api/v1/predictions", json={})
    finally:
        app.state.bundle = bundle
    assert health.status_code == 503
    assert health.json()["model_loaded"] is False
    assert prediction.status_code in {422, 503}


def test_model_info(client):
    response = client.get("/api/v1/model")
    assert response.status_code == 200
    body = response.json()

    assert body["model_version"] == "1.0.0"
    assert 0 < body["threshold"] < 1
    # Accuracy-style overall numbers are never published without the no-default subgroup.
    assert {"overall", "no_default"} == body["metrics"].keys()
    assert body["metrics"]["no_default"]["roc_auc"] > 0.9
    assert body["fields"]["numeric"]["person_age"]["min"] == 20
    assert body["fields"]["numeric"]["person_age"]["integer"] is True
    assert "RENT" in body["fields"]["categorical"]["person_home_ownership"]
    assert body["excluded_features"] == ["person_gender"]
    assert "person_gender" not in str(body["fields"])


def test_create_prediction(client, application):
    response = client.post("/api/v1/predictions", json=application)
    assert response.status_code == 201
    body = response.json()

    assert set(body) == {
        "id", "created_at", "model_version", "approved", "probability", "threshold", "band",
        "factors", "low_confidence_fields",
    }  # fmt: skip
    assert body["model_version"] == "1.0.0"
    assert 0 <= body["probability"] <= 1
    assert body["approved"] == (body["probability"] >= body["threshold"])
    assert body["band"] in {"yuksek", "sinirda", "dusuk"}
    assert len(body["factors"]) == 12
    assert set(body["factors"][0]) == {"feature", "label", "direction", "impact"}
    assert body["low_confidence_fields"] == []


def test_prediction_with_previous_default_is_rejected(client, application):
    response = client.post(
        "/api/v1/predictions", json={**application, "previous_loan_defaults_on_file": True}
    )
    body = response.json()
    assert body["approved"] is False
    assert body["band"] == "dusuk"
    assert body["factors"][0]["feature"] == "previous_loan_defaults_on_file"


@pytest.mark.parametrize(
    ("field", "value", "expected"),
    [
        ("person_age", 19, "En az 20 olmalıdır."),
        ("person_age", 81, "En fazla 80 olmalıdır."),
        ("person_age", "abc", "Tam sayı girilmelidir."),
        ("person_income", 7999, "En az 8.000 olmalıdır."),
        ("person_income", 1_000_001, "En fazla 1.000.000 olmalıdır."),
        ("person_emp_exp", 51, "En fazla 50 olmalıdır."),
        ("loan_amnt", 499, "En az 500 olmalıdır."),
        ("loan_amnt", 35_001, "En fazla 35.000 olmalıdır."),
        ("loan_int_rate", 5.3, "En az 5,4 olmalıdır."),
        ("loan_int_rate", 20.1, "En fazla 20 olmalıdır."),
        ("cb_person_cred_hist_length", 1, "En az 2 olmalıdır."),
        ("credit_score", 389, "En az 390 olmalıdır."),
        ("credit_score", 851, "En fazla 850 olmalıdır."),
        ("person_education", "PhD", "Geçerli seçeneklerden biri seçilmelidir."),
        ("person_home_ownership", "rent", "Geçerli seçeneklerden biri seçilmelidir."),
        ("loan_intent", "CAR", "Geçerli seçeneklerden biri seçilmelidir."),
        ("previous_loan_defaults_on_file", "belki", "Evet ya da hayır seçilmelidir."),
    ],
)
def test_validation_rules(client, application, field, value, expected):
    response = client.post("/api/v1/predictions", json={**application, field: value})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert details_by_field(response) == {field: expected}


def test_experience_must_fit_age(client, application):
    response = client.post(
        "/api/v1/predictions", json={**application, "person_age": 25, "person_emp_exp": 11}
    )
    assert response.status_code == 422
    assert details_by_field(response) == {
        "person_emp_exp": "İş tecrübesi, yaşınızdan en az 15 yıl küçük olmalıdır."
    }

    allowed = client.post(
        "/api/v1/predictions", json={**application, "person_age": 25, "person_emp_exp": 10}
    )
    assert allowed.status_code == 201


def test_missing_field(client, application):
    del application["credit_score"]
    response = client.post("/api/v1/predictions", json=application)
    assert response.status_code == 422
    assert details_by_field(response) == {"credit_score": "Bu alan zorunludur."}


def test_gender_is_rejected(client, application):
    response = client.post("/api/v1/predictions", json={**application, "person_gender": "female"})
    assert response.status_code == 422
    assert details_by_field(response) == {"person_gender": "Bu alan kabul edilmiyor."}


def test_derived_field_cannot_be_supplied(client, application):
    response = client.post("/api/v1/predictions", json={**application, "loan_percent_income": 0.01})
    assert response.status_code == 422
    assert "loan_percent_income" in details_by_field(response)


def test_low_confidence_fields(client, application):
    response = client.post(
        "/api/v1/predictions", json={**application, "person_age": 70, "person_emp_exp": 40}
    )
    assert response.status_code == 201
    assert {"person_age", "person_emp_exp"} <= set(response.json()["low_confidence_fields"])


def test_errors_share_one_shape(client):
    not_found = client.get("/api/v1/does-not-exist")
    assert not_found.status_code == 404
    assert not_found.json() == {
        "error": {"code": "not_found", "message": "Aradığınız kayıt bulunamadı.", "details": []}
    }

    wrong_method = client.delete("/health")
    assert wrong_method.status_code == 405
    assert wrong_method.json()["error"]["code"] == "method_not_allowed"

    bad_json = client.post(
        "/api/v1/predictions", content="{not json", headers={"Content-Type": "application/json"}
    )
    assert bad_json.status_code == 422
    assert bad_json.json()["error"]["code"] == "validation_error"


def test_unexpected_errors_are_hidden(application, monkeypatch):
    def boom(*_args, **_kwargs):
        raise RuntimeError("secret internal detail")

    monkeypatch.setattr("app.api.predictions.predict", boom)
    with TestClient(app, raise_server_exceptions=False) as failing_client:
        response = failing_client.post("/api/v1/predictions", json=application)
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "secret" not in response.text


def test_cors_allows_only_configured_origin(client):
    allowed = client.options(
        "/api/v1/predictions",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "POST"},
    )
    assert allowed.headers.get("access-control-allow-origin") == "http://localhost:3000"

    blocked = client.options(
        "/api/v1/predictions",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in blocked.headers


def test_inputs_are_not_logged(client, application, caplog):
    unusual = {**application, "person_income": 123457, "credit_score": 777}
    with caplog.at_level(logging.DEBUG):
        client.post("/api/v1/predictions", json=unusual)
    assert "123457" not in caplog.text
    assert "777" not in caplog.text
