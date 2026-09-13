const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY no está configurada. Obtén una gratis en https://aistudio.google.com/apikey');
  }
  return key;
}

function cleanGitHubDescription(body) {
  if (!body) return null;

  const descMatch = body.match(/## Description\s*\n([\s\S]*?)(?=## |$)/i);
  if (descMatch && descMatch[1].trim().length > 10) {
    return descMatch[1].trim().replace(/\r\n/g, '\n');
  }

  let cleaned = body
    .replace(/## What type of PR is this[\s\S]*?(?=## |$)/i, '')
    .replace(/## Related Tickets[\s\S]*?(?=## |$)/i, '')
    .replace(/## QA Instructions[\s\S]*?(?=## |$)/i, '')
    .replace(/## Added\/updated tests\?[\s\S]*?(?=## |$)/i, '')
    .replace(/## \[optional\][\s\S]*?(?=## |$)/i, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/\r\n/g, '\n')
    .trim();

  return cleaned.length > 10 ? cleaned : null;
}

function obtainGitHubDescription(prNumber, repo) {
  try {
    const cmd = `gh pr view ${prNumber} --repo ${repo} --json body --jq .body`;
    const body = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim();
    return cleanGitHubDescription(body);
  } catch {
    return null;
  }
}

function obtainGitHubDiff(prNumber, repo) {
  try {
    const cmd = `gh pr diff ${prNumber} --repo ${repo}`;
    const diff = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return diff;
  } catch {
    return null;
  }
}

async function generateGeminiDescription(diff, prTitle) {
  try {
    const apiKey = getGeminiApiKey();
    const prompt = `Eres un desarrollador de software explicando un cambio en código.
Genera un resumen en español (máximo 3 párrafos) de lo que hace este Pull Request.

Título del PR: ${prTitle}

Diff (primeras 8000 caracteres):
${diff.substring(0, 8000)}

Resumen:`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error(`  Error Gemini: ${error.message}`);
    return null;
  }
}

async function translateToSpanish(text) {
  try {
    const apiKey = getGeminiApiKey();
    const prompt = `Traduce el siguiente texto al español. Mantén el formato original (listas, negritas, etc). Responde SOLO con el texto traducido, sin explicaciones adicionales:

${text}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      return text;
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
  } catch {
    return text;
  }
}

function loadDescriptions(outputDir) {
  const descPath = path.join(outputDir, 'descriptions.json');
  if (fs.existsSync(descPath)) {
    return JSON.parse(fs.readFileSync(descPath, 'utf8'));
  }
  return {};
}

function saveDescriptions(outputDir, descriptions) {
  const descPath = path.join(outputDir, 'descriptions.json');
  fs.writeFileSync(descPath, JSON.stringify(descriptions, null, 2));
}

async function describePRs(config) {
  const outputDir = path.resolve(config.output || './output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const descriptions = loadDescriptions(outputDir);
  const geminiAvailable = !!process.env.GEMINI_API_KEY;

  if (!geminiAvailable) {
    console.log('⚠ GEMINI_API_KEY no está configurada. Solo se usarán descripciones de GitHub.\n');
    console.log('  Para usar IA, ejecuta: export GEMINI_API_KEY=tu_api_key\n');
    console.log('  Obtén una gratis en: https://aistudio.google.com/apikey\n');
  }

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
  }

  let githubCount = 0;
  let aiCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < prList.length; i++) {
    const pr = prList[i];
    const prKey = String(pr.id);

    if (descriptions[prKey] && descriptions[prKey].text) {
      console.log(`[${i + 1}/${prList.length}] PR #${pr.id} - Ya tiene descripción (${descriptions[prKey].source})`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${prList.length}] PR #${pr.id} - ${pr.label || ''}...`);

    const githubDesc = obtainGitHubDescription(pr.id, pr.repo);

    if (githubDesc && githubDesc.length > 20) {
      console.log(`  Traduciendo descripción al español...`);
      const translatedDesc = geminiAvailable ? await translateToSpanish(githubDesc) : githubDesc;
      descriptions[prKey] = {
        source: 'github',
        text: translatedDesc,
        prTitle: pr.label || ''
      };
      console.log(`  ✓ Descripción obtenida de GitHub y traducida (${translatedDesc.length} chars)`);
      githubCount++;
    } else if (geminiAvailable) {
      console.log(`  Generando resumen con Gemini AI...`);
      const diff = obtainGitHubDiff(pr.id, pr.repo);

      if (diff) {
        const aiDesc = await generateGeminiDescription(diff, pr.label || `PR #${pr.id}`);

        if (aiDesc) {
          descriptions[prKey] = {
            source: 'gemini',
            text: aiDesc,
            prTitle: pr.label || ''
          };
          console.log(`  ✓ Descripción generada con Gemini (${aiDesc.length} chars)`);
          aiCount++;
        } else {
          console.log(`  ✗ No se pudo generar descripción`);
          skippedCount++;
        }
      } else {
        console.log(`  ✗ No se pudo obtener diff`);
        skippedCount++;
      }
    } else {
      console.log(`  ✗ Sin descripción en GitHub y Gemini no configurado`);
      skippedCount++;
    }
  }

  saveDescriptions(outputDir, descriptions);

  console.log(`\n✓ Descripciones guardadas en ${outputDir}/descriptions.json`);
  console.log(`  GitHub: ${githubCount} | Gemini: ${aiCount} | Saltados: ${skippedCount}`);
}

module.exports = { describePRs, loadDescriptions, obtainGitHubDescription, generateGeminiDescription };
