# 🚀 Quick Start - Comunidad Viva

Guía rápida para empezar a usar Comunidad Viva y sus últimas funcionalidades.

## ⚡ Inicio Rápido (5 minutos)

### 1. Levantar el Proyecto

```bash
# Clonar repositorio
git clone <repository-url>
cd comunidad-viva

# Instalar dependencias
make install

# Levantar entorno de desarrollo
make dev
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api/docs

### 2. Poblar Base de Datos

```bash
# Ejecutar migraciones y seed
make migrate
make seed
```

### 3. Registrarse

```bash
# Opción 1: Usar el frontend
# Ir a http://localhost:3000/auth/register

# Opción 2: Usar curl
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@consensus.local",
    "password": "Password123!",
    "name": "Usuario Test"
  }'
```

---

## 🌟 Nuevas Funcionalidades (v2.0)

### 1. Sistema Híbrido de Capas Económicas

**¿Qué es?**
Un sistema revolucionario que permite 3 paradigmas económicos coexistiendo:

- **TRADITIONAL:** Capitalismo clásico (€ + créditos)
- **TRANSITIONAL:** Pay-it-forward (economía de regalo gradual)
- **GIFT_PURE:** Economía de regalo pura, post-dinero, anónima
- **CHAMELEON:** Modo experimental

**Probar en 30 segundos:**

```bash
# 1. Login
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@consensus.local","password":"Password123!"}' \
  | jq -r '.access_token')

# 2. Ver capa actual
curl http://localhost:4000/hybrid/layer \
  -H "Authorization: Bearer $TOKEN"

# 3. Migrar a TRANSITIONAL
curl -X POST http://localhost:4000/hybrid/migrate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newLayer":"TRANSITIONAL","reason":"Quiero experimentar"}'

# 4. Ver estadísticas de la comunidad
curl http://localhost:4000/hybrid/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Frontend:**
Ve a `/hybrid/dashboard` para ver tu capa y migrar visualmente.

---

### 2. Gamificación Viral

**Funcionalidades:**
- ✅ Onboarding gamificado (5 pasos, recompensas)
- ✅ Flash deals (ofertas relámpago)
- ✅ Stories 24h (contenido efímero)
- ✅ Swipe & Match (tipo Tinder para ofertas)
- ✅ Challenges semanales + Leaderboard
- ✅ Sistema de referidos con códigos
- ✅ Niveles y XP (10 niveles)
- ✅ Streaks (rachas de actividad)
- ✅ Happy Hour (créditos dobles)

**Probar en 30 segundos:**

```bash
# Ver flash deals activos
curl http://localhost:4000/viral-features/flash-deals/active \
  -H "Authorization: Bearer $TOKEN"

# Ver reto semanal
curl http://localhost:4000/viral-features/challenges/weekly \
  -H "Authorization: Bearer $TOKEN"

# Ver leaderboard
curl http://localhost:4000/viral-features/challenges/leaderboard \
  -H "Authorization: Bearer $TOKEN"

# Obtener código de referido
curl http://localhost:4000/viral-features/referrals/code \
  -H "Authorization: Bearer $TOKEN"

# Ver progreso de nivel
curl http://localhost:4000/viral-features/levels/progress \
  -H "Authorization: Bearer $TOKEN"

# Ver racha actual
curl http://localhost:4000/viral-features/streaks \
  -H "Authorization: Bearer $TOKEN"
```

**Frontend:**
- `/onboarding` - Tutorial interactivo
- `/flash-deals` - Ofertas relámpago
- `/swipe` - Descubrir ofertas tipo Tinder
- `/challenges` - Retos y clasificación
- `/level` - Progreso y perks

---

### 3. Gobernanza Descentralizada (Proof of Help)

**¿Qué es?**
Sistema de consenso donde "minar" = ayudar a otros. Inspirado en Bitcoin pero para bien común.

