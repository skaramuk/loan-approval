"""Preprocessing shared by training and serving."""

from __future__ import annotations

import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, OrdinalEncoder, StandardScaler

from loan_ml.data import (
    BINARY_FEATURES,
    DEFAULT_FLAG_VALUES,
    EDUCATION_ORDER,
    NOMINAL_FEATURES,
    NUMERIC_FEATURES,
    ORDINAL_FEATURES,
)

LOG_FEATURES = ["person_income"]


def _categorical_steps() -> list[tuple]:
    return [
        ("education", OrdinalEncoder(categories=[EDUCATION_ORDER]), ORDINAL_FEATURES),
        (
            "nominal",
            OneHotEncoder(handle_unknown="ignore", sparse_output=False),
            NOMINAL_FEATURES,
        ),
        ("default_flag", OrdinalEncoder(categories=[DEFAULT_FLAG_VALUES]), BINARY_FEATURES),
    ]


def build_tree_preprocessor() -> ColumnTransformer:
    """Numeric columns pass through untouched; tree models need no scaling."""
    return ColumnTransformer(
        [("numeric", "passthrough", NUMERIC_FEATURES), *_categorical_steps()],
        verbose_feature_names_out=False,
    )


def build_linear_preprocessor() -> Pipeline:
    """Log-transform income, then standardize everything for Logistic Regression."""
    plain = [c for c in NUMERIC_FEATURES if c not in LOG_FEATURES]
    encode = ColumnTransformer(
        [
            ("numeric", "passthrough", plain),
            (
                "log_numeric",
                FunctionTransformer(np.log1p, feature_names_out="one-to-one"),
                LOG_FEATURES,
            ),
            *_categorical_steps(),
        ],
        verbose_feature_names_out=False,
    )
    return Pipeline([("encode", encode), ("scale", StandardScaler())])


def build_pipeline(model, linear: bool = False) -> Pipeline:
    preprocessor = build_linear_preprocessor() if linear else build_tree_preprocessor()
    return Pipeline([("preprocess", preprocessor), ("model", model)])
