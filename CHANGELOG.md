# Changelog

Bu projedeki önemli değişiklikler bu dosyada tutulur. Biçim [Keep a Changelog](https://keepachangelog.com/) esaslıdır; sürümler [SemVer](https://semver.org/) izler.

## [Unreleased]

### Changed
- Depo sadeleştirildi: geliştirme sürecinden kalan çalışma notları kaldırıldı, teknik kararlar `docs/tasarim-kararlari.md` altında toplandı, rapor klasörü model paketiyle uyumlu olarak `ml/reports/v1.0.0/` adını aldı.
- Model kartı sayfasında metrikler üç ondalıkla gösteriliyor.

## [1.0.0] - 2026-11-11

İlk canlı sürüm. Arayüz: <https://loan-approval-navy.vercel.app> · API: <https://loan-approval-api-m2wc.onrender.com> · Model v1.0.0.

### Added
- **Model:** veri analizi ve dört notebook (`ml/notebooks/`); XGBoost, Logistic Regression, Random Forest ve LightGBM ile karşılaştırma; karar eşiği 0,461; test ROC-AUC 0,978 (genel) ve 0,938 (`previous_loan_defaults_on_file = No` alt grubu); kalibrasyon, SHAP ve cinsiyete göre adalet denetimi. `ml/src/train.py` tek komutla model paketini (`backend/app/ml_artifacts/v1.0.0/`) yeniden üretir.
- **API:** FastAPI servisi — `GET /health`, `GET /api/v1/model`, `POST /api/v1/predictions` ve geçmiş uç noktaları (`GET /predictions`, `GET|DELETE /predictions/{id}`, `DELETE /me/predictions`). Girdi sınırları model paketindeki `metadata.json`'dan okunur; Türkçe ve tek biçimli hata yanıtları, CORS, kullanıcı başına dakikada 20 tahmin sınırı ve Docker imajı.
- **Veritabanı ve kimlik:** Supabase Auth token doğrulaması (JWKS, ES256), `predictions` ve `model_versions` tabloları (Alembic), tüm tablolarda Row Level Security.
- **Arayüz:** Next.js uygulaması — açık/koyu tema, giriş, kayıt ve şifre sıfırlama, üç adımlı değerlendirme formu ve sonuç ekranı, geçmiş (filtre, sayfalama, detay, silme), özet ve hesap sayfaları, tanıtım sayfası, model kartı ve taslak yasal metinler.
- **Canlıya alma:** Render Blueprint (`render.yaml`), Vercel ayarları, güvenlik başlıkları, Türkçe e-posta şablonları ve rehber (`docs/canliya-alma.md`).
- **Belgeler:** README, `docs/mimari.md`, `docs/model-karti.md`, `docs/tasarim-kararlari.md`, ekran görüntüleri ve demo GIF'i.
- **CI:** GitHub Actions ile backend (`ruff`, `pytest`, Docker imajı duman testi) ve frontend (`eslint`, tip kontrolü, derleme) kontrolleri.