**Conceptos clave:**
- 🤝 **Proof of Help (PoH):** Consenso basado en ayuda mutua
- ⛓️ **Trust Chain:** Blockchain local de ayudas verificadas
- 🏆 **Reputación:** Ganas privilegios ayudando
- 🗳️ **Votación Cuadrática:** Evita que pocos dominen las decisiones

**Probar en 30 segundos:**

```bash
# Ver mi reputación
curl http://localhost:4000/consensus/reputation \
  -H "Authorization: Bearer $TOKEN"

# Crear propuesta (requiere reputación 20+)
curl -X POST http://localhost:4000/consensus/proposals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FEATURE",
    "title": "Mercadillo mensual",
    "description": "Propongo organizar un mercadillo de trueque cada mes",
    "requiredBudget": 0,
    "implementationPlan": "Reservar plaza, publicitar, organizar puestos"
  }'

# Ver propuestas activas
curl http://localhost:4000/consensus/proposals?status=VOTING \
  -H "Authorization: Bearer $TOKEN"

# Votar propuesta (votación cuadrática)
curl -X POST http://localhost:4000/consensus/proposals/PROPOSAL_ID/vote \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"points": 5}'
```

**Frontend:**
- `/governance/proposals` - Ver y crear propuestas
- `/governance/moderation` - Moderación comunitaria
- `/governance/reputation` - Tu reputación y privilegios

---

## 🎯 Flujos de Usuario Principales

### Flujo 1: Nuevo Usuario → Primera Oferta

1. **Registro** → `/auth/register`
2. **Onboarding gamificado** → `/onboarding` (gana 50 créditos)
3. **Unirse a comunidad** → `/communities` + Join
4. **Crear primera oferta** → `/offers/new`
5. **Recibir interesados** → Notificación + `/messages`

### Flujo 2: Participar en Economía de Regalo

1. **Ver capa actual** → `/hybrid/dashboard`
2. **Migrar a GIFT_PURE** → Botón "Migrar"
3. **Compartir abundancia** → `/hybrid/abundance/share`
4. **Ver necesidades** → `/hybrid/needs`
5. **Celebrar** → `/hybrid/celebrations`

### Flujo 3: Crear Propuesta Comunitaria

1. **Ganar reputación** → Ayudar a 20 personas (banco de tiempo)
2. **Crear propuesta** → `/governance/proposals/new`
3. **Fase de discusión** → 3 días (comentarios)
4. **Votación** → 4 días (votación cuadrática)
5. **Aprobación** → Si alcanza threshold (10% usuarios activos)

### Flujo 4: Gamificación - Subir de Nivel

1. **Completar onboarding** → +50 XP
2. **Crear ofertas** → +10 XP cada una
3. **Ayudar vecinos** → +20 XP por hora
4. **Completar retos** → +100 XP
5. **Mantener racha** → Multiplicador ×1.5
6. **Subir nivel** → Desbloquear perks

---

## 📊 Endpoints Más Usados

### Autenticación
```bash
POST   /auth/register              # Registro
POST   /auth/login                 # Login
GET    /auth/me                    # Usuario actual
```

### Sistema Híbrido
```bash
GET    /hybrid/layer               # Mi capa económica
POST   /hybrid/migrate             # Migrar de capa
GET    /hybrid/stats               # Estadísticas
POST   /hybrid/abundance           # Compartir (GIFT)
GET    /hybrid/needs               # Ver necesidades
```

### Gamificación
```bash
GET    /viral-features/flash-deals/active       # Flash deals
GET    /viral-features/challenges/weekly        # Reto semanal
GET    /viral-features/challenges/leaderboard   # Clasificación
GET    /viral-features/referrals/code           # Código referido
GET    /viral-features/levels/progress          # Nivel y XP
GET    /viral-features/streaks                  # Racha
```

### Gobernanza
```bash
GET    /consensus/reputation                    # Reputación
POST   /consensus/proposals                     # Crear propuesta
GET    /consensus/proposals                     # Listar propuestas
POST   /consensus/proposals/:id/vote            # Votar
```

