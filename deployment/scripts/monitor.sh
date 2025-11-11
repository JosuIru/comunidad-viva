#!/bin/bash

################################################################################
# TRUK - Script de Monitoreo y Health Checks
# Versión: 1.0.0
# Descripción: Monitoreo de servicios, recursos y alertas automáticas
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
LOG_DIR="${LOG_DIR:-$INSTALL_DIR/logs}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Umbrales de alerta
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000  # ms

# Funciones
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_service() {
    local service_name=$1

    if systemctl is-active --quiet "$service_name"; then
        log_success "$service_name está ejecutándose"
        return 0
    else
        log_error "$service_name NO está ejecutándose"
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2

    if nc -z localhost "$port" 2>/dev/null; then
        log_success "$service responde en puerto $port"
        return 0
    else
        log_error "$service NO responde en puerto $port"
        return 1
    fi
}

check_http_endpoint() {
    local url=$1
    local name=$2
    local max_time=$3

    local response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time 10 "$url" 2>/dev/null || echo "error")

    if [[ "$response_time" == "error" ]]; then
        log_error "$name no responde en $url"
        return 1
    fi

    response_time_ms=$(echo "$response_time * 1000" | bc | cut -d'.' -f1)

    if [[ $response_time_ms -lt $max_time ]]; then
        log_success "$name responde en ${response_time_ms}ms"
        return 0
    else
        log_warning "$name responde lentamente: ${response_time_ms}ms"
        return 1
    fi
}

check_database() {
    log_info "Verificando base de datos..."

    if [[ ! -f "$INSTALL_DIR/.db_credentials" ]]; then
        log_error "No se encuentran las credenciales de la base de datos"
        return 1
    fi

    source "$INSTALL_DIR/.db_credentials"

    # Verificar conexión
    if sudo -u postgres psql -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        log_success "Base de datos accesible"

        # Estadísticas de la base de datos
        local db_size=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
        local connections=$(sudo -u postgres psql -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='$DB_NAME';")

        log_info "Tamaño de BD: $db_size"
        log_info "Conexiones activas: $connections"

        return 0
    else
        log_error "No se puede conectar a la base de datos"
        return 1
    fi
}

check_redis() {
    log_info "Verificando Redis..."

    if redis-cli ping > /dev/null 2>&1; then
        log_success "Redis está funcionando"

        local memory=$(redis-cli info memory | grep used_memory_human | cut -d':' -f2 | tr -d '\r')
        local keys=$(redis-cli dbsize | cut -d':' -f2 | tr -d '\r')

        log_info "Memoria usada: $memory"
        log_info "Keys almacenadas: $keys"

        return 0
    else
        log_error "Redis no está funcionando"
        return 1
    fi
}

check_disk_space() {
    log_info "Verificando espacio en disco..."

    local usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')

    if [[ $usage -lt $DISK_THRESHOLD ]]; then
        log_success "Espacio en disco: ${usage}% usado"
        return 0
    else
        log_warning "Espacio en disco crítico: ${usage}% usado"
        return 1
    fi
}

check_memory() {
    log_info "Verificando memoria..."

    local usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')

    if [[ $usage -lt $MEMORY_THRESHOLD ]]; then
        log_success "Memoria: ${usage}% usada"
        return 0
    else
        log_warning "Memoria alta: ${usage}% usada"
        return 1
    fi
}

check_cpu() {
    log_info "Verificando CPU..."

    local usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')

    if [[ $usage -lt $CPU_THRESHOLD ]]; then
        log_success "CPU: ${usage}% usada"
        return 0
    else
        log_warning "CPU alta: ${usage}% usada"
        return 1
    fi
}

check_logs_errors() {
    log_info "Verificando logs por errores recientes..."

    local errors=0

    # Verificar logs de backend
    if [[ -f "$LOG_DIR/backend.log" ]]; then
        local backend_errors=$(grep -i "error" "$LOG_DIR/backend.log" 2>/dev/null | tail -10 | wc -l)
        errors=$((errors + backend_errors))
    fi

    # Verificar journalctl
    local journal_errors=$(journalctl -u truk-backend -u truk-frontend --since "5 minutes ago" | grep -i "error" | wc -l)
    errors=$((errors + journal_errors))

    if [[ $errors -eq 0 ]]; then
        log_success "No se encontraron errores recientes"
        return 0
    else
        log_warning "Se encontraron $errors errores en los últimos 5 minutos"
        return 1
    fi
}

check_ssl_certificate() {
    log_info "Verificando certificado SSL..."

    local domain="${DOMAIN:-truk.app}"

    if [[ "$domain" == "truk.app" ]]; then
        log_info "No se ha configurado un dominio personalizado"
        return 0
    fi

    local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)

    if [[ -n "$expiry" ]]; then
        local expiry_epoch=$(date -d "$expiry" +%s)
        local now_epoch=$(date +%s)
        local days_left=$(( ($expiry_epoch - $now_epoch) / 86400 ))

        if [[ $days_left -gt 30 ]]; then
            log_success "Certificado SSL válido por $days_left días"
            return 0
        elif [[ $days_left -gt 0 ]]; then
            log_warning "Certificado SSL expira en $days_left días"
            return 1
        else
            log_error "Certificado SSL ha expirado"
            return 1
        fi
    else
        log_warning "No se pudo verificar el certificado SSL"
        return 1
    fi
}

