# 🚂 Desplegar en Railway - Guía Completa

Railway es la forma más fácil de desplegar Truk sin servidor propio.

## 💰 Costos

- **$5 gratis/mes** (sin tarjeta al inicio)
- Después: ~$5-15/mes según uso
- PostgreSQL incluido gratis

---

## 🚀 Instalación Rápida (5 minutos)

### Opción A: Desde GitHub (Recomendado)

#### 1. Sube tu código a GitHub

```bash
# Si aún no lo has hecho
git remote add origin https://github.com/tu-usuario/truk.git
git push -u origin main
```

#### 2. Deploy desde Railway Dashboard

1. Ve a [railway.app](https://railway.app)
2. Click en **"Start a New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu repo
5. Selecciona el repo `truk`
6. Railway detectará automáticamente Nixpacks y desplegará

#### 3. Añade PostgreSQL

1. En tu proyecto, click **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará la variable `DATABASE_URL` automáticamente

#### 4. Configura Variables de Entorno

En el dashboard del servicio, añade:

```bash
# JWT Secrets (genera con: openssl rand -base64 32)
JWT_SECRET=tu-secret-aqui-muy-largo-y-aleatorio
JWT_REFRESH_SECRET=otro-secret-diferente-tambien-largo

# CORS (tu dominio)
CORS_ORIGIN=https://tu-dominio.railway.app

# Node
NODE_ENV=production
```

#### 5. ¡Listo!

Railway generará una URL tipo: `https://truk-production-xxxx.up.railway.app`

---

### Opción B: Desde CLI

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Crear proyecto
railway init

# 4. Añadir PostgreSQL
railway add --database postgresql

# 5. Deploy
railway up

# 6. Abrir en navegador
railway open
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno Completas

```bash
# === REQUERIDAS ===
DATABASE_URL=<auto-generada-por-railway>
JWT_SECRET=<genera con openssl rand -base64 32>
JWT_REFRESH_SECRET=<genera con openssl rand -base64 32>

# === OPCIONAL ===
# CORS
CORS_ORIGIN=https://tu-app.railway.app,https://tu-dominio.com

# Redis (si añades servicio Redis)
REDIS_URL=redis://default:password@redis.railway.internal:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-comunidad.com

# S3/Storage
AWS_ACCESS_KEY_ID=tu-key
AWS_SECRET_ACCESS_KEY=tu-secret
AWS_S3_BUCKET=tu-bucket
AWS_REGION=us-east-1

# Blockchain (opcional)
BLOCKCHAIN_ENABLED=false
```

### Generar Secretos Seguros

```bash
# JWT Secret
openssl rand -base64 32

# JWT Refresh Secret
openssl rand -base64 32
```

---

## 🎯 Dominio Personalizado

### 1. Usar dominio Railway (gratis)
Tu app tendrá: `https://tu-app.up.railway.app`

### 2. Usar tu dominio propio

En Railway Dashboard:
1. Ve a **Settings** → **Domains**
2. Click **"Generate Domain"** o **"Custom Domain"**
3. Si usas dominio propio:
   - Añade registro CNAME: `tu-dominio.com` → `tu-app.up.railway.app`
   - Railway configurará SSL automáticamente

---

## 📊 Monitoreo y Logs

### Ver logs en tiempo real

**Desde Dashboard:**
- Click en tu servicio
- Pestaña **"Deployments"**
- Click en el deployment activo
- Ver logs en tiempo real

**Desde CLI:**
```bash
railway logs
```

### Métricas

Railway dashboard muestra:
- 📈 CPU usage
- 💾 Memory usage
- 🌐 Request count
- ⏱️ Response time

---

## 🔄 Actualizar la Aplicación

### Deploy Automático (Recomendado)

Railway hace deploy automático cuando haces push a main:

```bash
git add .
git commit -m "Actualizaciones"
git push origin main
```

Railway detecta el cambio y despliega automáticamente.

### Deploy Manual

```bash
railway up
```

---

## 🗄️ Base de Datos

### Backup Manual

```bash
# Desde CLI
railway run pg_dump $DATABASE_URL > backup.sql

# O descarga desde dashboard
# Settings → Data → Export
```

### Backups Automáticos

Railway hace backups automáticos diarios (en planes de pago).

### Conectar a la DB localmente

```bash
# Obtener URL de conexión
railway variables

# Conectar con psql
railway connect postgres
```

---

## 💸 Optimización de Costos

### Plan Gratuito ($5/mes incluidos)

- Suficiente para: < 100 usuarios activos
- Incluye: 500 horas ejecución + PostgreSQL

### Reducir costos:

1. **Sleep on Idle** (Dashboard → Settings)
   - App se duerme tras 30 min sin tráfico
   - Se despierta automáticamente

2. **Shared CPU** (por defecto)
   - Más barato que CPU dedicada
   - Suficiente para comunidades pequeñas

3. **Limitar memoria**
   - En Settings → Resources
   - Recomendado: 512 MB - 1 GB

---

## 🐛 Solución de Problemas

### Build falla

**Problema:** Error en build phase

**Solución:**
```bash
# Ver logs completos
railway logs --deployment <deployment-id>

# Verificar que build.sh tiene permisos
git update-index --chmod=+x build.sh
git commit -m "Fix permissions"
git push
```

### App no responde

**Problema:** Health check falla

**Verificar:**
1. Logs: `railway logs`
2. Que PostgreSQL esté conectada
3. Migraciones ejecutadas: ver logs de "prisma migrate"

**Solución:**
```bash
# Ejecutar migraciones manualmente
railway run npx prisma migrate deploy --schema=packages/backend/prisma/schema.prisma
```

### Error de conexión a DB

**Problema:** `Can't reach database server`

**Verificar:**
1. Variable `DATABASE_URL` existe
2. PostgreSQL service está running
3. Variables sincronizadas entre servicios

**Solución:**
- Dashboard → Variables → Copy `DATABASE_URL` from Postgres
- Pegar en variables del servicio backend

### Out of Memory

**Problema:** App crashea por falta de memoria

**Solución:**
- Settings → Resources → Aumentar memoria a 1 GB
- O optimizar app (reducir workers, caché)

---

## 📈 Escalar

### Para más usuarios:

1. **Aumentar recursos** (Settings → Resources)
   - Memory: 1-2 GB
   - CPU: Shared → Dedicated

2. **Añadir Redis** para caché
   ```bash
   railway add redis
   ```

3. **CDN** para assets estáticos
   - Cloudflare (gratis)
   - Railway CDN (automático)

---

## 🔐 Seguridad

### Checklist de producción:

- ✅ Cambiar todos los secrets del `.env`
- ✅ JWT_SECRET largo y aleatorio (>32 chars)
- ✅ Dominio con HTTPS (Railway lo hace automático)
- ✅ CORS configurado correctamente
- ✅ Variables de DB/Redis no expuestas
- ✅ Backups regulares configurados

---

## 🎓 Recursos

- **Railway Docs:** https://docs.railway.app
- **Discord:** https://discord.gg/railway
- **Status:** https://status.railway.app
- **Pricing:** https://railway.app/pricing

---

## 💡 Tips Pro

### 1. Ambiente de Staging

Crea rama `staging`:
```bash
git checkout -b staging
git push origin staging
```

En Railway:
- Crea nuevo servicio
- Conecta a rama `staging`
- Prueba cambios antes de production

### 2. Variables Compartidas

Usa Railway **Shared Variables**:
- Un cambio actualiza todos los servicios
- Ideal para JWT_SECRET, etc.

### 3. Railway CLI Aliases

```bash
# Añadir a ~/.bashrc
alias rl='railway'
alias rll='railway logs -f'
alias rls='railway status'
```

---

## ✅ Checklist Final

Antes de dar por terminado:

- [ ] App desplegada y accesible
- [ ] Health check responde: `curl https://tu-app.railway.app/health`
- [ ] Base de datos migrada correctamente
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado (opcional)
- [ ] CORS permite tu frontend
- [ ] Primer usuario admin creado
- [ ] Logs sin errores críticos

---

## 🎉 ¡Listo!

Tu comunidad Truk está en Railway.

**Siguiente paso:** Configura el frontend o empieza a usar la API.

**URL de tu API:** `https://tu-app.up.railway.app`
**Docs:** `https://tu-app.up.railway.app/api`
