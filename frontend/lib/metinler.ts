/**
 * Arayüzde görünen tüm Türkçe metinler bu dosyada toplanır.
 * Bileşenlerin içine doğrudan metin yazılmaz; buradan okunur.
 */

export const UYGULAMA = {
  ad: "Loan Approval",
  slogan: "Kredi ön değerlendirme aracı",
  aciklama:
    "Kişisel ve kredi bilgilerinize göre başvurunuzun onaylanma olasılığını saniyeler içinde tahmin edin.",
} as const;

export const UYARILAR = {
  onDegerlendirme:
    "Bu araç bir ön değerlendirme sunar. Gerçek bir kredi başvurusu ya da banka kararı değildir.",
  faktorler:
    "Faktörler modelin eğitildiği veri setindeki örüntüleri yansıtır; gerçek bir bankanın değerlendirme ölçütleriyle örtüşmeyebilir.",
  dusukGuven: "Bu profil eğitim verisinde az temsil ediliyor; tahmin daha az güvenilir olabilir.",
} as const;

export const TEMA = {
  acik: "Açık tema",
  koyu: "Koyu tema",
  degistir: "Temayı değiştir",
} as const;

export const BANTLAR = {
  yuksek: { baslik: "Onay olasılığı yüksek", kisa: "Yüksek" },
  sinirda: { baslik: "Sınırda", kisa: "Sınırda" },
  dusuk: { baslik: "Onay olasılığı düşük", kisa: "Düşük" },
} as const;

export const YONLER = {
  olumlu: "Olumlu etki",
  olumsuz: "Olumsuz etki",
} as const;

export const ALANLAR = {
  person_age: "Yaş",
  person_education: "Eğitim durumu",
  person_income: "Yıllık gelir (USD)",
  person_emp_exp: "İş tecrübesi (yıl)",
  person_home_ownership: "Konut durumu",
  loan_amnt: "Kredi tutarı (USD)",
  loan_intent: "Kredi amacı",
  loan_int_rate: "Faiz oranı (yıllık, %)",
  loan_percent_income: "Kredi / gelir oranı",
  cb_person_cred_hist_length: "Kredi geçmişi süresi (yıl)",
  credit_score: "Kredi skoru (390–850)",
  previous_loan_defaults_on_file: "Daha önce ödenmemiş kredi kaydı var mı?",
} as const;

export const SECENEKLER = {
  person_education: {
    "High School": "Lise",
    Associate: "Ön lisans",
    Bachelor: "Lisans",
    Master: "Yüksek lisans",
    Doctorate: "Doktora",
  },
  person_home_ownership: {
    RENT: "Kira",
    MORTGAGE: "Konut kredili",
    OWN: "Ev sahibi",
    OTHER: "Diğer",
  },
  loan_intent: {
    EDUCATION: "Eğitim",
    MEDICAL: "Sağlık",
    VENTURE: "Girişim",
    PERSONAL: "İhtiyaç",
    DEBTCONSOLIDATION: "Borç birleştirme",
    HOMEIMPROVEMENT: "Ev tadilatı",
  },
} as const;

