# 🚀 Guía de Deployment - Comunidad Viva

Esta guía explica cómo desplegar Comunidad Viva en producción.

## 📋 Prerequisitos

- Servidor con Docker y Docker Compose instalados
- Dominio configurado (opcional pero recomendado)
- Puerto 80 y 443 disponibles (para HTTPS)

## 🎯 Opción 1: Deployment con Docker (Recomendado)

### 1. Preparar el servidor

```bash
# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

### 2. Clonar el repositorio en el servidor

```bash
# SSH a tu servidor
ssh usuario@tu-servidor.com

# Clonar el repo
git clone https://github.com/tu-usuario/comunidad-viva.git
cd comunidad-viva
```

### 3. Configurar variables de entorno

```bash
# Copiar ejemplos de .env
cp packages/backend/.env.example packages/backend/.env
cp packages/web/.env.production.example packages/web/.env.production

# Editar con tus valores de producción
nano packages/backend/.env
```

**Variables importantes a configurar:**

**Backend (.env):**
```bash
# Base de datos
DATABASE_URL="postgresql://comunidad:TU_PASSWORD_SEGURO@postgres:5432/comunidad_viva"

# JWT
JWT_SECRET="tu-jwt-secret-muy-seguro-y-largo"
JWT_EXPIRES_IN="7d"

# URLs
FRONTEND_URL="https://tu-dominio.com"
BACKEND_URL="https://api.tu-dominio.com"

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password"
```

**Frontend (.env.production):**
```bash
NEXT_PUBLIC_API_URL="https://api.tu-dominio.com"
```

### 4. Construir y levantar los contenedores

```bash
# Construir imágenes
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Levantar servicios
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Ver logs
docker compose logs -f

# Verificar que todos los servicios están corriendo
docker compose ps
```

### 5. Ejecutar migraciones de base de datos

```bash
# Aplicar migraciones
docker compose exec backend npx prisma migrate deploy

# (Opcional) Seed de datos demo
docker compose exec backend npm run seed
```

### 6. Verificar que funciona

```bash
# Verificar backend
curl http://localhost:4000/health

# Verificar frontend
curl http://localhost:3000
```

## 🌐 Opción 2: Configurar dominio con NGINX + SSL

### 1. Instalar NGINX

```bash
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx
```

### 2. Configurar NGINX

Crear archivo `/etc/nginx/sites-available/comunidad-viva`:

```nginx
# Frontend
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

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
}

# Backend API
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
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

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/comunidad-viva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Obtener certificado SSL (HTTPS)

```bash
# Obtener certificado para ambos dominios
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com -d api.tu-dominio.com

# Certbot configurará automáticamente NGINX para usar HTTPS
# El certificado se renovará automáticamente
```

## 🔄 Actualizar la aplicación

```bash
# SSH al servidor
ssh usuario@tu-servidor.com
cd comunidad-viva

# Pull últimos cambios
git pull origin main

# Rebuild y restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Aplicar migraciones si hay nuevas
docker compose exec backend npx prisma migrate deploy
```

## 📊 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend

# Ver estado de servicios
docker compose ps

# Ver uso de recursos
docker stats
```

## 🔐 Backup de Base de Datos

```bash
# Crear backup
docker compose exec postgres pg_dump -U comunidad comunidad_viva > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20250101.sql | docker compose exec -T postgres psql -U comunidad comunidad_viva
```

## ⚡ Optimizaciones de Producción

### 1. Configurar PM2 para reinicio automático

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start "docker compose -f docker-compose.yml -f docker-compose.prod.yml up" --name comunidad-viva
pm2 save
pm2 startup
```

### 2. Limitar recursos de Docker

Editar `docker-compose.prod.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 3. Configurar log rotation

```bash
# Configurar Docker para rotar logs
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

## 🐛 Troubleshooting

### El frontend no se conecta al backend

Verificar variables de entorno:
```bash
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

### Error de base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker compose ps postgres

# Ver logs de PostgreSQL
docker compose logs postgres

# Conectarse a la base de datos
docker compose exec postgres psql -U comunidad -d comunidad_viva
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :4000
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID
```

## 📱 Opciones alternativas de deployment

### Vercel (Solo Frontend - Recomendado para Next.js)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar repositorio de GitHub
3. Configurar variables de entorno en Vercel dashboard
4. Deploy automático en cada push

### Railway / Render (Full Stack)

1. Crear cuenta en [railway.app](https://railway.app) o [render.com](https://render.com)
2. Conectar repositorio
3. Configurar servicios (PostgreSQL, Backend, Frontend)
4. Deploy automático

### DigitalOcean App Platform

1. Crear cuenta en DigitalOcean
2. Usar App Platform
3. Conectar repositorio
4. Configurar componentes y base de datos

## ✅ Checklist de Deployment

- [ ] Variables de entorno configuradas
- [ ] Base de datos PostgreSQL funcionando
- [ ] Migraciones aplicadas
- [ ] Backend respondiendo en /health
- [ ] Frontend cargando correctamente
- [ ] SSL/HTTPS configurado (si usas dominio)
- [ ] Backups programados
- [ ] Logs configurados
- [ ] Monitoreo activo
- [ ] DNS apuntando correctamente
- [ ] Firewall configurado

## 🆘 Soporte

Si encuentras problemas, verifica:
1. Logs de Docker: `docker compose logs`
2. Estado de servicios: `docker compose ps`
3. Variables de entorno: Verifica que estén correctamente configuradas
4. Conectividad de red: Verifica puertos y firewall
5. Espacio en disco: `df -h`
6. Memoria disponible: `free -h`

---

**¡Tu aplicación está lista para producción!** 🎉
