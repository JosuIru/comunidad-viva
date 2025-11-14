#!/bin/bash
# Script para corregir acceso a propiedades Prisma

cd packages/backend/src

echo "Corrigiendo acceso a propiedades Prisma..."

# Patrones comunes que necesitamos ajustar
# Nota: Estos reemplazos son cuidadosos para no romper código legítimo

# .user. -> .User.
find . -name "*.ts" -type f -exec sed -i 's/\.user\./\.User\./g' {} \;
echo "  - .user. → .User."

# .offer. -> .Offer.
find . -name "*.ts" -type f -exec sed -i 's/\.offer\./\.Offer\./g' {} \;
echo "  - .offer. → .Offer."

# .requester. -> .Requester.
find . -name "*.ts" -type f -exec sed -i 's/\.requester\./\.Requester\./g' {} \;
echo "  - .requester. → .Requester."

# .provider. -> .Provider.
find . -name "*.ts" -type f -exec sed -i 's/\.provider\./\.Provider\./g' {} \;
echo "  - .provider. → .Provider."

# .reactions. -> .Reaction.
find . -name "*.ts" -type f -exec sed -i 's/\.reactions\./\.Reaction\./g' {} \;
echo "  - .reactions. → .Reaction."

# transaction.user (sin punto después) pero con cuidado
find . -name "*.ts" -type f -exec sed -i 's/\(transaction\|stored\w*\|token\)\.user\([^a-zA-Z]\)/\1.User\2/g' {} \;
echo "  - transaction.user → transaction.User"

echo "✓ Correcciones de propiedades aplicadas"
