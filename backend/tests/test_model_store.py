import json
import shutil

import pytest

from app.services.model_store import ARTIFACTS_ROOT, ModelLoadError, load_model


def test_loads_default_model(bundle):
    assert bundle.version == "1.0.0"
    assert 0 < bundle.threshold < 1
    assert len(bundle.features) == 12


def test_gender_is_never_a_model_input(bundle):
    assert "person_gender" not in bundle.features
    assert not any("gender" in name for name in bundle.metadata["features"]["encoded"])
    assert bundle.metadata["features"]["excluded"] == ["person_gender"]


def test_metadata_reports_subgroup_metrics(bundle):
    test_metrics = bundle.metadata["metrics"]["test"]
    assert {"overall", "no_default"} <= test_metrics.keys()
    # The no-default subgroup is the honest measure and must be harder than the overall figure.
    assert test_metrics["no_default"]["roc_auc"] < test_metrics["overall"]["roc_auc"]
    assert test_metrics["no_default"]["roc_auc"] > 0.9


def test_missing_package_raises(tmp_path):
    with pytest.raises(ModelLoadError, match="not found"):
        load_model("9.9.9", artifacts_root=tmp_path)


def _copy_package(tmp_path, mutate):
    target = tmp_path / "v1.0.0"
    shutil.copytree(ARTIFACTS_ROOT / "v1.0.0", target)
    metadata_path = target / "metadata.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    mutate(metadata)
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")


def test_library_version_mismatch_raises(tmp_path):
    _copy_package(tmp_path, lambda m: m["libraries"].update({"xgboost": "0.0.1"}))
    with pytest.raises(ModelLoadError, match="xgboost"):
        load_model("1.0.0", artifacts_root=tmp_path)


def test_version_mismatch_raises(tmp_path):
    _copy_package(tmp_path, lambda m: m.update({"model_version": "2.0.0"}))
    with pytest.raises(ModelLoadError, match="declares version"):
        load_model("1.0.0", artifacts_root=tmp_path)
