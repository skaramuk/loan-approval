"""Per-prediction explanations from XGBoost's built-in contributions (no shap dependency)."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
import xgboost as xgb

from app.services.model_store import ModelBundle

# User-facing labels (Turkish), keyed by original feature name.
FEATURE_LABELS = {
    "person_age": "Yaş",
    "person_education": "Eğitim durumu",
    "person_income": "Yıllık gelir",
    "person_emp_exp": "İş tecrübesi",
    "person_home_ownership": "Konut durumu",
    "loan_amnt": "Kredi tutarı",
    "loan_intent": "Kredi amacı",
    "loan_int_rate": "Faiz oranı",
    "loan_percent_income": "Kredi / gelir oranı",
    "cb_person_cred_hist_length": "Kredi geçmişi süresi",
    "credit_score": "Kredi skoru",
    "previous_loan_defaults_on_file": "Geçmiş temerrüt kaydı",
}

POSITIVE = "olumlu"
NEGATIVE = "olumsuz"


@dataclass(frozen=True)
class Factor:
    feature: str
    label: str
    direction: str
    impact: float  # share of the total absolute contribution, 0..1
    contribution: float  # signed contribution in log-odds


def raw_contributions(bundle: ModelBundle, frame: pd.DataFrame) -> tuple[dict[str, float], float]:
    """Signed log-odds contribution per original feature, plus the model's base value.

    One-hot columns are summed back onto the feature they came from. Contributions plus the base
    value add up to the model's log-odds output.
    """
    preprocess = bundle.pipeline.named_steps["preprocess"]
    booster = bundle.pipeline.named_steps["model"].get_booster()
    encoded = np.asarray(preprocess.transform(frame), dtype=float)
    contribs = booster.predict(xgb.DMatrix(encoded), pred_contribs=True)[0]

    grouped: dict[str, float] = dict.fromkeys(bundle.features, 0.0)
    for group, value in zip(
        bundle.metadata["features"]["encoded_groups"], contribs[:-1], strict=True
    ):
        grouped[group] += float(value)
    return grouped, float(contribs[-1])


def explain(bundle: ModelBundle, frame: pd.DataFrame, top_n: int | None = None) -> list[Factor]:
    """Factors sorted by impact, strongest first."""
    grouped, _ = raw_contributions(bundle, frame)
    total = sum(abs(v) for v in grouped.values()) or 1.0
    factors = [
        Factor(
            feature=feature,
            label=FEATURE_LABELS[feature],
            direction=POSITIVE if value >= 0 else NEGATIVE,
            impact=round(abs(value) / total, 4),
            contribution=round(value, 6),
        )
        for feature, value in grouped.items()
    ]
    factors.sort(key=lambda f: abs(f.contribution), reverse=True)
    return factors[:top_n] if top_n else factors
