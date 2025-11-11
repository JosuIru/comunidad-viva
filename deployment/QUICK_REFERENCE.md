# 📝 Guía Rápida de Referencia - TRUK

## 🚀 Comandos Más Usados

### Instalación y Actualización

```bash
# Instalación inicial
sudo ./deployment/scripts/install.sh

# Actualizar a última versión
sudo ./deployment/scripts/update.sh

# Actualizar a versión específica
sudo VERSION=v1.2.3 ./deployment/scripts/update.sh

# Rollback
sudo ./deployment/scripts/update.sh rollback
```

### Servicios

```bash
# Ver estado
systemctl status truk-backend
systemctl status truk-frontend

# Reiniciar
sudo systemctl restart truk-backend
sudo systemctl restart truk-frontend

# Reiniciar todo
sudo systemctl restart truk-backend truk-frontend nginx postgresql redis

# Ver logs en tiempo real
journalctl -u truk-backend -f
journalctl -u truk-frontend -f
```

### Backup y Restore

```bash
# Backup completo
sudo ./deployment/scripts/backup.sh backup

# Backup solo BD
sudo BACKUP_TYPE=database ./deployment/scripts/backup.sh backup

# Listar backups
./deployment/scripts/backup.sh list

# Restaurar
sudo ./deployment/scripts/backup.sh restore <archivo.tar.gz>
```

### Monitoreo

```bash
# Health check
sudo ./deployment/scripts/monitor.sh check

# Monitoreo continuo
sudo ./deployment/scripts/monitor.sh monitor

# Ver logs
./deployment/scripts/monitor.sh logs backend 100

# Info del sistema
./deployment/scripts/monitor.sh info
```

## 📍 Ubicaciones Importantes

```
/opt/truk/                           # Directorio principal
├── app/                             # Código de la aplicación
│   ├── packages/backend/            # Backend NestJS
│   │   ├── .env                     # Variables de entorno
│   │   └── dist/                    # Código compilado
│   └── packages/web/                # Frontend Next.js
│       ├── .env.production          # Variables de entorno
│       └── .next/                   # Build de producción
├── backups/                         # Backups automáticos
├── logs/                            # Logs de aplicación
├── deployment/                      # Scripts de deployment
│   ├── scripts/                     # Scripts de administración
│   │   ├── install.sh               # Instalación
│   │   ├── update.sh                # Actualización
│   │   ├── backup.sh                # Backup/restore
│   │   └── monitor.sh               # Monitoreo
│   └── config/                      # Configuraciones
└── .db_credentials                  # Credenciales de BD (600)

/etc/nginx/sites-available/          # Configuración Nginx
/etc/systemd/system/                 # Servicios systemd
/var/log/                            # Logs del sistema
```

## 🔑 Archivos de Configuración

### Backend (.env)
```bash
/opt/truk/app/packages/backend/.env
```

Variables importantes:
- `DATABASE_URL` - Conexión a PostgreSQL
- `JWT_SECRET` - Secret para tokens
- `REDIS_URL` - Conexión a Redis
- `FRONTEND_URL` - URL del frontend

### Frontend (.env.production)
```bash
/opt/truk/app/packages/web/.env.production
```

Variables importantes:
- `NEXT_PUBLIC_API_URL` - URL del backend
- `NEXT_PUBLIC_WS_URL` - URL de WebSocket

### Nginx
```bash
/etc/nginx/sites-available/truk-backend
/etc/nginx/sites-available/truk-frontend
```

### Servicios Systemd
```bash
/etc/systemd/system/truk-backend.service
/etc/systemd/system/truk-frontend.service
```

## 🔧 Troubleshooting Rápido

### Servicio no inicia

```bash
# Ver error detallado
journalctl -u truk-backend -n 50 --no-pager

# Verificar configuración
cat /opt/truk/app/packages/backend/.env

# Verificar puerto
netstat -tulpn | grep 4000
```

### Error de BD