export const TASARIM = {
  baslik: "Tasarım sistemi",
  altBaslik:
    "Renk, tipografi ve temel bileşenler. Tüm sayfalar bu kararlara göre kurulacak; onaydan sonra bu sayfa kaldırılabilir.",
  bolumler: {
    renkler: "Renkler",
    tipografi: "Tipografi",
    dugmeler: "Düğmeler",
    form: "Form alanları",
    sonuc: "Sonuç ekranı",
    durumlar: "Durumlar",
  },
  renkler: {
    background: "Zemin",
    card: "Kart",
    primary: "Ana renk",
    "primary-soft": "Ana renk (yumuşak)",
    muted: "Sönük zemin",
    border: "Kenarlık",
    success: "Olumlu",
    warning: "Sınırda",
    danger: "Olumsuz",
  },
  tipografi: {
    baslik1: "Kredi başvurunuzu göndermeden önce şansınızı görün",
    baslik2: "Nasıl çalışır?",
    baslik3: "Kararı etkileyen faktörler",
    govde:
      "Bilgilerinizi üç kısa adımda girin. Model, onay olasılığını ve bu sonucu en çok etkileyen faktörleri gösterir.",
    kucuk: "Tutarlar ABD doları (USD) cinsindendir.",
    rakam: "12.000 USD · %12,5 · 640",
    etiketler: {
      baslik: "Başlıklar — Manrope",
      govde: "Gövde — Inter",
      rakam: "Rakamlar — eşit genişlikli",
    },
  },
  dugmeler: {
    birincil: "Yeni değerlendirme",
    ikincil: "Geçmişi gör",
    cerceveli: "Geri",
    hayalet: "Vazgeç",
    tehlikeli: "Tüm tahminleri sil",
    devreDisi: "Hesaplanıyor…",
  },
  form: {
    yardimGelir: "Vergi öncesi yıllık toplam geliriniz.",
    hataSkor: "En az 390 olmalıdır.",
    ornekGelir: "60.000",
    ornekSkor: "380",
  },
  sonuc: {
    olasilik: "Onay olasılığı",
    esik: "Karar eşiği",
    ornekFaktorler: [
      { etiket: "Geçmiş temerrüt kaydı", yon: "olumlu", etki: 0.32 },
      { etiket: "Yıllık gelir", yon: "olumlu", etki: 0.21 },
      { etiket: "Kredi / gelir oranı", yon: "olumsuz", etki: 0.13 },
      { etiket: "Faiz oranı", yon: "olumsuz", etki: 0.1 },
    ],
  },
  durumlar: {
    yukleniyor: "Yükleniyor",
    bos: "Henüz bir değerlendirmeniz yok",
    bosAciklama: "İlk değerlendirmenizi yaptığınızda burada görünecek.",
    hata: "Bir şeyler ters gitti",
    hataAciklama: "Tahminler yüklenemedi. Lütfen tekrar deneyin.",
    tekrar: "Tekrar dene",
  },
} as const;

export const HATALAR = {
  genel: "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
  baglanti: "Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edip tekrar deneyin.",
  oturum: "Oturumunuz sona ermiş. Lütfen yeniden giriş yapın.",
  bulunamadi: "Aradığınız kayıt bulunamadı.",
  tekrarDene: "Tekrar dene",
  sayfaBulunamadi: {
    baslik: "Sayfa bulunamadı",
    aciklama: "Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.",
    don: "Ana sayfaya dön",
  },
} as const;

export const NAV = {
  ozet: "Özet",
  yeni: "Yeni değerlendirme",
  gecmis: "Geçmiş",
  hesap: "Hesap",
  model: "Model",
  giris: "Giriş yap",
  kayit: "Ücretsiz başla",
  panel: "Panele git",
  cikis: "Çıkış yap",
  anaMenu: "Ana menü",
  panelMenu: "Panel menüsü",
  atla: "İçeriğe geç",
} as const;

export const ALT_BILGI = {
  gizlilik: "Gizlilik politikası",
  kosullar: "Kullanım koşulları",
  model: "Model kartı",
  telif: "Tüm hakları saklıdır.",
} as const;

export const DOGRULAMA = {
  zorunlu: "Bu alan zorunludur.",
  sec: "Lütfen bir seçenek seçin.",
  tamSayi: "Tam sayı girilmelidir.",
  enAz: (n: string) => `En az ${n} olmalıdır.`,
  enFazla: (n: string) => `En fazla ${n} olmalıdır.`,
  tecrube: (fark: number) => `İş tecrübesi, yaşınızdan en az ${fark} yıl küçük olmalıdır.`,
  eposta: "Geçerli bir e-posta adresi girin.",
  sifreKisa: "Şifre en az 8 karakter olmalıdır.",
  sifreEslesmiyor: "Şifreler eşleşmiyor.",
} as const;

