# 🔐 Captcha Çözme Kurulum Rehberi

Bu rehber, Google Search Traffic Bot'a captcha çözme özelliğinin nasıl ekleneceğini açıklar.

## 📋 İçindekiler

1. [2Captcha Hesabı Oluşturma](#1-2captcha-hesabı-oluşturma)
2. [API Key Alma](#2-api-key-alma)
3. [Bot Yapılandırması](#3-bot-yapılandırması)
4. [Desteklenen Captcha Tipleri](#4-desteklenen-captcha-tipleri)
5. [Kullanım](#5-kullanım)
6. [Fiyatlandırma](#6-fiyatlandırma)
7. [Sorun Giderme](#7-sorun-giderme)

## 1. 2Captcha Hesabı Oluşturma

### Adım 1: Kayıt Ol
1. [2Captcha web sitesine](https://2captcha.com/) git
2. Sağ üst köşedeki "Sign Up" butonuna tıkla
3. Email ve şifre ile kayıt ol
4. Email adresini doğrula

### Adım 2: Bakiye Yükle
1. Hesabına giriş yap
2. Sol menüden "Add Funds" seçeneğine tıkla
3. Ödeme yöntemini seç (PayPal, Bitcoin, Visa, Mastercard, vb.)
4. Minimum $3 yükle (başlangıç için yeterli)

## 2. API Key Alma

### API Key'i Bul
1. 2Captcha hesabına giriş yap
2. Sol menüden "Settings" > "API Keys" seçeneğine git
3. API Key'ini kopyala (örnek: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### API Key'i Güvende Tut
⚠️ **Önemli:** API key'inizi kimseyle paylaşmayın ve public repository'lere yüklemeyin!

## 3. Bot Yapılandırması

### config.json Dosyasını Düzenle

`config.json` dosyasını açın ve captcha bölümünü düzenleyin:

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
  "executablePath": "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "minScrolls": 2,
  "maxScrolls": 5,
  "minWaitTime": 2000,
  "maxWaitTime": 5000,
  "clickProbability": 0.7,
  "userAgentType": "random",
  "captcha": {
    "enabled": true,
    "apiKey": "YOUR_2CAPTCHA_API_KEY_HERE",
    "service": "2captcha",
    "autoSolve": true,
    "maxRetries": 3
  }
}
```

### Ayarlar Açıklaması

| Ayar | Açıklama | Varsayılan |
|------|----------|-----------|
| `enabled` | Captcha çözme özelliğini aktif/pasif yapar | `true` |
| `apiKey` | 2Captcha API key'iniz | `""` |
| `service` | Captcha çözme servisi (şu an sadece 2captcha) | `"2captcha"` |
| `autoSolve` | Captcha'ları otomatik çöz | `true` |
| `maxRetries` | Başarısız olursa kaç kez tekrar dene | `3` |

## 4. Desteklenen Captcha Tipleri

### ✅ reCAPTCHA v2
- Google'ın en yaygın captcha'sı
- "I'm not a robot" checkbox'ı
- Çözüm süresi: ~15-30 saniye
- Maliyet: $2.99 / 1000 captcha

### ✅ reCAPTCHA v3
- Görünmez captcha
- Kullanıcı etkileşimi gerektirmez
- Çözüm süresi: ~15-30 saniye
- Maliyet: $2.99 / 1000 captcha

### ✅ hCaptcha
- reCAPTCHA alternatifi
- Görsel tanıma tabanlı
- Çözüm süresi: ~15-30 saniye
- Maliyet: $2.99 / 1000 captcha

## 5. Kullanım

### Otomatik Captcha Çözme

Bot çalıştırıldığında otomatik olarak:

1. ✅ Sayfada captcha olup olmadığını kontrol eder
2. ✅ Captcha tipini algılar (reCAPTCHA v2/v3, hCaptcha)
3. ✅ 2Captcha API'sine gönderir
4. ✅ Çözümü bekler (~15-30 saniye)
5. ✅ Çözümü sayfaya enjekte eder
6. ✅ Formu otomatik submit eder

### Manuel Kontrol

Captcha çözme özelliğini geçici olarak kapatmak için:

```json
{
  "captcha": {
    "enabled": false
  }
}
```

### Bakiye Kontrolü

Bot başlatıldığında otomatik olarak 2Captcha bakiyenizi gösterir:

```
[THREAD-1] 2Captcha bakiye: $15.43
```

Düşük bakiye uyarısı:
```
[THREAD-1] ⚠️ Düşük bakiye! Lütfen 2Captcha hesabınıza bakiye yükleyin.
```

## 6. Fiyatlandırma

### 2Captcha Fiyatları

| Captcha Tipi | Fiyat (1000 adet) | Çözüm Süresi |
|--------------|-------------------|--------------|
| reCAPTCHA v2 | $2.99 | 15-30 saniye |
| reCAPTCHA v3 | $2.99 | 15-30 saniye |
| hCaptcha | $2.99 | 15-30 saniye |
| Normal Captcha | $0.50 | 5-10 saniye |

### Maliyet Hesaplama

**Örnek Senaryo:**
- 100 thread
- Her thread 1 captcha ile karşılaşıyor
- Toplam: 100 captcha

**Maliyet:**
```
100 captcha × ($2.99 / 1000) = $0.30
```

### Tasarruf İpuçları

1. **Cookie Kullanın**: Gmail cookie'leri captcha'ları azaltır
2. **Proxy Rotasyonu**: Farklı IP'ler captcha riskini düşürür
3. **Zamana Yayma**: Ani trafik artışları captcha tetikler
4. **Headless Mode**: Daha az captcha ile karşılaşırsınız

## 7. Sorun Giderme

### ❌ "API Key geçersiz" Hatası

**Çözüm:**
1. API key'i doğru kopyaladığınızdan emin olun
2. Boşluk veya özel karakter olmadığını kontrol edin
3. 2Captcha hesabınızın aktif olduğunu doğrulayın

### ❌ "Yetersiz bakiye" Hatası

**Çözüm:**
1. 2Captcha hesabınıza giriş yapın
2. "Add Funds" ile bakiye yükleyin
3. Minimum $3 yüklemeniz önerilir

### ❌ "Captcha çözme zaman aşımı" Hatası

**Çözüm:**
1. İnternet bağlantınızı kontrol edin
2. 2Captcha servisinin çalıştığını doğrulayın
3. `maxRetries` değerini artırın

### ❌ Captcha Algılanmıyor

**Çözüm:**
1. Sayfanın tam yüklendiğinden emin olun
2. `headless: false` ile test edin
3. Console loglarını kontrol edin

### ⚠️ Yüksek Maliyet

**Çözüm:**
1. Cookie kullanımını artırın
2. Thread sayısını azaltın
3. `autoSolve: false` yapıp manuel kontrol edin

## 📊 İstatistikler ve Takip

### Konsol Çıktısı

Bot çalışırken şu bilgileri gösterir:

```
[THREAD-1] 2Captcha bakiye: $15.43
[THREAD-1] 🔐 reCAPTCHA v2 çözülüyor...
[THREAD-1] 📝 Captcha ID: 12345678
[THREAD-1] ⏳ Bekleniyor... (1/40)
[THREAD-1] ⏳ Bekleniyor... (2/40)
[THREAD-1] ✅ reCAPTCHA v2 çözüldü!
[THREAD-1] ✅ Captcha başarıyla çözüldü ve enjekte edildi
```

### Başarı Oranı

Tipik başarı oranları:
- reCAPTCHA v2: %95-98%
- reCAPTCHA v3: %95-98%
- hCaptcha: %90-95%

## 🔗 Faydalı Linkler

- [2Captcha Resmi Sitesi](https://2captcha.com/)
- [2Captcha API Dokümantasyonu](https://2captcha.com/2captcha-api)
- [2Captcha Fiyatlandırma](https://2captcha.com/pricing)
- [2Captcha Destek](https://2captcha.com/support)

## 💡 İpuçları

1. **Test Modu**: İlk kullanımda az thread ile test edin
2. **Bakiye Takibi**: Düzenli olarak bakiyenizi kontrol edin
3. **Log Kayıtları**: Hata durumlarında logları inceleyin
4. **Proxy Kalitesi**: Kaliteli proxy'ler captcha'yı azaltır
5. **Cookie Güncelliği**: Güncel cookie'ler daha az captcha demektir

## 🆘 Destek

Sorun yaşarsanız:
1. Bu dokümantasyonu tekrar okuyun
2. Console loglarını kontrol edin
3. 2Captcha destek ekibiyle iletişime geçin
4. GitHub'da issue açın

---

**Not:** Captcha çözme servisleri, yasal ve etik kullanım için tasarlanmıştır. Lütfen hizmet şartlarına uygun kullanın.
