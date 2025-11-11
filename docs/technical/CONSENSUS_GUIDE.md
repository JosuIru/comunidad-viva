# 🌟 Gobernanza Descentralizada - Proof of Help (PoH)

## 📋 Índice

- [Introducción](#introducción)
- [Conceptos Clave](#conceptos-clave)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Casos de Uso](#casos-de-uso)
- [API Reference](#api-reference)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Configuración](#configuración)
- [FAQ](#faq)

---

## Introducción

El sistema de **Gobernanza Descentralizada** de Truk implementa un modelo de consenso inspirado en Bitcoin pero adaptado a la economía colaborativa, donde:

- 🤝 **La "minería" es ayudar a otros** (Proof of Help)
- ⛓️ **El consenso se basa en reputación social verificable**
- 🏛️ **Las decisiones las toma la comunidad de forma transparente**
- 🔒 **Cada ayuda queda registrada en una cadena de confianza local**

### Ventajas sobre Sistemas Centralizados

1. **Sin punto único de fallo** - La plataforma sigue funcionando aunque falle el servidor central
2. **Resistente a censura** - La comunidad decide qué contenido es apropiado
3. **Incentivos alineados** - Ayudar y validar genera recompensas
4. **Transparencia total** - Todas las decisiones son públicas y auditables
5. **Gobernanza evolutiva** - La comunidad puede cambiar las reglas

---

## Conceptos Clave

### 1. Proof of Help (PoH)

En lugar de Proof of Work (Bitcoin), usamos **Proof of Help**:

- **Minería = Ayudar a otros**
- Cada hora de banco de tiempo genera "hash de trabajo"
- La validación requiere haber ayudado previamente
- **No consume energía, genera valor social**

```typescript
// Ejemplo: Un usuario debe tener al menos 20 horas de ayuda
// para crear una propuesta comunitaria
const userWork = await calculateUserWork(userId); // 25 horas
const requiredWork = 20;
if (userWork >= requiredWork) {
  // ✅ Puede crear propuesta
}
```

### 2. Trust Chain (Cadena de Confianza Local)

Cada ayuda forma un **bloque inmutable**:

- Hash enlazado con la transacción anterior
- Validación por consenso de vecinos testigos
- Historial verificable de toda la ayuda mutua

```typescript
// Estructura de un bloque
interface TrustBlock {
  height: number;        // Posición en la cadena
  hash: string;          // Hash único
  previousHash: string;  // Hash del bloque anterior
  type: BlockType;       // HELP, PROPOSAL, VALIDATION, DISPUTE
  actorId: string;       // Usuario que inició la acción
  content: any;          // Contenido del bloque
  nonce: number;         // Proof of Help
  difficulty: number;    // Dificultad ajustable
  status: BlockStatus;   // PENDING, APPROVED, REJECTED
}
```

### 3. Nodos de Consenso por Reputación

Los usuarios ganan privilegios según su reputación:

| Nivel | Reputación | Privilegios |
|-------|-----------|-------------|
| **Nivel 1: Activo** | 10+ ayudas | ✅ Validar transacciones simples |
| **Nivel 2: Contribuidor** | 50+ ayudas | ✅ Validar propuestas comunitarias |
| **Nivel 3: Experto** | 100+ ayudas | ✅ Resolver disputas como mediador |

### 4. Reputación Distribuida

La reputación se calcula automáticamente basándose en:

```typescript
// Factores de reputación
reputation =
  (ayudas_dadas × 5) +
  (ayudas_recibidas × 2) +
  (badges × 10) +
  (conexiones × 1) +
  (antigüedad_meses × 3) +
  (validaciones_correctas × 3)

// Multiplicadores por actividad
if (activo_últimos_7_días) reputation × 1.2
if (inactivo_más_30_días) reputation × 0.8
```

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    COMUNIDAD VIVA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ Trust Chain      │◄────►│ Proof of Help    │            │
│  │ (Blockchain)     │      │ Service          │            │
│  └──────────────────┘      └──────────────────┘            │
│           ▲                          ▲                      │
│           │                          │                      │
│           ▼                          ▼                      │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ Consensus        │◄────►│ Validation       │            │
│  │ Engine           │      │ Network          │            │
│  └──────────────────┘      └──────────────────┘            │
│           │                          │                      │
│           ▼                          ▼                      │
│  ┌─────────────────────────────────────────┐               │
│  │         CASOS DE USO                    │               │
│  ├─────────────────────────────────────────┤               │
│  │ • Moderación Descentralizada            │               │
│  │ • Propuestas Comunitarias (CIPs)        │               │
│  │ • Validación de Ayudas                  │               │
│  │ • Resolución de Disputas                │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Base de Datos

El sistema añade 7 nuevas tablas:

1. **TrustBlock** - Bloques de la cadena de confianza
2. **BlockValidation** - Validaciones de la comunidad
3. **Proposal** - Propuestas comunitarias (CIPs)
4. **ProposalVote** - Votos (cuadráticos)
5. **ProposalComment** - Discusiones
6. **ModerationDAO** - DAOs de moderación
7. **ModerationVote** - Votos de moderación

---

## Casos de Uso

### 1. Moderación Descentralizada

**Problema:** Un usuario reporta contenido inapropiado.

**Solución Descentralizada:**

```typescript
// Paso 1: Reportar contenido
POST /consensus/moderation
{
  "contentId": "post-123",
  "contentType": "POST",
  "reason": "Spam comercial no permitido"
}

// El sistema:
// 1. Crea un mini-DAO temporal
// 2. Selecciona jurado aleatorio (5-7 personas)
//    - 3 con alta reputación
//    - 2 usuarios aleatorios
// 3. Notifica al jurado

// Paso 2: Cada jurado vota
POST /consensus/moderation/:daoId/vote
{
  "decision": "REMOVE", // KEEP, REMOVE, WARN
  "reason": "Efectivamente es spam"
}

// Paso 3: Consenso (66% requerido)
// Si mayoría vota REMOVE → Contenido eliminado
// Jurados correctos ganan 1 crédito
```

**UX Simplificada para el Usuario:**

```
Usuario normal ve:
"❌ Este contenido ha sido removido por decisión de la comunidad"

Jurado ve:
"🔍 Pedro reportó un post por spam"
"¿Tu opinión?"
[Mantener] [Eliminar] [Advertir]
```

### 2. Propuestas Comunitarias (CIPs)

**Caso:** Un vecino quiere proponer un mercadillo mensual.

**Flujo:**

```typescript
// Paso 1: Crear propuesta (requiere reputación 20+)
POST /consensus/proposals
{
  "type": "FEATURE",
  "title": "Mercadillo mensual en la plaza",
  "description": "Propongo organizar un mercadillo de trueque e intercambio...",
  "requiredBudget": 0,
  "implementationPlan": "..."
}

// Sistema crea bloque PoH y valida reputación

// Paso 2: Fase de discusión (3 días)
// Comunidad comenta y discute

// Paso 3: Votación cuadrática (4 días)
POST /consensus/proposals/:id/vote
{
  "points": 5  // Costo: 25 créditos (5²)
}

// Paso 4: Si alcanza threshold → APROBADA
// Threshold = 10% de usuarios activos
```

**Votación Cuadrática:**

```
Tienes 100 créditos de voto

Opción 1: Votar 1 punto  → Cuesta 1² = 1 crédito
Opción 2: Votar 5 puntos → Cuesta 5² = 25 créditos
Opción 3: Votar 10 puntos → Cuesta 10² = 100 créditos

Ventaja: Evita que pocos dominen las decisiones
```

### 3. Validación de Ayudas

**Caso:** María ayudó a Juan con una mudanza (2 horas).

**Flujo:**

```typescript
// Paso 1: Ambas partes confirman
// (Ya implementado en TimeBankService)

// Paso 2: Sistema crea TrustBlock
await pohService.createTrustBlock({
  type: 'HELP',
  actorId: mariaId,
  content: {
    hours: 2,
    skill: 'Mudanzas',
    receiverId: juanId
  }
});

// Paso 3: Sistema selecciona 3 validadores
// Basado en:
// - Proximidad geográfica (40%)
// - Reputación (40%)
// - Aleatoriedad (20%)

// Paso 4: Validadores confirman
POST /consensus/blocks/:blockId/validate
{
  "decision": "APPROVE",
  "reason": "Los vi en el parque con cajas"
}

// Paso 5: Consenso 2/3 → Transacción aprobada
// - María gana +2 horas en banco de tiempo
// - Validadores ganan +1 crédito
```

**UX:**

```
María ve:
"✅ Tu ayuda ha sido confirmada por 3 vecinos"
"+2 horas añadidas a tu banco de tiempo"
"🏆 Ya llevas 15 personas ayudadas"

Laura (validadora) ve:
"🔍 María dice haber ayudado a Juan 2 horas con mudanza"
"¿Puedes confirmar?"
[Sí, lo vi] [No estoy seguro] [No ocurrió]
```

---

## API Reference

### Endpoints Principales

#### 🔗 Trust Blocks

```http
POST /consensus/blocks
```

Crear nuevo bloque en la cadena de confianza.

**Body:**
```json
{
  "type": "HELP" | "PROPOSAL" | "VALIDATION" | "DISPUTE",
  "content": { ... },
  "witnesses": ["userId1", "userId2"] // Opcional
}
```

**Response:**
```json
{
  "id": "block-uuid",
  "height": 1234,
  "hash": "0x...",
  "status": "PENDING"
}
```

---

```http
POST /consensus/blocks/:blockId/validate
```

Validar un bloque (requiere nivel adecuado).

**Body:**
```json
{
  "decision": "APPROVE" | "REJECT",
  "reason": "string" // Opcional
}
```

---

```http
GET /consensus/blocks/pending
```

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
      "actorId": "user-uuid",
      "status": "PENDING",
      "timestamp": "2025-10-10T10:00:00Z",
      "actor": {
        "id": "user-uuid",
        "name": "María",
        "avatar": "url"
      },
      "progress": {
        "current": 2,
        "required": 3,
        "approvals": 2,
        "rejections": 0,
        "percentage": 66
      },
      "canValidate": true
    }
  ],
  "totalPending": 5
}
```

---

#### 📝 Propuestas (CIPs)

```http
POST /consensus/proposals
```

Crear propuesta comunitaria (requiere reputación 20+).

**Body:**
```json
{
  "type": "FEATURE" | "RULE_CHANGE" | "FUND_ALLOCATION" | "PARTNERSHIP",
  "title": "string",
  "description": "string",
  "requiredBudget": 0,
  "implementationPlan": "string"
}
```

---

```http
POST /consensus/proposals/:proposalId/vote
```

Votar propuesta (votación cuadrática).

**Body:**
```json
{
  "points": 5  // Costo = points²
}
```

---

```http
GET /consensus/proposals
```

Listar propuestas.

**Query:**
- `status`: DISCUSSION | VOTING | APPROVED | REJECTED
- `type`: FEATURE | RULE_CHANGE | FUND_ALLOCATION | PARTNERSHIP
- `limit`: number

---

```http
GET /consensus/proposals/:proposalId
```

Obtener detalles de una propuesta específica.

**Response:**
```json
{
  "id": "proposal-uuid",
  "type": "FEATURE",
  "title": "Mercadillo mensual",
  "description": "...",
  "authorId": "user-uuid",
  "status": "VOTING",
  "createdAt": "2025-10-08T10:00:00Z",
  "votes": [
    {
      "userId": "user-uuid",
      "points": 5,
      "creditsSpent": 25
    }
  ],
  "totalPoints": 125,
  "votesCount": 15
}
```

---

```http
POST /consensus/proposals/:proposalId/comments
```

Crear comentario en una propuesta.

**Body:**
```json
{
  "content": "Me parece una excelente idea",
  "parentId": "comment-uuid" // Opcional, para respuestas
}
```

**Response:**
```json
{
  "id": "comment-uuid",
  "content": "Me parece una excelente idea",
  "authorId": "user-uuid",
  "author": {
    "id": "user-uuid",
    "name": "Pedro",
    "avatar": "url",
    "generosityScore": 150
  },
  "createdAt": "2025-10-10T10:00:00Z",
  "parentId": null
}
```

---

```http
GET /consensus/proposals/:proposalId/comments
```

Obtener comentarios de una propuesta (anidados).

**Response:**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "content": "Me parece una excelente idea",
      "author": {
        "id": "user-uuid",
        "name": "Pedro",
        "avatar": "url"
      },
      "createdAt": "2025-10-10T10:00:00Z",
      "replies": [
        {
          "id": "reply-uuid",
          "content": "Estoy de acuerdo",
          "author": {...},
          "createdAt": "2025-10-10T11:00:00Z",
          "replies": []
        }
      ]
    }
  ]
}
```

---

#### 🛡️ Moderación

```http
POST /consensus/moderation
```

Reportar contenido para moderación comunitaria.

**Body:**
```json
{
  "contentId": "string",
  "contentType": "POST" | "OFFER" | "COMMENT" | "MESSAGE" | "REVIEW",
  "reason": "string"
}
```

---

```http
POST /consensus/moderation/:daoId/vote
```

Votar en moderación.

**Body:**
```json
{
  "decision": "KEEP" | "REMOVE" | "WARN",
  "reason": "string"
}
```

---

```http
GET /consensus/moderation/pending
```

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
    "votes": [
      {
        "userId": "user1-uuid",
        "decision": "REMOVE",
        "reason": "Incumple normas de la comunidad"
      }
    ],
    "votesCount": {
      "KEEP": 0,
      "REMOVE": 1,
      "WARN": 0
    }
  }
]
```

---

#### 📊 Dashboard

```http
GET /consensus/dashboard
```

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
      "avatar": "url",
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

---

#### 🏆 Reputación

```http
GET /consensus/reputation
```

Obtener reputación del usuario actual.

**Response:**
```json
{
  "userId": "string",
  "reputation": 127,
  "level": "EXPERIENCED",
  "privileges": [
    "can_help",
    "can_validate_help",
    "can_create_proposals"
  ]
}
```

---

```http
GET /consensus/reputation/:userId
```

Obtener reputación de cualquier usuario.

---

## Ejemplos de Uso

### Ejemplo 1: Crear y Votar Propuesta

```typescript
import { ConsensusClient } from '@comunidad-viva/api-client';

