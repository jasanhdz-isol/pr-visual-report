const fs = require('fs');
const path = require('path');
const { loadDescriptions } = require('./describe');

function generateReport(options) {
  const { input, output, template, descriptions: descriptionsPath, format } = options;
  const capturasDir = path.resolve(input || './capturas');
  const outputPath = path.resolve(output || './reporte.md');

  if (!fs.existsSync(capturasDir)) {
    console.error(`Error: Directorio no encontrado: ${capturasDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(capturasDir).filter(f => f.endsWith('.png'));

  if (files.length === 0) {
    console.error('Error: No hay capturas en el directorio especificado');
    process.exit(1);
  }

  // Cargar descripciones si existen
  const descriptionsFile = descriptionsPath || path.join(capturasDir, 'descriptions.json');
  let descriptions = {};
  if (fs.existsSync(descriptionsFile)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsFile, 'utf8'));
  } else {
    const parentDesc = path.join(path.dirname(capturasDir), 'descriptions.json');
    if (fs.existsSync(parentDesc)) {
      descriptions = JSON.parse(fs.readFileSync(parentDesc, 'utf8'));
    }
  }

  // Agrupar archivos por mes y PR
  const groups = {};
  files.forEach(file => {
    const match = file.match(/(.+?)_pr(\d+)_(desc|diff_(\d+))\.png/);
    if (match) {
      const [, month, pr, kind, idx] = match;
      if (!groups[month]) groups[month] = {};
      if (!groups[month][pr]) groups[month][pr] = [];
      groups[month][pr].push({
        kind,
        idx: idx ? parseInt(idx) : -1,
        file
      });
    }
  });

  const monthKeys = Object.keys(groups);
  const generateSeparate = monthKeys.length > 1 || options.separateByMonth;
  const outputDir = path.dirname(outputPath);
  const imageDir = path.relative(outputDir, capturasDir);

  if (generateSeparate) {
    const baseName = path.basename(outputPath, '.md');
    monthKeys.forEach(month => {
      const monthMarkdown = format === 'company'
        ? generateCompanyFormat(month, groups[month], imageDir, descriptions, options)
        : generateDetailedFormat(month, groups[month], imageDir, descriptions, options);
      const monthOutput = path.join(outputDir, `${month}_${baseName}.md`);
      fs.writeFileSync(monthOutput, monthMarkdown);
      console.log(`✓ Reporte generado: ${monthOutput}`);
    });
  } else {
    const month = monthKeys[0];
    const markdown = format === 'company'
      ? generateCompanyFormat(month, groups[month], imageDir, descriptions, options)
      : generateDetailedFormat(month, groups[month], imageDir, descriptions, options);
    fs.writeFileSync(outputPath, markdown);
    console.log(`✓ Reporte generado: ${outputPath}`);
  }

  const totalPRs = monthKeys.reduce((sum, month) => sum + Object.keys(groups[month]).length, 0);
  console.log(`  ${totalPRs} PRs, ${files.length} imágenes`);
}

function generateDetailedFormat(month, prs, imageDir, descriptions, options) {
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);
  let markdown = '';

  markdown += `# Reporte de Actividades - ${monthName}\n\n`;
  markdown += `**Fecha de generación:** ${new Date().toLocaleDateString('es-ES')}\n\n`;

  const prEntries = Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  const prCount = prEntries.length;
  const totalImages = prEntries.reduce((sum, [, images]) => sum + images.length, 0);

  markdown += `## Resumen del mes\n\n`;
  markdown += `Durante el mes de **${monthName}** se completaron **${prCount} Pull Requests** `;
  markdown += `con un total de **${totalImages} capturas de pantalla** documentando los cambios realizados.\n\n`;

  const features = [];
  const fixes = [];
  const refactors = [];

  prEntries.forEach(([pr]) => {
    const desc = descriptions[pr];
    if (desc && desc.prTitle) {
      const title = desc.prTitle.toLowerCase();
      if (title.includes('feat') || title.includes('feature')) {
        features.push({ pr, title: desc.prTitle });
      } else if (title.includes('fix') || title.includes('bug')) {
        fixes.push({ pr, title: desc.prTitle });
      } else if (title.includes('refactor') || title.includes('cleanup')) {
        refactors.push({ pr, title: desc.prTitle });
      } else {
        features.push({ pr, title: desc.prTitle });
      }
    }
  });

  if (features.length > 0 || fixes.length > 0 || refactors.length > 0) {
    markdown += `### Categorías\n\n`;
    if (features.length > 0) markdown += `- **Nuevas funcionalidades:** ${features.length} PRs\n`;
    if (fixes.length > 0) markdown += `- **Correcciones:** ${fixes.length} PRs\n`;
    if (refactors.length > 0) markdown += `- **Refactorizaciones:** ${refactors.length} PRs\n`;
    markdown += `\n`;
  }

  markdown += `---\n\n`;
  markdown += `## Pull Requests del mes\n\n`;

  prEntries.forEach(([pr, images], index) => {
    const desc = descriptions[pr];
    const descText = desc ? desc.text : 'Sin descripción disponible';
    const prTitle = desc && desc.prTitle ? desc.prTitle : `PR #${pr}`;
    const imageCount = images.filter(i => i.kind.startsWith('diff_')).length;

    markdown += `### ${index + 1}. [PR #${pr}](${getImageUrl(pr)}) - ${prTitle}\n\n`;
    markdown += `> ${descText.substring(0, 200)}${descText.length > 200 ? '...' : ''}\n\n`;
    markdown += `- **Capturas:** ${imageCount + 1} imágenes (descripción + ${imageCount} partes de diff)\n\n`;
  });

  markdown += `---\n\n`;
  markdown += `## Capturas\n\n`;

  let sectionNumber = 1;
  for (const [pr, images] of prEntries) {
    const desc = descriptions[pr];

    if (desc && desc.text) {
      markdown += `### ${sectionNumber}. PR #${pr} - ${desc.prTitle || ''}\n\n`;
      markdown += `${desc.text}\n\n`;
    } else {
      markdown += `### ${sectionNumber}. PR #${pr}\n\n`;
    }

    const descImage = images.find(i => i.kind === 'desc');
    if (descImage) {
      const imgPath = imageDir ? `${imageDir}/${descImage.file}` : descImage.file;
      markdown += `![PR #${pr} descripción](${imgPath})\n\n`;
    }

    const diffImages = images
      .filter(i => i.kind.startsWith('diff_'))
      .sort((a, b) => a.idx - b.idx);

    if (diffImages.length > 0) {
      markdown += `**Diff (${diffImages.length} partes):**\n\n`;
      diffImages.forEach(img => {
        const imgPath = imageDir ? `${imageDir}/${img.file}` : img.file;
        markdown += `![PR #${pr} diff](${imgPath})\n\n`;
      });
    }

    markdown += `---\n\n`;
    sectionNumber++;
  }

  return markdown;
}

function generateCompanyFormat(month, prs, imageDir, descriptions, options) {
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);
  const monthYear = new Date().getFullYear();
  let markdown = '';

  // Encabezado empresa
  markdown += `# Actividades de ${monthName} ${monthYear}\n\n`;
  markdown += `**Usuario:** Jasan Hernández (jasanhdz-isol)\n`;
  markdown += `**Proyecto:** Automatización del Foro Fotográfico\n`;
  markdown += `**Repositorio:** [automatizacion_foro_fotografico_frontend](https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend)\n\n`;
  markdown += `---\n\n`;

  // Resumen narrativo
  const prEntries = Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  const prCount = prEntries.length;

  markdown += `En el mes de **${monthName}** se completaron **${prCount} Pull Requests** `;
  markdown += `abarcando nuevas funcionalidades, correcciones y refactorizaciones del sistema.\n\n`;

  // Secciones narrativas por cada PR
  let sectionNum = 1;
  prEntries.forEach(([pr, images]) => {
    const desc = descriptions[pr];
    const prTitle = desc && desc.prTitle ? desc.prTitle : `PR #${pr}`;
    const descText = desc ? desc.text : 'Sin descripción disponible';
    const imageCount = images.filter(i => i.kind.startsWith('diff_')).length;

    markdown += `## ${sectionNum}. ${prTitle}\n\n`;
    markdown += `${descText}\n\n`;
    markdown += `*PR [#${pr}](${getImageUrl(pr)}) - ${imageCount + 1} capturas*\n\n`;
    sectionNum++;
  });

  markdown += `---\n\n`;

  // Tabla resumen
  markdown += `## Pull Requests del mes\n\n`;
  markdown += `| PR | Descripción | Archivos | Estado |\n`;
  markdown += `|-----|-------------|----------|--------|\n`;

  prEntries.forEach(([pr, images]) => {
    const desc = descriptions[pr];
    const prTitle = desc && desc.prTitle ? desc.prTitle : `Sin descripción`;
    const imageCount = images.filter(i => i.kind.startsWith('diff_')).length + 1;
    markdown += `| [#${pr}](${getImageUrl(pr)}) | ${prTitle} | ${imageCount} | Fusionado |\n`;
  });

  markdown += `\n---\n\n`;

  // Capturas al final
  markdown += `## Capturas\n\n`;

  for (const [pr, images] of prEntries) {
    const desc = descriptions[pr];
    markdown += `### PR #${pr} - ${desc && desc.prTitle ? desc.prTitle : ''}\n\n`;

    const descImage = images.find(i => i.kind === 'desc');
    if (descImage) {
      const imgPath = imageDir ? `${imageDir}/${descImage.file}` : descImage.file;
      markdown += `![PR #${pr} descripción](${imgPath})\n\n`;
    }

    const diffImages = images
      .filter(i => i.kind.startsWith('diff_'))
      .sort((a, b) => a.idx - b.idx);

    diffImages.forEach(img => {
      const imgPath = imageDir ? `${imageDir}/${img.file}` : img.file;
      markdown += `![PR #${pr} diff](${imgPath})\n\n`;
    });
  }

  return markdown;
}

function getImageUrl(pr) {
  return `https://github.com/Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend/pull/${pr}`;
}

module.exports = { generateReport };
