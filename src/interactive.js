const prompts = require('prompts');
const fs = require('fs');
const path = require('path');
const { queryPRs, printPRs, prsToConfig } = require('./query');
const { execSync } = require('child_process');

function getMonthName(month) {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[month];
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

async function interactiveInit() {
  console.log('\n=== pr-visual-report - Asistente de configuración ===\n');

  // Preguntar repositorio
  const repoResponse = await prompts({
    type: 'text',
    name: 'repo',
    message: '¿Cuál es el repositorio? (owner/repo):',
    validate: value => value.includes('/') ? true : 'Debe ser en formato owner/repo'
  });

  if (!repoResponse.repo) return;

  // Verificar gh CLI autenticado
  console.log('\nVerificando autenticación de GitHub...');
  try {
    execSync('gh auth status', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✓ GitHub CLI autenticado\n');
  } catch {
    console.error('✗ No estás autenticado en GitHub CLI');
    console.error('  Ejecuta: gh auth login\n');
    return;
  }

  // Preguntar usuario de GitHub
  const authorResponse = await prompts({
    type: 'text',
    name: 'author',
    message: '¿Tu usuario de GitHub?:',
    validate: value => value.length > 0 ? true : 'Ingresa tu usuario'
  });

  if (!authorResponse.author) return;

  // Preguntar periodo
  const periodResponse = await prompts({
    type: 'select',
    name: 'period',
    message: '¿Qué periodo quieres consultar?',
    choices: [
      { title: 'Día específico', value: 'day' },
      { title: 'Mes completo', value: 'month' },
      { title: 'Año completo', value: 'year' },
      { title: 'Rango personalizado', value: 'custom' }
    ]
  });

  if (!periodResponse.period) return;

  let fromDate, toDate;
  const now = new Date();

  switch (periodResponse.period) {
    case 'day': {
      const dateResponse = await prompts({
        type: 'text',
        name: 'date',
        message: 'Fecha (YYYY-MM-DD):',
        initial: now.toISOString().split('T')[0],
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!dateResponse.date) return;
      fromDate = dateResponse.date;
      toDate = dateResponse.date;
      break;
    }

    case 'month': {
      const monthResponse = await prompts({
        type: 'select',
        name: 'month',
        message: 'Mes:',
        choices: [
          { title: 'Enero', value: 0 },
          { title: 'Febrero', value: 1 },
          { title: 'Marzo', value: 2 },
          { title: 'Abril', value: 3 },
          { title: 'Mayo', value: 4 },
          { title: 'Junio', value: 5 },
          { title: 'Julio', value: 6 },
          { title: 'Agosto', value: 7 },
          { title: 'Septiembre', value: 8 },
          { title: 'Octubre', value: 9 },
          { title: 'Noviembre', value: 10 },
          { title: 'Diciembre', value: 11 }
        ],
        initial: now.getMonth()
      });
      if (monthResponse.month === undefined) return;

      const yearResponse = await prompts({
        type: 'number',
        name: 'year',
        message: 'Año:',
        initial: now.getFullYear()
      });
      if (!yearResponse.year) return;

      const month = monthResponse.month;
      const year = yearResponse.year;
      const daysInMonth = getDaysInMonth(year, month);

      fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      toDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      break;
    }

    case 'year': {
      const yearResponse = await prompts({
        type: 'number',
        name: 'year',
        message: 'Año:',
        initial: now.getFullYear()
      });
      if (!yearResponse.year) return;

      fromDate = `${yearResponse.year}-01-01`;
      toDate = `${yearResponse.year}-12-31`;
      break;
    }

    case 'custom': {
      const fromResponse = await prompts({
        type: 'text',
        name: 'from',
        message: 'Fecha inicio (YYYY-MM-DD):',
        initial: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!fromResponse.from) return;

      const toResponse = await prompts({
        type: 'text',
        name: 'to',
        message: 'Fecha fin (YYYY-MM-DD):',
        initial: now.toISOString().split('T')[0],
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!toResponse.to) return;

      fromDate = fromResponse.from;
      toDate = toResponse.to;
      break;
    }
  }

  // Consultar PRs
  console.log(`\nBuscando PRs de ${authorResponse.author} del ${fromDate} al ${toDate}...\n`);

  const prs = queryPRs({
    repo: repoResponse.repo,
    author: authorResponse.author,
    from: fromDate,
    to: toDate
  });

  printPRs(prs);

  if (prs.length === 0) return;

  // Preguntar si desea generar capturas
  const confirmResponse = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: '¿Generar capturas de estos PRs?',
    initial: true
  });

  if (!confirmResponse.confirm) return;

  // Preguntar directorio de salida
  const outputResponse = await prompts({
    type: 'text',
    name: 'output',
    message: 'Directorio de salida:',
    initial: './output'
  });

  if (!outputResponse.output) return;

  // Generar configuración
  const config = prsToConfig(prs, repoResponse.repo, outputResponse.output);

  // Guardar configuración
  const configPath = path.join(outputResponse.output, 'pr-list.json');
  const configDir = path.dirname(configPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`\n✓ Configuración guardada en: ${configPath}`);
  console.log('\nEjecuta el flujo completo con:');
  console.log(`  pr-visual-report generate --config ${configPath} --separate-by-month\n`);

  return config;
}

async function interactiveQuery() {
  console.log('\n=== pr-visual-report - Consulta de PRs ===\n');

  // Preguntar repositorio
  const repoResponse = await prompts({
    type: 'text',
    name: 'repo',
    message: '¿Cuál es el repositorio? (owner/repo):',
    validate: value => value.includes('/') ? true : 'Debe ser en formato owner/repo'
  });

  if (!repoResponse.repo) return;

  // Preguntar usuario de GitHub
  const authorResponse = await prompts({
    type: 'text',
    name: 'author',
    message: '¿Tu usuario de GitHub?:',
    validate: value => value.length > 0 ? true : 'Ingresa tu usuario'
  });

  if (!authorResponse.author) return;

  // Preguntar periodo
  const periodResponse = await prompts({
    type: 'select',
    name: 'period',
    message: '¿Qué periodo quieres consultar?',
    choices: [
      { title: 'Día específico', value: 'day' },
      { title: 'Mes completo', value: 'month' },
      { title: 'Año completo', value: 'year' },
      { title: 'Rango personalizado', value: 'custom' }
    ]
  });

  if (!periodResponse.period) return;

  let fromDate, toDate;
  const now = new Date();

  switch (periodResponse.period) {
    case 'day': {
      const dateResponse = await prompts({
        type: 'text',
        name: 'date',
        message: 'Fecha (YYYY-MM-DD):',
        initial: now.toISOString().split('T')[0],
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!dateResponse.date) return;
      fromDate = dateResponse.date;
      toDate = dateResponse.date;
      break;
    }

    case 'month': {
      const monthResponse = await prompts({
        type: 'select',
        name: 'month',
        message: 'Mes:',
        choices: [
          { title: 'Enero', value: 0 },
          { title: 'Febrero', value: 1 },
          { title: 'Marzo', value: 2 },
          { title: 'Abril', value: 3 },
          { title: 'Mayo', value: 4 },
          { title: 'Junio', value: 5 },
          { title: 'Julio', value: 6 },
          { title: 'Agosto', value: 7 },
          { title: 'Septiembre', value: 8 },
          { title: 'Octubre', value: 9 },
          { title: 'Noviembre', value: 10 },
          { title: 'Diciembre', value: 11 }
        ],
        initial: now.getMonth()
      });
      if (monthResponse.month === undefined) return;

      const yearResponse = await prompts({
        type: 'number',
        name: 'year',
        message: 'Año:',
        initial: now.getFullYear()
      });
      if (!yearResponse.year) return;

      const month = monthResponse.month;
      const year = yearResponse.year;
      const daysInMonth = getDaysInMonth(year, month);

      fromDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      toDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      break;
    }

    case 'year': {
      const yearResponse = await prompts({
        type: 'number',
        name: 'year',
        message: 'Año:',
        initial: now.getFullYear()
      });
      if (!yearResponse.year) return;

      fromDate = `${yearResponse.year}-01-01`;
      toDate = `${yearResponse.year}-12-31`;
      break;
    }

    case 'custom': {
      const fromResponse = await prompts({
        type: 'text',
        name: 'from',
        message: 'Fecha inicio (YYYY-MM-DD):',
        initial: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!fromResponse.from) return;

      const toResponse = await prompts({
        type: 'text',
        name: 'to',
        message: 'Fecha fin (YYYY-MM-DD):',
        initial: now.toISOString().split('T')[0],
        validate: value => /^\d{4}-\d{2}-\d{2}$/.test(value) ? true : 'Formato: YYYY-MM-DD'
      });
      if (!toResponse.to) return;

      fromDate = fromResponse.from;
      toDate = toResponse.to;
      break;
    }
  }

  // Consultar PRs
  console.log(`\nBuscando PRs de ${authorResponse.author} del ${fromDate} al ${toDate}...\n`);

  const prs = queryPRs({
    repo: repoResponse.repo,
    author: authorResponse.author,
    from: fromDate,
    to: toDate
  });

  printPRs(prs);

  return prs;
}

module.exports = { interactiveInit, interactiveQuery };
