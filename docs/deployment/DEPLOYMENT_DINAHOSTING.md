# 🚀 Despliegue en Dinahosting

Guía específica para desplegar **Truk** en Dinahosting.

---

## 📋 Planes de Dinahosting y Compatibilidad

| Plan Dinahosting | Node.js | PostgreSQL | SSH | ¿Funciona Truk? |
|------------------|---------|------------|-----|-----------------|
| **Hosting SSD** | ⚠️ Limitado | ❌ Solo MySQL | ❌ No | ⚠️ Con adaptaciones |
| **Hosting Pro** | ⚠️ Limitado | ❌ Solo MySQL | ✅ Sí | ⚠️ Con adaptaciones |
| **Cloud VPS** | ✅ Completo | ✅ Sí | ✅ Sí | ✅ Sí, perfecto |
| **Servidor Cloud** | ✅ Completo | ✅ Sí | ✅ Sí | ✅ Sí, perfecto |

---

## 🎯 Opción 1: Cloud VPS o Servidor Cloud (RECOMENDADO)

Si tienes un **Cloud VPS** o **Servidor Cloud** de Dinahosting, tienes acceso completo.

### Ventajas:
- ✅ Acceso SSH root
- ✅ PostgreSQL disponible
- ✅ Node.js sin restricciones
- ✅ PM2 para gestión de procesos
- ✅ Control total

### Pasos de Instalación:

#### 1. Conectar por SSH

```bash
ssh root@tu-servidor.dinahosting.com
# O con tu usuario
ssh usuario@tu-servidor.dinahosting.com
```

#### 2. Verificar/Instalar Requisitos

```bash
# Verificar Node.js
node --version  # Debe ser v18+

# Si no está instalado o es versión antigua
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar PostgreSQL
psql --version

# Si no está instalado
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

#### 3. Crear Base de Datos

```bash
# Entrar como usuario postgres
sudo -u postgres psql

# En el prompt de PostgreSQL:
CREATE DATABASE truk_db;
CREATE USER truk_user WITH PASSWORD 'tu_password_segura_aqui';
GRANT ALL PRIVILEGES ON DATABASE truk_db TO truk_user;
\q
```

#### 4. Clonar Repositorio

```bash
cd /var/www  # O tu directorio preferido
git clone https://github.com/JosuIru/comunidad-viva.git truk
cd truk
```

#### 5. Instalar Dependencias

```bash
npm install
cd packages/backend && npm install && cd ../..
cd packages/web && npm install && cd ../..
```

#### 6. Configurar Variables de Entorno

**Backend:**
```bash
cd packages/backend
cp .env.example .env
nano .env
```

Editar:
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://truk_user:tu_password_segura_aqui@localhost:5432/truk_db"
JWT_SECRET="$(openssl rand -base64 64)"
FRONTEND_URL="https://tudominio.com"
BACKEND_URL="https://tudominio.com/api"
```

**Frontend:**
```bash
cd ../web
cp .env.example .env.local
nano .env.local
```

Editar:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL="https://tudominio.com/api"
NEXT_PUBLIC_WS_URL="wss://tudominio.com"
```

#### 7. Preparar Base de Datos

```bash
cd /var/www/truk/packages/backend
npx prisma generate
npx prisma migrate deploy
npm run seed  # Opcional: datos de ejemplo
```

#### 8. Compilar Aplicación

```bash
# Backend
cd /var/www/truk/packages/backend
npm run build

# Frontend
cd /var/www/truk/packages/web
npm run build
```

#### 9. Instalar PM2

```bash
sudo npm install -g pm2
```

#### 10. Iniciar Aplicación

```bash
cd /var/www/truk
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Ejecutar el comando que te muestre PM2
```

#### 11. Configurar Nginx (Dinahosting suele usar Nginx)

```bash
sudo nano /etc/nginx/sites-available/truk
```

Contenido:
```nginx
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;

    # Frontend
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
}
```

Activar:
```bash
sudo ln -s /etc/nginx/sites-available/truk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 12. Configurar SSL

Dinahosting tiene **Let's Encrypt gratuito** en el panel de control:

1. Accede al panel de Dinahosting
2. Ve a **Dominios** > Tu dominio > **SSL**
3. Activa **Let's Encrypt** (gratis)
4. Espera unos minutos a que se active

O manualmente:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

#### 13. Verificar

```bash
# Health checks
curl http://localhost:4000/health
curl http://localhost:3000/api/health

# Ver logs
pm2 logs

# Estado
pm2 list
```

---

## 🎯 Opción 2: Hosting Compartido (SSD/Pro) con MySQL

Si tienes **Hosting SSD** o **Hosting Pro**, solo tienes MySQL disponible.

### Necesitas Adaptar la Aplicación

#### A. Adaptar Prisma para MySQL

**Cambiar schema.prisma:**

```prisma
datasource db {
  provider = "mysql"  // Cambiar de "postgresql" a "mysql"
  url      = env("DATABASE_URL")
}
```

