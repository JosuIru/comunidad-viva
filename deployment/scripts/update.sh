#!/bin/bash

################################################################################
# TRUK - Script de Actualización
# Versión: 1.0.0
# Descripción: Actualiza la plataforma de forma segura con backup automático
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
LOG_FILE="$INSTALL_DIR/logs/update_$(date +%Y%m%d_%H%M%S).log"

# Funciones
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root o con sudo"
        exit 1
    fi
}

check_services_running() {
    log_info "Verificando servicios..."

    if ! systemctl is-active --quiet truk-backend || ! systemctl is-active --quiet truk-frontend; then
        log_warning "Algunos servicios no están ejecutándose"
        read -p "¿Continuar de todas formas? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

create_backup() {
    log_info "Creando backup..."

    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

    mkdir -p "$BACKUP_PATH"

    # Backup de código
    log_info "Respaldando código..."
    tar -czf "$BACKUP_PATH/code.tar.gz" -C "$INSTALL_DIR" app

    # Backup de base de datos
    log_info "Respaldando base de datos..."
    source "$INSTALL_DIR/.db_credentials"
    sudo -u postgres pg_dump "$DB_NAME" | gzip > "$BACKUP_PATH/database.sql.gz"

    # Backup de archivos subidos
    if [[ -d "$INSTALL_DIR/app/uploads" ]]; then
        log_info "Respaldando archivos subidos..."
        tar -czf "$BACKUP_PATH/uploads.tar.gz" -C "$INSTALL_DIR/app" uploads
    fi

    # Guardar información del backup
    cat > "$BACKUP_PATH/info.txt" <<EOF
Backup creado: $(date)
Versión anterior: $(cd $INSTALL_DIR/app && git describe --tags --always)
DB: $DB_NAME
EOF

    log_success "Backup creado en: $BACKUP_PATH"
    echo "$BACKUP_PATH" > /tmp/truk_last_backup
}

stop_services() {
    log_info "Deteniendo servicios..."

    systemctl stop truk-frontend
    systemctl stop truk-backend

    log_success "Servicios detenidos"
}

update_code() {
    log_info "Actualizando código..."

    cd "$INSTALL_DIR/app"

    # Guardar cambios locales si existen
    sudo -u "$APP_USER" git stash

    # Obtener última versión
    sudo -u "$APP_USER" git fetch --all --tags

    if [[ -n "${VERSION:-}" ]]; then
        log_info "Cambiando a versión: $VERSION"
        sudo -u "$APP_USER" git checkout "$VERSION"
    else
        log_info "Actualizando a última versión de main"
        sudo -u "$APP_USER" git checkout main
        sudo -u "$APP_USER" git pull origin main
    fi

    log_success "Código actualizado"
}

update_dependencies() {
    log_info "Actualizando dependencias..."

    cd "$INSTALL_DIR/app"
    sudo -u "$APP_USER" pnpm install

    log_success "Dependencias actualizadas"
}

run_migrations() {
    log_info "Ejecutando migraciones..."

    cd "$INSTALL_DIR/app/packages/backend"
    source "$INSTALL_DIR/.db_credentials"

    sudo -u "$APP_USER" bash -c "DATABASE_URL=$DATABASE_URL pnpm prisma migrate deploy"
    sudo -u "$APP_USER" bash -c "DATABASE_URL=$DATABASE_URL pnpm prisma generate"

    log_success "Migraciones completadas"
}

build_application() {
    log_info "Compilando aplicación..."

    cd "$INSTALL_DIR/app"

    # Build backend
    sudo -u "$APP_USER" bash -c "cd packages/backend && pnpm build"

    # Build frontend
    sudo -u "$APP_USER" bash -c "cd packages/web && pnpm build"

    log_success "Aplicación compilada"
}

start_services() {
    log_info "Iniciando servicios..."

    systemctl start truk-backend
    sleep 5
    systemctl start truk-frontend
    sleep 5

    log_success "Servicios iniciados"
}

verify_services() {
    log_info "Verificando servicios..."

    sleep 10

    if systemctl is-active --quiet truk-backend && systemctl is-active --quiet truk-frontend; then
        log_success "Todos los servicios están ejecutándose correctamente"
        return 0
    else
        log_error "Algunos servicios no están ejecutándose"
        log_error "Backend: $(systemctl is-active truk-backend)"
        log_error "Frontend: $(systemctl is-active truk-frontend)"
        return 1
    fi
}

health_check() {
    log_info "Realizando health check..."

    # Check backend
    if curl -f http://localhost:4000/health > /dev/null 2>&1; then
        log_success "Backend responde correctamente"
    else
        log_warning "Backend no responde en /health"
    fi

    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend responde correctamente"
    else
        log_warning "Frontend no responde"
    fi
}

rollback() {
    log_error "Iniciando rollback..."

    if [[ ! -f /tmp/truk_last_backup ]]; then
        log_error "No se encuentra información del último backup"
        exit 1
    fi

    BACKUP_PATH=$(cat /tmp/truk_last_backup)

    if [[ ! -d "$BACKUP_PATH" ]]; then
        log_error "No se encuentra el backup en: $BACKUP_PATH"
        exit 1
    fi

    log_info "Restaurando desde: $BACKUP_PATH"

    stop_services

    # Restaurar código
    log_info "Restaurando código..."
    rm -rf "$INSTALL_DIR/app"
    tar -xzf "$BACKUP_PATH/code.tar.gz" -C "$INSTALL_DIR"

    # Restaurar base de datos
    log_info "Restaurando base de datos..."
    source "$INSTALL_DIR/.db_credentials"
    gunzip < "$BACKUP_PATH/database.sql.gz" | sudo -u postgres psql "$DB_NAME"

    # Restaurar uploads
    if [[ -f "$BACKUP_PATH/uploads.tar.gz" ]]; then
        log_info "Restaurando archivos..."
        tar -xzf "$BACKUP_PATH/uploads.tar.gz" -C "$INSTALL_DIR/app"
    fi

    start_services

    log_success "Rollback completado"
}

cleanup_old_backups() {
    log_info "Limpiando backups antiguos..."

    # Mantener solo los últimos 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf

    log_success "Backups antiguos eliminados"
}

display_summary() {
    NEW_VERSION=$(cd "$INSTALL_DIR/app" && git describe --tags --always)

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_success "Actualización completada exitosamente!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📦 Nueva versión: $NEW_VERSION"
    echo "💾 Backup guardado en: $(cat /tmp/truk_last_backup)"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   systemctl status truk-backend"
    echo "   systemctl status truk-frontend"
    echo "   journalctl -u truk-backend -f"
    echo "   journalctl -u truk-frontend -f"
    echo ""
    echo "📝 Log de actualización: $LOG_FILE"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              TRUK - Actualización de Sistema              ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    check_root
    check_services_running

    # Mostrar versión actual
    CURRENT_VERSION=$(cd "$INSTALL_DIR/app" && git describe --tags --always)
    log_info "Versión actual: $CURRENT_VERSION"

    # Confirmar actualización
    echo ""
    read -p "¿Desea continuar con la actualización? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Actualización cancelada"
        exit 0
    fi

    # Crear directorio de logs si no existe
    mkdir -p "$INSTALL_DIR/logs"

    # Proceso de actualización
    create_backup
    stop_services

    if update_code && update_dependencies && run_migrations && build_application; then
        start_services

        if verify_services; then
            health_check
            cleanup_old_backups
            display_summary
        else
            log_error "Los servicios no están funcionando correctamente"
            read -p "¿Desea hacer rollback? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rollback
            fi
            exit 1
        fi
    else
        log_error "Error durante la actualización"
        read -p "¿Desea hacer rollback? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback
        fi
        exit 1
    fi
}

# Si se pasa el argumento "rollback", ejecutar rollback directamente
if [[ "${1:-}" == "rollback" ]]; then
    check_root
    rollback
    exit 0
fi

# Ejecutar actualización
main "$@"
