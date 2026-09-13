const fs = require('fs');
const path = require('path');
const { createAuthenticatedContext, validateSession } = require('./auth');
const { hideGitHubUI, isBlank, sleep } = require('./utils');

const VIEWPORT = { width: 1440, height: 900 };
const CHUNK_HEIGHT = 900;

async function capturePR(page, prInfo, index, total) {
  const { id, label, repo } = prInfo;
  const url = `https://github.com/${repo}/pull/${id}`;
  const month = new Date().toISOString().slice(0, 7);

  console.log(`[${index + 1}/${total}] PR #${id}${label ? ` - ${label}` : ''}...`);

  // Capturar descripción
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      console.error(`  ✗ Sesión expirada. Ejecuta: pr-visual-report login`);
      return false;
    }

    await page.evaluate(hideGitHubUI());
    const descPath = path.join(__dirname, '..', 'capturas', `${month}_pr${id}_desc.png`);
    await page.screenshot({ path: descPath, fullPage: false });
    console.log(`  ✓ Descripción capturada`);
  } catch (err) {
    console.error(`  ✗ Error descripción: ${err.message}`);
    return false;
  }

  // Capturar diff con scroll
  try {
    await page.goto(`${url}/files`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Scroll completo para cargar lazy loading
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let total = 0;
        const step = 400;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 80);
      });
    });
    await page.waitForTimeout(2000);

    const totalHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`  Altura: ${totalHeight}px`);

    const numChunks = Math.ceil(totalHeight / CHUNK_HEIGHT);
    const step = Math.floor(totalHeight / numChunks);

    for (let i = 0; i < numChunks; i++) {
      const y = i * step;
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(300);
      await page.evaluate(hideGitHubUI());

      const filePath = path.join(__dirname, '..', 'capturas', `${month}_pr${id}_diff_${i}.png`);
      await page.screenshot({ path: filePath, fullPage: false });

      if (isBlank(filePath)) {
        await sleep(1000);
        await page.screenshot({ path: filePath, fullPage: false });
        if (isBlank(filePath)) {
          console.log(`  ✓ diff_${i} (reintentado, posible fin de diff)`);
        } else {
          console.log(`  ✓ diff_${i} OK (reintento)`);
        }
      } else {
        console.log(`  ✓ diff_${i} OK`);
      }
    }
  } catch (err) {
    console.error(`  ✗ Error diff: ${err.message}`);
    return false;
  }

  return true;
}

async function capturePRs(config) {
  const capturasDir = path.join(process.cwd(), 'capturas');
  if (!fs.existsSync(capturasDir)) {
    fs.mkdirSync(capturasDir, { recursive: true });
  }

  console.log('Iniciando Chromium...\n');

  const { browser, context } = await createAuthenticatedContext();
  const page = await context.newPage();

  if (!await validateSession(page)) {
    await browser.close();
    process.exit(1);
  }
  console.log('✓ Sesión válida\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < config.prs.length; i++) {
    const prInfo = { ...config.prs[i], repo: config.repo };
    try {
      const ok = await capturePR(page, prInfo, i, config.prs.length);
      if (ok) success++;
      else failed++;
    } catch (err) {
      console.error(`Error PR #${config.prs[i].id}: ${err.message}\n`);
      failed++;
    }
  }

  try { await browser.close(); } catch {}
  console.log(`\n✓ Capturas completas: ${success} éxitos, ${failed} fallidos`);
}

module.exports = { capturePRs };