#### B. Crear Base de Datos MySQL

1. Accede al **Panel de Dinahosting**
2. Ve a **Bases de Datos** > **Crear Base de Datos**
3. Selecciona **MySQL**
4. Anota:
   - Nombre BD: `truk_db`
   - Usuario: `truk_user`
   - Contraseña: (la que elijas)
   - Host: (normalmente `localhost` o IP del servidor)

#### C. Configurar DATABASE_URL para MySQL

```bash
DATABASE_URL="mysql://truk_user:tu_password@localhost:3306/truk_db"
```

#### D. Regenerar Migraciones

```bash
cd packages/backend

# Borrar migraciones antiguas de PostgreSQL
rm -rf prisma/migrations

# Crear nueva migración para MySQL
npx prisma migrate dev --name init_mysql
```

#### E. Aplicar Cambios

```bash
npx prisma generate
npx prisma migrate deploy
npm run seed
```

---

## 🎯 Opción 3: Base de Datos PostgreSQL Externa (Si solo tienes MySQL)

Si prefieres mantener PostgreSQL pero tu plan no lo incluye:

### Usar Supabase (PostgreSQL Gratis)

**Supabase** ofrece PostgreSQL gratis:

1. Crea cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **Settings** > **Database**
4. Copia la **Connection String**

**En tu .env:**
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### O usar Neon.tech (PostgreSQL Gratis)

1. Crea cuenta en [neon.tech](https://neon.tech)
2. Crea un proyecto
3. Copia la connection string

**Ventajas**:
- ✅ Gratis hasta 512MB
- ✅ No necesitas cambiar nada en tu código
- ✅ PostgreSQL completo

---

## 🎯 Opción 4: Hosting Node.js en Dinahosting

Si tu plan tiene **"Aplicaciones Node.js"** en el panel:

1. **Panel Dinahosting** > **Aplicaciones** > **Node.js**
2. Crea nueva aplicación
3. Configura:
   - Ruta: `/ruta/a/tu/app`
   - Puerto: `3000` (frontend) y `4000` (backend)
   - Comando: `npm start`
4. Sube archivos por FTP/SFTP
5. La aplicación se ejecutará automáticamente

---

## 💡 Mi Recomendación para Dinahosting

### Si tienes Cloud VPS/Servidor:
✅ **Sigue la Opción 1** (instalación completa con PostgreSQL)

### Si tienes Hosting Compartido:
1. **Mejor opción**: Usa **PostgreSQL externo** (Supabase/Neon gratis)
   - No necesitas cambiar código
   - Más fácil de mantener

2. **Alternativa**: Adapta a MySQL
   - Requiere cambios en el código
   - Menos compatible con algunas features

---

## 🆘 Troubleshooting Dinahosting

### No puedo instalar PM2

Si no tienes permisos para instalar PM2 globalmente:

```bash
cd /var/www/truk
npm install pm2 --save-dev
npx pm2 start ecosystem.config.js
```

### Puerto 80/443 no accesible

Dinahosting gestiona los puertos por ti. Asegúrate de:
- Configurar proxy en Nginx
- O usar la configuración de aplicaciones Node.js del panel

### Error de permisos

```bash
# Dar permisos al usuario
sudo chown -R $USER:$USER /var/www/truk
```

---

## 📞 Soporte Dinahosting

Si tienes problemas:
1. **Ticket de Soporte**: Desde el panel de Dinahosting
2. **Email**: soporte@dinahosting.com
3. **Teléfono**: +34 981 91 94 81

Pregunta específicamente:
- "¿Mi plan soporta aplicaciones Node.js?"
- "¿Tengo acceso SSH?"
- "¿Puedo instalar PostgreSQL o solo tengo MySQL?"

---

## 💰 Costos en Dinahosting

| Plan | Precio | Mejor para |
|------|--------|------------|
| Hosting SSD | ~8-15€/mes | Solo con BD externa |
| Hosting Pro | ~15-25€/mes | Con BD externa + SSH |
| Cloud VPS | ~10-30€/mes | ⭐ Ideal para Truk |
| Servidor Cloud | ~30-80€/mes | Proyectos grandes |

---

## ✅ Checklist

- [ ] Verificar qué plan de Dinahosting tienes
- [ ] Comprobar si tienes acceso SSH
- [ ] Ver si tienes PostgreSQL o solo MySQL
- [ ] Elegir opción de despliegue
- [ ] Seguir pasos de instalación
- [ ] Configurar SSL en panel Dinahosting
- [ ] Verificar que todo funciona

---

## 🎯 Siguiente Paso

**Dime qué plan de Dinahosting tienes** y te doy instrucciones exactas:

1. **¿Tienes acceso SSH?** Prueba: `ssh tuusuario@tudominio.com`
2. **¿Qué base de datos tienes disponible?** (MySQL/PostgreSQL)
3. **¿Qué plan específico tienes?** (Hosting SSD / Pro / Cloud VPS)

Con esa información te preparo el despliegue exacto para tu caso.
