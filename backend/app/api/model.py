from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import BundleDep
from app.schemas.model import ModelInfoResponse

router = APIRouter(tags=["model"])

BOOLEAN_FIELDS = ["previous_loan_defaults_on_file"]


@router.get(
    "/model",
    response_model=ModelInfoResponse,
    summary="Aktif model: versiyon, metrikler ve alan şeması",
)
def model_info(bundle: BundleDep) -> dict:
    meta = bundle.metadata
    features = meta["features"]
    percentiles = features["training_percentiles"]
    return {
        "model_version": meta["model_version"],
        "algorithm": meta["algorithm"],
        "trained_at": meta["trained_at"],
        "threshold": round(bundle.threshold, 4),
        "metrics": meta["metrics"]["test"],
        "fields": {
            "numeric": {
                name: {
                    **bounds,
                    "typical_min": percentiles[name]["p1"],
                    "typical_max": percentiles[name]["p99"],
                }
                for name, bounds in features["input_ranges"].items()
            },
            "categorical": features["allowed_values"],
            "boolean": BOOLEAN_FIELDS,
            "min_age_experience_gap": features["min_age_experience_gap"],
        },
        "training_rows": meta["data"]["rows"]["train"],
        "excluded_features": features["excluded"],
    }
