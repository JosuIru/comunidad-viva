#!/bin/bash

###############################################################################
# Script para Preparar Archivos para Subir a Servidor Compartido
#
# Este script crea un archivo .tar.gz con todos los archivos necesarios
# para desplegar en un servidor compartido sin Docker.
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Banner
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Preparar para Servidor Compartido  ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    log_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Variables
DATE=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="./release"
ARCHIVE_NAME="truk-$DATE.tar.gz"

# Crear directorio de salida
log_info "Creando directorio de salida..."
mkdir -p "$OUTPUT_DIR"
log_success "Directorio creado: $OUTPUT_DIR"

# Crear archivo temporal con lista de archivos a incluir
log_info "Preparando lista de archivos..."
cat > /tmp/truk-files.txt << 'EOF'
packages/backend/src/
packages/backend/prisma/
packages/backend/package.json
packages/backend/package-lock.json
packages/backend/tsconfig.json
packages/backend/nest-cli.json
packages/backend/.eslintrc.js
packages/backend/.env.example
packages/backend/README.md

packages/web/src/
packages/web/public/
packages/web/messages/
packages/web/package.json
packages/web/package-lock.json
packages/web/tsconfig.json
packages/web/next.config.js
packages/web/tailwind.config.js
packages/web/postcss.config.js
packages/web/.eslintrc.json
packages/web/.env.example
packages/web/i18n.ts
packages/web/README.md

scripts/
.env.example
package.json
package-lock.json
README.md
DEPLOYMENT_SHARED_HOSTING.md
DEPLOYMENT_GUIDE.md
PRODUCTION_READY.md
CHANGELOG.md
CONTRIBUTING.md
SECURITY.md
ecosystem.config.js
EOF

# Crear ecosystem.config.js si no existe
if [ ! -f "ecosystem.config.js" ]; then
    log_info "Creando ecosystem.config.js..."
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'truk-backend',
      cwd: './packages/backend',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
    {
      name: 'truk-frontend',
      cwd: './packages/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
  ],
};
EOF
    log_success "ecosystem.config.js creado"
fi

# Crear archivo tar.gz
log_info "Comprimiendo archivos (esto puede tardar unos minutos)..."
tar -czf "$OUTPUT_DIR/$ARCHIVE_NAME" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='uploads' \
    --exclude='coverage' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='*.tsbuildinfo' \
    --exclude='.turbo' \
    --exclude='.vercel' \
    -T /tmp/truk-files.txt 2>/dev/null || \
tar -czf "$OUTPUT_DIR/$ARCHIVE_NAME" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='uploads' \
    --exclude='coverage' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='*.tsbuildinfo' \
    --exclude='.turbo' \
    --exclude='.vercel' \
    packages/ \
    scripts/ \
    .env.example \
    package.json \
    package-lock.json \
    README.md \
    DEPLOYMENT_SHARED_HOSTING.md \
    DEPLOYMENT_GUIDE.md \
    PRODUCTION_READY.md \
    CHANGELOG.md \
    CONTRIBUTING.md \
    SECURITY.md \
    ecosystem.config.js \
    2>/dev/null

log_success "Archivo comprimido creado"

# Mostrar información del archivo
FILE_SIZE=$(du -h "$OUTPUT_DIR/$ARCHIVE_NAME" | cut -f1)
log_info "Tamaño del archivo: $FILE_SIZE"

# Crear archivo de instrucciones
log_info "Creando archivo de instrucciones..."
cat > "$OUTPUT_DIR/INSTRUCCIONES.txt" << 'EOF'
═══════════════════════════════════════════════════════════════
  INSTRUCCIONES DE INSTALACIÓN - TRUK (Servidor Compartido)
═══════════════════════════════════════════════════════════════

📦 Archivo preparado para subir a servidor compartido sin Docker

🚀 PASOS RÁPIDOS:

1. SUBIR ARCHIVOS AL SERVIDOR
   - Sube el archivo .tar.gz a tu servidor (vía FTP/SFTP/cPanel)
   - Ubicación sugerida: ~/public_html/truk o ~/apps/truk

2. DESCOMPRIMIR
   ssh tuusuario@tuservidor.com
   cd ~/public_html  # o tu directorio
   tar -xzf truk-*.tar.gz
   mv truk-* truk  # renombrar al nombre sin fecha
   cd truk

3. INSTALAR DEPENDENCIAS
   npm install
   cd packages/backend && npm install && cd ../..
   cd packages/web && npm install && cd ../..

4. CONFIGURAR BASE DE DATOS
   - Crea base de datos PostgreSQL en tu panel de control
   - Anota: host, puerto, nombre DB, usuario, contraseña

5. CONFIGURAR VARIABLES DE ENTORNO

   Backend:
   cd packages/backend
   cp .env.example .env
   nano .env  # Edita con tus datos reales

   Frontend:
   cd packages/web
   cp .env.example .env.local
   nano .env.local  # Edita con tus datos reales

6. GENERAR JWT SECRET
   openssl rand -base64 64
   # Copia el resultado en JWT_SECRET en .env del backend

7. PREPARAR BASE DE DATOS
   cd packages/backend
   npx prisma generate
   npx prisma migrate deploy
   npm run seed  # Opcional: datos de ejemplo

8. COMPILAR APLICACIÓN
   cd packages/backend
   npm run build

   cd ../web
   npm run build

9. INSTALAR PM2 (Gestor de Procesos)
   npm install -g pm2
   # O si no tienes permisos globales:
   npm install pm2 --save-dev

10. INICIAR APLICACIÓN
    cd ~/truk
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup  # Sigue las instrucciones que muestre

11. CONFIGURAR NGINX/APACHE
    Ver guía completa en: DEPLOYMENT_SHARED_HOSTING.md

