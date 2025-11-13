# 🚀 Guía de Instalación - Truk Comunidad Viva

Esta guía te ayudará a instalar Truk en tu servidor en menos de 10 minutos.

## 📋 Requisitos

- **Servidor Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **2 GB RAM** mínimo (4 GB recomendado)
- **10 GB espacio** en disco
- **Conexión a Internet**
- **Acceso root o sudo**

## ⚡ Instalación Rápida (Recomendado)

### 1. Descargar el proyecto

```bash
git clone https://github.com/tu-usuario/truk.git
cd truk
```

### 2. Ejecutar el instalador automático

```bash
chmod +x install.sh
./install.sh
```

¡Eso es todo! El script instalará Docker, configurará todo automáticamente y arrancará los servicios.

---

## 🔧 Instalación Manual

Si prefieres más control, sigue estos pasos:

### Paso 1: Instalar Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar
```

### Paso 2: Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Paso 3: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tu editor favorito
nano .env
```

**IMPORTANTE:** Cambia estos valores:
- `POSTGRES_PASSWORD`: Contraseña segura para la base de datos
- `REDIS_PASSWORD`: Contraseña segura para Redis
- `JWT_SECRET`: String aleatorio largo (mínimo 32 caracteres)
- `JWT_REFRESH_SECRET`: Otro string aleatorio largo

**Generar secretos seguros:**
```bash
openssl rand -base64 32
```

### Paso 4: Construir e iniciar

```bash
# Construir imágenes
docker-compose build

# Iniciar todos los servicios
docker-compose up -d

# Ver logs para confirmar que todo arrancó bien
docker-compose logs -f backend
```

### Paso 5: Verificar instalación

```bash
# Verificar que los servicios están corriendo
docker-compose ps

# Verificar salud del backend
curl http://localhost:3000/health
```

Deberías ver algo como:
```json
{"status":"ok","database":"connected"}
```

---

## 🌐 Acceso a la Aplicación

Una vez instalado:

- **API Backend:** `http://tu-servidor:3000`
- **Documentación API:** `http://tu-servidor:3000/api`
- **Salud del sistema:** `http://tu-servidor:3000/health`

---

## 🛠️ Comandos Útiles

### Ver logs en tiempo real
```bash
docker-compose logs -f backend
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Detener servicios
```bash
docker-compose down
```

### Detener y eliminar datos (⚠️ CUIDADO)
```bash
docker-compose down -v
```

### Ver estado de servicios
```bash
docker-compose ps
```

### Ejecutar migraciones manualmente
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Acceder a la base de datos
```bash
docker-compose exec postgres psql -U comunidad -d comunidad_viva
```

### Backup de la base de datos
```bash
docker-compose exec postgres pg_dump -U comunidad comunidad_viva > backup_$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
cat backup_20240101.sql | docker-compose exec -T postgres psql -U comunidad comunidad_viva
```

---

## 🔐 Configuración de Producción

### 1. Usar dominio propio

Edita `.env`:
```bash
CORS_ORIGIN=https://tu-dominio.com
```

### 2. Configurar SSL/HTTPS

Opción A - Usando Nginx (incluido):
```bash
# Generar certificado con Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com

# Iniciar con Nginx
docker-compose --profile with-nginx up -d
```

Opción B - Usando Cloudflare/proxy externo:
- Configura tu proxy para apuntar a `http://tu-servidor:3000`
- Activa SSL en tu proxy

### 3. Configurar Email

Edita `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-comunidad.com
```

Para Gmail, necesitas crear una [App Password](https://support.google.com/accounts/answer/185833).

### 4. Configurar almacenamiento (S3)

Si quieres usar S3 para imágenes/archivos, edita `.env`:
```bash
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_S3_BUCKET=tu-bucket
AWS_REGION=us-east-1
```

---

## 🐛 Solución de Problemas

### El backend no arranca

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que la base de datos está lista
docker-compose logs postgres

# Reiniciar todo
docker-compose restart
```

### Error de conexión a la base de datos

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Verificar variables de entorno
docker-compose exec backend env | grep DATABASE_URL
```

### Puerto 3000 ya en uso

Edita `.env` y cambia:
```bash
BACKEND_PORT=3001  # O cualquier puerto libre
```

### Sin espacio en disco

```bash
# Limpiar imágenes antiguas
docker system prune -a

# Ver uso de espacio
docker system df
```

### Prisma no encuentra la base de datos

```bash
# Regenerar cliente Prisma
docker-compose exec backend npx prisma generate

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy
```

---

## 🔄 Actualización

Para actualizar a una nueva versión:

```bash
# 1. Hacer backup de la base de datos
docker-compose exec postgres pg_dump -U comunidad comunidad_viva > backup_antes_actualizar.sql

# 2. Detener servicios
docker-compose down

# 3. Actualizar código
git pull origin main

# 4. Reconstruir imágenes
docker-compose build --no-cache

# 5. Iniciar servicios
docker-compose up -d

# 6. Verificar logs
docker-compose logs -f backend
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
docker stats
```

### Ver logs de errores

```bash
docker-compose logs backend | grep ERROR
```

### Verificar salud

```bash
watch -n 5 'curl -s http://localhost:3000/health | jq'
```

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Consulta la sección de [Solución de Problemas](#-solución-de-problemas)
3. Abre un issue en GitHub
4. Contacta al equipo en [tu-email-soporte]

---

## 📝 Notas Adicionales

### Requisitos de hardware recomendados

- **Desarrollo:** 2 GB RAM, 10 GB disco
- **Producción pequeña** (< 100 usuarios): 4 GB RAM, 20 GB disco
- **Producción media** (100-1000 usuarios): 8 GB RAM, 50 GB disco
- **Producción grande** (> 1000 usuarios): 16+ GB RAM, 100+ GB disco

### Puertos utilizados

- **3000:** Backend API
- **5432:** PostgreSQL
- **6379:** Redis
- **80/443:** Nginx (si se usa)

### Backups automáticos

Añade a tu crontab:

```bash
# Backup diario a las 2 AM
0 2 * * * cd /ruta/a/truk && docker-compose exec -T postgres pg_dump -U comunidad comunidad_viva | gzip > /backups/truk_$(date +\%Y\%m\%d).sql.gz
```

---

## 🎉 ¡Listo!

Tu plataforma Truk debería estar funcionando.

Accede a `http://tu-servidor:3000/api` para ver la documentación de la API.

¡Bienvenido a la economía colaborativa local! 🌱
