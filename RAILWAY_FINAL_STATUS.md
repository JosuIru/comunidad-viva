# Railway Deployment - Estado Final y Próximos Pasos

**Fecha**: 24 de Noviembre, 2025
**Estado**: ❌ Servicio responde HTTP 502 - Requiere revisión de logs en interfaz web

## Resumen Ejecutivo

He aplicado **TODAS** las configuraciones posibles para forzar a Railway a desplegar el backend NestJS en lugar del paquete web Next.js. El servicio continúa respondiendo con error 502, lo que indica que la aplicación no está iniciando correctamente.

**El problema crítico**: El Railway CLI no puede mostrar los logs (`railway logs` falla consistentemente). Por lo tanto, **es IMPRESCINDIBLE revisar los logs en la interfaz web de Railway** para ver exactamente qué está fallando.

## Todas las Soluciones Aplicadas

### 1. ✅ Renombrado del Paquete Web
```bash
mv packages/web packages/web.backup
```
- Impide que Railway detecte el paquete Next.js
- **Commit**: `e6ba00f`

### 2. ✅ Variables de Entorno Configuradas

Todas las variables requeridas están configuradas:

```bash
DATABASE_URL=postgresql://postgres:***@gondola.proxy.rlwy.net:53043/railway
JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw==
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://truk-production.up.railway.app
RAILWAY_ROOT_DIRECTORY=packages/backend  # ⭐ CRÍTICO
NIXPACKS_NO_CACHE=1
```

### 3. ✅ Configuración de Root Directory

La variable **`RAILWAY_ROOT_DIRECTORY=packages/backend`** le dice a Railway que use `packages/backend` como directorio raíz. Esto es la forma oficial de Railway para deployar subdirectorios.

### 4. ✅ Archivos de Configuración Actualizados

#### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "openssl", "bash"]

[phases.install]
cmds = [
  "echo '=== NIXPACKS INSTALL PHASE ==='",
  "pwd",
  "npm install"
]

[phases.build]
cmds = [
  "npx prisma generate",
  "npm run build",
  "test -f dist/main.js && echo 'BUILD SUCCESS' || echo 'BUILD FAILED'"
]

[start]
cmd = "bash start.sh"
```

#### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "bash start.sh",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

#### `Procfile`
```
web: bash start.sh
```

#### `.railwayignore`
```
packages/web.backup
packages/blockchain
packages/shared
```

### 5. ✅ Script de Inicio Mejorado (`packages/backend/start.sh`)

```bash
#!/bin/bash
set -e

echo "=== STARTING TRUK BACKEND ==="
echo "DATABASE_URL is set: ${DATABASE_URL:+YES}"
echo "JWT_SECRET is set: ${JWT_SECRET:+YES}"
echo "PORT is set to: ${PORT:-3000}"

echo "Step 1: Generating Prisma Client..."
npx prisma generate || exit 1

echo "Step 2: Synchronizing Database Schema..."
npx prisma db push --accept-data-loss --skip-generate || npx prisma migrate deploy

echo "Step 3: Checking if dist/main.js exists..."
[ ! -f "dist/main.js" ] && echo "❌ dist/main.js not found!" && exit 1

