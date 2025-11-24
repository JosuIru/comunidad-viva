# Problemas de Deployment en Railway - Diagnóstico y Soluciones

## Resumen del Problema

El proyecto no inicia en Railway. El servicio devuelve error HTTP 502 con el mensaje:
```json
{"status":"error","code":502,"message":"Application failed to respond"}
```

## Fecha de Diagnóstico
24 de Noviembre, 2025

## Evidencia del Problema Original

Los logs iniciales mostraban que Railway estaba ejecutando el paquete **web** (Next.js) en lugar del **backend** (NestJS):

```
> @truk/web@1.0.0 start
> next start

Error: ENOENT: no such file or directory, open '/app/.next/prerender-manifest.json'
```

**Mensaje adicional del usuario**: "Could not find root directory: /packages/web"

## Configuraciones Aplicadas

### 1. `.railwayignore`
Actualizado para ignorar paquetes no necesarios:
```
packages/web
packages/blockchain
packages/shared
```

### 2. `railway.json`
Configurado para usar scripts del backend:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "bash build.sh",
    "watchPatterns": ["packages/backend/**"]
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
```

### 3. `nixpacks.toml`
Ya existía configuración correcta para el backend:
```toml
[phases.install]
cmds = ["cd packages/backend", "npm install"]

[phases.build]
cmds = ["cd packages/backend", "npx prisma generate", "npm run build"]

