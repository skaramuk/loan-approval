# Loan Approval — Proje Planı

> Bu dosya projenin tek referans belgesidir. Claude Code ile çalışırken her oturumun başında bu dosya okunmalı ve işler **faz sırasıyla** yürütülmelidir.
> Son güncelleme: 10 Kasım 2026

---

## 1. Proje özeti

**Loan Approval**, kullanıcının girdiği kişisel ve kredi bilgilerine göre kredi başvurusunun onaylanma olasılığını tahmin eden, pazarlanabilir kalitede bir web ürünüdür.

- Kullanıcı hesap açar, giriş yapar, formu doldurur.
- Sistem **onay / ret tahmini**, **onay olasılığı** ve **kararı en çok etkileyen faktörleri** gösterir.
- Her tahmin kullanıcının hesabına kaydedilir; kullanıcı geçmiş tahminlerini görür ve silebilir.
- Proje kendi alan adıyla canlıya alınacaktır.

**Konumlandırma:** "Kredi ön değerlendirme aracı". Ürün gerçek bir banka kararı vermez; açık bir veri seti üzerinde eğitilmiş bir modelin tahminini sunar. Bu uyarı arayüzde görünür şekilde yer alır (bkz. Bölüm 11).

### Kesinleşen kararlar

| Konu | Karar |
|---|---|
| Ana model | **XGBoost** (CNN zorunlu değil; tablo verisinde daha uygun) |
| Karşılaştırma modelleri | Logistic Regression (baseline), LightGBM veya Random Forest |
| Kullanıcı girişi | **Var** (e-posta + şifre) |
| Tahmin geçmişi | **Var** (kullanıcıya özel) |
| Arayüz dili | **Türkçe** |
| Backend | Python — FastAPI |
| Frontend | Next.js (TypeScript) + Tailwind CSS + shadcn/ui |
| Veritabanı | PostgreSQL (Supabase) |
| Kimlik doğrulama | Supabase Auth |
| Versiyon kontrolü | Git + GitHub, tek repo (monorepo) |
| Deploy | Frontend: Vercel · Backend: Docker container servisi · DB: Supabase |

---

## 2. Veri seti

**Dosya:** `ml/data/raw/loan_data.csv`
**Kaynak:** Kaggle — [Loan Approval Classification Dataset](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data) (Ta-wei Lo), lisans **Apache 2.0**; dosya repoda tutulur.
**Boyut:** 45.000 satır, 14 kolon (13 özellik + hedef). Eksik değer yok, tekrar eden satır yok.
**SHA-256 (ilk 16 karakter):** `67cca604cd71cbd6` — veri değişirse model versiyonu da değişmelidir.

### Kolonlar

| Kolon | Tip | Değerler / aralık | Not |
|---|---|---|---|
| `person_age` | sayısal | 20 – 144 (medyan 26, p99 = 48) | 7 kayıt > 100 → hatalı |
| `person_gender` | kategorik | male, female | **Modele girmeyecek** |
| `person_education` | sıralı | High School, Associate, Bachelor, Master, Doctorate | |
| `person_income` | sayısal | 8.000 – 7.200.766 (medyan 67.048, p99 = 271.654) | Yıllık gelir, USD; sağa çarpık |
| `person_emp_exp` | sayısal | 0 – 125 (medyan 4, p99 = 26) | 10 kayıt > 60 → hatalı |
| `person_home_ownership` | kategorik | RENT, MORTGAGE, OWN, OTHER | OTHER yalnızca 117 kayıt |
| `loan_amnt` | sayısal | 500 – 35.000 (medyan 8.000) | USD |
| `loan_intent` | kategorik | EDUCATION, MEDICAL, VENTURE, PERSONAL, DEBTCONSOLIDATION, HOMEIMPROVEMENT | |
| `loan_int_rate` | sayısal | 5,42 – 20,00 (medyan 11,01) | Yıllık faiz, % |
| `loan_percent_income` | sayısal | 0,00 – 0,66 | **Türetilmiş:** `loan_amnt / person_income` (45.000 satırın tamamında doğrulandı) |
| `cb_person_cred_hist_length` | sayısal | 2 – 30 (medyan 4) | Kredi geçmişi, yıl |
| `credit_score` | sayısal | 390 – 850 (medyan 640, p99 = 724) | FICO benzeri ölçek |
| `previous_loan_defaults_on_file` | ikili | Yes, No | Aşağıdaki kritik nota bak |
| `loan_status` | **hedef** | 1 = onay (10.000), 0 = ret (35.000) | %22 / %78 dengesiz |

