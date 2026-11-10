import pytest

from app.services.model_store import ModelBundle, load_model


@pytest.fixture(scope="session")
def bundle() -> ModelBundle:
    return load_model()


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
