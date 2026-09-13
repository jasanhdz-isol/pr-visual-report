#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { login } = require('../src/auth');
const { capturePRs } = require('../src/capture');
const { generateReport } = require('../src/report');
const { convertToPdf } = require('../src/pdf');
const { loadConfig } = require('../src/utils');
const { queryPRs, printPRs, prsToConfig } = require('../src/query');
const { interactiveInit, interactiveQuery } = require('../src/interactive');

const program = new Command();

program
  .name('pr-visual-report')
  .description('Herramienta CLI para capturar screenshots de PRs de GitHub y generar reportes PDF')
  .version('1.0.0');

program
  .command('init')
  .description('Asistente interactivo para configurar y generar reportes')
  .action(async () => {
    await interactiveInit();
  });

program
  .command('query')
  .description('Consultar PRs por rango de fechas')
  .option('-r, --repo <repo>', 'Repositorio en formato owner/repo')
  .option('-a, --author <author>', 'Autor del PR (usuario de GitHub)')
  .option('-f, --from <from>', 'Fecha inicio (YYYY-MM-DD)')
  .option('-t, --to <to>', 'Fecha fin (YYYY-MM-DD)')
  .option('-s, --state <state>', 'Estado del PR (all, open, closed, merged)', 'all')
  .option('-i, --interactive', 'Modo interactivo')
  .action(async (options) => {
    if (options.interactive) {
      await interactiveQuery();
      return;
    }

    if (!options.repo) {
      console.error('Error: Se requiere --repo (owner/repo)');
      process.exit(1);
    }

    const prs = queryPRs(options);
    printPRs(prs);
  });

program
  .command('login')
  .description('Abrir navegador para autenticarse con GitHub')
  .action(async () => {
    await login();
  });

program
  .command('capture')
  .description('Capturar screenshots de PRs')
  .option('-r, --repo <repo>', 'Repositorio en formato owner/repo')
  .option('-p, --prs <prs>', 'Lista de PRs separados por comas (ej: 842,846,855)')
  .option('-c, --config <config>', 'Archivo de configuración JSON')
  .option('-o, --output <output>', 'Directorio de salida', './capturas')
  .action(async (options) => {
    let config;
    if (options.config) {
      config = loadConfig(options.config);
    } else if (options.prs && options.repo) {
      const prIds = options.prs.split(',').map(id => parseInt(id.trim()));
      config = {
        repo: options.repo,
        prs: prIds.map(id => ({ id })),
        output: options.output
      };
    } else {
      console.error('Error: Proporciona --config o --repo y --prs');
      process.exit(1);
    }
    await capturePRs(config);
  });

program
  .command('report')
  .description('Generar reporte markdown desde capturas')
  .option('-i, --input <input>', 'Directorio con capturas', './capturas')
  .option('-o, --output <output>', 'Archivo markdown de salida', './reporte.md')
  .option('-t, --template <template>', 'Template markdown personalizado')
  .option('-s, --separate-by-month', 'Generar archivos separados por mes')
  .action(async (options) => {
    await generateReport(options);
  });

program
  .command('pdf')
  .description('Convertir reporte markdown a PDF')
  .option('-i, --input <input>', 'Archivo markdown de entrada', './reporte.md')
  .option('-o, --output <output>', 'Archivo PDF de salida', './reporte.pdf')
  .action(async (options) => {
    await convertToPdf(options);
  });

program
  .command('generate')
  .description('Flujo completo: capturar + reporte + PDF')
  .option('-c, --config <config>', 'Archivo de configuración JSON')
  .option('-s, --separate-by-month', 'Generar archivos separados por mes')
  .action(async (options) => {
    if (!options.config) {
      console.error('Error: Proporciona --config con el archivo de configuración');
      process.exit(1);
    }
    const config = loadConfig(options.config);
    console.log('=== Flujo completo: pr-visual-report ===\n');

    // Capturar screenshots
    await capturePRs(config);

    // Generar reportes markdown
    const outputDir = path.resolve(config.output || './output');
    const reportOptions = {
      input: outputDir,
      output: path.join(outputDir, 'reporte.md'),
      separateByMonth: options.separateByMonth
    };
    await generateReport(reportOptions);

    // Generar PDFs
    const mdFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.md'));
    for (const mdFile of mdFiles) {
      const mdPath = path.join(outputDir, mdFile);
      const pdfPath = mdPath.replace('.md', '.pdf');
      await convertToPdf({ input: mdPath, output: pdfPath });
    }

    console.log('\n=== Proceso completado ===');
  });

program.parse();