### Kritik bulgular

1. **Tek kolon verinin yarısını belirliyor.** `previous_loan_defaults_on_file = Yes` olan 22.858 kaydın **tamamı** ret. Onayların hepsi `No` grubunda (22.142 kayıttan 10.000'i). Sonuç: genel accuracy kolayca yüksek çıkar ve yanıltıcıdır. Model performansı **mutlaka `No` alt grubunda ayrıca** raporlanmalıdır.
2. **Sınıf dengesizliği** (%78 ret). Accuracy ana metrik olamaz.
3. **Hatalı kayıtlar:** yaş > 100 (7 kayıt), iş tecrübesi > 60 yıl (10 kayıt). Eğitimden çıkarılacak.
4. **Cinsiyet modele girmeyecek.** Kredi kararında cinsiyet kullanmak etik ve hukuki açıdan sorunludur. Kolon yalnızca test aşamasında adalet denetimi için kullanılacak (bkz. 3.5).
5. **Veri genç profile ağırlıklı** (medyan yaş 26). Yaşlı veya çok yüksek gelirli profillerde model daha az güvenilirdir; arayüz bu durumda uyarı gösterir (bkz. 5.3).
6. **Para birimi USD, kredi skoru 390–850 ölçeğinde.** v1'de değerler bu haliyle alınır ve arayüzde açıkça belirtilir (bkz. Bölüm 12, açık konu 1).
7. **Etiketin yönü sezgiye ters.** Veride faiz oranı ve kredi/gelir oranı arttıkça, gelir azaldıkça "onay" oranı artar; kiracılar ev sahiplerinden daha sık "onaylanır". Model bunu aynen öğrenir. Etiket belgelendiği gibi kullanılır (karar: Bölüm 12 madde 6); bu sınırlama model kartında (`/model`) ve sonuç ekranındaki faktör açıklamalarının yanında açıkça belirtilir.

---

## 3. Makine öğrenmesi

### 3.1 Girdi özellikleri (modelin gördüğü 12 özellik)

Kullanıcıdan **11 alan** alınır; `loan_percent_income` backend'de hesaplanır. `person_gender` kullanılmaz.

### 3.2 Ön işleme

- Temizlik: `person_age > 80` veya `person_emp_exp > 60` olan satırlar çıkarılır (kesin eşikler EDA'da doğrulanıp `metadata.json`'a yazılır).
- `person_education` → `OrdinalEncoder` (High School < Associate < Bachelor < Master < Doctorate).
- `person_home_ownership`, `loan_intent` → `OneHotEncoder(handle_unknown="ignore")`.
- `previous_loan_defaults_on_file` → 0/1.
- Sayısal kolonlar olduğu gibi geçer (ağaç tabanlı modelde ölçekleme gerekmez). Logistic Regression baseline'ı için ayrı pipeline'da `StandardScaler` + gelirde log dönüşümü kullanılır.
- Tüm adımlar **tek bir scikit-learn `Pipeline`** içinde (`ColumnTransformer` + model). Eğitim ve canlı tahmin aynı nesneyi kullanır; böylece eğitim/servis uyumsuzluğu olmaz.

### 3.3 Eğitim

- Bölme: **%70 eğitim / %15 doğrulama / %15 test**, `stratify=loan_status`, `random_state=42`. Test seti yalnızca en sonda bir kez kullanılır.
- Modeller: Logistic Regression (baseline) → XGBoost (ana) → LightGBM veya Random Forest (karşılaştırma).
- Hiperparametre araması: Optuna veya `RandomizedSearchCV`, 5 katlı stratified CV, hedef metrik ROC-AUC.
- Dengesizlik: `scale_pos_weight` ile ve onsuz denenir; karar doğrulama setindeki PR-AUC ve kalibrasyona göre verilir.
- Karar eşiği: 0,5 varsayılmaz; doğrulama setinde F1'i en yükselten eşik seçilir ve `metadata.json`'a yazılır.

### 3.4 Değerlendirme (hepsi raporlanacak)

- ROC-AUC, PR-AUC, F1, precision, recall, confusion matrix.
- **Kalibrasyon:** Brier skoru + kalibrasyon eğrisi. Arayüzde olasılık gösterildiği için olasılıkların güvenilir olması şarttır; gerekirse `CalibratedClassifierCV` uygulanır.
- **Alt grup:** yalnızca `previous_loan_defaults_on_file = No` kayıtlarında aynı metrikler.
- Modellerin karşılaştırma tablosu (aynı test seti üzerinde).

### 3.5 Açıklanabilirlik ve adalet denetimi

- Notebook'ta SHAP (`TreeExplainer`): global önem grafiği + örnek bireysel açıklamalar.
- Canlıda: `shap` kütüphanesi sunucuya kurulmaz. XGBoost'un yerleşik `pred_contribs=True` çıktısı kullanılır; one-hot kolonların katkıları özgün özelliğe toplanır.
- Adalet denetimi: test setinde cinsiyete göre onay oranı ve metrikler karşılaştırılır (cinsiyet modelde olmasa da dolaylı etki olabilir). Sonuç model kartına yazılır.

### 3.6 Notebook'lar ve eğitim scripti

```
ml/notebooks/
  01_eda.ipynb                    # dağılımlar, aykırı değerler, hedef ilişkileri
  02_preprocessing_baseline.ipynb # pipeline + Logistic Regression
  03_xgboost_tuning.ipynb         # XGBoost + karşılaştırma modelleri
  04_evaluation_explainability.ipynb # test metrikleri, kalibrasyon, SHAP, adalet
ml/src/train.py                   # notebook'taki nihai akışın tekrarlanabilir hali
```

`train.py` tek komutla çalışır ve model paketini üretir. Notebook'lar keşif içindir; canlıya giden model her zaman `train.py` çıktısıdır.

### 3.7 Model paketi

```
backend/app/ml_artifacts/v1.0.0/
  model.joblib      # ön işleme + XGBoost içeren tek Pipeline
  metadata.json
```

`metadata.json` içeriği: model versiyonu, eğitim tarihi, algoritma ve hiperparametreler, veri SHA-256, temizlik eşikleri, özellik listesi ve izinli değerler, eğitim verisindeki p1–p99 aralıkları, karar eşiği, test metrikleri (genel + alt grup), kütüphane versiyonları.

- Paket küçüktür (birkaç MB), doğrudan Git'e eklenir.
- Model versiyonu uygulama versiyonundan **bağımsızdır** (`model v1.0.0`, `app v0.3.0` gibi).
- `joblib` dosyası kütüphane versiyonuna duyarlıdır: `scikit-learn` ve `xgboost` versiyonları eğitim ve backend ortamında **aynı ve sabitlenmiş** olmalıdır.

---

## 4. Mimari

```
Kullanıcı (tarayıcı)
   │
   ▼
Next.js (Vercel) ──── giriş/kayıt ────► Supabase Auth
   │  Authorization: Bearer <access token>
   ▼
FastAPI (Docker) ── token doğrulama ──► Supabase JWKS
   │        │
   │        └── model.joblib (bellekte, açılışta bir kez yüklenir)
   ▼
PostgreSQL (Supabase)
```

- Frontend veritabanına **doğrudan erişmez**; tüm veri işlemleri FastAPI üzerinden geçer. Frontend Supabase'i yalnızca kimlik doğrulama için kullanır.
- Backend, isteği yapan kullanıcıyı token içindeki `sub` alanından belirler; istek gövdesindeki kullanıcı kimliğine asla güvenmez.

---

## 5. Backend (FastAPI)

### 5.1 Teknolojiler

FastAPI, Pydantic v2, SQLAlchemy 2 + Alembic, psycopg, scikit-learn, xgboost, joblib, PyJWT (JWKS doğrulaması), slowapi (hız sınırı), pytest, ruff. Bağımlılık yönetimi: `uv` (`pyproject.toml` + `uv.lock`).

### 5.2 Uç noktalar

| Metot | Yol | Giriş | Açıklama |
|---|---|---|---|
| GET | `/health` | Hayır | Servis ve model yüklü mü |
| GET | `/api/v1/model` | Hayır | Aktif model versiyonu, metrikler, alan şeması (izinli değerler ve aralıklar) |
| POST | `/api/v1/predictions` | Evet | Tahmin yapar ve kaydeder |
| GET | `/api/v1/predictions` | Evet | Kullanıcının geçmişi (sayfalama, tarihe göre sıralı) |
| GET | `/api/v1/predictions/{id}` | Evet | Tek tahmin detayı |
| DELETE | `/api/v1/predictions/{id}` | Evet | Tahmini siler |
| DELETE | `/api/v1/me/predictions` | Evet | Kullanıcının tüm tahminlerini siler |

Başka kullanıcıya ait kayıt istenirse `404` döner (varlığı belli edilmez).

### 5.3 Girdi doğrulama (Pydantic)

| Alan | Kural |
|---|---|
| `person_age` | tam sayı, 20 – 80 |
| `person_education` | 5 değerden biri |
| `person_income` | 8.000 – 1.000.000 |
| `person_emp_exp` | 0 – 50 ve `≤ person_age − 15` |
| `person_home_ownership` | 4 değerden biri |
| `loan_amnt` | 500 – 35.000 |
| `loan_intent` | 6 değerden biri |
| `loan_int_rate` | 5,4 – 20,0 |
| `cb_person_cred_hist_length` | 2 – 30 |
| `credit_score` | 390 – 850 |
| `previous_loan_defaults_on_file` | boolean |

- Aralıklar eğitim verisinin kapsadığı bölgeyle sınırlıdır; nihai değerler EDA sonrası `metadata.json`'dan okunur (kodda sabit yazılmaz).
- Girdi geçerli ama eğitim verisinin p1–p99 aralığının dışındaysa yanıtta `low_confidence_fields` listesi döner; arayüz "bu profil eğitim verisinde az temsil ediliyor" uyarısı gösterir.

### 5.4 Tahmin yanıtı

```json
{
  "id": "uuid",
  "created_at": "2026-11-10T15:00:00Z",
  "model_version": "1.0.0",
  "approved": true,
  "probability": 0.83,
  "threshold": 0.47,
  "band": "yuksek",
  "factors": [
    {"feature": "previous_loan_defaults_on_file", "label": "Geçmiş temerrüt kaydı", "direction": "olumlu", "impact": 0.41},
    {"feature": "loan_percent_income", "label": "Kredi / gelir oranı", "direction": "olumsuz", "impact": 0.18}
  ],
  "low_confidence_fields": []
}
```

`band`: `yuksek` / `sinirda` / `dusuk`. Olasılık eşiğe 0,10'dan yakınsa `sinirda`.

### 5.5 Diğer gereksinimler

- Model uygulama açılışında (`lifespan`) bir kez yüklenir.
- CORS yalnızca frontend alan adına açıktır.
- Hız sınırı: tahmin uç noktasında kullanıcı başına dakikada 20 istek.
- Hatalar tutarlı JSON biçiminde ve Türkçe kullanıcı mesajıyla döner.
- Loglarda kullanıcı girdileri (gelir, skor vb.) yer almaz.
- Testler: doğrulama kuralları, tahmin akışı, yetkilendirme (başkasının kaydına erişememe), model yükleme.

---

## 6. Veritabanı (PostgreSQL / Supabase)

Kullanıcı hesapları Supabase Auth tarafından `auth.users` tablosunda tutulur; bu şemaya dokunulmaz. Uygulama tabloları `public` şemasındadır ve **yalnızca Alembic migration'larıyla** yönetilir (Supabase panelinden elle tablo değiştirilmez).

### `predictions`

| Kolon | Tip | Not |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, NOT NULL | `auth.users(id)`, `ON DELETE CASCADE`, indeksli |
| `created_at` | timestamptz | varsayılan `now()` |
| `model_version` | text | `model_versions(version)` |
| `person_age` … `previous_loan_defaults_on_file` | ilgili tipler | 11 girdi alanı ayrı kolonlarda |
| `loan_percent_income` | numeric | hesaplanan değer |
| `probability` | numeric(5,4) | |
| `threshold` | numeric(5,4) | tahmin anındaki eşik |
| `approved` | boolean | |
| `factors` | jsonb | açıklama listesi |
| `low_confidence_fields` | jsonb | tahmin anındaki düşük güven alanları (Faz 4'te eklendi) |

İndeks: `(user_id, created_at DESC)`.

RLS politikaları: `predictions` üzerinde `authenticated` rolü için yalnızca SELECT ve DELETE (`auth.uid() = user_id`). INSERT/UPDATE politikası bilerek yoktur; tahminleri yalnızca backend yazar. Alembic'in `alembic_version` tablosunda da RLS açıktır (politikasız = erişim yok).

### `model_versions`

`version` (PK), `algorithm`, `trained_at`, `metrics` (jsonb), `threshold`, `data_sha256`, `is_active`. Backend açılışta yüklü model paketini bu tabloya kaydeder.

### `profiles` (isteğe bağlı — v1'de oluşturulmadı)

`id` (uuid, PK, `auth.users(id)`), `full_name`, `created_at`. Faz 4'te eklenmedi: ad-soyad gerekirse Supabase Auth'un kullanıcı metadata'sında tutulabilir. Ayrı tablo ihtiyacı doğarsa yeni bir migration ile eklenir.

### Güvenlik

- `public` şemasındaki **her tabloda Row Level Security açık** olmalıdır. Supabase bu tabloları herkese açık anahtarla erişilebilen bir API üzerinden de sunar; RLS kapalıysa veriler dışarıdan okunabilir.
- Politika: kullanıcı yalnızca `user_id = auth.uid()` olan satırları görebilir. `model_versions` yalnızca okunabilir.
- RLS politikaları da Alembic migration'ı içinde SQL olarak yazılır.
- Backend veritabanına sunucu tarafı bağlantı dizgisiyle bağlanır; bu dizgi ve servis anahtarları frontend'e asla verilmez.
- Supabase projesi AB bölgesinde (Frankfurt) açılır. Geliştirme projesi: `loan-approval-dev` (ref `ddyrkkorvilbgzcmezkh`, eu-central-1).
- Backend, Supabase'e **session pooler** (port 5432) üzerinden bağlanır; access token'lar projenin JWKS adresindeki açık anahtarlarla (ES256) doğrulanır, JWT secret kullanılmaz.
- Geliştirme ve canlı için **ayrı** Supabase projeleri kullanılır. Canlı proje: `loan-approval-prod` (ref `uoeenjzyywdewjmajloj`, eu-central-1); şema ve RLS 11 Kasım 2026'da uygulandı.

---

## 7. Frontend (Next.js)

### 7.1 Teknolojiler

Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui, react-hook-form + zod, TanStack Query, `@supabase/ssr` (kimlik doğrulama), Recharts (grafikler). Paket yöneticisi: npm.

### 7.2 Sayfalar

| Yol | İçerik |
|---|---|
| `/` | Tanıtım sayfası: başlık + eylem çağrısı, nasıl çalışır (3 adım), özellikler, örnek sonuç ekranı, SSS, alt bilgi |
| `/giris`, `/kayit`, `/sifremi-unuttum` | Kimlik doğrulama |
| `/panel` | Özet: toplam tahmin, onay oranı, son tahminler, "Yeni değerlendirme" düğmesi |
| `/panel/yeni` | Çok adımlı form: 1) Kişisel bilgiler 2) Kredi bilgileri 3) Kredi geçmişi → Sonuç |
| `/panel/gecmis` | Tahmin tablosu: tarih, tutar, amaç, olasılık, sonuç; filtre ve sayfalama |
| `/panel/gecmis/[id]` | Tahmin detayı: girdiler + sonuç + faktörler |
| `/panel/hesap` | Profil, şifre değiştirme, tüm tahminleri silme |
| `/model` | Model kartı: nasıl eğitildi, metrikler, sınırlamalar, adalet denetimi |
| `/gizlilik`, `/kullanim-kosullari` | Yasal metinler |