12. CONFIGURAR SSL
    sudo certbot --nginx -d tudominio.com
    # O usa AutoSSL en cPanel

═══════════════════════════════════════════════════════════════

📚 DOCUMENTACIÓN COMPLETA:
   - DEPLOYMENT_SHARED_HOSTING.md  (Guía paso a paso detallada)
   - DEPLOYMENT_GUIDE.md            (Guía general de despliegue)
   - PRODUCTION_READY.md            (Checklist de producción)
   - README.md                      (Documentación del proyecto)

🆘 PROBLEMAS COMUNES:

   Backend no inicia:
   pm2 logs truk-backend

   Frontend no inicia:
   pm2 logs truk-frontend

   Error de base de datos:
   Verifica DATABASE_URL en packages/backend/.env

   Módulos no encontrados:
   rm -rf node_modules && npm install

═══════════════════════════════════════════════════════════════

⚠️  IMPORTANTE - ANTES DE DESPLEGAR:

   ✓ Cambia TODAS las contraseñas por defecto
   ✓ Genera JWT_SECRET seguro
   ✓ Configura URLs correctas en .env
   ✓ Verifica que PostgreSQL esté accesible
   ✓ Configura SSL/HTTPS
   ✓ Configura backups automáticos

═══════════════════════════════════════════════════════════════

✅ VERIFICAR INSTALACIÓN:

   Health checks:
   curl http://localhost:4000/health
   curl http://localhost:3000/api/health

   Ver logs:
   pm2 logs

   Estado de procesos:
   pm2 list

═══════════════════════════════════════════════════════════════

🎯 ACCESO A LA APLICACIÓN:

   Frontend: http://tudominio.com
   Backend API: http://tudominio.com/api
   API Docs: http://tudominio.com/api/docs

   Instalador gráfico (primera vez):
   http://tudominio.com/installer

═══════════════════════════════════════════════════════════════
EOF

log_success "Instrucciones creadas"

# Crear script de instalación rápida
log_info "Creando script de instalación rápida..."
cat > "$OUTPUT_DIR/install.sh" << 'EOF'
#!/bin/bash

# Script de instalación rápida para servidor
# Uso: bash install.sh

echo "🚀 Instalando Truk..."

# Verificar requisitos
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm no está instalado"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL no está instalado"; exit 1; }

echo "✅ Requisitos básicos cumplidos"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
cd packages/backend && npm install && cd ../..
cd packages/web && npm install && cd ../..

# Crear archivos .env si no existen
if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo "⚠️  IMPORTANTE: Edita packages/backend/.env con tus datos reales"
fi

if [ ! -f "packages/web/.env.local" ]; then
    cp packages/web/.env.example packages/web/.env.local
    echo "⚠️  IMPORTANTE: Edita packages/web/.env.local con tus datos reales"
fi

echo ""
echo "✅ Instalación base completada"
echo ""
echo "📝 PRÓXIMOS PASOS:"
echo "1. Edita packages/backend/.env con tus datos de base de datos"
echo "2. Genera JWT_SECRET: openssl rand -base64 64"
echo "3. Ejecuta: cd packages/backend && npx prisma migrate deploy"
echo "4. Compila: npm run build (en backend y web)"
echo "5. Inicia: pm2 start ecosystem.config.js"
echo ""
echo "📚 Ver guía completa: DEPLOYMENT_SHARED_HOSTING.md"
EOF

chmod +x "$OUTPUT_DIR/install.sh"
log_success "Script de instalación creado"

# Crear README del release
cat > "$OUTPUT_DIR/README.txt" << EOF
TRUK - Release Package
=====================

Fecha: $(date)
Versión: 1.0.0
Archivo: $ARCHIVE_NAME

Contenido:
- Código fuente completo (backend + frontend)
- Scripts de despliegue
- Documentación completa
- Configuración PM2

Archivos en este directorio:
- $ARCHIVE_NAME         : Archivo comprimido con todo el código
- INSTRUCCIONES.txt     : Guía rápida de instalación
- install.sh            : Script de instalación automática
- README.txt            : Este archivo

Para instalar:
1. Sube $ARCHIVE_NAME a tu servidor
2. Descomprime: tar -xzf $ARCHIVE_NAME
3. Sigue las instrucciones en INSTRUCCIONES.txt
4. O ejecuta: bash install.sh

Documentación incluida en el archivo:
- DEPLOYMENT_SHARED_HOSTING.md (Guía para servidor compartido)
- DEPLOYMENT_GUIDE.md (Guía general)
- PRODUCTION_READY.md (Checklist)

Soporte:
- GitHub: https://github.com/JosuIru/comunidad-viva
- Documentación: Ver archivos .md incluidos
EOF

# Mostrar resumen
echo ""
echo "╔═══════════════════════════════════════╗"
echo "║     Preparación Completada            ║"
echo "╚═══════════════════════════════════════╝"
echo ""
log_success "Archivos preparados en: $OUTPUT_DIR"
echo ""
echo "📦 Archivos creados:"
echo "   • $ARCHIVE_NAME ($FILE_SIZE)"
echo "   • INSTRUCCIONES.txt"
echo "   • install.sh"
echo "   • README.txt"
echo ""
echo "🚀 Próximos pasos:"
echo ""
echo "   1. Sube $ARCHIVE_NAME a tu servidor"
echo ""
echo "   2. En tu servidor, ejecuta:"
echo "      tar -xzf $ARCHIVE_NAME"
echo "      cd truk"
echo "      bash install.sh"
echo ""
echo "   3. Sigue las instrucciones en INSTRUCCIONES.txt"
echo ""
echo "📚 Toda la documentación está incluida en el archivo"
echo ""

# Limpiar
rm -f /tmp/truk-files.txt

exit 0
