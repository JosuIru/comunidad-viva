# 🚂 Railway Dashboard - Pasos Visuales

Guรญa paso a paso con capturas de lo que verรกs en el dashboard.

---

## 🎯 Tu Proyecto

**URL**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5

---

## 📋 Paso 1: Configurar el Servicio Existente

Ahora mismo tienes un servicio que falló porque no sabรญa quรฉ ejecutar.

### 1.1 Acceder al Servicio

1. Ve a: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
2. Verรกs un servicio creado (probablemente llamado "truk" o "comunidad-viva")
3. **Click en ese servicio**

### 1.2 Configurar Root Directory

1. Estando dentro del servicio, click en la pestaรฑa **"Settings"** (arriba)
2. Baja hasta encontrar **"Root Directory"**
3. Escribe: `packages/backend`
4. Presiona **Enter** o click en **"Save"** / **"Update"**

### 1.3 Configurar Start Command (Opcional)

Aunque `railway.json` ya lo tiene, puedes verificar:

1. En la misma pรกgina de Settings
2. Busca **"Start Command"**
3. Si estรก vacรญo, escribe: `npm run start:prod`
4. Si ya tiene algo, dรฉjalo

### 1.4 Renombrar Servicio (Opcional)

Para identificarlo mejor:

1. En Settings, arriba encontrarรกs **"Service Name"**
2. Cambia a: `backend`
3. Save

### 1.5 Redesplegar

1. El servicio deberรญa redesplegar automรกticamente
2. Si no, click en el botรณn **"Deploy"** o **"Redeploy"**
3. Ve a la pestaรฑa **"Deployments"** para ver el progreso
4. Click en el deployment activo para ver logs en tiempo real

---

## 📋 Paso 2: Aรฑadir PostgreSQL

### 2.1 Crear Base de Datos

1. En el dashboard del proyecto (vista general)
2. Click en el botรณn **"+ New"** (esquina superior derecha)
3. Selecciona **"Database"**
4. Click en **"Add PostgreSQL"**
5. Railway crearรก la base de datos (tarda ~30 segundos)

### 2.2 Conectar Backend a PostgreSQL

1. Click en el cuadro/card de **"PostgreSQL"** que se creรณ
2. Ve a la pestaรฑa **"Connect"**
3. Verรกs una secciรณn **"Connect to this database"**
4. Click en **"Add a connection"** o similar
5. Selecciona tu servicio **"backend"**
6. Railway aรฑadirรก automรกticamente la variable `DATABASE_URL` al backend โœ…

---

## 📋 Paso 3: Configurar Variables de Entorno del Backend

### 3.1 Acceder a Variables

1. Click en el servicio **"backend"**
2. Ve a la pestaรฑa **"Variables"**

### 3.2 Aรฑadir Variables

Verรกs que ya existe `DATABASE_URL` (aรฑadida automรกticamente). Ahora aรฑade:

**Click en "+ New Variable"** para cada una:

```
Variable 1:
- Name: NODE_ENV
- Value: production

Variable 2:
- Name: PORT
- Value: 4000

Variable 3:
- Name: JWT_SECRET
- Value: [ejecuta en tu terminal: openssl rand -base64 64 y pega el resultado]

Variable 4:
- Name: JWT_EXPIRES_IN
- Value: 7d

Variable 5:
- Name: FRONTEND_URL
- Value: https://web-production-xxxx.up.railway.app
  (lo pondrรกs despuรฉs cuando tengas la URL del frontend)

Variable 6:
- Name: BACKEND_URL
- Value: ${{RAILWAY_PUBLIC_DOMAIN}}
  (Railway lo reemplazarรก automรกticamente)
```

### 3.3 Guardar

1. Cada variable se guarda automรกticamente al aรฑadirla
2. El servicio se redesplegarรก automรกticamente

---

## 📋 Paso 4: Generar Dominio Pรบblico del Backend

### 4.1 Configurar Networking

1. Estando en el servicio **"backend"**
2. Ve a pestaรฑa **"Settings"**
3. Busca la secciรณn **"Networking"**
4. Click en **"Generate Domain"** o **"Add Domain"**
5. Railway generarรก algo como: `backend-production-xxxx.up.railway.app`

### 4.2 Copiar URL

