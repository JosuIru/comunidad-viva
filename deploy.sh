#!/bin/bash

# Script de deployment para Comunidad Viva
# Uso: ./deploy.sh [production|staging|local]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-production}
COMPOSE_FILES="-f docker-compose.yml"

if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
fi

echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment de Comunidad Viva           ║${NC}"
echo -e "${GREEN}║   Entorno: $ENVIRONMENT                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Función para mostrar mensajes
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

log_info "✓ Docker y Docker Compose están instalados"

# Verificar archivos .env
check_env_files() {
    log_info "Verificando archivos de configuración..."

    if [ ! -f "packages/backend/.env" ]; then
        log_warn "No existe packages/backend/.env"
        if [ -f "packages/backend/.env.example" ]; then
            log_info "Copiando .env.example..."
            cp packages/backend/.env.example packages/backend/.env
            log_warn "⚠️  Edita packages/backend/.env con tus valores de producción"
            read -p "¿Continuar? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi

    if [ ! -f "packages/web/.env.production" ] && [ "$ENVIRONMENT" = "production" ]; then
        log_warn "No existe packages/web/.env.production"
        if [ -f "packages/web/.env.production.example" ]; then
            log_info "Copiando .env.production.example..."
            cp packages/web/.env.production.example packages/web/.env.production
            log_warn "⚠️  Edita packages/web/.env.production con tus valores"
            read -p "¿Continuar? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi

    log_info "✓ Archivos de configuración OK"
}

# Hacer backup de la base de datos
backup_database() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creando backup de la base de datos..."
        mkdir -p backups
        docker compose exec -T postgres pg_dump -U comunidad comunidad_viva > backups/backup_$(date +%Y%m%d_%H%M%S).sql || log_warn "No se pudo crear backup (¿primera vez?)"
        log_info "✓ Backup creado"
    fi
}

# Detener servicios
stop_services() {
    log_info "Deteniendo servicios actuales..."
    docker compose $COMPOSE_FILES down || true
    log_info "✓ Servicios detenidos"
}

# Construir imágenes
build_images() {
    log_info "Construyendo imágenes Docker..."
    docker compose $COMPOSE_FILES build --no-cache
    log_info "✓ Imágenes construidas"
}

# Iniciar servicios
start_services() {
    log_info "Iniciando servicios..."
    docker compose $COMPOSE_FILES up -d
    log_info "✓ Servicios iniciados"
}

# Esperar a que los servicios estén listos
wait_for_services() {
    log_info "Esperando a que los servicios estén listos..."
    sleep 5

    # Verificar PostgreSQL
    log_info "Verificando PostgreSQL..."
    until docker compose exec -T postgres pg_isready -U comunidad &> /dev/null; do
        echo -n "."
        sleep 1
    done
    echo ""
    log_info "✓ PostgreSQL está listo"

    # Verificar backend
    log_info "Verificando backend..."
    for i in {1..30}; do
        if curl -s http://localhost:4000/health &> /dev/null; then
            log_info "✓ Backend está listo"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

# Ejecutar migraciones
run_migrations() {
    log_info "Ejecutando migraciones de base de datos..."
    docker compose exec -T backend npx prisma migrate deploy
    log_info "✓ Migraciones aplicadas"
}

# Verificar salud de los servicios
health_check() {
    log_info "Verificando salud de los servicios..."

    # Backend
    if curl -s http://localhost:4000/health | grep -q "ok"; then
        log_info "✓ Backend: OK"
    else
        log_error "✗ Backend: FAIL"
        exit 1
    fi

    # Frontend
    if curl -s http://localhost:3000 &> /dev/null; then
        log_info "✓ Frontend: OK"
    else
        log_warn "⚠️  Frontend: No responde (puede tomar unos segundos más)"
    fi

    # PostgreSQL
    if docker compose exec -T postgres pg_isready -U comunidad &> /dev/null; then
        log_info "✓ PostgreSQL: OK"
    else
        log_error "✗ PostgreSQL: FAIL"
        exit 1
    fi
}

# Ver logs
show_logs() {
    log_info "Mostrando logs (Ctrl+C para salir)..."
    docker compose $COMPOSE_FILES logs -f
}

# Limpiar recursos no utilizados
cleanup() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Limpiando recursos no utilizados..."
        docker system prune -f
        log_info "✓ Limpieza completada"
    fi
}

# Main deployment flow
main() {
    check_env_files
    backup_database
    stop_services
    build_images
    start_services
    wait_for_services
    run_migrations
    health_check
    cleanup

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     ✅ DEPLOYMENT COMPLETADO              ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
    echo ""
    log_info "Frontend: http://localhost:3000"
    log_info "Backend:  http://localhost:4000"
    log_info "API Docs: http://localhost:4000/api"
    echo ""
    log_info "Ver logs: docker compose logs -f"
    log_info "Estado:   docker compose ps"
    echo ""

    read -p "¿Ver logs ahora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Manejo de errores
trap 'log_error "Deployment falló en la línea $LINENO"' ERR

# Ejecutar
main
