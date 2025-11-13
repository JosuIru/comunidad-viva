#!/bin/bash
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║     INSTALADOR DE TRUK - COMUNIDAD VIVA              ║"
echo "║     Plataforma de Economía Colaborativa Local        ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en la raíz del proyecto
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Verificando requisitos del sistema...${NC}"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo -e "${YELLOW}Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker instalado${NC}"
    echo -e "${YELLOW}⚠️  Por favor, cierra sesión y vuelve a entrar para que los cambios surtan efecto${NC}"
    exit 0
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    echo -e "${YELLOW}Instalando Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose instalado${NC}"
fi

echo -e "${GREEN}✅ Todos los requisitos están instalados${NC}"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creando archivo de configuración .env...${NC}"
    cp .env.example .env

    # Generar secretos aleatorios
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 24)
    REDIS_PASSWORD=$(openssl rand -base64 24)

    # Reemplazar en .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET|g" .env
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|g" .env
    sed -i "s|REDIS_PASSWORD=.*|REDIS_PASSWORD=$REDIS_PASSWORD|g" .env

    echo -e "${GREEN}✅ Archivo .env creado con secretos generados automáticamente${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Revisa y ajusta el archivo .env según tus necesidades${NC}"
else
    echo -e "${GREEN}✅ Archivo .env ya existe${NC}"
fi

# Preguntar si desea continuar
echo ""
read -p "¿Deseas continuar con la instalación? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}⚠️  Instalación cancelada${NC}"
    exit 0
fi

echo -e "${BLUE}🚀 Iniciando instalación...${NC}"

# Construir imágenes
echo -e "${YELLOW}📦 Construyendo imágenes Docker (esto puede tardar varios minutos)...${NC}"
docker-compose build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🔄 Iniciando servicios...${NC}"
docker-compose up -d postgres redis

# Esperar a que la base de datos esté lista
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
sleep 10

# Iniciar backend
echo -e "${YELLOW}🔄 Iniciando backend...${NC}"
docker-compose up -d backend

# Esperar a que el backend esté listo
echo -e "${YELLOW}⏳ Esperando a que el backend esté listo...${NC}"
sleep 15

# Verificar estado
echo ""
echo -e "${BLUE}📊 Estado de los servicios:${NC}"
docker-compose ps

# Verificar salud del backend
echo ""
echo -e "${YELLOW}🔍 Verificando salud del sistema...${NC}"
if curl -f http://localhost:3000/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend funcionando correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Backend aún iniciando... esto es normal en el primer arranque${NC}"
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}║     ✅ INSTALACIÓN COMPLETADA CON ÉXITO              ║${NC}"
echo -e "${GREEN}║                                                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📌 URLs de acceso:${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:3000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:3000/api${NC}"
echo -e "   Salud: ${GREEN}http://localhost:3000/health${NC}"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo -e "   Ver logs: ${YELLOW}docker-compose logs -f backend${NC}"
echo -e "   Detener: ${YELLOW}docker-compose down${NC}"
echo -e "   Reiniciar: ${YELLOW}docker-compose restart${NC}"
echo -e "   Ver estado: ${YELLOW}docker-compose ps${NC}"
echo ""
echo -e "${YELLOW}📚 Para más información, consulta INSTALL.md${NC}"
echo ""
