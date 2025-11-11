# 🚀 Instalación en Servidor Compartido - Guía Rápida

Esta guía te ayudará a instalar **Truk** en un servidor compartido sin Docker.

---

## 📋 Requisitos del Servidor

Tu servidor debe tener instalado:

- **Node.js** v18+ (`node --version`)
- **npm** v9+ (`npm --version`)
- **PostgreSQL** 14+ (acceso a base de datos)
- **Acceso SSH** (para ejecutar comandos)

---

## 🎯 Pasos Rápidos

### 1️⃣ Preparar Archivos (En tu PC Local)

```bash
cd ~/truk
./prepare-for-upload.sh
```

Esto crea un archivo `truk-[fecha].tar.gz` en la carpeta `release/`

### 2️⃣ Subir al Servidor

**Opción A: Con SCP/SFTP**
```bash
scp release/truk-*.tar.gz usuario@tuservidor.com:~/
```

**Opción B: Con FTP**
- Usa FileZilla o tu cliente FTP favorito
- Sube el archivo `truk-*.tar.gz` a tu directorio home

### 3️⃣ Conectar al Servidor

```bash
ssh usuario@tuservidor.com
```

### 4️⃣ Descomprimir

```bash
cd ~/
tar -xzf truk-*.tar.gz
mv truk-* truk
cd truk
```

### 5️⃣ Ejecutar Instalación Automática

```bash
bash install.sh
```

O manualmente:

```bash
# Instalar dependencias
npm install
cd packages/backend && npm install && cd ../..
cd packages/web && npm install && cd ../..
```

### 6️⃣ Crear Base de Datos

En tu panel de control (cPanel, Plesk, etc.):

1. Crea una nueva base de datos PostgreSQL llamada `truk_db`
2. Crea un usuario `truk_user` con contraseña segura
3. Otorga todos los permisos al usuario sobre la base de datos

Anota estos datos:
- Host: `localhost` (o la IP que te den)
- Puerto: `5432`
- Base de datos: `truk_db`
- Usuario: `truk_user`
- Contraseña: `[tu_contraseña]`

### 7️⃣ Configurar Variables de Entorno

**Backend:**
```bash
cd ~/truk/packages/backend
cp .env.example .env
nano .env
```

Edita y configura:
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://truk_user:TU_PASSWORD@localhost:5432/truk_db"
JWT_SECRET="[genera con: openssl rand -base64 64]"
FRONTEND_URL="https://tudominio.com"
BACKEND_URL="https://tudominio.com/api"
```

**Frontend:**
```bash
cd ~/truk/packages/web
cp .env.example .env.local
nano .env.local
```

Edita y configura:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL="https://tudominio.com/api"
NEXT_PUBLIC_WS_URL="wss://tudominio.com"
NEXT_PUBLIC_APP_URL="https://tudominio.com"
```

### 8️⃣ Generar JWT Secret

```bash
openssl rand -base64 64
```

Copia el resultado y pégalo en `JWT_SECRET` en `packages/backend/.env`

### 9️⃣ Preparar Base de Datos

```bash
cd ~/truk/packages/backend
npx prisma generate
npx prisma migrate deploy
npm run seed  # Opcional: datos de ejemplo
```

### 🔟 Compilar Aplicación

**Backend:**
```bash
cd ~/truk/packages/backend
npm run build
```

**Frontend:**
```bash
cd ~/truk/packages/web
npm run build
```

### 1️⃣1️⃣ Instalar PM2

```bash
npm install -g pm2
```

Si no tienes permisos globales:
```bash
cd ~/truk
npm install pm2 --save-dev
```

### 1️⃣2️⃣ Iniciar Aplicación

```bash
cd ~/truk
pm2 start ecosystem.config.js
pm2 save
pm2 list  # Ver estado
```

### 1️⃣3️⃣ Configurar Proxy Reverso

**Con Nginx:**

Crea `/etc/nginx/sites-available/truk`:
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/truk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Con cPanel:**

Usa la opción "Aplicaciones" > "Configurar aplicación Node.js" en cPanel y configura:
- Ruta de la aplicación: `/home/usuario/truk/packages/web`
- Puerto: 3000
- Archivo de inicio: `node_modules/next/dist/bin/next start`

### 1️⃣4️⃣ Configurar SSL

```bash
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

O usa AutoSSL en cPanel.

### ✅ Verificar Instalación

```bash
# Health checks
curl http://localhost:4000/health
curl http://localhost:3000/api/health

# Ver logs
pm2 logs

# Ver estado
pm2 list
```

---

## 🔄 Actualizaciones Futuras

Cuando necesites actualizar:

```bash
cd ~/truk
git pull origin main
npm install
cd packages/backend && npm install && npm run build && cd ../..
cd packages/web && npm install && npm run build && cd ../..
pm2 restart all
```

O usa el script incluido:
```bash
./deploy.sh
```

---

## 🆘 Solución de Problemas

### Backend no inicia
```bash
pm2 logs truk-backend
cd packages/backend
npm run start:prod  # Probar manualmente
```

### Frontend no inicia
```bash
pm2 logs truk-frontend
cd packages/web
npm run start  # Probar manualmente
```

### Error de base de datos
```bash
# Verificar conexión
psql -U truk_user -d truk_db -h localhost

# Verificar migraciones
cd packages/backend
npx prisma migrate status
```

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **DEPLOYMENT_SHARED_HOSTING.md** - Guía completa paso a paso
- **DEPLOYMENT_GUIDE.md** - Guía general de despliegue
- **PRODUCTION_READY.md** - Checklist de producción

---

## 🎯 URLs de Acceso

Una vez instalado:

- **Frontend**: https://tudominio.com
- **Backend API**: https://tudominio.com/api
- **API Docs**: https://tudominio.com/api/docs
- **Instalador gráfico**: https://tudominio.com/installer (primera vez)

---

## ⚠️ Checklist Pre-Producción

Antes de lanzar:

- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET generado de forma segura
- [ ] Base de datos creada y migrada
- [ ] Build completado sin errores
- [ ] PM2 corriendo correctamente
- [ ] Nginx/Apache configurado
- [ ] SSL/HTTPS configurado
- [ ] Health checks funcionando
- [ ] Dominio apuntando correctamente
- [ ] Backups configurados

---

**¿Necesitas ayuda?** Consulta la documentación completa o revisa los logs con `pm2 logs`
