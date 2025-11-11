# Scripts de Mantenimiento

Scripts utilitarios para el mantenimiento y administración de Truk.

## Backup de Base de Datos

### `backup-db.sh`

Crea un backup comprimido de la base de datos PostgreSQL con timestamp.

**Uso:**
```bash
./scripts/backup-db.sh
```

**Características:**
- ✅ Backup timestamped automático
- ✅ Compresión con gzip
- ✅ Limpieza automática (retiene últimos 30 días)
- ✅ Lee configuración desde .env
- ✅ Incluye validación de herramientas requeridas
- ✅ Output colorizado y verboso

**Ubicación de backups:**
```
/comunidad-viva/backups/backup_YYYYMMDD_HHMMSS.sql.gz
```

**Requisitos:**
- `pg_dump` (PostgreSQL client tools)
- `gzip`
- Archivo `.env` configurado con `DATABASE_URL`

**Ejemplo de salida:**
```
================================
  Truk - DB Backup
================================

Database: comunidad_viva
Host: localhost:5432
Backup directory: /home/user/comunidad-viva/backups

Creating backup...
Compressing backup...
✓ Backup created successfully

File: /home/user/comunidad-viva/backups/backup_20251030_143022.sql.gz
Size: 2.3M

Cleaning up old backups (keeping last 30 days)...
✓ Cleanup complete. 5 backups retained.

Backup completed successfully!

To restore this backup, run:
  ./scripts/restore-db.sh backups/backup_20251030_143022.sql.gz
```

---

## Restore de Base de Datos

### `restore-db.sh`

Restaura la base de datos desde un backup comprimido.

**Uso:**
```bash
./scripts/restore-db.sh <path/to/backup.sql.gz>
```

**Características:**
- ✅ Confirmación requerida antes de restaurar
- ✅ Safety backup automático antes de restaurar
- ✅ Rollback automático si falla
- ✅ Drop/Create database automático
- ✅ Ejecuta migraciones después de restaurar
- ✅ Validación de archivo de backup

**Proceso de restauración:**

1. Crea safety backup de la DB actual
2. Solicita confirmación del usuario
3. Drop de la base de datos existente
4. Creación de nueva base de datos
5. Restauración del backup
6. Aplicación de migraciones pendientes
7. Verificación del resultado

**Ejemplo:**
```bash
./scripts/restore-db.sh backups/backup_20251030_143022.sql.gz
```

**Salida:**
```
================================
  Truk - DB Restore
================================

⚠️  WARNING: This will REPLACE all data in the database!

Database: comunidad_viva
Host: localhost:5432
Backup file: backups/backup_20251030_143022.sql.gz

Are you sure you want to continue? (type 'yes' to confirm): yes

Creating safety backup of current database...
✓ Safety backup created: backups/pre_restore_20251030_143530.sql.gz

Dropping existing database...
Creating new database...

Restoring backup...
✓ Backup restored successfully

Running migrations...
✓ Migrations applied

Database restored successfully!

Safety backup saved at: backups/pre_restore_20251030_143530.sql.gz

Database is ready to use!
```

---

## Programación de Backups Automáticos

### Con cron (Linux/macOS)

Editar crontab:
```bash
crontab -e
```

Añadir backup diario a las 2 AM:
```bash
0 2 * * * cd /path/to/comunidad-viva && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

Backup cada 6 horas:
```bash
0 */6 * * * cd /path/to/comunidad-viva && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

### Con systemd timer (Linux)

Crear `/etc/systemd/system/comunidad-backup.service`:
```ini
[Unit]
Description=Truk Database Backup
After=postgresql.service

[Service]
Type=oneshot
User=comunidad
WorkingDirectory=/opt/comunidad-viva
ExecStart=/opt/comunidad-viva/scripts/backup-db.sh
StandardOutput=append:/var/log/comunidad-backup.log
StandardError=append:/var/log/comunidad-backup.log
```

Crear `/etc/systemd/system/comunidad-backup.timer`:
```ini
[Unit]
Description=Truk Daily Backup Timer
Requires=comunidad-backup.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Habilitar:
```bash
sudo systemctl enable comunidad-backup.timer
sudo systemctl start comunidad-backup.timer
```

Verificar status:
```bash
sudo systemctl status comunidad-backup.timer
sudo systemctl list-timers | grep comunidad
```

---

## Mejores Prácticas

### Backup

1. **Frecuencia**: Mínimo 1 backup diario en producción
2. **Retención**: Los scripts mantienen 30 días automáticamente
3. **Almacenamiento**: Considera copiar backups a almacenamiento externo
4. **Monitoreo**: Configura alertas si los backups fallan
5. **Testing**: Testea la restauración periódicamente

### Restore

1. **Siempre** haz un safety backup antes de restaurar
2. **Verifica** que el backup es el correcto antes de confirmar
3. **Notifica** a los usuarios que el servicio estará down
4. **Testea** la aplicación después de restaurar
5. **Mantén** los safety backups por al menos 7 días

### Almacenamiento Externo

**Ejemplo: Sync a S3 (AWS)**
```bash
#!/bin/bash
# Añadir al final de backup-db.sh
aws s3 sync backups/ s3://your-bucket/comunidad-viva-backups/ \
  --exclude "*" \
  --include "backup_*.sql.gz"
```

**Ejemplo: Sync a rclone (cualquier cloud)**
```bash
#!/bin/bash
rclone sync backups/ remote:comunidad-viva-backups/ \
  --include "backup_*.sql.gz"
```

---

## Troubleshooting

### Error: "pg_dump not found"
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Verificar instalación
pg_dump --version
```

### Error: "Could not parse DATABASE_URL"
Verificar formato de `DATABASE_URL` en `.env`:
```
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Error: "Permission denied"
```bash
chmod +x scripts/backup-db.sh
chmod +x scripts/restore-db.sh
```

### Backup muy lento
Considera usar formato custom de pg_dump para backups más rápidos:
```bash
pg_dump --format=custom > backup.dump
pg_restore -d database backup.dump
```

---

## Seguridad

- ✅ Los backups están en `.gitignore` (no se suben a Git)
- ✅ Passwords no se muestran en output
- ✅ Usa `PGPASSWORD` environment variable
- ✅ Backups son comprimidos para reducir tamaño
- ⚠️ Asegura permisos correctos en directorio de backups: `chmod 700 backups/`
- ⚠️ Encripta backups si contienen datos sensibles

---

## Próximas Mejoras

- [ ] Encriptación de backups con GPG
- [ ] Upload automático a cloud storage
- [ ] Notificaciones por email en caso de error
- [ ] Health check de backups (verificar integridad)
- [ ] Backup incremental para reducir tamaño
- [ ] Dashboard web para gestión de backups
