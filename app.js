/**
 * Google Search Traffic Bot
 * Thread Manager - Çoklu bot instance'larını yönetir
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { runBrowser } = require('./runbrowser');

// Config yükle
let config;
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} catch (error) {
  console.error(chalk.red('❌ config.json dosyası okunamadı!'));
  process.exit(1);
}

// Keywords yükle
let keywords = [];
try {
  const keywordsData = fs.readFileSync(config.keywordsFile, 'utf-8');
  keywords = keywordsData.split('\n').filter(k => k.trim());
  if (keywords.length === 0) {
    throw new Error('Keyword bulunamadı');
  }
} catch (error) {
  console.error(chalk.red(`❌ ${config.keywordsFile} dosyası okunamadı veya boş!`));
  process.exit(1);
}

// Proxy'leri yükle
let proxies = [];
if (fs.existsSync(config.proxiesFile)) {
  try {
    const proxiesData = fs.readFileSync(config.proxiesFile, 'utf-8');
    proxies = proxiesData.split('\n').filter(p => p.trim());
    console.log(chalk.green(`✓ ${proxies.length} proxy yüklendi`));
  } catch (error) {
    console.log(chalk.yellow('⚠ Proxy dosyası okunamadı, proxy olmadan devam ediliyor'));
  }
}

// Cookie dosyalarını yükle
let cookieFiles = [];
if (fs.existsSync(config.cookiesFolder)) {
  try {
    const files = fs.readdirSync(config.cookiesFolder);
    cookieFiles = files
      .filter(f => f.endsWith('.json') || f.endsWith('.txt'))
      .map(f => path.join(config.cookiesFolder, f));
    console.log(chalk.green(`✓ ${cookieFiles.length} cookie dosyası bulundu`));
  } catch (error) {
    console.log(chalk.yellow('⚠ Cookie klasörü okunamadı'));
  }
}

// İstatistikler
let stats = {
  launched: 0,
  success: 0,
  failed: 0
};

// Kullanılan cookie'leri takip et
const usedCookies = new Set();

// Rastgele eleman seç
function getRandomElement(array) {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

// Kullanılmamış cookie al
function getUnusedCookie() {
  const availableCookies = cookieFiles.filter(c => !usedCookies.has(c));
  if (availableCookies.length === 0) {
    // Tüm cookie'ler kullanıldı, sıfırla
    usedCookies.clear();
    return getRandomElement(cookieFiles);
  }
  const cookie = getRandomElement(availableCookies);
  if (cookie) usedCookies.add(cookie);
  return cookie;
}

// İstatistikleri göster
function showStats() {
  console.log(chalk.cyan('\n=== İlerleme: ') + 
    chalk.green(`${stats.success} başarılı`) + 
    chalk.cyan(' / ') + 
    chalk.red(`${stats.failed} başarısız`) + 
    chalk.cyan(' / ') + 
    chalk.blue(`${stats.launched} başlatıldı`) + 
    chalk.cyan(' ===\n'));
}

// Thread çalıştır
async function runThread(threadId) {
  stats.launched++;
  
  const keyword = getRandomElement(keywords);
  const proxy = proxies.length > 0 ? getRandomElement(proxies) : null;
  const cookie = cookieFiles.length > 0 ? getUnusedCookie() : null;

  try {
    const result = await runBrowser(threadId, config, keyword, proxy, cookie);
    
    if (result.success) {
      stats.success++;
    } else {
      stats.failed++;
    }
  } catch (error) {
    stats.failed++;
    console.error(chalk.red(`[THREAD-${threadId}] Beklenmeyen hata: ${error.message}`));
  }

  showStats();
}

// Ana fonksiyon
async function main() {
  console.log(chalk.bold.cyan('\n🚀 Google Search Traffic Bot Başlatılıyor...\n'));
  console.log(chalk.yellow('📋 Yapılandırma:'));
  console.log(`   • Hedef domain(ler): ${chalk.green(config.domains.join(', '))}`);
  console.log(`   • Thread sayısı: ${chalk.green(config.threads)}`);
  console.log(`   • Keyword sayısı: ${chalk.green(keywords.length)}`);
  console.log(`   • Proxy sayısı: ${chalk.green(proxies.length)}`);
  console.log(`   • Cookie sayısı: ${chalk.green(cookieFiles.length)}`);
  console.log(`   • Headless: ${chalk.green(config.headless ? 'Evet' : 'Hayır')}`);
  console.log(`   • Zamana yayma: ${chalk.green(config.spreadThreads ? `Evet (${config.timeFrameHours} saat)` : 'Hayır')}\n`);

  if (config.spreadThreads) {
    // Thread'leri zamana yay
    const totalMilliseconds = config.timeFrameHours * 60 * 60 * 1000;
    const delayBetweenThreads = totalMilliseconds / config.threads;

    console.log(chalk.cyan(`⏱ Thread'ler ${config.timeFrameHours} saate yayılacak (her thread arası ~${Math.round(delayBetweenThreads / 1000)} saniye)\n`));

    for (let i = 1; i <= config.threads; i++) {
      const delay = (i - 1) * delayBetweenThreads;
      
      setTimeout(() => {
        runThread(i);
      }, delay);

      console.log(chalk.gray(`⏰ Thread-${i} ${Math.round(delay / 1000)} saniye sonra başlatılacak`));
    }

    console.log(chalk.green(`\n✓ Tüm ${config.threads} thread zamanlandı!\n`));
  } else {
    // Tüm thread'leri aynı anda başlat
    console.log(chalk.cyan('🔄 Tüm thread\'ler paralel olarak başlatılıyor...\n'));
    
    const promises = [];
    for (let i = 1; i <= config.threads; i++) {
      promises.push(runThread(i));
      // Çok fazla eşzamanlı başlatmayı önlemek için küçük bir gecikme
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await Promise.all(promises);
    
    console.log(chalk.bold.green('\n✅ Tüm thread\'ler tamamlandı!\n'));
    showStats();
  }
}

// Programı başlat
main().catch(error => {
  console.error(chalk.red('\n❌ Kritik hata:'), error);
  process.exit(1);
});
