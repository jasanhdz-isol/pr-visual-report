const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hideGitHubUI() {
  return `(() => {
    const hide = [
      'header', '.AppHeader', '#header', '.js-header-wrapper',
      '.footer', '#footer-container',
      '.flash', '.flash-messages', '.js-notice',
      '.Layout-sidebar', '.sidebar',
      '.js-repo-nav', '.gh-header-actions .btn',
      '.Tabs', '.tabnav',
      '.diff-header', '.js-diffstats',
    ];
    hide.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = 'none'));
    const main = document.querySelector('.application-main') || document.querySelector('main');
    if (main) { main.style.margin = '0'; main.style.padding = '8px'; main.style.maxWidth = '100%'; }
  })()`;
}

function isBlank(filePath) {
  try {
    const out = execSync(`python3 -c "
from PIL import Image
import warnings
warnings.filterwarnings('ignore')
img = Image.open('${filePath}')
colors = img.getcolors(maxcolors=10)
if colors:
    total = sum(c[0] for c in colors)
    white = sum(c[0] for c in colors if c[1][:3] == (255,255,255))
    ratio = white / total if total > 0 else 1
    print('BLANK' if ratio > 0.95 else 'OK')
else:
    print('OK')
"`, { encoding: 'utf8' }).trim();
    return out === 'BLANK';
  } catch {
    return true;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadConfig(configPath) {
  const fullPath = path.resolve(configPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Archivo de configuración no encontrado: ${fullPath}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  if (!config.repo) {
    console.error('Error: El archivo de configuración debe incluir "repo" (owner/repo)');
    process.exit(1);
  }

  if (!config.prs || !Array.isArray(config.prs) || config.prs.length === 0) {
    console.error('Error: El archivo de configuración debe incluir "prs" como array');
    process.exit(1);
  }

  config.output = config.output || './output';
  return config;
}

module.exports = { hideGitHubUI, isBlank, sleep, loadConfig };
