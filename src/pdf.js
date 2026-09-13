const fs = require('fs');
const path = require('path');
const markdown = require('markdown');

function preProcessTables(mdContent) {
  const lines = mdContent.split('\n');
  let result = [];
  let i = 0;
  let tableIndex = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const tableHtml = buildHtmlTable(tableLines);
      const placeholder = `XZTABLE${tableIndex}XZ`;
      tablePlaceholders[placeholder] = tableHtml;
      tableIndex++;
      result.push(placeholder);
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join('\n');
}

const tablePlaceholders = {};

function restoreTables(html) {
  let result = html;
  for (const [placeholder, tableHtml] of Object.entries(tablePlaceholders)) {
    result = result.replace(new RegExp(placeholder, 'g'), tableHtml);
  }
  return result;
}

function buildHtmlTable(rows) {
  if (rows.length < 3) return rows.join('\n');

  const parseRow = (row) => {
    return row.split('|').slice(1, -1).map(cell => cell.trim());
  };

  const isSeparator = (row) => {
    const content = row.replace(/\|/g, '').trim();
    return /^[\-:]+$/.test(content);
  };

  const convertLinks = (text) => {
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  };

  const headerCells = parseRow(rows[0]);
  const dataRows = [];

  for (let i = 1; i < rows.length; i++) {
    if (!isSeparator(rows[i])) {
      dataRows.push(parseRow(rows[i]));
    }
  }

  let html = '<table>\n<thead>\n<tr>\n';
  headerCells.forEach(header => {
    html += `  <th>${convertLinks(header)}</th>\n`;
  });
  html += '</tr>\n</thead>\n<tbody>\n';

  dataRows.forEach(cells => {
    html += '<tr>\n';
    cells.forEach(cell => {
      html += `  <td>${convertLinks(cell)}</td>\n`;
    });
    html += '</tr>\n';
  });

  html += '</tbody>\n</table>';
  return html;
}

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
      margin: 16px 0;
      font-size: 10pt;
      page-break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    th {
      background: #1a1a2e;
      color: white;
      padding: 10px 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #0a2647;
    }
    td {
      border: 1px solid #ccc;
      padding: 8px 12px;
      vertical-align: top;
    }
    tr:nth-child(even) { background: #f4f6f8; }
    tr:nth-child(odd) { background: #ffffff; }
    img {
      max-width: 100%;
      display: block;
      margin: 10px auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
    a { color: #0f3460; text-decoration: none; }
    blockquote {
      border-left: 4px solid #0f3460;
      margin: 12px 0;
      padding: 8px 16px;
      background: #f8f9fa;
      font-style: italic;
    }
    em { color: #555; font-size: 9pt; }
  `;

  const preProcessed = preProcessTables(mdContent);
  let htmlBody = markdown.parse(preProcessed);
  htmlBody = restoreTables(htmlBody);

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

  const htmlPath = outputPath.replace('.pdf', '.html');
  fs.writeFileSync(htmlPath, htmlContent);

  console.log(`✓ HTML generado: ${htmlPath}`);
  console.log(`\nPara convertir a PDF, instala xhtml2pdf:`);
  console.log(`  pip install xhtml2pdf`);
  console.log(`\nLuego ejecuta:`);
  console.log(`  xhtml2pdf ${htmlPath} -o ${outputPath}`);
}

module.exports = { convertToPdf };
