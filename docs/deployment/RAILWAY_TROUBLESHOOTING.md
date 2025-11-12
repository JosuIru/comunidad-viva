# ๐Ÿš‚ Railway Troubleshooting - "Train has not arrived"

---

## ๐Ÿšจ Error: "The train has not arrived at the station"

Este error significa que:
1. El servicio no se ha desplegado aรบn
2. El servicio falló al desplegarse
3. El dominio no estรก propagado (raro, tarda segundos)

---

## ๐Ÿ" Diagnรณstico Paso a Paso

### 1. Verificar Estado del Servicio

1. Ve a tu proyecto: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5
2. Mira los servicios:
   - **Verde โœ…**: Servicio corriendo
   - **Amarillo โš ๏ธ**: Desplegando
   - **Rojo โŒ**: Falló

### 2. Revisar Logs del Deployment

1. Click en el servicio (backend o web)
2. Pestaรฑa **"Deployments"**
3. Click en el deployment mรกs reciente
4. Ver **"Build Logs"** y **"Deploy Logs"**

Busca errores en rojo.

---

## ๐Ÿ"ง Soluciones Comunes

### Soluciรณn 1: Configurar Root Directory

**Problema**: Railway no encuentra el cรณdigo

**Pasos**:
1. Click en el servicio
2. **Settings** > **"Root Directory"**
3. Backend: `packages/backend`
4. Frontend: `packages/web`
5. **Save**

El servicio se redesplegarรก automรกticamente.

---

### Soluciรณn 2: Configurar Build y Start Commands

**Problema**: Railway no sabe quรฉ ejecutar

**Para Backend**:
1. Settings > **"Build Command"**: `npm install && npm run build`
2. Settings > **"Start Command"**: `npm run start:prod`
3. Save

**Para Frontend**:
1. Settings > **"Build Command"**: `npm install && npm run build`
2. Settings > **"Start Command"**: `npm start`
3. Save

---

### Soluciรณn 3: Verificar Variables de Entorno

**Problema**: Faltan variables crรญticas

**Backend mรญnimas**:
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=[auto-generada por Railway]
JWT_SECRET=[openssl rand -base64 64]
```

**Frontend mรญnimas**:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[backend-url]
```

**Cรณmo aรฑadir**:
1. Servicio > **"Variables"**
2. **"+ New Variable"**
3. Aรฑadir cada una
4. El servicio se redesplegarรก

---

### Soluciรณn 4: Eliminar y Recrear Servicio

Si todo lo anterior falla:

**Eliminar**:
1. Servicio > **"Settings"**
2. Baja hasta **"Danger Zone"**
3. **"Remove Service"**

**Recrear**:
1. **"+ New"** > **"GitHub Repo"**
2. Selecciona: `JosuIru/comunidad-viva`
3. **Inmediatamente** configura:
   - Settings > Root Directory: `packages/backend` o `packages/web`
   - Settings > Start Command
4. Aรฑadir variables de entorno

---

## ๐ŸŽฏ Configuraciรณn Correcta Paso a Paso

### Para Backend

#### 1. Settings Bรกsicos
```
Service Name: backend
Root Directory: packages/backend
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

#### 2. Variables de Entorno
```bash
NODE_ENV=production
PORT=4000
JWT_SECRET=[openssl rand -base64 64]
JWT_EXPIRES_IN=7d
DATABASE_URL=[conectado desde PostgreSQL]
FRONTEND_URL=https://[tu-frontend].up.railway.app
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

#### 3. Networking
- Generate Domain
- Copiar URL generada

#### 4. Connect Database
- PostgreSQL service > Connect > Select backend service

---

### Para Frontend

#### 1. Settings Bรกsicos
```
Service Name: web
Root Directory: packages/web
Build Command: npm install && npm run build
Start Command: npm start
```

#### 2. Variables de Entorno
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://[backend-url-copiada]
NEXT_PUBLIC_WS_URL=wss://[backend-url-copiada]
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

#### 3. Networking
- Generate Domain

---

## ๐Ÿ" Verificar que Estรก Funcionando

### 1. Check Service Status

Dashboard deberรญa mostrar:
```
โ—ฏ backend  โœ… Running
โ—ฏ web      โœ… Running
โ—ฏ postgres โœ… Running
```

### 2. Ver Logs

**Backend**:
```
Deployments > Latest > Deploy Logs
```

Deberรญa mostrar:
```
โœ" Build completed
โœ" Starting application
โœ" Listening on port 4000
```

**Frontend**:
```
Deployments > Latest > Deploy Logs
```

Deberรญa mostrar:
```
โœ" Build completed
โœ" Starting Next.js server
โœ" Ready on port 3000
```

### 3. Test Endpoints

**Backend Health Check**:
```
https://[tu-backend].up.railway.app/health
```

Deberรญa responder:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-11T..."
}
```

**Frontend**:
```
https://[tu-frontend].up.railway.app
```

Deberรญa cargar la aplicaciรณn.

---

## ๐Ÿ› ๏ธ Debugging Avanzado

### Ver Logs en Tiempo Real (CLI)

```bash
# Conectar al proyecto
cd ~/truk
railway link

