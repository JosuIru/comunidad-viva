# 🚀 TRUK - Guía para Servidor Compartido (Shared Hosting)

Esta guía te ayudará a instalar TRUK en un servidor compartido sin acceso root.

---

## 📋 Requisitos Previos

### Lo que necesitas en tu hosting:

- ✅ **SSH/Terminal access** (acceso por SSH)
- ✅ **PostgreSQL** o base de datos compatible
- ✅ **Node.js** (o posibilidad de instalarlo con nvm)
- ✅ Al menos **2 GB de RAM**
- ✅ Al menos **5 GB de espacio en disco**
- ✅ Soporte para **procesos persistentes** (Node.js daemons)

### Proveedores Recomendados:

- **A2 Hosting** (Node.js Hosting)
- **HostGator** (VPS)
- **Bluehost** (VPS)
- **DreamHost** (VPS)
- **DigitalOcean** App Platform (PaaS)
- **Heroku**
- **Railway.app**
- **Render.com**

> ⚠️ **Importante**: Los planes de hosting compartido básico normalmente **NO soportan** aplicaciones Node.js. Necesitas un plan que específicamente soporte Node.js o un VPS compartido.

---

## 🎯 Diferencias con Servidor Dedicado

| Característica | Servidor Dedicado | Shared Hosting |
|---------------|-------------------|----------------|
| Acceso root | ✅ Sí | ❌ No |
| Systemd services | ✅ Sí | ❌ No |
| Nginx/Apache config | ✅ Sí | ⚠️ Limited (.htaccess) |
| PostgreSQL | ✅ Instalable | ⚠️ Proporcionado |
| Redis | ✅ Instalable | ❌ Usualmente no |
| SSL/HTTPS | ✅ Let's Encrypt | ✅ Panel de control |
| Firewall | ✅ UFW | ❌ No disponible |
| Cron jobs | ✅ Root cron | ✅ User cron |
| Node.js | ✅ Versión libre | ⚠️ Versión fija |

---

## 📦 Instalación Paso a Paso

### 1. Conectar por SSH

```bash
ssh tu_usuario@tu-hosting.com
```

### 2. Descargar el Script de Instalación

```bash
# Descargar
curl -o install-shared.sh https://raw.githubusercontent.com/JosuIru/comunidad-viva/main/deployment/scripts/install-shared.sh

# O con wget
wget https://raw.githubusercontent.com/JosuIru/comunidad-viva/main/deployment/scripts/install-shared.sh

# Dar permisos de ejecución
chmod +x install-shared.sh
```

### 3. Preparar Variables de Entorno (Opcional)

Si quieres personalizar la instalación:

```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
export BACKEND_PORT=4000
export FRONTEND_PORT=3000
export FRONTEND_URL="https://tu-dominio.com"
export NEXT_PUBLIC_API_URL="https://api.tu-dominio.com"
```

### 4. Ejecutar la Instalación

```bash
./install-shared.sh
```

El script te pedirá:
- URL de conexión a PostgreSQL
- Opcionalmente, Redis URL
- Configuraciones adicionales

### 5. Iniciar Servicios

```bash
cd ~/truk

# Iniciar backend
./start-backend.sh

# Esperar 5 segundos

# Iniciar frontend
./start-frontend.sh
```

### 6. Verificar Estado

```bash
cd ~/truk
./status.sh
```

Deberías ver:
```
✓ Backend: ACTIVO (PID: 12345)
✓ Frontend: ACTIVO (PID: 12346)
```

---

## 🛠️ Gestión de Servicios

### Comandos Principales

```bash
# Ver estado
~/truk/status.sh

# Iniciar servicios
~/truk/start-backend.sh
~/truk/start-frontend.sh

# Reiniciar servicios
~/truk/restart-services.sh

# Detener servicios
~/truk/stop-services.sh

# Ver logs
tail -f ~/truk/logs/backend.log
tail -f ~/truk/logs/frontend.log

# Crear backup
~/truk/backup.sh
```