### Core
```bash
GET    /offers                     # Listar ofertas
POST   /offers                     # Crear oferta
GET    /events                     # Listar eventos
POST   /events/:id/attend          # Confirmar asistencia
POST   /timebank/transactions      # Registrar ayuda
GET    /communities                # Listar comunidades
```

---

## 🔧 Admin Tools

Para ejecutar tareas cron manualmente (mientras ScheduleModule está deshabilitado):

```bash
# Crear flash deals
curl -X POST http://localhost:4000/admin/create-flash-deals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Activar happy hour
curl -X POST http://localhost:4000/admin/activate-happy-hour \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Crear reto semanal
curl -X POST http://localhost:4000/admin/create-weekly-challenge \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Limpiar stories expiradas
curl -X POST http://localhost:4000/admin/clean-expired-stories \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Reiniciar acciones diarias
curl -X POST http://localhost:4000/admin/reset-daily-actions \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Actualizar rachas
curl -X POST http://localhost:4000/admin/update-streaks \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 📚 Documentación Completa

- **[README.md](README.md)** - Documentación general del proyecto
- **[API_REFERENCE.md](API_REFERENCE.md)** - Referencia completa de API (~120 endpoints)
- **[CHANGELOG.md](CHANGELOG.md)** - Historial de cambios e implementaciones
- **[Sistema Híbrido](packages/backend/src/hybrid/README.md)** - Guía del sistema de capas económicas
- **[Gobernanza](CONSENSUS_GOVERNANCE_GUIDE.md)** - Proof of Help y consenso
- **[Swagger UI](http://localhost:4000/api/docs)** - Documentación interactiva

---

## 🐛 Troubleshooting

### El backend no inicia

```bash
# Verificar si hay procesos bloqueando el puerto 4000
lsof -ti:4000

# Matar procesos duplicados
lsof -ti:4000 | xargs kill -9

# Reiniciar
cd packages/backend && npm run dev
```

### Error "Network error" en frontend

```bash
# Verificar que el backend esté corriendo
curl http://localhost:4000/health

# Si no responde, revisar logs
cd packages/backend && npm run dev
```

### "TypeError: Cannot read properties of null"

Ya está corregido en la última versión. Si persiste:

```bash
git pull
cd packages/web
npm install
npm run dev
```

### Problema con Prisma

```bash
# Regenerar cliente
cd packages/backend
npx prisma generate

# Si hay conflictos de schema
npx prisma db push --force-reset
npx prisma db seed
```

---

## 🚀 Siguientes Pasos

1. **Explora el Frontend:**
   - Ve a http://localhost:3000
   - Completa el onboarding
   - Crea tu primera oferta
   - Únete a una comunidad

2. **Prueba la API:**
   - Abre Swagger: http://localhost:4000/api/docs
   - Prueba endpoints interactivamente
   - Lee API_REFERENCE.md para ejemplos

3. **Experimenta con Capas:**
   - Migra a TRANSITIONAL
   - Comparte abundancia en GIFT_PURE
   - Crea un bridge event experimental

4. **Participa en Gobernanza:**
   - Gana reputación ayudando
   - Crea una propuesta
   - Vota en propuestas activas

5. **Sube de Nivel:**
   - Completa retos semanales
   - Mantén tu racha activa
   - Refiere amigos

---

## 💡 Tips

- **Créditos gratis:** Completa onboarding, retos, referidos
- **Sube rápido de nivel:** Mantén racha + happy hour
- **Gana reputación:** Ayuda en banco de tiempo + valida ayudas
- **Descuentos:** Flash deals + happy hour = máximo ahorro
- **Experimenta gratis:** Usa CHAMELEON para probar capas

---

**¡Bienvenido a Comunidad Viva! 🌱**

*La red social de economía colaborativa que combina lo mejor del capitalismo, la transición y el regalo puro.*
