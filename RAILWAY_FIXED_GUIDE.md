# 🚂 Railway - Guía Actualizada (2025)

Railway ha cambiado su CLI. Esta es la guía actualizada y corregida.

---

## ⚡ Método Recomendado: Dashboard Web (Más Fácil)

### Paso 1: Crear Proyecto

1. Ve a [railway.app](https://railway.app)
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza GitHub si es necesario
5. Selecciona tu repositorio: `JosuIru/comunidad-viva`

### Paso 2: Configurar Backend

Railway detectará automáticamente que es un monorepo.

1. Click en **"Add Service"** o **"Add variables and redeploy"**
2. En **Root Directory**, pon: `packages/backend`
3. En **Build Command**: `npm install && npm run build`
4. En **Start Command**: `npm run start:prod`

### Paso 3: Añadir PostgreSQL

1. Click en **"+ New"** en el dashboard
2. Selecciona **"Database"**
3. Selecciona **"PostgreSQL"**
4. Railway lo configurará automáticamente

### Paso 4: Conectar Backend a PostgreSQL

1. Click en tu servicio **backend**
2. Ve a pestaña **"Variables"**
3. Railway ya habrá creado `DATABASE_URL` automáticamente
4. Añade estas variables manualmente:

```bash
NODE_ENV=production
PORT=4000
JWT_SECRET=<genera con: openssl rand -base64 64>
JWT_EXPIRES_IN=7d
FRONTEND_URL=${{web.url}}
BACKEND_URL=${{backend.url}}
```

### Paso 5: Aplicar Migraciones

Desde tu computadora local:

```bash
cd ~/truk
railway login
railway link  # Selecciona tu proyecto "truk"
railway service  # Selecciona el servicio "backend"

# Aplicar migraciones
railway run npx prisma migrate deploy

# Generar cliente Prisma
railway run npx prisma generate

# Seed (opcional)
railway run npm run seed
```

### Paso 6: Configurar Frontend

1. Click en **"+ New"** > **"GitHub Repo"**
2. Selecciona el mismo repo: `JosuIru/comunidad-viva`
3. En **Root Directory**, pon: `packages/web`
4. En **Build Command**: `npm install && npm run build`
5. En **Start Command**: `npm start`

### Paso 7: Variables del Frontend

1. Click en servicio **frontend**
2. Ve a **"Variables"**
3. Añade:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{backend.url}}
NEXT_PUBLIC_WS_URL=${{backend.url}}
NEXT_PUBLIC_APP_URL=${{web.url}}
```

### Paso 8: Generar Dominios

1. En cada servicio (backend y frontend)
2. Ve a pestaña **"Settings"**
3. Sección **"Networking"**
4. Click en **"Generate Domain"**

Railway te dará:
- Backend: `https://backend-production-xxxx.up.railway.app`
- Frontend: `https://web-production-xxxx.up.railway.app`

---

## 🔧 Método Alternativo: CLI (Más Complejo)

Si prefieres usar CLI:

### 1. Crear Servicio para Backend

```bash
cd ~/truk/packages/backend

# Vincular al proyecto
railway link

# Crear servicio
railway service

# Desplegar
railway up
```

### 2. Crear Servicio para Frontend

```bash
cd ~/truk/packages/web

# Debe estar en el mismo proyecto
railway link  # Selecciona el mismo proyecto "truk"

# Crear nuevo servicio
railway service

# Desplegar
railway up
```

### 3. Añadir Base de Datos

```bash
# Desde cualquier directorio del proyecto
railway add --database postgres
```

---

## 🔥 Configuración con railway.toml (Recomendado)

Crea archivos de configuración para cada servicio:

### packages/backend/railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
PORT = 4000
NODE_ENV = "production"
```

### packages/web/railway.toml

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[env]
PORT = 3000
NODE_ENV = "production"
```

---

## 🐛 Solución al Error de Deploy

El error que tuviste fue porque Railway necesita saber:
1. **Dónde está el código** (Root Directory)
2. **Qué comando ejecutar** (Start Command)

### Solución:

**Opción A: Dashboard Web** (Más fácil)
- Configura Root Directory en Settings

**Opción B: railway.json**

Crea `packages/backend/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

Crea `packages/web/railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## 📊 Ver Logs y Troubleshooting

### Ver logs desde CLI

```bash
# Vincular al servicio
railway service

# Ver logs
railway logs
```

### Ver logs desde Dashboard

1. Ve a [railway.app/project/tu-proyecto](https://railway.app/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5)
2. Click en el servicio (backend/frontend)
3. Pestaña **"Deployments"**
4. Click en el deployment actual
5. Ver **"Build Logs"** y **"Deploy Logs"**

---

## ✅ Checklist de Configuración

### Backend
- [ ] Root Directory: `packages/backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Variables de entorno configuradas
- [ ] DATABASE_URL conectado a PostgreSQL
- [ ] Migraciones aplicadas (`railway run npx prisma migrate deploy`)
- [ ] Domain generado

### Frontend
- [ ] Root Directory: `packages/web`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variables de entorno configuradas
- [ ] NEXT_PUBLIC_API_URL apunta al backend
- [ ] Domain generado

### Base de Datos
- [ ] PostgreSQL añadido
- [ ] DATABASE_URL generado automáticamente
- [ ] Conectado al servicio backend

---

## 🎯 Pasos Siguientes

1. **Configura servicios desde el Dashboard** (más fácil)
2. **Añade PostgreSQL** desde "+ New" > "Database"
3. **Configura variables de entorno** en cada servicio
4. **Aplica migraciones** con `railway run npx prisma migrate deploy`
5. **Genera dominios** en Settings > Networking
6. **Verifica que funciona** accediendo a los dominios

---

## 💡 Tips Importantes

### Variables entre servicios

Railway permite referenciar URLs entre servicios:

```bash
# En frontend, referenciar backend:
NEXT_PUBLIC_API_URL=${{backend.RAILWAY_PUBLIC_DOMAIN}}

# O más simple:
NEXT_PUBLIC_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

### Monorepo Detection

Railway detecta automáticamente monorepos pero necesitas:
- Especificar **Root Directory**
- O usar archivos `railway.toml`/`railway.json` en cada paquete

### Build Fails

Si el build falla:
1. Revisa que el Root Directory sea correcto
2. Verifica que package.json tenga los scripts correctos
3. Asegúrate de que las dependencias estén en package.json
4. Revisa los logs en el Dashboard

---

## 🆘 Errores Comunes

### "Deploy failed" sin más información

**Causa**: Railway no encuentra el código o no sabe qué ejecutar

**Solución**:
1. Ve al Dashboard
2. Click en el servicio
3. Settings > Root Directory
4. Pon `packages/backend` o `packages/web`
5. Redeploy

### "Module not found"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
# Asegúrate que el Build Command incluya:
npm install && npm run build
```

### DATABASE_URL no está definido

**Causa**: Backend no está conectado a PostgreSQL

**Solución**:
1. Dashboard > Backend service
2. Settings > Variables
3. Verifica que existe `DATABASE_URL`
4. Si no, ve a PostgreSQL service
5. Connect to > Selecciona backend

---

## 📞 Soporte

- **Dashboard**: [railway.app](https://railway.app)
- **Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Docs**: [docs.railway.app](https://docs.railway.app)
- **Status**: [status.railway.app](https://status.railway.app)

---

**Tu proyecto**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5

**Última actualización**: 11 de Noviembre de 2025
