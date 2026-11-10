# CLAUDE.md

Kredi ön değerlendirme ürünü (monorepo: `ml/`, `backend/`, `frontend/`). Tek referans belge: [PROJE_PLANI.md](PROJE_PLANI.md).

## Her oturumda

1. `PROJE_PLANI.md` ve bu dosyayı oku.
2. Hangi fazda olunduğunu `CHANGELOG.md` ve `git log` üzerinden belirle.
3. Fazları sırayla yürüt; kabul ölçütleri sağlanmadan ve Semih onaylamadan sonraki faza geçme.

## Değişmez kurallar

- `person_gender` hiçbir koşulda model girdisi olmaz (yalnızca adalet denetiminde kullanılır).
- Metrik raporlarken accuracy tek başına verilmez; `previous_loan_defaults_on_file = No` alt grubu metrikleri her zaman eklenir.
- Bölüm 1'deki kesinleşmiş kararlar sorulmadan değiştirilmez; planda yanıtı olmayan kararlarda varsayım yapılmaz, sorulur.
- Kod, değişken adları, commit mesajları İngilizce; kullanıcıya görünen tüm metinler Türkçe.
- Veritabanı şeması yalnızca Alembic migration'ı ile değişir; yeni tabloda RLS aynı migration'da açılır.
- Gizli anahtarlar koda/commit'e yazılmaz; `.env.example` güncel tutulur.
- Kütüphaneler kurulum anındaki güncel kararlı sürümle kurulur ve kilit dosyasına sabitlenir. Next.js, Supabase Auth ve shadcn/ui için güncel resmi dokümantasyona bakılır.
- `scikit-learn` ve `xgboost` sürümleri `ml/` ve `backend/` ortamlarında aynı olmalıdır.
- Yeni davranış = yeni test. Commit öncesi lint ve testler çalıştırılır.

## Model paketi

- Canlıya giden model her zaman `ml/src/train.py` çıktısıdır; `model.joblib` elle değiştirilmez.
- Veri, temizlik, özellikler veya hiperparametreler değişirse `MODEL_VERSION` artırılır ve yeni `v<version>/` klasörü üretilir.
- Backend, `metadata.json` içindeki `scikit-learn` / `xgboost` sürümleri kurulu olanla eşleşmezse modeli yüklemez.
- Faktörlerdeki `impact`, o tahmindeki toplam mutlak katkı içindeki paydır (0–1); `contribution` log-odds cinsinden işaretli katkıdır.

## Backend

- Girdi sınırları ve izinli değerler `metadata.json`'dan okunur (`app/schemas/prediction.py`); koda sabit yazılmaz.
- Tüm hatalar `{"error": {"code", "message", "details"}}` biçimindedir; mesajlar Türkçedir (`app/core/errors.py`).
- Loglara kullanıcı girdisi (gelir, skor vb.) yazılmaz.
- İstek şeması bilinmeyen alanları reddeder (`extra="forbid"`); `person_gender` gönderilirse 422 döner.
- Kullanıcı kimliği yalnızca doğrulanmış token'ın `sub` alanından gelir (`app/api/deps.py`).
- Backend veritabanına RLS'i aşan sunucu rolüyle bağlanır: `Prediction` üzerindeki **her sorgu `user_id` ile filtrelenmelidir** (`app/services/history.py`). Başkasının kaydı için 404 döner.
- Testler SQLite ve yerel üretilmiş ES256 anahtarıyla çalışır; gerçek veritabanına ya da Supabase'e bağlanmaz.
- Migration: `uv run alembic upgrade head` (`backend/.env` içinde `DATABASE_URL` gerekir). Yeni tabloda RLS aynı migration'da açılır.
- Supabase geliştirme projesi: `loan-approval-dev`, ref `ddyrkkorvilbgzcmezkh` (Frankfurt).

## Frontend

- Next.js 16 (App Router), Tailwind v4, shadcn/ui (Radix tabanı, `nova` ön ayarı). Kod yazmadan önce `frontend/AGENTS.md` uyarınca `frontend/node_modules/next/dist/docs/` altındaki ilgili rehbere bak; Next 16'da middleware'in adı `proxy.ts`.
- Tüm arayüz metinleri `frontend/lib/metinler.ts` içindedir; bileşenlere doğrudan Türkçe metin yazılmaz.
- Sayı/tarih biçimi `frontend/lib/bicim.ts` (`tr-TR`); renk ve tipografi belirteçleri `frontend/app/globals.css`.
- Karar hiçbir zaman yalnızca renkle gösterilmez; metin ve ikon eşlik eder.
- Tema `<html>` üzerindeki `dark` sınıfıyla yönetilir (`lib/theme.ts`, `components/theme-toggle.tsx`).

## Git

- Dallar: `main` (korumalı) · `dev` · `feature/<konu>` · `fix/<konu>`. Akış: `feature/*` → PR → `dev` → PR → `main` + etiket.
- Conventional Commits, İngilizce: `feat(backend): add prediction endpoint`.
- Küçük, tek amaçlı commit'ler.

## Ortam

- Windows + PowerShell (`&&` yok; `;` veya `if ($?) { ... }` kullan). Satır sonları LF (`.gitattributes`).
- Python: `uv` (`pyproject.toml` + `uv.lock`). Frontend: `npm`.
- Veri: `ml/data/raw/loan_data.csv` — Apache 2.0 lisanslı, repoda tutulur; ham dosya değiştirilmez.

## Komutlar

Henüz kurulmamış bölümler ilgili fazda eklenecek.

```powershell
# ml
cd ml; uv sync
uv run ruff check src; uv run ruff format --check src
uv run jupyter nbconvert --to notebook --execute --inplace notebooks/01_eda.ipynb
uv run python src/train.py   # writes backend/app/ml_artifacts/v<version>/ (model.joblib + metadata.json)

# backend
cd backend; uv sync
uv run ruff check .; uv run ruff format --check .; uv run pytest
uv run uvicorn app.main:app --reload          # http://127.0.0.1:8000/docs
docker build -t loan-approval-backend .; docker run --rm -p 8000:8000 loan-approval-backend

# frontend
cd frontend; npm install
npm run dev                                   # http://localhost:3000
npm run lint; npx tsc --noEmit; npm run build
```
