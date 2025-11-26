const { connect } = require("puppeteer-real-browser");
const fs = require("fs");
const path = require("path");
const { generateUserAgent } = require("./ua-generator");
const { CaptchaSolver } = require("./captcha-solver");

// Rastgele bekleme
function randomWait(min, max) {
    return new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
    );
}

// Scroll
async function randomScroll(page, minScrolls, maxScrolls) {
    const count = Math.floor(Math.random() * (maxScrolls - minScrolls + 1)) + minScrolls;

    for (let i = 0; i < count; i++) {
        await page.evaluate(() =>
            window.scrollBy(0, Math.floor(Math.random() * 400) + 300)
        );
        await randomWait(800, 2000);
    }
}

// Cookie yükleme
async function loadCookies(page, cookieFile) {
    try {
        const data = fs.readFileSync(cookieFile, "utf-8");
        let cookies;

        if (cookieFile.endsWith(".json")) {
            cookies = JSON.parse(data);
        } else {
            cookies = data
                .split("\n")
                .filter((l) => l && !l.startsWith("#"))
                .map((line) => {
                    const p = line.split("\t");
                    if (p.length >= 7) {
                        return {
                            name: p[5],
                            value: p[6],
                            domain: p[0],
                            path: p[2],
                            expires: parseInt(p[4]),
                            httpOnly: p[1] === "TRUE",
                            secure: p[3] === "TRUE",
                        };
                    }
                    return null;
                })
                .filter((x) => x);
        }

        if (cookies?.length) {
            await page.setCookie(...cookies);
            return true;
        }
    } catch (e) {
        console.log(`Cookie yükleme hatası: ${e.message}`);
    }
    return false;
}

// Domain eşleşmesi
function isDomainMatch(url, domains) {
    try {
        const u = new URL(url);
        return domains.some((d) => u.hostname.includes(d));
    } catch {
        return false;
    }
}

async function runBrowser(threadId, config, keyword, proxy = null, cookieFile = null) {
    let browser = null;
    let page = null;

    try {
        console.log(`\n========== THREAD-${threadId} ==========\n`);

        // 2Captcha Solver
        let captchaSolver = null;
        if (
            config?.captcha?.enabled &&
            config.captcha.apiKey &&
            config.captcha.apiKey !== "YOUR_2CAPTCHA_API_KEY"
        ) {
            captchaSolver = new CaptchaSolver(config.captcha.apiKey);
            try {
                const balance = await captchaSolver.getBalance();
                console.log(
                    `[THREAD-${threadId}] 2Captcha bakiye: $${balance.toFixed(3)}`
                );
            } catch (e) {
                console.log(
                    `[THREAD-${threadId}] 2Captcha bakiye okunamadı: ${e.message}`
                );
            }
        }

        // User Agent
        const { userAgent, viewport, deviceType } = generateUserAgent(
            config.userAgentType
        );
        console.log(`[THREAD-${threadId}] Cihaz tipi: ${deviceType}`);

        // Browser AYARLARI
        const browserConfig = {
            headless: config.headless,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                `--user-agent=${userAgent}`,
            ],
            executablePath: config.executablePath,
            turnstile: true,
            connectOption: { defaultViewport: viewport },
        };

        // PROXY (AUTH destekli)
        let pageAuth = null;

        if (proxy) {
            const p = proxy.split(":");

            if (p.length === 4) {
                const host = p[0];
                const port = p[1];
                const user = p[2];
                const pass = p[3];

                browserConfig.args.push(`--proxy-server=${host}:${port}`);
                pageAuth = { username: user, password: pass };

                console.log(`[THREAD-${threadId}] Proxy Auth → ${host}:${port}`);
            } else if (p.length === 2) {
                browserConfig.args.push(`--proxy-server=${p[0]}:${p[1]}`);
                console.log(`[THREAD-${threadId}] Proxy → ${p[0]}:${p[1]}`);
            } else {
                console.log(
                    `[THREAD-${threadId}] Hatalı proxy formatı (atlandı): ${proxy}`
                );
            }
        }

        // Browser bağlantısı
        const { browser: br, page: pg } = await connect(browserConfig);
        browser = br;
        page = pg;

        // Proxy auth
        if (pageAuth) {
            await page.authenticate(pageAuth);
        }

        // Cookie yükle
        if (cookieFile) {
            const ok = await loadCookies(page, cookieFile);
            if (ok)
                console.log(
                    `[THREAD-${threadId}] Cookie yüklendi: ${path.basename(
                        cookieFile
                    )}`
                );
        }

        // GOOGLE ARAMA URL OLUŞTUR
        const baseSearch = `https://www.google.com/search?q=${encodeURIComponent(
            keyword
        )}`;

        let found = false;

        // 🔥 ULTRA HIZLI GOOGLE SAYFA DEĞİŞTİRME (URL ÜZERİNDEN) + CAPTCHA ÇÖZME
        for (let pageNum = 1; pageNum <= config.maxPages && !found; pageNum++) {
            const start = (pageNum - 1) * 10;
            const pageUrl =
                pageNum === 1 ? baseSearch : `${baseSearch}&start=${start}`;

            console.log(
                `[THREAD-${threadId}] Google sayfa ${pageNum} açılıyor: ${pageUrl}`
            );

            await page.goto(pageUrl, {
                waitUntil: "networkidle2",
                timeout: 60000,
            });

            // Google üzerinde captcha kontrol + çözüm
            if (captchaSolver && config.captcha.autoSolve) {
                console.log(
                    `[THREAD-${threadId}] Google captcha kontrol ediliyor...`
                );
                const token = await captchaSolver.solveCaptcha(page, pageUrl);
                if (token) {
                    console.log(
                        `[THREAD-${threadId}] Google captcha çözüldü, form/reload deneniyor`
                    );
                    try {
                        // Form varsa submit etmeyi dene
                        await page.evaluate(() => {
                            const form = document.querySelector("form");
                            if (form) form.submit();
                        });

                        try {
                            await page.waitForNavigation({
                                waitUntil: "networkidle2",
                                timeout: 60000,
                            });
                        } catch {
                            // navigation olmazsa reload dene
                            await page.reload({
                                waitUntil: "networkidle2",
                                timeout: 60000,
                            });
                        }
                    } catch (e) {
                        console.log(
                            `[THREAD-${threadId}] Captcha sonrası submit/reload hatası: ${e.message}`
                        );
                    }
                }
            }

            await randomWait(1500, 2500);
            await randomScroll(page, config.minScrolls, config.maxScrolls);

            // Arama sonuçlarındaki linkleri al
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll("a[href]"))
                    .map((a) => a.href)
                    .filter((href) => href.startsWith("http"));
            });

            for (const link of links) {
                if (isDomainMatch(link, config.domains)) {
                    console.log(`[THREAD-${threadId}] HEDEF BULUNDU → ${link}`);

                    await page.goto(link, {
                        waitUntil: "networkidle2",
                        timeout: 60000,
                    });
                    await randomWait(2000, 4000);

                    // Hedef sitede captcha kontrolü
                    if (captchaSolver && config.captcha.autoSolve) {
                        console.log(
                            `[THREAD-${threadId}] Hedef sitede captcha kontrol ediliyor...`
                        );
                        await captchaSolver.solveCaptcha(page, link);
                    }

                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            console.log(`[THREAD-${threadId}] Hedef domain bulunamadı.`);
            return { success: false, threadId };
        }

        return { success: true, threadId };
    } catch (err) {
        console.log(`[THREAD-${threadId}] HATA: ${err.message}`);
        return { success: false, threadId };
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
}

module.exports = { runBrowser };
