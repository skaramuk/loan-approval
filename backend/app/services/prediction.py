"""Turning a validated application into a prediction.

Input validation (ranges, allowed values) is the API schema's job; this module assumes the
eleven input fields are present and well-typed.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any

import pandas as pd

from app.services.explanation import Factor, explain
from app.services.model_store import ModelBundle

INPUT_FIELDS = (
    "person_age",
    "person_education",
    "person_income",
    "person_emp_exp",
    "person_home_ownership",
    "loan_amnt",
    "loan_intent",
    "loan_int_rate",
    "cb_person_cred_hist_length",
    "credit_score",
    "previous_loan_defaults_on_file",
)

BAND_HIGH = "yuksek"
BAND_BORDERLINE = "sinirda"
BAND_LOW = "dusuk"
BORDERLINE_MARGIN = 0.10


@dataclass(frozen=True)
class Prediction:
    model_version: str
    approved: bool
    probability: float
    threshold: float
    band: str
    loan_percent_income: float
    factors: list[Factor] = field(default_factory=list)
    low_confidence_fields: list[str] = field(default_factory=list)


def loan_percent_income(loan_amnt: float, person_income: float) -> float:
    """Same derivation as the training data: the ratio rounded to two decimals."""
    return round(loan_amnt / person_income, 2)


def build_frame(bundle: ModelBundle, application: Mapping[str, Any]) -> pd.DataFrame:
    """One-row frame with exactly the model's input columns, in training order."""
    missing = [name for name in INPUT_FIELDS if name not in application]
    if missing:
        raise ValueError(f"Missing input fields: {', '.join(missing)}")

    row = {name: application[name] for name in INPUT_FIELDS}
    row["previous_loan_defaults_on_file"] = "Yes" if row["previous_loan_defaults_on_file"] else "No"
    row["loan_percent_income"] = loan_percent_income(row["loan_amnt"], row["person_income"])
    return pd.DataFrame([row])[bundle.features]


def band_for(probability: float, threshold: float) -> str:
    if abs(probability - threshold) < BORDERLINE_MARGIN:
        return BAND_BORDERLINE
    return BAND_HIGH if probability >= threshold else BAND_LOW


def low_confidence_fields(bundle: ModelBundle, frame: pd.DataFrame) -> list[str]:
    """Numeric features outside the p1-p99 range of the training data.

    Includes the derived loan_percent_income, which can be unusual even when both of its
    inputs are ordinary.
    """
    percentiles = bundle.metadata["features"]["training_percentiles"]
    return [
        name
        for name, bounds in percentiles.items()
        if not bounds["p1"] <= float(frame[name].iloc[0]) <= bounds["p99"]
    ]


def predict(
    bundle: ModelBundle, application: Mapping[str, Any], top_factors: int | None = None
) -> Prediction:
    frame = build_frame(bundle, application)
    probability = float(bundle.pipeline.predict_proba(frame)[0, 1])
    threshold = bundle.threshold
    return Prediction(
        model_version=bundle.version,
        approved=probability >= threshold,
        probability=round(probability, 4),
        threshold=round(threshold, 4),
        band=band_for(probability, threshold),
        loan_percent_income=float(frame["loan_percent_income"].iloc[0]),
        factors=explain(bundle, frame, top_n=top_factors),
        low_confidence_fields=low_confidence_fields(bundle, frame),
    )
