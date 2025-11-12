# 🚀 Despliegue en Servidor Compartido (Sin Docker)

Guía completa para desplegar **Truk** en un servidor compartido tradicional que no tiene Docker disponible.

---

## 📋 Requisitos del Servidor

### Requisitos Mínimos

- **Node.js**: v18.x o superior
- **PostgreSQL**: 14.x o superior (o acceso a base de datos PostgreSQL)
- **Redis**: 6.x o superior (opcional pero recomendado)
- **npm**: 9.x o superior
- **Acceso SSH**: Para ejecutar comandos
- **Espacio en disco**: Mínimo 2GB libres
- **RAM**: Mínimo 1GB (recomendado 2GB)
- **PM2**: Para gestión de procesos (se puede instalar)

### Verificar Requisitos

```bash
# Verificar versiones instaladas
node --version    # Debe ser >= v18.0.0
npm --version     # Debe ser >= 9.0.0
psql --version    # PostgreSQL
redis-cli --version  # Redis (opcional)
```

---

## 📦 Preparación de Archivos

### Opción 1: Clonar desde GitHub (Recomendado)

```bash
# En tu servidor, navega al directorio de tu aplicación
cd ~/public_html  # o el directorio que uses

# Clonar el repositorio
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk
```

### Opción 2: Subir Archivos Manualmente

Si prefieres subir archivos por FTP/SFTP:

**Archivos a subir**:
```
truk/
├── packages/
│   ├── backend/     # Toda la carpeta backend
│   └── web/         # Toda la carpeta frontend
├── scripts/         # Scripts útiles
├── .env.example     # Ejemplo de configuración
├── package.json
├── package-lock.json
└── README.md
```

**NO subas estas carpetas** (se generan automáticamente):
- `node_modules/`
- `.next/`
- `dist/`
- `build/`
- `.git/` (si subes manualmente)

---

## ⚙️ Configuración

### 1. Crear Base de Datos PostgreSQL

Accede al panel de control de tu hosting (cPanel, Plesk, etc.) y crea:

1. **Nueva base de datos**: `truk_db`
2. **Nuevo usuario**: `truk_user`
3. **Contraseña segura**: Genera una contraseña fuerte
4. **Permisos**: Otorga TODOS los privilegios al usuario sobre la base de datos

Anota estos datos:
```
Database Host: localhost (o la IP proporcionada)
Database Port: 5432 (normalmente)
Database Name: truk_db
Database User: truk_user
Database Password: [tu_contraseña_segura]
Database URL: postgresql://truk_user:[password]@localhost:5432/truk_db
```

### 2. Configurar Variables de Entorno

#### Backend (.env)

```bash
cd ~/truk/packages/backend
cp .env.example .env
nano .env  # o usa el editor de tu hosting
```

Edita el archivo `.env`:

```bash
# Environment
NODE_ENV=production
PORT=4000

# Database - IMPORTANTE: Usa tus datos reales
DATABASE_URL="postgresql://truk_user:TU_PASSWORD_AQUI@localhost:5432/truk_db"

# JWT - Genera un secreto seguro
JWT_SECRET="GENERA_UNO_CON: openssl rand -base64 64"
JWT_EXPIRES_IN="7d"

# URLs - Ajusta a tu dominio
FRONTEND_URL="https://tudominio.com"
BACKEND_URL="https://tudominio.com/api"

# Redis (si lo tienes disponible)
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Email (Opcional - para notificaciones)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-app-password"
EMAIL_FROM="noreply@tudominio.com"

# Storage (Local por defecto)
STORAGE_TYPE="local"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880

# Blockchain (Opcional)
SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_NETWORK="devnet"
BRIDGE_SECURITY_ENABLED=true
```

#### Frontend (.env.local)

```bash
cd ~/truk/packages/web
cp .env.example .env.local
nano .env.local
```

Edita el archivo `.env.local`:

```bash
# Environment
NODE_ENV=production

# API URLs - Ajusta a tu dominio
NEXT_PUBLIC_API_URL="https://tudominio.com/api"
NEXT_PUBLIC_WS_URL="wss://tudominio.com"

# App Info
NEXT_PUBLIC_APP_NAME="Truk"
NEXT_PUBLIC_APP_URL="https://tudominio.com"

# Optional: Analytics, Sentry, etc.
# NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
# NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### 3. Generar JWT Secret

```bash
# En tu servidor
openssl rand -base64 64
```

Copia el resultado y pégalo en `JWT_SECRET` en el archivo `.env` del backend.

---

## 🔨 Instalación y Build

### 1. Instalar Dependencias

```bash
cd ~/truk

