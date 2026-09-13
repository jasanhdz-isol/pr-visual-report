# Solución de Problemas

## Problemas comunes

### 1. Error: "Playwright no está instalado"

**Solución:**
```bash
npm install
npx playwright install chromium
```

### 2. Error: "Sesión inválida o expirada"

**Solución:**
```bash
pr-visual-report login
```

### 3. Error: "Archivo de configuración no encontrado"

**Solución:** Verifica que la ruta al archivo sea correcta:
```bash
pr-visual-report generate --config ./ruta/al/archivo.json
```

### 4. Las imágenes están en blanco

**Causa:** El contenido no se cargó completamente antes de capturar.

**Solución:** Aumenta el tiempo de espera en `src/capture.js`:
```javascript
await page.waitForTimeout(5000); // Cambiar de 2000 a 5000
```

### 5. Error: "Cannot find module"

**Solución:**
```bash
npm install
```

### 6. El navegador no abre en modo login

**Solución:** Verifica que Playwright esté instalado:
```bash
npx playwright install chromium
```

### 7. Error de permisos en Linux

**Solución:** Ejecuta con `--no-sandbox` (ya está configurado por defecto).

### 8. Las cookies no se guardan

**Causa:** El navegador no detectó el login correctamente.

**Solución:** Espera a ver el mensaje "✓ Login detectado! Cookies guardadas" antes de cerrar el navegador manualmente.

## Rendimiento

### Capturas lentas

- Usa `--prs` para capturar solo los PRs necesarios
- El tiempo de espera entre capturas es configurable en `src/capture.js`

### Archivos PDF muy grandes

- Reduce la cantidad de imágenes capturadas
- Usa un template markdown más ligero

## Compatibilidad

- **Node.js:** >= 18.0.0
- **Sistemas operativos:** macOS, Linux, Windows
- **Navegadores:** Chromium (instalado via Playwright)

## Obtener ayuda

Si encuentras un problema no documentado, abre un issue en:
https://github.com/jasan-isol/pr-visual-report/issues
