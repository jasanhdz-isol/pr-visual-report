# Guía de Autenticación

## ¿Por qué necesito autenticarme?

GitHub requiere autenticación para acceder a repositorios privados y para evitar límites de tasa en las peticiones a la API.

## Opción 1: Usar el comando `login` (Recomendado)

El comando `login` abre un navegador donde puedes iniciar sesión normalmente. Las cookies se guardan automáticamente.

```bash
pr-visual-report login
```

### Pasos:
1. Ejecuta el comando anterior
2. Se abrirá un navegador con la página de login de GitHub
3. Inicia sesión con tu usuario y contraseña
4. Completa la autenticación de dos factores si la tienes habilitada
5. Espera a que el navegador se cierre automáticamente
6. Las cookies se guardarán en `.github-cookies.json`

## Opción 2: Copiar cookies manualmente

Si prefieres no usar el navegador automático, puedes copiar las cookies manualmente.

### Pasos:

1. Abre tu navegador (Chrome, Firefox, Edge) e inicia sesión en GitHub
2. Abre las DevTools (F12 o Cmd+Option+I en Mac)
3. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
4. En el panel izquierdo, expande **Cookies** → `https://github.com`
5. Copia todas las cookies (o al menos `_gh_sess`, `user_session`, `logged_in`)
6. Crea un archivo `.github-cookies.json` con este formato:

```json
[
  {
    "name": "_gh_sess",
    "value": "TU_VALOR_AQUI",
    "domain": ".github.com",
    "path": "/"
  },
  {
    "name": "user_session",
    "value": "TU_VALOR_AQUI",
    "domain": ".github.com",
    "path": "/"
  },
  {
    "name": "logged_in",
    "value": "yes",
    "domain": ".github.com",
    "path": "/"
  }
]
```

## Verificar la sesión

Para verificar que la autenticación funciona:

```bash
pr-visual-report capture --repo owner/repo --prs 1
```

Si la sesión es válida, verás `✓ Sesión válida`. Si no, verás un error indicando que debes ejecutar `login` nuevamente.

## Solución de problemas

### "Sesión inválida o expirada"
Las cookies expiraron. Ejecuta `pr-visual-report login` nuevamente.

### "No hay sesión guardada"
No has ejecutado `login` o el archivo `.github-cookies.json` no existe.

### El navegador no abre
Verifica que Playwright esté instalado correctamente:
```bash
npx playwright install chromium
```
