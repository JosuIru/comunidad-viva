# Troubleshooting - Backend y Base de Datos Crashed en Railway

## Estado Actual
- **Backend**: CRASHED/FAILED
- **Base de Datos PostgreSQL**: CRASHED/FAILED  
- **Deployment ID**: 11b3c559-0a9f-412d-893a-62768eda0643

## Acciones Inmediatas desde Railway Dashboard

### 1. Verificar el estado de PostgreSQL

**URGENTE**: La base de datos PostgreSQL no debería estar crashed. Si está crashed:

1. Ir a: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
2. Hacer clic en el servicio **"Postgres"**
3. Ver los logs para entender por qué crashed
4. **Restart** el servicio de PostgreSQL si está stopped

**Posibles causas del crash de Postgres:**
- Railway alcanzó límites de recursos (RAM/CPU)
- El volumen de datos se llenó
- Problema de configuración

### 2. Verificar logs del último deployment del backend

1. Ir al servicio **"truk"** (backend)
2. Pestaña **"Deployments"**
3. Hacer clic en el deployment **11b3c559-0a9f-412d-893a-62768eda0643**
4. Ver los **"Logs"** completos

**Buscar específicamente:**

#### A) Errores de build:
```
Error: Cannot find module
npm ERR!
Build failed
```

#### B) Errores de database:
```
P1001: Can't reach database server
P1002: The database server was reached but timed out
Connection refused
```

#### C) Errores de runtime:
```
TypeError:
ReferenceError:
Cannot read property
```

### 3. Verificar variables de entorno

En el servicio "truk" (backend), ir a **Settings > Variables** y verificar:

```bash
✓ DATABASE_URL = postgresql://postgres:...@gondola.proxy.rlwy.net:53043/railway
✓ PORT = (debería estar auto-configurado por Railway)
✓ NODE_ENV = production (opcional)
```

**IMPORTANTE**: 
- Si hay UNA variable DATABASE_URL con `postgres.railway.internal`, ELIMÍNALA
- Solo debe haber UNA variable DATABASE_URL con la URL del proxy público

### 4. Verificar configuración del servicio

En el servicio "truk", ir a **Settings > Service** y verificar:

- **Root Directory**: Debe estar vacío o en `/`
- **Build Command**: Debe usar nixpacks (detectado automáticamente)
- **Start Command**: Debe ejecutar el comando de `railway.json` o `nixpacks.toml`

## Soluciones Según el Error

### Si el error es: "packages/web not found" o "Next.js error"

**Causa**: Railway sigue detectando el frontend a pesar del `.nixpacksignore`

**Solución**:
1. En el dashboard, ir al servicio "truk"
2. Settings > Service
3. Establecer **Root Directory** = `packages/backend`
4. Hacer un nuevo deployment

Esto forzará a Railway a solo ver el backend.

### Si el error es: "Cannot connect to database"

**Causa**: DATABASE_URL incorrecta o PostgreSQL crashed

**Solución**:
1. Verificar que PostgreSQL esté **RUNNING** (no crashed)
2. Si está crashed, hacer **Restart**
3. Verificar DATABASE_URL en variables (debe usar gondola.proxy.rlwy.net)
4. Redesplegar el backend después de que Postgres esté corriendo

### Si el error es: "ENOENT: no such file or directory"

**Causa**: Archivos del build no existen o build falló

**Solución**:
1. Ver los logs completos del build
2. Buscar dónde falló el build:
   - ¿Falló `npm install`?
   - ¿Falló `npx prisma generate`?
   - ¿Falló `./build.sh`?
3. Si falló por falta de dependencias, verificar que `nixpacks.toml` instale correctamente

### Si el error es: "Port already in use" o "EADDRINUSE"

**Causa**: Múltiples instancias tratando de usar el mismo puerto

**Solución**:
1. Railway asigna automáticamente el PORT
2. Verificar que el backend use `process.env.PORT`
3. Verificar en `packages/backend/src/main.ts` que el puerto sea dinámico

## Configuración Alternativa: Separar Servicios

Si nada funciona con el monorepo, la mejor solución es:

### Opción A: Separar Backend y Frontend en Servicios Distintos

**Para el Backend:**
1. Crear nuevo servicio "backend"
2. Root Directory: `packages/backend`
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `bash start.sh`
5. Variables: DATABASE_URL con la URL del proxy

**Para el Frontend:**
1. Crear nuevo servicio "frontend"  
2. Root Directory: `packages/web`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Variables: NEXT_PUBLIC_API_URL con la URL del backend

### Opción B: Usar Railway CLI para forzar configuración

Desde local:
```bash
cd packages/backend
railway up --service backend
```

## Información Útil

- **Dashboard del Proyecto**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
- **Último commit**: cc03256 (fix: Exclude packages/web from backend deployment)
- **Build logs URL**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5/service/28b267e1-e4d0-4efe-b5ab-42d20e7beb15?id=11b3c559-0a9f-412d-893a-62768eda0643

## Checklist de Verificación

- [ ] PostgreSQL está RUNNING (no crashed)
- [ ] DATABASE_URL apunta a gondola.proxy.rlwy.net (no postgres.railway.internal)
- [ ] Solo hay UNA variable DATABASE_URL (sin duplicados)
- [ ] Los logs del build muestran que completó exitosamente
- [ ] Los logs del runtime no muestran errores de conexión a DB
- [ ] El backend arrancó y escucha en el puerto correcto

## Próximos Pasos Recomendados

1. **Primero**: Arreglar PostgreSQL si está crashed (hacer restart)
2. **Segundo**: Configurar Root Directory = `packages/backend` en el servicio truk
3. **Tercero**: Redesplegar el backend
4. **Cuarto**: Crear servicio separado para el frontend si el backend funciona

---

**Nota**: Sin acceso visual al dashboard de Railway, no puedo ver los logs exactos ni hacer cambios en la configuración. Necesitas realizar estos pasos manualmente desde la interfaz web de Railway.
