"""Storing and reading predictions.

The backend connects with a server-side role that bypasses Row Level Security, so every query
here is scoped by user_id explicitly. Never add a query on Prediction without that filter.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import asdict
from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from app.db.models import ModelVersion, Prediction
from app.services.model_store import ModelBundle
from app.services.prediction import INPUT_FIELDS
from app.services.prediction import Prediction as PredictionResult


def register_model_version(session: Session, bundle: ModelBundle) -> None:
    """Record the loaded model package and mark it as the only active version."""
    meta = bundle.metadata
    row = session.get(ModelVersion, bundle.version)
    if row is None:
        row = ModelVersion(version=bundle.version)
        session.add(row)
    row.algorithm = meta["algorithm"]
    row.trained_at = datetime.fromisoformat(meta["trained_at"])
    row.metrics = meta["metrics"]["test"]
    row.threshold = bundle.threshold
    row.data_sha256 = meta["data"]["sha256"]
    row.is_active = True
    session.flush()
    session.execute(
        update(ModelVersion).where(ModelVersion.version != bundle.version).values(is_active=False)
    )
    session.commit()


def save_prediction(
    session: Session, user_id: UUID, application: Mapping[str, Any], result: PredictionResult
) -> Prediction:
    row = Prediction(
        user_id=user_id,
        model_version=result.model_version,
        **{name: application[name] for name in INPUT_FIELDS},
        loan_percent_income=result.loan_percent_income,
        probability=result.probability,
        threshold=result.threshold,
        approved=result.approved,
        factors=[asdict(factor) for factor in result.factors],
        low_confidence_fields=result.low_confidence_fields,
    )
    session.add(row)
    session.commit()
    return row


def list_predictions(
    session: Session, user_id: UUID, page: int, page_size: int, approved: bool | None = None
) -> tuple[list[Prediction], int]:
    conditions = [Prediction.user_id == user_id]
    if approved is not None:
        conditions.append(Prediction.approved == approved)
    total = session.scalar(select(func.count()).select_from(Prediction).where(*conditions)) or 0
    rows = session.scalars(
        select(Prediction)
        .where(*conditions)
        .order_by(Prediction.created_at.desc(), Prediction.id.desc())
        .limit(page_size)
        .offset((page - 1) * page_size)
    ).all()
    return list(rows), total


def get_prediction(session: Session, user_id: UUID, prediction_id: UUID) -> Prediction | None:
    return session.scalars(
        select(Prediction).where(Prediction.id == prediction_id, Prediction.user_id == user_id)
    ).one_or_none()


def delete_prediction(session: Session, user_id: UUID, prediction_id: UUID) -> bool:
    result = session.execute(
        delete(Prediction).where(Prediction.id == prediction_id, Prediction.user_id == user_id)
    )
    session.commit()
    return result.rowcount > 0


def delete_all_predictions(session: Session, user_id: UUID) -> int:
    result = session.execute(delete(Prediction).where(Prediction.user_id == user_id))
    session.commit()
    return result.rowcount
