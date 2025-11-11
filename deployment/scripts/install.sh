#!/bin/bash

################################################################################
# TRUK - Script de Instalación en Servidor
# Versión: 1.0.0
# Descripción: Instalación completa de la plataforma Comunidad Viva
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
INSTALL_DIR="${INSTALL_DIR:-/opt/truk}"
APP_USER="${APP_USER:-truk}"
NODE_VERSION="${NODE_VERSION:-20}"
POSTGRES_VERSION="${POSTGRES_VERSION:-15}"

# Funciones de utilidad
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

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script debe ejecutarse como root"
        exit 1
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        log_error "No se puede determinar el sistema operativo"
        exit 1
    fi

    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID

    log_info "Sistema operativo detectado: $OS $VERSION"

    if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
        log_warning "Este script está optimizado para Ubuntu/Debian"
    fi
}

install_dependencies() {
    log_info "Instalando dependencias del sistema..."

    apt-get update
    apt-get install -y \
        curl \
        wget \
        git \
        build-essential \
        nginx \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        logrotate \
        supervisor

    log_success "Dependencias del sistema instaladas"
}

install_nodejs() {
    log_info "Instalando Node.js $NODE_VERSION..."

    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$CURRENT_VERSION" -ge "$NODE_VERSION" ]]; then
            log_success "Node.js ya está instalado (v$(node -v))"
            return
        fi
    fi

    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs

    # Instalar pnpm
    npm install -g pnpm

    log_success "Node.js $(node -v) y pnpm instalados"
}

install_postgresql() {
    log_info "Instalando PostgreSQL $POSTGRES_VERSION..."

    if command -v psql &> /dev/null; then
        log_success "PostgreSQL ya está instalado"
        return
    fi

    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update
    apt-get install -y postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}

    log_success "PostgreSQL $POSTGRES_VERSION instalado"
}

install_redis() {
    log_info "Instalando Redis..."

    if command -v redis-cli &> /dev/null; then
        log_success "Redis ya está instalado"
        return
    fi

    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server

    log_success "Redis instalado y en ejecución"
}

create_app_user() {
    log_info "Creando usuario de aplicación: $APP_USER..."

    if id "$APP_USER" &>/dev/null; then
        log_success "Usuario $APP_USER ya existe"
        return
    fi

    useradd -r -m -s /bin/bash -d "$INSTALL_DIR" "$APP_USER"
    log_success "Usuario $APP_USER creado"
}

setup_database() {
    log_info "Configurando base de datos..."

    DB_NAME="${DB_NAME:-comunidad_viva}"
    DB_USER="${DB_USER:-truk_user}"
    DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 32)}"

    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || log_warning "Base de datos ya existe"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || log_warning "Usuario ya existe"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

    # Guardar credenciales
    cat > "$INSTALL_DIR/.db_credentials" <<EOF
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
EOF
    chown "$APP_USER:$APP_USER" "$INSTALL_DIR/.db_credentials"
    chmod 600 "$INSTALL_DIR/.db_credentials"

    log_success "Base de datos configurada"
    log_info "Credenciales guardadas en: $INSTALL_DIR/.db_credentials"
}

clone_repository() {
    log_info "Clonando repositorio..."

    REPO_URL="${REPO_URL:-https://github.com/JosuIru/comunidad-viva.git}"

    if [[ -d "$INSTALL_DIR/app" ]]; then
        log_warning "Directorio de aplicación ya existe"
        return
    fi

    sudo -u "$APP_USER" git clone "$REPO_URL" "$INSTALL_DIR/app"
    log_success "Repositorio clonado"
}

install_app_dependencies() {
    log_info "Instalando dependencias de la aplicación..."

    cd "$INSTALL_DIR/app"
    sudo -u "$APP_USER" pnpm install

    log_success "Dependencias instaladas"
}

