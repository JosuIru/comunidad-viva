# ✅ Deployment Completo - Truk

## Estado Actual

### Backend: ✅ FUNCIONANDO
- **URL**: https://backend-production-6c222.up.railway.app
- **Health Check**: ✅ Responde correctamente
  ```json
  {"status":"ok","timestamp":"2025-11-21T22:34:52.159Z","uptime":108662}
  ```
- **Uptime**: ~30 horas funcionando sin interrupciones

### PostgreSQL: ✅ RUNNING
- **Host**: gondola.proxy.rlwy.net:53043
- **Database**: railway

### Frontend: ⚠️ PENDIENTE DE DEPLOYMENT
Necesita ser desplegado con la configuración correcta.

---

## Configuración del Frontend para Railway

### Variables de Entorno Necesarias

Configura estas variables en el servicio de frontend en Railway:

```bash
# URL del backend (OBLIGATORIA)
NEXT_PUBLIC_API_URL=https://backend-production-6c222.up.railway.app

# URL de la aplicación frontend (después del deployment)
NEXT_PUBLIC_APP_URL=https://[TU-FRONTEND-URL].up.railway.app

# WebSocket URL (opcional, si usas sockets)
NEXT_PUBLIC_WS_URL=wss://backend-production-6c222.up.railway.app

# Configuración de mapas (opcional)
NEXT_PUBLIC_MAP_CENTER_LAT=40.4168
NEXT_PUBLIC_MAP_CENTER_LNG=-3.7038
NEXT_PUBLIC_MAP_ZOOM=12

# Feature flags (opcional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

---

## Pasos para Desplegar el Frontend

### Opción 1: Desde Railway Dashboard (Recomendado)

1. **Accede al proyecto en Railway**:
   https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5

2. **Crea un nuevo servicio**:
   - Clic en "+ New Service"
   - Seleccionar "GitHub Repo"
   - Conectar al repositorio: `josuiru/truk` (o el que uses)
   - Branch: `main`

3. **Configura el servicio**:
   - **Service Name**: `frontend` o `web`
   - **Root Directory**: `packages/web`
   - Railway detectará automáticamente Next.js

4. **Configura las variables de entorno**:
   - Ve a Settings > Variables
   - Añade todas las variables listadas arriba
   - **IMPORTANTE**: Asegúrate de incluir `NEXT_PUBLIC_API_URL`

5. **Deploy**:
   - Railway desplegará automáticamente
   - Espera 3-5 minutos para el build
   - Railway asignará una URL automáticamente

6. **Actualiza NEXT_PUBLIC_APP_URL**:
   - Una vez tengas la URL del frontend, actualiza la variable
   - Ejemplo: `NEXT_PUBLIC_APP_URL=https://web-production-abc123.up.railway.app`
   - Redesplegar si es necesario

### Opción 2: Desde Railway CLI

```bash
# 1. Navega al directorio del frontend
cd packages/web

# 2. Asegúrate de estar en el proyecto correcto
railway link

# 3. Crea un nuevo servicio o usa uno existente
railway service

# 4. Configura las variables de entorno
railway variables --set "NEXT_PUBLIC_API_URL=https://backend-production-6c222.up.railway.app"

# 5. Despliega
railway up
```

---

## Verificación Post-Deployment

### 1. Verifica el Backend
```bash
curl https://backend-production-6c222.up.railway.app/health
# Debe devolver: {"status":"ok","timestamp":"...","uptime":...}
```

### 2. Verifica el Frontend
```bash
curl -I https://[TU-FRONTEND-URL].up.railway.app
# Debe devolver: HTTP/2 200
```

### 3. Prueba la Integración
1. Abre el frontend en el navegador
2. Abre la consola del navegador (F12)
3. Verifica que las peticiones al backend funcionen:
   - Network tab debe mostrar peticiones a `backend-production-6c222.up.railway.app`
   - No debe haber errores CORS
   - Las peticiones deben devolver 200 OK

---

## Configuración CORS en el Backend

Si el frontend muestra errores CORS, necesitas actualizar la configuración del backend:

### Archivo: `packages/backend/src/main.ts`

Asegúrate de que el backend permite el origen del frontend:

```typescript
app.enableCors({
  origin: [
    'https://[TU-FRONTEND-URL].up.railway.app',
    'http://localhost:3000', // Para desarrollo
  ],
  credentials: true,
});
```

---

## URLs Finales del Sistema

Una vez completado el deployment:

### Backend (API)
```
https://backend-production-6c222.up.railway.app
```

### Frontend (Web App)
```
https://[TU-FRONTEND-URL].up.railway.app
```

### PostgreSQL (Interno)
```
gondola.proxy.rlwy.net:53043/railway
```

---

## Arquitectura del Deployment

```
┌─────────────────────────────────────────────────┐
│           Railway Project: truk                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌────────────────┐       ┌──────────────────┐ │
│  │   PostgreSQL   │◄──────│     Backend      │ │
│  │   (Postgres)   │       │   (NestJS API)   │ │
│  │  Port: 53043   │       │   Node.js 18     │ │
│  └────────────────┘       └──────────────────┘ │
│                                  ▲              │
│                                  │ HTTPS        │
│                                  │              │
│                           ┌──────────────────┐  │
│                           │    Frontend      │  │
│                           │   (Next.js SSR)  │  │
│                           │   Node.js 18     │  │
│                           └──────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
                    │
                    │ Public HTTPS
                    │
                    ▼
            👤 Users (Browser)
```

---

## Troubleshooting

### El frontend no conecta con el backend

**Síntoma**: Error "Network Error" o "Failed to fetch"

**Solución**:
1. Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente
2. Verifica que el backend esté ejecutándose (`curl` al /health)
3. Revisa los logs del backend en Railway para errores CORS

### El backend está caído

**Síntoma**: `/health` devuelve 502 o timeout

**Solución**:
1. Ve al servicio "backend" en Railway Dashboard
2. Revisa los logs en la pestaña "Deployments"
3. Verifica que DATABASE_URL esté correctamente configurada
4. Restart el servicio si es necesario

### Error de build en el frontend

**Síntoma**: Build falla en Railway

**Solución**:
1. Verifica que `Root Directory = packages/web`
2. Verifica que todas las variables `NEXT_PUBLIC_*` estén configuradas
3. Revisa los logs del build para errores específicos

---

## Documentación Adicional

- `RAILWAY_STATUS.md` - Estado detallado del deployment
- `DEPLOYMENT_RAILWAY.md` - Guía de deployment completa
- `TROUBLESHOOTING_RAILWAY.md` - Solución de problemas

---

**Fecha**: 2025-11-21
**Backend Status**: ✅ Funcionando (uptime: 30+ horas)
**Frontend Status**: ⚠️ Pendiente de deployment
**Base de Datos**: ✅ Funcionando
