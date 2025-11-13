#!/bin/bash

# Script para configurar variables de entorno en Railway
# Ejecuta: railway variables set KEY=VALUE

echo "=== Configurando Variables de Entorno en Railway ==="
echo ""
echo "IMPORTANTE: Asegúrate de tener Railway CLI instalado y autenticado"
echo "Instalar: npm i -g @railway/cli"
echo "Autenticar: railway login"
echo ""

# Verificar si railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado"
    echo "Instálalo con: npm i -g @railway/cli"
    exit 1
fi

echo "✓ Railway CLI detectado"
echo ""

# Leer las variables del archivo .env.railway
JWT_SECRET="0rcvF0NJr8gA3CcmfDMlw9VungUQhgw2LHXmZxaCzzI="
JWT_REFRESH_SECRET="N8Sv+BNiF9hXoSRJhSXV7FtFi5W7rZjREr0+qRpst0A="
NODE_ENV="production"

echo "📝 Variables a configurar:"
echo "  - JWT_SECRET"
echo "  - JWT_REFRESH_SECRET"
echo "  - NODE_ENV"
echo ""

read -p "¿Continuar? (s/n): " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "Cancelado"
    exit 0
fi

echo ""
echo "⚙️  Configurando variables..."

# Configurar variables en Railway
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET"
railway variables set NODE_ENV="$NODE_ENV"

echo ""
echo "✅ Variables configuradas exitosamente!"
echo ""
echo "📌 Notas:"
echo "  - DATABASE_URL debería estar configurado automáticamente por Railway"
echo "  - Puedes verificar las variables con: railway variables"
echo "  - El servicio se redesplegarรก automáticamente"
echo ""
echo "🌐 Para configurar CORS después de obtener tu URL:"
echo "  railway variables set CORS_ORIGIN=https://tu-servicio.up.railway.app"