setup_environment() {
    log_info "Configurando variables de entorno..."

    # Cargar credenciales de BD
    source "$INSTALL_DIR/.db_credentials"

    # Generar secrets
    JWT_SECRET=$(openssl rand -base64 64)
    SESSION_SECRET=$(openssl rand -base64 64)

    # Backend .env
    cat > "$INSTALL_DIR/app/packages/backend/.env" <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
REDIS_URL=redis://localhost:6379
FRONTEND_URL=https://truk.app
CORS_ORIGIN=https://truk.app
EOF

    # Frontend .env
    cat > "$INSTALL_DIR/app/packages/web/.env.production" <<EOF
NEXT_PUBLIC_API_URL=https://api.truk.app
NEXT_PUBLIC_WS_URL=wss://api.truk.app
NODE_ENV=production
EOF

    chown -R "$APP_USER:$APP_USER" "$INSTALL_DIR/app"

    log_success "Variables de entorno configuradas"
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

run_migrations() {
    log_info "Ejecutando migraciones de base de datos..."

    cd "$INSTALL_DIR/app/packages/backend"
    source "$INSTALL_DIR/.db_credentials"

    sudo -u "$APP_USER" bash -c "DATABASE_URL=$DATABASE_URL pnpm prisma migrate deploy"
    sudo -u "$APP_USER" bash -c "DATABASE_URL=$DATABASE_URL pnpm prisma generate"

    log_success "Migraciones completadas"
}

setup_systemd_services() {
    log_info "Configurando servicios systemd..."

    # Backend service
    cat > /etc/systemd/system/truk-backend.service <<EOF
[Unit]
Description=TRUK Backend Service
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$INSTALL_DIR/app/packages/backend
Environment=NODE_ENV=production
EnvironmentFile=$INSTALL_DIR/app/packages/backend/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=truk-backend

[Install]
WantedBy=multi-user.target
EOF

    # Frontend service
    cat > /etc/systemd/system/truk-frontend.service <<EOF
[Unit]
Description=TRUK Frontend Service
After=network.target truk-backend.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$INSTALL_DIR/app/packages/web
Environment=NODE_ENV=production
EnvironmentFile=$INSTALL_DIR/app/packages/web/.env.production
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=truk-frontend

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable truk-backend truk-frontend

    log_success "Servicios systemd configurados"
}

setup_nginx() {
    log_info "Configurando Nginx..."

    DOMAIN="${DOMAIN:-truk.app}"
    API_DOMAIN="${API_DOMAIN:-api.truk.app}"

    # Backend config
    cat > /etc/nginx/sites-available/truk-backend <<EOF
server {
    listen 80;
    server_name $API_DOMAIN;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
}
EOF

    # Frontend config
    cat > /etc/nginx/sites-available/truk-frontend <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    client_max_body_size 10M;
}
EOF

    ln -sf /etc/nginx/sites-available/truk-backend /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/truk-frontend /etc/nginx/sites-enabled/

    nginx -t && systemctl reload nginx

    log_success "Nginx configurado"
}

setup_firewall() {
    log_info "Configurando firewall..."

    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow http
    ufw allow https

    log_success "Firewall configurado"
}

setup_ssl() {
    log_info "Configurando SSL con Let's Encrypt..."

    DOMAIN="${DOMAIN:-truk.app}"
    API_DOMAIN="${API_DOMAIN:-api.truk.app}"
    EMAIL="${EMAIL:-admin@truk.app}"

    if [[ "$DOMAIN" == "truk.app" ]]; then
        log_warning "Usando dominio por defecto. Saltando configuración SSL."
        log_warning "Ejecuta: certbot --nginx -d tu-dominio.com para configurar SSL manualmente"
        return
    fi

    certbot --nginx -d "$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos --email "$EMAIL"

    log_success "SSL configurado"
}

setup_logrotate() {
    log_info "Configurando rotación de logs..."

    cat > /etc/logrotate.d/truk <<EOF
$INSTALL_DIR/app/packages/*/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $APP_USER $APP_USER
    sharedscripts
    postrotate
        systemctl reload truk-backend truk-frontend > /dev/null 2>&1 || true
    endscript
}
EOF

    log_success "Logrotate configurado"
}

start_services() {
    log_info "Iniciando servicios..."

    systemctl start truk-backend
    systemctl start truk-frontend

    sleep 5

    if systemctl is-active --quiet truk-backend && systemctl is-active --quiet truk-frontend; then
        log_success "Servicios iniciados correctamente"
    else
        log_error "Error al iniciar servicios. Revisar logs:"
        log_error "  journalctl -u truk-backend -n 50"
        log_error "  journalctl -u truk-frontend -n 50"
        exit 1
    fi
}

display_summary() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    log_success "Instalación completada exitosamente!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📁 Directorio de instalación: $INSTALL_DIR"
    echo "👤 Usuario de aplicación: $APP_USER"
    echo "🗄️  Credenciales de BD: $INSTALL_DIR/.db_credentials"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://${DOMAIN:-localhost:3000}"
    echo "   Backend:  http://${API_DOMAIN:-localhost:4000}"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   systemctl status truk-backend"
    echo "   systemctl status truk-frontend"
    echo "   journalctl -u truk-backend -f"
    echo "   journalctl -u truk-frontend -f"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Configurar dominio DNS"
    echo "   2. Ejecutar: certbot --nginx -d tu-dominio.com"
    echo "   3. Crear usuario admin de la plataforma"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              TRUK - Instalación en Servidor              ║"
    echo "║              Plataforma de Economía Colaborativa          ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""

    check_root
    check_os

    log_info "Iniciando instalación..."

    install_dependencies
    install_nodejs
    install_postgresql
    install_redis
    create_app_user
    setup_database
    clone_repository
    install_app_dependencies
    setup_environment
    build_application
    run_migrations
    setup_systemd_services
    setup_nginx
    setup_firewall
    setup_logrotate
    start_services
    setup_ssl

    display_summary
}

# Ejecutar instalación
main "$@"
