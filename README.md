# Loan Approval

Kişisel ve kredi bilgilerine göre bir kredi başvurusunun onaylanma olasılığını tahmin eden kredi ön değerlendirme aracı.

> **Uyarı:** Bu araç bir ön değerlendirme sunar. Gerçek bir kredi başvurusu ya da banka kararı değildir. Model açık bir veri setiyle eğitilmiştir ve Türkiye'deki bankaların kriterlerini yansıtmaz.

**Canlı:** [loan-approval-navy.vercel.app](https://loan-approval-navy.vercel.app) · API: [loan-approval-api-m2wc.onrender.com](https://loan-approval-api-m2wc.onrender.com/health)

**Durum:** v1.0.0 canlıda (Faz 6 tamamlandı); sırada cila ve portföy (Faz 7) — ayrıntılı plan için [PROJE_PLANI.md](PROJE_PLANI.md).

## Yapı

| Klasör | İçerik |
|---|---|
| `ml/` | Veri analizi, notebook'lar, eğitim scripti |
| `backend/` | FastAPI servisi, model paketi, Alembic migration'ları |
| `frontend/` | Next.js arayüzü |
| `docs/` | Model kartı, mimari notlar, ekran görüntüleri |

## Teknolojiler

XGBoost · scikit-learn · FastAPI · PostgreSQL (Supabase) · Supabase Auth · Next.js · Tailwind CSS · shadcn/ui

## Veri seti

`ml/data/raw/loan_data.csv` — 45.000 satır, 14 kolon.

- **Kaynak:** [Loan Approval Classification Dataset](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data) — Ta-wei Lo, Kaggle
- **Lisans:** [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- **SHA-256 (ilk 16 karakter):** `67cca604cd71cbd6`

Dosya değiştirilmeden repoda tutulur.

## Geliştirme

Gereksinim: [uv](https://docs.astral.sh/uv/) (Python 3.13'ü kendisi kurar).

```powershell
# Modeli yeniden eğit ve paketle
cd ml
uv sync
uv run python src/train.py

# Backend: testler ve yerel sunucu
cd ../backend
uv sync
uv run pytest
uv run uvicorn app.main:app --reload
```

API belgeleri sunucu çalışırken `http://127.0.0.1:8000/docs` adresindedir. Ortam değişkenleri için `backend/.env.example` dosyasına bakın.

Arayüz için ayrı bir terminalde (backend çalışırken):

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local   # değerleri Supabase projenize göre doldurun
npm run dev                          # http://localhost:3000
```

Analiz notebook'ları `ml/notebooks/` altındadır.
