#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║     🚂 RAILWAY SETUP - TRUK                          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}📦 Railway CLI no está instalado${NC}"
    echo -e "${BLUE}Instalando Railway CLI...${NC}"
    npm install -g @railway/cli
    echo -e "${GREEN}✅ Railway CLI instalado${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Generando secretos seguros...${NC}"

# Generar secretos
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo -e "${GREEN}✅ Secretos generados${NC}"
echo ""
echo -e "${YELLOW}📋 Guarda estos secretos (los necesitarás en Railway):${NC}"
echo ""
echo -e "${BLUE}JWT_SECRET=${NC}"
echo "$JWT_SECRET"
echo ""
echo -e "${BLUE}JWT_REFRESH_SECRET=${NC}"
echo "$JWT_REFRESH_SECRET"
echo ""

# Crear archivo temporal con las variables
cat > .env.railway << EOF
# Copia estas variables a Railway Dashboard

# === REQUERIDAS ===
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
NODE_ENV=production

# === CONFIGURAR ===
CORS_ORIGIN=https://tu-app.up.railway.app

# === OPCIONAL ===
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=noreply@tu-comunidad.com
EOF

echo -e "${GREEN}✅ Archivo .env.railway creado con tus secretos${NC}"
echo ""

echo -e "${YELLOW}🚀 Próximos pasos:${NC}"
echo ""
echo "1️⃣  Sube tu código a GitHub:"
echo -e "   ${BLUE}git push origin main${NC}"
echo ""
echo "2️⃣  Ve a Railway: ${BLUE}https://railway.app${NC}"
echo "   - Start New Project"
echo "   - Deploy from GitHub repo"
echo "   - Selecciona tu repositorio"
echo ""
echo "3️⃣  Añade PostgreSQL:"
echo "   - Click '+ New'"
echo "   - Database → PostgreSQL"
echo ""
echo "4️⃣  Configura variables (copia desde .env.railway):"
echo "   - Ve a tu servicio → Variables"
echo "   - Añade las variables del archivo .env.railway"
echo ""
echo "5️⃣  Espera el deploy (2-3 minutos)"
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  📚 Documentación completa: RAILWAY_DEPLOY.md        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
