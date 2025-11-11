# 🚂 Quick Start - Railway (5 minutos)

Despliega Truk en Railway en **solo 5 minutos**.

---

## ⚡ Setup Rápido

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login

```bash
railway login
```

### 3. Inicializar Proyecto

```bash
cd ~/truk
railway init
```

### 4. Añadir PostgreSQL

```bash
railway add postgres
```

### 5. Configurar Variables

```bash
railway variables set JWT_SECRET="$(openssl rand -base64 64)"
railway variables set NODE_ENV="production"
```

### 6. Deploy Backend

```bash
cd packages/backend
railway up
```

### 7. Deploy Frontend

```bash
cd ../web
railway up
```

### 8. Aplicar Migraciones

```bash
cd ../backend
railway run npx prisma migrate deploy
railway run npm run seed
```

### 9. Verificar

```bash
railway status
```

---

## 🌐 URLs

Railway te dará URLs automáticas:

- **Backend**: `https://tuapp-backend.up.railway.app`
- **Frontend**: `https://tuapp-frontend.up.railway.app`

---

## 💰 Costo

- **$5/mes gratis** inicialmente
- Después: **~$10-15/mes** todo incluido

---

## 📚 Documentación Completa

Ver: `DEPLOYMENT_RAILWAY.md`

---

## ✅ ¡Listo en 5 minutos! 🎉
