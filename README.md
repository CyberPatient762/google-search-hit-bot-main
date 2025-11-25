# google-Search-Hit-bot-Capcha
Google Search Hit Bot Capcha Solver-Proxies-Cookies
# 🔥 Google Search Traffic Bot Capcha Resolver Eklendi

Bu proje, **Node.js + Puppeteer-real-browser** kullanarak çoklu thread desteğiyle Google'da arama yapan, belirlenen domainleri bulan ve tıklayan gelişmiş bir bot'tur.

## ⚠️ Önemli Uyarı

Bu proje **yalnızca eğitim ve test amaçlıdır**. Kendi web sitelerinizde test etmek ve tarayıcı otomasyonunu öğrenmek için tasarlanmıştır. Google'ın hizmet şartlarını ihlal eden kullanımlardan doğacak sorumluluk tamamen kullanıcıya aittir.

## ✨ Özellikler

### 🎯 Temel Özellikler
- ✅ Google'da keyword bazlı arama yapma
- ✅ Belirtilen domainleri bulma ve tıklama
- ✅ Sayfa içinde insan benzeri gezinme (scroll, link tıklama)
- ✅ Çoklu sayfa tarama desteği (mobil + desktop buton desteği)
- ✅ Yapılandırılabilir gezinme süresi ve tıklama sayısı

### 🔐 Captcha Çözme (YENİ!)
- ✅ **Otomatik captcha algılama ve çözme**
- ✅ **reCAPTCHA v2 desteği**
- ✅ **reCAPTCHA v3 desteği**
- ✅ **hCaptcha desteği**
- ✅ **2Captcha API entegrasyonu**
- ✅ **Bakiye takibi ve uyarılar**
- ✅ **Otomatik token enjeksiyonu**

### 🌐 Proxy & Cookie Desteği
- ✅ Proxy desteği (`hostname:port:user:pass` veya `hostname:port` formatı)
- ✅ Cookie yönetimi (`.json` ve `.txt` formatları desteklenir)
- ✅ Her cookie bir kez kullanılır, tekrar kullanılmaz
- ✅ Cookie havuzu bitince otomatik sıfırlama

### 📱 Cihaz Simülasyonu
- ✅ Gerçekçi User-Agent rotasyonu
- ✅ Mobil, tablet ve desktop cihaz simülasyonu
- ✅ Cihaz tipine uygun viewport ayarları
- ✅ Ağırlıklı rastgele cihaz seçimi (%50 mobil, %20 tablet, %30 desktop)

### 🔀 Thread Yönetimi
- ✅ Çoklu thread ile paralel çalışma
- ✅ Thread'leri zamana yayma özelliği (örn: 10 thread'i 6 saate yay)
- ✅ Anlık ilerleme takibi (başarılı/başarısız/toplam)
- ✅ Renkli konsol çıktıları (chalk ile)

### 🤖 İnsan Benzeri Davranışlar
- ✅ Rastgele scroll hareketleri
- ✅ Rastgele bekleme süreleri
- ✅ İç link tıklama olasılığı
- ✅ Sayfa içinde gezinme simülasyonu
- ✅ Bot detection bypass (puppeteer-real-browser)

## 📦 Kurulum

### 1. Projeyi İndir

```bash
git clone https://github.com/JudexCoder/google-search-hit-bot-capcha.git
cd google-search-hit-bot-capcha
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

Gerekli paketler:
- `puppeteer-real-browser` - Bot detection bypass ile gerçek tarayıcı simülasyonu
- `chalk` - Renkli konsol çıktıları

### 3. Chrome Yolunu Ayarla

`config.json` dosyasını açın ve `executablePath` değerini kendi Chrome yolunuzla değiştirin:

**Windows:**
```json
"executablePath": "C:/Program Files/Google/Chrome/Application/chrome.exe"
```

**macOS:**
```json
"executablePath": "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

**Linux:**
```json
"executablePath": "/usr/bin/google-chrome"
```

### 4. Captcha Çözme Kurulumu (Opsiyonel)

Captcha çözme özelliğini kullanmak için:

