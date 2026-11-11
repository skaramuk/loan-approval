"""Database engine and per-request sessions."""

from __future__ import annotations

from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.core.errors import AppError


@lru_cache
def get_engine() -> Engine:
    url = get_settings().sqlalchemy_url
    if not url:
        raise AppError(
            503,
            "database_not_configured",
            "Veritabanı yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
        )
    # Sized for Supabase's session-mode pooler: a small, long-lived pool per container.
    return create_engine(url, pool_size=5, max_overflow=5, pool_pre_ping=True, pool_recycle=1800)


@lru_cache
def _session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False)


def get_session() -> Iterator[Session]:
    with _session_factory()() as session:
        yield session
