# Canlıya alma rehberi

Bu belge, uygulamayı canlı ortama kurmak için gereken adımları sırasıyla anlatır. Hesap açma, ödeme ve gizli değer girme adımları proje sahibi tarafından yapılır; gizli değerler (veritabanı şifresi vb.) hiçbir zaman Git'e ya da sohbete yazılmaz.

## Ortamlar

| Parça | Geliştirme | Canlı |
|---|---|---|
| Frontend | `localhost:3000` | [loan-approval-navy.vercel.app](https://loan-approval-navy.vercel.app) — Vercel, `main` dalı, Root Directory `frontend` (bölge `fra1`) |
| Backend | `localhost:8000` | [loan-approval-api-m2wc.onrender.com](https://loan-approval-api-m2wc.onrender.com/health) — Render, `main` dalı, `render.yaml` (bölge Frankfurt) |
| Veritabanı + Auth | Supabase `loan-approval-dev` (`ddyrkkorvilbgzcmezkh`) | Supabase `loan-approval-prod` (`uoeenjzyywdewjmajloj`) |

İki Supabase projesi de Frankfurt'tadır. Canlı veritabanının şeması (`0001` migration'ı) ve RLS politikaları kurulmuştur.

## 1. Kodu `main` dalına almak

Render ve Vercel yalnızca `main` dalını yayınlar.

1. `dev` → `main` PR'ını açın, CI yeşil olunca birleştirin.
2. GitHub'da `main` üzerinde sürüm etiketi oluşturun (Releases → Draft a new release).

## 2. Frontend — Vercel

1. [vercel.com/new](https://vercel.com/new) → GitHub'dan `skaramuk/loan-approval` deposunu seçin → **Import**.
2. **Root Directory**: `frontend` (Edit düğmesiyle seçin). Framework otomatik olarak Next.js görünür.
3. **Environment Variables** bölümüne şu üçünü ekleyin (hepsi herkese açık değerlerdir):

   | Anahtar | Değer |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://uoeenjzyywdewjmajloj.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | canlı projenin yayımlanabilir anahtarı (`sb_publishable_...`) |
   | `NEXT_PUBLIC_API_URL` | Render adresi, ör. `https://loan-approval-api.onrender.com` (3. adımdan sonra) |

4. **Deploy**. Yayın adresini not edin (ör. `https://loan-approval.vercel.app`).

Render adresi henüz yoksa `NEXT_PUBLIC_API_URL` değerini sonra ekleyip **Redeploy** yapın; `NEXT_PUBLIC_` değişkenleri derleme sırasında koda gömülür.

## 3. Backend — Render

1. [render.com](https://render.com) üzerinde GitHub ile hesap açın.
2. **New → Blueprint** → `skaramuk/loan-approval` deposunu seçin. Render, depo kökündeki `render.yaml` dosyasını okur.
3. İki değer sorulur:
   - `CORS_ORIGINS`: Vercel yayın adresi, sonunda `/` olmadan (ör. `https://loan-approval.vercel.app`).
   - `DATABASE_URL`: Supabase → `loan-approval-prod` → **Connect** → **Session pooler** dizgisi, `[YOUR-PASSWORD]` yerine veritabanı şifresiyle. Şifre bilinmiyorsa: Project Settings → Database → Reset database password (yalnızca harf ve rakam önerilir).
4. **Apply**. İlk derleme birkaç dakika sürer. Bittiğinde `https://<servis>.onrender.com/health` adresi `"model_loaded": true` döndürmelidir.

Ücretsiz planda servis 15 dakika istek almazsa uyur; ilk istek ~1 dakika sürebilir. Gerçek kullanıcıya açmadan önce servis ayarlarından **Starter** planına geçin.

## 4. Supabase Auth — canlı proje

Supabase panelinde `loan-approval-prod` projesinde:

1. **Authentication → URL Configuration**
   - **Site URL**: Vercel yayın adresi.
   - **Redirect URLs**: `https://<vercel-adresi>/auth/onay`
2. **Authentication → Emails → Templates**: aşağıdaki Türkçe şablonları yapıştırın.
3. **E-posta gönderimi (önemli):** Supabase'in yerleşik e-posta servisi yalnızca proje ekibindeki adreslere ve saatte birkaç e-posta gönderir. Gerçek kullanıcılar kayıt olabilsin ve şifre sıfırlayabilsin diye **Authentication → Emails → SMTP Settings** bölümünden özel bir SMTP servisi (ör. Resend, Brevo) bağlanmalıdır. Bu servisler gönderen alan adının doğrulanmasını ister; bu yüzden alan adı alındıktan sonra yapılır.

### E-posta şablonu: Kayıt onayı (Confirm signup)

**Konu:** `Hesabınızı onaylayın`

```html
<h2>Hesabınızı onaylayın</h2>
<p>Merhaba,</p>
<p>Kredi ön değerlendirme hesabınızı etkinleştirmek için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">E-posta adresimi onayla</a></p>
<p>Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
<p style="color:#666;font-size:12px">Bu araç bir ön değerlendirme sunar. Gerçek bir kredi başvurusu ya da banka kararı değildir.</p>
```

### E-posta şablonu: Şifre sıfırlama (Reset password)

**Konu:** `Şifre sıfırlama isteği`

```html
<h2>Şifrenizi sıfırlayın</h2>
<p>Merhaba,</p>
<p>Hesabınız için şifre sıfırlama isteği aldık. Yeni şifre belirlemek için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Yeni şifre belirle</a></p>
<p>Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.</p>
```

### E-posta şablonu: E-posta değişikliği (Change email address)

**Konu:** `Yeni e-posta adresinizi onaylayın`

```html
<h2>E-posta değişikliğini onaylayın</h2>
<p>Hesabınızın e-posta adresini <strong>{{ .NewEmail }}</strong> olarak değiştirmek için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Değişikliği onayla</a></p>
```

## 5. Doğrulama

1. `https://<servis>.onrender.com/health` → `"status": "ok"`, `"model_loaded": true`.
2. Vercel adresinde kayıt → e-posta onayı → giriş → yeni değerlendirme → geçmiş → silme.
3. Tarayıcı geliştirici araçlarında (Network) istek başlıklarında `DATABASE_URL` ya da gizli anahtar geçmediğini kontrol edin. Frontend paketinde yalnızca `NEXT_PUBLIC_` ile başlayan üç herkese açık değer bulunur.

## 6. İzleme

- **Çalışırlık:** UptimeRobot ya da Better Stack gibi ücretsiz bir servisle `/health` adresi 5 dakikada bir kontrol edilebilir. Not: ücretsiz Render planında bu kontrol servisi uyumaktan alıkoyar ve aylık 750 ücretsiz saatin çoğunu kullanır; tek servis için yeterlidir.
- **Hata takibi (isteğe bağlı):** Sentry henüz kurulmadı.

## Bilinen tuzaklar

- **Render yolları:** `rootDir` ayarlıyken `dockerfilePath` ve `dockerContext` kök klasörün içinden çözülür (`./Dockerfile`, `.`), depo kökünden değil.
- **Render veritabanı şifresi:** `DATABASE_URL` içindeki şifrede `@ # / : ? %` gibi karakterler adresi bozar; yalnızca harf ve rakam kullanın. Kullanıcı adı `postgres.<proje-ref>` biçimindedir.
- **Vercel boş yayın:** yayın 2–3 saniyede "Ready" oluyor ve site 404 veriyorsa Root Directory `frontend` ayarlı değildir; normal bir derleme ~1 dakika sürer.
- **Vercel değişken türü:** `NEXT_PUBLIC_` ile başlayan değişkenler tarayıcıya gönderilir; Vercel'de **Config** türünde eklenir.
- **Vercel iki adımlı doğrulama:** panelde ayar değiştirmek ve elle yeniden yayınlamak doğrulama ister. Git'ten gelen yayınlar istemez; `main`'e birleştirilen her PR yeni bir canlı yayın başlatır.

## Migration'lar

Render'ın ücretsiz planı dağıtım öncesi komut (`preDeployCommand`) desteklemez. Yeni bir migration, canlı veritabanına yayından **önce** elle uygulanır:

```powershell
cd backend
$env:DATABASE_URL = "<canlı session pooler dizgisi>"   # yalnızca bu terminal oturumu için
uv run alembic upgrade head
Remove-Item Env:DATABASE_URL
```
