"""Loading the model package (model.joblib + metadata.json)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from importlib.metadata import version
from pathlib import Path
from typing import Any

import joblib
from sklearn.pipeline import Pipeline

ARTIFACTS_ROOT = Path(__file__).resolve().parents[1] / "ml_artifacts"
DEFAULT_MODEL_VERSION = "1.0.0"

# joblib files are only safe to load with the library versions that wrote them.
PINNED_LIBRARIES = ("scikit-learn", "xgboost")


class ModelLoadError(RuntimeError):
    pass


@dataclass(frozen=True)
class ModelBundle:
    pipeline: Pipeline
    metadata: dict[str, Any]

    @property
    def version(self) -> str:
        return self.metadata["model_version"]

    @property
    def threshold(self) -> float:
        return float(self.metadata["threshold"])

    @property
    def features(self) -> list[str]:
        return self.metadata["features"]["model_inputs"]


def load_metadata(
    model_version: str = DEFAULT_MODEL_VERSION, artifacts_root: Path = ARTIFACTS_ROOT
) -> dict[str, Any]:
    """Read and sanity-check metadata.json without loading the model itself."""
    metadata_path = artifacts_root / f"v{model_version}" / "metadata.json"
    if not metadata_path.is_file():
        raise ModelLoadError(f"Model package not found in {metadata_path.parent}")

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("model_version") != model_version:
        raise ModelLoadError(
            f"metadata.json declares version {metadata.get('model_version')!r}, "
            f"expected {model_version!r}"
        )
    return metadata


def load_model(
    model_version: str = DEFAULT_MODEL_VERSION, artifacts_root: Path = ARTIFACTS_ROOT
) -> ModelBundle:
    metadata = load_metadata(model_version, artifacts_root)
    model_path = artifacts_root / f"v{model_version}" / "model.joblib"
    if not model_path.is_file():
        raise ModelLoadError(f"Model package not found in {model_path.parent}")

    for library in PINNED_LIBRARIES:
        trained_with, installed = metadata["libraries"][library], version(library)
        if trained_with != installed:
            raise ModelLoadError(
                f"{library} {installed} is installed but the model was trained with {trained_with}"
            )

    return ModelBundle(pipeline=joblib.load(model_path), metadata=metadata)
