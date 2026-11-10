"""Metrics. Accuracy is never reported alone: always pair it with the no-default subgroup."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)

from loan_ml.data import DEFAULT_FLAG, TARGET


def best_f1_threshold(y_true, proba) -> float:
    """Probability threshold that maximizes F1 for the positive (approved) class."""
    precision, recall, thresholds = precision_recall_curve(y_true, proba)
    denom = precision[:-1] + recall[:-1]
    f1 = np.divide(
        2 * precision[:-1] * recall[:-1], denom, out=np.zeros_like(denom), where=denom > 0
    )
    return float(thresholds[int(np.argmax(f1))])


def compute_metrics(y_true, proba, threshold: float) -> dict:
    y_true = np.asarray(y_true)
    proba = np.asarray(proba)
    pred = (proba >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, pred, labels=[0, 1]).ravel()
    return {
        "n": int(len(y_true)),
        "positive_rate": float(y_true.mean()),
        "roc_auc": float(roc_auc_score(y_true, proba)),
        "pr_auc": float(average_precision_score(y_true, proba)),
        "f1": float(f1_score(y_true, pred, zero_division=0)),
        "precision": float(precision_score(y_true, pred, zero_division=0)),
        "recall": float(recall_score(y_true, pred, zero_division=0)),
        "brier": float(brier_score_loss(y_true, proba)),
        "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)},
    }


def evaluate(df: pd.DataFrame, proba, threshold: float) -> dict:
    """Metrics on the full frame and on the `previous_loan_defaults_on_file = No` subgroup."""
    proba = np.asarray(proba)
    no_default = (df[DEFAULT_FLAG] == "No").to_numpy()
    return {
        "overall": compute_metrics(df[TARGET], proba, threshold),
        "no_default": compute_metrics(df.loc[no_default, TARGET], proba[no_default], threshold),
    }


def metrics_row(name: str, result: dict) -> dict:
    """Flatten an `evaluate` result into one comparison-table row."""
    row = {"model": name}
    for scope in ("overall", "no_default"):
        for key in ("roc_auc", "pr_auc", "f1", "precision", "recall", "brier"):
            row[f"{scope}_{key}"] = result[scope][key]
    return row