# Instalar todas las dependencias (esto puede tardar varios minutos)
npm install
```

Si tienes problemas con workspaces, instala por separado:

```bash
# Backend
cd ~/truk/packages/backend
npm install

# Frontend
cd ~/truk/packages/web
npm install
```

### 2. Generar Prisma Client

```bash
cd ~/truk/packages/backend
npx prisma generate
```

### 3. Aplicar Migraciones de Base de Datos

```bash
cd ~/truk/packages/backend
npx prisma migrate deploy
```

Si hay errores, verifica que:
- La base de datos existe
- El usuario tiene permisos
- El `DATABASE_URL` en `.env` es correcto

### 4. Seed de Datos Iniciales (Opcional)

```bash
cd ~/truk/packages/backend
npm run seed
```

### 5. Build del Backend

```bash
cd ~/truk/packages/backend
npm run build
```

Esto crea la carpeta `dist/` con el código compilado.

### 6. Build del Frontend

```bash
cd ~/truk/packages/web
npm run build
```

Esto crea la carpeta `.next/` con el código optimizado para producción.

---

## 🚀 Despliegue con PM2

PM2 es un gestor de procesos que mantiene tu aplicación corriendo y la reinicia si falla.

### 1. Instalar PM2

```bash
npm install -g pm2
```

Si no tienes permisos globales:

```bash
cd ~/truk
npm install pm2 --save-dev
```

### 2. Crear Archivo de Configuración PM2

```bash
cd ~/truk
nano ecosystem.config.js
```

Contenido:

```javascript
module.exports = {
  apps: [
    {
      name: 'truk-backend',
      cwd: './packages/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
    {
      name: 'truk-frontend',
      cwd: './packages/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
  ],
};
```

### 3. Crear Directorio de Logs

```bash
cd ~/truk
mkdir -p logs
```

### 4. Iniciar Aplicación con PM2

```bash
cd ~/truk
pm2 start ecosystem.config.js
```

### 5. Verificar Estado

```bash
pm2 list
pm2 logs truk-backend
pm2 logs truk-frontend
```

### 6. Configurar PM2 para Reinicio Automático

```bash
# Guardar configuración actual
pm2 save

# Configurar inicio automático (si tienes acceso)
pm2 startup
# Ejecuta el comando que te muestre PM2
```

---

## 🌐 Configuración de Servidor Web (Nginx/Apache)

### Opción A: Nginx (Recomendado)

Crea un archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/truk
```

Contenido:

```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Logs
    access_log /var/log/nginx/truk-access.log;
    error_log /var/log/nginx/truk-error.log;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Uploads
    location /uploads {
        alias /home/tuusuario/truk/packages/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/truk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opción B: Apache (.htaccess)

Si tu hosting usa cPanel con Apache, crea un archivo `.htaccess` en la raíz:

```apache
# Frontend (Next.js en puerto 3000)
RewriteEngine On

# API requests
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:4000/$1 [P,L]

# WebSocket
RewriteCond %{REQUEST_URI} ^/socket.io
RewriteRule ^socket.io/(.*)$ http://localhost:4000/socket.io/$1 [P,L]

# Everything else to Next.js
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

**Nota**: Asegúrate de que `mod_proxy` y `mod_proxy_http` estén habilitados.

---

## 🔒 Configurar SSL/HTTPS

### Con Let's Encrypt (Gratis)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Renovación automática (ya viene configurada)
sudo certbot renew --dry-run
```

### Con cPanel

1. Ve a **SSL/TLS Status**
2. Selecciona tu dominio
3. Click en **Run AutoSSL**

---

## 🔄 Script de Despliegue Rápido

Crea un script para facilitar actualizaciones:

```bash
cd ~/truk
nano deploy.sh
```

Contenido:

```bash
#!/bin/bash

echo "🚀 Desplegando Truk..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Pull cambios
echo -e "${BLUE}📥 Obteniendo cambios...${NC}"
git pull origin main

# 2. Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
npm install

# 3. Aplicar migraciones
echo -e "${BLUE}🗄️  Aplicando migraciones...${NC}"
cd packages/backend
npx prisma migrate deploy
npx prisma generate
cd ../..

# 4. Build backend
echo -e "${BLUE}🔨 Compilando backend...${NC}"
cd packages/backend
npm run build
cd ../..

# 5. Build frontend
echo -e "${BLUE}🔨 Compilando frontend...${NC}"
cd packages/web
npm run build
cd ../..

# 6. Reiniciar con PM2
echo -e "${BLUE}🔄 Reiniciando aplicación...${NC}"
pm2 restart ecosystem.config.js

# 7. Estado
echo -e "${GREEN}✅ Despliegue completado${NC}"
pm2 list
```

Dar permisos de ejecución:

```bash
chmod +x deploy.sh
```

Usar:

```bash
./deploy.sh
```

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs

```bash
# Logs en tiempo real
pm2 logs

# Logs de un proceso específico
pm2 logs truk-backend
pm2 logs truk-frontend

# Últimas 100 líneas
pm2 logs --lines 100
```

### Estado de la Aplicación

```bash
# Ver todos los procesos
pm2 list

# Ver información detallada
pm2 info truk-backend
pm2 info truk-frontend

# Monitoreo en tiempo real
pm2 monit
```

### Reiniciar Servicios

```bash
# Reiniciar todo
pm2 restart all

# Reiniciar un servicio
pm2 restart truk-backend
pm2 restart truk-frontend

# Recargar (sin downtime)
pm2 reload all
```

### Parar Servicios

```bash
# Parar todo
pm2 stop all

# Parar un servicio
pm2 stop truk-backend
pm2 stop truk-frontend

# Eliminar de PM2
pm2 delete truk-backend
pm2 delete truk-frontend
```

---

## 🔄 Backups

### Script de Backup Automático

```bash
cd ~/truk
nano backup.sh
```

Contenido:

```bash
#!/bin/bash

BACKUP_DIR="$HOME/backups/truk"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup de base de datos
echo "📦 Creando backup de base de datos..."
pg_dump -h localhost -U truk_user truk_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup de uploads
echo "📦 Creando backup de archivos subidos..."
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C ~/truk/packages/backend uploads/

# Limpiar backups antiguos (mantener últimos 7 días)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completado: $BACKUP_DIR"
```

Programar con cron:

```bash
crontab -e
```

Añadir:

```cron
# Backup diario a las 2:00 AM
0 2 * * * /home/tuusuario/truk/backup.sh
```

---

## 🆘 Troubleshooting

### Backend no inicia

```bash
# Ver logs
pm2 logs truk-backend --lines 50

# Verificar puerto
netstat -tulpn | grep 4000

# Verificar variables de entorno
cat ~/truk/packages/backend/.env

# Probar manualmente
cd ~/truk/packages/backend
npm run start:prod
```

### Frontend no inicia

```bash
# Ver logs
pm2 logs truk-frontend --lines 50

# Verificar build
cd ~/truk/packages/web
ls -la .next/

# Probar manualmente
npm run start
```

### Error de conexión a base de datos

```bash
# Verificar PostgreSQL
psql -U truk_user -d truk_db -h localhost

# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar permisos del usuario
psql -U postgres
\du truk_user
```

### Error "Module not found"

```bash
# Reinstalar dependencias
cd ~/truk
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json
npm install
```

### Aplicación lenta

```bash
# Ver uso de recursos
pm2 monit

# Ver procesos
top
htop

# Aumentar límite de memoria en ecosystem.config.js
max_memory_restart: '1G'  # Aumenta si tienes más RAM
```

---

## 📈 Optimizaciones

### 1. Activar Cache de Next.js

En `packages/web/next.config.js`:

```javascript
module.exports = {
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  // ... resto de configuración
};
```

### 2. Configurar Redis (si está disponible)

En `packages/backend/.env`:

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Optimizar PM2

En `ecosystem.config.js`:

```javascript
instances: 'max',  // Usar todas las CPUs disponibles
exec_mode: 'cluster',
```

---

## ✅ Checklist de Producción

Antes de lanzar en producción:

- [ ] Variables de entorno configuradas correctamente
- [ ] JWT_SECRET generado de forma segura
- [ ] Base de datos creada y migrada
- [ ] Build de backend y frontend completado sin errores
- [ ] PM2 configurado y procesos corriendo
- [ ] Nginx/Apache configurado como proxy reverso
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Logs monitoreados
- [ ] Health checks funcionando (`/health`, `/api/health`)
- [ ] Dominio apuntando correctamente
- [ ] Firewall configurado (puertos 80, 443, SSH)
- [ ] Email SMTP configurado (opcional)

---

## 🎯 Recursos Adicionales

- [Documentación de PM2](https://pm2.keymetrics.io/)
- [Next.js en Producción](https://nextjs.org/docs/deployment)
- [NestJS en Producción](https://docs.nestjs.com/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## 🆘 Soporte

Si tienes problemas con el despliegue:

1. **Revisa los logs**: `pm2 logs`
2. **Verifica requisitos**: Node.js, PostgreSQL versions
3. **Comprueba variables de entorno**: `.env` files
4. **Prueba health checks**: `curl http://localhost:4000/health`

---

**Última actualización**: 11 de Noviembre de 2025

**Preparado para**: Servidor Compartido sin Docker
