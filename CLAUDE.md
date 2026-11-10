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
# ml (Faz 1-2)
# cd ml; uv sync; uv run python src/train.py

# backend (Faz 3+)
# cd backend; uv run ruff check .; uv run ruff format --check .; uv run pytest

# frontend (Faz 5+)
# cd frontend; npm run lint; npx tsc --noEmit; npm run build
```