const client = new ConsensusClient(apiUrl);

// 1. Verificar reputación
const { reputation } = await client.getMyReputation();
console.log(`Tu reputación: ${reputation}`);

if (reputation < 20) {
  throw new Error('Necesitas más reputación para crear propuestas');
}

// 2. Crear propuesta
const proposal = await client.createProposal({
  type: 'FEATURE',
  title: 'Añadir Repair Café mensual',
  description: `
    Propongo crear un evento mensual donde los vecinos traigan
    objetos rotos para repararlos juntos. Fomentamos la economía
    circular y el aprendizaje mutuo.
  `,
  requiredBudget: 50, // Euros para herramientas
  implementationPlan: `
    - Reservar local comunitario
    - Comprar kit básico de herramientas
    - Promocionar en redes sociales
    - Primer evento: próximo sábado
  `,
});

console.log('Propuesta creada:', proposal.id);

// 3. Esperar fase de votación (3 días)
// ...

// 4. Votar (cuadrático)
const vote = await client.voteProposal(proposal.id, {
  points: 7, // Cuesta 49 créditos
});

console.log('Voto registrado');
```

### Ejemplo 2: Moderación Comunitaria

```typescript
// Usuario reporta contenido
const moderation = await client.reportContent({
  contentId: 'post-123',
  contentType: 'POST',
  reason: 'Spam comercial no permitido en esta comunidad',
});

