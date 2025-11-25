/**
 * Captcha Solver - 2Captcha API entegrasyonu
 * reCAPTCHA v2, v3 ve hCaptcha desteği
 */

const https = require('https');

class CaptchaSolver {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = '2captcha.com';
  }

  /**
   * HTTP GET isteği
   */
  async httpGet(path) {
    return new Promise((resolve, reject) => {
      https.get(`https://${this.baseUrl}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * reCAPTCHA v2 çöz
   */
  async solveRecaptchaV2(siteKey, pageUrl) {
    try {
      console.log('🔐 reCAPTCHA v2 çözülüyor...');

      // Captcha gönder
      const submitPath = `/in.php?key=${this.apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;
      const submitResult = await this.httpGet(submitPath);

      if (submitResult.status !== 1) {
        throw new Error(`Captcha gönderme hatası: ${submitResult.request || 'Bilinmeyen hata'}`);
      }

      const captchaId = submitResult.request;
      console.log(`📝 Captcha ID: ${captchaId}`);

      // Sonucu bekle (max 120 saniye)
      const maxAttempts = 40;
      const delayMs = 3000;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        const resultPath = `/res.php?key=${this.apiKey}&action=get&id=${captchaId}&json=1`;
        const result = await this.httpGet(resultPath);

        if (result.status === 1) {
          console.log('✅ reCAPTCHA v2 çözüldü!');
          return result.request;
        }

        if (result.request !== 'CAPCHA_NOT_READY') {
          throw new Error(`Captcha çözme hatası: ${result.request}`);
        }

        console.log(`⏳ Bekleniyor... (${i + 1}/${maxAttempts})`);
      }

      throw new Error('Captcha çözme zaman aşımı');
    } catch (error) {
      console.error('❌ Captcha çözme hatası:', error.message);
      throw error;
    }
  }

  /**
   * reCAPTCHA v3 çöz
   */
  async solveRecaptchaV3(siteKey, pageUrl, action = 'verify', minScore = 0.3) {
    try {
      console.log('🔐 reCAPTCHA v3 çözülüyor...');

      const submitPath = `/in.php?key=${this.apiKey}&method=userrecaptcha&version=v3&googlekey=${siteKey}&pageurl=${encodeURIComponent(pageUrl)}&action=${action}&min_score=${minScore}&json=1`;
      const submitResult = await this.httpGet(submitPath);

      if (submitResult.status !== 1) {
        throw new Error(`Captcha gönderme hatası: ${submitResult.request}`);
      }

      const captchaId = submitResult.request;
      console.log(`📝 Captcha ID: ${captchaId}`);

      const maxAttempts = 40;
      const delayMs = 3000;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        const resultPath = `/res.php?key=${this.apiKey}&action=get&id=${captchaId}&json=1`;
        const result = await this.httpGet(resultPath);

        if (result.status === 1) {
          console.log('✅ reCAPTCHA v3 çözüldü!');
          return result.request;
        }

        if (result.request !== 'CAPCHA_NOT_READY') {
          throw new Error(`Captcha çözme hatası: ${result.request}`);
        }

        console.log(`⏳ Bekleniyor... (${i + 1}/${maxAttempts})`);
      }

      throw new Error('Captcha çözme zaman aşımı');
    } catch (error) {
      console.error('❌ Captcha çözme hatası:', error.message);
      throw error;
    }
  }

  /**
   * hCaptcha çöz
   */
  async solveHCaptcha(siteKey, pageUrl) {
    try {
      console.log('🔐 hCaptcha çözülüyor...');

      const submitPath = `/in.php?key=${this.apiKey}&method=hcaptcha&sitekey=${siteKey}&pageurl=${encodeURIComponent(pageUrl)}&json=1`;
      const submitResult = await this.httpGet(submitPath);

      if (submitResult.status !== 1) {
        throw new Error(`Captcha gönderme hatası: ${submitResult.request}`);
      }

      const captchaId = submitResult.request;
      console.log(`📝 Captcha ID: ${captchaId}`);

      const maxAttempts = 40;
      const delayMs = 3000;

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs));

        const resultPath = `/res.php?key=${this.apiKey}&action=get&id=${captchaId}&json=1`;
        const result = await this.httpGet(resultPath);

        if (result.status === 1) {
          console.log('✅ hCaptcha çözüldü!');
          return result.request;
        }

        if (result.request !== 'CAPCHA_NOT_READY') {
          throw new Error(`Captcha çözme hatası: ${result.request}`);
        }

        console.log(`⏳ Bekleniyor... (${i + 1}/${maxAttempts})`);
      }

      throw new Error('Captcha çözme zaman aşımı');
    } catch (error) {
      console.error('❌ Captcha çözme hatası:', error.message);
      throw error;
    }
  }

  /**
   * Bakiye sorgula
   */
  async getBalance() {
    try {
      const path = `/res.php?key=${this.apiKey}&action=getbalance&json=1`;
      const result = await this.httpGet(path);

      if (result.status === 1) {
        return parseFloat(result.request);
      }

      throw new Error('Bakiye sorgulanamadı');
    } catch (error) {
      console.error('❌ Bakiye sorgulama hatası:', error.message);
      throw error;
    }
  }

  /**
   * Otomatik captcha tipi algılama ve çözme
   */
  async solveCaptcha(page, pageUrl) {
    try {
      // Sayfada captcha var mı kontrol et
      const captchaInfo = await page.evaluate(() => {
        // reCAPTCHA v2
        const recaptchaV2 = document.querySelector('.g-recaptcha');
        if (recaptchaV2) {
          const siteKey = recaptchaV2.getAttribute('data-sitekey');
          return { type: 'recaptcha_v2', siteKey };
        }

        // reCAPTCHA v3
        const recaptchaV3Script = Array.from(document.querySelectorAll('script'))
          .find(s => s.src && s.src.includes('recaptcha') && s.src.includes('render='));
        if (recaptchaV3Script) {
          const match = recaptchaV3Script.src.match(/render=([^&]+)/);
          if (match) {
            return { type: 'recaptcha_v3', siteKey: match[1] };
          }
        }

        // hCaptcha
        const hcaptcha = document.querySelector('.h-captcha');
        if (hcaptcha) {
          const siteKey = hcaptcha.getAttribute('data-sitekey');
          return { type: 'hcaptcha', siteKey };
        }

        return null;
      });

      if (!captchaInfo) {
        console.log('ℹ️ Captcha bulunamadı');
        return null;
      }

      console.log(`🎯 Captcha tipi algılandı: ${captchaInfo.type}`);
      console.log(`🔑 Site Key: ${captchaInfo.siteKey}`);

      let token;

      switch (captchaInfo.type) {
        case 'recaptcha_v2':
          token = await this.solveRecaptchaV2(captchaInfo.siteKey, pageUrl);
          break;
        case 'recaptcha_v3':
          token = await this.solveRecaptchaV3(captchaInfo.siteKey, pageUrl);
          break;
        case 'hcaptcha':
          token = await this.solveHCaptcha(captchaInfo.siteKey, pageUrl);
          break;
        default:
          throw new Error(`Desteklenmeyen captcha tipi: ${captchaInfo.type}`);
      }

      // Token'ı sayfaya enjekte et
      await page.evaluate((token, type) => {
        if (type === 'recaptcha_v2' || type === 'recaptcha_v3') {
          const textarea = document.getElementById('g-recaptcha-response');
          if (textarea) {
            textarea.innerHTML = token;
            textarea.value = token;
          }
          // Callback'i tetikle
          if (typeof grecaptcha !== 'undefined') {
            grecaptcha.getResponse = () => token;
          }
        } else if (type === 'hcaptcha') {
          const textarea = document.querySelector('[name="h-captcha-response"]');
          if (textarea) {
            textarea.innerHTML = token;
            textarea.value = token;
          }
        }
      }, token, captchaInfo.type);

      console.log('✅ Captcha token enjekte edildi');
      return token;

    } catch (error) {
      console.error('❌ Captcha çözme hatası:', error.message);
      return null;
    }
  }
}

module.exports = { CaptchaSolver };
