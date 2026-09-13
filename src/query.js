const { execSync } = require('child_process');

function queryPRs(options) {
  const { repo, author, from, to, state = 'all' } = options;

  if (!repo) {
    console.error('Error: Se requiere --repo (owner/repo)');
    process.exit(1);
  }

  // Construir búsqueda
  let search = '';
  if (from && to) {
    search = `created:${from}..${to}`;
  } else if (from) {
    search = `created:>=${from}`;
  } else if (to) {
    search = `created:<=${to}`;
  }

  if (author) {
    search += ` author:${author}`;
  }

  // Ejecutar gh pr list
  let cmd = `gh pr list --repo ${repo} --state ${state} --limit 100 --json number,title,state,createdAt,author,url`;

  if (search) {
    cmd += ` --search "${search}"`;
  }

  try {
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const prs = JSON.parse(output);
    return prs;
  } catch (err) {
    console.error(`Error al consultar PRs: ${err.message}`);
    return [];
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getStateLabel(state) {
  const states = {
    'OPEN': 'Abierto',
    'CLOSED': 'Cerrado',
    'MERGED': 'Fusionado'
  };
  return states[state] || state;
}

function printPRs(prs) {
  if (prs.length === 0) {
    console.log('\nNo se encontraron PRs para el rango de fechas especificado.\n');
    return;
  }

  console.log(`\nSe encontraron ${prs.length} PRs:\n`);

  prs.forEach((pr, i) => {
    const state = getStateLabel(pr.state);
    const date = formatDate(pr.createdAt);
    console.log(`  ${i + 1}. #${pr.number} [${state}]`);
    console.log(`     ${pr.title}`);
    console.log(`     ${date}`);
    console.log('');
  });
}

function prsToConfig(prs, repo, outputDir = './output') {
  // Agrupar PRs por mes
  const byMonth = {};

  prs.forEach(pr => {
    const date = new Date(pr.createdAt);
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthName = monthNames[date.getMonth()];

    if (!byMonth[monthName]) {
      byMonth[monthName] = [];
    }

    byMonth[monthName].push({
      id: pr.number,
      label: pr.title.substring(0, 60)
    });
  });

  // Crear configuración
  const months = Object.entries(byMonth).map(([name, prs]) => ({
    name,
    prs
  }));

  return {
    repo,
    output: outputDir,
    months
  };
}

module.exports = { queryPRs, printPRs, prsToConfig, formatDate, getStateLabel };