`/panel/*` yolları giriş gerektirir; giriş yapmamış kullanıcı `/giris`'e yönlendirilir.

### 7.3 Sonuç ekranı

- Büyük ve net karar: "Onay olasılığı yüksek / Sınırda / Onay olasılığı düşük".
- Olasılık göstergesi (yüzde + gösterge çubuğu, eşik işaretli).
- "Kararı etkileyen faktörler": olumlu ve olumsuz etkiler yatay çubuklarla, Türkçe etiketlerle.
- Varsa düşük güven uyarısı.
- Kalıcı uyarı metni: bunun bir ön değerlendirme olduğu, gerçek kredi kararı olmadığı.

### 7.4 Tasarım ilkeleri

- Hedef his: güven veren, sade, modern bir finans ürünü. Hazır şablon görünümünden kaçınılır.
- Tasarım kararları (renk paleti, tipografi, boşluk ölçeği) Faz 5'in başında bir kez belirlenir ve tüm sayfalarda tutarlı uygulanır.
- **Tasarım sistemi (Faz 5 başında belirlendi, `frontend/app/globals.css`):** zemin sıcak kâğıt beyazı, ana renk koyu mürekkep mavisi; karar renkleri yeşil (olumlu) / kehribar (sınırda) / kırmızı (olumsuz). Başlıklar Manrope, gövde Inter, rakamlar eşit genişlikli. Köşe yarıçapı 0,75rem; düğme ve giriş alanları dokunmatik için en az 40–44 px yüksekliğinde. Canlı önizleme: `/tasarim` (arama motorlarına kapalı).
- Açık ve koyu tema.
- Tam duyarlı (mobil öncelikli); form mobilde rahat doldurulabilmelidir.
- Her veri ekranında yükleniyor, boş ve hata durumları tasarlanır.
- Erişilebilirlik: klavye ile gezinme, etiketli form alanları, yeterli kontrast; karar yalnızca renkle değil metin ve ikonla da belirtilir.
- Sayı ve tarih biçimi `tr-TR`; para birimi alanlarında "USD" etiketi görünür.
- Tüm arayüz metinleri Türkçe ve tek bir dosyada toplanır (`lib/metinler.ts`).
- SEO: sayfa başlıkları, açıklamalar, Open Graph görseli, favicon.

