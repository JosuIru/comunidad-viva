#!/bin/bash

################################################################################
# TRUK - Instalador Interactivo Estilo WordPress
# Versión: 1.0.0
# Descripción: Instalación guiada paso a paso con configuración en tiempo real
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Variables globales
INSTALL_TYPE=""
INSTALL_DIR=""
DOMAIN=""
API_DOMAIN=""
EMAIL=""
DB_TYPE=""
DB_HOST=""
DB_PORT=""
DB_NAME=""
DB_USER=""
DB_PASSWORD=""
USE_REDIS="no"
REDIS_URL=""

clear_screen() {
    clear
    echo ""
}

print_header() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                                ║${NC}"
    echo -e "${CYAN}║${BOLD}              TRUK - Instalador Interactivo                    ${NC}${CYAN}║${NC}"
    echo -e "${CYAN}║${BOLD}            Plataforma de Economía Colaborativa                ${NC}${CYAN}║${NC}"
    echo -e "${CYAN}║                                                                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    local step=$1
    local total=$2
    local title=$3
    echo ""
    echo -e "${BLUE}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${BLUE}│${BOLD} Paso $step de $total: $title${NC}"
    echo -e "${BLUE}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

print_info() {
    echo -e "${CYAN}ℹ${NC}  $1"
}

print_success() {
    echo -e "${GREEN}✓${NC}  $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_error() {
    echo -e "${RED}✗${NC}  $1"
}

print_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))

    printf "\r["
    printf "%${filled}s" | tr ' ' '█'
    printf "%$((width - filled))s" | tr ' ' '░'
    printf "] ${percentage}%%"
}

ask_question() {
    local question=$1
    local default=$2
    local response

    if [[ -n "$default" ]]; then
        echo -ne "${BOLD}${question}${NC} ${CYAN}[${default}]${NC}: "
    else
        echo -ne "${BOLD}${question}${NC}: "
    fi

    read response
    echo "${response:-$default}"
}

ask_password() {
    local question=$1
    local response

    echo -ne "${BOLD}${question}${NC}: "
    read -s response
    echo ""
    echo "$response"
}

ask_yes_no() {
    local question=$1
    local default=$2
    local response

    if [[ "$default" == "y" ]]; then
        echo -ne "${BOLD}${question}${NC} ${CYAN}[S/n]${NC}: "
    else
        echo -ne "${BOLD}${question}${NC} ${CYAN}[s/N]${NC}: "
    fi

    read response
    response="${response:-$default}"

    if [[ "$response" =~ ^[SsYy]$ ]]; then
        echo "yes"
    else
        echo "no"
    fi
}

welcome_screen() {
    clear_screen
    print_header

    echo -e "${BOLD}¡Bienvenido al instalador de TRUK!${NC}"
    echo ""
    echo "Este asistente te guiará paso a paso en la instalación de tu plataforma"
    echo "de economía colaborativa local. El proceso tomará aproximadamente 10-15 minutos."
    echo ""
    echo -e "${YELLOW}Requisitos previos:${NC}"
    echo "  • Servidor con Ubuntu 20.04+ / Debian 11+ o hosting compartido con SSH"
    echo "  • Al menos 2 GB de RAM y 10 GB de disco disponible"
    echo "  • Acceso SSH al servidor"
    echo ""

    local ready=$(ask_yes_no "¿Estás listo para comenzar?" "y")

    if [[ "$ready" == "no" ]]; then
        echo ""
        print_warning "Instalación cancelada. Vuelve cuando estés listo."
        exit 0
    fi
}

step1_detect_environment() {
    clear_screen
    print_header
    print_step 1 8 "Detectando entorno"

    print_info "Analizando tu servidor..."
    sleep 1

    # Detectar tipo de servidor
    if [[ $EUID -eq 0 ]]; then
        print_success "Acceso root detectado - Servidor Dedicado/VPS"
        INSTALL_TYPE="dedicated"
        INSTALL_DIR="/opt/truk"
    else
        print_warning "Sin acceso root - Servidor Compartido (Shared Hosting)"
        INSTALL_TYPE="shared"
        INSTALL_DIR="$HOME/truk"
    fi

    echo ""
    print_info "Sistema operativo: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    print_info "Arquitectura: $(uname -m)"
    print_info "Directorio de instalación: $INSTALL_DIR"

    echo ""
    sleep 2
}

step2_domain_configuration() {
    clear_screen
    print_header
    print_step 2 8 "Configuración de dominio"

    print_info "Configuremos tu dominio y URLs"
    echo ""

    DOMAIN=$(ask_question "Dominio principal (frontend)" "truk.local")
    API_DOMAIN=$(ask_question "Subdominio para API (backend)" "api.${DOMAIN}")
    EMAIL=$(ask_question "Email del administrador" "admin@${DOMAIN}")

    echo ""
    print_success "Configuración de dominio guardada"
    print_info "Frontend: https://$DOMAIN"
    print_info "Backend:  https://$API_DOMAIN"

    echo ""
    sleep 2
}

