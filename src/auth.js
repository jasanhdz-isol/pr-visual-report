const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COOKIE_PATH = path.join(process.cwd(), '.github-cookies.json');
const VIEWPORT = { width: 1440, height: 900 };

async function login() {
  console.log('=== MODO LOGIN ===\n');
  console.log('Se abrirá un navegador para que inicies sesión en GitHub.');
  console.log('Una vez autenticado, las cookies se guardarán automáticamente.\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();
  await page.goto('https://github.com/login');

  console.log('Esperando autenticación...\n');

  while (true) {
    await page.waitForTimeout(2000);
    try {
      const url = page.url();
      if (url.includes('github.com') && !url.includes('/login') && !url.includes('/session')) {
        const hasAvatar = await page.evaluate(() =>
          !!document.querySelector('img.avatar') || !!document.querySelector('[data-testid="avatar"]')
        );
        if (hasAvatar) {
          const cookies = await context.cookies();
          fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
          console.log('✓ Login detectado! Cookies guardadas en .github-cookies.json');
          console.log('\nPuedes usar la herramienta normalmente.');
          await browser.close();
          return;
        }
      }
    } catch {}
  }
}

async function createAuthenticatedContext(cookiePath = COOKIE_PATH) {
  if (!fs.existsSync(cookiePath)) {
    console.error('Error: No hay sesión guardada.');
    console.error('Ejecuta: pr-visual-report login\n');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: VIEWPORT });

  const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
  await context.addCookies(cookies);

  return { browser, context };
}

async function validateSession(page) {
  await page.goto('https://github.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  const loggedIn = await page.evaluate(() => !!document.querySelector('img.avatar'));

  if (!loggedIn) {
    console.error('Error: Sesión inválida o expirada.');
    console.error('Ejecuta: pr-visual-report login\n');
    return false;
  }
  return true;
}

module.exports = { login, createAuthenticatedContext, validateSession, COOKIE_PATH };
