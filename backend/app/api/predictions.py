from __future__ import annotations

import logging
from dataclasses import asdict
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter

from app.api.deps import BundleDep
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction import predict

logger = logging.getLogger("app.predictions")
router = APIRouter(tags=["predictions"])


@router.post(
    "/predictions",
    response_model=PredictionResponse,
    status_code=201,
    summary="Kredi ön değerlendirmesi yapar",
    description=(
        "Onay tahmini, olasılık ve kararı en çok etkileyen faktörleri döner. "
        "Bu bir ön değerlendirmedir; gerçek bir kredi kararı değildir."
    ),
)
def create_prediction(payload: PredictionRequest, bundle: BundleDep) -> dict:
    # Not persisted yet: storage and authentication arrive with the database phase.
    result = predict(bundle, payload.model_dump())
    # Never log the inputs: they are personal financial data.
    logger.info("prediction model=%s band=%s", result.model_version, result.band)
    return {"id": uuid4(), "created_at": datetime.now(UTC), **asdict(result)}
