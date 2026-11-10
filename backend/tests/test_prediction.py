import math

import pytest

from app.services.explanation import FEATURE_LABELS, raw_contributions
from app.services.prediction import (
    BAND_BORDERLINE,
    BAND_HIGH,
    BAND_LOW,
    INPUT_FIELDS,
    band_for,
    build_frame,
    loan_percent_income,
    predict,
)


def test_prediction_shape(bundle, application):
    result = predict(bundle, application)

    assert result.model_version == "1.0.0"
    assert 0.0 <= result.probability <= 1.0
    assert result.threshold == round(bundle.threshold, 4)
    assert result.approved == (result.probability >= result.threshold)
    assert result.band in {BAND_HIGH, BAND_BORDERLINE, BAND_LOW}
    assert result.loan_percent_income == 0.2
    assert result.low_confidence_fields == []


def test_factors_cover_every_feature_once(bundle, application):
    factors = predict(bundle, application).factors

    assert sorted(f.feature for f in factors) == sorted(bundle.features)
    assert all(f.label == FEATURE_LABELS[f.feature] for f in factors)
    assert all(f.direction in {"olumlu", "olumsuz"} for f in factors)
    assert all((f.direction == "olumlu") == (f.contribution >= 0) for f in factors)
    impacts = [f.impact for f in factors]
    assert impacts == sorted(impacts, reverse=True)
    assert sum(impacts) == pytest.approx(1.0, abs=1e-3)


def test_top_factors_limits_the_list(bundle, application):
    assert len(predict(bundle, application, top_factors=3).factors) == 3


def test_contributions_add_up_to_the_model_output(bundle, application):
    frame = build_frame(bundle, application)
    grouped, base = raw_contributions(bundle, frame)
    probability = float(bundle.pipeline.predict_proba(frame)[0, 1])

    log_odds = math.log(probability / (1 - probability))
    assert sum(grouped.values()) + base == pytest.approx(log_odds, abs=1e-3)


def test_previous_default_is_rejected_and_dominates(bundle, application):
    result = predict(bundle, {**application, "previous_loan_defaults_on_file": True})

    assert result.approved is False
    assert result.band == BAND_LOW
    assert result.probability < 0.01
    top = result.factors[0]
    assert top.feature == "previous_loan_defaults_on_file"
    assert top.direction == "olumsuz"


def test_frame_has_model_columns_in_training_order(bundle, application):
    frame = build_frame(bundle, application)

    assert list(frame.columns) == bundle.features
    assert frame["previous_loan_defaults_on_file"].iloc[0] == "No"
    assert "person_gender" not in frame.columns


def test_extra_fields_such_as_gender_are_ignored(bundle, application):
    baseline = predict(bundle, application)
    with_gender = predict(bundle, {**application, "person_gender": "female"})
    assert with_gender.probability == baseline.probability


def test_missing_field_raises(bundle, application):
    del application["credit_score"]
    with pytest.raises(ValueError, match="credit_score"):
        predict(bundle, application)


def test_input_fields_plus_derived_match_model_features(bundle):
    assert sorted([*INPUT_FIELDS, "loan_percent_income"]) == sorted(bundle.features)


@pytest.mark.parametrize(
    ("amount", "income", "expected"),
    [(12000, 60000, 0.2), (35000, 71948, 0.49), (1000, 12282, 0.08)],
)
def test_loan_percent_income_matches_training_data(amount, income, expected):
    assert loan_percent_income(amount, income) == expected


@pytest.mark.parametrize(
    ("probability", "expected"),
    [(0.95, BAND_HIGH), (0.57, BAND_HIGH), (0.50, BAND_BORDERLINE), (0.40, BAND_BORDERLINE),
     (0.36, BAND_LOW), (0.02, BAND_LOW)],
)  # fmt: skip
def test_band(probability, expected):
    assert band_for(probability, threshold=0.46) == expected


def test_low_confidence_fields_flag_unusual_values(bundle, application):
    result = predict(bundle, {**application, "person_age": 70, "person_income": 900000})

    assert "person_age" in result.low_confidence_fields
    assert "person_income" in result.low_confidence_fields
    assert "credit_score" not in result.low_confidence_fields
