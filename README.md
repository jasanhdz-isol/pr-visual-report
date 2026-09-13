# pr-visual-report

Herramienta CLI para capturar screenshots de Pull Requests de GitHub y generar reportes PDF visuales.

## Características

- **Modo interactivo** - Asistente paso a paso para configurar reportes
- **Búsqueda por fecha** - Encuentra automáticamente tus PRs por rango de fechas
- **Descripciones con IA** - Gemini AI genera resúmenes cuando GitHub no tiene descripción
- Captura automática de descripción y diff de PRs
- Generación de reportes en Markdown
- Conversión a PDF con estilo profesional
- Soporte para repositorios públicos y privados
- Autenticación mediante cookies de GitHub
- Configuración flexible via JSON
- **Soporte para reportes por día, mes y año**

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

### 1. Autenticarse (una sola vez)

```bash
pr-visual-report login
```

### 2. Flujo interactivo (recomendado para principiantes)

```bash
pr-visual-report init
```

El asistente te preguntará:
1. ¿Cuál es el repositorio?
2. ¿Tu usuario de GitHub?
3. ¿Qué periodo? (día/mes/año/rango personalizado)
4. ¿Generar capturas?

### 3. Consultar PRs por fecha

```bash
# Modo interactivo
pr-visual-report query --interactive

# Modo directo
pr-visual-report query --repo owner/repo --author mi-usuario --from 2026-08-01 --to 2026-08-31
```

### 4. Generar reporte completo

```bash
# Flujo completo con configuración
pr-visual-report generate --config pr-list.json --separate-by-month
```

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `init` | Asistente interactivo para configurar y generar reportes |
| `query` | Consultar PRs por rango de fechas |
| `login` | Abrir navegador para autenticarse |
| `capture` | Capturar screenshots de PRs |
| `describe` | Obtener/generar descripciones (GitHub + Gemini AI) |
| `report` | Generar reporte Markdown |
| `pdf` | Convertir Markdown a PDF |
| `generate` | Flujo completo (capture + report + pdf) |
| `full` | Flujo completo con IA (capture + describe + report + pdf) |

## Flujo de trabajo

### Flujo completo (recomendado)

```bash
# 1. Autenticarse (una sola vez)
pr-visual-report login

# 2. Ejecutar asistente interactivo
pr-visual-report init

# 3. El asistente genera la configuración y ejecuta todo
```

### Flujo manual

```bash
# 1. Consultar PRs
pr-visual-report query --repo owner/repo --author mi-usuario --from 2026-08-01 --to 2026-08-31

# 2. Crear archivo de configuración manualmente
# Ver examples/pr-list-by-month.json

# 3. Ejecutar flujo completo
pr-visual-report generate --config pr-list.json --separate-by-month
```

## Archivo de configuración

### Formato por mes (recomendado)

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
        { "id": 456, "label": "Feature C" }
      ]
    }
  ]
}
```

### Formato simple

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

## Opciones de línea de comandos

### init (Asistente interactivo)

No tiene opciones adicionales. El asistente guía el proceso completo.

### query (Consultar PRs)

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-r, --repo <repo>` | Repositorio (owner/repo) | - |
| `-a, --author <author>` | Autor del PR | - |
| `-f, --from <from>` | Fecha inicio (YYYY-MM-DD) | - |
| `-t, --to <to>` | Fecha fin (YYYY-MM-DD) | - |
| `-s, --state <state>` | Estado (all, open, closed, merged) | `all` |
| `-i, --interactive` | Modo interactivo | false |

### capture (Capturar screenshots)

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-r, --repo <repo>` | Repositorio (owner/repo) | - |
| `-p, --prs <prs>` | Lista de PRs separados por comas | - |
| `-c, --config <config>` | Archivo de configuración JSON | - |
| `-o, --output <output>` | Directorio de salida | `./capturas` |

### report (Generar Markdown)

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-i, --input <input>` | Directorio con capturas | `./capturas` |
| `-o, --output <output>` | Archivo markdown de salida | `./reporte.md` |
| `-s, --separate-by-month` | Generar archivos separados por mes | false |

### pdf (Convertir a PDF)

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-i, --input <input>` | Archivo markdown de entrada | `./reporte.md` |
| `-o, --output <output>` | Archivo PDF de salida | `./reporte.pdf` |

### generate (Flujo completo)

| Opción | Descripción | Default |
|--------|-------------|---------|
| `-c, --config <config>` | Archivo de configuración JSON | - |
| `-s, --separate-by-month` | Generar archivos separados por mes | false |

## Ejemplo completo

```bash
# 1. Autenticarse
pr-visual-report login

# 2. Ejecutar asistente
pr-visual-report init

# Ejemplo de interacción:
# ? Repositorio (owner/repo): Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend
# ? Tu usuario de GitHub: jasanhdz-isol
# ? Periodo: Mes completo
# ? Mes: Agosto
# ? Año: 2026
#
# Buscando PRs de jasanhdz-isol del 2026-08-01 al 2026-08-31...
#
# Se encontraron 9 PRs:
#   1. #897 - fix(front-qa): refine enrichment validation
#   2. #896 - feat(front-qa): validate enrichment SKUs
#   ...
#
# ? ¿Generar capturas de estos PRs? S
#
# ✓ Configuración guardada en: output/pr-list.json
# Ejecuta: pr-visual-report generate --config output/pr-list.json --separate-by-month
```

## Estructura de salida

```
output/
├── capturas/
│   ├── junio_pr123_desc.png
│   ├── junio_pr123_diff_0.png
│   ├── julio_pr456_desc.png
│   └── ...
├── pr-list.json
├── junio_reporte.md
├── julio_reporte.md
├── junio_reporte.pdf
└── julio_reporte.pdf
```

## Requisitos

- Node.js >= 18.0.0
- npm
- GitHub CLI (`gh`) autenticado
- Python 3 (para detección de imágenes en blanco)
- Pillow (Python): `pip install Pillow`

### Para descripciones con IA (opcional pero recomendado)

El asistente interactivo te pedirá la API key automáticamente. También puedes configurarla manualmente:

1. Ve a https://aistudio.google.com/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"**
4. Selecciona un proyecto existente o crea uno nuevo
5. Copia la API key generada
6. Configura la variable de entorno:

```bash
# Opción 1: Variable de entorno temporal
export GEMINI_API_KEY=tu_api_key_aqui

# Opción 2: Guardar en archivo .env (recomendado)
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env
```

**Nota:** La API key es gratuita y permite hasta 15 solicitudes por minuto.

## Documentación

- [Guía de autenticación](docs/AUTHENTICATION.md)
- [Solución de problemas](docs/TROUBLESHOOTING.md)

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios.

## Licencia

MIT

## Autor

jasanhdz-isol