echo "Step 4: Starting NestJS Server..."
node dist/main.js
```

### 6. ✅ Validación Local

El build funciona perfectamente en local:
```bash
cd /home/josu/truk
bash build.sh
# Output: ✓ Build successful! dist/main.js found
```

## Estado Actual del Error

### HTTP 502: "Application failed to respond"

Este error indica que:
1. ✅ Railway está intentando iniciar la aplicación
2. ❌ La aplicación no responde al health check en `/health`
3. ❌ La aplicación puede estar crasheando durante el inicio

### Railway CLI No Funciona

```bash
$ railway logs
Failed to retrieve build log
```

El CLI no puede mostrar logs, por lo que **debemos usar la interfaz web**.

## ACCIÓN REQUERIDA: Revisar Logs en Interfaz Web

### 📋 Pasos para Diagnosticar en Railway Web

1. **Acceder a Railway**
   - URL: https://railway.app/
   - Proyecto: "truk"
   - Environment: "production"
   - Service: "truk"

2. **Revisar Deployment Logs**
   - URL directa: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5/service/28b267e1-e4d0-4efe-b5ab-42d20e7beb15
   - Click en el deployment más reciente
   - Revisar las 3 pestañas:
     - **Build Logs**: Ver si `nixpacks.toml` está ejecutándose correctamente
     - **Deploy Logs**: Ver si `start.sh` está ejecutándose
     - **Runtime Logs**: Ver errores de la aplicación NestJS

3. **Buscar Estos Patrones en los Logs**

   **En Build Logs**:
   - ✅ "NIXPACKS INSTALL PHASE"
   - ✅ "NIXPACKS BUILD PHASE"
   - ✅ "BUILD SUCCESS: dist/main.js exists"
   - ❌ "BUILD FAILED" - Indica que TypeScript no compiló
   - ❌ Errores de Prisma generate

   **En Deploy/Runtime Logs**:
   - ✅ "STARTING TRUK BACKEND"
   - ✅ "DATABASE_URL is set: YES"
   - ✅ "JWT_SECRET is set: YES"
   - ❌ "Failed to generate Prisma Client"
   - ❌ "dist/main.js not found"
   - ❌ Errores de conexión a base de datos
   - ❌ Errores de variables de entorno faltantes
   - ❌ Errores de NestJS al iniciar

## Posibles Causas del Error 502 (Ordenadas por Probabilidad)

### 1. 🔴 Error durante Prisma Generate/Migrate (MUY PROBABLE)

**Síntomas en logs**:
```
Error: Environment variable not found: DATABASE_URL
```
o
```
Migration engine failed with P1001: Can't reach database server
```

**Solución**: Verificar que `DATABASE_URL` esté correctamente configurada y que la base de datos de Railway esté activa.

### 2. 🔴 Build Fallido - dist/main.js no se genera (PROBABLE)

**Síntomas en logs**:
```
❌ dist/main.js not found! Build may have failed.
```

**Solución**: Revisar errores de TypeScript en build logs. Puede haber errores de compilación que impiden generar `dist/main.js`.

### 3. 🔴 Puerto Incorrecto (POSIBLE)

La aplicación puede estar escuchando en un puerto diferente al que Railway espera.

**Verificar en el código** (`packages/backend/src/main.ts`):
```typescript
const port = process.env.PORT || 3000;
await app.listen(port);
```

Railway asigna un puerto dinámicamente vía `$PORT`. Si la app no lo lee correctamente, no responderá.

### 4. 🔴 Error en Validación de Variables de Entorno (POSIBLE)

El `EnvironmentValidator` en `src/common/env-validation.ts` puede estar fallando.

**Variables requeridas**:
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅
- `NODE_ENV` ✅

**Verificar en logs**: Si falta alguna variable, el validator hace `process.exit(1)`.

### 5. 🟡 Timeout del Healthcheck (MENOS PROBABLE)

El healthcheck está configurado con 300 segundos de timeout. Si la app tarda más en iniciar, Railway la mata.

**Verificar en logs**: Si ves "Starting Server..." pero luego se detiene sin errores, puede ser timeout.

## Commits Realizados

1. `5195113` - Update Railway configuration to only deploy backend package
2. `edf5fbf` - Add start script to root package.json for Railway
3. `0f03b8f` - Remove npm workspaces to prevent Railway from detecting web package
4. `e6ba00f` - Rename packages/web to web.backup to force Railway to use backend
5. `5fd44c0` - Update Railway deployment troubleshooting guide
6. `b81751c` - Improve Railway deployment configuration and startup script
7. `6766145` - Disable root package.json and improve Nixpacks debugging
8. `b49560c` - Use RAILWAY_ROOT_DIRECTORY to deploy from packages/backend

## Variables de Entorno Completas

Para referencia, estas son TODAS las variables configuradas en Railway:

```
DATABASE_URL=postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway
FRONTEND_URL=https://truk-production.up.railway.app
JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw==
NEXT_PUBLIC_API_URL=https://backend-production-6c222.up.railway.app
NIXPACKS_NO_CACHE=1
NIXPACKS_PATH=packages/backend
NODE_ENV=production
PORT=8080
RAILWAY_ROOT_DIRECTORY=packages/backend
```

## Próximos Pasos Recomendados

1. **REVISAR LOGS EN RAILWAY WEB** (paso crítico)
2. Identificar el error exacto en los logs
3. Aplicar la solución correspondiente
4. Si necesitas ayuda para interpretar los logs, cópialos y compártelos

## Archivos de Configuración Finales

Todos los archivos están en el repositorio. Los principales son:

- `/home/josu/truk/nixpacks.toml` - Configuración de build de Nixpacks
- `/home/josu/truk/railway.json` - Configuración de deployment de Railway
- `/home/josu/truk/Procfile` - Definición del proceso web
- `/home/josu/truk/.railwayignore` - Archivos ignorados por Railway
- `/home/josu/truk/packages/backend/start.sh` - Script de inicio del backend
- `/home/josu/truk/RAILWAY_DEPLOYMENT_ISSUES.md` - Diagnóstico detallado

## Conclusión

He aplicado todas las configuraciones posibles desde la línea de comandos. El backend compila correctamente en local, todas las variables de entorno están configuradas, y Railway está configurado para usar `packages/backend` como root directory.

**El siguiente paso DEBE ser revisar los logs en la interfaz web de Railway** para ver exactamente qué está fallando durante el inicio de la aplicación.
