"""Response schemas for /health and /api/v1/model."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_version: str | None
    app_version: str


class MetricSet(BaseModel):
    n: int
    positive_rate: float
    roc_auc: float
    pr_auc: float
    f1: float
    precision: float
    recall: float
    brier: float


class ModelMetrics(BaseModel):
    """Test-set metrics. `overall` is inflated by the trivially rejected previous-default
    records, so it is always published together with the `no_default` subgroup."""

    overall: MetricSet
    no_default: MetricSet


class NumericField(BaseModel):
    min: float
    max: float
    integer: bool
    typical_min: float
    typical_max: float


class FieldSchema(BaseModel):
    numeric: dict[str, NumericField]
    categorical: dict[str, list[str]]
    boolean: list[str]
    min_age_experience_gap: int


class ModelInfoResponse(BaseModel):
    model_version: str
    algorithm: str
    trained_at: datetime
    threshold: float
    metrics: ModelMetrics
    fields: FieldSchema
    training_rows: int
    excluded_features: list[str]
