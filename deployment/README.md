# 🚀 TRUK - Guía de Deployment y Administración

Sistema completo de instalación, actualización, backup y monitoreo para la plataforma TRUK (Comunidad Viva).

> **¿Servidor Compartido?** Si no tienes acceso root, revisa la [Guía para Shared Hosting](README-SHARED.md)

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación](#instalación)
  - [Servidor Dedicado/VPS](#instalación-automática-recomendado)
  - [Servidor Compartido](#servidor-compartido-shared-hosting)
- [Actualización](#actualización)
- [Backup y Restauración](#backup-y-restauración)
- [Monitoreo](#monitoreo)
- [Mantenimiento](#mantenimiento)
- [Resolución de Problemas](#resolución-de-problemas)
- [Seguridad](#seguridad)

---

## 🔧 Requisitos del Sistema

### Hardware Mínimo

- **CPU**: 2 cores
- **RAM**: 4 GB
- **Disco**: 20 GB SSD
- **Red**: Conexión estable a Internet

### Hardware Recomendado (Producción)

- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Disco**: 50+ GB SSD
- **Red**: 100 Mbps

### Software

- **OS**: Ubuntu 20.04+ / Debian 11+ (recomendado)
- **Node.js**: 20.x
- **PostgreSQL**: 15+
- **Redis**: 6+
- **Nginx**: 1.18+

---

## 📦 Instalación

### Instalación Automática (Recomendado)

**Para Servidor Dedicado/VPS con acceso root:**

```bash
# Descargar el script de instalación
curl -o install.sh https://raw.githubusercontent.com/JosuIru/comunidad-viva/main/deployment/scripts/install.sh

# Dar permisos de ejecución
chmod +x install.sh

# Ejecutar instalación (como root)
sudo ./install.sh
```

### Variables de Entorno Opcionales

```bash
# Personalizar instalación
export INSTALL_DIR=/opt/truk
export APP_USER=truk
export NODE_VERSION=20
export POSTGRES_VERSION=15
export DOMAIN=tu-dominio.com
export API_DOMAIN=api.tu-dominio.com
export EMAIL=admin@tu-dominio.com

# Ejecutar instalación
sudo -E ./install.sh
```

### Lo que Instala

1. ✅ Dependencias del sistema (nginx, postgresql, redis, etc.)
2. ✅ Node.js y pnpm
3. ✅ PostgreSQL y Redis
4. ✅ Usuario de aplicación
5. ✅ Base de datos configurada
6. ✅ Código de la aplicación
7. ✅ Servicios systemd
8. ✅ Nginx configurado
9. ✅ Firewall (UFW)
10. ✅ Logrotate

### Servidor Compartido (Shared Hosting)

**Para hosting compartido SIN acceso root:**

```bash
# Descargar el script
curl -o install-shared.sh https://raw.githubusercontent.com/JosuIru/comunidad-viva/main/deployment/scripts/install-shared.sh

# Dar permisos
chmod +x install-shared.sh

# Ejecutar (te pedirá configuración interactivamente)
./install-shared.sh
```

📖 **Documentación completa**: [README-SHARED.md](README-SHARED.md)

### Post-Instalación

Después de la instalación:

**Servidor Dedicado/VPS:**
```bash
# Verificar servicios
systemctl status truk-backend
systemctl status truk-frontend

# Configurar SSL con Let's Encrypt
certbot --nginx -d tu-dominio.com -d api.tu-dominio.com

# Ver logs
journalctl -u truk-backend -f
journalctl -u truk-frontend -f
```

**Shared Hosting:**
```bash
# Ver estado
~/truk/status.sh

# Ver logs
tail -f ~/truk/logs/backend.log
tail -f ~/truk/logs/frontend.log

# Configurar SSL desde tu panel de control (cPanel/Plesk)
```

---

## 🔄 Actualización

### Actualización a Última Versión

```bash
# Ejecutar script de actualización
cd /opt/truk
sudo ./deployment/scripts/update.sh
```

El script automáticamente:
1. ✅ Crea un backup completo
2. ✅ Detiene los servicios
3. ✅ Actualiza el código
4. ✅ Instala dependencias
5. ✅ Ejecuta migraciones
6. ✅ Compila la aplicación
7. ✅ Reinicia servicios
8. ✅ Verifica que todo funcione

### Actualización a Versión Específica

```bash
# Actualizar a una versión específica (tag)
sudo VERSION=v1.2.3 ./deployment/scripts/update.sh
```

### Rollback en Caso de Error

```bash
# Si algo sale mal, hacer rollback
sudo ./deployment/scripts/update.sh rollback
```

---

## 💾 Backup y Restauración

### Crear Backup Manual

```bash
# Backup completo (BD + código + archivos)
sudo ./deployment/scripts/backup.sh backup

# Solo base de datos
sudo BACKUP_TYPE=database ./deployment/scripts/backup.sh backup

# Solo archivos
sudo BACKUP_TYPE=files ./deployment/scripts/backup.sh backup
```

### Listar Backups Disponibles

```bash
./deployment/scripts/backup.sh list
```

### Restaurar desde Backup

```bash
# Listar backups
./deployment/scripts/backup.sh list

# Restaurar
sudo ./deployment/scripts/backup.sh restore backup_full_20240115_140530.tar.gz
```

### Backups Automáticos

Los backups se ejecutan automáticamente con cron:

```bash
# Instalar cron jobs
sudo cp deployment/config/cron-backup.conf /etc/cron.d/truk-backup

# Verificar cron jobs
sudo crontab -l
```

**Programación por defecto:**
- Backup completo: Diariamente a las 2:00 AM
- Backup de BD: Cada 6 horas
- Health check: Cada hora
- Limpieza de logs: Semanalmente (domingos 3:00 AM)

### Configuración de Retención

```bash
# Cambiar días de retención (default: 30)
export RETENTION_DAYS=60
sudo ./deployment/scripts/backup.sh backup
```

---

## 📊 Monitoreo

### Health Check Único

```bash
# Verificación completa del sistema
sudo ./deployment/scripts/monitor.sh check
```

Verifica:
- ✅ Estado de servicios (backend, frontend, PostgreSQL, Redis, Nginx)
- ✅ Conectividad de puertos
- ✅ Respuesta de endpoints HTTP
- ✅ Uso de recursos (CPU, memoria, disco)
- ✅ Conexión a base de datos
- ✅ Errores en logs
- ✅ Certificado SSL

### Monitoreo Continuo

```bash
# Monitoreo en tiempo real (actualiza cada 60s)
sudo ./deployment/scripts/monitor.sh monitor
```

### Ver Logs en Tiempo Real

```bash
# Todos los servicios
./deployment/scripts/monitor.sh logs

# Solo backend
./deployment/scripts/monitor.sh logs backend

# Solo frontend
./deployment/scripts/monitor.sh logs frontend

# Últimas 100 líneas
./deployment/scripts/monitor.sh logs backend 100
```

### Información del Sistema

```bash
# Ver información completa del sistema y aplicación
./deployment/scripts/monitor.sh info
```

### Alertas Automáticas

Configurar notificaciones por email o Slack:

```bash
# Email
export ALERT_EMAIL=admin@tu-dominio.com

# Slack Webhook
export SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Ejecutar health check
sudo -E ./deployment/scripts/monitor.sh check
```

---

## 🛠️ Mantenimiento

### Comandos Útiles de Systemd

```bash
# Ver estado de servicios
systemctl status truk-backend
systemctl status truk-frontend

# Reiniciar servicios
sudo systemctl restart truk-backend
sudo systemctl restart truk-frontend

# Detener servicios
sudo systemctl stop truk-backend
sudo systemctl stop truk-frontend

# Iniciar servicios
sudo systemctl start truk-backend
sudo systemctl start truk-frontend

# Recargar configuración
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable truk-backend
sudo systemctl enable truk-frontend
```

### Logs

```bash
# Ver logs en tiempo real
journalctl -u truk-backend -f
journalctl -u truk-frontend -f

# Ver últimas 100 líneas
journalctl -u truk-backend -n 100

# Ver logs de hoy
journalctl -u truk-backend --since today

# Ver logs entre fechas
journalctl -u truk-backend --since "2024-01-15" --until "2024-01-16"

# Buscar errores
journalctl -u truk-backend | grep -i error
```

### Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql -d comunidad_viva

# Ver tamaño de la base de datos
sudo -u postgres psql -d comunidad_viva -c "SELECT pg_size_pretty(pg_database_size('comunidad_viva'));"

# Ver tablas
sudo -u postgres psql -d comunidad_viva -c "\dt"

# Backup manual de BD
sudo -u postgres pg_dump comunidad_viva > backup.sql

# Restaurar BD
sudo -u postgres psql -d comunidad_viva < backup.sql
```

### Redis

```bash
# Conectar a Redis
redis-cli

# Ver información
redis-cli info

# Ver memoria usada
redis-cli info memory

# Ver número de keys
redis-cli dbsize

# Limpiar cache (¡CUIDADO!)
redis-cli flushall
```

### Nginx

```bash
# Verificar configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de error
sudo tail -f /var/log/nginx/error.log
```

### Actualizar Certificado SSL

```bash
# Renovar manualmente
sudo certbot renew

# Probar renovación
sudo certbot renew --dry-run

# Ver certificados instalados
sudo certbot certificates
```

---

## 🔍 Resolución de Problemas

### Backend No Inicia

```bash
# Ver logs detallados
journalctl -u truk-backend -n 100 --no-pager

# Verificar archivo .env
cat /opt/truk/app/packages/backend/.env

# Verificar conexión a BD
sudo -u postgres psql -d comunidad_viva -c "SELECT 1"

# Verificar puerto
netstat -tulpn | grep 4000

# Iniciar en modo debug
cd /opt/truk/app/packages/backend
sudo -u truk NODE_ENV=development npm run start:dev
```

### Frontend No Inicia

```bash
# Ver logs detallados
journalctl -u truk-frontend -n 100 --no-pager

# Verificar archivo .env
cat /opt/truk/app/packages/web/.env.production

# Verificar puerto
netstat -tulpn | grep 3000

# Reconstruir aplicación
cd /opt/truk/app/packages/web
sudo -u truk npm run build
```

### Error de Base de Datos

```bash
# Verificar si PostgreSQL está corriendo
systemctl status postgresql

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar conexiones activas
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### Error de Migraciones

```bash
# Ver estado de migraciones
cd /opt/truk/app/packages/backend
sudo -u truk npx prisma migrate status

# Resetear migraciones (¡CUIDADO! Borra datos)
sudo -u truk npx prisma migrate reset

# Aplicar migraciones pendientes
sudo -u truk npx prisma migrate deploy
```

### Sin Espacio en Disco

```bash
# Ver uso de disco
df -h

# Ver archivos grandes
sudo du -sh /opt/truk/* | sort -h

# Limpiar logs antiguos
sudo find /var/log -name "*.log" -mtime +30 -delete
sudo journalctl --vacuum-time=7d

# Limpiar backups antiguos
cd /opt/truk/backups
ls -lht
sudo rm -f backup_old_*.tar.gz
```

### Alto Uso de Memoria

```bash
# Ver procesos
top -o %MEM

# Ver memoria por servicio
systemctl status truk-backend
systemctl status truk-frontend

# Reiniciar servicios para liberar memoria
sudo systemctl restart truk-backend
sudo systemctl restart truk-frontend
```

---

## 🔒 Seguridad

### Checklist de Seguridad

- ✅ Firewall (UFW) configurado
- ✅ Fail2ban instalado
- ✅ SSL/TLS habilitado
- ✅ Contraseñas seguras
- ✅ Usuario no-root para la app
- ✅ Backups automáticos
- ✅ Logs monitoreados

### Configuración de Firewall

```bash
# Ver estado
sudo ufw status

# Permitir puertos adicionales
sudo ufw allow 8080/tcp

# Denegar puerto
sudo ufw deny 8080/tcp

# Ver reglas numeradas
sudo ufw status numbered

# Eliminar regla
sudo ufw delete 3
```

### Fail2ban

```bash
# Ver estado
sudo fail2ban-client status

# Ver bans de SSH
sudo fail2ban-client status sshd

# Desbanear IP
sudo fail2ban-client set sshd unbanip 1.2.3.4
```

### Cambiar Contraseñas

```bash
# Cambiar contraseña de BD
sudo -u postgres psql
ALTER USER truk_user WITH PASSWORD 'nueva_contraseña_segura';

# Actualizar .env
sudo nano /opt/truk/app/packages/backend/.env
# Cambiar DATABASE_URL

# Reiniciar servicios
sudo systemctl restart truk-backend
```

### Auditoría de Seguridad

```bash
# Ver intentos de login fallidos
sudo lastb

# Ver logins exitosos
sudo last

# Ver comandos sudo ejecutados
sudo cat /var/log/auth.log | grep sudo
```

---

## 📞 Soporte

- **Documentación**: [https://github.com/JosuIru/comunidad-viva](https://github.com/JosuIru/comunidad-viva)
- **Issues**: [https://github.com/JosuIru/comunidad-viva/issues](https://github.com/JosuIru/comunidad-viva/issues)
- **Email**: admin@truk.app

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

## 🙏 Agradecimientos

Gracias a la comunidad open source por hacer posible este proyecto.

---

**Versión**: 1.0.0
**Última actualización**: Noviembre 2025
