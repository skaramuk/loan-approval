# Changelog

Bu projedeki önemli değişiklikler bu dosyada tutulur. Biçim [Keep a Changelog](https://keepachangelog.com/) esaslıdır; sürümler [SemVer](https://semver.org/) izler.

## [Unreleased]

### Added
- Faz 0: repo iskeleti, klasör yapısı, `README.md`, `CLAUDE.md`, CI iskeleti.
- Faz 1: `ml/` projesi (uv), ortak veri/pipeline/metrik modülü (`loan_ml`), dört analiz notebook'u
  ve `ml/reports/phase1/` altında seçilen hiperparametreler ile test raporu.
  Nihai model: XGBoost, kalibrasyonsuz, eşik 0,461 — test ROC-AUC 0,978 (genel),
  0,938 (`previous_loan_defaults_on_file = No` alt grubu).
- Faz 2: `ml/src/train.py` (tek komutla model paketi), model v1.0.0 paketi
  (`backend/app/ml_artifacts/v1.0.0/`), backend projesi (uv) ile model yükleme, tahmin ve
  açıklama servisleri ve birim testleri.
