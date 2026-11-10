"""Application settings, read from environment variables (see .env.example)."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

from app.services.model_store import DEFAULT_MODEL_VERSION


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_version: str = "0.2.0"
    model_version: str = DEFAULT_MODEL_VERSION
    # Comma-separated list of allowed frontend origins. No wildcard in production.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]
    log_level: str = "INFO"

    # Server-side Postgres connection string. Never exposed to the frontend.
    database_url: str | None = None
    # Supabase project URL, e.g. https://<project-ref>.supabase.co (public, not a secret).
    supabase_url: str | None = None
    jwt_audience: str = "authenticated"

    prediction_rate_limit: str = "20/minute"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url", "supabase_url", mode="before")
    @classmethod
    def blank_is_none(cls, value: object) -> object:
        return value or None

    @property
    def sqlalchemy_url(self) -> str | None:
        """Supabase hands out postgresql:// URLs; SQLAlchemy needs the psycopg (v3) driver."""
        if not self.database_url:
            return None
        url = self.database_url
        for prefix in ("postgresql://", "postgres://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url[len(prefix) :]
        return url

    @property
    def jwt_issuer(self) -> str | None:
        return f"{self.supabase_url.rstrip('/')}/auth/v1" if self.supabase_url else None

    @property
    def jwks_url(self) -> str | None:
        return f"{self.jwt_issuer}/.well-known/jwks.json" if self.jwt_issuer else None


@lru_cache
def get_settings() -> Settings:
    return Settings()