### 7.5 Türkçe etiketler (form)

| Alan | Etiket |
|---|---|
| `person_age` | Yaş |
| `person_education` | Eğitim durumu (Lise, Ön lisans, Lisans, Yüksek lisans, Doktora) |
| `person_income` | Yıllık gelir (USD) |
| `person_emp_exp` | İş tecrübesi (yıl) |
| `person_home_ownership` | Konut durumu (Kira, Konut kredili, Ev sahibi, Diğer) |
| `loan_amnt` | Kredi tutarı (USD) |
| `loan_intent` | Kredi amacı (Eğitim, Sağlık, Girişim, İhtiyaç, Borç birleştirme, Ev tadilatı) |
| `loan_int_rate` | Faiz oranı (yıllık, %) |
| `cb_person_cred_hist_length` | Kredi geçmişi süresi (yıl) |
| `credit_score` | Kredi skoru (390–850) |
| `previous_loan_defaults_on_file` | Daha önce ödenmemiş kredi kaydı var mı? |

---

## 8. Repo yapısı

```
loan-approval/
├── PROJE_PLANI.md
├── CLAUDE.md                 # Claude Code için kısa kurallar ve komutlar
├── README.md
├── CHANGELOG.md
├── .gitignore
├── .gitattributes            # * text=auto eol=lf
├── .github/
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── ml/
│   ├── data/raw/loan_data.csv
│   ├── notebooks/
│   ├── src/train.py
│   └── pyproject.toml
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/              # uç noktalar
│   │   ├── core/             # ayarlar, güvenlik (JWT)
│   │   ├── db/               # modeller, oturum
│   │   ├── schemas/          # Pydantic
│   │   ├── services/         # tahmin, açıklama
│   │   └── ml_artifacts/v1.0.0/
│   ├── alembic/
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
└── docs/                     # model kartı, mimari notlar, ekran görüntüleri
```