console.log('Moderación iniciada:', moderation.id);

// Sistema notifica automáticamente al jurado
// Jurado recibe notificación y vota

// Ejemplo: Si eres jurado
const myVote = await client.voteModeration(moderation.id, {
  decision: 'REMOVE',
  reason: 'Claramente es spam, no aporta valor a la comunidad',
});
```

### Ejemplo 3: Validar Ayuda de Vecino

```typescript
// Recibes notificación: "Pedro ayudó a Ana con jardinería (3h)"
// Si fuiste testigo, validas:

const validation = await client.validateBlock(blockId, {
  decision: 'APPROVE',
  reason: 'Los vi trabajando en el jardín comunitario',
});

// Si la validación es correcta según consenso:
// → Ganas +1 crédito
// → Ganas +1 crédito de voto
```

---

## Configuración

### Variables de Entorno

```env
# Consenso y Gobernanza
CONSENSUS_ENABLED=true
CONSENSUS_MIN_VALIDATORS=3
CONSENSUS_APPROVAL_THRESHOLD=0.66  # 66% para aprobar
CONSENSUS_PROPOSAL_MIN_REPUTATION=20
CONSENSUS_MODERATION_QUORUM=5
CONSENSUS_MODERATION_TIMEOUT_HOURS=24
```

### Ajustar Dificultad de Minado

La dificultad se ajusta automáticamente según la actividad:

```typescript
// En ProofOfHelpService
private async getCurrentDifficulty(): Promise<number> {
  const recentBlocks = await countRecentBlocks(1 hour);

  if (recentBlocks > 100) return 4; // Muy activo
  if (recentBlocks > 50) return 3;
  if (recentBlocks > 20) return 2;
  return 1; // Dificultad mínima
}
```

### Personalizar Cálculo de Reputación

```typescript
// Editar en ProofOfHelpService.calculateReputation()
reputation =
  (ayudas_dadas × PESO_AYUDAS) +     // Default: 5
  (ayudas_recibidas × PESO_RECIBIR) + // Default: 2
  (badges × PESO_BADGES) +            // Default: 10
  // ... personalizar según tu comunidad