export const AUTH = {
  eposta: "E-posta",
  sifre: "Şifre",
  sifreTekrar: "Şifre (tekrar)",
  yeniSifre: "Yeni şifre",
  sifreIpucu: "En az 8 karakter.",
  goster: "Şifreyi göster",
  gizle: "Şifreyi gizle",
  giris: {
    baslik: "Tekrar hoş geldiniz",
    altBaslik: "Değerlendirmelerinize devam etmek için giriş yapın.",
    dugme: "Giriş yap",
    bekle: "Giriş yapılıyor…",
    unuttum: "Şifremi unuttum",
    hesapYok: "Hesabınız yok mu?",
    kayitOl: "Kayıt olun",
  },
  kayit: {
    baslik: "Hesap oluşturun",
    altBaslik:
      "Ücretsiz. Yalnızca e-posta ve şifre yeterli; kimlik ya da iletişim bilgisi istemiyoruz.",
    dugme: "Hesap oluştur",
    bekle: "Hesap oluşturuluyor…",
    hesapVar: "Zaten hesabınız var mı?",
    girisYap: "Giriş yapın",
    onay: {
      baslik: "E-postanızı kontrol edin",
      aciklama: (eposta: string) =>
        `${eposta} adresine bir onay bağlantısı gönderdik. Bağlantıya tıkladıktan sonra giriş yapabilirsiniz.`,
      spam: "E-posta birkaç dakika içinde gelmezse gereksiz (spam) klasörünüze bakın.",
    },
    kabul: {
      once: "Hesap oluşturarak ",
      ve: " ve ",
      sonra: " metinlerini kabul etmiş olursunuz.",
    },
  },
  unuttum: {
    baslik: "Şifrenizi sıfırlayın",
    altBaslik: "E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.",
    dugme: "Sıfırlama bağlantısı gönder",
    bekle: "Gönderiliyor…",
    gonderildi: {
      baslik: "Bağlantı gönderildi",
      aciklama:
        "Bu e-posta adresiyle kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı birkaç dakika içinde ulaşacaktır.",
    },
    geri: "Girişe dön",
  },
  yenile: {
    baslik: "Yeni şifre belirleyin",
    altBaslik: "Hesabınız için yeni bir şifre girin.",
    dugme: "Şifreyi güncelle",
    bekle: "Güncelleniyor…",
    basarili: "Şifreniz güncellendi.",
  },
  hatalar: {
    gecersizGiris: "E-posta ya da şifre hatalı.",
    onaylanmamis:
      "E-posta adresiniz henüz onaylanmamış. Gelen kutunuzdaki bağlantıya tıklayın.",
    kayitli: "Bu e-posta adresiyle zaten bir hesap var. Giriş yapmayı deneyin.",
    zayifSifre:
      "Şifre yeterince güçlü değil. Daha uzun ya da daha karmaşık bir şifre deneyin.",
    cokFazla: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.",
    ayniSifre: "Yeni şifre eski şifrenizle aynı olamaz.",
    baglantiGecersiz: "Bağlantı geçersiz ya da süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
    genel: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  },
} as const;

export const FORM = {
  baslik: "Yeni değerlendirme",
  altBaslik: "Üç kısa adımda bilgilerinizi girin. Tutarlar ABD doları (USD) cinsindendir.",
  adim: (n: number, toplam: number) => `Adım ${n} / ${toplam}`,
  adimlar: [
    { baslik: "Kişisel bilgiler", aciklama: "Yaşınız, eğitiminiz, geliriniz ve konut durumunuz." },
    { baslik: "Kredi bilgileri", aciklama: "Almak istediğiniz kredinin tutarı, amacı ve faizi." },
    { baslik: "Kredi geçmişi", aciklama: "Kredi skorunuz ve geçmiş kredi kayıtlarınız." },
  ],
  ileri: "Devam et",
  geri: "Geri",
  gonder: "Değerlendir",
  bekle: "Hesaplanıyor…",
  secin: "Seçin",
  evet: "Evet",
  hayir: "Hayır",
  aralik: (min: string, max: string) => `${min} – ${max} arasında.`,
  yardim: {
    person_income: "Vergi öncesi yıllık toplam geliriniz.",
    person_emp_exp: "Toplam çalışma süreniz, yıl olarak.",
    loan_int_rate: "Bankanın teklif ettiği yıllık faiz oranı.",
    cb_person_cred_hist_length:
      "İlk kredinizi ya da kredi kartınızı aldığınızdan bu yana geçen süre.",
    credit_score: "FICO benzeri ölçek. Türkiye'deki Findeks skoruyla aynı değildir.",
    previous_loan_defaults_on_file:
      "Geçmişte vadesinde ödenmemiş ve kayıtlara geçmiş bir krediniz oldu mu?",
  },
  oran: {
    etiket: "Kredi / gelir oranı",
    aciklama: "Kredi tutarının yıllık gelirinize oranı. Otomatik hesaplanır.",
  },
  yuklenemedi: "Form yüklenemedi.",
} as const;

