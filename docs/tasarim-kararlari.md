# Tasarım kararları

Projenin hangi kararlarla ve neden bu şekilde kurulduğunu özetler. Sistemin yapısı için [mimari.md](mimari.md), modelin ayrıntıları için [model-karti.md](model-karti.md), kurulum için [canliya-alma.md](canliya-alma.md) belgelerine bakın.

## Amaç ve kapsam

Kullanıcının girdiği kişisel ve kredi bilgilerine göre bir kredi başvurusunun **onaylanma olasılığını** tahmin eden ve sonucu **hangi bilgilerin ne yönde etkilediğini** gösteren bir ön değerlendirme aracı. Gerçek bir banka kararı vermez; açık bir veri setinde eğitilmiş bir modelin tahminini sunar. Bu uyarı arayüzde kalıcı olarak görünür.

## Teknoloji seçimleri

| Konu | Karar | Gerekçe |
|---|---|---|
| Ana model | XGBoost | Tablo verisinde derin öğrenmeden daha uygun; açıklanabilir (`pred_contribs`); küçük model paketi |
| Karşılaştırma | Logistic Regression (baseline), Random Forest, LightGBM | Aynı test setinde karşılaştırılabilir referanslar |
| Backend | FastAPI, Pydantic v2 | Model Python'da; şema doğrulaması ve otomatik API belgesi |
| Frontend | Next.js (TypeScript), Tailwind, shadcn/ui | Sunucu tarafı oturum koruması, hızlı ve erişilebilir arayüz |
| Veritabanı ve kimlik | PostgreSQL ve Auth (Supabase) | Hazır kimlik doğrulama, satır düzeyinde güvenlik (RLS), AB bölgesi |
| Arayüz dili | Türkçe | Hedef kitle Türkçe konuşan kullanıcılar; metinler tek dosyada (`frontend/lib/metinler.ts`) |
| Kod ve commit dili | İngilizce | Yaygın geliştirici pratiği |
| Depo | Tek depo (monorepo) | Model, API ve arayüz aynı sürümde birlikte değişir |

## Veri üzerine bulgular ve etkileri

1. **Tek kolon verinin yarısını belirliyor.** `previous_loan_defaults_on_file = Yes` olan 22.858 kaydın tamamı ret. Genel metrikler bu yüzden şişer; tüm sonuçlar **genel ve `No` alt grubu için ayrı** raporlanır.
2. **Sınıf dengesizliği** (%78 ret): accuracy ana metrik değildir; ROC-AUC, PR-AUC, F1 ve Brier kullanılır, karar eşiği doğrulama setinde seçilir.
3. **Hatalı kayıtlar** (yaş 144, iş tecrübesi 125 gibi): 10 kayıt eğitimden çıkarıldı.
4. **Cinsiyet modele girmez.** Kredi kararında cinsiyet kullanmak etik ve hukuki açıdan sorunludur. Kolon yalnızca test aşamasında adalet denetimi için kullanıldı; API cinsiyet gönderilirse isteği reddeder.
5. **Veri genç profile ağırlıklıdır.** Eğitim verisinin p1–p99 aralığı dışındaki girdilerde API `low_confidence_fields` döndürür ve arayüz uyarı gösterir.
6. **Para birimi USD, kredi skoru 390–850 ölçeğinde.** Türkiye'deki gelir dağılımı ve Findeks skoru (1–1900) veri setiyle örtüşmediği için TL'ye çevirmek tahminleri yanıltırdı; değerler olduğu gibi alınır ve arayüzde açıkça etiketlenir.
7. **Etiketin yönü sezgiye ters.** Veri setinde "onay" etiketi temerrüt etiketi gibi davranır: faiz ve kredi/gelir oranı arttıkça, gelir azaldıkça onay oranı artar. Etiket belgelendiği gibi kullanıldı; alternatifler (ürünü "risk değerlendirmesi" olarak yeniden konumlandırmak ya da başka bir veri setine geçmek) değerlendirilip projenin amacı gereği seçilmedi. Sınırlama arayüzde ve model kartında açıkça belirtilir.