---

## 🔧 Configuración del Panel de Control

### Configurar Dominios

En el panel de control de tu hosting (cPanel, Plesk, etc.):

#### Para el Frontend:

1. Ve a **Dominios** o **Subdominios**
2. Crea/edita tu dominio principal (ej: `tudominio.com`)
3. Configura el **Document Root** a: `~/truk/public_html`
4. En **Proxy** o **Application**, configura:
   - Puerto: `3000` (o el que configuraste)
   - Tipo: `Node.js` o `HTTP Proxy`

#### Para el Backend (API):

1. Crea un subdominio (ej: `api.tudominio.com`)
2. Configura el **Document Root** a: `~/truk/public_html`
3. En **Proxy** o **Application**, configura:
   - Puerto: `4000` (o el que configuraste)
   - Tipo: `Node.js` o `HTTP Proxy`

### Configurar SSL/HTTPS

En tu panel de control:

1. Ve a **SSL/TLS** o **Let's Encrypt**
2. Selecciona tu dominio
3. Habilita **AutoSSL** o **Let's Encrypt**
4. Espera 5-10 minutos para la activación

---

## ⏰ Configurar Cron Jobs

Los servicios Node.js pueden caerse sin supervisión. Configura cron jobs:

### En cPanel/Plesk:

1. Ve a **Cron Jobs**
2. Añade las siguientes tareas:

```bash
# Reiniciar servicios cada 6 horas (prevención)
0 */6 * * * ~/truk/restart-services.sh >> ~/truk/logs/cron.log 2>&1

# Backup diario a las 3 AM
0 3 * * * ~/truk/backup.sh >> ~/truk/logs/backup.log 2>&1

# Limpiar logs antiguos semanalmente
0 2 * * 0 find ~/truk/logs -name "*.log" -mtime +30 -delete
```

### Mediante Terminal:

```bash
crontab -e

# Añadir:
0 */6 * * * ~/truk/restart-services.sh >> ~/truk/logs/cron.log 2>&1
0 3 * * * ~/truk/backup.sh >> ~/truk/logs/backup.log 2>&1
0 2 * * 0 find ~/truk/logs -name "*.log" -mtime +30 -delete
```

---

## 🗄️ Configuración de Base de Datos

### Obtener Credenciales de PostgreSQL

#### En cPanel:
1. Ve a **PostgreSQL Databases**
2. Crea una base de datos nueva
3. Crea un usuario y asigna permisos
4. Anota las credenciales

#### En Plesk:
1. Ve a **Databases** → **Add Database**
2. Selecciona PostgreSQL
3. Configura usuario y contraseña
4. Anota el hostname y puerto

### Construir DATABASE_URL

```bash
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[base_de_datos]

# Ejemplo:
postgresql://truk_user:mi_contraseña@localhost:5432/truk_db
```

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# Backend
tail -f ~/truk/logs/backend.log

# Frontend
tail -f ~/truk/logs/frontend.log

