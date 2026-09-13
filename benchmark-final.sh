#!/bin/bash

# Final benchmark test for pr-visual-report

REPO="Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend"
OUTPUT_DIR="./benchmark-final"
CONFIG_FILE="$OUTPUT_DIR/config.json"

echo "=== pr-visual-report - Benchmark Final ==="
echo ""
echo "Repositorio: $REPO"
echo "Periodo: Junio 2026 (4 PRs)"
echo "Características: Captura paralela + Descripciones en español"
echo ""

mkdir -p "$OUTPUT_DIR"

cat > "$CONFIG_FILE" << 'EOF'
{
  "repo": "Servicios-Liverpool-Infraestructura/automatizacion_foro_fotografico_frontend",
  "output": "./benchmark-final",
  "months": [
    {
      "name": "junio",
      "prs": [
        { "id": 842, "label": "skeleton loaders" },
        { "id": 846, "label": "GOB-1790 logistics alignment" },
        { "id": 855, "label": "waiting photograph status" },
        { "id": 857, "label": "refactor logistics" }
      ]
    }
  ]
}
EOF

START_TIME=$(date +%s)
echo "=== INICIO: $(date '+%Y-%m-%d %H:%M:%S') ==="
echo ""

echo "--- 1/4 Capturando screenshots (paralelo) ---"
STEP_START=$(date +%s)
node bin/pr-visual-report.js capture --config "$CONFIG_FILE" 2>&1
CAPTURE_TIME=$(($(date +%s) - STEP_START))
echo "Tiempo: ${CAPTURE_TIME}s"
echo ""

echo "--- 2/4 Generando descripciones (GitHub + Gemini + Traducción) ---"
STEP_START=$(date +%s)
node bin/pr-visual-report.js describe --config "$CONFIG_FILE" 2>&1
DESCRIBE_TIME=$(($(date +%s) - STEP_START))
echo "Tiempo: ${DESCRIBE_TIME}s"
echo ""

echo "--- 3/4 Generando reporte Markdown ---"
STEP_START=$(date +%s)
node bin/pr-visual-report.js report --input "$OUTPUT_DIR" --output "$OUTPUT_DIR/junio_reporte.md" --separate-by-month --descriptions "$OUTPUT_DIR/descriptions.json" 2>&1
REPORT_TIME=$(($(date +%s) - STEP_START))
echo "Tiempo: ${REPORT_TIME}s"
echo ""

echo "--- 4/4 Generando PDF ---"
STEP_START=$(date +%s)
node bin/pr-visual-report.js pdf --input "$OUTPUT_DIR/junio_reporte.md" --output "$OUTPUT_DIR/junio_reporte.pdf" 2>&1
cd "$OUTPUT_DIR" && python3 -c "
from xhtml2pdf import pisa
with open('junio_reporte.html', 'r') as h:
    with open('junio_reporte.pdf', 'wb') as p:
        pisa.pisaDocument(h, p)
print('PDF generado')
" 2>/dev/null
cd ..
PDF_TIME=$(($(date +%s) - STEP_START))
echo "Tiempo: ${PDF_TIME}s"
echo ""

TOTAL_TIME=$(($(date +%s) - START_TIME))

echo "==============================="
echo "   RESUMEN DE TIEMPOS"
echo "==============================="
echo "Captura:        ${CAPTURE_TIME}s"
echo "Descripciones:  ${DESCRIBE_TIME}s"
echo "Reporte MD:     ${REPORT_TIME}s"
echo "PDF:            ${PDF_TIME}s"
echo "------------------------------"
echo "TOTAL:          ${TOTAL_TIME}s"
echo "==============================="
echo ""
echo "FIN: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "=== Archivos generados ==="
ls -lh "$OUTPUT_DIR"/*.md "$OUTPUT_DIR"/*.pdf "$OUTPUT_DIR"/*.json 2>/dev/null
echo ""
IMAGES=$(find "$OUTPUT_DIR" -name "*.png" | wc -l)
echo "Imágenes: $IMAGES"
