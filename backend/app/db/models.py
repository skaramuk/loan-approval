"""Application tables (schema `public`).

User accounts live in Supabase's `auth.users`, which this application never touches. The
foreign key from predictions.user_id to auth.users and all Row Level Security policies are
created in the Alembic migration, because they only exist on Postgres/Supabase.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, Numeric, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func

JsonType = JSON().with_variant(JSONB(), "postgresql")


def _utcnow() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class ModelVersion(Base):
    __tablename__ = "model_versions"

    version: Mapped[str] = mapped_column(Text, primary_key=True)
    algorithm: Mapped[str] = mapped_column(Text)
    trained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    metrics: Mapped[dict[str, Any]] = mapped_column(JsonType)
    threshold: Mapped[float] = mapped_column(Numeric(5, 4, asdecimal=False))
    data_sha256: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")


class Prediction(Base):
    __tablename__ = "predictions"
    __table_args__ = (Index("ix_predictions_user_id_created_at", "user_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, server_default=func.now()
    )
    model_version: Mapped[str] = mapped_column(Text, ForeignKey("model_versions.version"))

    # The eleven inputs, exactly as submitted.
    person_age: Mapped[int] = mapped_column(Integer)
    person_education: Mapped[str] = mapped_column(Text)
    person_income: Mapped[float] = mapped_column(Numeric(12, 2, asdecimal=False))
    person_emp_exp: Mapped[int] = mapped_column(Integer)
    person_home_ownership: Mapped[str] = mapped_column(Text)
    loan_amnt: Mapped[float] = mapped_column(Numeric(12, 2, asdecimal=False))
    loan_intent: Mapped[str] = mapped_column(Text)
    loan_int_rate: Mapped[float] = mapped_column(Numeric(5, 2, asdecimal=False))
    cb_person_cred_hist_length: Mapped[int] = mapped_column(Integer)
    credit_score: Mapped[int] = mapped_column(Integer)
    previous_loan_defaults_on_file: Mapped[bool] = mapped_column(Boolean)

    # Derived and result columns.
    loan_percent_income: Mapped[float] = mapped_column(Numeric(4, 2, asdecimal=False))
    probability: Mapped[float] = mapped_column(Numeric(5, 4, asdecimal=False))
    threshold: Mapped[float] = mapped_column(Numeric(5, 4, asdecimal=False))
    approved: Mapped[bool] = mapped_column(Boolean)
    factors: Mapped[list[dict[str, Any]]] = mapped_column(JsonType)
    low_confidence_fields: Mapped[list[str]] = mapped_column(JsonType, default=list)
