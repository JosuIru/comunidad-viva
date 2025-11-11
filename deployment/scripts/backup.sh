#!/bin/bash

################################################################################
# TRUK - Script de Backup
# Versión: 1.0.0
# Descripción: Sistema de backup automático con compresión y rotación
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
INSTALL_DIR="${INSTALL_DIR:-/opt/truk}"
APP_USER="${APP_USER:-truk}"
BACKUP_DIR="${BACKUP_DIR:-$INSTALL_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
BACKUP_TYPE="${BACKUP_TYPE:-full}"  # full, database, files

# Funciones
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    local missing_deps=()

    command -v pg_dump &> /dev/null || missing_deps+=("postgresql-client")
    command -v tar &> /dev/null || missing_deps+=("tar")
    command -v gzip &> /dev/null || missing_deps+=("gzip")

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Dependencias faltantes: ${missing_deps[*]}"
        exit 1
    fi
}

create_backup_directory() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="backup_${BACKUP_TYPE}_${TIMESTAMP}"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    mkdir -p "$BACKUP_PATH"
    log_info "Creando backup en: $BACKUP_PATH"
}

backup_database() {
    log_info "Respaldando base de datos..."

    if [[ ! -f "$INSTALL_DIR/.db_credentials" ]]; then
        log_error "No se encuentran las credenciales de la base de datos"
        return 1
    fi

    source "$INSTALL_DIR/.db_credentials"

    # Backup completo de la base de datos
    sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_PATH/database.sql.gz"

    # Backup de esquema solamente
    sudo -u postgres pg_dump --schema-only "$DB_NAME" | gzip > "$BACKUP_PATH/schema.sql.gz"

    # Información de la base de datos
    sudo -u postgres psql -d "$DB_NAME" -c "\dt+" > "$BACKUP_PATH/database_info.txt"

    log_success "Base de datos respaldada"
}

backup_code() {
    log_info "Respaldando código fuente..."

    if [[ ! -d "$INSTALL_DIR/app" ]]; then
        log_warning "No se encuentra el directorio de la aplicación"
        return 0
    fi

    cd "$INSTALL_DIR"
    tar -czf "$BACKUP_PATH/code.tar.gz" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='.git' \
        app

    # Guardar información de git
    cd "$INSTALL_DIR/app"
    git log -1 --pretty=format:"Commit: %H%nAuthor: %an%nDate: %ad%nMessage: %s%n" > "$BACKUP_PATH/git_info.txt"
    git diff > "$BACKUP_PATH/git_diff.txt" 2>/dev/null || true

    log_success "Código respaldado"
}

backup_uploads() {
    log_info "Respaldando archivos subidos..."

    local uploads_dirs=(
        "$INSTALL_DIR/app/packages/backend/uploads"
        "$INSTALL_DIR/app/packages/web/public/uploads"
        "$INSTALL_DIR/uploads"
    )

    local found=false
    for dir in "${uploads_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            tar -czf "$BACKUP_PATH/uploads_$(basename $(dirname $dir)).tar.gz" "$dir"
            found=true
        fi
    done

    if $found; then
        log_success "Archivos respaldados"
    else
        log_warning "No se encontraron directorios de archivos subidos"
    fi
}

backup_configuration() {
    log_info "Respaldando configuración..."

    local config_dir="$BACKUP_PATH/config"
    mkdir -p "$config_dir"

    # Variables de entorno
    [[ -f "$INSTALL_DIR/app/packages/backend/.env" ]] && \
        cp "$INSTALL_DIR/app/packages/backend/.env" "$config_dir/backend.env"

    [[ -f "$INSTALL_DIR/app/packages/web/.env.production" ]] && \
        cp "$INSTALL_DIR/app/packages/web/.env.production" "$config_dir/web.env"

    # Credenciales
    [[ -f "$INSTALL_DIR/.db_credentials" ]] && \
        cp "$INSTALL_DIR/.db_credentials" "$config_dir/db_credentials"

    # Configuraciones de nginx
    if [[ -f "/etc/nginx/sites-available/truk-backend" ]]; then
        cp /etc/nginx/sites-available/truk-backend "$config_dir/nginx-backend.conf"
        cp /etc/nginx/sites-available/truk-frontend "$config_dir/nginx-frontend.conf"
    fi

    # Servicios systemd
    if [[ -f "/etc/systemd/system/truk-backend.service" ]]; then
        cp /etc/systemd/system/truk-backend.service "$config_dir/"
        cp /etc/systemd/system/truk-frontend.service "$config_dir/"
    fi

    log_success "Configuración respaldada"
}