## Güvenlik ve gizlilik kararları

- **Frontend veritabanına doğrudan erişmez**; Supabase tarayıcıda yalnızca kimlik doğrulama için kullanılır.
- **Kullanıcı kimliği yalnızca doğrulanmış token'dan gelir** (`sub`). Token'lar projenin açık anahtarlarıyla (JWKS, ES256) doğrulanır; backend'de JWT gizli anahtarı yoktur.
- **İki savunma hattı:** backend her sorguyu `user_id` ile filtreler; veritabanında her tabloda RLS açıktır. Başkasının kaydı için "yok" ile aynı `404` döner.
- **Tahminleri yalnızca backend yazar:** kullanıcılar için INSERT/UPDATE politikası bilerek yoktur.
- **Girdi sınırları modelden gelir** (`metadata.json`); koda sabit yazılmaz.
- **Kişisel veri loglanmaz.** Gelir, kredi skoru gibi girdiler hiçbir logda yer almaz.
- **Yalnızca gerekli veri toplanır:** ad-soyad, kimlik numarası ya da iletişim bilgisi istenmez; kullanıcı tüm kayıtlarını silebilir.
- **Hız sınırı:** tahmin uç noktasında kullanıcı başına dakikada 20 istek.
- **Geliştirme ve canlı ayrı Supabase projeleridir.** Şema yalnızca Alembic migration'larıyla değişir ve her tabloda RLS aynı migration'da açılır.

## Model paketleme kararları

- Eğitim ve canlı tahmin **aynı `Pipeline` nesnesini** kullanır; ön işleme farkından doğan uyumsuzluk olmaz.
- Paket küçüktür (birkaç yüz KB) ve doğrudan Git'e eklenir; model sürümü uygulama sürümünden bağımsızdır.
- `scikit-learn` ve `xgboost` sürümleri `ml/` ve `backend/` ortamlarında aynıdır; backend, `metadata.json`'daki sürümler kurulu olanla eşleşmezse modeli yüklemez.
- Canlıda `shap` kütüphanesi kurulmaz; XGBoost'un yerleşik katkı çıktısı kullanılır (SHAP ile birebir aynı değerleri verdiği doğrulanmıştır).

## Barındırma kararı

| Parça | Seçim | Not |
|---|---|---|
| Frontend | Vercel | Next.js ile doğal uyum; Git'ten otomatik yayın |
| Backend | Render (Docker, Frankfurt) | Model yüklüyken ~320 MB bellek ölçüldü; 512 MB yeterli |
| Veritabanı | Supabase (Frankfurt) | Frontend ve backend ile aynı bölge |

Backend'in Vercel'de Python fonksiyonu olarak çalıştırılması da değerlendirildi; paket boyutu sınırı, soğuk başlangıç süresi ve bellek içi hız sınırının sunucusuz ortamda doğru çalışmaması nedeniyle seçilmedi.

## Bilinen eksikler ve olası sonraki adımlar

Proje bir portföy çalışmasıdır; ticari bir ürünün gerektirdiği şu kalemler kapsam dışında bırakılmıştır:

- **Alan adı ve marka:** şimdilik Vercel'in ücretsiz adresi kullanılıyor.
- **Özel e-posta servisi (SMTP):** Supabase'in yerleşik servisi kullanılıyor; belgelerine göre saatlik sınırı ve teslim garantisi yok, üretim için önerilmiyor.
- **Ücretsiz Render planı:** 15 dakika kullanılmazsa servis uyur, ilk istek yaklaşık bir dakika sürebilir.
- **Yasal metinler taslaktır:** yayına açılmadan önce bir hukukçu tarafından gözden geçirilmelidir (KVKK aydınlatma metni dahil).
- **İzleme:** hata takibi ve çalışırlık izleme kurulmadı.
- **Gerçek veri:** model sentetik bir veri setiyle eğitildi; gerçek kredi kararları hakkında bir kanıt sunmaz.
