# 🏗️ Arquitectura del Sistema - Truk

Documentación técnica de la arquitectura completa del sistema.

## Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura General](#arquitectura-general)
- [Módulos Backend](#módulos-backend)
- [Base de Datos](#base-de-datos)
- [Frontend](#frontend)
- [Infraestructura](#infraestructura)
- [Flujo de Datos](#flujo-de-datos)

---

## Stack Tecnológico

### Backend
- **Framework:** NestJS 10.x (Node.js + TypeScript)
- **ORM:** Prisma 5.x
- **Base de Datos:** PostgreSQL 15
- **Caché:** Redis 7
- **Autenticación:** JWT (Passport.js)
- **Validación:** class-validator + class-transformer
- **Documentación:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Formularios:** React Hook Form
- **Internacionalización:** next-intl
- **Notificaciones:** react-hot-toast

### Infraestructura
- **Contenedores:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions
- **Monitoreo:** Prometheus + Grafana
- **Logs:** Winston

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMUNIDAD VIVA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────┐         ┌──────────────────┐            │
│  │  Frontend (Next)  │◄───────►│  Backend (Nest)  │            │
│  │  Port: 3000       │   HTTP  │  Port: 4000      │            │
│  └───────────────────┘         └──────────────────┘            │
│           │                             │                       │
│           │                             │                       │
│           ▼                             ▼                       │
│  ┌───────────────────┐         ┌──────────────────┐            │
│  │  Static Assets    │         │  PostgreSQL      │            │
│  │  (Images, etc)    │         │  Port: 5432      │            │
│  └───────────────────┘         └──────────────────┘            │
│                                         │                       │
│                                         ▼                       │
│                                 ┌──────────────────┐            │
│                                 │  Redis Cache     │            │
│                                 │  Port: 6379      │            │
│                                 └──────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │  Nginx Proxy   │
                     │  Port: 80/443  │
                     └────────────────┘
```

---

## Módulos Backend

El backend está organizado en módulos funcionales:

### Core Modules

#### 1. AuthModule
**Responsabilidad:** Autenticación y autorización

**Archivos:**
- `auth/auth.module.ts`
- `auth/auth.service.ts`
- `auth/auth.controller.ts`
- `auth/strategies/jwt.strategy.ts`
- `auth/guards/jwt-auth.guard.ts`

**Funcionalidades:**
- Registro de usuarios
- Login con JWT
- Refresh tokens
- Password reset

**Endpoints:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`

---

#### 2. UsersModule
**Responsabilidad:** Gestión de usuarios

**Archivos:**
- `users/users.module.ts`
- `users/users.service.ts`
- `users/users.controller.ts`

**Funcionalidades:**
- CRUD de perfiles
- Gestión de avatares
- Preferencias de usuario
- Búsqueda de usuarios

**Endpoints:**
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users/:id`

---

#### 3. CommunitiesModule
**Responsabilidad:** Gestión de comunidades

**Archivos:**
- `communities/communities.module.ts`
- `communities/communities.service.ts`
- `communities/communities.controller.ts`

**Funcionalidades:**
- Crear/editar comunidades
- Join/leave comunidad
- Roles y permisos
- Gobernanza comunitaria

**Endpoints:**
- `GET /communities`
- `POST /communities`
- `POST /communities/:id/join`
- `POST /communities/:id/leave`

---

### Economic Modules

#### 4. HybridLayerModule ⭐ NUEVO
**Responsabilidad:** Sistema híbrido de capas económicas

**Archivos:**
- `hybrid/hybrid-layer.module.ts`
- `hybrid/hybrid-layer.service.ts`
- `hybrid/hybrid-layer.controller.ts`
- `hybrid/dto/migrate-layer.dto.ts`
- `hybrid/dto/share-abundance.dto.ts`

**Funcionalidades:**
- Gestión de 4 capas económicas (TRADITIONAL, TRANSITIONAL, GIFT_PURE, CHAMELEON)
- Migración entre capas
- Compartir abundancia
- Expresar necesidades
- Bridge events
- Celebraciones
- Configuración por comunidad
- Analytics y métricas

**Endpoints:** 16 (ver API_REFERENCE.md)

**Paradigmas:**
1. **TRADITIONAL:** Capitalismo con precios
2. **TRANSITIONAL:** Pay-it-forward
3. **GIFT_PURE:** Economía de regalo pura
4. **CHAMELEON:** Experimental

---

#### 5. CreditsModule
**Responsabilidad:** Sistema de créditos locales

**Funcionalidades:**
- Transacciones de créditos
- Balance de usuarios
- Historial de transacciones
- Razones: TIME_BANK, REFERRAL, PURCHASE, etc.

---

#### 6. TimeBankModule
**Responsabilidad:** Banco de tiempo

**Funcionalidades:**
- Registrar horas de ayuda
- Balance de tiempo
- Skills tracking
- Validación de transacciones

---

#### 7. OffersModule
**Responsabilidad:** Sistema de ofertas

**Funcionalidades:**
- CRUD de ofertas
- 5 tipos: PRODUCT, SERVICE, TIME_BANK, GROUP_BUY, EVENT
- Marcar interés
- Contador de vistas
- Imágenes múltiples

---

#### 8. GroupBuysModule
**Responsabilidad:** Compras grupales

**Funcionalidades:**
- Crear compra grupal
- Join con cantidad
- Tracking de progreso
- Notificaciones cuando se alcanza meta

---

### Engagement Modules

#### 9. ViralFeaturesModule ⭐ NUEVO
**Responsabilidad:** Gamificación y engagement viral

**Archivos:**
- `engagement/viral-features.module.ts`
- `engagement/viral-features.service.ts`
- `engagement/viral-features.controller.ts`

**Sub-sistemas:**

1. **Onboarding Gamificado**
   - 5 pasos con recompensas
   - Tutorial interactivo
   - +50 créditos al completar

2. **Flash Deals**
   - Ofertas relámpago
   - Tiempo limitado (2-4h)
   - Cantidad limitada
   - Rotación automática

3. **Stories**
   - Contenido 24h
   - Auto-destrucción
   - Contador de vistas

4. **Swipe & Match**
   - Tipo Tinder para ofertas
   - Like/Dislike/Super Like
   - Algoritmo de recomendación

5. **Challenges**
   - Retos semanales
   - Leaderboard
   - Bonus para top 10

6. **Referidos**
   - Códigos únicos
   - Recompensas mutuas
   - Milestones

7. **Niveles y XP**
   - 10 niveles
   - Perks por nivel
   - Sistema de progresión

8. **Streaks**
   - Días consecutivos activos
   - Multiplicadores
   - Badges

9. **Happy Hour**
   - Créditos dobles
   - Períodos especiales

**Endpoints:** 32 (26 funcionales + 6 admin)

**Nota:** Requiere triggers manuales via endpoints admin mientras ScheduleModule está deshabilitado.

---

#### 10. EventsModule
**Responsabilidad:** Eventos comunitarios

**Funcionalidades:**
- Crear/gestionar eventos
- Asistencia (attend/unattend)
- Límite de asistentes
- Check-in
- Live events con gamificación

---

#### 11. SocialModule
**Responsabilidad:** Interacciones sociales

**Funcionalidades:**
- Posts y feed
- Likes y comentarios
- Menciones
- Hashtags

---

### Governance Modules

#### 12. ConsensusModule ⭐ NUEVO
**Responsabilidad:** Gobernanza descentralizada (Proof of Help)

**Archivos:**
- `consensus/consensus.module.ts`
- `consensus/proof-of-help.service.ts`
- `consensus/consensus.controller.ts`

**Sub-sistemas:**

1. **Proof of Help (PoH)**
   - Minería = ayudar a otros
   - Hash de trabajo social
   - Dificultad ajustable

2. **Trust Chain**
   - Blockchain local
   - 4 tipos de bloques: HELP, PROPOSAL, VALIDATION, DISPUTE
   - Inmutabilidad

3. **Reputación**
   - Cálculo automático
   - 3 niveles de privilegios
   - Multiplicadores de actividad

4. **Propuestas (CIPs)**
   - Community Improvement Proposals
   - Fase discusión (3 días)
   - Fase votación (4 días)
   - Votación cuadrática

5. **Moderación Descentralizada**
   - Mini-DAOs temporales
   - Jurado aleatorio
   - Consenso 66%

6. **Validación de Ayudas**
   - Consenso 2/3 validadores
   - Selección por proximidad + reputación
   - Recompensas por validar

**Modelos de DB:**
- TrustBlock
- BlockValidation
- Proposal
- ProposalVote
- ProposalComment
- ModerationDAO
- ModerationVote

---

### Utility Modules

#### 13. MessagesModule
**Responsabilidad:** Mensajería 1-a-1

#### 14. NotificationsModule
**Responsabilidad:** Push notifications

#### 15. AnalyticsModule
**Responsabilidad:** Métricas y analytics

#### 16. SearchModule
**Responsabilidad:** Búsqueda full-text

#### 17. ReviewsModule
**Responsabilidad:** Calificaciones y reviews

#### 18. UploadModule
**Responsabilidad:** Subida de archivos

#### 19. HealthModule
**Responsabilidad:** Health checks

#### 20. PostsModule
**Responsabilidad:** Sistema de posts

#### 21. ChallengesModule
**Responsabilidad:** Retos adicionales

#### 22. FlowEconomicsModule
**Responsabilidad:** Análisis de flujos económicos

---

## Base de Datos

### Esquema Prisma

**Total de modelos:** ~40

#### Core Models
- `User` - Usuarios del sistema
- `Community` - Comunidades
- `CommunityMember` - Membresías
- `EconomicLayer` - Capa económica del usuario
- `CommunityLayerConfig` - Configuración de capas por comunidad

#### Economic Models
- `Offer` - Ofertas (5 tipos)
- `GroupBuy` - Compras grupales
- `GroupBuyParticipant` - Participantes
- `CreditTransaction` - Transacciones de créditos
- `TimeBankTransaction` - Banco de tiempo
- `AbundanceShare` - Compartir abundancia (GIFT)
- `CommunityNeed` - Necesidades comunitarias (GIFT)
- `BridgeEvent` - Experimentos temporales
- `Celebration` - Celebraciones de abundancia

#### Engagement Models
- `OnboardingProgress` - Progreso de onboarding
- `FlashDeal` - Ofertas relámpago
- `Story` - Historias 24h
- `StoryView` - Vistas de stories
- `SwipeAction` - Swipes (like/dislike)
- `WeeklyChallenge` - Retos semanales
- `ChallengeProgress` - Progreso de retos
- `ReferralCode` - Códigos de referido
- `Referral` - Referidos
- `UserLevel` - Niveles y XP
- `UserStreak` - Rachas
- `DailyAction` - Acciones diarias
- `LiveEvent` - Eventos en vivo

#### Governance Models
- `TrustBlock` - Bloques de la trust chain
- `BlockValidation` - Validaciones de bloques
- `Proposal` - Propuestas (CIPs)
- `ProposalVote` - Votos en propuestas
- `ProposalComment` - Comentarios
- `ModerationDAO` - DAOs de moderación
- `ModerationVote` - Votos de moderación

#### Social Models
- `Post` - Posts del feed
- `PostLike` - Likes
- `PostComment` - Comentarios
- `Event` - Eventos
- `EventAttendee` - Asistentes
- `Message` - Mensajes 1-a-1
- `Notification` - Notificaciones
- `Review` - Reviews y calificaciones

#### Enums Clave
```prisma
enum EconomicLayer {
  TRADITIONAL
  TRANSITIONAL
  GIFT_PURE
  CHAMELEON
}

enum OfferType {
  PRODUCT
  SERVICE
  TIME_BANK
  GROUP_BUY
  EVENT
}

enum BlockType {
  HELP
  PROPOSAL
  VALIDATION
  DISPUTE
}

enum CreditReason {
  TIME_BANK_HOUR
  EVENT_ATTENDANCE
  LOCAL_PURCHASE
  REFERRAL
  ECO_ACTION
  OFFER_CREATED
  REVIEW
  ADMIN_GRANT
  ADMIN_DEDUCT
  PURCHASE
  DISCOUNT
  SERVICE
  EVENT_ACCESS
  ADJUSTMENT
  COMMUNITY_HELP
  DAILY_SEED
  SUPPORT_POST
  EXPIRATION
  SYSTEM_REWARD
}
```

### Relaciones Importantes

```
User
  ├─ 1:N → Offer
  ├─ 1:N → Post
  ├─ 1:N → Event
  ├─ 1:1 → EconomicLayer
  ├─ 1:1 → OnboardingProgress
  ├─ 1:1 → UserLevel
  ├─ 1:1 → UserStreak
  └─ N:M → Community (via CommunityMember)

Community
  ├─ 1:N → Offer
  ├─ 1:N → Event
  ├─ 1:N → Proposal
  ├─ 1:1 → CommunityLayerConfig
  └─ 1:N → BridgeEvent

Offer
  ├─ N:1 → User (owner)
  ├─ N:1 → Community
  └─ 1:N → SwipeAction

TrustBlock
  ├─ N:1 → User (actor)
  ├─ 1:N → BlockValidation
  └─ self-reference (previousHash)

Proposal
  ├─ N:1 → User (author)
  ├─ N:1 → Community
  ├─ 1:N → ProposalVote
  └─ 1:N → ProposalComment
```

---

## Frontend

### Estructura de Páginas

```
pages/
├── index.tsx                    # Landing page
├── auth/
│   ├── login.tsx
│   └── register.tsx
├── offers/
│   ├── index.tsx                # Lista de ofertas
│   ├── [id].tsx                 # Detalle de oferta
│   └── new.tsx                  # Crear oferta
├── events/
│   ├── index.tsx
│   ├── [id].tsx
│   └── new.tsx
├── communities/
│   ├── index.tsx
│   ├── [id].tsx
│   └── new.tsx
├── hybrid/
│   └── dashboard.tsx            # Dashboard de capas económicas
├── governance/
│   ├── proposals/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── moderation/
│   │   └── index.tsx
│   └── reputation/
│       └── index.tsx
├── viral/
│   ├── onboarding.tsx
│   ├── flash-deals.tsx
│   ├── swipe.tsx
│   ├── challenges.tsx
│   └── level.tsx
├── messages/
│   ├── index.tsx
│   └── [userId].tsx
└── profile/
    ├── [id].tsx
    └── edit.tsx
```

### Componentes Principales

```
components/
├── Layout.tsx                   # Layout principal
├── Navbar.tsx                   # Barra de navegación
├── Footer.tsx
├── offers/
│   ├── OfferCard.tsx
│   ├── OfferList.tsx
│   └── OfferForm.tsx
├── events/
│   ├── EventCard.tsx
│   └── EventList.tsx
├── hybrid/
│   ├── LayerSelector.tsx        # Selector de capa económica
│   ├── AbundanceForm.tsx
│   └── NeedsList.tsx
├── governance/
│   ├── ProposalCard.tsx
│   ├── VoteButton.tsx
│   └── ReputationBadge.tsx
└── viral/
    ├── FlashDealCard.tsx
    ├── StoryViewer.tsx
    ├── SwipeCard.tsx
    ├── LeaderboardTable.tsx
    └── ProgressBar.tsx
```

### State Management

**React Query (TanStack Query)**
- Caché automático de requests
- Revalidación en background
- Optimistic updates
- Paginación infinita

**Ejemplos de queries:**
```typescript
// Listar ofertas
useQuery(['offers', filters], () => api.get('/offers', { params: filters }))

// Detalle de oferta
useQuery(['offer', id], () => api.get(`/offers/${id}`))

// Mi capa económica
useQuery(['hybrid-layer'], () => api.get('/hybrid/layer'))

// Mi reputación
useQuery(['reputation'], () => api.get('/consensus/reputation'))
```

---

## Infraestructura

### Docker Compose

**Servicios:**

1. **Backend (nest-app)**
   - Puerto: 4000
   - Depends on: postgres, redis
   - Env vars: DATABASE_URL, JWT_SECRET, etc.

2. **Frontend (next-app)**
   - Puerto: 3000
   - Depends on: backend
   - Env vars: NEXT_PUBLIC_API_URL

3. **PostgreSQL**
   - Puerto: 5432
   - Volumen: postgres_data
   - Imagen: postgres:15

4. **Redis**
   - Puerto: 6379
   - Imagen: redis:7-alpine

5. **Nginx** (producción)
   - Puerto: 80, 443
   - Reverse proxy
   - SSL termination

6. **Prometheus** (opcional)
   - Puerto: 9090
   - Métricas

7. **Grafana** (opcional)
   - Puerto: 3001
   - Dashboards

### Deployment

**Desarrollo:**
```bash
docker-compose up
```

**Producción:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline

**GitHub Actions:**
1. **Test & Lint** - Ejecuta tests y linting
2. **Security Scan** - Trivy para escaneo de vulnerabilidades
3. **Build Images** - Build de imágenes Docker
4. **Push to Registry** - Push a Docker Hub/GHCR
5. **Deploy** - Deploy automático a servidor de producción

---

## Flujo de Datos

### Flujo de Autenticación

```
1. Usuario → POST /auth/login
2. Backend valida credenciales
3. Backend genera JWT token
4. Frontend guarda token en localStorage
5. Frontend incluye token en header Authorization
6. JwtAuthGuard valida token en cada request
```

### Flujo de Creación de Oferta

```
1. Usuario completa formulario → POST /offers
2. OffersController recibe request
3. JwtAuthGuard valida token
4. class-validator valida DTO
5. OffersService crea oferta en DB
6. Si tiene imágenes → Upload Service
7. Respuesta con oferta creada
8. Frontend invalida cache de React Query
9. Lista de ofertas se actualiza automáticamente
```

### Flujo de Migración de Capa Económica

```
1. Usuario selecciona nueva capa → POST /hybrid/migrate
2. HybridLayerController recibe request
3. HybridLayerService verifica condiciones
4. Crea registro en EconomicLayer
5. Actualiza estadísticas de comunidad
6. Verifica umbral de migración colectiva
7. Si alcanza umbral → Crea propuesta automática
8. Notifica al usuario
9. Frontend actualiza UI
```

### Flujo de Proof of Help

```
1. Usuario A ayuda a Usuario B (2 horas)
2. Ambos confirman → POST /timebank/transactions
3. ConsensusService crea TrustBlock
4. Sistema selecciona 3 validadores
   - Proximidad geográfica (40%)
   - Reputación alta (40%)
   - Aleatorios (20%)
5. Notifica a validadores
6. Validadores votan → POST /consensus/blocks/:id/validate
7. Si 2/3 aprueban → Bloque confirmado
8. Usuario A gana +2 horas en banco de tiempo
9. Validadores ganan +1 crédito cada uno
10. Se actualiza reputación de todos
```

### Flujo de Propuesta Comunitaria

```
1. Usuario crea propuesta → POST /consensus/proposals
2. Sistema verifica reputación >= 20
3. Crea Proposal con status=DISCUSSION
4. Fase de discusión: 3 días
   - Usuarios comentan
   - Autor puede editar
5. Después de 3 días → status=VOTING
6. Fase de votación: 4 días
   - Usuarios votan con créditos (cuadrático)
   - Costo = points²
7. Después de 4 días → Calcula resultado
8. Si alcanza threshold (10% usuarios activos):
   - status=APPROVED
   - Notifica a todos
9. Si no alcanza:
   - status=REJECTED
```

---

## Seguridad

### Autenticación
- JWT con expiración (7 días)
- Passwords hasheados con bcrypt (10 rounds)
- Refresh tokens (opcional, no implementado)

### Autorización
- Guards de NestJS
- Role-based access control (RBAC)
- Ownership checks en updates/deletes

### Validación
- DTOs con class-validator
- Sanitización de inputs
- Type safety con TypeScript

### Rate Limiting
- Nginx: 10 req/s global
- Auth endpoints: 5 req/min
- Upload endpoints: 10 req/min

### Headers de Seguridad
```nginx
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'self'
```

---

## Problemas Conocidos

### 1. ScheduleModule Deshabilitado
**Causa:** `ReferenceError: crypto is not defined`

**Workaround:** Endpoints admin para triggers manuales
- `POST /admin/create-flash-deals`
- `POST /admin/activate-happy-hour`
- `POST /admin/create-weekly-challenge`
- `POST /admin/clean-expired-stories`
- `POST /admin/reset-daily-actions`
- `POST /admin/update-streaks`

**Solución pendiente:** Investigar compatibilidad con Node.js crypto en NestJS 10

### 2. Null Safety en Frontend
**Status:** Resuelto

Se agregó optional chaining en:
- `/events/[id].tsx` → `organizer?.name`
- `/offers/[id].tsx` → `user?.name`
- `/offers/index.tsx` → `user?.name`

---

## Métricas de Performance

**Backend:**
- Inicio: ~3-5 segundos
- Request promedio: <100ms
- Queries DB: <50ms
- Cache hit rate (Redis): >80%

**Frontend:**
- First Paint: <1s
- Time to Interactive: <2s
- Bundle size: ~500KB (gzipped)

**Database:**
- Tablas: ~40
- Índices: ~60
- Query time promedio: <20ms

---

## Próximos Pasos

### Fase 1 (Completada) ✅
- ✅ Sistema híbrido de capas económicas
- ✅ Gamificación viral completa
- ✅ Gobernanza descentralizada (PoH)
- ✅ Documentación completa

### Fase 2 (En Desarrollo)
- 🔄 Frontend para propuestas CIPs
- 🔄 Dashboard de moderación
- 🔄 Visualización de trust chain
- 🔄 Analytics avanzados de capas

### Fase 3 (Futuro)
- 📊 Gráficos y dashboards de gobernanza
- 🌐 Federación inter-comunitaria
- 🔗 Interoperabilidad Web3
- 🎯 Smart contracts avanzados
- 📱 App móvil (React Native)

---

**Última actualización:** 2025-10-08

**Versión:** 2.0.0
