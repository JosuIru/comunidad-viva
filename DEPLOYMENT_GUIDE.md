# Guía de Despliegue en Producción - Truk

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
3. [Despliegue con Docker Compose](#despliegue-con-docker-compose)
4. [Despliegue Manual](#despliegue-manual)
5. [Base de Datos](#base-de-datos)
6. [Configuración de Nginx](#configuración-de-nginx)
7. [SSL/TLS con Let's Encrypt](#ssltls-con-lets-encrypt)
8. [Monitoreo y Logs](#monitoreo-y-logs)
9. [Backup y Recuperación](#backup-y-recuperación)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos Previos

### Hardware Mínimo Recomendado
- **CPU**: 2 cores
- **RAM**: 4GB
- **Disco**: 50GB SSD
- **Ancho de banda**: 100 Mbps

### Software
- Docker 24.0+ y Docker Compose 2.0+
- Node.js 18+ (si despliegue manual)
- PostgreSQL 16+ (si despliegue manual)
- Redis 7+ (si despliegue manual)
- Nginx (opcional, para reverse proxy)

### Dominios y DNS
- Dominio registrado (ej: `tudominio.com`)
- Registros DNS configurados:
  - `A` record: `api.tudominio.com` → IP del servidor
  - `A` record: `tudominio.com` → IP del servidor

---

## 🔐 Configuración de Variables de Entorno

### 1. Copiar archivos de ejemplo

```bash
# Root
cp .env.example .env

# Backend
cp packages/backend/.env.example packages/backend/.env

# Frontend
cp packages/web/.env.example packages/web/.env.local
```

### 2. Configurar variables críticas

Edita `.env` en la raíz:

```bash
# ===== CRÍTICO: Generar secretos seguros =====
# Genera con: openssl rand -base64 64
JWT_SECRET=tu_secreto_jwt_muy_largo_y_aleatorio_minimo_64_caracteres
NEXTAUTH_SECRET=tu_secreto_nextauth_muy_largo_y_aleatorio_minimo_64_caracteres

# ===== Base de Datos =====
DB_USER=truk_user
DB_PASSWORD=contraseña_segura_aqui_min_20_caracteres
DATABASE_URL=postgresql://truk_user:contraseña_segura_aqui@postgres:5432/truk_db

# ===== Redis =====
REDIS_PASSWORD=contraseña_redis_segura_aqui
REDIS_URL=redis://:contraseña_redis_segura_aqui@redis:6379

# ===== URLs =====
NODE_ENV=production
FRONTEND_URL=https://tudominio.com
API_URL=https://api.tudominio.com
NEXTAUTH_URL=https://tudominio.com

# ===== Email (SMTP) =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# ===== Storage S3 (Opcional) =====
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=truk-uploads

# ===== Blockchain (Opcional) =====
SEMILLA_TOKEN_POLYGON=0xDireccionDelContratoEnPolygon
POLYGON_RPC_URL=https://polygon-rpc.com
FEDERATION_ENABLED=true
COMMUNITY_DID=did:truk:tu-identificador-unico

# ===== Monitoring (Opcional) =====
SENTRY_DSN=https://tu-sentry-dsn
```

### 3. Verificar permisos

```bash
chmod 600 .env
chmod 600 packages/backend/.env
chmod 600 packages/web/.env.local
```

---

## 🐳 Despliegue con Docker Compose

### Opción 1: Despliegue Completo (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/truk.git
cd truk

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Construir y levantar servicios
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Verificar que todo esté corriendo
docker-compose ps

# 5. Ver logs
docker-compose logs -f
```

### Opción 2: Con Nginx Reverse Proxy

```bash
# Incluir perfil de nginx
docker-compose --profile with-nginx up -d --build
```

### Comandos Útiles

```bash
# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Parar todos los servicios
docker-compose down

# Parar y eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v

# Rebuild de un servicio específico
docker-compose up -d --build backend

# Ejecutar comando en contenedor
docker-compose exec backend npx prisma migrate deploy
```

---

## 🔧 Despliegue Manual

Si prefieres no usar Docker:

### 1. Backend

```bash
cd packages/backend

# Instalar dependencias
npm ci --only=production

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Compilar
npm run build

# Iniciar (usando PM2 para producción)
npm install -g pm2
pm2 start dist/main.js --name truk-backend

# Guardar configuración PM2
pm2 save
pm2 startup
```

### 2. Frontend

```bash
cd packages/web

# Instalar dependencias
npm ci --only=production

# Compilar
npm run build

# Iniciar con PM2
pm2 start npm --name truk-frontend -- start

# Guardar configuración
pm2 save
```

---

## 🗄️ Base de Datos

### Migraciones

```bash
# Aplicar migraciones en producción
docker-compose exec backend npx prisma migrate deploy

# O manualmente
cd packages/backend
npx prisma migrate deploy
```

### Seed de Datos (Primera instalación)

```bash
# Ejecutar seed inicial
docker-compose exec backend npm run seed

# O manualmente
cd packages/backend
npm run seed
```

### Backups Automáticos

El docker-compose incluye un servicio de backup:

```bash
# Activar servicio de backup
docker-compose --profile tools up -d backup

# Backup manual
docker-compose exec backup pg_dump -h postgres -U truk_user truk_db > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
# Copiar backup al contenedor
docker cp backup_20240101.sql comunidad-viva-db:/tmp/

# Restaurar
docker-compose exec postgres psql -U truk_user -d truk_db -f /tmp/backup_20240101.sql
```

---

## 🌐 Configuración de Nginx

### nginx.conf

Crea o edita `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;

    # Upstream backends
    upstream backend {
        least_conn;
        server backend:4000;
    }

    upstream frontend {
        least_conn;
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name tudominio.com api.tudominio.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name tudominio.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Compression
        gzip on;
        gzip_vary on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location / {
            limit_req zone=general_limit burst=20 nodelay;
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.tudominio.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            limit_req zone=api_limit burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

---

## 🔒 SSL/TLS con Let's Encrypt

### Usando Certbot

```bash
# Instalar certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d tudominio.com -d api.tudominio.com

# Renovación automática (ya configurada por certbot)
sudo certbot renew --dry-run
```

### Usando Docker

```bash
# Obtener certificados con certbot en Docker
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  -d tudominio.com -d api.tudominio.com

# Copiar certificados a nginx
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem nginx/ssl/
```

---

## 📊 Monitoreo y Logs

### Logs con Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 backend

# Logs con timestamp
docker-compose logs -ft backend
```

### Activar Monitoring Stack

```bash
# Prometheus + Grafana
docker-compose --profile monitoring up -d

# Acceder a:
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3001 (admin/admin)
```

### PM2 Monitoring (Despliegue manual)

```bash
# Ver estado de procesos
pm2 status

# Logs en tiempo real
pm2 logs

# Dashboard en terminal
pm2 monit

# Guardar snapshot
pm2 save

# Ver métricas detalladas
pm2 describe truk-backend
```

---

## 💾 Backup y Recuperación

### Script de Backup Automático

Crea `scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/home/backups/truk"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="truk-postgres"

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Backup de base de datos
docker exec $DB_CONTAINER pg_dump -U truk_user truk_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup de uploads (si están en volumen local)
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/lib/docker/volumes/truk_backend_uploads/_data .

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

### Cron Job para Backups

```bash
# Editar crontab
crontab -e

# Añadir backup diario a las 2:00 AM
0 2 * * * /path/to/scripts/backup.sh >> /var/log/truk-backup.log 2>&1
```

---

## 🔧 Troubleshooting

### Backend no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar variables de entorno
docker-compose exec backend env | grep DATABASE_URL

# Reiniciar servicio
docker-compose restart backend

# Verificar salud de PostgreSQL
docker-compose exec postgres pg_isready
```

### Frontend no se conecta al API

1. Verificar NEXT_PUBLIC_API_URL en `.env.local`
2. Verificar CORS en `packages/backend/src/main.ts`
3. Verificar Nginx reverse proxy
4. Ver logs del navegador (F12 → Console)

### Errores de base de datos

```bash
# Verificar conexión
docker-compose exec backend npx prisma db pull

# Verificar estado de migraciones
docker-compose exec backend npx prisma migrate status

# Resetear migraciones (¡CUIDADO! Solo en desarrollo)
docker-compose exec backend npx prisma migrate reset
```

### Alto uso de memoria

```bash
# Ver uso de recursos
docker stats

# Limitar memoria en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Problemas de SSL

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Test de configuración nginx
docker-compose exec nginx nginx -t
```

---

## 📦 Actualizaciones

### Actualizar a nueva versión

```bash
# 1. Backup de datos
./scripts/backup.sh

# 2. Pull últimos cambios
git pull origin main

# 3. Rebuild de imágenes
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# 4. Aplicar migraciones
docker-compose exec backend npx prisma migrate deploy

# 5. Verificar salud de servicios
docker-compose ps
curl https://api.tudominio.com/health
```

---

## 🎯 Checklist de Producción

Antes de ir a producción, verifica:

- [ ] Todas las variables de entorno configuradas
- [ ] Secretos JWT generados con `openssl rand -base64 64`
- [ ] Contraseñas de base de datos seguras (min 20 caracteres)
- [ ] SSL/TLS configurado correctamente
- [ ] Backups automáticos configurados
- [ ] Monitoring activo (logs, métricas)
- [ ] Rate limiting configurado en Nginx
- [ ] CORS configurado correctamente
- [ ] Emails de notificación funcionando
- [ ] Dominio DNS configurado
- [ ] Firewall configurado (solo puertos 80, 443, 22 abiertos)
- [ ] Updates automáticos de seguridad activados
- [ ] Plan de disaster recovery documentado

---

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Docker Compose Production](https://docs.docker.com/compose/production/)
- [Nginx Security](https://www.nginx.com/blog/nginx-security-best-practices/)

---

## 🆘 Soporte

Para problemas o preguntas:
- Issues: https://github.com/tu-usuario/truk/issues
- Email: soporte@tudominio.com
- Documentación: https://docs.tudominio.com