create_backup_info() {
    log_info "Creando información del backup..."

    cat > "$BACKUP_PATH/backup_info.txt" <<EOF
════════════════════════════════════════════════════════════
INFORMACIÓN DEL BACKUP
════════════════════════════════════════════════════════════

Fecha de creación: $(date)
Tipo de backup: $BACKUP_TYPE
Hostname: $(hostname)
Usuario: $(whoami)

SISTEMA:
--------
OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)
Kernel: $(uname -r)
Uptime: $(uptime -p)

APLICACIÓN:
-----------
Versión: $(cd "$INSTALL_DIR/app" && git describe --tags --always 2>/dev/null || echo "N/A")
Branch: $(cd "$INSTALL_DIR/app" && git branch --show-current 2>/dev/null || echo "N/A")

BASE DE DATOS:
--------------
Nombre: $DB_NAME
Tamaño: $(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null || echo "N/A")

SERVICIOS:
----------
Backend: $(systemctl is-active truk-backend 2>/dev/null || echo "N/A")
Frontend: $(systemctl is-active truk-frontend 2>/dev/null || echo "N/A")
PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo "N/A")
Redis: $(systemctl is-active redis 2>/dev/null || echo "N/A")
Nginx: $(systemctl is-active nginx 2>/dev/null || echo "N/A")

CONTENIDO DEL BACKUP:
---------------------
$(ls -lh "$BACKUP_PATH")

════════════════════════════════════════════════════════════
EOF

    log_success "Información del backup creada"
}

calculate_backup_size() {
    local size=$(du -sh "$BACKUP_PATH" | cut -f1)
    log_info "Tamaño del backup: $size"
}

compress_backup() {
    log_info "Comprimiendo backup completo..."

    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"

    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

    log_success "Backup comprimido"
    calculate_backup_size
}

cleanup_old_backups() {
    log_info "Limpiando backups antiguos (mayores a $RETENTION_DAYS días)..."

    find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

    local remaining=$(find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f | wc -l)
    log_success "Backups antiguos eliminados. Backups restantes: $remaining"
}

list_backups() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "BACKUPS DISPONIBLES"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A $BACKUP_DIR)" ]]; then
        echo "No hay backups disponibles"
        return
    fi

    cd "$BACKUP_DIR"
    for backup in backup_*.tar.gz; do
        if [[ -f "$backup" ]]; then
            size=$(du -h "$backup" | cut -f1)
            date=$(stat -c %y "$backup" | cut -d'.' -f1)
            echo "📦 $backup"
            echo "   Tamaño: $size"
            echo "   Fecha: $date"
            echo ""
        fi
    done

    echo "═══════════════════════════════════════════════════════════"
}

