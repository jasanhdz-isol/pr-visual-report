# pr-visual-report

Herramienta CLI para capturar screenshots de Pull Requests de GitHub y generar reportes PDF visuales.

## Características

- Captura automática de descripción y diff de PRs
- Generación de reportes en Markdown
- Conversión a PDF con estilo profesional
- Soporte para repositorios públicos y privados
- Autenticación mediante cookies de GitHub
- Configuración flexible via JSON
- **Soporte para reportes por mes** (archivos separados)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jasanhdz-isol/pr-visual-report.git
cd pr-visual-report

# Instalar dependencias
npm install

# Instalar Chromium para Playwright
npx playwright install chromium
```

## Uso rápido

### 1. Autenticarse

```bash
pr-visual-report login
```

Se abrirá un navegador para que inicies sesión en GitHub.

### 2. Capturar screenshots

```bash
# Usando línea de comandos
pr-visual-report capture --repo owner/repo --prs 123,456,789

# Usando archivo de configuración
pr-visual-report capture --config pr-list.json
```

### 3. Generar reporte Markdown

```bash
# Un solo archivo
pr-visual-report report --input capturas/ --output reporte.md

# Archivos separados por mes
pr-visual-report report --input capturas/ --output reporte.md --separate-by-month
```

### 4. Convertir a PDF

```bash
pr-visual-report pdf --input reporte.md --output reporte.pdf
```

### 5. Flujo completo

```bash
# Un solo reporte
pr-visual-report generate --config pr-list.json

# Reportes separados por mes
pr-visual-report generate --config pr-list.json --separate-by-month
```

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `login` | Abrir navegador para autenticarse |
| `capture` | Capturar screenshots de PRs |
| `report` | Generar reporte Markdown |
| `pdf` | Convertir Markdown a PDF |
| `generate` | Flujo completo (capture + report + pdf) |

## Archivo de configuración

### Formato simple (todos los PRs juntos)

```json
{
  "repo": "owner/repo-name",
  "output": "./output",
  "prs": [
    { "id": 123, "label": "Descripción del PR" },
    { "id": 456, "label": "Otro PR" }
  ]
}
```

### Formato por mes (archivos separados)

```json
{
  "repo": "owner/repo-name",
  "output": "./output",
  "months": [
    {
      "name": "junio",
      "prs": [
        { "id": 123, "label": "Feature A" },
        { "id": 124, "label": "Feature B" }
      ]
    },
    {
      "name": "julio",
      "prs": [
        { "id": 456, "label": "Feature C" },
        { "id": 457, "label": "Feature D" }
      ]
    }
  ]
}
```

## Opciones de línea de comandos

### capture

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-r, --repo <repo>` | Repositorio (owner/repo) | - |
| `-p, --prs <prs>` | Lista de PRs separados por comas | - |
| `-c, --config <config>` | Archivo de configuración JSON | - |
| `-o, --output <output>` | Directorio de salida | `./capturas` |

### report

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-i, --input <input>` | Directorio con capturas | `./capturas` |
| `-o, --output <output>` | Archivo markdown de salida | `./reporte.md` |
| `-t, --template <template>` | Template markdown personalizado | - |
| `-s, --separate-by-month` | Generar archivos separados por mes | false |

### pdf

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-i, --input <input>` | Archivo markdown de entrada | `./reporte.md` |
| `-o, --output <output>` | Archivo PDF de salida | `./reporte.pdf` |

## Estructura de salida

### Formato simple

```
output/
├── capturas/
│   ├── 2024-01_pr123_desc.png
│   ├── 2024-01_pr123_diff_0.png
│   └── ...
├── reporte.md
└── reporte.pdf
```

### Formato por mes

```
output/
├── capturas/
│   ├── junio_pr123_desc.png
│   ├── junio_pr123_diff_0.png
│   ├── julio_pr456_desc.png
│   └── ...
├── junio_reporte.md
├── julio_reporte.md
├── junio_reporte.pdf
└── julio_reporte.pdf
```

## Ejemplo completo

```bash
# 1. Autenticarse (una sola vez)
pr-visual-report login

# 2. Capturar PRs por mes
pr-visual-report generate --config pr-list.json --separate-by-month

# Resultado:
# - output/junio_reporte.md
# - output/julio_reporte.md
# - output/junio_reporte.pdf
# - output/julio_reporte.pdf
```

## Requisitos

- Node.js >= 18.0.0
- npm
- Python 3 (para detección de imágenes en blanco)
- Pillow (Python): `pip install Pillow`

## Documentación

- [Guía de autenticación](docs/AUTHENTICATION.md)
- [Solución de problemas](docs/TROUBLESHOOTING.md)

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios.

## Licencia

MIT

## Autor

jasanhdz-isol
