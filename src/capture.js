const fs = require('fs');
const path = require('path');
const { createAuthenticatedContext, validateSession } = require('./auth');
const { hideGitHubUI, isBlank, sleep } = require('./utils');

const VIEWPORT = { width: 1440, height: 900 };
const CHUNK_HEIGHT = 900;
const PARALLEL_LIMIT = 3;

async function capturePR(page, prInfo, capturasDir) {
  const { id, label, repo, month } = prInfo;
  const url = `https://github.com/${repo}/pull/${id}`;
  const monthPrefix = month || new Date().toISOString().slice(0, 7);

  console.log(`[PR #${id}] Iniciando captura...`);

  // Capturar descripción
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    if (page.url().includes('/login')) {
      console.error(`  [PR #${id}] ✗ Sesión expirada`);
      return false;
    }

    await page.evaluate(hideGitHubUI());
    const descPath = path.join(capturasDir, `${monthPrefix}_pr${id}_desc.png`);
    await page.screenshot({ path: descPath, fullPage: false });
    console.log(`  [PR #${id}] ✓ Descripción capturada`);
  } catch (err) {
    console.error(`  [PR #${id}] ✗ Error descripción: ${err.message}`);
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
    const numChunks = Math.ceil(totalHeight / CHUNK_HEIGHT);
    const step = Math.floor(totalHeight / numChunks);

    console.log(`  [PR #${id}] Altura: ${totalHeight}px (${numChunks} partes)`);

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
      }
    }

    console.log(`  [PR #${id}] ✓ ${numChunks} partes capturadas`);
  } catch (err) {
    console.error(`  [PR #${id}] ✗ Error diff: ${err.message}`);
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

  if (!await validateSession(await context.newPage())) {
    await browser.close();
    process.exit(1);
  }
  console.log('✓ Sesión válida\n');

  // Construir lista de PRs
  const prList = [];
  if (config.months && Array.isArray(config.months)) {
    config.months.forEach(monthData => {
      monthData.prs.forEach(pr => {
        prList.push({ ...pr, repo: config.repo, month: monthData.name });
      });
    });
  } else if (config.prs && Array.isArray(config.prs)) {
    config.prs.forEach(pr => {
      prList.push({ ...pr, repo: config.repo });
    });
  } else {
    console.error('Error: Configuración debe incluir "prs" o "months"');
    await browser.close();
    process.exit(1);
  }

  console.log(`Capturando ${prList.length} PRs en paralelo (máx ${PARALLEL_LIMIT})...\n`);

  const results = [];
  let success = 0;
  let failed = 0;

  // Captura en paralelo con límite de concurrencia
  for (let i = 0; i < prList.length; i += PARALLEL_LIMIT) {
    const batch = prList.slice(i, i + PARALLEL_LIMIT);
    const batchPromises = batch.map(async (pr) => {
      const page = await context.newPage();
      try {
        const ok = await capturePR(page, pr, capturasDir);
        return { pr, ok };
      } catch (err) {
        console.error(`Error PR #${pr.id}: ${err.message}`);
        return { pr, ok: false };
      } finally {
        try { await page.close(); } catch {}
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ pr, ok }) => {
      if (ok) success++;
      else failed++;
    });

    // Pequeña pausa entre batches para no sobrecargar
    if (i + PARALLEL_LIMIT < prList.length) {
      await sleep(500);
    }
  }

  try { await browser.close(); } catch {}
  console.log(`\n✓ Capturas completas: ${success} éxitos, ${failed} fallidos`);
}

module.exports = { capturePRs };
