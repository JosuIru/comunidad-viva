# 🚂 Despliegue en Railway - Guía Completa

Railway es la forma **más rápida y económica** de desplegar Truk.

---

## ✨ ¿Por qué Railway?

- 💰 **$5 de crédito gratis cada mes** (suficiente para empezar)
- ⚡ **Deploy en 5 minutos** desde GitHub
- 🗄️ **PostgreSQL y Redis incluidos**
- 🔒 **SSL automático** (HTTPS)
- 📊 **Logs y monitoreo incluidos**
- 🔄 **Deploy automático** cuando haces push a GitHub
- 💻 **Sin configuración de servidores**

---

## 💰 Costos

| Servicio | Uso Estimado | Costo |
|----------|--------------|-------|
| **Backend** | ~$3-5/mes | 512MB RAM, siempre activo |
| **Frontend** | ~$3-5/mes | 512MB RAM, siempre activo |
| **PostgreSQL** | ~$2-3/mes | Base de datos gestionada |
| **Redis** (opcional) | ~$2-3/mes | Cache |
| **TOTAL** | **$10-15/mes** | Todo incluido |

**Primer mes**: $5 gratis 🎉

---

## 🚀 Instalación Rápida (5 minutos)

### Paso 1: Crear Cuenta en Railway

1. Ve a [railway.app](https://railway.app)
2. Click en **"Start a New Project"**
3. Conecta con tu cuenta de **GitHub**
4. Autoriza Railway

### Paso 2: Crear Nuevo Proyecto

```bash
# Instalar CLI de Railway
npm install -g @railway/cli

# O con Homebrew (Mac)
brew install railway

# O con Scoop (Windows)
scoop install railway
```

### Paso 3: Login en Railway

```bash
railway login
```

Esto abrirá tu navegador para autenticarte.

### Paso 4: Inicializar Proyecto

```bash
cd ~/truk
railway init
```

Selecciona:
- **"Create a new project"**
- Nombre: `truk` (o el que prefieras)

### Paso 5: Añadir Base de Datos PostgreSQL

```bash
railway add postgres
```

Esto crea automáticamente:
- ✅ Base de datos PostgreSQL
- ✅ Variable `DATABASE_URL` configurada
- ✅ Backups automáticos

### Paso 6: (Opcional) Añadir Redis

```bash
railway add redis
```

### Paso 7: Configurar Variables de Entorno

```bash
railway variables set JWT_SECRET="$(openssl rand -base64 64)"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://tuapp.up.railway.app"
railway variables set BACKEND_URL="https://tuapp-backend.up.railway.app"
```

O desde la web:
1. Ve a tu proyecto en [railway.app](https://railway.app)
2. Click en tu servicio
3. Pestaña **"Variables"**
4. Añade:
   - `JWT_SECRET` → (genera con `openssl rand -base64 64`)
   - `NODE_ENV` → `production`
   - `FRONTEND_URL` → URL de tu frontend
   - `BACKEND_URL` → URL de tu backend

### Paso 8: Deploy Backend

```bash
cd packages/backend
railway up
```

Railway detectará automáticamente:
- ✅ `package.json`
- ✅ Instalará dependencias con `npm install`
- ✅ Ejecutará `npm run build`
- ✅ Iniciará con `npm run start:prod`

### Paso 9: Deploy Frontend

```bash
cd ../web
railway up
```

Railway detectará Next.js y:
- ✅ Instalará dependencias
- ✅ Ejecutará `npm run build`
- ✅ Iniciará con `npm start`

### Paso 10: Aplicar Migraciones

```bash
# Conectar a tu proyecto Railway
cd ~/truk/packages/backend

# Railway te da la DATABASE_URL automáticamente
railway run npx prisma migrate deploy
railway run npx prisma generate
railway run npm run seed  # Opcional: datos de ejemplo
```

---

## 📁 Archivos de Configuración

Railway detecta automáticamente tu aplicación, pero puedes personalizar:

### railway.toml (Opcional)

Crea en la raíz del proyecto:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "backend"
rootDirectory = "packages/backend"

[[services]]
name = "frontend"
rootDirectory = "packages/web"
```

---

## 🔧 Configuración Avanzada

### Backend - Procfile (Opcional)

Crea `packages/backend/Procfile`:

```
web: npm run start:prod
```

### Frontend - Procfile (Opcional)

Crea `packages/web/Procfile`:

```
web: npm start
```

---

## 🌐 Dominio Personalizado

Railway te da dominios automáticos:
- `https://tuapp-backend.up.railway.app`
- `https://tuapp-frontend.up.railway.app`

### Conectar tu Propio Dominio

1. En Railway, ve a tu servicio
2. Pestaña **"Settings"** > **"Domains"**
3. Click **"Add Domain"**
4. Añade tu dominio: `tudominio.com`

5. En tu DNS (Dinahosting u otro):
   - Tipo: `CNAME`
   - Nombre: `@` (o `www`)
   - Valor: `tuapp.up.railway.app`

6. Espera 5-10 minutos

Railway configurará SSL automáticamente.

---

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
# Logs del backend
railway logs

# O desde el navegador
```

1. Ve a [railway.app](https://railway.app)
2. Selecciona tu proyecto
3. Click en servicio (backend/frontend)
4. Pestaña **"Deployments"** > **"View Logs"**

### Ver Métricas

En Railway dashboard:
- 💾 **Uso de RAM**
- 💻 **CPU**
- 🌐 **Requests**
- 📊 **Uptime**

---

## 🔄 Deploy Automático desde GitHub

### Conectar Repositorio

1. En Railway dashboard
2. Click en tu servicio
3. Pestaña **"Settings"**
4. Sección **"Source"**
5. Click **"Connect Repo"**
6. Selecciona: `JosuIru/comunidad-viva`
7. Branch: `main`

Ahora, cada vez que hagas `git push origin main`, Railway desplegará automáticamente.

---

## 💾 Backups

### PostgreSQL Backups Automáticos

Railway hace backups automáticos cada 24h.

### Backup Manual

```bash
# Conectar a Railway
railway link

# Ejecutar backup
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restaurar Backup

```bash
# Subir backup
railway run psql $DATABASE_URL < backup.sql
```

---

## 🆘 Troubleshooting

### Backend no inicia

```bash
# Ver logs
railway logs

# Ver variables de entorno
railway variables

# Verificar DATABASE_URL
railway run echo $DATABASE_URL
```

### Frontend no se conecta al backend

Verifica en `packages/web/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
```

Redeploya:
```bash
cd packages/web
railway up --detach
```

### Error de migraciones

```bash
# Resetear migraciones (CUIDADO: borra datos)
railway run npx prisma migrate reset

# O aplicar manualmente
railway run npx prisma migrate deploy
```

### Límite de crédito alcanzado

Railway te avisa cuando llegas al límite:
1. Ve a **Billing**
2. Añade tarjeta de crédito
3. Continúa con $0.002/min (~$15/mes)

---

## 💳 Gestión de Costos

### Monitorear Uso

1. Dashboard de Railway
2. Sección **"Usage"**
3. Ver créditos consumidos

### Reducir Costos

**1. Reducir RAM**:
```bash
# En railway.toml
[deploy]
memoryGB = 0.5  # Mínimo
```

**2. Escala solo lo necesario**:
- Usa 1 instancia por servicio (no múltiples)
- Desactiva servicios en desarrollo

**3. Optimiza builds**:
```bash
# Cachear dependencias
npm ci --only=production
```

---

## 🎯 Comandos Útiles

```bash
# Ver servicios
railway status

# Ver variables
railway variables

# Ejecutar comando en Railway
railway run <comando>

# Shell interactivo en Railway
railway shell

# Conectar a PostgreSQL
railway run psql $DATABASE_URL

# Ver logs
railway logs

# Desplegar
railway up

# Desconectar del proyecto
railway unlink

# Conectar a proyecto existente
railway link
```

---

## ⚙️ Variables de Entorno Necesarias

### Backend (Railway las configura automáticas):

```bash
# Generadas automáticamente por Railway
DATABASE_URL=postgresql://...  # Auto
REDIS_URL=redis://...          # Auto (si añadiste Redis)

# Debes configurar manualmente
NODE_ENV=production
PORT=4000
JWT_SECRET=<genera con openssl rand -base64 64>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.up.railway.app
BACKEND_URL=https://tu-backend.up.railway.app

# Opcional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
EMAIL_FROM=noreply@tudominio.com
```

### Frontend:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_WS_URL=wss://tu-backend.up.railway.app
NEXT_PUBLIC_APP_URL=https://tu-frontend.up.railway.app
```

---

## 📈 Escalar en Railway

Cuando tu app crezca:

```bash
# Aumentar RAM (desde dashboard)
Settings > Resources > Memory: 1GB, 2GB, 4GB...

# Múltiples instancias (horizontal scaling)
Settings > Deployment > Replicas: 2, 3, 4...
```

---

## ✅ Checklist de Deployment

- [ ] Cuenta creada en Railway
- [ ] CLI de Railway instalado (`railway login`)
- [ ] Proyecto inicializado (`railway init`)
- [ ] PostgreSQL añadido (`railway add postgres`)
- [ ] Redis añadido (opcional) (`railway add redis`)
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado (`railway up`)
- [ ] Frontend desplegado (`railway up`)
- [ ] Migraciones aplicadas (`railway run npx prisma migrate deploy`)
- [ ] Dominio personalizado configurado (opcional)
- [ ] Deploy automático desde GitHub configurado
- [ ] SSL verificado (automático)
- [ ] Logs revisados sin errores

---

## 🎉 ¡Listo!

Tu aplicación estará disponible en:
- **Backend**: `https://tu-backend.up.railway.app`
- **Frontend**: `https://tu-frontend.up.railway.app`
- **Health check**: `https://tu-backend.up.railway.app/health`

---

## 📚 Recursos

- [Documentación Railway](https://docs.railway.app)
- [Precios Railway](https://railway.app/pricing)
- [Community Railway](https://discord.gg/railway)
- [Status Railway](https://status.railway.app)

---

## 💬 Soporte

Si tienes problemas:
1. Revisa los logs: `railway logs`
2. Verifica variables: `railway variables`
3. Discord de Railway: [discord.gg/railway](https://discord.gg/railway)
4. Documentación: [docs.railway.app](https://docs.railway.app)

---

**Última actualización**: 11 de Noviembre de 2025

**¡Tu app puede estar en producción en 5 minutos!** 🚀
