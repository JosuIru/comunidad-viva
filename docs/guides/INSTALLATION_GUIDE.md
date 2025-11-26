# Guía Completa de Instalación - Truk

**Última actualización**: Noviembre 2025

Esta guía unificada cubre todas las opciones de instalación de Truk, desde la instalación rápida con Docker hasta configuraciones avanzadas.

---

## Tabla de Contenidos

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Opción 1: Instalación Rápida con Docker](#opción-1-instalación-rápida-con-docker-recomendado)
3. [Opción 2: Instalación en Railway (Cloud)](#opción-2-instalación-en-railway-cloud)
4. [Opción 3: Instalación Manual](#opción-3-instalación-manual)
5. [Opción 4: Instalación Paso a Paso (Guiada)](#opción-4-instalación-paso-a-paso-guiada)
6. [Configuración de Producción](#configuración-de-producción)
7. [Comandos Útiles](#comandos-útiles)
8. [Solución de Problemas](#solución-de-problemas)
9. [Actualización](#actualización)

---

## Requisitos del Sistema

### Mínimos
- **Servidor Linux** (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- **2 GB RAM**
- **10 GB espacio** en disco
- **Conexión a Internet**
- **Acceso root o sudo**

### Recomendados para Producción
- **4-8 GB RAM** (dependiendo del número de usuarios)
- **20-50 GB espacio** en disco
- **CPU**: 2+ cores
- **Dominio propio** con SSL/HTTPS

### Software Requerido

| Software | Versión Mínima | Necesario para |
|----------|---------------|----------------|
| **Node.js** | v18.0.0+ | Instalación Manual |
| **npm** | v9.0.0+ | Instalación Manual |
| **PostgreSQL** | v14.0+ | Instalación Manual |
| **Docker** | v20.0+ | Instalación con Docker |
| **Docker Compose** | v2.0+ | Instalación con Docker |
| **Git** | v2.0+ | Todas las instalaciones |

---

## Opción 1: Instalación Rápida con Docker (Recomendado)

Esta es la forma más rápida de instalar Truk. El script automático instalará Docker, configurará todo y arrancará los servicios.

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk
```

### Paso 2: Ejecutar el instalador automático

```bash
chmod +x install.sh
./install.sh
```

El script realizará automáticamente:
- Instalación de Docker y Docker Compose
- Generación de secretos seguros
- Configuración de variables de entorno
- Construcción de imágenes Docker
- Inicio de servicios (Backend, PostgreSQL, Redis)
- Ejecución de migraciones de base de datos

**Tiempo estimado**: 5-10 minutos

### Paso 3: Verificar la instalación

```bash
# Ver estado de servicios
docker-compose ps

# Verificar salud del backend
curl http://localhost:3000/health
```

**Salida esperada**:
```json
{"status":"ok","database":"connected"}
```

### URLs de Acceso

- **API Backend**: http://localhost:3000
- **Documentación API**: http://localhost:3000/api
- **Salud del sistema**: http://localhost:3000/health

---

## Opción 2: Instalación en Railway (Cloud)

Railway es una plataforma cloud que ofrece $5 gratis mensuales. Ideal para empezar sin servidor propio.

### Paso 1: Preparar el proyecto

```bash
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk
```

### Paso 2: Ejecutar script de configuración

```bash
chmod +x railway-setup.sh
./railway-setup.sh
```

El script:
- Genera secretos seguros (JWT, etc.)
- Configura Railway CLI
- Te guía en el proceso de deployment

### Paso 3: Seguir las instrucciones interactivas

El script te pedirá:
1. Crear cuenta en Railway (si no tienes)
2. Crear un nuevo proyecto
3. Configurar variables de entorno
4. Hacer el primer deployment

**Costo estimado**: $10-15/mes después de los $5 gratis

**Documentación completa**: [Railway Deployment Guide](../deployment/railway.md)

---

## Opción 3: Instalación Manual

Si prefieres más control sobre la instalación, sigue estos pasos detallados.

### Paso 1: Instalar Docker (si no lo tienes)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar para que los cambios tengan efecto
```

### Paso 2: Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

### Paso 3: Clonar y configurar

```bash
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk

# Copiar archivo de ejemplo
cp .env.example .env
```

### Paso 4: Configurar variables de entorno

Edita `.env` con tu editor favorito:

```bash
nano .env
```

**Variables críticas a cambiar**:

```bash
# Base de Datos
POSTGRES_PASSWORD=tu_password_seguro_aqui

# Redis
REDIS_PASSWORD=otro_password_seguro

# JWT Secrets (generar con: openssl rand -base64 32)
JWT_SECRET=tu_jwt_secret_muy_largo_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_aqui

# URLs (ajustar según tu dominio)
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

**Generar secretos seguros**:
```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar JWT_REFRESH_SECRET
openssl rand -base64 32

# Generar POSTGRES_PASSWORD
openssl rand -base64 24
```

### Paso 5: Construir e iniciar

```bash
# Construir imágenes Docker
docker-compose build

# Iniciar todos los servicios en segundo plano
docker-compose up -d

# Ver logs para confirmar que todo arrancó correctamente
docker-compose logs -f backend
```

### Paso 6: Ejecutar migraciones (si es necesario)

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

---

## Opción 4: Instalación Paso a Paso (Guiada)

Esta opción es ideal para desarrollo local sin Docker.

### Verificar requisitos previos

```bash
# Verificar Node.js (debe ser v18+)
node --version

# Verificar npm
npm --version

# Verificar PostgreSQL
psql --version

# Verificar Git
git --version
```

### Paso 1: Clonar el repositorio

```bash
cd ~/proyectos
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk
```

**Estructura esperada**:
```
truk/
├── packages/
│   ├── backend/
│   └── web/
├── package.json
└── README.md
```

### Paso 2: Instalar dependencias

```bash
# Instalar dependencias del workspace completo
npm install
```

**Tiempo estimado**: 2-5 minutos

### Paso 3: Configurar PostgreSQL

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER comunidad WITH PASSWORD 'comunidad_secure_2024';
CREATE DATABASE comunidad_viva OWNER comunidad;
GRANT ALL PRIVILEGES ON DATABASE comunidad_viva TO comunidad;

# Salir
\q
```

### Paso 4: Configurar variables de entorno del backend

```bash
cd packages/backend
cp .env.example .env
```

Editar `packages/backend/.env`:

```bash
DATABASE_URL="postgresql://comunidad:comunidad_secure_2024@localhost:5432/comunidad_viva"
JWT_SECRET=tu_jwt_secret_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_aqui
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Paso 5: Configurar variables de entorno del frontend

```bash
cd ../web
cp .env.example .env.local
```

Editar `packages/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Paso 6: Ejecutar migraciones

```bash
cd ../backend
npx prisma migrate dev
npx prisma db seed
```

### Paso 7: Iniciar servicios

```bash
# Desde la raíz del proyecto
cd ../..
npm run dev
```

Esto iniciará:
- Backend en http://localhost:4000
- Frontend en http://localhost:3000

**URLs de Acceso**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

---

## Configuración de Producción

### 1. Usar dominio propio

Edita `.env`:
```bash
CORS_ORIGIN=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
```

### 2. Configurar SSL/HTTPS

**Opción A - Con Nginx (incluido en Docker)**:

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Generar certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Iniciar con perfil Nginx
docker-compose --profile with-nginx up -d
```

**Opción B - Con Cloudflare/Proxy externo**:
- Configura tu proxy para apuntar a `http://tu-servidor:3000`
- Activa SSL en tu panel de control del proxy

### 3. Configurar Email (SMTP)

Edita `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-comunidad.com
```

Para Gmail, necesitas crear una [App Password](https://support.google.com/accounts/answer/185833).

### 4. Configurar almacenamiento S3 (opcional)

Para imágenes y archivos en la nube:

```bash
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_S3_BUCKET=tu-bucket
AWS_REGION=us-east-1
```

### 5. Configurar backups automáticos

Añade a tu crontab (`crontab -e`):

```bash
# Backup diario a las 2 AM
0 2 * * * cd /ruta/a/truk && docker-compose exec -T postgres pg_dump -U comunidad comunidad_viva | gzip > /backups/truk_$(date +\%Y\%m\%d).sql.gz

# Limpiar backups antiguos (más de 30 días)
0 3 * * * find /backups -name "truk_*.sql.gz" -mtime +30 -delete
```

---

## Comandos Útiles

### Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Detener y eliminar datos (⚠️ CUIDADO - borra la base de datos)
docker-compose down -v

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats

# Limpiar imágenes antiguas
docker system prune -a
```

### Base de Datos

```bash
# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Acceder a PostgreSQL
docker-compose exec postgres psql -U comunidad -d comunidad_viva

# Backup manual
docker-compose exec postgres pg_dump -U comunidad comunidad_viva > backup_$(date +%Y%m%d).sql

# Restaurar backup
cat backup_20240101.sql | docker-compose exec -T postgres psql -U comunidad comunidad_viva

# Ver tablas
docker-compose exec postgres psql -U comunidad -d comunidad_viva -c '\dt'
```

### Desarrollo

```bash
# Regenerar cliente Prisma
cd packages/backend
npx prisma generate

# Ver esquema de base de datos
npx prisma studio

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion
```

---

## Solución de Problemas

### El backend no arranca

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que PostgreSQL está listo
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

# Probar conexión manual
docker-compose exec postgres psql -U comunidad -d comunidad_viva
```

### Puerto ya en uso

```bash
# Cambiar puerto en .env
BACKEND_PORT=3001  # O cualquier puerto libre

# Reiniciar
docker-compose down && docker-compose up -d
```

### Sin espacio en disco

```bash
# Ver uso de espacio Docker
docker system df

# Limpiar imágenes y contenedores antiguos
docker system prune -a

# Ver logs de contenedores grandes
docker ps -as
```

### Prisma no encuentra la base de datos

```bash
# Regenerar cliente Prisma
docker-compose exec backend npx prisma generate

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status
```

### Problemas con permisos (Linux)

```bash
# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar
# O ejecutar:
newgrp docker
```

---

## Actualización

Para actualizar Truk a una nueva versión:

### Paso 1: Backup de seguridad

```bash
# Backup de base de datos
docker-compose exec postgres pg_dump -U comunidad comunidad_viva > backup_antes_actualizar_$(date +%Y%m%d).sql

# Backup de variables de entorno
cp .env .env.backup
```

### Paso 2: Detener servicios

```bash
docker-compose down
```

### Paso 3: Actualizar código

```bash
# Guardar cambios locales (si los hay)
git stash

# Actualizar desde repositorio
git pull origin main

# Restaurar cambios locales
git stash pop
```

### Paso 4: Reconstruir y reiniciar

```bash
# Reconstruir imágenes (sin caché para asegurar actualización)
docker-compose build --no-cache

# Iniciar servicios
docker-compose up -d

# Ejecutar nuevas migraciones (si las hay)
docker-compose exec backend npx prisma migrate deploy
```

### Paso 5: Verificar

```bash
# Ver logs
docker-compose logs -f backend

# Verificar salud
curl http://localhost:3000/health

# Verificar versión (si aplicable)
docker-compose exec backend node -e "console.log(require('./package.json').version)"
```

---

## Monitoreo

### Ver uso de recursos en tiempo real

```bash
# Docker stats
docker stats

# htop (instalar si no lo tienes: sudo apt install htop)
htop
```

### Ver logs de errores

```bash
# Solo errores del backend
docker-compose logs backend | grep ERROR

# Seguir logs de errores
docker-compose logs -f backend | grep -i error
```

### Verificar salud periódicamente

```bash
# Watch continuo
watch -n 5 'curl -s http://localhost:3000/health | jq'

# Script simple de monitoreo
while true; do
  curl -s http://localhost:3000/health || echo "❌ Backend caído"
  sleep 30
done
```

---

## Requisitos de Hardware por Escala

| Escala | Usuarios | RAM | CPU | Disco | Costo aprox. |
|--------|----------|-----|-----|-------|--------------|
| **Desarrollo** | - | 2 GB | 1 core | 10 GB | - |
| **Pequeña** | < 100 | 4 GB | 2 cores | 20 GB | $10-20/mes |
| **Media** | 100-1000 | 8 GB | 4 cores | 50 GB | $40-80/mes |
| **Grande** | > 1000 | 16+ GB | 8+ cores | 100+ GB | $150+/mes |

---

## Puertos Utilizados

| Puerto | Servicio | Descripción |
|--------|----------|-------------|
| **3000** | Backend API | API principal |
| **5432** | PostgreSQL | Base de datos |
| **6379** | Redis | Caché y sesiones |
| **80/443** | Nginx | Proxy inverso (opcional) |

---

## Soporte

Si tienes problemas durante la instalación:

1. **Revisa los logs**: `docker-compose logs -f`
2. **Consulta esta guía**: Sección [Solución de Problemas](#solución-de-problemas)
3. **Busca en issues**: [GitHub Issues](https://github.com/JosuIru/comunidad-viva/issues)
4. **Abre un nuevo issue**: Proporciona logs y detalles del error
5. **Contacto**: [Pendiente configurar canal de soporte]

---

## Próximos Pasos

Una vez instalado:

1. Accede a http://localhost:3000/api para ver la documentación de la API
2. Crea tu primera comunidad
3. Explora las funcionalidades
4. Configura tu dominio y SSL para producción
5. Configura backups automáticos

---

**¡Listo!** Tu plataforma Truk debería estar funcionando correctamente.

¡Bienvenido a la economía colaborativa local!
