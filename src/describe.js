const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cleanGitHubDescription(body) {
  if (!body) return null;

  // Extraer solo la sección de Description
  const descMatch = body.match(/## Description\s*\n([\s\S]*?)(?=## |$)/i);
  if (descMatch && descMatch[1].trim().length > 10) {
    return descMatch[1].trim().replace(/\r\n/g, '\n');
  }

  // Si no hay sección Description, limpiar el template
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

async function generateAIDescription(diff, prTitle) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: `Eres un desarrollador de software explicando un cambio en código. 
Genera un resumen en español (máximo 3 párrafos) de lo que hace este Pull Request.

Título del PR: ${prTitle}

Diff:
${diff.substring(0, 8000)}

Resumen:`,
        stream: false
      })
    });

    const data = await response.json();
    return data.response || null;
  } catch {
    return null;
  }
}

function checkOllamaRunning() {
  try {
    execSync('curl -s http://localhost:11434/api/tags', { encoding: 'utf8' });
    return true;
  } catch {
    return false;
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
  const ollamaAvailable = checkOllamaRunning();

  if (!ollamaAvailable) {
    console.log('⚠ Ollama no está corriendo. Solo se usarán descripciones de GitHub.\n');
    console.log('  Para usar IA, ejecuta: ollama serve\n');
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

    // Intentar obtener de GitHub
    const githubDesc = obtainGitHubDescription(pr.id, pr.repo);

    if (githubDesc && githubDesc.length > 20) {
      descriptions[prKey] = {
        source: 'github',
        text: githubDesc,
        prTitle: pr.label || ''
      };
      console.log(`  ✓ Descripción obtenida de GitHub (${githubDesc.length} chars)`);
      githubCount++;
    } else if (ollamaAvailable) {
      // Generar con IA
      console.log(`  Generando resumen con IA...`);
      const diff = obtainGitHubDiff(pr.id, pr.repo);

      if (diff) {
        const aiDesc = await generateAIDescription(diff, pr.label || `PR #${pr.id}`);

        if (aiDesc) {
          descriptions[prKey] = {
            source: 'ai',
            text: aiDesc,
            prTitle: pr.label || ''
          };
          console.log(`  ✓ Descripción generada con IA (${aiDesc.length} chars)`);
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
      console.log(`  ✗ Sin descripción en GitHub y Ollama no disponible`);
      skippedCount++;
    }
  }

  saveDescriptions(outputDir, descriptions);

  console.log(`\n✓ Descripciones guardadas en ${outputDir}/descriptions.json`);
  console.log(`  GitHub: ${githubCount} | IA: ${aiCount} | Saltados: ${skippedCount}`);
}

module.exports = { describePRs, loadDescriptions, obtainGitHubDescription, generateAIDescription };