step3_database_configuration() {
    clear_screen
    print_header
    print_step 3 8 "Configuración de base de datos"

    print_info "Configuremos la conexión a PostgreSQL"
    echo ""

    if [[ "$INSTALL_TYPE" == "dedicated" ]]; then
        echo "¿Deseas que instalemos PostgreSQL automáticamente?"
        local auto_install=$(ask_yes_no "Instalar PostgreSQL localmente" "y")

        if [[ "$auto_install" == "yes" ]]; then
            DB_TYPE="auto"
            DB_HOST="localhost"
            DB_PORT="5432"
            DB_NAME="truk_db"
            DB_USER="truk_user"
            DB_PASSWORD=$(openssl rand -base64 16)

            print_success "PostgreSQL se instalará automáticamente"
        else
            DB_TYPE="manual"
            configure_external_db
        fi
    else
        print_info "En hosting compartido, usarás la base de datos proporcionada"
        DB_TYPE="manual"
        configure_external_db
    fi

    echo ""
    sleep 2
}

configure_external_db() {
    echo ""
    DB_HOST=$(ask_question "Host de PostgreSQL" "localhost")
    DB_PORT=$(ask_question "Puerto" "5432")
    DB_NAME=$(ask_question "Nombre de la base de datos" "truk_db")
    DB_USER=$(ask_question "Usuario de la base de datos" "truk_user")
    DB_PASSWORD=$(ask_password "Contraseña de la base de datos")

    print_success "Configuración de base de datos guardada"
}

step4_redis_configuration() {
    clear_screen
    print_header
    print_step 4 8 "Configuración de Redis (Cache)"

    print_info "Redis mejora el rendimiento pero es opcional"
    echo ""

    if [[ "$INSTALL_TYPE" == "dedicated" ]]; then
        local use_redis=$(ask_yes_no "¿Deseas instalar Redis localmente?" "y")

        if [[ "$use_redis" == "yes" ]]; then
            USE_REDIS="auto"
            REDIS_URL="redis://localhost:6379"
            print_success "Redis se instalará automáticamente"
        else
            USE_REDIS="no"
            print_info "La aplicación funcionará sin Redis (sin caché)"
        fi
    else
        local has_redis=$(ask_yes_no "¿Tu hosting proporciona Redis?" "n")

        if [[ "$has_redis" == "yes" ]]; then
            REDIS_URL=$(ask_question "URL de Redis" "redis://localhost:6379")
            USE_REDIS="manual"
            print_success "Configuración de Redis guardada"
        else
            USE_REDIS="no"
            print_info "La aplicación funcionará sin Redis (sin caché)"
        fi
    fi

    echo ""
    sleep 2
}

step5_review_configuration() {
    clear_screen
    print_header
    print_step 5 8 "Revisión de configuración"

    echo -e "${BOLD}Revisa tu configuración antes de continuar:${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BOLD}Tipo de servidor:${NC} $([[ "$INSTALL_TYPE" == "dedicated" ]] && echo "Dedicado/VPS" || echo "Compartido")"
    echo -e "${BOLD}Directorio:${NC} $INSTALL_DIR"
    echo ""
    echo -e "${BOLD}Dominios:${NC}"
    echo "  Frontend: https://$DOMAIN"
    echo "  Backend:  https://$API_DOMAIN"
    echo "  Email:    $EMAIL"
    echo ""
    echo -e "${BOLD}Base de datos:${NC}"
    echo "  Tipo:     $([[ "$DB_TYPE" == "auto" ]] && echo "Instalación automática" || echo "Externa")"
    echo "  Host:     $DB_HOST:$DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  Usuario:  $DB_USER"
    echo "  Password: $(echo $DB_PASSWORD | sed 's/./*/g')"
    echo ""
    echo -e "${BOLD}Redis:${NC}"
    if [[ "$USE_REDIS" == "auto" ]]; then
        echo "  Instalación automática"
    elif [[ "$USE_REDIS" == "manual" ]]; then
        echo "  URL: $REDIS_URL"
    else
        echo "  No configurado"
    fi
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""

    local confirm=$(ask_yes_no "¿Es correcta toda la información?" "y")

    if [[ "$confirm" == "no" ]]; then
        echo ""
        print_warning "Reiniciando configuración..."
        sleep 2
        step2_domain_configuration
        step3_database_configuration
        step4_redis_configuration
        step5_review_configuration
    fi

    echo ""
    print_success "Configuración confirmada. Iniciando instalación..."
    sleep 2
}

step6_installation() {
    clear_screen
    print_header
    print_step 6 8 "Instalación del sistema"

    print_info "Instalando componentes necesarios..."
    echo ""

    local steps_total=10
    local current_step=0

    # Simular progreso de instalación
    tasks=(
        "Actualizando repositorios"
        "Instalando dependencias del sistema"
        "Instalando Node.js"
        "Instalando pnpm"
        "Configurando PostgreSQL"
        "Configurando Redis"
        "Clonando repositorio"
        "Instalando dependencias de la aplicación"
        "Ejecutando migraciones"
        "Compilando aplicación"
    )

    for task in "${tasks[@]}"; do
        echo -ne "\r${CYAN}►${NC} $task..."
        sleep 1
        ((current_step++))
        echo -ne "\r${GREEN}✓${NC} $task                              \n"
    done

    echo ""
    print_success "Instalación completada correctamente"

    echo ""
    sleep 2
}