export const SONUC = {
  baslik: "Değerlendirme sonucu",
  olasilik: "Onay olasılığı",
  esik: "Karar eşiği",
  aciklama: {
    yuksek:
      "Model, bu profilin onaylanma olasılığını karar eşiğinin belirgin biçimde üzerinde buluyor.",
    sinirda:
      "Olasılık karar eşiğine çok yakın. Küçük değişiklikler sonucu iki yöne de çevirebilir.",
    dusuk:
      "Model, bu profilin onaylanma olasılığını karar eşiğinin belirgin biçimde altında buluyor.",
  },
  karar: { onay: "Tahmin: onay", ret: "Tahmin: ret" },
  faktorler: "Kararı etkileyen faktörler",
  dusukGuvenBaslik: "Bu profil eğitim verisinde az temsil ediliyor",
  dusukGuvenAciklama: (alanlar: string) =>
    `Şu değerler modelin sık gördüğü aralığın dışında: ${alanlar}. Tahmin daha az güvenilir olabilir.`,
  girdiler: "Girdiğiniz bilgiler",
  modelSurumu: (v: string) => `Model sürümü ${v}`,
  yeni: "Yeni değerlendirme yap",
  detay: "Kaydı görüntüle",
  gecmis: "Geçmişe dön",
  kaydedildi: "Değerlendirme geçmişinize kaydedildi.",
} as const;

export const GECMIS = {
  baslik: "Geçmiş",
  altBaslik: "Yaptığınız tüm değerlendirmeler. Yalnızca siz görebilirsiniz.",
  sutunlar: {
    tarih: "Tarih",
    tutar: "Tutar",
    amac: "Amaç",
    olasilik: "Olasılık",
    sonuc: "Sonuç",
  },
  filtre: { etiket: "Sonuca göre filtrele", tumu: "Tümü", onay: "Onay", ret: "Ret" },
  toplam: (n: number) => `${n} kayıt`,
  sayfa: (n: number, toplam: number) => `Sayfa ${n} / ${toplam}`,
  onceki: "Önceki",
  sonraki: "Sonraki",
  bos: {
    baslik: "Henüz bir değerlendirmeniz yok",
    aciklama: "İlk değerlendirmenizi yaptığınızda burada görünecek.",
    filtreli: "Bu filtreye uyan kayıt yok.",
  },
  yuklenemedi: "Tahminler yüklenemedi.",
  goruntule: "Görüntüle",
  sil: {
    dugme: "Sil",
    baslik: "Bu değerlendirme silinsin mi?",
    aciklama: "Kayıt kalıcı olarak silinir. Bu işlem geri alınamaz.",
    onay: "Evet, sil",
    vazgec: "Vazgeç",
    basarili: "Değerlendirme silindi.",
  },
} as const;

export const OZET = {
  baslik: "Özet",
  hosgeldin: "Hoş geldiniz",
  toplam: "Toplam değerlendirme",
  onayOrani: "Onay oranı",
  onayOraniAciklama: (onay: number, toplam: number) =>
    `${toplam} değerlendirmenin ${onay} tanesi onay`,
  onayOraniBos: "Henüz veri yok",
  sonTahminler: "Son değerlendirmeler",
  tumunuGor: "Tümünü gör",
  ilk: {
    baslik: "İlk değerlendirmenizi yapın",
    aciklama: "Üç kısa adımda bilgilerinizi girin, sonucu saniyeler içinde görün.",
  },
} as const;

export const HESAP = {
  baslik: "Hesap",
  profil: { baslik: "Profil", eposta: "E-posta adresi", uyelik: "Üyelik tarihi" },
  sifre: {
    baslik: "Şifre değiştir",
    aciklama: "Yeni şifreniz en az 8 karakter olmalıdır.",
    dugme: "Şifreyi güncelle",
    bekle: "Güncelleniyor…",
    basarili: "Şifreniz güncellendi.",
  },
  veri: {
    baslik: "Verileriniz",
    aciklama:
      "Girdiğiniz finansal bilgiler yalnızca hesabınızla ilişkilendirilir. Dilediğiniz zaman tümünü silebilirsiniz.",
    dugme: "Tüm değerlendirmeleri sil",
    onayBaslik: "Tüm değerlendirmeleriniz silinsin mi?",
    onayAciklama: "Geçmişinizdeki bütün kayıtlar kalıcı olarak silinir. Bu işlem geri alınamaz.",
    onay: "Evet, tümünü sil",
    vazgec: "Vazgeç",
    basarili: (n: number) => (n > 0 ? `${n} değerlendirme silindi.` : "Silinecek kayıt yoktu."),
  },
  cikis: { baslik: "Oturum", dugme: "Çıkış yap" },
} as const;

