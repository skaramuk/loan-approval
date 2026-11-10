import time
import uuid

import pytest
from cryptography.hazmat.primitives.asymmetric import ec

from app.core.security import get_token_verifier
from app.db.session import get_session
from app.main import app

URL = "/api/v1/predictions"
SOME_ID = "33333333-3333-4333-8333-333333333333"

PROTECTED = [
    ("POST", URL),
    ("GET", URL),
    ("GET", f"{URL}/{SOME_ID}"),
    ("DELETE", f"{URL}/{SOME_ID}"),
    ("DELETE", "/api/v1/me/predictions"),
]


def assert_unauthorized(response) -> None:
    assert response.status_code == 401
    error = response.json()["error"]
    assert error["code"] == "unauthorized"
    assert "giriş" in error["message"]


@pytest.mark.parametrize(("method", "url"), PROTECTED)
def test_protected_endpoints_require_a_token(client, application, method, url):
    assert_unauthorized(client.request(method, url, json=application))


@pytest.mark.parametrize(("method", "url"), PROTECTED)
def test_protected_endpoints_reject_garbage_tokens(client, application, method, url):
    response = client.request(
        method, url, json=application, headers={"Authorization": "Bearer abc.def.ghi"}
    )
    assert_unauthorized(response)


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": int(time.time()) - 60},
        {"aud": "anon"},
        {"iss": "https://someone-else.supabase.co/auth/v1"},
        {"sub": "not-a-uuid"},
        {"sub": None},
        {"exp": None},
        {"aud": None},
        {"iss": None},
    ],
    ids=["expired", "wrong-aud", "wrong-iss", "bad-sub", "no-sub", "no-exp", "no-aud", "no-iss"],
)
def test_invalid_claims_are_rejected(client, make_token, overrides):
    token = make_token(**overrides)
    assert_unauthorized(client.get(URL, headers={"Authorization": f"Bearer {token}"}))


def test_token_signed_with_another_key_is_rejected(client, make_token):
    token = make_token(key=ec.generate_private_key(ec.SECP256R1()))
    assert_unauthorized(client.get(URL, headers={"Authorization": f"Bearer {token}"}))


def test_symmetric_and_unsigned_tokens_are_rejected(client, make_token):
    hs256 = make_token(key="x" * 48, algorithm="HS256")
    assert_unauthorized(client.get(URL, headers={"Authorization": f"Bearer {hs256}"}))

    unsigned = make_token(key=None, algorithm="none")
    assert_unauthorized(client.get(URL, headers={"Authorization": f"Bearer {unsigned}"}))


def test_valid_token_is_accepted(client, auth_a):
    response = client.get(URL, headers=auth_a)
    assert response.status_code == 200
    assert response.json() == {"items": [], "total": 0, "page": 1, "page_size": 10}


def test_user_id_in_the_body_is_never_trusted(client, auth_a, auth_b, application):
    other_user = str(uuid.uuid4())
    rejected = client.post(URL, json={**application, "user_id": other_user}, headers=auth_a)
    assert rejected.status_code == 422

    created = client.post(URL, json=application, headers=auth_a)
    assert created.status_code == 201
    # The record belongs to the token's subject and to nobody else.
    assert client.get(URL, headers=auth_a).json()["total"] == 1
    assert client.get(URL, headers=auth_b).json()["total"] == 0


def test_missing_configuration_returns_503(client, auth_a, application):
    app.dependency_overrides.pop(get_token_verifier)
    get_token_verifier.cache_clear()
    no_auth = client.get(URL, headers=auth_a)
    assert no_auth.status_code == 503
    assert no_auth.json()["error"]["code"] == "auth_not_configured"


def test_missing_database_returns_503(client, auth_a):
    app.dependency_overrides.pop(get_session)
    response = client.get(URL, headers=auth_a)
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "database_not_configured"
