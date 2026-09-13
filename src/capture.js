const fs = require('fs');
const path = require('path');
const { createAuthenticatedContext, validateSession } = require('./auth');
const { hideGitHubUI, isBlank, sleep } = require('./utils');

const VIEWPORT = { width: 1440, height: 900 };
const CHUNK_HEIGHT = 900;

async function capturePR(page, prInfo, index, total, capturasDir) {
  const { id, label, repo, month } = prInfo;
  const url = `https://github.com/${repo}/pull/${id}`;
  const monthPrefix = month || new Date().toISOString().slice(0, 7);

  console.log(`[${index + 1}/${total}] PR #${id}${label ? ` - ${label}` : ''} (${monthPrefix})...`);

  // Capturar descripción
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      console.error(`  ✗ Sesión expirada. Ejecuta: pr-visual-report login`);
      return false;
    }

    await page.evaluate(hideGitHubUI());
    const descPath = path.join(capturasDir, `${monthPrefix}_pr${id}_desc.png`);
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

      const filePath = path.join(capturasDir, `${monthPrefix}_pr${id}_diff_${i}.png`);
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
  const capturasDir = path.resolve(config.output || './capturas');
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

  // Soportar formato simple (config.prs) o formato por mes (config.months)
  const prList = [];

  if (config.months && Array.isArray(config.months)) {
    // Formato por mes: [{ name: "junio", prs: [...] }]
    config.months.forEach(monthData => {
      monthData.prs.forEach(pr => {
        prList.push({ ...pr, repo: config.repo, month: monthData.name });
      });
    });
  } else if (config.prs && Array.isArray(config.prs)) {
    // Formato simple: { prs: [...] }
    config.prs.forEach(pr => {
      prList.push({ ...pr, repo: config.repo });
    });
  } else {
    console.error('Error: Configuración debe incluir "prs" o "months"');
    await browser.close();
    process.exit(1);
  }

  for (let i = 0; i < prList.length; i++) {
    try {
      const ok = await capturePR(page, prList[i], i, prList.length, capturasDir);
      if (ok) success++;
      else failed++;
    } catch (err) {
      console.error(`Error PR #${prList[i].id}: ${err.message}\n`);
      failed++;
    }
  }

  try { await browser.close(); } catch {}
  console.log(`\n✓ Capturas completas: ${success} éxitos, ${failed} fallidos`);
}

module.exports = { capturePRs };