export const TANITIM = {
  rozet: "Makine öğrenmesiyle kredi ön değerlendirmesi",
  baslik: "Kredi başvurunuzu göndermeden önce şansınızı görün",
  altBaslik:
    "Bilgilerinizi üç kısa adımda girin. Model, onay olasılığını ve bu sonucu en çok etkileyen faktörleri saniyeler içinde göstersin.",
  cta: "Ücretsiz başla",
  ctaIkincil: "Model nasıl çalışıyor?",
  guven: ["Kimlik ya da iletişim bilgisi istenmez", "Verilerinizi dilediğiniz an silebilirsiniz"],
  nasil: {
    baslik: "Nasıl çalışır?",
    adimlar: [
      {
        baslik: "Bilgilerinizi girin",
        aciklama:
          "Yaş, gelir, kredi tutarı ve kredi geçmişi gibi 11 alanı doldurun. Bir dakikadan kısa sürer.",
      },
      {
        baslik: "Model değerlendirsin",
        aciklama:
          "45.000 kredi kaydıyla eğitilmiş model, profilinizin onaylanma olasılığını hesaplar.",
      },
      {
        baslik: "Sonucu ve nedenlerini görün",
        aciklama: "Olasılığı, kararı ve onu en çok etkileyen faktörleri açık biçimde görün.",
      },
    ],
  },
  ozellikler: {
    baslik: "Yalnızca bir sonuç değil, nedenleri de",
    liste: [
      {
        baslik: "Açıklanabilir sonuç",
        aciklama: "Her tahminde, sonucu hangi bilgilerin ne yönde etkilediğini görürsünüz.",
      },
      {
        baslik: "Dürüst olasılıklar",
        aciklama: "Model kalibrasyonu test edildi: %70 dediğinde gerçekten de yaklaşık %70.",
      },
      {
        baslik: "Size özel geçmiş",
        aciklama:
          "Değerlendirmeleriniz hesabınıza kaydedilir; yalnızca siz görür, dilediğinizde silersiniz.",
      },
      {
        baslik: "Şeffaf model",
        aciklama:
          "Modelin nasıl eğitildiği, başarımı ve sınırları model kartında açıkça yazıyor.",
      },
    ],
  },
  ornek: {
    baslik: "Örnek bir sonuç",
    aciklama: "Gerçek bir değerlendirme ekranı böyle görünür.",
  },
  sss: {
    baslik: "Sık sorulan sorular",
    sorular: [
      {
        soru: "Bu gerçek bir kredi başvurusu mu?",
        cevap:
          "Hayır. Bu araç yalnızca bir ön değerlendirme sunar; herhangi bir bankaya başvuru yapılmaz ve sonuç bir banka kararı değildir.",
      },
      {
        soru: "Sonuçlar Türkiye'deki bankalar için geçerli mi?",
        cevap:
          "Hayır. Model açık bir veri setiyle eğitilmiştir ve Türkiye'deki bankaların ölçütlerini yansıtmaz. Tutarlar ABD doları, kredi skoru 390–850 ölçeğindedir.",
      },
      {
        soru: "Faktörler neden bazen sezgiye ters görünüyor?",
        cevap:
          "Model yalnızca eğitildiği veri setindeki örüntüleri öğrenir. Bu veri setinde bazı ilişkiler gerçek kredi kararlarından beklenenin tersidir; örneğin daha düşük gelir, onay olasılığını artırabilir. Ayrıntılar model kartında.",
      },
      {
        soru: "Hangi bilgilerimi saklıyorsunuz?",
        cevap:
          "Yalnızca e-posta adresinizi ve değerlendirme formuna girdiğiniz bilgileri. Ad-soyad, kimlik numarası ya da iletişim bilgisi istemiyoruz. Tüm kayıtlarınızı hesap sayfanızdan silebilirsiniz.",
      },
      {
        soru: "Cinsiyet sonucu etkiliyor mu?",
        cevap:
          "Hayır. Cinsiyet bilgisi sorulmaz ve modele girmez. Ayrıca modelin kararları cinsiyete göre denetlenmiş, belirgin bir fark bulunmamıştır.",
      },
    ],
  },
  son: {
    baslik: "Şansınızı görmeye hazır mısınız?",
    aciklama: "Ücretsiz hesap oluşturun, ilk değerlendirmenizi bir dakikada yapın.",
  },
} as const;

