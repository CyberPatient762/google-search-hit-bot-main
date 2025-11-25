/**
 * Browser Runner - Tek bir bot instance'ının davranışlarını yönetir
 */

const { connect } = require('puppeteer-real-browser');
const fs = require('fs');
const path = require('path');
const { generateUserAgent } = require('./ua-generator');
const { CaptchaSolver } = require('./captcha-solver');

// Rastgele bekleme fonksiyonu
function randomWait(min, max) {
  return new Promise(resolve => {
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    setTimeout(resolve, time);
  });
}

// Rastgele scroll fonksiyonu
async function randomScroll(page, minScrolls, maxScrolls) {
  const scrollCount = Math.floor(Math.random() * (maxScrolls - minScrolls + 1)) + minScrolls;
  
  for (let i = 0; i < scrollCount; i++) {
    const scrollAmount = Math.floor(Math.random() * 500) + 300;
    await page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);
    await randomWait(1000, 3000);
  }
}

// Cookie yükleme fonksiyonu
async function loadCookies(page, cookieFile) {
  try {
    const cookieData = fs.readFileSync(cookieFile, 'utf-8');
    let cookies;

    if (cookieFile.endsWith('.json')) {
      cookies = JSON.parse(cookieData);
    } else if (cookieFile.endsWith('.txt')) {
      // Netscape cookie formatını parse et
      cookies = cookieData
        .split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const parts = line.split('\t');
          if (parts.length >= 7) {
            return {
              name: parts[5],
              value: parts[6],
              domain: parts[0],
              path: parts[2],
              expires: parseInt(parts[4]),
              httpOnly: parts[1] === 'TRUE',
              secure: parts[3] === 'TRUE'
            };
          }
          return null;
        })
        .filter(cookie => cookie !== null);
    }

    if (cookies && cookies.length > 0) {
      await page.setCookie(...cookies);
      return true;
    }
  } catch (error) {
    console.error(`Cookie yükleme hatası: ${error.message}`);
  }
  return false;
}