```bash
# Verificar PostgreSQL
systemctl status postgresql

# Probar conexión
sudo -u postgres psql -d comunidad_viva -c "SELECT 1"

# Ver migraciones
cd /opt/truk/app/packages/backend
npx prisma migrate status
```

### Sin espacio en disco

```bash
# Ver uso
df -h

# Limpiar logs
sudo journalctl --vacuum-time=7d

# Limpiar backups antiguos
sudo ./deployment/scripts/backup.sh backup  # Limpia automáticamente
```

### Alto uso de recursos

```bash
# Ver procesos
top -o %MEM

# Reiniciar servicios
sudo systemctl restart truk-backend truk-frontend
```

## 🌐 URLs y Puertos

| Servicio     | Puerto | URL                       |
|--------------|--------|---------------------------|
| Frontend     | 3000   | http://localhost:3000     |
| Backend      | 4000   | http://localhost:4000     |
| PostgreSQL   | 5432   | localhost:5432            |
| Redis        | 6379   | localhost:6379            |
| Nginx (HTTP) | 80     | http://tu-dominio.com     |
| Nginx (HTTPS)| 443    | https://tu-dominio.com    |

## 📊 Logs Importantes

```bash
# Aplicación
journalctl -u truk-backend -f
journalctl -u truk-frontend -f

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log

# Sistema
tail -f /var/log/syslog

# Backups
tail -f /var/log/truk-backup.log

# Monitoreo
tail -f /var/log/truk-monitor.log
```

## 🔒 Seguridad Rápida

```bash
# Firewall
sudo ufw status                      # Ver estado
sudo ufw allow 8080/tcp              # Permitir puerto
sudo ufw delete 3                    # Eliminar regla

# Fail2ban
sudo fail2ban-client status          # Ver estado
sudo fail2ban-client status sshd     # Ver bans SSH

# SSL
sudo certbot renew                   # Renovar certificado
sudo certbot certificates            # Ver certificados
```

## 📞 Comandos de Emergencia

```bash
# Detener todo
sudo systemctl stop truk-backend truk-frontend

# Reiniciar todo
sudo systemctl restart truk-backend truk-frontend nginx postgresql redis

# Rollback de última actualización
sudo ./deployment/scripts/update.sh rollback

# Restaurar último backup
cd /opt/truk/backups
ls -lt | head -2
sudo ./deployment/scripts/backup.sh restore <último_backup>

# Ver últimos errores
journalctl -p err -n 50
```

## 💡 Tips Útiles

1. **Siempre hacer backup antes de actualizar**
   ```bash
   sudo ./deployment/scripts/backup.sh backup
   ```

2. **Ver estado de todos los servicios**
   ```bash
   systemctl status truk-* postgresql redis nginx
   ```

3. **Monitoreo en tiempo real en otra terminal**
   ```bash
   watch -n 5 './deployment/scripts/monitor.sh check'
   ```

4. **Buscar errores en logs**
   ```bash
   journalctl -u truk-backend --since "1 hour ago" | grep -i error
   ```

5. **Ver rendimiento de BD**
   ```bash
   sudo -u postgres psql -d comunidad_viva -c "
   SELECT schemaname, tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
   LIMIT 10;"
   ```

## 📋 Checklist Pre-Deployment

- [ ] Backup completo creado
- [ ] Variables de entorno configuradas
- [ ] Dominio DNS configurado
- [ ] Firewall configurado
- [ ] Certificado SSL instalado
- [ ] Health check pasado
- [ ] Cron jobs configurados
- [ ] Emails de alerta configurados

## 📋 Checklist Post-Deployment

- [ ] Servicios ejecutándose
- [ ] Frontend accesible
- [ ] Backend responde
- [ ] Base de datos funcional
- [ ] SSL válido
- [ ] Logs sin errores
- [ ] Backup automático funcionando
- [ ] Monitoreo activo

---

**Tip**: Guarda este archivo en tu servidor para referencia rápida:
```bash
less /opt/truk/deployment/QUICK_REFERENCE.md
```