export const MODEL_KARTI = {
  baslik: "Model kartı",
  altBaslik: "Modelin nasıl eğitildiği, ne kadar başarılı olduğu ve nerede yanılabileceği.",
  ozet: {
    baslik: "Özet",
    surum: "Model sürümü",
    algoritma: "Algoritma",
    egitim: "Eğitim tarihi",
    veri: "Eğitim kaydı",
    esik: "Karar eşiği",
  },
  nasil: {
    baslik: "Nasıl eğitildi?",
    paragraflar: [
      "Model, Kaggle'da Apache 2.0 lisansıyla yayımlanan 45.000 kayıtlık açık ve sentetik bir kredi veri setiyle eğitildi. Yaşı ya da iş tecrübesi gerçek dışı olan 10 kayıt çıkarıldı.",
      "Veri %70 eğitim, %15 doğrulama ve %15 test olarak bölündü. Test seti yalnızca en sonda, bir kez kullanıldı. Algoritma olarak XGBoost seçildi; Logistic Regression, Random Forest ve LightGBM ile karşılaştırıldı.",
      "Karar eşiği 0,5 varsayılmadı; doğrulama setinde F1 skorunu en yükselten değer seçildi.",
    ],
  },
  metrikler: {
    baslik: "Başarım (test seti)",
    aciklama:
      "Veri setinde geçmiş temerrüt kaydı olan başvuruların tamamı reddedilmiştir; bu kolay grup genel metrikleri şişirir. Modelin gerçek ayırt etme gücünü, temerrüt kaydı olmayanlardaki sonuçlar gösterir.",
    sutunlar: { metrik: "Metrik", genel: "Tüm başvurular", altGrup: "Temerrüt kaydı olmayanlar" },
    satirlar: {
      roc_auc: "ROC-AUC",
      pr_auc: "PR-AUC",
      f1: "F1",
      precision: "Kesinlik (precision)",
      recall: "Duyarlılık (recall)",
      brier: "Brier skoru (düşük = iyi)",
      n: "Kayıt sayısı",
    },
  },
  sinirlar: {
    baslik: "Sınırlamalar",
    liste: [
      "Sonuç bir ön değerlendirmedir; gerçek bir kredi başvurusu ya da banka kararı değildir.",
      "Veri seti sentetiktir ve Türkiye'deki bankaların ölçütlerini yansıtmaz. Tutarlar ABD doları, kredi skoru 390–850 ölçeğindedir.",
      "Bazı ilişkiler gerçek kredi kararlarından beklenenin tersidir: veri setinde faiz oranı ve kredi/gelir oranı arttıkça, gelir azaldıkça onay oranı artar. Model bu örüntüleri aynen öğrenmiştir; faktör açıklamaları bu yüzden sezgiye ters görünebilir.",
      "Veri genç profile ağırlıklıdır (yaşların %99'u 48 ve altı). Bu aralığın dışındaki profillerde tahminler daha az güvenilirdir; böyle durumlarda arayüz uyarı gösterir.",
      "Geçmiş temerrüt kaydı olan her başvuru, diğer bilgilerden bağımsız olarak ret tahmini alır.",
    ],
  },
  adalet: {
    baslik: "Adalet denetimi",
    paragraflar: [
      "Cinsiyet modele girmez ve kullanıcıdan istenmez. Yine de diğer bilgiler üzerinden dolaylı bir etki olabileceği için, modelin test setindeki kararları cinsiyete göre karşılaştırıldı.",
      "Kadın ve erkek başvuruların tahmini onay oranları arasındaki oran 0,956'dır (0,80'in altı genellikle sorun işareti sayılır). Temerrüt kaydı olmayanlarda doğru onaylama oranı farkı 0,4 puan, yanlış onaylama oranı farkı 0,8 puandır. Belirgin bir dolaylı etki gözlenmemiştir.",
    ],
  },
  girdiler: {
    baslik: "Modelin kullandığı bilgiler",
    aciklama:
      "Model 12 özellik kullanır: formdaki 11 alan ve bunlardan hesaplanan kredi/gelir oranı.",
    haric: "Kullanılmayan bilgi: cinsiyet.",
  },
  yuklenemedi: "Güncel model bilgileri yüklenemedi.",
} as const;

