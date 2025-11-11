#!/bin/bash

################################################################################
# TRUK - Instalación en Servidor Compartido (Shared Hosting)
# Versión: 1.0.0
# Descripción: Instalación adaptada para hosting compartido sin acceso root
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
INSTALL_DIR="${HOME}/truk"
NODE_VERSION="${NODE_VERSION:-20.11.0}"
PNPM_VERSION="${PNPM_VERSION:-8.15.0}"

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

check_environment() {
    log_info "Verificando entorno de hosting compartido..."

    # Verificar que NO tenemos acceso root
    if [[ $EUID -eq 0 ]]; then
        log_error "Este script está diseñado para hosting compartido SIN acceso root"
        log_info "Para servidores dedicados/VPS, use install.sh"
        exit 1
    fi

    # Verificar directorio home
    if [[ ! -w "$HOME" ]]; then
        log_error "No tienes permisos de escritura en tu directorio home"
        exit 1
    fi

    log_success "Entorno verificado"
}

check_services() {
    log_info "Verificando servicios disponibles..."

    # PostgreSQL
    if command -v psql &> /dev/null || [[ -n "$DATABASE_URL" ]]; then
        log_success "PostgreSQL disponible"
        HAS_POSTGRES=true
    else
        log_warning "PostgreSQL no disponible - necesitarás configurar una base de datos externa"
        HAS_POSTGRES=false
    fi

    # Node.js
    if command -v node &> /dev/null; then
        CURRENT_NODE=$(node -v)
        log_info "Node.js detectado: $CURRENT_NODE"
        HAS_NODE=true
    else
        log_warning "Node.js no detectado - se instalará localmente"
        HAS_NODE=false
    fi
}

install_nvm_and_node() {
    log_info "Instalando Node Version Manager (nvm)..."

    if [[ -d "$HOME/.nvm" ]]; then
        log_info "nvm ya está instalado"
    else
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    fi

    # Cargar nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Instalar Node.js
    log_info "Instalando Node.js ${NODE_VERSION}..."
    nvm install "$NODE_VERSION"
    nvm use "$NODE_VERSION"
    nvm alias default "$NODE_VERSION"

    log_success "Node.js instalado: $(node -v)"
}

install_pnpm() {
    log_info "Instalando pnpm..."

    if command -v pnpm &> /dev/null; then
        log_success "pnpm ya está instalado: $(pnpm -v)"
    else
        npm install -g pnpm@${PNPM_VERSION}
        log_success "pnpm instalado: $(pnpm -v)"
    fi
}

create_directory_structure() {
    log_info "Creando estructura de directorios..."

    mkdir -p "$INSTALL_DIR"/{app,backups,logs,tmp}
    mkdir -p "$INSTALL_DIR/public_html"  # Para servir archivos estáticos

    log_success "Estructura creada en: $INSTALL_DIR"
}

clone_repository() {
    log_info "Clonando repositorio..."

    REPO_URL="${REPO_URL:-https://github.com/JosuIru/comunidad-viva.git}"

    if [[ -d "$INSTALL_DIR/app" ]]; then
        log_warning "Directorio ya existe, actualizando..."
        cd "$INSTALL_DIR/app"
        git pull
    else
        git clone "$REPO_URL" "$INSTALL_DIR/app"
    fi

    log_success "Repositorio clonado"
}

setup_environment() {
    log_info "Configurando variables de entorno..."

    # Solicitar información necesaria
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "CONFIGURACIÓN DE BASE DE DATOS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    if [[ -z "$DATABASE_URL" ]]; then
        read -p "URL de PostgreSQL (ej: postgresql://user:pass@host:5432/db): " DATABASE_URL
    fi

    if [[ -z "$DATABASE_URL" ]]; then
        log_error "DATABASE_URL es requerido"
        exit 1
    fi

    # Generar secrets
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
    SESSION_SECRET=$(openssl rand -base64 64 | tr -d '\n')

    # Backend .env
    cat > "$INSTALL_DIR/app/packages/backend/.env" <<EOF
NODE_ENV=production
PORT=${BACKEND_PORT:-4000}
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
REDIS_URL=${REDIS_URL:-}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}

# Rutas personalizadas para shared hosting
UPLOAD_DIR=$INSTALL_DIR/public_html/uploads
LOG_DIR=$INSTALL_DIR/logs
TEMP_DIR=$INSTALL_DIR/tmp
EOF

    # Frontend .env
    cat > "$INSTALL_DIR/app/packages/web/.env.production" <<EOF
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:4000}
NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-ws://localhost:4000}
NODE_ENV=production
EOF

    # Guardar configuración
    cat > "$INSTALL_DIR/.env" <<EOF
