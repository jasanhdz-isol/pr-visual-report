const fs = require('fs');
const path = require('path');
const { loadDescriptions } = require('./describe');

function generateReport(options) {
  const { input, output, template, descriptions: descriptionsPath } = options;
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
    // Intentar cargar desde el directorio padre
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

  // Determinar si generar un solo archivo o varios por mes
  const monthKeys = Object.keys(groups);
  const generateSeparate = monthKeys.length > 1 || options.separateByMonth;

  // Determinar directorio relativo de imágenes
  const outputDir = path.dirname(outputPath);
  const imageDir = path.relative(outputDir, capturasDir);

  if (generateSeparate) {
    // Generar archivos separados por mes
    const baseName = path.basename(outputPath, '.md');

    monthKeys.forEach(month => {
      const monthMarkdown = generateMonthMarkdown(month, groups[month], imageDir, descriptions, options);
      const monthOutput = path.join(outputDir, `${month}_${baseName}.md`);
      fs.writeFileSync(monthOutput, monthMarkdown);
      console.log(`✓ Reporte generado: ${monthOutput}`);
    });
  } else {
    // Generar un solo archivo
    const month = monthKeys[0];
    const markdown = generateMonthMarkdown(month, groups[month], imageDir, descriptions, options);
    fs.writeFileSync(outputPath, markdown);
    console.log(`✓ Reporte generado: ${outputPath}`);
  }

  const totalPRs = monthKeys.reduce((sum, month) => sum + Object.keys(groups[month]).length, 0);
  console.log(`  ${totalPRs} PRs, ${files.length} imágenes`);
}

function generateMonthMarkdown(month, prs, imageDir, descriptions, options) {
  const monthName = month.charAt(0).toUpperCase() + month.slice(1);
  let markdown = '';

  // Encabezado
  markdown += `# Reporte de Actividades - ${monthName}\n\n`;
  markdown += `**Fecha de generación:** ${new Date().toLocaleDateString('es-ES')}\n\n`;
  markdown += `---\n\n`;

  // Lista de PRs
  markdown += `## Pull Requests del mes\n\n`;
  markdown += `| PR | Descripción |\n`;
  markdown += `|-----|-------------|\n`;

  for (const [pr, images] of Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    const desc = descriptions[pr];
    const descText = desc ? desc.text.substring(0, 60) + (desc.text.length > 60 ? '...' : '') : 'Sin descripción';
    markdown += `| [PR #${pr}](https://github.com/*/pull/${pr}) | ${descText} |\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `## Capturas\n\n`;

  // Capturas por PR
  let sectionNumber = 1;
  for (const [pr, images] of Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    const desc = descriptions[pr];

    // Título con descripción si existe
    if (desc && desc.text) {
      markdown += `### ${sectionNumber}. PR #${pr} - ${desc.prTitle || ''}\n\n`;

      // Agregar descripción completa
      markdown += `${desc.text}\n\n`;
    } else {
      markdown += `### ${sectionNumber}. PR #${pr}\n\n`;
    }

    // Descripción
    const descImage = images.find(i => i.kind === 'desc');
    if (descImage) {
      const imgPath = imageDir ? `${imageDir}/${descImage.file}` : descImage.file;
      markdown += `![PR #${pr} descripción](${imgPath})\n\n`;
    }

    // Diffs
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

module.exports = { generateReport };
