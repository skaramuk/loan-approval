"""FastAPI application entry point.

Run locally (from backend/):
    uv run uvicorn app.main:app --reload
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import health, model, predictions
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.services.model_store import load_model

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    logging.basicConfig(
        level=settings.log_level, format="%(asctime)s %(levelname)s %(name)s %(message)s"
    )
    # Loaded once; a broken model package must stop the service from starting.
    app.state.bundle = load_model(settings.model_version)
    logger.info("Model v%s loaded", app.state.bundle.version)
    yield
    app.state.bundle = None


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Loan Approval API",
        description=(
            "Kredi ön değerlendirme servisi. Sonuçlar açık bir veri setiyle eğitilmiş bir modelin "
            "tahminidir; gerçek bir kredi başvurusu ya da banka kararı değildir."
        ),
        version=settings.app_version,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )
    register_error_handlers(app)

    v1 = APIRouter(prefix="/api/v1")
    v1.include_router(model.router)
    v1.include_router(predictions.router)
    app.include_router(health.router)
    app.include_router(v1)
    return app


app = create_app()
