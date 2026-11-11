from __future__ import annotations

from fastapi import APIRouter, Request, Response

from app.core.config import get_settings
from app.schemas.model import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Servis ve model durumu")
def health(request: Request, response: Response) -> HealthResponse:
    bundle = getattr(request.app.state, "bundle", None)
    if bundle is None:
        response.status_code = 503
    return HealthResponse(
        status="ok" if bundle else "degraded",
        model_loaded=bundle is not None,
        model_version=bundle.version if bundle else None,
        app_version=get_settings().app_version,
    )