# Ver logs del backend
railway logs --service backend

# Ver logs del frontend
railway logs --service web
```

### Ejecutar Comandos en Railway

```bash
# Variables de entorno
railway run --service backend env

# Test database connection
railway run --service backend npx prisma db pull

# Ver informaciรณn de Node
railway run --service backend node --version
```

### Ver Mรฉtricas

Dashboard > Service > Pestaรฑa **"Metrics"**:
- CPU usage
- Memory usage
- Network
- Requests

---

## ๐Ÿšซ Errores Especรญficos y Soluciones

### "ENOENT: no such file or directory"

**Causa**: Root Directory incorrecto

**Soluciรณn**:
- Verificar que Root Directory = `packages/backend` o `packages/web`
- No debe ser `/` ni `packages/`

---

### "Cannot find module '@nestjs/core'"

**Causa**: Dependencias no instaladas

**Soluciรณn**:
- Build Command debe incluir `npm install`
- Verificar que package.json existe en Root Directory
- Redeploy

---

### "Port 3000 is already in use"

**Causa**: Railway usa puerto dinรกmico

**Soluciรณn**:
Asegรบrate que tu aplicaciรณn use `process.env.PORT`:

**Backend** (ya lo tiene en `main.ts`):
```typescript
const port = process.env.PORT || 4000;
```

**Frontend** (Next.js lo maneja automรกticamente con `npm start`)

---

### "connect ECONNREFUSED" (Database)

**Causa**: Backend no estรก conectado a PostgreSQL

**Soluciรณn**:
1. PostgreSQL service > **"Connect"**
2. Click **"Add a connection"**
3. Selecciona servicio **"backend"**
4. Verifica en backend > Variables que existe `DATABASE_URL`

---

### Build exitoso pero deploy falla

**Causa**: Start Command incorrecto

**Soluciรณn Backend**:
```
Start Command: npm run start:prod
```

**Soluciรณn Frontend**:
```
Start Command: npm start
```

---

### "Prisma Client not generated"

**Causa**: Falta generar cliente Prisma

**Soluciรณn**:

**Opciรณn A**: Aรฑadir a Build Command:
```
npm install && npx prisma generate && npm run build
```

**Opciรณn B**: Aรฑadir script postinstall en package.json:
```json
{
  "scripts": {
    "postinstall": "npx prisma generate"
  }
}
```

---

## ๐Ÿ"Š Tiempos Normales de Deploy

- **Primer deploy**: 3-5 minutos
- **Redeploy**: 1-3 minutos
- **Propagaciรณn de dominio**: 5-30 segundos

Si tarda mรกs de 10 minutos, probablemente hay un error.

---

## โœ… Checklist de Configuraciรณn Completa

### Backend
- [ ] Root Directory: `packages/backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm run start:prod`
- [ ] Variables: NODE_ENV, PORT, JWT_SECRET, DATABASE_URL
- [ ] Conectado a PostgreSQL
- [ ] Dominio generado
- [ ] Logs sin errores
- [ ] Health check responde

### Frontend
- [ ] Root Directory: `packages/web`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Variables: NODE_ENV, NEXT_PUBLIC_API_URL
- [ ] Dominio generado
- [ ] Logs sin errores
- [ ] Pรกgina carga

### Database
- [ ] PostgreSQL creado
- [ ] Conectado a backend
- [ ] DATABASE_URL generada
- [ ] Migraciones aplicadas

---

## ๐Ÿ†˜ Si Todo Falla

### Opciรณn 1: Empezar de Cero

1. Elimina todos los servicios
2. Sigue la guรญa **RAILWAY_DASHBOARD_STEPS.md** paso a paso
3. Configura Root Directory **antes** de que termine el primer deploy

### Opciรณn 2: Deploy Manual Simplificado

En lugar de monorepo, despliega cada paquete por separado:

**Backend**:
```bash
cd ~/truk/packages/backend
git init
git add .
git commit -m "backend"
git remote add railway https://...
git push railway main
```

### Opciรณn 3: Contactar Soporte Railway

- Discord: https://discord.gg/railway
- Email: team@railway.app
- Twitter: @Railway

---

## ๐Ÿ"ž Necesitas Ayuda Ya?

**Comparte conmigo**:
1. Screenshot del dashboard mostrando los servicios
2. Logs del deployment (los รบltimos 50 lรญneas)
3. Variables de entorno configuradas (sin valores secretos)

**O dime**:
- ยฟQuรฉ servicio estรก fallando? (backend/frontend)
- ยฟQuรฉ dice en los logs?
- ยฟQuรฉ has configurado hasta ahora?

---

**URL del proyecto**: https://railway.com/project/3ab5d4e7-aeca-428f-aa52-4bb3023f70f5

**ยกVamos a solucionarlo juntos!** ๐Ÿ'ช
