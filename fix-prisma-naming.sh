#!/bin/bash
# Script para corregir nombres de relaciones Prisma de camelCase a PascalCase

cd packages/backend/src

echo "Corrigiendo nombres de relaciones Prisma..."

# Función para hacer reemplazo seguro
safe_replace() {
    local pattern="$1"
    local replacement="$2"
    local description="$3"

    echo "  - $description"
    find . -name "*.ts" -type f -exec sed -i "s/$pattern/$replacement/g" {} \;
}

# Corregir include: { relationName: true }
safe_replace "user: true" "User: true" "user → User"
safe_replace "offer: true" "Offer: true" "offer → Offer"
safe_replace "skill: true" "Skill: true" "skill → Skill"
safe_replace "skills: true" "Skill: true" "skills → Skill"
safe_replace "badges: true" "Badge: true" "badges → Badge"
safe_replace "reactions: true" "Reaction: true" "reactions → Reaction"
safe_replace "requester: true" "Requester: true" "requester → Requester"
safe_replace "provider: true" "Provider: true" "provider → Provider"
safe_replace "event: true" "Event: true" "event → Event"
safe_replace "groupBuy: true" "GroupBuy: true" "groupBuy → GroupBuy"
safe_replace "priceBreaks: true" "PriceBreak: true" "priceBreaks → PriceBreak"
safe_replace "participants: true" "Participant: true" "participants → Participant"
safe_replace "completions: true" "Completion: true" "completions → Completion"
safe_replace "community: true" "Community: true" "community → Community"

# Corregir orderBy: { relation: { ... } }
safe_replace "orderBy: { offer:" "orderBy: { Offer:" "orderBy offer → Offer"
safe_replace "orderBy: { user:" "orderBy: { User:" "orderBy user → User"

# Corregir where: { relation: { ... } }
safe_replace "where: { offer:" "where: { Offer:" "where offer → Offer"
safe_replace "where: { skill:" "where: { Skill:" "where skill → Skill"

echo "✓ Correcciones aplicadas"
echo ""
echo "Archivos modificados:"
git diff --name-only | head -20
