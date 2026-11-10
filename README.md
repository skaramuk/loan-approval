# Loan Approval

Kişisel ve kredi bilgilerine göre bir kredi başvurusunun onaylanma olasılığını tahmin eden kredi ön değerlendirme aracı.

> **Uyarı:** Bu araç bir ön değerlendirme sunar. Gerçek bir kredi başvurusu ya da banka kararı değildir. Model açık bir veri setiyle eğitilmiştir ve Türkiye'deki bankaların kriterlerini yansıtmaz.

**Durum:** Faz 0 (kurulum) — ayrıntılı plan için [PROJE_PLANI.md](PROJE_PLANI.md).

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

`loan_data.csv` — 45.000 satır, 14 kolon. Kaynak: Kaggle (_bağlantı ve lisans bilgisi eklenecek_).

Lisans netleşene kadar dosya repoda tutulmaz. Dosyayı indirip şuraya yerleştirin:

```
ml/data/raw/loan_data.csv
```

Beklenen SHA-256 (ilk 16 karakter): `67cca604cd71cbd6`

## Geliştirme

Kurulum ve çalıştırma adımları ilgili fazlar tamamlandıkça eklenecektir.