---

## 9. Versiyon kontrolü

- **Dallar:** `main` (canlıdaki kod, korumalı) · `dev` (birleştirme dalı) · `feature/<konu>`, `fix/<konu>`.
- **Akış:** `feature/*` → PR → `dev`; faz tamamlanınca `dev` → PR → `main` + sürüm etiketi.
- **Commit biçimi:** Conventional Commits, İngilizce. Örnek: `feat(backend): add prediction endpoint`, `fix(frontend): correct income formatting`. Türler: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`.
- **Küçük ve tek amaçlı commit'ler.** Çalışmayan kod `dev`'e birleştirilmez.
- **Sürüm etiketleri (SemVer):** `v0.1.0` model · `v0.2.0` backend · `v0.3.0` frontend · `v1.0.0` canlı yayın. Her etikette `CHANGELOG.md` güncellenir.
- **Asla commit edilmeyecekler:** `.env*` dosyaları, anahtarlar, `node_modules/`, `.venv/`, `__pycache__/`, `.next/`. Her klasörde `.env.example` bulunur.
- **Veri:** `loan_data.csv` (3,6 MB) lisansı izin veriyorsa repoda tutulur; vermiyorsa `.gitignore`'a eklenir ve README'ye indirme adımları yazılır.
- **Notebook'lar:** çıktılarıyla commit edilir (portföyde görünür olması için), ancak büyük veri dökümleri içermez.
- **CI (GitHub Actions), her PR'da:**
  - backend: `ruff check`, `ruff format --check`, `pytest`
  - frontend: `lint`, tip kontrolü, `build`
- `main` dalına doğrudan push kapalıdır; CI geçmeden birleştirme yapılmaz.

---

## 10. Yol haritası

Her faz ayrı `feature/*` dallarında yürütülür ve kabul ölçütleri sağlanmadan bir sonrakine geçilmez.

### Faz 0 — Kurulum
- `git init`, `.gitignore`, `.gitattributes`, klasör yapısı, `README.md`, `CLAUDE.md`.
- CSV'yi `ml/data/raw/` altına taşı.
- GitHub reposu, `main` + `dev` dalları, dal koruması, CI iskeleti.
- **Kabul:** boş iskelet GitHub'da, CI yeşil.

### Faz 1 — Veri analizi ve model (`v0.1.0`)
- Dört notebook (bkz. 3.6), model karşılaştırması, eşik seçimi, kalibrasyon, SHAP, adalet denetimi.
- **Kabul:** karşılaştırma tablosu hazır; XGBoost test ROC-AUC ve `No` alt grubu metrikleri raporlanmış; kalibrasyon eğrisi kabul edilebilir.

### Faz 2 — Model paketleme
- `ml/src/train.py`, `model.joblib` + `metadata.json`, tahmin ve açıklama fonksiyonları (`backend/app/services/`), birim testleri.
- **Kabul:** `train.py` tek komutla aynı metrikleri üretir; örnek girdide tahmin + faktör listesi döner.

### Faz 3 — Backend (`v0.2.0`)
- FastAPI iskeleti, `/health`, `/api/v1/model`, doğrulama şemaları, tahmin uç noktası (önce veritabanısız), Dockerfile.
- **Kabul:** `/docs` üzerinden tahmin alınabiliyor; testler geçiyor; Docker imajı çalışıyor.

### Faz 4 — Veritabanı ve kimlik doğrulama
- Supabase projeleri (dev + canlı), Alembic migration'ları, RLS politikaları, JWT doğrulaması, geçmiş uç noktaları.
- **Kabul:** kullanıcı yalnızca kendi kayıtlarını görebiliyor (testle kanıtlı); RLS tüm tablolarda açık.

### Faz 5 — Frontend (`v0.3.0`)
- Tasarım sistemi → kimlik doğrulama sayfaları → form ve sonuç ekranı → geçmiş → panel → tanıtım sayfası → model kartı ve yasal sayfalar.
- **Kabul:** kayıt → giriş → tahmin → geçmiş → silme akışı uçtan uca çalışıyor; mobilde sorunsuz; Lighthouse erişilebilirlik ve performans puanları 90+.

### Faz 6 — Canlıya alma (`v1.0.0`)
- Alan adı satın alma; frontend Vercel'e (`alanadi.com`), backend container servisine (`api.alanadi.com`), canlı Supabase projesi.
- Ortam değişkenleri, CORS, HTTPS, Supabase Auth yönlendirme adresleri, e-posta doğrulama şablonları (Türkçe).
- `/health` için çalışırlık izleme, hata takibi (Sentry, isteğe bağlı).
- **Kabul:** canlı alan adında uçtan uca akış çalışıyor; gizli anahtar sızıntısı yok.

### Faz 7 — Cila ve portföy
- README (ekran görüntüleri, mimari şema, canlı bağlantı), model kartı, kısa tanıtım videosu veya GIF.

---

## 11. Yasal ve etik notlar

- Arayüzde kalıcı uyarı: "Bu araç bir ön değerlendirme sunar. Gerçek bir kredi başvurusu ya da banka kararı değildir."
- Model açık bir veri setiyle eğitilmiştir; Türkiye'deki bankaların kriterlerini yansıtmaz.
- Veri seti sentetiktir ve bazı ilişkiler gerçek kredi kararlarından beklenenin tersidir (ör. düşük gelir ve yüksek faiz "onay" olasılığını artırır). Sonuç ekranında ve model kartında şu anlamda bir uyarı yer alır: "Faktörler modelin eğitildiği veri setindeki örüntüleri yansıtır; gerçek bir bankanın değerlendirme ölçütleriyle örtüşmeyebilir."
- Kullanıcının girdiği finansal bilgiler hesabıyla ilişkilendirildiği için kişisel veridir. Gizlilik politikası ve KVKK aydınlatma metni yayınlanır; kullanıcı verilerini silebilir.
- Yalnızca gerekli veri toplanır: ad-soyad zorunlu değildir, kimlik numarası veya iletişim bilgisi istenmez.
- Yasal metinler taslak olarak hazırlanır; canlıya almadan önce bir hukukçunun gözden geçirmesi önerilir.

---

## 12. Açık konular (Semih karar verecek)

1. **Para birimi ve kredi skoru ölçeği.** v1 planı: USD ve 390–850 ölçeği, arayüzde açıkça etiketli. Alternatif: TL girişi alıp kurla çevirmek — ancak Türkiye'deki gelir dağılımı ve Findeks skoru (1–1900) veri setiyle örtüşmediği için tahminler yanıltıcı olur. Öneri: v1'de USD ile kal.
2. **Marka adı ve alan adı.** "Loan Approval" çalışma adı; canlıya almadan önce kesinleşmeli.
3. ~~**Kaggle veri seti bağlantısı ve lisansı.**~~ Çözüldü (10 Kasım 2026): `taweilo/loan-approval-classification-data`, Apache 2.0 — bkz. Bölüm 2.
4. ~~**Backend barındırma servisi.**~~ **Karar (Semih, 11 Kasım 2026): Render, ücretsiz plan, Frankfurt** (`render.yaml`). Model yüklüyken ~320 MB bellek kullanıldığı ölçüldü; 512 MB yeterli. Ücretsiz plan 15 dk boşta kalınca uyur; gerçek kullanıcıya açmadan önce Starter plana geçilecek. Vercel'de Python fonksiyonu olarak çalıştırma değerlendirildi; paket boyutu sınırı, soğuk başlangıç ve bellek içi hız sınırı nedeniyle seçilmedi. Alan adı: şimdilik Vercel'in ücretsiz adresi kullanılacak (açık konu 2 sürüyor). Kurulum adımları: `docs/canliya-alma.md`.
5. **Google ile giriş.** v1'de yok; istenirse Faz 5'te eklenebilir.
6. ~~**Etiketin yönü.**~~ **Karar (Semih, 10 Kasım 2026): seçenek (a)** — etiket belgelendiği gibi (1 = onay) kullanılır; sınırlama model kartında ve arayüzde açıkça belirtilir (bkz. Bölüm 2 madde 7 ve Bölüm 11). Bulgu: Veri seti `loan_status = 1` değerini "onay" olarak belgeliyor, ancak özelliklerle ilişkisi temerrüt etiketi gibi davranıyor: faiz oranı ve kredi/gelir oranı arttıkça, gelir azaldıkça "onay" oranı **artıyor**; kiracılar ev sahiplerinden daha sık "onaylanıyor". Model bunu aynen öğrenir ve arayüzde "geliriniz yüksek olduğu için onay olasılığınız düştü" gibi sezgiye ters açıklamalar çıkar. Seçenekler: (a) etiketi belgelendiği gibi kullanıp sınırlamayı model kartında ve arayüzde açıkça belirtmek, (b) ürünü "risk değerlendirmesi" olarak yeniden konumlandırmak, (c) farklı bir veri setine geçmek. Ayrıntı: `ml/notebooks/01_eda.ipynb`, Bölüm 7.

---

## 13. Claude Code için çalışma kuralları

1. Her oturumda önce bu dosyayı ve `CLAUDE.md`'yi oku. Hangi fazda olunduğunu `CHANGELOG.md` ve Git geçmişinden belirle.
2. Fazları sırayla yürüt; bir fazın kabul ölçütleri sağlanmadan sonrakine geçme.
3. Bölüm 1'deki kesinleşmiş kararları kendi başına değiştirme. Değişiklik gerekiyorsa gerekçesiyle sor; onaylanırsa bu dosyayı da güncelle.
4. Kütüphaneleri kurulum anındaki **güncel kararlı sürümleriyle** kur ve kilit dosyasına sabitle. Next.js, Supabase Auth (özellikle JWT doğrulama ve bağlantı havuzu ayarları) ve shadcn/ui için ezberden değil **güncel resmi dokümantasyondan** ilerle.
5. Kod, değişken adları ve commit mesajları İngilizce; kullanıcıya görünen tüm metinler Türkçe.
6. Geliştirme ortamı Windows'tur: komutları PowerShell uyumlu ver, yol ayırıcılarına ve satır sonlarına dikkat et.
7. Her anlamlı adımda commit at (Bölüm 9). Gizli anahtarları asla koda veya commit'e yazma; `.env.example` dosyasını güncel tut.
8. Yeni davranış eklediğinde testini de yaz; commit öncesi lint ve testleri çalıştır.
9. Veritabanı şemasını yalnızca Alembic migration'ı ile değiştir; yeni tabloda RLS'i aynı migration'da aç.
10. `person_gender` kolonunu hiçbir koşulda model girdisine ekleme.
11. Model metriklerini raporlarken accuracy'yi tek başına verme; `No` alt grubu metriklerini her zaman ekle.
12. Emin olmadığın veya bu dosyada yanıtı olmayan bir karar çıkarsa varsayım yapma, sor.

### İlk oturum için başlangıç komutu

> `PROJE_PLANI.md` dosyasını oku. Faz 0'ı uygula: Git'i başlat, klasör yapısını ve temel dosyaları oluştur, CSV'yi taşı, `CLAUDE.md`'yi yaz. Bitince bana özet ver ve Faz 1'e geçmeden önce onayımı bekle.
