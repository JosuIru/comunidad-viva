# Configuración Final de Railway - Servicios Detenidos

## Estado Actual
🔴 **Todos los servicios están detenidos**

Necesitas arrancar y configurar correctamente los 3 servicios:

---

## 1. PostgreSQL (Base de Datos)

### Acciones:
1. Ve a Railway Dashboard → Servicio **"Postgres"**
2. **Restart** el servicio
3. Espera a que esté en estado **RUNNING**

### Variables:
- **No necesita configuración adicional** - Railway lo gestiona automáticamente

---

## 2. Backend (NestJS API)

### Identificación:
- **Nombre del servicio**: "backend"
- **URL**: https://backend-production-6c222.up.railway.app

### Configuración Requerida:

#### Settings > Service:
- **Root Directory**: `packages/backend` ⚠️ **IMPORTANTE**
- **Build Command**: (Detectado automáticamente por nixpacks.toml)
- **Start Command**: (Detectado automáticamente por nixpacks.toml)

#### Settings > Variables:
```bash
# OBLIGATORIA - Conexión a PostgreSQL
DATABASE_URL=postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway

# Opcional - Configuración JWT
JWT_SECRET=<tu-jwt-secret>

# Opcional - Puerto (Railway lo asigna automáticamente)
PORT=3000
```

### Acciones:
1. Configurar **Root Directory = `packages/backend`**
2. Verificar que **DATABASE_URL** use `gondola.proxy.rlwy.net` (NO `postgres.railway.internal`)
3. **Deploy** o **Redeploy** el servicio
4. Esperar 2-3 minutos para el build
5. Verificar que esté **RUNNING**

### Verificación:
```bash
curl https://backend-production-6c222.up.railway.app/health
# Debe devolver: {"status":"ok","timestamp":"...","uptime":...}
```

---

## 3. Frontend (Next.js Web App)

### Identificación:
- **Nombre del servicio**: "truk"
- **URL**: https://truk-production.up.railway.app

### Configuración Requerida:

#### Settings > Service:
- **Root Directory**: `packages/web` ⚠️ **IMPORTANTE**
- **Build Command**: (Detectado automáticamente - Next.js)
- **Start Command**: (Detectado automáticamente - Next.js)

#### Settings > Variables:
```bash
# OBLIGATORIA - URL del backend
NEXT_PUBLIC_API_URL=https://backend-production-6c222.up.railway.app

# OBLIGATORIA - URL del frontend (después del deployment)
NEXT_PUBLIC_APP_URL=https://truk-production.up.railway.app

# Opcional - WebSocket
NEXT_PUBLIC_WS_URL=wss://backend-production-6c222.up.railway.app

# Opcional - Mapas
NEXT_PUBLIC_MAP_CENTER_LAT=40.4168
NEXT_PUBLIC_MAP_CENTER_LNG=-3.7038
NEXT_PUBLIC_MAP_ZOOM=12
```

### Acciones:
1. Configurar **Root Directory = `packages/web`**
2. Configurar **NEXT_PUBLIC_API_URL** con la URL del backend
3. **Deploy** o **Redeploy** el servicio
4. Esperar 3-5 minutos para el build (Next.js tarda más)
5. Verificar que esté **RUNNING**

### Verificación:
```bash
curl -I https://truk-production.up.railway.app
# Debe devolver: HTTP/2 200
```

---

## Orden de Arranque Recomendado

### Paso 1: PostgreSQL
```
1. Restart PostgreSQL
2. Esperar a que esté RUNNING (verde)
```

### Paso 2: Backend
```
1. Configurar Root Directory = packages/backend
2. Verificar DATABASE_URL
3. Deploy
4. Esperar 2-3 minutos
5. Verificar /health endpoint
```

### Paso 3: Frontend
```
1. Configurar Root Directory = packages/web
2. Configurar NEXT_PUBLIC_API_URL
3. Deploy
4. Esperar 3-5 minutos
5. Abrir en navegador
```

---

## Problemas Comunes y Soluciones

### PostgreSQL no arranca
**Síntoma**: Servicio crashed o failed
**Solución**:
- Ve a la pestaña "Logs" del servicio Postgres
- Busca errores de volumen o límites de recursos
- Puede que necesites recrear el servicio si el volumen está corrupto

### Backend arranca pero cae inmediatamente
**Síntoma**: Servicio reiniciándose constantemente
**Solución**:
1. Verificar que PostgreSQL esté RUNNING primero
2. Verificar DATABASE_URL en los logs
3. Verificar que Root Directory = `packages/backend`
4. Ver logs para identificar el error específico

### Frontend devuelve 502
**Síntoma**: Error "Bad Gateway" al acceder
**Solución**:
1. Verificar que Root Directory = `packages/web`
2. Ver logs del build - puede que haya fallado
3. Verificar que todas las variables NEXT_PUBLIC_* estén configuradas
4. El build de Next.js puede tardar hasta 5 minutos

### Frontend arranca pero no conecta con el backend
**Síntoma**: Frontend carga pero no obtiene datos
**Solución**:
1. Abrir consola del navegador (F12)
2. Ver Network tab - buscar errores CORS
3. Verificar que NEXT_PUBLIC_API_URL sea correcta
4. Verificar que el backend esté accesible

---

## Checklist Final

Marca cada item cuando lo completes:

### PostgreSQL:
- [ ] Servicio en estado RUNNING
- [ ] Volumen montado correctamente
- [ ] No hay errores en los logs

### Backend:
- [ ] Root Directory = `packages/backend`
- [ ] DATABASE_URL configurada con proxy público
- [ ] Servicio en estado RUNNING
- [ ] `/health` endpoint responde 200
- [ ] Logs muestran "Application is running on..."

### Frontend:
- [ ] Root Directory = `packages/web`
- [ ] NEXT_PUBLIC_API_URL configurada
- [ ] Servicio en estado RUNNING
- [ ] URL principal responde 200
- [ ] Puede hacer login y ver datos

---

## URLs de Referencia

- **Railway Dashboard**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
- **Backend**: https://backend-production-6c222.up.railway.app
- **Frontend**: https://truk-production.up.railway.app
- **PostgreSQL**: gondola.proxy.rlwy.net:53043

---

## Archivos de Configuración Locales

Estos archivos ya están configurados correctamente en el repositorio:

- `/nixpacks.toml` - Configuración del build del backend (ROOT)
- `/packages/backend/nixpacks.toml` - Configuración del backend
- `/packages/web/nixpacks.toml` - Configuración del frontend
- `/railway.json` - Configuración general de Railway

**No necesitas modificar estos archivos** - solo configurar el Root Directory en Railway.

---

**Última actualización**: 2025-11-21 22:50 UTC
**Estado**: Todos los servicios detenidos - Requieren configuración y restart
