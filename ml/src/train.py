"""Train the production model and write the model package.

Usage (from ml/):
    uv run python src/train.py

Reproduces the final flow of notebooks 03-04: clean -> 70/15/15 split -> fit XGBoost on the
training split -> pick the F1-optimal threshold on validation -> evaluate once on test.
Writes model.joblib + metadata.json to backend/app/ml_artifacts/v<version>/.
"""

from __future__ import annotations

import argparse
import json
import platform
from datetime import UTC, datetime
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
import xgboost
from xgboost import XGBClassifier

from loan_ml.data import (
    DEFAULT_FLAG,
    EDUCATION_ORDER,
    FEATURES,
    HOME_OWNERSHIP_VALUES,
    LOAN_INTENT_VALUES,
    MAX_AGE,
    MAX_EMP_EXP,
    ML_ROOT,
    NOMINAL_FEATURES,
    NUMERIC_FEATURES,
    RANDOM_STATE,
    SENSITIVE,
    clean,
    file_sha256,
    load_raw,
    split,
    xy,
)
from loan_ml.evaluation import best_f1_threshold, evaluate
from loan_ml.features import build_pipeline

MODEL_VERSION = "1.0.0"
PARAMS_PATH = ML_ROOT / "reports" / "phase1" / "best_params.json"
ARTIFACTS_ROOT = ML_ROOT.parent / "backend" / "app" / "ml_artifacts"
XGB_FIXED = {
    "tree_method": "hist",
    "random_state": RANDOM_STATE,
    "n_jobs": 4,
    "eval_metric": "logloss",
}

# API input bounds (PROJE_PLANI.md 5.3). They stay inside the region the training data covers.
INPUT_RANGES = {
    "person_age": {"min": 20, "max": 80, "integer": True},
    "person_income": {"min": 8000, "max": 1_000_000, "integer": False},
    "person_emp_exp": {"min": 0, "max": 50, "integer": True},
    "loan_amnt": {"min": 500, "max": 35_000, "integer": False},
    "loan_int_rate": {"min": 5.4, "max": 20.0, "integer": False},
    "cb_person_cred_hist_length": {"min": 2, "max": 30, "integer": True},
    "credit_score": {"min": 390, "max": 850, "integer": True},
}
# person_emp_exp must be <= person_age - MIN_AGE_EXPERIENCE_GAP.
MIN_AGE_EXPERIENCE_GAP = 15


def percentile_ranges(train: pd.DataFrame) -> dict:
    """p1-p99 of each numeric feature in the training split, for low-confidence warnings."""
    return {
        col: {
            "p1": float(np.percentile(train[col], 1)),
            "p99": float(np.percentile(train[col], 99)),
        }
        for col in NUMERIC_FEATURES
    }


def encoded_feature_groups(encoded_names: list[str]) -> list[str]:
    """Original feature behind each encoded column (one-hot columns map to their source)."""
    return [
        next((f for f in NOMINAL_FEATURES if name.startswith(f + "_")), name)
        for name in encoded_names
    ]


def train(output_dir: Path) -> dict:
    assert SENSITIVE not in FEATURES, "person_gender must never be a model input"

    params = json.loads(PARAMS_PATH.read_text(encoding="utf-8"))["xgboost"]
    raw = load_raw()
    data = clean(raw)
    splits = split(data)
    X_train, y_train = xy(splits.train)
    X_val, y_val = xy(splits.val)
    X_test, _ = xy(splits.test)

    pipeline = build_pipeline(XGBClassifier(**params, **XGB_FIXED)).fit(X_train, y_train)

    threshold = best_f1_threshold(y_val, pipeline.predict_proba(X_val)[:, 1])
    val_metrics = evaluate(splits.val, pipeline.predict_proba(X_val)[:, 1], threshold)
    test_metrics = evaluate(splits.test, pipeline.predict_proba(X_test)[:, 1], threshold)

    encoded_names = list(pipeline.named_steps["preprocess"].get_feature_names_out())
    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "algorithm": "xgboost.XGBClassifier",
        "hyperparameters": {**params, **XGB_FIXED},
        "calibration": None,
        "threshold": threshold,
        "data": {
            "file": "loan_data.csv",
            "sha256": file_sha256(),
            "rows_raw": len(raw),
            "rows_clean": len(data),
            "rows": {
                "train": len(splits.train),
                "val": len(splits.val),
                "test": len(splits.test),
            },
            "split": {"train": 0.70, "val": 0.15, "test": 0.15, "random_state": RANDOM_STATE},
            "cleaning": {"max_person_age": MAX_AGE, "max_person_emp_exp": MAX_EMP_EXP},
        },
        "features": {
            "model_inputs": FEATURES,
            "derived": {"loan_percent_income": "round(loan_amnt / person_income, 2)"},
            "excluded": [SENSITIVE],
            "encoded": encoded_names,
            "encoded_groups": encoded_feature_groups(encoded_names),
            "allowed_values": {
                "person_education": EDUCATION_ORDER,
                "person_home_ownership": HOME_OWNERSHIP_VALUES,
                "loan_intent": LOAN_INTENT_VALUES,
            },
            "input_ranges": INPUT_RANGES,
            "min_age_experience_gap": MIN_AGE_EXPERIENCE_GAP,
            "training_percentiles": percentile_ranges(splits.train),
        },
        "metrics": {
            "note": (
                "Overall metrics are inflated because every record with "
                f"{DEFAULT_FLAG}=Yes is rejected; always read them with the no_default subgroup."
            ),
            "validation": val_metrics,
            "test": test_metrics,
        },
        "libraries": {
            "python": platform.python_version(),
            "scikit-learn": sklearn.__version__,
            "xgboost": xgboost.__version__,
            "numpy": np.__version__,
            "pandas": pd.__version__,
            "joblib": joblib.__version__,
        },
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, output_dir / "model.joblib", compress=3)
    (output_dir / "metadata.json").write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ARTIFACTS_ROOT / f"v{MODEL_VERSION}",
        help="Directory for model.joblib and metadata.json",
    )
    args = parser.parse_args()
    metadata = train(args.output_dir)

    print(f"Model v{metadata['model_version']} written to {args.output_dir}")
    print(f"Threshold: {metadata['threshold']:.4f}")
    for scope, label in (("overall", "overall"), ("no_default", f"{DEFAULT_FLAG}=No")):
        m = metadata["metrics"]["test"][scope]
        print(
            f"Test [{label}] ROC-AUC {m['roc_auc']:.4f} | PR-AUC {m['pr_auc']:.4f} | "
            f"F1 {m['f1']:.4f} | precision {m['precision']:.4f} | recall {m['recall']:.4f} | "
            f"Brier {m['brier']:.4f}"
        )


if __name__ == "__main__":
    main()