```

---

## FAQ

### ¿Qué pasa si alguien intenta hacer trampa?

El sistema tiene múltiples protecciones:

1. **Validación por consenso** - Se necesita mayoría de validadores
2. **Stake en juego** - Los validadores arriesgan su reputación
3. **Selección aleatoria** - Difícil manipular quién valida
4. **Penalizaciones** - Intentos fallidos reducen reputación

### ¿Puedo perder reputación?

Sí, en casos como:

- Crear bloques que son rechazados por consenso (-5 créditos)
- Inactividad prolongada (multiplicador ×0.8)
- Validaciones incorrectas sistemáticas

### ¿Cuánto tiempo tarda una validación?

- **Ayudas simples:** ~1-2 horas (3 validadores)
- **Propuestas:** 7 días (3 días discusión + 4 días votación)
- **Moderación:** 24 horas (quorum de 5 jurados)

### ¿Qué pasa si no hay suficientes validadores activos?

El sistema se adapta:

1. Expande el radio geográfico de búsqueda
2. Reduce el nivel de reputación requerido
3. Como último recurso, aprobación por timeout (48h sin rechazos)

### ¿Cómo gano créditos de voto?

- Inicial: 10 créditos
- +5 créditos por cada 10 personas ayudadas
- +2 créditos por cada badge
- +1 crédito por validación correcta

### ¿Puedo ver la cadena de confianza completa?

Sí, todo es transparente:

```typescript
GET /consensus/blocks?limit=100&type=HELP

