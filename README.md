# pr-visual-report

Herramienta CLI para capturar screenshots de Pull Requests de GitHub y generar reportes PDF visuales.

## Características

- Captura automática de descripción y diff de PRs
- Generación de reportes en Markdown
- Conversión a PDF con estilo profesional
- Soporte para repositorios públicos y privados
- Autenticación mediante cookies de GitHub
- Configuración flexible via JSON

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/jasan-isol/pr-visual-report.git
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
pr-visual-report report --input capturas/ --output reporte.md
```

### 4. Convertir a PDF

```bash
pr-visual-report pdf --input reporte.md --output reporte.pdf
```

### 5. Flujo completo

```bash
pr-visual-report generate --config pr-list.json
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

Crea un archivo JSON con la lista de PRs:

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

### Ejemplo con múltiples meses

```json
{
  "repo": "owner/repo-name",
  "output": "./output",
  "months": [
    {
      "name": "junio",
      "prs": [
        { "id": 123, "label": "Feature A" }
      ]
    },
    {
      "name": "julio",
      "prs": [
        { "id": 456, "label": "Feature B" }
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

### pdf

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-i, --input <input>` | Archivo markdown de entrada | `./reporte.md` |
| `-o, --output <output>` | Archivo PDF de salida | `./reporte.pdf` |

## Estructura de salida

```
output/
├── capturas/
│   ├── 2024-01_pr123_desc.png
│   ├── 2024-01_pr123_diff_0.png
│   ├── 2024-01_pr123_diff_1.png
│   └── ...
├── reporte.md
└── reporte.pdf
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

jasan-isol
