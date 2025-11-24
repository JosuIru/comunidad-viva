# Railway Deployment Status - Truk Backend

## Última Actualización: 2025-11-21

## Problema Identificado

Railway estaba ejecutando el **frontend** (Next.js) en lugar del **backend** (NestJS), causando el error:
```
Error: ENOENT: no such file or directory, open '/app/.next/prerender-manifest.json'
```

Y también había problemas de conexión a PostgreSQL:
```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

## Soluciones Aplicadas

### 1. Configuración de nixpacks.toml ✅
Actualizado para forzar la ejecución solo del backend:
```toml
[phases.install]
cmds = [
  "cd packages/backend",
  "npm install"
]

[phases.build]
cmds = [
  "cd packages/backend",
  "npx prisma generate",
  "npm run build"
]

[start]
cmd = "cd packages/backend && bash start.sh"
```

### 2. Actualización de .nixpacksignore ✅
Excluye completamente el frontend y blockchain:
```
# Ignore frontend package completely
packages/web/
packages/web/**
**/packages/web/**

# Ignore blockchain package
packages/blockchain/
packages/blockchain/**
```

### 3. DATABASE_URL Configurada ✅
```bash
railway variables --set "DATABASE_URL=postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway"
```

### 4. Commit y Push ✅
```
Commit: 133fdac - "fix: Configure Railway to deploy only backend package"
Branch: main
```

## Estado Actual del Deployment

### Backend (truk service)
- **Status**: DEPLOYING o FAILED
- **URL**: https://truk-production.up.railway.app
- **Health Check**: Retorna 502 Bad Gateway (servicio aún no disponible)

### PostgreSQL
- **Status**: Desconocido (posiblemente RUNNING o CRASHED)
- **URL Pública**: gondola.proxy.rlwy.net:53043

## Próximos Pasos

### Verificar en Railway Dashboard

1. **Ir al proyecto**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5

2. **Verificar PostgreSQL**:
   - Hacer clic en el servicio "Postgres"
   - Verificar que esté en estado RUNNING
   - Si está CRASHED, hacer clic en "Restart"

3. **Verificar Backend (servicio "truk")**:
   - Ir a la pestaña "Deployments"
   - Buscar el deployment con commit `133fdac`
   - Revisar los logs para ver:
     - ¿Se está compilando correctamente?
     - ¿Prisma se conecta a la base de datos?
     - ¿El servidor arranca sin errores?

4. **Buscar en los logs**:
   ```
   ✓ Generated Prisma Client
   Step 2: Synchronizing Database Schema...
   Step 3: Starting NestJS Server...
   [Nest] INFO [InstanceLoader] AppModule dependencies initialized
   Application is running on: http://[::]:XXXX
   ```

### Si los Logs Muestran Errores

#### Error de BASE DE DATOS:
```bash
# En Railway Dashboard > Variables
# Verificar que DATABASE_URL use gondola.proxy.rlwy.net
# NO debe usar postgres.railway.internal
```

#### Error "Cannot find module" o build failures:
```bash
# Verificar que nixpacks.toml esté correctamente configurado
# Verificar que packages/backend/package.json tenga todas las dependencias
```

#### Error "packages/web" aparece en los logs:
```bash
# Significa que .nixpacksignore no funcionó
# Solución: Configurar "Root Directory = packages/backend" en Settings > Service
```

## Alternativa: Deployment Manual

Si Railway sigue sin funcionar automáticamente, puedes configurar manualmente:

### Opción A: Root Directory en Railway Dashboard
1. Ir al servicio "truk" > Settings > Service
2. Establecer **Root Directory**: `packages/backend`
3. Guardar y redesplegar

### Opción B: Crear un Nuevo Servicio Solo para Backend
1. En el dashboard del proyecto, clic en "+ New Service"
2. Conectar al mismo repositorio de GitHub
3. Configurar:
   - Name: `backend`
   - Root Directory: `packages/backend`
   - Build Command: (automático desde nixpacks.toml)
   - Start Command: (automático desde nixpacks.toml)
4. Copiar todas las variables de entorno del servicio antiguo

## Verificación Final

Una vez que el backend esté RUNNING:

```bash
# Test desde local:
curl https://truk-production.up.railway.app/health

# Debería devolver:
{"status":"ok"}
```

## Frontend Deployment (Pendiente)

Una vez que el backend funcione, crear un servicio separado para el frontend:

1. Crear nuevo servicio en Railway
2. Root Directory: `packages/web`
3. Variable de entorno:
   ```
   NEXT_PUBLIC_API_URL=https://truk-production.up.railway.app
   ```

## Documentación Adicional

- `DEPLOYMENT_RAILWAY.md` - Guía completa de deployment
- `TROUBLESHOOTING_RAILWAY.md` - Guía de solución de problemas paso a paso

---

**Últimos cambios aplicados**:
- ✅ nixpacks.toml configurado para backend-only
- ✅ .nixpacksignore actualizado para excluir frontend
- ✅ DATABASE_URL configurada con proxy público
- ✅ Código pusheado a main (commit 133fdac)
- ⏳ Esperando deployment automático de Railway

**Estado backend**: 502 Bad Gateway (deployment en progreso o fallando)
