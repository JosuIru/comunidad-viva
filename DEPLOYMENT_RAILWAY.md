# Guía de Deployment en Railway - Truk (Comunidad Viva)

## Estado Actual del Deployment

### ✅ Completado:
1. DATABASE_URL configurado con proxy público de Railway
2. Código fuente pusheado a GitHub (commit c9d4563)
3. Deployment del backend iniciado con nueva configuración
4. Archivos de configuración del frontend listos (nixpacks.toml, railway.json)

### ⚠️ En Progreso:
1. Backend desplegado pero aún no responde (verificar logs en Railway dashboard)
2. Frontend NO desplegado aún (requiere crear servicio separado)

## Problema Identificado con el Backend

El backend estaba en un ciclo de reinicios debido a error de conexión PostgreSQL:
```
Error: P1001: Can't reach database server at `postgres.railway.internal:5432`
```

**Solución aplicada:**
- Configuré DATABASE_URL manualmente con la URL del proxy público:
  ```
  postgresql://postgres:mWskoEyaTIsdbiuABLltyhOkPVMdXaJC@gondola.proxy.rlwy.net:53043/railway
  ```

## Arquitectura del Deployment

Tu aplicación necesita **3 servicios** en Railway:

1. **PostgreSQL** (Base de datos) ✅ Ya existe
2. **Backend** (NestJS/Node.js API) ⚠️ Configurado, esperando que responda
3. **Frontend** (Next.js Web App) ❌ Pendiente de crear

## Pasos para Completar el Deployment

### Paso 1: Verificar Backend

1. Ir al dashboard de Railway: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
2. Abrir el servicio "truk" (backend)
3. Ver la pestaña "Deployments"
4. Verificar el último deployment (ID: dd3fe276-32bf-424f-a5f4-08dce4a16df5)
5. Revisar los logs para confirmar:
   - ✅ Prisma se conecta exitosamente a la base de datos
   - ✅ El servidor arranca sin errores
   - ✅ El healthcheck endpoint /health responde

**Si el backend sigue fallando:**
- Verificar que la variable DATABASE_URL esté correctamente configurada
- Puede que Railway tenga una "Service Variable" automática que está sobrescribiendo tu configuración manual
- Necesitarás ir a Settings > Variables y asegurarte que DATABASE_URL apunte a la URL del proxy público

### Paso 2: Crear Servicio para el Frontend

1. En el dashboard del proyecto "truk", hacer clic en "+ New Service"
2. Seleccionar "GitHub Repo"
3. Conectar al mismo repositorio: https://github.com/josuiru/truk
4. Configurar el servicio:
   - **Name**: `truk-frontend` o `web`
   - **Root Directory**: `packages/web`
   - **Build Command**: Detectará automáticamente de nixpacks.toml
   - **Start Command**: Detectará automáticamente de nixpacks.toml

### Paso 3: Configurar Variables del Frontend

El frontend necesita estas variables de entorno:

```bash
NEXT_PUBLIC_API_URL=https://truk-production.up.railway.app
```

(Asumiendo que el backend responde en esa URL, de lo contrario usa la URL correcta del backend)

### Paso 4: Desplegar el Frontend

1. Railway detectará automáticamente los archivos:
   - `packages/web/nixpacks.toml`
   - `packages/web/railway.json`
2. El deployment iniciará automáticamente
3. Esperar a que el build complete (puede tomar 2-3 minutos)
4. Railway asignará automáticamente una URL pública para el frontend

### Paso 5: Verificar Todo Funciona

1. **Backend**: Visita `https://truk-production.up.railway.app/health`
   - Debería devolver: `{"status":"ok"}`

2. **Frontend**: Visita la URL asignada por Railway (ej: `https://truk-frontend-production.up.railway.app`)
   - Debería mostrar la página principal de Truk

3. **Integración**: Verifica que el frontend pueda comunicarse con el backend
   - Prueba iniciar sesión
   - Prueba crear contenido
   - Verifica que no haya errores CORS

## Problemas Comunes y Soluciones

### Backend no se conecta a PostgreSQL

**Síntoma**: Logs muestran `P1001: Can't reach database server`

**Solución**:
1. Ve a Settings > Variables del servicio backend
2. Asegúrate que DATABASE_URL use la URL del proxy público (gondola.proxy.rlwy.net)
3. NO uses postgres.railway.internal (solo funciona con private networking)

### Frontend muestra errores de API

**Síntoma**: Frontend carga pero no puede obtener datos del backend

**Solución**:
1. Verifica que NEXT_PUBLIC_API_URL apunte a la URL pública del backend
2. Verifica que el backend tenga CORS configurado para permitir la URL del frontend
3. Revisa los logs del backend para ver si las requests llegan

### Build del Frontend falla

**Síntoma**: Deployment del frontend falla durante `npm run build`

**Solución**:
1. El build script ya tiene un fallback que permite continuar con warnings
2. Si aún falla, revisa los logs del build en Railway
3. Puede que necesites ajustar `packages/web/package.json` build script

## URLs Importantes

- **Proyecto Railway**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
- **Backend (actual)**: https://truk-production.up.railway.app
- **GitHub Repo**: https://github.com/josuiru/truk
- **Último commit**: c9d4563 (Revert "chore: Configure build for client-side React Query rendering")

## Contacto y Soporte

Si necesitas ayuda adicional:
1. Revisa los logs del deployment en Railway
2. Verifica las variables de entorno
3. Consulta la documentación de Railway: https://docs.railway.app

---

**Última actualización**: 2025-11-21 12:40 UTC
**Estado**: Backend desplegado (esperando verificación), Frontend pendiente
