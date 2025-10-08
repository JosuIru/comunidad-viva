# 🏷️ GitHub Labels - Guía de Uso

Este documento lista los labels recomendados para organizar issues y PRs.

## 📋 Cómo crear los labels

Puedes crear estos labels manualmente en GitHub o usar el siguiente script:

```bash
# Requiere GitHub CLI (gh)
gh label create "good first issue" --color "7057ff" --description "Perfecto para empezar a contribuir"
gh label create "help wanted" --color "008672" --description "Se necesita ayuda externa"
gh label create "beginner friendly" --color "0e8a16" --description "Fácil de resolver para principiantes"
```

## 🎯 Labels por Tipo

### Tipo de Issue
- `bug` 🐛 (d73a4a) - Algo no funciona correctamente
- `enhancement` ✨ (a2eeef) - Nueva funcionalidad o mejora
- `question` ❓ (d876e3) - Pregunta o consulta
- `documentation` 📚 (0075ca) - Mejoras en documentación
- `refactor` ♻️ (fbca04) - Refactorización de código

### Prioridad
- `priority: critical` 🔥 (b60205) - Crítico, necesita atención inmediata
- `priority: high` 🔴 (d93f0b) - Alta prioridad
- `priority: medium` 🟡 (fbca04) - Prioridad media
- `priority: low` 🟢 (0e8a16) - Prioridad baja

### Estado
- `status: in progress` 🚧 (c2e0c6) - En desarrollo
- `status: blocked` 🚫 (e99695) - Bloqueado por dependencias
- `status: needs review` 👀 (bfd4f2) - Necesita revisión
- `status: on hold` ⏸️ (ededed) - En pausa temporalmente

### Área
- `area: backend` 🔧 (1d76db) - Backend / NestJS
- `area: frontend` 🎨 (e99695) - Frontend / Next.js
- `area: database` 💾 (5319e7) - Base de datos / Prisma
- `area: devops` 🐳 (0052cc) - Docker / CI/CD
- `area: hybrid-system` 🔄 (006b75) - Sistema híbrido de capas
- `area: gamification` 🎮 (ff69b4) - Gamificación viral
- `area: governance` 🏛️ (800080) - Gobernanza / PoH
- `area: i18n` 🌍 (84b6eb) - Internacionalización

### Ayuda
- `good first issue` 🌟 (7057ff) - Perfecto para empezar
- `help wanted` 🆘 (008672) - Se necesita ayuda
- `beginner friendly` 👶 (0e8a16) - Fácil para principiantes

### Dependencias
- `dependencies` 📦 (0366d6) - Actualización de dependencias
- `automated` 🤖 (ededed) - PR automático (dependabot)

### Breaking Changes
- `breaking change` 💥 (e11d21) - Rompe compatibilidad

### Otros
- `wontfix` ⛔ (ffffff) - No se va a arreglar
- `duplicate` 📋 (cfd3d7) - Duplicado de otro issue
- `invalid` ❌ (e4e669) - No es válido o relevante
- `security` 🔒 (ee0701) - Relacionado con seguridad

## 🎨 Colores Sugeridos

| Color | Hex | Uso |
|-------|-----|-----|
| 🔴 Rojo | `#d73a4a` | Bugs, crítico |
| 🟠 Naranja | `#d93f0b` | Alta prioridad |
| 🟡 Amarillo | `#fbca04` | Media prioridad |
| 🟢 Verde | `#0e8a16` | Baja prioridad, beginner |
| 🔵 Azul | `#0075ca` | Documentación, info |
| 🟣 Púrpura | `#7057ff` | Good first issue |
| 🟤 Marrón | `#a2eeef` | Enhancement |
| ⚫ Gris | `#ededed` | Automated, on hold |

## 📊 Uso Recomendado

### Para Issues
```
bug + area:backend + priority:high
enhancement + area:frontend + help wanted
question + area:hybrid-system
good first issue + beginner friendly
```

### Para PRs
```
enhancement + area:gamification + status:needs review
bug fix + area:database + priority:critical
documentation + area:i18n
refactor + area:backend + status:in progress
```

## 🔄 Automatización

Considera usar GitHub Actions para:
- Auto-label PRs según archivos modificados
- Auto-label issues según palabras clave
- Auto-cerrar issues stale
- Auto-assignar reviewers

### Ejemplo de Action para auto-label

```yaml
name: Auto Label
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

## 📝 Crear todos los labels con un script

```bash
#!/bin/bash

# Script para crear todos los labels recomendados
# Requiere GitHub CLI: brew install gh

# Tipo
gh label create "bug" --color "d73a4a" --description "Algo no funciona correctamente" --force
gh label create "enhancement" --color "a2eeef" --description "Nueva funcionalidad o mejora" --force
gh label create "question" --color "d876e3" --description "Pregunta o consulta" --force
gh label create "documentation" --color "0075ca" --description "Mejoras en documentación" --force
gh label create "refactor" --color "fbca04" --description "Refactorización de código" --force

# Prioridad
gh label create "priority: critical" --color "b60205" --description "Crítico, atención inmediata" --force
gh label create "priority: high" --color "d93f0b" --description "Alta prioridad" --force
gh label create "priority: medium" --color "fbca04" --description "Prioridad media" --force
gh label create "priority: low" --color "0e8a16" --description "Prioridad baja" --force

# Estado
gh label create "status: in progress" --color "c2e0c6" --description "En desarrollo" --force
gh label create "status: blocked" --color "e99695" --description "Bloqueado" --force
gh label create "status: needs review" --color "bfd4f2" --description "Necesita revisión" --force
gh label create "status: on hold" --color "ededed" --description "En pausa" --force

# Área
gh label create "area: backend" --color "1d76db" --description "Backend / NestJS" --force
gh label create "area: frontend" --color "e99695" --description "Frontend / Next.js" --force
gh label create "area: database" --color "5319e7" --description "Base de datos / Prisma" --force
gh label create "area: devops" --color "0052cc" --description "Docker / CI/CD" --force
gh label create "area: hybrid-system" --color "006b75" --description "Sistema híbrido" --force
gh label create "area: gamification" --color "ff69b4" --description "Gamificación" --force
gh label create "area: governance" --color "800080" --description "Gobernanza / PoH" --force
gh label create "area: i18n" --color "84b6eb" --description "Internacionalización" --force

# Ayuda
gh label create "good first issue" --color "7057ff" --description "Perfecto para empezar" --force
gh label create "help wanted" --color "008672" --description "Se necesita ayuda" --force
gh label create "beginner friendly" --color "0e8a16" --description "Fácil para principiantes" --force

# Dependencias
gh label create "dependencies" --color "0366d6" --description "Actualización de dependencias" --force
gh label create "automated" --color "ededed" --description "PR automático" --force

# Otros
gh label create "breaking change" --color "e11d21" --description "Rompe compatibilidad" --force
gh label create "wontfix" --color "ffffff" --description "No se va a arreglar" --force
gh label create "duplicate" --color "cfd3d7" --description "Duplicado" --force
gh label create "invalid" --color "e4e669" --description "No válido" --force
gh label create "security" --color "ee0701" --description "Seguridad" --force

echo "✅ Labels creados exitosamente!"
```

Guarda el script como `create-labels.sh`, dale permisos de ejecución y ejecútalo:

```bash
chmod +x create-labels.sh
./create-labels.sh
```