// Ver historial de ayuda mutua en tu comunidad
```

### ¿Qué diferencia hay con Bitcoin?

| Aspecto | Bitcoin | Proof of Help |
|---------|---------|---------------|
| Minería | Computación | Ayudar a otros |
| Energía | Alta (PoW) | Cero |
| Incentivo | Acumular | Compartir |
| Velocidad | ~10 min | ~1 hora |
| Escalabilidad | Limitada | Local (alta) |
| Propósito | Dinero digital | Bien común |

---

## 🚀 Próximos Pasos

### Fase 1 (Completada) ✅
- ✅ Modelo de datos
- ✅ Proof of Help Service
- ✅ API endpoints básicos
- ✅ Cálculo de reputación

### Fase 2 (En Desarrollo)
- 🔄 Frontend para propuestas
- 🔄 Dashboard de moderación
- 🔄 Visualización de cadena de confianza

### Fase 3 (Futuro)
- 📊 Analytics de gobernanza
- 🌐 Federación inter-comunitaria
- 🔗 Interoperabilidad Web3
- 🎯 Smart contracts avanzados

---

## 📚 Recursos Adicionales

- [Whitepaper: Proof of Help](./docs/whitepaper-poh.pdf)
- [Video Tutorial: Gobernanza Descentralizada](https://youtube.com/...)
- [Caso de Estudio: Comunidad Piloto](./docs/case-study.md)
- [Guía para Moderadores](./docs/moderator-guide.md)

---

## 💬 Soporte

¿Dudas sobre el sistema de consenso?

- 📧 Email: governance@comunidadviva.org
- 💬 Discord: #governance-help
- 📖 Docs: https://docs.comunidadviva.org/consensus

---

**¡Bienvenido a la gobernanza del futuro! 🌱**

*Donde cada ayuda cuenta, cada voz importa y la comunidad decide junta.*
