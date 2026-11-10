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
