/**
 * User-Agent Generator
 * Gerçekçi mobil, tablet ve desktop user-agent'ları üretir
 */

const mobileUserAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
];

const tabletUserAgents = [
  'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-X906C) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; Lenovo TB-X606F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

const desktopUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

const viewports = {
  mobile: [
    { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { width: 393, height: 851, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    { width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  ],
  tablet: [
    { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    { width: 810, height: 1080, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  ],
  desktop: [
    { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    { width: 1366, height: 768, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
    { width: 1536, height: 864, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
  ]
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUserAgent(type = 'random') {
  let deviceType;
  
  if (type === 'random') {
    const types = ['mobile', 'tablet', 'desktop'];
    const weights = [0.5, 0.2, 0.3]; // %50 mobil, %20 tablet, %30 desktop
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        deviceType = types[i];
        break;
      }
    }
  } else {
    deviceType = type;
  }

  let userAgent, viewport;

  switch (deviceType) {
    case 'mobile':
      userAgent = getRandomElement(mobileUserAgents);
      viewport = getRandomElement(viewports.mobile);
      break;
    case 'tablet':
      userAgent = getRandomElement(tabletUserAgents);
      viewport = getRandomElement(viewports.tablet);
      break;
    case 'desktop':
      userAgent = getRandomElement(desktopUserAgents);
      viewport = getRandomElement(viewports.desktop);
      break;
    default:
      userAgent = getRandomElement(desktopUserAgents);
      viewport = getRandomElement(viewports.desktop);
  }

  return {
    userAgent,
    viewport,
    deviceType
  };
}

module.exports = { generateUserAgent };