get_system_info() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "INFORMACIÓN DEL SISTEMA"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "🖥️  Hostname: $(hostname)"
    echo "🐧 OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    echo "⏱️  Uptime: $(uptime -p)"
    echo "👤 Usuario: $(whoami)"
    echo ""
    echo "💾 CPU:"
    echo "   Modelo: $(lscpu | grep "Model name" | cut -d':' -f2 | xargs)"
    echo "   Núcleos: $(nproc)"
    echo "   Uso: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}')%"
    echo ""
    echo "🔧 Memoria:"
    free -h | awk 'NR==2 {printf "   Total: %s | Usada: %s | Libre: %s\n", $2, $3, $4}'
    echo ""
    echo "💿 Disco:"
    df -h / | awk 'NR==2 {printf "   Total: %s | Usado: %s (%s) | Libre: %s\n", $2, $3, $5, $4}'
    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

get_app_info() {
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "INFORMACIÓN DE LA APLICACIÓN"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    if [[ -d "$INSTALL_DIR/app" ]]; then
        cd "$INSTALL_DIR/app"
        echo "📦 Versión: $(git describe --tags --always 2>/dev/null || echo 'N/A')"
        echo "🌿 Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
        echo "📅 Último commit: $(git log -1 --format='%h - %s (%ar)' 2>/dev/null || echo 'N/A')"
    else
        echo "❌ Aplicación no encontrada"
    fi

    echo ""
    echo "═══════════════════════════════════════════════════════════"
}

run_health_checks() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║           TRUK - Health Check & Monitoring               ║"
    echo "╚═══════════════════════════════════════════════════════════╝"

    get_system_info
    get_app_info

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "VERIFICACIÓN DE SERVICIOS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    local failed_checks=0

    # Servicios principales
    check_service "truk-backend" || ((failed_checks++))
    check_service "truk-frontend" || ((failed_checks++))
    check_service "postgresql" || ((failed_checks++))
    check_service "redis-server" || ((failed_checks++))
    check_service "nginx" || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "VERIFICACIÓN DE PUERTOS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    check_port 4000 "Backend" || ((failed_checks++))
    check_port 3000 "Frontend" || ((failed_checks++))
    check_port 5432 "PostgreSQL" || ((failed_checks++))
    check_port 6379 "Redis" || ((failed_checks++))
    check_port 80 "Nginx (HTTP)" || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "VERIFICACIÓN DE ENDPOINTS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    check_http_endpoint "http://localhost:4000/health" "Backend Health" $RESPONSE_TIME_THRESHOLD || ((failed_checks++))
    check_http_endpoint "http://localhost:3000" "Frontend" $RESPONSE_TIME_THRESHOLD || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "VERIFICACIÓN DE RECURSOS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    check_cpu || ((failed_checks++))
    check_memory || ((failed_checks++))
    check_disk_space || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "VERIFICACIÓN DE BASES DE DATOS"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    check_database || ((failed_checks++))
    check_redis || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo "OTRAS VERIFICACIONES"
    echo "═══════════════════════════════════════════════════════════"
    echo ""

    check_logs_errors || ((failed_checks++))
    check_ssl_certificate || ((failed_checks++))

    echo ""
    echo "═══════════════════════════════════════════════════════════"

    if [[ $failed_checks -eq 0 ]]; then
        log_success "TODAS LAS VERIFICACIONES PASARON ✓"
        return 0
    else
        log_error "$failed_checks VERIFICACIONES FALLARON ✗"
        return 1
    fi
}

send_alert() {
    local message=$1

    # Email
    if [[ -n "$ALERT_EMAIL" ]] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "[TRUK] Alerta de Sistema" "$ALERT_EMAIL"
    fi

    # Slack
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK" > /dev/null 2>&1
    fi
}

continuous_monitoring() {
    log_info "Iniciando monitoreo continuo..."
    log_info "Presiona Ctrl+C para detener"
    echo ""

    while true; do
        clear
        run_health_checks

        sleep 60
    done
}

show_logs() {
    local service=${1:-all}
    local lines=${2:-50}

    case $service in
        backend)
            journalctl -u truk-backend -n "$lines" -f
            ;;
        frontend)
            journalctl -u truk-frontend -n "$lines" -f
            ;;
        all)
            journalctl -u truk-backend -u truk-frontend -n "$lines" -f
            ;;
        *)
            log_error "Servicio no válido: $service"
            exit 1
            ;;
    esac
}

main() {
    case "${1:-check}" in
        check)
            run_health_checks
            ;;
        monitor)
            continuous_monitoring
            ;;
        logs)
            show_logs "${2:-all}" "${3:-50}"
            ;;
        info)
            get_system_info
            get_app_info
            ;;
        *)
            echo "Uso: $0 {check|monitor|logs|info}"
            echo ""
            echo "Comandos:"
            echo "  check                      Ejecutar verificación única"
            echo "  monitor                    Monitoreo continuo (actualiza cada 60s)"
            echo "  logs [service] [lines]     Ver logs (backend|frontend|all)"
            echo "  info                       Mostrar información del sistema"
            echo ""
            echo "Ejemplos:"
            echo "  $0 check"
            echo "  $0 monitor"
            echo "  $0 logs backend 100"
            echo "  $0 info"
            exit 1
            ;;
    esac
}

main "$@"
