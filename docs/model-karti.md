# Model kartı — v1.0.0

Canlı sürümü [loan-approval-navy.vercel.app/model](https://loan-approval-navy.vercel.app/model) adresinde, metrikler API'den (`GET /api/v1/model`) okunarak gösterilir. Bu belge aynı bilgilerin ayrıntılı halidir. Ham sonuçlar `ml/reports/phase1/` altındadır; model paketi `backend/app/ml_artifacts/v1.0.0/` içindedir.

## Özet

| | |
|---|---|
| Görev | İkili sınıflandırma: kredi başvurusunun onay olasılığı |
| Algoritma | XGBoost (`XGBClassifier`), tek bir scikit-learn `Pipeline` içinde |
| Girdiler | 12 özellik: formdaki 11 alan + `loan_percent_income = round(loan_amnt / person_income, 2)` |
| Kullanılmayan | `person_gender` (yalnızca adalet denetiminde kullanılır) |
| Karar eşiği | 0,4609 (doğrulama setinde F1'i en yükselten değer; 0,5 varsayılmadı) |
| Kalibrasyon | Uygulanmadı (aşağıya bakın) |
| Eğitim verisi | 31.493 kayıt (temizlik sonrası 44.990 kaydın %70'i) |
| Veri özeti (SHA-256, ilk 16) | `67cca604cd71cbd6` |
| Yeniden üretim | `cd ml; uv run python src/train.py` |

## Veri

[Loan Approval Classification Dataset](https://www.kaggle.com/datasets/taweilo/loan-approval-classification-data) (Ta-wei Lo, Apache 2.0): 45.000 satır, eksik değer ve tekrar eden satır yok. Veri **sentetiktir**.

- **Temizlik:** yaşı 80'in üstünde ya da iş tecrübesi 60 yılın üstünde olan 10 kayıt çıkarıldı (yaş 144, tecrübe 125 gibi imkânsız değerler).
- **Bölme:** %70 eğitim / %15 doğrulama / %15 test, hedefe göre katmanlı, `random_state=42`. Test seti yalnızca en sonda, bir kez kullanıldı.
- **Hedef dengesi:** onay oranı %22,2. Accuracy bu yüzden ana metrik değildir.

### Kritik bulgu: geçmiş temerrüt kaydı

`previous_loan_defaults_on_file = Yes` olan 22.858 kaydın **tamamı** ret. Verinin yaklaşık yarısı tek bir kolonla kusursuz ayrışıyor; bu kolay grup genel metrikleri şişirir. Bu yüzden **tüm metrikler iki kapsamda raporlanır**: tüm başvurular ve yalnızca `No` alt grubu (22.135 kayıt, onay oranı %45,2). Modelin gerçek ayırt etme gücünü `No` alt grubu gösterir.

## Başarım (test seti)

| Metrik | Tüm başvurular | `previous_loan_defaults_on_file = No` |
|---|---|---|
| Kayıt sayısı | 6.749 | 3.331 |
| ROC-AUC | 0,978 | **0,938** |
| PR-AUC | 0,940 | 0,940 |
| F1 | 0,846 | 0,846 |
| Precision | 0,880 | 0,880 |
| Recall | 0,814 | 0,814 |
| Brier skoru (düşük = iyi) | 0,047 | 0,095 |

PR-AUC, F1, precision ve recall iki sütunda aynıdır çünkü tüm onaylar `No` alt grubundadır ve model temerrüt kaydı olan hiçbir başvuruyu onaylamaz; pozitif sınıfa ilişkin sayımlar değişmez. Fark yaratan metrikler ROC-AUC ve Brier'dır.

### Model karşılaştırması (aynı test seti)

Her modelin hiperparametreleri 5 katlı katmanlı CV ile (ROC-AUC) Optuna ile aranmış, eşikleri doğrulama setinde belirlenmiştir.

| Model | ROC-AUC (genel) | ROC-AUC (`No`) | F1 (genel) | Brier (`No`) |
|---|---|---|---|---|
| Logistic Regression (baseline) | 0,954 | 0,867 | 0,766 | 0,147 |
| Random Forest | 0,974 | 0,924 | 0,834 | 0,104 |
| LightGBM | 0,978 | 0,938 | 0,851 | 0,095 |
| **XGBoost (nihai)** | 0,978 | **0,938** | 0,846 | 0,095 |

LightGBM ile XGBoost arasındaki fark dördüncü ondalıktadır. Ana model olarak XGBoost, proje başında alınan karara uygun olarak korunmuştur.

## Kararlar

- **`scale_pos_weight` kullanılmadı.** Ağırlıklandırma doğrulama setinde PR-AUC'yi iyileştirmedi (`No` alt grubunda −0,0015) ve Brier skorunu kötüleştirdi (+0,013). Arayüz olasılık gösterdiği için kalibrasyon önceliklidir.
- **Kalibrasyon uygulanmadı.** Sigmoid ve isotonic kalibrasyon denendi; en iyisi (isotonic) Brier skorunu yalnızca %0,6 iyileştirdi ve kalibrasyon eğrisi zaten köşegene yakındı. Ek bir katman, `pred_contribs` katkılarının model çıktısıyla birebir tutarlılığını da bozacaktı.
- **Açıklama yöntemi:** XGBoost'un `pred_contribs` çıktısı. SHAP `TreeExplainer` ile aynı değerleri verir (en büyük fark 0), katkıların toplamı model çıktısına (log-odds) eşittir.

## Adalet denetimi

Cinsiyet modele girmez ve kullanıcıdan istenmez. Dolaylı etki olabileceği için test setinde kararlar cinsiyete göre karşılaştırıldı:

| | Kadın | Erkek | Fark (K − E) |
|---|---|---|---|
| Gerçek onay oranı | 0,215 | 0,228 | −0,013 |
| Tahmini onay oranı | 0,200 | 0,210 | −0,009 |
| TPR (`No` alt grubu) | 0,812 | 0,816 | −0,004 |
| FPR (`No` alt grubu) | 0,096 | 0,088 | +0,008 |

Tahmini onay oranları arasındaki oran (disparate impact) **0,956**'dır; 0,80'in altı genellikle sorun işareti sayılır. Belirgin bir dolaylı etki gözlenmemiştir. Gözlenen küçük fark, veri setindeki gerçek onay oranı farkıyla aynı yöndedir.

## Sınırlamalar

1. **Bir ön değerlendirmedir.** Gerçek bir kredi başvurusu ya da banka kararı değildir; Türkiye'deki bankaların ölçütlerini yansıtmaz. Tutarlar ABD doları, kredi skoru 390–850 ölçeğindedir (Findeks skoru ile aynı değildir).
2. **Etiketin yönü sezgiye ters.** Veri setinde `loan_status = 1` "onay" olarak belgelenmiştir, ancak özelliklerle ilişkisi temerrüt etiketi gibi davranır: faiz oranı ve kredi/gelir oranı arttıkça, gelir azaldıkça "onay" oranı artar; kiracılar ev sahiplerinden daha sık "onaylanır". Model bunu aynen öğrenmiştir. Bu yüzden faktör açıklamaları gerçek kredi mantığıyla çelişebilir (örneğin "geliriniz yüksek olduğu için olasılık düştü"). Etiket belgelendiği gibi kullanılmış ve sınırlama arayüzde ve model kartında açıkça belirtilmiştir.
3. **Veri genç profile ağırlıklıdır** (yaşların %99'u 48 ve altı; gelirin %99'u 271.000 USD ve altı). Eğitim verisinin p1–p99 aralığı dışındaki girdilerde API `low_confidence_fields` döndürür ve arayüz uyarı gösterir.
4. **Geçmiş temerrüt kaydı olan her başvuru** diğer bilgilerden bağımsız olarak ret tahmini alır; bu veri setindeki bir kuraldır, modelin öğrendiği bir ayrım değildir.
5. **Veri sentetiktir:** gerçek kişi ya da gerçek kredi sonuçları içermez; bu nedenle gerçek dünya başarımı hakkında bir kanıt sunmaz.

## Sürüm politikası

Model sürümü uygulama sürümünden bağımsızdır. Veri, temizlik, özellikler ya da hiperparametreler değiştiğinde `MODEL_VERSION` artırılır ve yeni bir `v<sürüm>/` klasörü üretilir; veri değişirse SHA-256 özeti de değişir.
