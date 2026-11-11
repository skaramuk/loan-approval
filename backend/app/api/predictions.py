import logging
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Query, Request, Response

from app.api.deps import BundleDep, CurrentUserId, SessionDep
from app.core.errors import HTTP_MESSAGES, AppError
from app.core.rate_limit import limiter, prediction_limit
from app.db.models import Prediction
from app.schemas.prediction import (
    DeletedResponse,
    PredictionDetail,
    PredictionListResponse,
    PredictionRequest,
    PredictionResponse,
)
from app.services import history
from app.services.prediction import INPUT_FIELDS, band_for, predict

logger = logging.getLogger("app.predictions")
router = APIRouter(tags=["predictions"])

MAX_PAGE_SIZE = 100


def _not_found() -> AppError:
    # Also returned for records that belong to someone else: their existence is not revealed.
    code, message = HTTP_MESSAGES[404]
    return AppError(404, code, message)


def _result_fields(row: Prediction) -> dict[str, Any]:
    return {
        "id": row.id,
        "created_at": row.created_at,
        "model_version": row.model_version,
        "approved": row.approved,
        "probability": row.probability,
        "threshold": row.threshold,
        "band": band_for(row.probability, row.threshold),
        "factors": row.factors,
        "low_confidence_fields": row.low_confidence_fields,
    }


@router.post(
    "/predictions",
    response_model=PredictionResponse,
    status_code=201,
    summary="Kredi ön değerlendirmesi yapar ve kaydeder",
    description=(
        "Onay tahmini, olasılık ve kararı en çok etkileyen faktörleri döner. "
        "Bu bir ön değerlendirmedir; gerçek bir kredi kararı değildir."
    ),
)
@limiter.limit(prediction_limit)
def create_prediction(
    request: Request,
    payload: PredictionRequest,
    user_id: CurrentUserId,
    bundle: BundleDep,
    session: SessionDep,
) -> dict:
    application = payload.model_dump()
    result = predict(bundle, application)
    row = history.save_prediction(session, user_id, application, result)
    # Never log the inputs: they are personal financial data.
    logger.info("prediction model=%s band=%s", result.model_version, result.band)
    return _result_fields(row)


@router.get(
    "/predictions",
    response_model=PredictionListResponse,
    summary="Kullanıcının tahmin geçmişi (yeniden eskiye)",
)
def list_predictions(
    user_id: CurrentUserId,
    session: SessionDep,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=MAX_PAGE_SIZE)] = 10,
    approved: Annotated[bool | None, Query(description="Sonuca göre filtre")] = None,
) -> dict:
    rows, total = history.list_predictions(session, user_id, page, page_size, approved)
    items = [
        {
            "id": row.id,
            "created_at": row.created_at,
            "loan_amnt": row.loan_amnt,
            "loan_intent": row.loan_intent,
            "probability": row.probability,
            "threshold": row.threshold,
            "approved": row.approved,
            "band": band_for(row.probability, row.threshold),
        }
        for row in rows
    ]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get(
    "/predictions/{prediction_id}", response_model=PredictionDetail, summary="Tek tahmin detayı"
)
def get_prediction(prediction_id: UUID, user_id: CurrentUserId, session: SessionDep) -> dict:
    row = history.get_prediction(session, user_id, prediction_id)
    if row is None:
        raise _not_found()
    inputs = {name: getattr(row, name) for name in (*INPUT_FIELDS, "loan_percent_income")}
    return {**_result_fields(row), "input": inputs}


@router.delete("/predictions/{prediction_id}", status_code=204, summary="Tahmini siler")
def delete_prediction(prediction_id: UUID, user_id: CurrentUserId, session: SessionDep) -> Response:
    if not history.delete_prediction(session, user_id, prediction_id):
        raise _not_found()
    return Response(status_code=204)


@router.delete(
    "/me/predictions",
    response_model=DeletedResponse,
    summary="Kullanıcının tüm tahminlerini siler",
)
def delete_all_predictions(user_id: CurrentUserId, session: SessionDep) -> dict:
    return {"deleted": history.delete_all_predictions(session, user_id)}