restore_backup() {
    local backup_file="$1"

    if [[ -z "$backup_file" ]]; then
        log_error "Debe especificar el archivo de backup a restaurar"
        list_backups
        exit 1
    fi

    if [[ ! -f "$BACKUP_DIR/$backup_file" ]]; then
        log_error "Backup no encontrado: $backup_file"
        exit 1
    fi

    log_warning "═══════════════════════════════════════════════════════════"
    log_warning "ADVERTENCIA: Esta operación sobrescribirá los datos actuales"
    log_warning "═══════════════════════════════════════════════════════════"
    echo ""
    read -p "¿Está seguro de continuar? Escriba 'SI' para confirmar: " -r
    if [[ $REPLY != "SI" ]]; then
        log_info "Restauración cancelada"
        exit 0
    fi

    log_info "Restaurando desde: $backup_file"

    # Crear backup de seguridad antes de restaurar
    log_info "Creando backup de seguridad antes de restaurar..."
    BACKUP_TYPE="pre-restore"
    main

    # Descomprimir backup
    RESTORE_DIR="/tmp/truk_restore_$$"
    mkdir -p "$RESTORE_DIR"
    tar -xzf "$BACKUP_DIR/$backup_file" -C "$RESTORE_DIR"

    BACKUP_NAME=$(basename "$backup_file" .tar.gz)
    RESTORE_PATH="$RESTORE_DIR/$BACKUP_NAME"

    # Detener servicios
    log_info "Deteniendo servicios..."
    systemctl stop truk-frontend truk-backend

    # Restaurar base de datos
    if [[ -f "$RESTORE_PATH/database.sql.gz" ]]; then
        log_info "Restaurando base de datos..."
        source "$INSTALL_DIR/.db_credentials"
        gunzip < "$RESTORE_PATH/database.sql.gz" | sudo -u postgres psql "$DB_NAME"
    fi

    # Restaurar código
    if [[ -f "$RESTORE_PATH/code.tar.gz" ]]; then
        log_info "Restaurando código..."
        rm -rf "$INSTALL_DIR/app"
        tar -xzf "$RESTORE_PATH/code.tar.gz" -C "$INSTALL_DIR"
        chown -R "$APP_USER:$APP_USER" "$INSTALL_DIR/app"
    fi

    # Restaurar configuración
    if [[ -d "$RESTORE_PATH/config" ]]; then
        log_info "Restaurando configuración..."
        [[ -f "$RESTORE_PATH/config/backend.env" ]] && \
            cp "$RESTORE_PATH/config/backend.env" "$INSTALL_DIR/app/packages/backend/.env"
        [[ -f "$RESTORE_PATH/config/web.env" ]] && \
            cp "$RESTORE_PATH/config/web.env" "$INSTALL_DIR/app/packages/web/.env.production"
    fi

    # Iniciar servicios
    log_info "Iniciando servicios..."
    systemctl start truk-backend truk-frontend

    # Limpiar
    rm -rf "$RESTORE_DIR"

    log_success "Restauración completada"
}

verify_backup() {
    log_info "Verificando integridad del backup..."

    if [[ ! -f "$BACKUP_PATH" ]]; then
        log_error "Backup no encontrado: $BACKUP_PATH"
        return 1
    fi

    # Verificar que el archivo tar.gz es válido
    if tar -tzf "$BACKUP_PATH" > /dev/null 2>&1; then
        log_success "Backup verificado correctamente"
        return 0
    else
        log_error "El backup está corrupto"
        return 1
    fi
}

send_notification() {
    # Aquí puedes agregar notificaciones por email, Slack, etc.
    log_info "Backup completado: $BACKUP_PATH"
}

main() {
    case "${1:-backup}" in
        backup)
            check_dependencies
            create_backup_directory

            case "$BACKUP_TYPE" in
                full)
                    backup_database
                    backup_code
                    backup_uploads
                    backup_configuration
                    ;;
                database)
                    backup_database
                    ;;
                files)
                    backup_code
                    backup_uploads
                    ;;
                *)
                    log_error "Tipo de backup no válido: $BACKUP_TYPE"
                    exit 1
                    ;;
            esac

            create_backup_info
            compress_backup
            verify_backup
            cleanup_old_backups
            send_notification

            log_success "Backup completado exitosamente"
            log_info "Ubicación: $BACKUP_PATH"
            ;;

        list)
            list_backups
            ;;

        restore)
            if [[ $EUID -ne 0 ]]; then
                log_error "La restauración debe ejecutarse como root"
                exit 1
            fi
            restore_backup "$2"
            ;;

        *)
            echo "Uso: $0 {backup|list|restore <archivo>}"
            echo ""
            echo "Opciones:"
            echo "  backup              Crear un nuevo backup"
            echo "  list                Listar backups disponibles"
            echo "  restore <archivo>   Restaurar desde un backup"
            echo ""
            echo "Variables de entorno:"
            echo "  BACKUP_TYPE         Tipo de backup: full, database, files (default: full)"
            echo "  RETENTION_DAYS      Días de retención (default: 30)"
            echo "  BACKUP_DIR          Directorio de backups (default: /opt/truk/backups)"
            exit 1
            ;;
    esac
}

main "$@"
