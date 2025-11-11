# 📚 API Reference - Truk

Documentación completa de todos los endpoints de la API.

## Índice

- [Autenticación](#autenticación)
- [Sistema Híbrido de Capas Económicas](#sistema-híbrido-de-capas-económicas)
- [Gamificación y Engagement Viral](#gamificación-y-engagement-viral)
- [Gobernanza y Consenso](#gobernanza-y-consenso)
- [Usuarios](#usuarios)
- [Comunidades](#comunidades)
- [Ofertas](#ofertas)
- [Eventos](#eventos)
- [Banco de Tiempo](#banco-de-tiempo)
- [Compras Grupales](#compras-grupales)
- [Mensajes](#mensajes)
- [Notificaciones](#notificaciones)

---

## Autenticación

Todos los endpoints requieren JWT token excepto los de registro y login.

**Header:**
```
Authorization: Bearer <token>
```

### POST /auth/register

Registro de nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Juan Pérez",
  "bio": "Vecino del barrio"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez"
  }
}
```

**Notas:**
- El `access_token` tiene una duración de 15 minutos
- El `refresh_token` tiene una duración de 7 días y debe guardarse de forma segura
- El `access_token` debe incluirse en el header `Authorization: Bearer {token}` para peticiones autenticadas

### POST /auth/login

Inicio de sesión.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez"
  }
}
```

**Notas:**
- El `access_token` tiene una duración de 15 minutos
- El `refresh_token` tiene una duración de 7 días
- Guarda el `refresh_token` de forma segura para renovar el `access_token`

### POST /auth/refresh

Renovar access token usando refresh token.

**Body:**
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "660e8400-e29b-41d4-a716-446655440001",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Juan Pérez"
  }
}
```

**Notas:**
- Implementa token rotation: el refresh token anterior se revoca automáticamente
- Debes guardar el nuevo `refresh_token` y descartar el anterior
- Si el refresh token es inválido o expirado, el usuario debe hacer login nuevamente

### POST /auth/logout

Cerrar sesión revocando el refresh token.

**Body:**
```json
{
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Notas:**
- El refresh token queda revocado y no puede ser usado nuevamente
- El access token seguirá siendo válido hasta su expiración (max 15 minutos)
- Para mejor seguridad, elimina también el access token del cliente

---

## Autenticación de Dos Factores (2FA)

Sistema TOTP (Time-based One-Time Password) compatible con Google Authenticator, Authy, Microsoft Authenticator y otras apps.

### POST /auth/2fa/setup

Iniciar configuración de 2FA - Generar secreto y código QR.

**Requiere:** JWT Auth

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    "M3N4O5P6",
    "Q7R8S9T0",
    "U1V2W3X4",
    "Y5Z6A7B8",
    "C9D0E1F2"
  ]
}
```

**Flujo de configuración:**
1. Usuario solicita setup (este endpoint)
2. App muestra QR code al usuario
3. Usuario escanea QR con Google Authenticator
4. Usuario ingresa código de 6 dígitos generado
5. App llama a `/auth/2fa/enable` con el código
6. Usuario guarda los backup codes de forma segura

### POST /auth/2fa/enable

Activar 2FA después de verificar el código.

**Requiere:** JWT Auth

**Body:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "token": "123456",
  "backupCodes": ["A1B2C3D4", "E5F6G7H8", ...]
}
```

**Response:**
```json
{
  "message": "2FA enabled successfully"
}
```

**Notas:**
- El `token` es el código de 6 dígitos de la app de autenticación
- El `secret` debe ser el mismo generado en `/auth/2fa/setup`
- Los `backupCodes` se guardan hasheados en la base de datos
- Una vez activado, el login requerirá el código 2FA

### POST /auth/login (con 2FA)

Login cuando 2FA está habilitado.

**Flujo con 2FA:**

**Paso 1: Login inicial**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (requiere 2FA):**
```json
{
  "requires2FA": true,
  "temporaryToken": "eyJhbGci..."
}
```

**Paso 2: Completar login con código 2FA**
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorToken": "123456"
}
```

**Response (login completo):**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "550e8400...",
  "user": {...}
}
```

**Notas:**
- El `twoFactorToken` puede ser un código TOTP de 6 dígitos o un backup code
- El `temporaryToken` tiene validez de 5 minutos
- Si el código es inválido, retorna error 401

### POST /auth/2fa/disable

Desactivar 2FA.

**Requiere:** JWT Auth

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "message": "2FA disabled successfully"
}
```

**Notas:**
- Requiere un código 2FA válido para desactivar
- Elimina el secreto y todos los backup codes
- El usuario puede volver a activar 2FA en cualquier momento

### POST /auth/2fa/regenerate-backup-codes

Regenerar códigos de respaldo.

**Requiere:** JWT Auth

**Body:**
```json
{
  "token": "123456"
}
```

**Response:**
```json
{
  "backupCodes": [
    "A1B2C3D4",
    "E5F6G7H8",
    "I9J0K1L2",
    "M3N4O5P6",
    "Q7R8S9T0",
    "U1V2W3X4",
    "Y5Z6A7B8",
    "C9D0E1F2"
  ]
}
```

**Notas:**
- Los códigos anteriores quedan invalidados
- Guarda los nuevos códigos de forma segura
- Úsalos solo si pierdes acceso a tu app de autenticación

### GET /auth/2fa/status

Verificar si 2FA está habilitado.

**Requiere:** JWT Auth

**Response:**
```json
{
  "twoFactorEnabled": true
}
```

### Backup Codes

Los backup codes son códigos de un solo uso para acceder a tu cuenta si pierdes tu dispositivo de autenticación.

**Características:**
- 8 códigos generados inicialmente
- Cada código se usa una sola vez
- Formato: 8 caracteres alfanuméricos (ej: A1B2C3D4)
- Se guardan hasheados en la base de datos
- Se pueden regenerar con un código 2FA válido

**Uso:**
- En el login, ingresa un backup code en lugar del código TOTP
- El código se invalida automáticamente después de usarse
- Si se acaban los códigos, regenera nuevos desde la configuración

---

## Sistema Híbrido de Capas Económicas

El sistema híbrido permite la coexistencia de tres paradigmas económicos.

### POST /hybrid/migrate

Migrar a una nueva capa económica.

**Requiere:** JWT Auth

**Body:**
```json
{
  "newLayer": "TRANSITIONAL",
  "reason": "Quiero experimentar con pay-it-forward"
}
```

**Capas disponibles:**
- `TRADITIONAL`: Sistema capitalista clásico
- `TRANSITIONAL`: Economía de regalo gradual
- `GIFT_PURE`: Economía de regalo pura, post-dinero
- `CHAMELEON`: Modo experimental

**Response:**
```json
{
  "success": true,
  "oldLayer": "TRADITIONAL",
  "newLayer": "TRANSITIONAL",
  "userId": "uuid"
}
```

### GET /hybrid/layer

Obtener capa económica actual del usuario.

**Response:**
```json
{
  "userId": "uuid",
  "currentLayer": "TRANSITIONAL",
  "migratedAt": "2025-10-01T12:00:00Z"
}
```

### GET /hybrid/stats

Estadísticas de distribución de capas.

**Query params:**
- `communityId` (opcional): Filtrar por comunidad

**Response:**
```json
{
  "traditional": 45,
  "transitional": 30,
  "gift": 20,
  "chameleon": 5,
  "total": 100,
  "percentages": {
    "traditional": 45,
    "transitional": 30,
    "gift": 20,
    "chameleon": 5
  }
}
```

### POST /hybrid/abundance

Compartir abundancia (solo GIFT_PURE).

**Body:**
```json
{
  "item": "10kg de tomates de mi huerto",
  "quantity": 10,
  "expiresInDays": 7,
  "communityId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "item": "10kg de tomates de mi huerto",
  "quantity": 10,
  "isAnonymous": true,
  "shareDate": "2025-10-08T10:00:00Z"
}
```

### GET /hybrid/abundance

Listar recursos compartidos (abundancia).

**Query params:**
- `communityId` (opcional)

**Response:**
```json
{
  "shares": [
    {
      "id": "uuid",
      "item": "10kg de tomates de mi huerto",
      "quantity": 10,
      "isAnonymous": true,
      "shareDate": "2025-10-08T10:00:00Z"
    }
  ]
}
```

### POST /hybrid/needs

Expresar una necesidad (solo GIFT_PURE).

**Body:**
```json
{
  "need": "Herramientas de jardinería",
  "urgency": "MEDIUM",
  "communityId": "uuid"
}
```

**Niveles de urgencia:**
- `LOW`: No urgente
- `MEDIUM`: Necesidad moderada
- `HIGH`: Urgente

**Response:**
```json
{
  "id": "uuid",
  "need": "Herramientas de jardinería",
  "urgency": "MEDIUM",
  "isAnonymous": true,
  "expressedAt": "2025-10-08T10:00:00Z"
}
```

### GET /hybrid/needs

Listar necesidades de la comunidad.

**Query params:**
- `communityId` (opcional)

**Response:**
```json
{
  "needs": [
    {
      "id": "uuid",
      "need": "Herramientas de jardinería",
      "urgency": "MEDIUM",
      "isFulfilled": false,
      "expressedAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

### POST /hybrid/bridge-events

Crear evento temporal para experimentar con otra capa.

**Body:**
```json
{
  "experimentLayer": "GIFT_PURE",
  "durationDays": 7,
  "description": "Probemos una semana sin dinero",
  "communityId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "experimentLayer": "GIFT_PURE",
  "originalLayer": "TRADITIONAL",
  "startDate": "2025-10-08T10:00:00Z",
  "endDate": "2025-10-15T10:00:00Z"
}
```

### GET /hybrid/bridge-events

Listar eventos puente activos.

**Query params:**
- `active`: boolean (solo activos)
- `communityId`: uuid (filtrar por comunidad)

### POST /hybrid/celebrations

Registrar celebración de abundancia.

**Body:**
```json
{
  "reason": "Cosecha colectiva exitosa",
  "gifts": ["tomates", "lechugas", "zanahorias"],
  "communityId": "uuid"
}
```

### GET /hybrid/celebrations

Listar celebraciones recientes.

**Query params:**
- `communityId`: uuid
- `limit`: number (default: 10)

### GET /hybrid/migration-threshold

Verificar si se alcanzó el umbral para migración colectiva.

**Query params:**
- `communityId`: uuid (requerido)

**Response:**
```json
{
  "shouldPropose": true,
  "currentPercentage": 75,
  "threshold": 70,
  "message": "🌳 ¡75% de la comunidad ya vive en regalo puro!\n\n¿Quieren migrar toda la comunidad al modo GIFT_PURE?"
}
```

### GET /hybrid/config

Obtener configuración de capas de una comunidad.

**Query params:**
- `communityId`: uuid (requerido)

**Response:**
```json
{
  "communityId": "uuid",
  "giftThreshold": 70,
  "bridgeEventsEnabled": true,
  "anonymousGiftingAllowed": true
}
```

### PUT /hybrid/config

Actualizar configuración (solo administradores).

**Body:**
```json
{
  "communityId": "uuid",
  "giftThreshold": 80,
  "bridgeEventsEnabled": true,
  "anonymousGiftingAllowed": true
}
```

### GET /hybrid/transitions

Historial de migraciones de la comunidad.

**Query params:**
- `communityId`: uuid
- `limit`: number
- `offset`: number

**Response:**
```json
{
  "transitions": [
    {
      "userId": "uuid",
      "oldLayer": "TRADITIONAL",
      "newLayer": "TRANSITIONAL",
      "migratedAt": "2025-10-01T12:00:00Z",
      "reason": "Quiero experimentar"
    }
  ],
  "total": 100
}
```

---

## Gamificación y Engagement Viral

Sistema completo de gamificación para aumentar el engagement.

### Onboarding Gamificado

#### POST /viral-features/onboarding/start

Iniciar onboarding gamificado.

**Response:**
```json
{
  "currentStep": 0,
  "totalSteps": 5,
  "completedSteps": [],
  "rewards": {
    "creditsEarned": 0,
    "badgesEarned": []
  }
}
```

#### POST /viral-features/onboarding/complete-step

Completar paso del onboarding.

**Body:**
```json
{
  "stepNumber": 1
}
```

**Response:**
```json
{
  "stepCompleted": 1,
  "reward": {
    "credits": 10,
    "message": "¡Perfil completado! +10 créditos"
  }
}
```

#### GET /viral-features/onboarding/progress

Ver progreso del onboarding.

**Response:**
```json
{
  "currentStep": 3,
  "totalSteps": 5,
  "completedSteps": [0, 1, 2],
  "creditsEarned": 30
}
```

### Flash Deals (Ofertas Relámpago)

#### GET /viral-features/flash-deals/active

Listar flash deals activos.

**Response:**
```json
{
  "deals": [
    {
      "id": "uuid",
      "title": "50% descuento en verduras",
      "merchantId": "uuid",
      "discount": 50,
      "product": "Verduras orgánicas",
      "expiresAt": "2025-10-08T20:00:00Z",
      "remainingQuantity": 10
    }
  ]
}
```

#### POST /viral-features/flash-deals/claim/:dealId

Reclamar flash deal.

**Response:**
```json
{
  "success": true,
  "discount": 50,
  "code": "FLASH50-ABC123"
}
```

#### POST /admin/create-flash-deals

(Admin) Crear flash deals automáticos.

**Response:**
```json
{
  "created": 5,
  "deals": [...]
}
```

### Stories (Historias 24h)

#### POST /viral-features/stories

Crear nueva story.

**Body:**
```json
{
  "mediaUrl": "https://example.com/image.jpg",
  "text": "¡Cosecha del día!",
  "duration": 24
}
```

**Response:**
```json
{
  "id": "uuid",
  "mediaUrl": "https://example.com/image.jpg",
  "text": "¡Cosecha del día!",
  "expiresAt": "2025-10-09T10:00:00Z"
}
```

#### GET /viral-features/stories

Ver stories activas de la comunidad.

**Response:**
```json
{
  "stories": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "María",
      "mediaUrl": "https://example.com/image.jpg",
      "text": "¡Cosecha del día!",
      "viewCount": 45,
      "expiresAt": "2025-10-09T10:00:00Z"
    }
  ]
}
```

#### POST /viral-features/stories/:storyId/view

Marcar story como vista.

#### POST /admin/clean-expired-stories

(Admin) Limpiar stories expiradas.

### Swipe & Match

#### GET /viral-features/swipe/next

Obtener siguiente oferta para swipe.

**Response:**
```json
{
  "offerId": "uuid",
  "title": "Clases de guitarra",
  "description": "Aprende guitarra española",
  "images": ["url1", "url2"],
  "priceCredits": 20
}
```

#### POST /viral-features/swipe

Swipe en una oferta.

**Body:**
```json
{
  "offerId": "uuid",
  "action": "LIKE"
}
```

**Acciones:**
- `LIKE`: Me gusta
- `DISLIKE`: No me interesa
- `SUPER_LIKE`: Súper me gusta (3 créditos)

**Response:**
```json
{
  "match": true,
  "message": "¡Match! El vendedor también está interesado"
}
```

#### GET /viral-features/swipe/matches

Ver matches actuales.

**Response:**
```json
{
  "matches": [
    {
      "offerId": "uuid",
      "offerTitle": "Clases de guitarra",
      "matchedAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

### Challenges (Retos)

#### GET /viral-features/challenges/weekly

Obtener reto semanal actual.

**Response:**
```json
{
  "id": "uuid",
  "type": "HELP_3_NEIGHBORS",
  "description": "Ayuda a 3 vecinos esta semana",
  "targetValue": 3,
  "progress": 1,
  "reward": 50,
  "bonusFirst": 100,
  "endsAt": "2025-10-14T23:59:59Z"
}
```

#### GET /viral-features/challenges/leaderboard

Ver tabla de clasificación.

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "userName": "Pedro",
      "points": 150
    },
    {
      "rank": 2,
      "userId": "uuid",
      "userName": "Ana",
      "points": 120
    }
  ],
  "myRank": 5,
  "myPoints": 80
}
```

#### POST /admin/create-weekly-challenge

(Admin) Crear nuevo reto semanal.

### Referidos

#### GET /viral-features/referrals/code

Obtener código de referido personal.

**Response:**
```json
{
  "code": "MARIA2025",
  "uses": 5,
  "maxUses": 10,
  "rewardPerReferral": 20
}
```

#### POST /viral-features/referrals/use

Usar código de referido al registrarse.

**Body:**
```json
{
  "code": "MARIA2025"
}
```

**Response:**
```json
{
  "success": true,
  "creditsEarned": 10,
  "referrerEarned": 20
}
```

#### GET /viral-features/referrals/stats

Estadísticas de referidos.

**Response:**
```json
{
  "totalReferrals": 5,
  "activeReferrals": 3,
  "creditsEarned": 100,
  "nextMilestone": {
    "referrals": 10,
    "bonus": 50
  }
}
```

### Sugerencias Personalizadas

#### GET /viral-features/suggestions

Obtener sugerencias personalizadas.

**Response:**
```json
{
  "offers": [...],
  "events": [...],
  "people": [...]
}
```

### Live Events

#### GET /viral-features/live-events/active

Ver eventos en vivo activos.

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Mercadillo de la Plaza",
      "location": "Plaza Mayor",
      "participantCount": 45,
      "prizes": ["20 créditos", "Badge especial"]
    }
  ]
}
```

#### POST /viral-features/live-events/:eventId/join

Unirse a evento en vivo.

### Micro-actions

#### GET /viral-features/micro-actions/daily

Obtener micro-acciones del día.

**Response:**
```json
{
  "actions": [
    {
      "id": "uuid",
      "type": "VIEW_3_OFFERS",
      "description": "Mira 3 ofertas",
      "reward": 2,
      "progress": 1,
      "target": 3,
      "completed": false
    }
  ]
}
```

#### POST /viral-features/micro-actions/:actionId/complete

Completar micro-acción.

#### POST /admin/reset-daily-actions

(Admin) Reiniciar acciones diarias.

### Niveles y Progresión

#### GET /viral-features/levels/progress

Ver progreso de nivel.

**Response:**
```json
{
  "currentLevel": 5,
  "currentXP": 450,
  "nextLevelXP": 500,
  "progress": 90,
  "perks": ["Descuento 10%", "Acceso prioritario"]
}
```

#### POST /viral-features/levels/claim-reward

Reclamar recompensa de nivel.

**Body:**
```json
{
  "level": 5
}
```

### Streaks (Rachas)

#### GET /viral-features/streaks

Ver racha actual.

**Response:**
```json
{
  "currentStreak": 7,
  "longestStreak": 14,
  "lastActiveDate": "2025-10-08",
  "nextMilestone": {
    "days": 10,
    "reward": "Badge de Constancia"
  }
}
```

#### POST /admin/update-streaks

(Admin) Actualizar rachas activas.

### Happy Hour

#### GET /viral-features/happy-hour/status

Ver estado del happy hour.

**Response:**
```json
{
  "active": true,
  "multiplier": 2.0,
  "endsAt": "2025-10-08T20:00:00Z",
  "message": "¡Happy Hour! Créditos dobles hasta las 20:00"
}
```

#### POST /admin/activate-happy-hour

(Admin) Activar happy hour.

---

## Gobernanza y Consenso

Sistema de Proof of Help (PoH) para gobernanza descentralizada.

### Trust Blocks

#### POST /consensus/blocks

Crear nuevo bloque en la cadena de confianza.

**Body:**
```json
{
  "type": "HELP",
  "content": {
    "hours": 2,
    "skill": "Mudanzas",
    "receiverId": "uuid"
  },
  "witnesses": ["uuid1", "uuid2"]
}
```

**Tipos de bloques:**
- `HELP`: Ayuda mutua
- `PROPOSAL`: Propuesta comunitaria
- `VALIDATION`: Validación
- `DISPUTE`: Disputa

#### POST /consensus/blocks/:blockId/validate

Validar un bloque.

**Body:**
```json
{
  "decision": "APPROVE",
  "reason": "Los vi ayudando"
}
```

#### GET /consensus/blocks/pending

Obtener bloques pendientes de validación para el usuario actual.

**Response:**
```json
{
  "reputation": 127,
  "level": "EXPERIENCED",
  "validatorLevel": 2,
  "blocks": [
    {
      "id": "block-uuid",
      "type": "HELP",
      "status": "PENDING",
      "canValidate": true,
      "progress": {
        "current": 2,
        "required": 3,
        "percentage": 66
      }
    }
  ],
  "totalPending": 5
}
```

### Propuestas (CIPs)

#### POST /consensus/proposals

Crear propuesta (requiere reputación 20+).

**Body:**
```json
{
  "type": "FEATURE",
  "title": "Mercadillo mensual",
  "description": "Propongo organizar...",
  "requiredBudget": 0,
  "implementationPlan": "..."
}
```

**Tipos:**
- `FEATURE`: Nueva funcionalidad
- `RULE_CHANGE`: Cambio de reglas
- `FUND_ALLOCATION`: Asignación de fondos
- `PARTNERSHIP`: Asociación

#### POST /consensus/proposals/:proposalId/vote

Votar propuesta (votación cuadrática).

**Body:**
```json
{
  "points": 5
}
```

Costo = points² créditos

#### GET /consensus/proposals

Listar propuestas.

**Query params:**
- `status`: DISCUSSION | VOTING | APPROVED | REJECTED
- `limit`: number

#### GET /consensus/proposals/:proposalId

Obtener detalles de una propuesta específica.

**Response:**
```json
{
  "id": "proposal-uuid",
  "type": "FEATURE",
  "title": "Mercadillo mensual",
  "description": "Propongo organizar...",
  "status": "VOTING",
  "author": {
    "id": "user-uuid",
    "name": "María"
  },
  "votes": [
    {
      "userId": "user-uuid",
      "userName": "Juan",
      "points": 5,
      "timestamp": "2025-10-10T10:00:00Z"
    }
  ],
  "totalVotes": 127,
  "createdAt": "2025-10-07T10:00:00Z"
}
```

#### POST /consensus/proposals/:proposalId/comments

Crear comentario en una propuesta.

**Body:**
```json
{
  "content": "Me parece una excelente idea",
  "parentId": "comment-uuid"
}
```

**Response:**
```json
{
  "id": "comment-uuid",
  "content": "Me parece una excelente idea",
  "authorId": "user-uuid",
  "createdAt": "2025-10-10T10:00:00Z"
}
```

#### GET /consensus/proposals/:proposalId/comments

Obtener comentarios de una propuesta (árbol de comentarios anidados).

**Response:**
```json
[
  {
    "id": "comment-uuid",
    "content": "Me parece una excelente idea",
    "author": {
      "id": "user-uuid",
      "name": "María",
      "avatar": "url"
    },
    "createdAt": "2025-10-10T10:00:00Z",
    "replies": [
      {
        "id": "reply-uuid",
        "content": "Totalmente de acuerdo",
        "author": {
          "id": "user2-uuid",
          "name": "Juan"
        },
        "createdAt": "2025-10-10T11:00:00Z",
        "replies": []
      }
    ]
  }
]
```

### Moderación

#### POST /consensus/moderation

Reportar contenido.

**Body:**
```json
{
  "contentId": "uuid",
  "contentType": "POST",
  "reason": "Spam"
}
```

**Tipos de contenido:**
- `POST`
- `OFFER`
- `COMMENT`
- `MESSAGE`
- `REVIEW`

#### POST /consensus/moderation/:daoId/vote

Votar en moderación.

**Body:**
```json
{
  "decision": "REMOVE",
  "reason": "Es spam"
}
```

**Decisiones:**
- `KEEP`: Mantener
- `REMOVE`: Eliminar
- `WARN`: Advertir

#### GET /consensus/moderation/pending

Obtener casos de moderación pendientes donde el usuario es parte del jurado.

**Response:**
```json
[
  {
    "id": "dao-uuid",
    "contentId": "content-uuid",
    "contentType": "POST",
    "reason": "Contenido inapropiado",
    "reporterId": "user-uuid",
    "status": "PENDING",
    "createdAt": "2025-10-10T10:00:00Z",
    "jury": ["user1-uuid", "user2-uuid", "user3-uuid"],
    "votesCount": {
      "KEEP": 0,
      "REMOVE": 1,
      "WARN": 0
    }
  }
]
```

### Dashboard

#### GET /consensus/dashboard

Obtener estadísticas del sistema de gobernanza.

**Response:**
```json
{
  "overview": {
    "totalBlocks": 1250,
    "totalProposals": 45,
    "activeProposals": 8,
    "totalValidators": 127,
    "totalModerationCases": 12,
    "activeModerationCases": 3
  },
  "topValidators": [
    {
      "userId": "user-uuid",
      "name": "María",
      "validationCount": 89,
      "reputation": 142,
      "level": "EXPERT"
    }
  ],
  "recentActivity": [
    {
      "id": "block-uuid",
      "type": "PROPOSAL",
      "actorName": "Juan",
      "timestamp": "2025-10-10T10:00:00Z",
      "status": "VALIDATED"
    }
  ],
  "participationRate": {
    "validationRate": 0.78,
    "votingRate": 0.65,
    "moderationRate": 0.82
  }
}
```

### Reputación

#### GET /consensus/reputation

Obtener mi reputación.

**Response:**
```json
{
  "userId": "uuid",
  "reputation": 127,
  "level": "EXPERIENCED",
  "privileges": [
    "can_help",
    "can_validate_help",
    "can_create_proposals"
  ]
}
```

#### GET /consensus/reputation/:userId

Obtener reputación de cualquier usuario.

---

## Usuarios

### GET /users/profile

Obtener perfil del usuario actual.

### PUT /users/profile

Actualizar perfil.

**Body:**
```json
{
  "name": "Juan Pérez",
  "bio": "Vecino del barrio",
  "phone": "+34 600 000 000",
  "avatar": "url"
}
```

### GET /users/:id

Obtener perfil público de otro usuario.

---

## Comunidades

### GET /communities

Listar comunidades.

**Query params:**
- `search`: string
- `type`: LOCAL | THEMATIC | PROFESSIONAL
- `visibility`: PUBLIC | PRIVATE

### POST /communities

Crear comunidad.

**Body:**
```json
{
  "name": "Barrio Centro",
  "description": "Comunidad del centro",
  "type": "LOCAL",
  "visibility": "PUBLIC"
}
```

### GET /communities/:id

Obtener detalles de comunidad.

### PUT /communities/:id

Actualizar comunidad (solo admins).

### POST /communities/:id/join

Unirse a comunidad.

### POST /communities/:id/leave

Salir de comunidad.

### GET /communities/audit-log

Obtener historial de auditoría de acciones en comunidades.

**Query params:**
- `userId`: uuid - Filtrar por usuario
- `entity`: string - Filtrar por tipo de entidad (COMMUNITY, PROPOSAL, MODERATION, etc.)
- `entityId`: uuid - Filtrar por ID específico de entidad
- `action`: string - Filtrar por tipo de acción (CREATE, UPDATE, DELETE, VOTE, etc.)
- `startDate`: ISO date - Fecha de inicio
- `endDate`: ISO date - Fecha de fin
- `skip`: number - Saltar N registros (paginación)
- `take`: number - Tomar N registros (paginación)

**Response:**
```json
{
  "logs": [
    {
      "id": "log-uuid",
      "userId": "user-uuid",
      "entity": "PROPOSAL",
      "entityId": "proposal-uuid",
      "action": "VOTE",
      "timestamp": "2025-10-10T10:00:00Z",
      "metadata": {
        "points": 5,
        "proposalTitle": "Mercadillo mensual"
      },
      "user": {
        "id": "user-uuid",
        "name": "María",
        "email": "maria@example.com"
      }
    }
  ],
  "total": 1250,
  "skip": 0,
  "take": 50
}
```

---

## Ofertas

### GET /offers

Listar ofertas.

**Query params:**
- `type`: PRODUCT | SERVICE | TIME_BANK | GROUP_BUY | EVENT
- `category`: string
- `search`: string

### POST /offers

Crear oferta.

**Body:**
```json
{
  "title": "Clases de guitarra",
  "description": "Aprende guitarra española",
  "type": "SERVICE",
  "category": "Educación",
  "priceEur": 20,
  "priceCredits": 15,
  "images": ["url1", "url2"]
}
```

### GET /offers/:id

Obtener detalles de oferta.

### PUT /offers/:id

Actualizar oferta.

### DELETE /offers/:id

Eliminar oferta.

### POST /offers/:id/interested

Marcar/desmarcar interés en oferta.

---

## Eventos

### GET /events

Listar eventos.

**Query params:**
- `upcoming`: boolean
- `communityId`: uuid

### POST /events

Crear evento.

**Body:**
```json
{
  "title": "Mercadillo de trueque",
  "description": "Intercambio de objetos",
  "date": "2025-10-15T10:00:00Z",
  "location": "Plaza Mayor",
  "maxAttendees": 50,
  "communityId": "uuid"
}
```

### GET /events/:id

Obtener detalles de evento.

### POST /events/:id/attend

Confirmar asistencia.

### POST /events/:id/unattend

Cancelar asistencia.

---

## Banco de Tiempo

### POST /timebank/transactions

Registrar transacción de banco de tiempo.

**Body:**
```json
{
  "receiverId": "uuid",
  "hours": 2,
  "skill": "Jardinería",
  "description": "Ayuda con el jardín"
}
```

### GET /timebank/balance

Ver balance de horas.

**Response:**
```json
{
  "balance": 10,
  "given": 15,
  "received": 5
}
```

### GET /timebank/transactions

Historial de transacciones.

---

## Compras Grupales

### GET /groupbuys

Listar compras grupales.

### POST /groupbuys

Crear compra grupal.

**Body:**
```json
{
  "title": "Aceite de oliva ecológico",
  "description": "25L de aceite de oliva",
  "targetQuantity": 20,
  "pricePerUnit": 15,
  "deadline": "2025-10-20T23:59:59Z"
}
```

### POST /groupbuys/:id/join

Unirse a compra grupal.

**Body:**
```json
{
  "quantity": 2
}
```

---

## Mensajes

### GET /messages/conversations

Listar conversaciones.

### GET /messages/:userId

Ver mensajes con un usuario.

### POST /messages/:userId

Enviar mensaje.

**Body:**
```json
{
  "content": "Hola, me interesa tu oferta"
}
```

---

## Notificaciones

### GET /notifications

Listar notificaciones.

**Query params:**
- `unreadOnly`: boolean
- `limit`: number

### POST /notifications/:id/read

Marcar como leída.

### POST /notifications/read-all

Marcar todas como leídas.

---

## Códigos de Estado

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity
- `500`: Internal Server Error

---

## Rate Limiting

- API general: 100 req/min
- Auth endpoints: 5 req/min
- Upload endpoints: 10 req/min

---

## Paginación

Los endpoints que retornan listas soportan paginación:

**Query params:**
- `limit`: número de resultados (default: 20, max: 100)
- `offset`: número de resultados a saltar (default: 0)

**Response:**
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

---

## Swagger UI

Documentación interactiva disponible en:

```
http://localhost:4000/api/docs
```

---

**Última actualización:** 2025-10-08
