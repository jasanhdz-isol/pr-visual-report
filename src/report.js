const fs = require('fs');
const path = require('path');

function generateReport(options) {
  const { input, output, template } = options;
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

  if (generateSeparate) {
    // Generar archivos separados por mes
    const outputDir = path.dirname(outputPath);
    const baseName = path.basename(outputPath, '.md');

    monthKeys.forEach(month => {
      const monthMarkdown = generateMonthMarkdown(month, groups[month]);
      const monthOutput = path.join(outputDir, `${month}_${baseName}.md`);
      fs.writeFileSync(monthOutput, monthMarkdown);
      console.log(`✓ Reporte generado: ${monthOutput}`);
    });
  } else {
    // Generar un solo archivo
    const month = monthKeys[0];
    const markdown = generateMonthMarkdown(month, groups[month]);
    fs.writeFileSync(outputPath, markdown);
    console.log(`✓ Reporte generado: ${outputPath}`);
  }

  const totalPRs = monthKeys.reduce((sum, month) => sum + Object.keys(groups[month]).length, 0);
  console.log(`  ${totalPRs} PRs, ${files.length} imágenes`);
}

function generateMonthMarkdown(month, prs) {
  let markdown = '';

  markdown += `# Reporte de Actividades - ${month.charAt(0).toUpperCase() + month.slice(1)}\n\n`;
  markdown += `**Fecha de generación:** ${new Date().toLocaleDateString('es-ES')}\n\n`;
  markdown += `---\n\n`;

  // Lista de PRs
  markdown += `## Pull Requests del mes\n\n`;
  markdown += `| PR | Descripción |\n`;
  markdown += `|-----|-------------|\n`;

  for (const [pr, images] of Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    const diffImages = images.filter(i => i.kind === 'diff_0');
    const hasDiff = diffImages.length > 0;
    markdown += `| [PR #${pr}](https://github.com/*/pull/${pr}) | ${hasDiff ? 'Capturas disponibles' : 'Solo descripción'} |\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `## Capturas\n\n`;

  // Capturas por PR
  for (const [pr, images] of Object.entries(prs).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    markdown += `### PR #${pr}\n\n`;

    // Descripción primero
    const descImage = images.find(i => i.kind === 'desc');
    if (descImage) {
      markdown += `**Descripción:**\n\n`;
      markdown += `![PR #${pr} descripción](capturas/${descImage.file})\n\n`;
    }

    // Luego diffs
    const diffImages = images
      .filter(i => i.kind.startsWith('diff_'))
      .sort((a, b) => a.idx - b.idx);

    if (diffImages.length > 0) {
      markdown += `**Diff (${diffImages.length} partes):**\n\n`;
      diffImages.forEach(img => {
        markdown += `![PR #${pr} diff](capturas/${img.file})\n\n`;
      });
    }
  }

  markdown += `---\n\n`;
  return markdown;
}

module.exports = { generateReport };