INSTALL_DIR=$INSTALL_DIR
DATABASE_URL=$DATABASE_URL
BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
EOF

    chmod 600 "$INSTALL_DIR/.env"
    chmod 600 "$INSTALL_DIR/app/packages/backend/.env"
    chmod 600 "$INSTALL_DIR/app/packages/web/.env.production"

    log_success "Variables de entorno configuradas"
}

install_dependencies() {
    log_info "Instalando dependencias de la aplicación..."

    cd "$INSTALL_DIR/app"
    pnpm install

    log_success "Dependencias instaladas"
}

run_migrations() {
    log_info "Ejecutando migraciones de base de datos..."

    cd "$INSTALL_DIR/app/packages/backend"
    source "$INSTALL_DIR/.env"

    pnpm prisma migrate deploy
    pnpm prisma generate

    log_success "Migraciones completadas"
}

build_application() {
    log_info "Compilando aplicación..."

    cd "$INSTALL_DIR/app"

    # Build backend
    cd packages/backend
    pnpm build

    # Build frontend
    cd ../web
    pnpm build

    log_success "Aplicación compilada"
}

create_start_scripts() {
    log_info "Creando scripts de inicio..."

    # Script para iniciar backend
    cat > "$INSTALL_DIR/start-backend.sh" <<'EOFSCRIPT'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")/app/packages/backend"
source "$(dirname "$0")/.env"

# Matar proceso anterior si existe
PID_FILE="$(dirname "$0")/tmp/backend.pid"
if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        kill $OLD_PID
        sleep 2
    fi
fi

# Iniciar backend
nohup node dist/main.js > "$(dirname "$0")/logs/backend.log" 2>&1 &
echo $! > "$PID_FILE"

echo "Backend iniciado en puerto $BACKEND_PORT (PID: $!)"
EOFSCRIPT

    # Script para iniciar frontend
    cat > "$INSTALL_DIR/start-frontend.sh" <<'EOFSCRIPT'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "$(dirname "$0")/app/packages/web"
source "$(dirname "$0")/.env"

# Matar proceso anterior si existe
PID_FILE="$(dirname "$0")/tmp/frontend.pid"
if [[ -f "$PID_FILE" ]]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        kill $OLD_PID
        sleep 2
    fi
fi

# Iniciar frontend
nohup pnpm start > "$(dirname "$0")/logs/frontend.log" 2>&1 &
echo $! > "$PID_FILE"

echo "Frontend iniciado en puerto $FRONTEND_PORT (PID: $!)"
EOFSCRIPT

    # Script para detener servicios
    cat > "$INSTALL_DIR/stop-services.sh" <<'EOFSCRIPT'
#!/bin/bash

INSTALL_DIR="$(dirname "$0")"

# Detener backend
if [[ -f "$INSTALL_DIR/tmp/backend.pid" ]]; then
    PID=$(cat "$INSTALL_DIR/tmp/backend.pid")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "Backend detenido (PID: $PID)"
    fi
    rm "$INSTALL_DIR/tmp/backend.pid"
fi

# Detener frontend
if [[ -f "$INSTALL_DIR/tmp/frontend.pid" ]]; then
    PID=$(cat "$INSTALL_DIR/tmp/frontend.pid")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "Frontend detenido (PID: $PID)"
    fi
    rm "$INSTALL_DIR/tmp/frontend.pid"
fi

echo "Servicios detenidos"
EOFSCRIPT

    # Script para reiniciar servicios
    cat > "$INSTALL_DIR/restart-services.sh" <<'EOFSCRIPT'
#!/bin/bash

INSTALL_DIR="$(dirname "$0")"

echo "Reiniciando servicios..."
"$INSTALL_DIR/stop-services.sh"
sleep 2
"$INSTALL_DIR/start-backend.sh"
sleep 3
"$INSTALL_DIR/start-frontend.sh"
echo "Servicios reiniciados"
EOFSCRIPT

    # Script para ver estado
    cat > "$INSTALL_DIR/status.sh" <<'EOFSCRIPT'
#!/bin/bash

INSTALL_DIR="$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════"
echo "ESTADO DE SERVICIOS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Backend
if [[ -f "$INSTALL_DIR/tmp/backend.pid" ]]; then
    PID=$(cat "$INSTALL_DIR/tmp/backend.pid")
    if ps -p $PID > /dev/null 2>&1; then
        echo "✓ Backend: ACTIVO (PID: $PID)"
    else
        echo "✗ Backend: INACTIVO (PID antiguo: $PID)"
    fi
else
    echo "✗ Backend: NO INICIADO"
fi

# Frontend
if [[ -f "$INSTALL_DIR/tmp/frontend.pid" ]]; then
    PID=$(cat "$INSTALL_DIR/tmp/frontend.pid")
    if ps -p $PID > /dev/null 2>&1; then
        echo "✓ Frontend: ACTIVO (PID: $PID)"
    else
        echo "✗ Frontend: INACTIVO (PID antiguo: $PID)"
    fi
else
    echo "✗ Frontend: NO INICIADO"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
EOFSCRIPT

    chmod +x "$INSTALL_DIR"/*.sh

    log_success "Scripts de inicio creados"
}

create_htaccess() {
    log_info "Creando .htaccess para Apache..."

    # .htaccess para el backend
    cat > "$INSTALL_DIR/public_html/.htaccess" <<'EOF'
# Habilitar RewriteEngine
RewriteEngine On

# Proxy para el backend (si el hosting lo soporta)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:4000/$1 [P,L]

# Servir archivos estáticos
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^uploads/(.*)$ uploads/$1 [L]

# Headers de seguridad
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
EOF

    log_success ".htaccess creado"
}

setup_cron_jobs() {
    log_info "Configurando tareas programadas..."

    # Mostrar cron jobs a añadir manualmente
    cat > "$INSTALL_DIR/crontab.txt" <<EOF
# TRUK - Tareas Programadas
# Añadir estas líneas a tu crontab con: crontab -e

# Reiniciar servicios cada 6 horas (por si se caen)
0 */6 * * * $INSTALL_DIR/restart-services.sh >> $INSTALL_DIR/logs/cron.log 2>&1

# Backup diario a las 3 AM
0 3 * * * $INSTALL_DIR/backup.sh >> $INSTALL_DIR/logs/backup.log 2>&1

# Limpiar logs antiguos semanalmente
0 2 * * 0 find $INSTALL_DIR/logs -name "*.log" -mtime +30 -delete
EOF

    log_success "Archivo crontab.txt creado"
    log_info "Para activar, ejecuta: crontab -e"
    log_info "Y añade el contenido de: $INSTALL_DIR/crontab.txt"
}

