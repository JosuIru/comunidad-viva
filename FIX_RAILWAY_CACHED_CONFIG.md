# SOLUCIÓN: Railway Tiene Configuración en Caché

## Problema Identificado

Railway está mostrando el error:
```
Could not find root directory: /packages/web
```

Esto significa que **Railway tiene configuración almacenada** que está buscando el directorio `/packages/web` que ya no existe (lo renombramos a `web.backup`).

## Por Qué Sucede Esto

Railway almacena configuración del servicio en su base de datos cuando:
1. Detecta automáticamente un framework (en este caso, Next.js del paquete web)
2. Guarda esa configuración en "Service Settings"
3. Esta configuración **sobrescribe** los archivos `railway.json`, `nixpacks.toml`, etc.

## SOLUCIÓN CRÍTICA: Limpiar Configuración en Railway Web UI

Necesitas acceder a la interfaz web de Railway y **resetear la configuración del servicio**:

### Opción 1: Cambiar Root Directory en Service Settings (RECOMENDADO)

1. Ve a https://railway.app/
2. Abre el proyecto "truk"
3. Selecciona el servicio "truk"
4. Ve a **Settings** → **Service**
5. Busca la sección **"Root Directory"** o **"Source"**
6. Si está configurado como `packages/web`, cámbialo a `packages/backend`
7. Guarda los cambios
8. Haz clic en **"Redeploy"**

### Opción 2: Eliminar Framework Detection

1. En Service Settings
2. Busca **"Build Configuration"** o **"Framework"**
3. Si dice "Next.js", cámbialo a **"None"** o **"Custom"**
4. Asegúrate de que esté usando **Nixpacks** como builder
5. Guarda y redeploy

### Opción 3: Crear Nuevo Servicio (LAST RESORT)

Si las opciones anteriores no funcionan:

1. **Crear nuevo servicio** en Railway
2. Conectarlo al mismo repositorio GitHub
3. Configurar **Root Directory**: `packages/backend`
4. Configurar las mismas variables de entorno
5. Eliminar el servicio viejo

## Variables de Entorno a Copiar al Nuevo Servicio

```bash
DATABASE_URL=postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway
JWT_SECRET=DR8T/1ghx7jd7LBHGvNs33q5cTqRiP2jxlX7lORERc+TUs/+E6AusSvBhaoVtfbdSDAh3/xVjfIBj/i4/V/4Fw==
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://truk-production.up.railway.app
RAILWAY_ROOT_DIRECTORY=packages/backend
```

## Por Qué el Railway CLI No Funciona

El comando `railway logs` falla porque:
1. El CLI está tratando de acceder a logs de un deployment que está fallando muy temprano
2. El servicio crashea antes de generar logs accesibles
3. El CLI puede tener un bug con servicios que fallan en la fase de configuración

## Verificación de Que el Fix Funcionó

Después de aplicar cualquiera de las soluciones, deberías ver:

### En Build Logs:
```
=== NIXPACKS INSTALL PHASE ===
/app/packages/backend
Installing backend dependencies...
```

### En Deploy Logs:
```
=== STARTING TRUK BACKEND ===
DATABASE_URL is set: YES
JWT_SECRET is set: YES
Step 1: Generating Prisma Client...
Step 2: Synchronizing Database Schema...
Step 3: Checking if dist/main.js exists...
✓ dist/main.js found
Step 4: Starting NestJS Server...
```

### Health Check:
```bash
$ curl https://truk-production.up.railway.app/health
{"status":"ok","timestamp":"2025-11-24T..."}
```

## Timeline de Deployments Intentados

1. **Commits 1-5**: Configuración de archivos (railway.json, nixpacks.toml, etc.)
2. **Commit 6**: Renombrar packages/web a web.backup
3. **Commit 7**: Configurar RAILWAY_ROOT_DIRECTORY
4. **Resultado**: Railway sigue buscando /packages/web por configuración almacenada

## Conclusión

El problema **NO está en el código ni en los archivos de configuración**. Todo está correctamente configurado. El problema es que **Railway tiene configuración almacenada en su base de datos** que necesita ser limpiada manualmente desde la interfaz web.

Una vez que se corrija la configuración del servicio en Railway, el deployment debería funcionar inmediatamente porque:
- ✅ El código compila correctamente (verificado localmente)
- ✅ Todas las variables de entorno están configuradas
- ✅ Los archivos de configuración son correctos
- ✅ El script start.sh tiene validaciones y logging

**ACCIÓN REQUERIDA**: Acceder a Railway Web UI y seguir Opción 1 o 2 arriba.