export const YASAL = {
  taslak: "Bu metin taslaktır. Yayına almadan önce bir hukukçu tarafından gözden geçirilmelidir.",
  guncelleme: "Son güncelleme: 10 Kasım 2026",
  gizlilik: {
    baslik: "Gizlilik politikası ve KVKK aydınlatma metni",
    bolumler: [
      {
        baslik: "Hangi verileri topluyoruz?",
        paragraflar: [
          "Hesap oluştururken e-posta adresinizi ve şifrenizi alırız; şifreniz yalnızca geri döndürülemez biçimde saklanır.",
          "Değerlendirme yaptığınızda forma girdiğiniz bilgileri (yaş, eğitim, gelir, iş tecrübesi, konut durumu, kredi tutarı, amacı, faiz oranı, kredi geçmişi süresi, kredi skoru, geçmiş temerrüt kaydı) ve modelin ürettiği sonucu saklarız.",
          "Ad-soyad, kimlik numarası, telefon ya da adres bilgisi istemeyiz. Cinsiyet bilgisi toplanmaz.",
        ],
      },
      {
        baslik: "Verilerinizi neden işliyoruz?",
        paragraflar: [
          "Yalnızca size ön değerlendirme sonucunu göstermek ve geçmiş değerlendirmelerinizi hesabınızda sunmak için. Verileriniz reklam, profilleme ya da üçüncü taraflara satış amacıyla kullanılmaz.",
        ],
      },
      {
        baslik: "Verileriniz nerede saklanıyor?",
        paragraflar: [
          "Hesap ve değerlendirme verileri Avrupa Birliği'ndeki (Frankfurt) sunucularda, Supabase altyapısında saklanır. Her kullanıcı yalnızca kendi kayıtlarına erişebilir.",
        ],
      },
      {
        baslik: "Haklarınız",
        paragraflar: [
          "Değerlendirmelerinizi tek tek ya da topluca, hesap sayfanızdan dilediğiniz an silebilirsiniz. Hesabınızın tamamen silinmesini talep edebilirsiniz.",
          "6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 11. maddesi uyarınca verilerinize erişme, düzeltilmesini ya da silinmesini isteme haklarına sahipsiniz.",
        ],
      },
      {
        baslik: "Çerezler",
        paragraflar: [
          "Yalnızca oturumunuzu açık tutmak için gerekli çerezleri ve tema tercihinizi saklamak için tarayıcı depolamasını kullanırız. İzleme ya da reklam çerezi kullanılmaz.",
        ],
      },
    ],
  },
  kosullar: {
    baslik: "Kullanım koşulları",
    bolumler: [
      {
        baslik: "Hizmetin niteliği",
        paragraflar: [
          "Bu araç, açık bir veri setiyle eğitilmiş bir makine öğrenmesi modelinin tahminini sunan bir ön değerlendirme aracıdır. Gerçek bir kredi başvurusu, kredi teklifi ya da banka kararı değildir.",
          "Sonuçlar finansal tavsiye niteliği taşımaz ve herhangi bir bankanın ya da finans kuruluşunun kararını öngörmez.",
        ],
      },
      {
        baslik: "Sorumluluk",
        paragraflar: [
          "Sonuçlara dayanarak aldığınız kararlar sizin sorumluluğunuzdadır. Hizmet olduğu gibi sunulur; sonuçların doğruluğu ya da belirli bir amaca uygunluğu konusunda garanti verilmez.",
        ],
      },
      {
        baslik: "Hesabınız",
        paragraflar: [
          "Hesabınızın güvenliğinden ve şifrenizin gizliliğinden siz sorumlusunuz. Hizmeti otomatik araçlarla aşırı yüklemek ya da kötüye kullanmak yasaktır.",
        ],
      },
      {
        baslik: "Değişiklikler",
        paragraflar: ["Bu koşullar güncellenebilir. Önemli değişiklikler bu sayfada duyurulur."],
      },
    ],
  },
} as const;
