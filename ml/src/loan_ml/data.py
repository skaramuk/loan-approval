"""Dataset loading, cleaning and splitting."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split

ML_ROOT = Path(__file__).resolve().parents[2]
RAW_PATH = ML_ROOT / "data" / "raw" / "loan_data.csv"

TARGET = "loan_status"
SENSITIVE = "person_gender"  # never a model input; used only for the fairness audit
DEFAULT_FLAG = "previous_loan_defaults_on_file"

NUMERIC_FEATURES = [
    "person_age",
    "person_income",
    "person_emp_exp",
    "loan_amnt",
    "loan_int_rate",
    "loan_percent_income",
    "cb_person_cred_hist_length",
    "credit_score",
]
ORDINAL_FEATURES = ["person_education"]
NOMINAL_FEATURES = ["person_home_ownership", "loan_intent"]
BINARY_FEATURES = [DEFAULT_FLAG]
FEATURES = NUMERIC_FEATURES + ORDINAL_FEATURES + NOMINAL_FEATURES + BINARY_FEATURES

EDUCATION_ORDER = ["High School", "Associate", "Bachelor", "Master", "Doctorate"]
HOME_OWNERSHIP_VALUES = ["RENT", "MORTGAGE", "OWN", "OTHER"]
LOAN_INTENT_VALUES = [
    "EDUCATION",
    "MEDICAL",
    "VENTURE",
    "PERSONAL",
    "DEBTCONSOLIDATION",
    "HOMEIMPROVEMENT",
]
DEFAULT_FLAG_VALUES = ["No", "Yes"]

# Cleaning thresholds, confirmed in notebooks/01_eda.ipynb.
MAX_AGE = 80
MAX_EMP_EXP = 60

RANDOM_STATE = 42


def file_sha256(path: Path = RAW_PATH) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_raw(path: Path = RAW_PATH) -> pd.DataFrame:
    return pd.read_csv(path)


def clean(df: pd.DataFrame, max_age: int = MAX_AGE, max_emp_exp: int = MAX_EMP_EXP) -> pd.DataFrame:
    """Drop rows with impossible age or employment experience."""
    mask = (df["person_age"] <= max_age) & (df["person_emp_exp"] <= max_emp_exp)
    return df.loc[mask].reset_index(drop=True)


@dataclass(frozen=True)
class Splits:
    train: pd.DataFrame
    val: pd.DataFrame
    test: pd.DataFrame


def split(df: pd.DataFrame, random_state: int = RANDOM_STATE) -> Splits:
    """70 / 15 / 15 split stratified on the target. Frames keep every column."""
    train, rest = train_test_split(
        df, test_size=0.30, stratify=df[TARGET], random_state=random_state
    )
    val, test = train_test_split(
        rest, test_size=0.50, stratify=rest[TARGET], random_state=random_state
    )
    return Splits(
        train.reset_index(drop=True), val.reset_index(drop=True), test.reset_index(drop=True)
    )


def xy(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    return df[FEATURES], df[TARGET]
