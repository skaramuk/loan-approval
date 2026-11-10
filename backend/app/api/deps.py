"""Shared FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request

from app.core.errors import AppError
from app.services.model_store import ModelBundle


def get_bundle(request: Request) -> ModelBundle:
    bundle = getattr(request.app.state, "bundle", None)
    if bundle is None:
        raise AppError(
            503,
            "model_unavailable",
            "Model şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
        )
    return bundle


BundleDep = Annotated[ModelBundle, Depends(get_bundle)]