create_backup_script() {
    log_info "Creando script de backup..."

    cat > "$INSTALL_DIR/backup.sh" <<'EOFSCRIPT'
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

INSTALL_DIR="$(dirname "$0")"
BACKUP_DIR="$INSTALL_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Backup de código
tar -czf "$BACKUP_DIR/$BACKUP_NAME/code.tar.gz" -C "$INSTALL_DIR" app

# Backup de base de datos (usando pg_dump del hosting)
source "$INSTALL_DIR/.env"
if command -v pg_dump &> /dev/null; then
    pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_NAME/database.sql.gz"
fi

# Backup de archivos subidos
if [[ -d "$INSTALL_DIR/public_html/uploads" ]]; then
    tar -czf "$BACKUP_DIR/$BACKUP_NAME/uploads.tar.gz" -C "$INSTALL_DIR/public_html" uploads
fi

# Comprimir todo
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

# Limpiar backups antiguos (mantener últimos 7)
ls -t | tail -n +8 | xargs -r rm -f

echo "Backup creado: ${BACKUP_NAME}.tar.gz"
EOFSCRIPT

    chmod +x "$INSTALL_DIR/backup.sh"

    log_success "Script de backup creado"
}

display_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_success "Instalación en Shared Hosting completada!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📁 Directorio de instalación: $INSTALL_DIR"
    echo ""
    echo "🚀 Para iniciar los servicios:"
    echo "   cd $INSTALL_DIR"
    echo "   ./start-backend.sh"
    echo "   ./start-frontend.sh"
    echo ""
    echo "⚙️  Comandos útiles:"
    echo "   ./status.sh              - Ver estado de servicios"
    echo "   ./restart-services.sh    - Reiniciar servicios"
    echo "   ./stop-services.sh       - Detener servicios"
    echo "   ./backup.sh              - Crear backup"
    echo ""
    echo "📋 Logs:"
    echo "   tail -f $INSTALL_DIR/logs/backend.log"
    echo "   tail -f $INSTALL_DIR/logs/frontend.log"
    echo ""
    echo "⏰ Tareas programadas:"
    echo "   Edita tu crontab: crontab -e"
    echo "   Copia el contenido de: $INSTALL_DIR/crontab.txt"
    echo ""
    echo "🌐 URLs (configurar en tu panel de hosting):"
    echo "   Frontend: Puerto $FRONTEND_PORT"
    echo "   Backend:  Puerto $BACKEND_PORT"
    echo ""
    echo "📖 Documentación completa:"
    echo "   $INSTALL_DIR/app/deployment/README-SHARED.md"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║        TRUK - Instalación en Servidor Compartido         ║"
    echo "║                  (Shared Hosting)                         ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    check_environment
    check_services

    if [[ "$HAS_NODE" == false ]]; then
        install_nvm_and_node
    fi

    install_pnpm
    create_directory_structure
    clone_repository
    setup_environment
    install_dependencies
    run_migrations
    build_application
    create_start_scripts
    create_htaccess
    create_backup_script
    setup_cron_jobs

    display_summary
}

main "$@"
