"""Request and response schemas for predictions.

Bounds and allowed values are read from the active model's metadata.json, never hard-coded:
a retrained model brings its own limits.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator

from app.core.config import get_settings
from app.services.model_store import load_metadata

_FEATURES = load_metadata(get_settings().model_version)["features"]
_RANGES = _FEATURES["input_ranges"]
_ALLOWED = _FEATURES["allowed_values"]
MIN_AGE_EXPERIENCE_GAP: int = _FEATURES["min_age_experience_gap"]


def _bounds(name: str) -> dict:
    return {"ge": _RANGES[name]["min"], "le": _RANGES[name]["max"]}


Education = Literal[*_ALLOWED["person_education"]]
HomeOwnership = Literal[*_ALLOWED["person_home_ownership"]]
LoanIntent = Literal[*_ALLOWED["loan_intent"]]


EXAMPLE_REQUEST = {
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


class PredictionRequest(BaseModel):
    # Unknown fields are rejected, so person_gender can never reach the model.
    model_config = ConfigDict(extra="forbid", json_schema_extra={"examples": [EXAMPLE_REQUEST]})

    person_age: int = Field(**_bounds("person_age"), description="Yaş")
    person_education: Education = Field(description="Eğitim durumu")
    person_income: float = Field(**_bounds("person_income"), description="Yıllık gelir (USD)")
    person_emp_exp: int = Field(**_bounds("person_emp_exp"), description="İş tecrübesi (yıl)")
    person_home_ownership: HomeOwnership = Field(description="Konut durumu")
    loan_amnt: float = Field(**_bounds("loan_amnt"), description="Kredi tutarı (USD)")
    loan_intent: LoanIntent = Field(description="Kredi amacı")
    loan_int_rate: float = Field(**_bounds("loan_int_rate"), description="Faiz oranı (yıllık, %)")
    cb_person_cred_hist_length: int = Field(
        **_bounds("cb_person_cred_hist_length"), description="Kredi geçmişi süresi (yıl)"
    )
    credit_score: int = Field(**_bounds("credit_score"), description="Kredi skoru")
    previous_loan_defaults_on_file: bool = Field(
        description="Daha önce ödenmemiş kredi kaydı var mı?"
    )

    @field_validator("person_emp_exp")
    @classmethod
    def experience_fits_age(cls, value: int, info: ValidationInfo) -> int:
        # person_age is declared first, so it is already validated (absent if it failed).
        age = info.data.get("person_age")
        if age is not None and value > age - MIN_AGE_EXPERIENCE_GAP:
            raise ValueError(
                f"İş tecrübesi, yaşınızdan en az {MIN_AGE_EXPERIENCE_GAP} yıl küçük olmalıdır."
            )
        return value


class FactorOut(BaseModel):
    feature: str
    label: str
    direction: Literal["olumlu", "olumsuz"]
    impact: float = Field(description="Bu tahmindeki toplam mutlak katkı içindeki pay (0-1)")


Band = Literal["yuksek", "sinirda", "dusuk"]


class PredictionResponse(BaseModel):
    id: UUID
    created_at: datetime
    model_version: str
    approved: bool
    probability: float
    threshold: float
    band: Band
    factors: list[FactorOut]
    low_confidence_fields: list[str]


class PredictionInput(BaseModel):
    """The stored inputs of a prediction, plus the derived ratio."""

    person_age: int
    person_education: str
    person_income: float
    person_emp_exp: int
    person_home_ownership: str
    loan_amnt: float
    loan_intent: str
    loan_int_rate: float
    cb_person_cred_hist_length: int
    credit_score: int
    previous_loan_defaults_on_file: bool
    loan_percent_income: float


class PredictionDetail(PredictionResponse):
    input: PredictionInput


class PredictionListItem(BaseModel):
    id: UUID
    created_at: datetime
    loan_amnt: float
    loan_intent: str
    probability: float
    threshold: float
    approved: bool
    band: Band


class PredictionListResponse(BaseModel):
    items: list[PredictionListItem]
    total: int
    page: int
    page_size: int


class DeletedResponse(BaseModel):
    deleted: int