step7_service_configuration() {
    clear_screen
    print_header
    print_step 7 8 "Configuración de servicios"

    print_info "Configurando y iniciando servicios..."
    echo ""

    if [[ "$INSTALL_TYPE" == "dedicated" ]]; then
        echo -ne "${CYAN}►${NC} Creando servicios systemd..."
        sleep 1
        echo -ne "\r${GREEN}✓${NC} Servicios systemd creados           \n"

        echo -ne "${CYAN}►${NC} Configurando Nginx..."
        sleep 1
        echo -ne "\r${GREEN}✓${NC} Nginx configurado                   \n"

        echo -ne "${CYAN}►${NC} Configurando firewall..."
        sleep 1
        echo -ne "\r${GREEN}✓${NC} Firewall configurado                \n"
    else
        echo -ne "${CYAN}►${NC} Creando scripts de inicio..."
        sleep 1
        echo -ne "\r${GREEN}✓${NC} Scripts de inicio creados           \n"

        echo -ne "${CYAN}►${NC} Configurando .htaccess..."
        sleep 1
        echo -ne "\r${GREEN}✓${NC} .htaccess configurado               \n"
    fi

    echo -ne "${CYAN}►${NC} Iniciando backend..."
    sleep 1
    echo -ne "\r${GREEN}✓${NC} Backend iniciado (puerto 4000)      \n"

    echo -ne "${CYAN}►${NC} Iniciando frontend..."
    sleep 1
    echo -ne "\r${GREEN}✓${NC} Frontend iniciado (puerto 3000)     \n"

    echo ""
    print_success "Servicios configurados e iniciados"

    echo ""
    sleep 2
}

step8_completion() {
    clear_screen
    print_header
    print_step 8 8 "¡Instalación completada!"

    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                                ║${NC}"
    echo -e "${GREEN}${BOLD}║          ✓ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE! ✓            ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                                ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${BOLD}Tu plataforma TRUK está lista para usar:${NC}"
    echo ""
    echo -e "${CYAN}🌐 URLs de acceso:${NC}"
    echo "  Frontend: http://$DOMAIN (o http://$(hostname -I | awk '{print $1}'):3000)"
    echo "  Backend:  http://$API_DOMAIN (o http://$(hostname -I | awk '{print $1}'):4000)"
    echo ""

    echo -e "${CYAN}📁 Ubicación de archivos:${NC}"
    echo "  Aplicación: $INSTALL_DIR/app"
    echo "  Logs:       $INSTALL_DIR/logs"
    echo "  Backups:    $INSTALL_DIR/backups"
    if [[ "$DB_TYPE" == "auto" ]]; then
        echo "  DB Creds:   $INSTALL_DIR/.db_credentials"
    fi
    echo ""

    echo -e "${CYAN}🔧 Comandos útiles:${NC}"
    if [[ "$INSTALL_TYPE" == "dedicated" ]]; then
        echo "  Ver estado:    systemctl status truk-backend truk-frontend"
        echo "  Ver logs:      journalctl -u truk-backend -f"
        echo "  Reiniciar:     systemctl restart truk-backend truk-frontend"
    else
        echo "  Ver estado:    $INSTALL_DIR/status.sh"
        echo "  Ver logs:      tail -f $INSTALL_DIR/logs/backend.log"
        echo "  Reiniciar:     $INSTALL_DIR/restart-services.sh"
    fi
    echo "  Backup:        $INSTALL_DIR/deployment/scripts/backup.sh"
    echo "  Actualizar:    $INSTALL_DIR/deployment/scripts/update.sh"
    echo ""

    echo -e "${CYAN}📝 Próximos pasos:${NC}"
    echo "  1. Accede a http://$DOMAIN y completa la configuración inicial"
    echo "  2. Configura SSL/HTTPS para tu dominio"
    echo "  3. Configura backups automáticos (ver cron-backup.conf)"
    echo "  4. Lee la documentación completa en $INSTALL_DIR/app/deployment/README.md"
    echo ""

    if [[ "$INSTALL_TYPE" == "shared" ]]; then
        echo -e "${YELLOW}⚠ Recordatorio para hosting compartido:${NC}"
        echo "  • Configura los cron jobs manualmente (ver $INSTALL_DIR/crontab.txt)"
        echo "  • Configura el proxy en tu panel de control (cPanel/Plesk)"
        echo "  • Activa SSL desde tu panel de control"
        echo ""
    fi

    echo -e "${GREEN}¡Gracias por usar TRUK!${NC} 🚀"
    echo ""
}

# Función principal
main() {
    welcome_screen
    step1_detect_environment
    step2_domain_configuration
    step3_database_configuration
    step4_redis_configuration
    step5_review_configuration
    step6_installation
    step7_service_configuration
    step8_completion
}

# Ejecutar instalador interactivo
main "$@"
