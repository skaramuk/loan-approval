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
- Faz 3: FastAPI uygulaması — `GET /health`, `GET /api/v1/model`, `POST /api/v1/predictions`
  (henüz kayıtsız ve girişsiz), metadata'dan okunan doğrulama kuralları, Türkçe ve tek biçimli
  hata yanıtları, CORS, Dockerfile ve CI'da Docker imajı duman testi.
- Faz 4: Supabase Auth token doğrulaması (JWKS, ES256), `predictions` ve `model_versions`
  tabloları (Alembic), tüm tablolarda Row Level Security, tahmin kaydı ve geçmiş uç noktaları
  (`GET /predictions`, `GET|DELETE /predictions/{id}`, `DELETE /me/predictions`), kullanıcı
  başına dakikada 20 tahmin sınırı.
- Faz 5: Next.js arayüzü — tasarım sistemi (açık/koyu tema), Supabase Auth ile giriş, kayıt ve
  şifre sıfırlama, giriş koruması (`proxy.ts`), üç adımlı değerlendirme formu ve sonuç ekranı,
  geçmiş (filtre, sayfalama, detay, silme), özet ve hesap sayfaları, tanıtım sayfası, model
  kartı ve taslak yasal metinler.