1. [2Captcha](https://2captcha.com/) hesabı oluşturun
2. API key'inizi alın
3. `config.json` dosyasındaki `captcha.apiKey` değerini güncelleyin

Detaylı kurulum için [CAPTCHA_SETUP.md](CAPTCHA_SETUP.md) dosyasına bakın.

## ⚙️ Yapılandırma

### config.json

```json
{
  "domains": ["example.com"],
  "maxPages": 5,
  "keywordsFile": "keywords.txt",
  "cookiesFolder": "cookies",
  "proxiesFile": "proxies.txt",
  "headless": false,
  "threads": 10,
  "browseTime": 60000,
  "maxClicks": 3,
  "spreadThreads": true,
  "timeFrameHours": 6,
  "executablePath": "...",
  "minScrolls": 2,
  "maxScrolls": 5,
  "minWaitTime": 2000,
  "maxWaitTime": 5000,
  "clickProbability": 0.7,
  "userAgentType": "random",
  "captcha": {
    "enabled": true,
    "apiKey": "YOUR_2CAPTCHA_API_KEY",
    "service": "2captcha",
    "autoSolve": true,
    "maxRetries": 3
  }
}
```

### Captcha Ayarları

| Ayar | Açıklama | Varsayılan |
|------|----------|-----------|
| `enabled` | Captcha çözme özelliğini aktif/pasif yapar | `true` |
| `apiKey` | 2Captcha API key'iniz | `""` |
| `service` | Captcha çözme servisi | `"2captcha"` |
| `autoSolve` | Captcha'ları otomatik çöz | `true` |
| `maxRetries` | Başarısız olursa kaç kez tekrar dene | `3` |

### keywords.txt

Her satıra bir arama kelimesi yazın:

```
örnek keyword 1
örnek keyword 2
örnek keyword 3
```

### proxies.txt

Proxy'leri şu formatlarda ekleyin:

```
host:port:user:pass
host:port
```

### cookies/ Klasörü

Cookie dosyalarını bu klasöre ekleyin. Desteklenen formatlar: `.json` ve `.txt`

## 🚀 Kullanım

### Temel Kullanım

```bash
npm start
```

veya

```bash
node app.js
```

### Captcha ile Kullanım

1. `config.json` dosyasında captcha ayarlarını yapılandırın
2. 2Captcha API key'inizi girin
3. Bot'u normal şekilde çalıştırın

Bot otomatik olarak:
- ✅ Captcha'ları algılar
- ✅ 2Captcha'ya gönderir
- ✅ Çözümü bekler
- ✅ Token'ı sayfaya enjekte eder
- ✅ Formu submit eder

## 📊 Konsol Çıktısı Örneği

```
🚀 Google Search Traffic Bot Başlatılıyor...

📋 Yapılandırma:
   • Hedef domain(ler): example.com
   • Thread sayısı: 10
   • Keyword sayısı: 5
   • Proxy sayısı: 3
   • Cookie sayısı: 10
   • Headless: Hayır
   • Zamana yayma: Evet (6 saat)

========== THREAD-1 ==========

[THREAD-1] 2Captcha bakiye: $15.43
[THREAD-1] Cihaz tipi: mobile
[THREAD-1] Proxy kullanılıyor: proxy1.example.com:8080
[THREAD-1] Cookie yüklendi: cookie1.json
[THREAD-1] Arama yapılıyor: örnek keyword
[THREAD-1] Captcha kontrolü yapılıyor...
[THREAD-1] 🔐 reCAPTCHA v2 çözülüyor...
[THREAD-1] 📝 Captcha ID: 12345678
[THREAD-1] ⏳ Bekleniyor... (5/40)
[THREAD-1] ✅ reCAPTCHA v2 çözüldü!
[THREAD-1] ✅ Captcha başarıyla çözüldü ve enjekte edildi
[THREAD-1] Sayfa 1 taranıyor...
[THREAD-1] BULUNDU! Tıklanıyor: https://example.com/page
[THREAD-1] İç link tıklanıyor: https://example.com/about
[THREAD-1] Gezinme tamamlandı, kapatılıyor.

=== İlerleme: 1 başarılı / 0 başarısız / 1 başlatıldı ===
```

## 🔐 Captcha Çözme Detayları

### Desteklenen Captcha Tipleri

| Tip | Destek | Çözüm Süresi | Maliyet (1000 adet) |
|-----|--------|--------------|---------------------|
| reCAPTCHA v2 | ✅ | 15-30 saniye | $2.99 |
| reCAPTCHA v3 | ✅ | 15-30 saniye | $2.99 |
| hCaptcha | ✅ | 15-30 saniye | $2.99 |

### Captcha Çözme Süreci

1. **Algılama**: Bot sayfada captcha olup olmadığını kontrol eder
2. **Tip Belirleme**: Captcha tipini otomatik algılar (v2, v3, hCaptcha)
3. **API Gönderimi**: 2Captcha API'sine captcha bilgilerini gönderir
4. **Bekleme**: Çözümün hazırlanmasını bekler (~15-30 saniye)
5. **Enjeksiyon**: Çözümü sayfaya otomatik enjekte eder
6. **Submit**: Formu otomatik submit eder

### Maliyet Hesaplama

**Örnek:**
- 100 thread
- Her thread 1 captcha ile karşılaşıyor
- Maliyet: 100 × ($2.99 / 1000) = **$0.30**

### Tasarruf İpuçları

1. ✅ **Cookie Kullanın**: Gmail cookie'leri captcha'ları %80 azaltır
2. ✅ **Proxy Rotasyonu**: Farklı IP'ler captcha riskini düşürür
3. ✅ **Zamana Yayma**: Ani trafik artışları captcha tetikler
4. ✅ **Headless Mode**: Daha az captcha ile karşılaşırsınız

## 🔧 Sorun Giderme

### Captcha İle İlgili

**❌ "API Key geçersiz" Hatası**
- API key'i doğru kopyaladığınızdan emin olun
- 2Captcha hesabınızın aktif olduğunu doğrulayın

**❌ "Yetersiz bakiye" Hatası**
- 2Captcha hesabınıza bakiye yükleyin
- Minimum $3 yüklemeniz önerilir

**❌ "Captcha çözme zaman aşımı"**
- İnternet bağlantınızı kontrol edin
- `maxRetries` değerini artırın

### Genel Sorunlar

**Chrome bulunamıyor hatası**
- `config.json` içindeki `executablePath` değerini kontrol edin

**Proxy bağlantı hatası**
- Proxy formatının doğru olduğundan emin olun

**Cookie yüklenmiyor**
- Cookie dosyalarının formatını kontrol edin

## 📝 Dosya Yapısı

```
google-search-traffic-bot/
├── app.js                 # Ana thread yöneticisi
├── runbrowser.js          # Tek bot davranışları
├── ua-generator.js        # User-Agent üreteci
├── captcha-solver.js      # Captcha çözme modülü (YENİ!)
├── config.json            # Yapılandırma dosyası
├── keywords.txt           # Anahtar kelimeler
├── proxies.txt            # Proxy listesi
├── cookies/               # Cookie dosyaları klasörü
├── package.json
├── README.md
└── CAPTCHA_SETUP.md       # Captcha kurulum rehberi (YENİ!)
```

## 📈 Performans İpuçları

1. **Headless Mod**: Daha hızlı çalışma için `"headless": true`
2. **Thread Sayısı**: CPU ve RAM'inize göre ayarlayın (önerilen: 5-20)
3. **Proxy Kullanımı**: IP ban'ını önlemek için mutlaka proxy kullanın
4. **Cookie Rotasyonu**: Farklı hesaplar için farklı cookie'ler kullanın
5. **Zamana Yayma**: Doğal görünmek için thread'leri zamana yayın
6. **Captcha Optimizasyonu**: Cookie ve proxy kullanarak captcha'ları azaltın

## 🎯 Gelişmiş Özellikler

### Sadece Captcha Çözme Modu

Sadece captcha çözmek için (test amaçlı):

```json
{
  "threads": 1,
  "captcha": {
    "enabled": true,
    "autoSolve": true
  }
}
```

### Captcha Olmadan Çalışma

Captcha çözme özelliğini kapatmak için:

```json
{
  "captcha": {
    "enabled": false
  }
}
```


## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için lütfen önce bir issue açın.

## 🔗 Faydalı Linkler

- [2Captcha Resmi Sitesi](https://2captcha.com/)
- [2Captcha API Dokümantasyonu](https://2captcha.com/2captcha-api)
- [Puppeteer Real Browser](https://www.npmjs.com/package/puppeteer-real-browser)

---

**Not:** Bu bot eğitim amaçlıdır. Gerçek kullanımda yasal düzenlemelere ve platform kurallarına uyun. Captcha çözme servisleri, yasal ve etik kullanım için tasarlanmıştır.
