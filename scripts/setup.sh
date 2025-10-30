#!/bin/bash

# =============================================================================
# Script de Setup Automático - Comunidad Viva
# =============================================================================
# Este script configura el entorno de desarrollo automáticamente
# Uso: ./scripts/setup.sh
# =============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar prerequisitos
check_prerequisites() {
    print_header "Verificando Prerequisitos"

    local all_ok=true

    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -ge 18 ]; then
            print_success "Node.js $(node -v) instalado"
        else
            print_error "Node.js debe ser versión 18 o superior"
            all_ok=false
        fi
    else
        print_error "Node.js no está instalado"
        print_info "Instala Node.js desde https://nodejs.org/"
        all_ok=false
    fi

    # npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm -v) instalado"
    else
        print_error "npm no está instalado"
        all_ok=false
    fi

    # Docker
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) instalado"
    else
        print_warning "Docker no está instalado (opcional pero recomendado)"
        print_info "Instala Docker desde https://docs.docker.com/get-docker/"
    fi

    # Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose $(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1) instalado"
    else
        print_warning "Docker Compose no está instalado (opcional pero recomendado)"
    fi

    # Git
    if command -v git &> /dev/null; then
        print_success "Git $(git --version | cut -d' ' -f3) instalado"
    else
        print_error "Git no está instalado"
        all_ok=false
    fi

    if [ "$all_ok" = false ]; then
        print_error "Algunos prerequisitos no están cumplidos"
        exit 1
    fi
}

# Configurar variables de entorno
setup_env_files() {
    print_header "Configurando Variables de Entorno"

    # Root .env
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Creado .env desde .env.example"
    else
        print_warning ".env ya existe (no se sobrescribe)"
    fi

    # Backend .env
    if [ ! -f packages/backend/.env ]; then
        cp packages/backend/.env.example packages/backend/.env
        print_success "Creado packages/backend/.env"
    else
        print_warning "packages/backend/.env ya existe"
    fi

    # Frontend .env.local
    if [ ! -f packages/web/.env.local ]; then
        cp packages/web/.env.local.example packages/web/.env.local
        print_success "Creado packages/web/.env.local"
    else
        print_warning "packages/web/.env.local ya existe"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "Instalando Dependencias"

    print_info "Instalando dependencias del workspace..."
    npm install

    if [ $? -eq 0 ]; then
        print_success "Dependencias instaladas correctamente"
    else
        print_error "Error al instalar dependencias"
        exit 1
    fi
}

# Configurar base de datos
setup_database() {
    print_header "Configurando Base de Datos"

    if command -v docker-compose &> /dev/null; then
        print_info "Levantando servicios de Docker..."
        docker-compose up -d postgres redis

        # Esperar a que postgres esté listo
        print_info "Esperando a que PostgreSQL esté listo..."
        sleep 5

        print_info "Aplicando migraciones de Prisma..."
        cd packages/backend
        npx prisma migrate deploy
        npx prisma generate
        cd ../..

        print_success "Base de datos configurada"
    else
        print_warning "Docker no disponible. Configura PostgreSQL manualmente."
        print_info "Luego ejecuta: cd packages/backend && npx prisma migrate deploy"
    fi
}

# Poblar con datos de prueba
seed_database() {
    print_header "Poblando Base de Datos"

    read -p "¿Deseas poblar la base de datos con datos de prueba? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        print_info "Ejecutando seed..."
        cd packages/backend
        npm run seed
        cd ../..
        print_success "Base de datos poblada"
    else
        print_info "Omitiendo seed"
    fi
}

# Crear directorios necesarios
create_directories() {
    print_header "Creando Directorios"

    mkdir -p packages/backend/uploads
    mkdir -p backups
    mkdir -p nginx/ssl

    print_success "Directorios creados"
}

# Verificar instalación
verify_installation() {
    print_header "Verificando Instalación"

    # Verificar que los módulos están instalados
    if [ -d "node_modules" ]; then
        print_success "node_modules existe"
    else
        print_error "node_modules no encontrado"
    fi

    # Verificar archivos .env
    if [ -f ".env" ] && [ -f "packages/backend/.env" ] && [ -f "packages/web/.env.local" ]; then
        print_success "Archivos .env configurados"
    else
        print_warning "Algunos archivos .env no están configurados"
    fi

    print_success "Instalación verificada"
}

# Mostrar siguiente pasos
show_next_steps() {
    print_header "✅ Setup Completado"

    echo -e "${GREEN}¡Todo listo para empezar a desarrollar!${NC}\n"

    echo "Próximos pasos:"
    echo ""
    echo "1. Levantar el entorno de desarrollo:"
    echo -e "   ${YELLOW}make dev${NC}"
    echo -e "   o"
    echo -e "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "2. Acceder a la aplicación:"
    echo -e "   Backend:  ${BLUE}http://localhost:4000${NC}"
    echo -e "   Frontend: ${BLUE}http://localhost:3000${NC}"
    echo -e "   API Docs: ${BLUE}http://localhost:4000/api/docs${NC}"
    echo ""
    echo "3. Leer la documentación:"
    echo -e "   ${YELLOW}cat README.md${NC}"
    echo -e "   ${YELLOW}cat QUICK_START.md${NC}"
    echo ""
    echo "Para más información, visita:"
    echo -e "   ${BLUE}https://github.com/JosuIru/comunidad-viva${NC}"
    echo ""
}

# Main
main() {
    clear
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║           🌱 COMUNIDAD VIVA - SETUP 🌱                    ║"
    echo "║                                                           ║"
    echo "║     Configuración automática del entorno de desarrollo   ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    check_prerequisites
    setup_env_files
    create_directories
    install_dependencies
    setup_database
    seed_database
    verify_installation
    show_next_steps
}

# Ejecutar
main