// Domain kontrolü
function isDomainMatch(url, domains) {
  try {
    const urlObj = new URL(url);
    return domains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

// Ana bot fonksiyonu
async function runBrowser(threadId, config, keyword, proxy = null, cookieFile = null) {
  let browser = null;
  let page = null;
  let captchaSolver = null;

  try {
    console.log(`\n========== THREAD-${threadId} ==========\n`);
    
    // Captcha solver'ı başlat
    if (config.captcha && config.captcha.enabled && config.captcha.apiKey && config.captcha.apiKey !== 'YOUR_2CAPTCHA_API_KEY') {
      captchaSolver = new CaptchaSolver(config.captcha.apiKey);
      
      // Bakiye kontrol et
      try {
        const balance = await captchaSolver.getBalance();
        console.log(`[THREAD-${threadId}] 2Captcha bakiye: $${balance.toFixed(2)}`);
        
        if (balance < 0.5) {
          console.warn(`[THREAD-${threadId}] ⚠️ Düşük bakiye! Lütfen 2Captcha hesabınıza bakiye yükleyin.`);
        }
      } catch (error) {
        console.warn(`[THREAD-${threadId}] ⚠️ Bakiye sorgulanamadı: ${error.message}`);
      }
    }
    
    // User-Agent ve viewport oluştur
    const { userAgent, viewport, deviceType } = generateUserAgent(config.userAgentType);
    console.log(`[THREAD-${threadId}] Cihaz tipi: ${deviceType}`);

    // Browser yapılandırması
    const browserConfig = {
      headless: config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        `--user-agent=${userAgent}`
      ],
      executablePath: config.executablePath,
      turnstile: true,
      connectOption: {
        defaultViewport: viewport
      }
    };

    // Proxy ekle
    if (proxy) {
      const proxyParts = proxy.split(':');
      if (proxyParts.length >= 2) {
        const proxyUrl = proxyParts.length === 4
          ? `http://${proxyParts[2]}:${proxyParts[3]}@${proxyParts[0]}:${proxyParts[1]}`
          : `http://${proxyParts[0]}:${proxyParts[1]}`;
        browserConfig.args.push(`--proxy-server=${proxyUrl}`);
        console.log(`[THREAD-${threadId}] Proxy kullanılıyor: ${proxyParts[0]}:${proxyParts[1]}`);
      }
    }

    // Browser'ı başlat
    const { browser: br, page: pg } = await connect(browserConfig);
    browser = br;
    page = pg;

    // Cookie yükle
    if (cookieFile && fs.existsSync(cookieFile)) {
      const loaded = await loadCookies(page, cookieFile);
      if (loaded) {
        console.log(`[THREAD-${threadId}] Cookie yüklendi: ${path.basename(cookieFile)}`);
      }
    }

    // Google'a git
    console.log(`[THREAD-${threadId}] Arama yapılıyor: ${keyword}`);
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
    await page.goto(googleUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await randomWait(2000, 4000);

    // Captcha kontrolü ve çözme
    if (captchaSolver && config.captcha.autoSolve) {
      console.log(`[THREAD-${threadId}] Captcha kontrolü yapılıyor...`);
      const captchaToken = await captchaSolver.solveCaptcha(page, googleUrl);
      
      if (captchaToken) {
        console.log(`[THREAD-${threadId}] ✅ Captcha başarıyla çözüldü ve enjekte edildi`);
        await randomWait(2000, 4000);
        
        // Formu submit et (varsa)
        try {
          await page.evaluate(() => {
            const form = document.querySelector('form');
            if (form) form.submit();
          });
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        } catch (error) {
          console.log(`[THREAD-${threadId}] Form submit edilemedi, devam ediliyor...`);
        }
      }
    }

    let foundAndClicked = false;
    let currentPage = 1;

    // Sayfa sayfa tara
    while (currentPage <= config.maxPages && !foundAndClicked) {
      console.log(`[THREAD-${threadId}] Sayfa ${currentPage} taranıyor...`);

      // Scroll yap
      await randomScroll(page, config.minScrolls, config.maxScrolls);

      // Linkleri bul
      const links = await page.evaluate(() => {
        const results = [];
        const elements = document.querySelectorAll('a[href]');
        elements.forEach(el => {
          const href = el.href;
          if (href && href.startsWith('http')) {
            results.push(href);
          }
        });
        return results;
      });

      // Domain eşleşmesi kontrol et
      for (const link of links) {
        if (isDomainMatch(link, config.domains)) {
          console.log(`[THREAD-${threadId}] BULUNDU! Tıklanıyor: ${link}`);
          
          try {
            await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });
            foundAndClicked = true;

            // Hedef sitede captcha kontrolü
            if (captchaSolver && config.captcha.autoSolve) {
              console.log(`[THREAD-${threadId}] Hedef sitede captcha kontrolü yapılıyor...`);
              const targetCaptchaToken = await captchaSolver.solveCaptcha(page, link);
              
              if (targetCaptchaToken) {
                console.log(`[THREAD-${threadId}] ✅ Hedef site captcha'sı çözüldü`);
                await randomWait(2000, 4000);
              }
            }

            // Site içinde gezin
            const browseEndTime = Date.now() + config.browseTime;
            let clickCount = 0;

            while (Date.now() < browseEndTime && clickCount < config.maxClicks) {
              await randomScroll(page, config.minScrolls, config.maxScrolls);
              await randomWait(config.minWaitTime, config.maxWaitTime);

              // Rastgele link tıklama
              if (Math.random() < config.clickProbability) {
                try {
                  const internalLinks = await page.evaluate((domain) => {
                    const links = [];
                    document.querySelectorAll('a[href]').forEach(el => {
                      const href = el.href;
                      if (href && href.includes(domain) && !href.includes('#')) {
                        links.push(href);
                      }
                    });
                    return links;
                  }, config.domains[0]);

                  if (internalLinks.length > 0) {
                    const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
                    console.log(`[THREAD-${threadId}] İç link tıklanıyor: ${randomLink}`);
                    await page.goto(randomLink, { waitUntil: 'networkidle2', timeout: 30000 });
                    clickCount++;

                    // İç sayfalarda da captcha kontrolü
                    if (captchaSolver && config.captcha.autoSolve) {
                      await captchaSolver.solveCaptcha(page, randomLink);
                    }
                  }
                } catch (error) {
                  console.log(`[THREAD-${threadId}] Link tıklama hatası: ${error.message}`);
                }
              }
            }

            console.log(`[THREAD-${threadId}] Gezinme tamamlandı, kapatılıyor.`);
            break;
          } catch (error) {
            console.error(`[THREAD-${threadId}] Site yükleme hatası: ${error.message}`);
          }
        }
      }

      // Sonraki sayfaya geç
      if (!foundAndClicked && currentPage < config.maxPages) {
        try {
          // Mobil ve desktop için farklı selektörler
          const nextButtonSelectors = [
            'a#pnnext',
            'a[aria-label="Next page"]',
            'a[aria-label="Sonraki sayfa"]',
            'td.d6cvqb a'
          ];

          let nextClicked = false;
          for (const selector of nextButtonSelectors) {
            const nextButton = await page.$(selector);
            if (nextButton) {
              await nextButton.click();
              await randomWait(3000, 5000);
              currentPage++;
              nextClicked = true;

              // Yeni sayfada captcha kontrolü
              if (captchaSolver && config.captcha.autoSolve) {
                const newPageUrl = page.url();
                await captchaSolver.solveCaptcha(page, newPageUrl);
              }

              break;
            }
          }

          if (!nextClicked) {
            console.log(`[THREAD-${threadId}] Sonraki sayfa bulunamadı.`);
            break;
          }
        } catch (error) {
          console.log(`[THREAD-${threadId}] Sayfa geçiş hatası: ${error.message}`);
          break;
        }
      } else {
        break;
      }
    }

    if (!foundAndClicked) {
      console.log(`[THREAD-${threadId}] Hedef domain bulunamadı.`);
      return { success: false, threadId };
    }

    return { success: true, threadId };

  } catch (error) {
    console.error(`[THREAD-${threadId}] HATA: ${error.message}`);
    return { success: false, threadId, error: error.message };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error(`[THREAD-${threadId}] Browser kapatma hatası: ${e.message}`);
      }
    }
  }
}

module.exports = { runBrowser };