[start]
cmd = "cd packages/backend && bash start.sh"
```

### 4. `package.json` raíz
- Removido el campo `workspaces` para evitar que Railway detecte múltiples paquetes
- Agregado script `start` que apunta al backend
- Renombrado a `truk-backend` para mayor claridad

### 5. Variables de entorno Railway
- `NIXPACKS_NO_CACHE=1` - Para forzar rebuild sin caché
- `NIXPACKS_PATH=packages/backend` - Intento de especificar el path (puede no funcionar)
- `NODE_ENV=production`

## Problema Actual

A pesar de todas las configuraciones, el servicio sigue sin responder. El Railway CLI no puede mostrar los logs:
```
Failed to retrieve build log
```

Esto impide diagnosticar exactamente qué está fallando durante el build o el inicio.

## Posibles Causas

1. **Railway tiene configuración almacenada**: El servicio puede haber guardado la configuración de Next.js y está ignorando los archivos de configuración

2. **Problema con la estructura de monorepo**: Railway puede estar confundiéndose con la estructura de packages/

3. **Error en el build del backend**: Es posible que el build esté fallando pero no podemos ver los logs

4. **Problema con Prisma**: La migración de base de datos o generación de Prisma Client puede estar fallando

5. **Variables de entorno faltantes**: Pueden faltar variables de entorno críticas como JWT_SECRET, SOLANA_PRIVATE_KEY, etc.

## Soluciones Implementadas (24 Nov 2025)

### Solución 1: Renombrar el paquete web
Railway estaba detectando automáticamente el paquete `web` y ignorando las configuraciones. Se renombró:
```bash
mv packages/web packages/web.backup
```

**Commit**: `e6ba00f` - "fix: Rename packages/web to web.backup to force Railway to use backend"

### Solución 2: Configurar Variables de Entorno Faltantes

Se identificó que faltaban variables críticas:

```bash
railway variables --set "JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw=="
railway variables --set "PORT=8080"
railway variables --set "NODE_ENV=production"
```

Variables ahora configuradas:
- ✅ `DATABASE_URL` - PostgreSQL de Railway
- ✅ `JWT_SECRET` - Generado con openssl rand -base64 64
- ✅ `PORT` - 8080 (puerto estándar de Railway)
- ✅ `NODE_ENV` - production
- ✅ `NIXPACKS_NO_CACHE` - 1 (para forzar rebuild)
- ✅ `NIXPACKS_PATH` - packages/backend

### Solución 3: Remover npm workspaces

Se removió el campo `workspaces` del `package.json` raíz para evitar que Railway detecte múltiples paquetes:

**Commit**: `0f03b8f` - "fix: Remove npm workspaces to prevent Railway from detecting web package"

## Estado Actual del Deployment

### ❌ El servicio sigue sin responder (HTTP 502)

A pesar de todas las configuraciones aplicadas, el servicio continúa devolviendo:
```json
{"status":"error","code":502,"message":"Application failed to respond"}
```

### ✅ Build local funciona correctamente

```bash
cd /home/josu/truk
bash build.sh
# Output: ✓ Build successful! dist/main.js found
```

### ⚠️ Railway CLI no muestra logs

```bash
railway logs
# Output: Failed to retrieve build log
```

## Próximos Pasos Recomendados

### **PASO CRÍTICO: Acceder a la Interfaz Web de Railway** (RECOMENDADO)

El Railway CLI no está funcionando correctamente para mostrar logs. **Es IMPRESCINDIBLE** acceder a la interfaz web para diagnosticar el problema real:

1. Ir a https://railway.app/ e iniciar sesión
2. Navegar al proyecto "truk"
3. Abrir el servicio "truk" en el environment "production"
4. Revisar la pestaña "Deployments" para ver el último deployment
5. Hacer clic en el deployment activo para ver:
   - **Build Logs**: Verificar si el build completa correctamente
   - **Deploy Logs**: Ver qué está pasando cuando intenta iniciar la aplicación
   - **Runtime Logs**: Ver errores en tiempo de ejecución

URL directa del último deployment:
https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5/service/28b267e1-e4d0-4efe-b5ab-42d20e7beb15?id=580c3884-51f2-4234-abd9-39f577551535

### Posibles Causas del Error 502 Actual

1. **Error durante la generación de Prisma Client**
   - El script `start.sh` ejecuta `npx prisma generate`
   - Puede fallar si hay problemas con la base de datos

2. **Error durante `npx prisma db push`**
   - El script intenta sincronizar el schema con la base de datos
   - Puede fallar si hay migraciones pendientes o conflictos

3. **Error al iniciar NestJS**
   - Falta alguna variable de entorno crítica no identificada
   - Error en la conexión a PostgreSQL
   - Puerto incorrecto

4. **Timeout durante el startup**
   - El healthcheck timeout está configurado a 300 segundos
   - Si la aplicación tarda más en iniciar, Railway la mata

### Verificaciones Adicionales Recomendadas

#### 1. Verificar Variables de Entorno en Railway (interfaz web)

Variables que pueden estar faltando:
- `FRONTEND_URL` - URL del frontend para CORS
- `REDIS_URL` - Si la aplicación requiere Redis
- Variables de blockchain (SEMILLA_TOKEN_*, RPC URLs)

#### 2. Simplificar el script de inicio

Considerar crear un `start.sh` más simple que no haga `db push`:

```bash
#!/bin/bash
set -e

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting Server..."
node dist/main.js
```

#### 3. Verificar logs de PostgreSQL

En la interfaz de Railway, revisar si hay errores en el servicio de PostgreSQL

#### 4. Probar deployment desde la interfaz web

En lugar de usar `railway up`, intentar hacer trigger de un deployment desde la interfaz web de Railway usando el botón "Deploy"

### Verificación Local del Backend

El build local está funcionando correctamente:
```bash
cd /home/josu/truk
bash build.sh
cd packages/backend
bash start.sh
```

Esto confirma que el código del backend está bien y el problema es específico de Railway.

## Archivos Modificados

1. `.railwayignore` - Agregado exclusiones
2. `railway.json` - Configurado buildCommand y startCommand
3. `nixpacks.toml` - Agregado logging y dependsOn
4. `package.json` (raíz) - Removido workspaces, agregado start script
5. Variables de entorno en Railway

## URLs Útiles

- Build Logs (última ejecución): https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5/service/28b267e1-e4d0-4efe-b5ab-42d20e7beb15?id=cc3ddf86-1cc0-4bc9-a4fc-2cf49d077567
- Endpoint público: https://truk-production.up.railway.app
- Health check: https://truk-production.up.railway.app/health (actualmente retorna 502)

## Conclusión

El problema principal era que Railway estaba detectando y ejecutando el paquete `web` en lugar del `backend`. Se han aplicado múltiples configuraciones para forzar el uso del backend, pero el servicio sigue sin responder.

**Es necesario acceder a la interfaz web de Railway para ver los logs de build** y determinar exactamente qué está fallando. El Railway CLI no está mostrando los logs correctamente desde la terminal.