# Ambos
tail -f ~/truk/logs/*.log
```

### Ver Procesos

```bash
ps aux | grep node
```

### Ver Uso de Recursos

```bash
# Memoria
free -h

# Disco
df -h

# CPU
top
```

---

## 🔄 Actualización

### Actualización Manual

```bash
cd ~/truk

# Detener servicios
./stop-services.sh

# Crear backup
./backup.sh

# Actualizar código
cd app
git pull origin main

# Instalar dependencias
pnpm install

# Ejecutar migraciones
cd packages/backend
pnpm prisma migrate deploy

# Compilar
cd ~/truk/app
pnpm --filter @truk/backend build
pnpm --filter @truk/web build

# Reiniciar servicios
cd ~/truk
./start-backend.sh
./start-frontend.sh
```

---

## 🔍 Resolución de Problemas

### Servicios No Inician

```bash
# Ver logs detallados
tail -50 ~/truk/logs/backend.log
tail -50 ~/truk/logs/frontend.log

# Verificar puertos
netstat -tulpn | grep -E ':(3000|4000)'

# Matar procesos colgados
pkill -f "node.*backend"
pkill -f "node.*frontend"

# Reiniciar
~/truk/restart-services.sh
```

### Error de Base de Datos

```bash
# Verificar conexión
psql "$DATABASE_URL" -c "SELECT 1"

# Ver migraciones
cd ~/truk/app/packages/backend
pnpm prisma migrate status
```

### Sin Espacio en Disco

```bash
# Ver uso
du -sh ~/truk/*

# Limpiar node_modules
cd ~/truk/app
rm -rf node_modules
pnpm install

# Limpiar backups antiguos
cd ~/truk/backups
ls -lt
rm -f backup_old_*.tar.gz

# Limpiar logs
find ~/truk/logs -name "*.log" -mtime +7 -delete
```

### Puerto Ya en Uso

```bash
# Encontrar proceso
lsof -i :4000
lsof -i :3000

# Matar proceso
kill -9 [PID]

# O usar el script
~/truk/stop-services.sh
```

---

## 🚫 Limitaciones de Shared Hosting

### Lo que NO funciona:

❌ **Systemd services** - Usa scripts de inicio incluidos
❌ **Redis** (usualmente) - La app funcionará sin Redis (sin cache)
❌ **WebSockets** (algunos hosting) - Funcionalidad en tiempo real limitada
❌ **Nginx config** - Usa .htaccess proporcionado
❌ **Root access** - Todo se instala en tu home directory

### Soluciones Alternativas:

- **Redis**: Usar Redis Cloud (gratis hasta 30MB)
- **WebSockets**: Usar Pusher o Ably
- **Supervisor**: Usar PM2 o scripts + cron
- **Email**: Usar servicio externo (SendGrid, Mailgun)

---

## 🌐 Configuración Avanzada

### Usar PM2 (Process Manager)

Si tu hosting lo permite:

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
cd ~/truk/app/packages/backend
pm2 start dist/main.js --name truk-backend

cd ../web
pm2 start "pnpm start" --name truk-frontend

# Guardar configuración
pm2 save

# Auto-inicio (si está disponible)
pm2 startup
```

### Usar Variables de Entorno Globales

```bash
# En ~/.bashrc o ~/.bash_profile
export DATABASE_URL="postgresql://..."
export JWT_SECRET="..."
export SESSION_SECRET="..."

# Recargar
source ~/.bashrc
```

---

## 📞 Soporte y Ayuda

### Recursos:

- **Documentación completa**: `~/truk/app/deployment/README.md`
- **GitHub Issues**: https://github.com/JosuIru/comunidad-viva/issues
- **Panel de tu hosting**: Consulta su documentación sobre Node.js

### Contactar Soporte del Hosting:

Si tienes problemas, pregunta a tu proveedor:
1. ¿Soportan aplicaciones Node.js?
2. ¿Cómo configurar proxy para aplicaciones Node.js?
3. ¿Cómo mantener procesos corriendo persistentemente?
4. ¿Tienen Redis disponible?

---

## ✅ Checklist Post-Instalación

- [ ] Servicios backend y frontend iniciados
- [ ] Dominios configurados en el panel
- [ ] SSL activado
- [ ] Cron jobs configurados
- [ ] Backup automático funcionando
- [ ] Base de datos accesible
- [ ] Logs monitoreados
- [ ] Variables de entorno configuradas
- [ ] Frontend accesible desde navegador
- [ ] API respondiendo correctamente

---

## 🎉 Conclusión

Con estos pasos, TRUK debería estar funcionando en tu servidor compartido. Recuerda:

- ✅ Monitorear logs regularmente
- ✅ Configurar backups automáticos
- ✅ Verificar que los cron jobs funcionen
- ✅ Actualizar regularmente

**¡Buena suerte con tu instalación!** 🚀

---

**Versión**: 1.0.0
**Última actualización**: Noviembre 2025
