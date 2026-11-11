import os

# Tests must never reach a real database or auth server, whatever backend/.env contains.
os.environ["DATABASE_URL"] = ""
os.environ["SUPABASE_URL"] = ""

import time  # noqa: E402
import uuid  # noqa: E402

import jwt  # noqa: E402
import pytest  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import ec  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.rate_limit import limiter  # noqa: E402
from app.core.security import TokenVerifier, get_token_verifier  # noqa: E402
from app.db.models import Base  # noqa: E402
from app.db.session import get_session  # noqa: E402
from app.main import app  # noqa: E402
from app.services.history import register_model_version  # noqa: E402
from app.services.model_store import ModelBundle, load_model  # noqa: E402

ISSUER = "https://test-project.supabase.co/auth/v1"
AUDIENCE = "authenticated"
USER_A = uuid.UUID("11111111-1111-4111-8111-111111111111")
USER_B = uuid.UUID("22222222-2222-4222-8222-222222222222")


class StaticKeyProvider:
    def __init__(self, public_key) -> None:
        self._public_key = public_key

    def get_key(self, token: str):
        return self._public_key


@pytest.fixture(scope="session")
def signing_key() -> ec.EllipticCurvePrivateKey:
    return ec.generate_private_key(ec.SECP256R1())


@pytest.fixture(scope="session")
def make_token(signing_key):
    """Build an access token shaped like Supabase's. Keyword arguments override claims;
    a claim set to None is removed."""

    def _make(sub=USER_A, key=signing_key, algorithm="ES256", **overrides) -> str:
        now = int(time.time())
        claims = {
            "sub": str(sub),
            "aud": AUDIENCE,
            "iss": ISSUER,
            "iat": now,
            "exp": now + 3600,
            "role": "authenticated",
        }
        claims.update(overrides)
        claims = {name: value for name, value in claims.items() if value is not None}
        return jwt.encode(claims, key, algorithm=algorithm)

    return _make


@pytest.fixture(scope="session")
def bundle() -> ModelBundle:
    return load_model()


@pytest.fixture
def db_engine():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def client(db_engine, signing_key, bundle):
    factory = sessionmaker(bind=db_engine, expire_on_commit=False)

    def override_session():
        with factory() as session:
            yield session

    verifier = TokenVerifier(StaticKeyProvider(signing_key.public_key()), ISSUER, AUDIENCE)
    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_token_verifier] = lambda: verifier
    limiter.reset()
    with Session(db_engine) as session:
        register_model_version(session, bundle)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_a(make_token) -> dict[str, str]:
    return {"Authorization": f"Bearer {make_token(USER_A)}"}


@pytest.fixture
def auth_b(make_token) -> dict[str, str]:
    return {"Authorization": f"Bearer {make_token(USER_B)}"}


@pytest.fixture
def application() -> dict:
    """A typical applicant: every numeric value sits inside the training p1-p99 range."""
    return {
        "person_age": 28,
        "person_education": "Bachelor",
        "person_income": 60000,
        "person_emp_exp": 5,
        "person_home_ownership": "RENT",
        "loan_amnt": 12000,
        "loan_intent": "PERSONAL",
        "loan_int_rate": 12.5,
        "cb_person_cred_hist_length": 6,
        "credit_score": 640,
        "previous_loan_defaults_on_file": False,
    }
