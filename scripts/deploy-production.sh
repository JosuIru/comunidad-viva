#!/bin/bash

###############################################################################
# Script de Despliegue en Producción - Truk
#
# Este script automatiza el proceso de despliegue de la aplicación Truk
# en un entorno de producción.
#
# Uso: ./scripts/deploy-production.sh [opciones]
#
# Opciones:
#   --skip-backup     Saltar el paso de backup
#   --no-build        No reconstruir imágenes Docker
#   --help            Mostrar esta ayuda
###############################################################################

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

log_error() {
    echo -e "${RED}✗ ${NC}$1"
}

# Variables
SKIP_BACKUP=false
NO_BUILD=false
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --help)
            grep "^#" "$0" | grep -v "#!/bin/bash" | sed 's/^# //'
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            echo "Usa --help para ver las opciones disponibles"
            exit 1
            ;;
    esac
done

# Banner
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Despliegue en Producción - Truk    ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 1. Verificar que estamos en el directorio correcto
log_info "Verificando directorio..."
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi
log_success "Directorio correcto"

# 2. Verificar que Docker está corriendo
log_info "Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    log_error "Docker no está corriendo. Por favor, inicia Docker primero."
    exit 1
fi
log_success "Docker está corriendo"

# 3. Verificar que existe .env
log_info "Verificando variables de entorno..."
if [ ! -f ".env" ]; then
    log_error "No se encontró archivo .env"
    log_info "Copia .env.example a .env y configúralo:"
    log_info "  cp .env.example .env"
    exit 1
fi
log_success "Archivo .env encontrado"

# 4. Verificar variables críticas
log_info "Verificando configuración..."
source .env
if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "REPLACE_WITH_SECURE_RANDOM_STRING" ]; then
    log_error "JWT_SECRET no está configurado en .env"
    log_info "Genera uno con: openssl rand -base64 64"
    exit 1
fi
log_success "Configuración válida"

# 5. Backup (si no se omite)
if [ "$SKIP_BACKUP" = false ]; then
    log_info "Creando backup de la base de datos..."
    mkdir -p "$BACKUP_DIR"

    if docker-compose ps postgres | grep -q "Up"; then
        docker-compose exec -T postgres pg_dump -U ${DB_USER:-truk_user} ${POSTGRES_DB:-truk_db} | gzip > "$BACKUP_DIR/db_backup_$DATE.sql.gz"
        log_success "Backup creado: $BACKUP_DIR/db_backup_$DATE.sql.gz"
    else
        log_warning "PostgreSQL no está corriendo, saltando backup"
    fi
else
    log_warning "Saltando backup (--skip-backup)"
fi

# 6. Pull latest changes
log_info "Actualizando código..."
if [ -d ".git" ]; then
    git pull origin main || log_warning "No se pudo hacer git pull (¿sin conexión?)"
    log_success "Código actualizado"
else
    log_warning "No es un repositorio git, saltando pull"
fi

# 7. Build (si no se omite)
if [ "$NO_BUILD" = false ]; then
    log_info "Construyendo imágenes Docker (esto puede tardar varios minutos)..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    log_success "Imágenes construidas"
else
    log_warning "Saltando build (--no-build)"
fi

# 8. Stop servicios actuales
log_info "Deteniendo servicios actuales..."
docker-compose down
log_success "Servicios detenidos"

# 9. Start servicios con nueva configuración
log_info "Iniciando servicios..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
log_success "Servicios iniciados"

# 10. Aplicar migraciones de base de datos
log_info "Aplicando migraciones de base de datos..."
sleep 5  # Esperar a que el backend esté listo
docker-compose exec -T backend npx prisma migrate deploy
log_success "Migraciones aplicadas"

# 11. Health checks
log_info "Verificando salud de los servicios..."
sleep 10  # Esperar a que los servicios estén completamente levantados

# Check backend
if curl -f http://localhost:4000/health > /dev/null 2>&1; then
    log_success "Backend está saludable"
else
    log_error "Backend no está respondiendo correctamente"
    log_info "Ver logs: docker-compose logs backend"
fi

# Check frontend
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log_success "Frontend está saludable"
else
    log_error "Frontend no está respondiendo correctamente"
    log_info "Ver logs: docker-compose logs frontend"
fi

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U ${DB_USER:-truk_user} > /dev/null 2>&1; then
    log_success "PostgreSQL está saludable"
else
    log_error "PostgreSQL no está respondiendo"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    log_success "Redis está saludable"
else
    log_error "Redis no está respondiendo"
fi

# 12. Limpiar imágenes antiguas
log_info "Limpiando imágenes Docker antiguas..."
docker image prune -f > /dev/null 2>&1
log_success "Imágenes antiguas eliminadas"

# 13. Mostrar estado final
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║       Despliegue Completado           ║"
echo "╚═══════════════════════════════════════╝"
echo ""
log_success "Aplicación desplegada correctamente"
echo ""
echo "Servicios disponibles:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:4000"
echo "  • API Docs: http://localhost:4000/api/docs"
echo ""
echo "Comandos útiles:"
echo "  • Ver logs:      docker-compose logs -f"
echo "  • Ver estado:    docker-compose ps"
echo "  • Parar todo:    docker-compose down"
echo "  • Reiniciar:     docker-compose restart <servicio>"
echo ""
log_info "Para ver esta información de nuevo: ./scripts/deploy-production.sh --help"
echo ""