1. Copia esa URL completa (sin https://)
2. La necesitarรกs para el frontend

### 4.3 Verificar que Funciona

1. Ve a: `https://[TU-URL-BACKEND]/health`
2. Deberรญas ver un JSON con el estado

---

## 📋 Paso 5: Aรฑadir Servicio Frontend

### 5.1 Crear Nuevo Servicio

1. En el dashboard del proyecto
2. Click en **"+ New"**
3. Selecciona **"GitHub Repo"**
4. Busca y selecciona: `JosuIru/comunidad-viva`
5. Railway empezarรก a construir

### 5.2 Configurar Root Directory

1. Click en el nuevo servicio
2. Ve a **"Settings"**
3. Busca **"Root Directory"**
4. Escribe: `packages/web`
5. Save

### 5.3 Renombrar (Opcional)

1. En Settings > **"Service Name"**
2. Cambia a: `web`
3. Save

### 5.4 Configurar Start Command

1. En Settings, busca **"Start Command"**
2. Escribe: `npm start`
3. Save

---

## 📋 Paso 6: Variables del Frontend

### 6.1 Acceder a Variables

1. Click en servicio **"web"**
2. Pestaรฑa **"Variables"**

### 6.2 Aรฑadir Variables

```
Variable 1:
- Name: NODE_ENV
- Value: production

Variable 2:
- Name: NEXT_PUBLIC_API_URL
- Value: https://[URL-BACKEND-QUE-COPIASTE]

Variable 3:
- Name: NEXT_PUBLIC_WS_URL
- Value: wss://[URL-BACKEND-QUE-COPIASTE]

Variable 4:
- Name: NEXT_PUBLIC_APP_URL
- Value: ${{RAILWAY_PUBLIC_DOMAIN}}
```

---

## 📋 Paso 7: Generar Dominio del Frontend

### 7.1 Configurar Networking

1. En servicio **"web"**
2. **Settings** > **"Networking"**
3. **"Generate Domain"**
4. Copiar la URL generada

### 7.2 Actualizar Variable del Backend

1. Ve al servicio **"backend"**
2. **Variables**
3. Edita `FRONTEND_URL`
4. Pon la URL del frontend que acabas de copiar
5. Save (se redesplegarรก)

---

## 📋 Paso 8: Aplicar Migraciones de Base de Datos

Esto se hace desde tu PC con el CLI:

### 8.1 Generar JWT Secret

```bash
openssl rand -base64 64
```

Copia el resultado y pรฉgalo en la variable `JWT_SECRET` del backend.

### 8.2 Conectar a Railway

```bash
cd ~/truk
railway link
```

Selecciona el proyecto **"truk"**.

### 8.3 Aplicar Migraciones

```bash
# Desde el directorio packages/backend
cd packages/backend

# Aplicar migraciones
railway run --service backend npx prisma migrate deploy

# Generar cliente
railway run --service backend npx prisma generate

# Seed (opcional - datos de ejemplo)
railway run --service backend npm run seed
```

Si `--service` no funciona, primero haz:
```bash
railway service
# Selecciona "backend" en el menรบ
```

Luego:
```bash
railway run npx prisma migrate deploy
railway run npx prisma generate
railway run npm run seed
```

---

## โœ… Paso 9: Verificar que Todo Funciona

### 9.1 Health Checks

**Backend**:
```
https://tu-backend-production-xxxx.up.railway.app/health
```

Deberรญas ver:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

**Frontend**:
```
https://tu-web-production-xxxx.up.railway.app
```

Deberรญa cargar la aplicaciรณn.

### 9.2 Revisar Logs

1. Click en cada servicio
2. Pestaรฑa **"Deployments"**
3. Click en el deployment activo
4. Ver **"Deploy Logs"**
5. No deberรญa haber errores rojos

---

## ๐Ÿ" Vista Final del Dashboard

Tu proyecto deberรญa verse asรญ:

```
โ"Œโ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"
โ"‚  Project: truk                โ"‚
โ"‚                                โ"‚
โ"‚  โ"Œโ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"         โ"‚
โ"‚  โ"‚ PostgreSQL  โ"‚         โ"‚
โ"‚  โ"‚ โœ… Running   โ"‚         โ"‚
โ"‚  โ""โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"˜         โ"‚
โ"‚                                โ"‚
โ"‚  โ"Œโ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"         โ"‚
โ"‚  โ"‚ backend     โ"‚         โ"‚
โ"‚  โ"‚ โœ… Running   โ"‚         โ"‚
โ"‚  โ"‚ ๐ŸŒ Domain     โ"‚         โ"‚
โ"‚  โ""โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"˜         โ"‚
โ"‚                                โ"‚
โ"‚  โ"Œโ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"         โ"‚
โ"‚  โ"‚ web         โ"‚         โ"‚
โ"‚  โ"‚ โœ… Running   โ"‚         โ"‚
โ"‚  โ"‚ ๐ŸŒ Domain     โ"‚         โ"‚
โ"‚  โ""โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"˜         โ"‚
โ""โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"€โ"˜
```

---

## ๐Ÿ†˜ Troubleshooting

### Backend no inicia

**Problema**: "No start command found"

**Soluciรณn**:
1. Settings > Root Directory = `packages/backend`
2. Settings > Start Command = `npm run start:prod`
3. Redeploy

### Frontend no inicia

**Problema**: "Module not found"

**Soluciรณn**:
1. Settings > Root Directory = `packages/web`
2. Settings > Start Command = `npm start`
3. Redeploy

### DATABASE_URL no definido

**Soluciรณn**:
1. PostgreSQL service > Connect
2. Add connection to "backend" service
3. Verifica en backend > Variables que existe DATABASE_URL

### Migraciones fallan

**Error**: "Can't reach database"

**Soluciรณn**:
```bash
# Verifica que DATABASE_URL estรก correcto
railway run --service backend echo $DATABASE_URL

# Regenera cliente Prisma
railway run --service backend npx prisma generate

# Intenta de nuevo
railway run --service backend npx prisma migrate deploy
```

---

## ๐Ÿ'ฐ Monitore Costos

1. Dashboard > Pestaรฑa **"Usage"** (arriba)
2. Ver cuรกnto crรฉdito has usado
3. Estimado mensual

**Estimado para Truk**:
- Backend: ~$3-5/mes
- Frontend: ~$3-5/mes
- PostgreSQL: ~$2-3/mes
- **Total**: $8-13/mes

**Primer mes**: $5 gratis ๐ŸŽ‰

---

## ๐ŸŽฏ Checklist Final

- [ ] Servicio backend configurado con Root Directory
- [ ] PostgreSQL creado y conectado
- [ ] Variables de entorno del backend configuradas
- [ ] Dominio del backend generado
- [ ] Servicio frontend configurado con Root Directory
- [ ] Variables del frontend configuradas con URL del backend
- [ ] Dominio del frontend generado
- [ ] Migraciones aplicadas
- [ ] Health checks funcionando
- [ ] Aplicaciรณn accesible desde el navegador

---

**ยกTu aplicaciรณn estarรก en producciรณn en menos de 10 minutos!** ๐Ÿš€

**URL del proyecto**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
