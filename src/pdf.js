const fs = require('fs');
const path = require('path');
const markdown = require('markdown');

function generateHtml(mdContent) {
  const css = `
    @page { size: A4; margin: 2cm; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #222;
    }
    h1 {
      font-size: 22pt;
      color: #1a1a2e;
      border-bottom: 3px solid #0f3460;
      padding-bottom: 8px;
    }
    h2 {
      font-size: 16pt;
      color: #16213e;
      border-bottom: 1px solid #ccc;
      padding-bottom: 4px;
      margin-top: 28px;
    }
    h3 {
      font-size: 13pt;
      color: #0f3460;
      margin-top: 18px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10pt;
    }
    th {
      background: #0f3460;
      color: white;
      padding: 8px 10px;
      text-align: left;
    }
    td {
      border: 1px solid #ddd;
      padding: 6px 10px;
    }
    tr:nth-child(even) { background: #f8f9fa; }
    img {
      max-width: 100%;
      display: block;
      margin: 10px auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    a { color: #0f3460; text-decoration: none; }
  `;

  const htmlBody = markdown.parse(mdContent);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>${css}</style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}

function convertToPdf(options) {
  const { input, output } = options;
  const inputPath = path.resolve(input || './reporte.md');
  const outputPath = path.resolve(output || './reporte.pdf');

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Archivo markdown no encontrado: ${inputPath}`);
    process.exit(1);
  }

  const mdContent = fs.readFileSync(inputPath, 'utf8');
  const htmlContent = generateHtml(mdContent);

  // Guardar HTML temporal
  const htmlPath = outputPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, htmlContent);

  console.log(`✓ HTML generado: ${htmlPath}`);
  console.log(`\nPara convertir a PDF, instala xhtml2pdf:`);
  console.log(`  pip install xhtml2pdf`);
  console.log(`\nLuego ejecuta:`);
  console.log(`  xhtml2pdf ${htmlPath} -o ${outputPath}`);
}

module.exports = { convertToPdf };
