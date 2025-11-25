# COMUNIDAD VIVA - Economía de Regalo y Gobernanza Avanzada

## Características Avanzadas del Sistema

---

## 🎁 1. ECONOMÍA DE REGALO (Gift Economy)

### 1.1 Fundamento Filosófico

La **Economía de Regalo** rompe con el paradigma transaccional tradicional. No hay expectativa de reciprocidad directa ni inmediata. Das porque puedes, recibes porque necesitas. El círculo se cierra de forma **indirecta y asimétrica**.

**Principios:**
```
Dar sin expectativa → Genera abundancia
Recibir con gratitud → Genera conexión
Reciprocar cuando puedas → Genera flujo
```

### 1.2 Implementación Técnica

```typescript
interface GiftOffer {
  id: string;
  giver: User;

  // No hay precio
  type: 'object' | 'service' | 'skill' | 'space' | 'food';
  title: string;
  description: string;
  photos: Media[];

  // Disponibilidad
  quantity?: number;
  available: boolean;
  location: GeoPoint;

  // No hay condiciones monetarias
  conditions?: string;  // Ej: "Preferencia a personas con necesidad"

  // Tracking de impacto
  timesGifted: number;
  recipients: User[];

  // Gratitud
  gratitudeMessages: GratitudeMessage[];

  createdAt: Date;
}

interface GiftRequest {
  id: string;
  requester: User;

  // Descripción de necesidad
  type: 'object' | 'service' | 'skill' | 'space' | 'food';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';

  // Sin mención de dinero
  location: GeoPoint;
  needed: boolean;

  // Matching
  offers: GiftOffer[];
  fulfilled: boolean;
  fulfilledBy?: User;

  createdAt: Date;
}

interface GratitudeMessage {
  from: User;
  to: User;
  gift: GiftOffer;
  message: string;
  public: boolean;  // Gratitud pública o privada

  // Opcional: Ofrenda recíproca futura
  payItForward?: string;  // "Cuando pueda, ayudaré a alguien más"

  createdAt: Date;
}
```

### 1.3 Círculos de Regalo

Sistema de **reciprocidad generalizada**:

```typescript
interface GiftCircle {
  id: string;
  name: string;
  description: string;
  members: User[];

  // Filosofía del círculo
  intention: string;  // Ej: "Compartir excedentes de huerto"

  // Actividad
  gifts: GiftTransaction[];
  totalGiftsGiven: number;
  totalGiftsReceived: number;

  // Métricas de abundancia
  abundanceIndex: number;  // Ratio dar/recibir del círculo
  flowHealth: number;      // Velocidad de circulación

  // Eventos
  gatheringsScheduled: GiftGathering[];

  createdAt: Date;
}

interface GiftTransaction {
  gift: GiftOffer;
  giver: User;
  receiver: User;

  // No hay valor monetario
  estimatedValue?: number;  // Solo para métricas de impacto

  // Historia y significado
  story?: string;  // Historia detrás del regalo
  gratitude: GratitudeMessage;

  // Efecto multiplicador
  receiverGiftsAfter: GiftTransaction[];  // Regalos posteriores del receptor

  createdAt: Date;
}
```

### 1.4 Gift Gatherings (Encuentros de Regalo)

Eventos físicos de intercambio sin dinero:

```typescript
interface GiftGathering {
  id: string;
  organizer: User;
  circle: GiftCircle;

  // Evento
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  date: Date;
  duration: number;  // minutos

  // Participación
  attendees: User[];
  maxAttendees?: number;

  // Regalos llevados
  giftsOffered: GiftOffer[];
  giftsGiven: GiftTransaction[];

  // Experiencia
  photos: Media[];
  testimonials: string[];

  // Métricas
  totalValueGifted: number;
  participantsSatisfaction: number;  // 0-10

  createdAt: Date;
}
```

### 1.5 Karma Points

Sistema de reputación en Economía de Regalo:

```typescript
interface KarmaScore {
  user: User;

  // Dar
  giftsGiven: number;
  valueGiven: number;
  peopleHelped: number;

  // Recibir con gratitud
  gratitudeExpressed: number;
  gratitudeReceived: number;

  // Pay It Forward
  giftsAfterReceiving: number;  // Regalos dados después de recibir

  // Score total
  karmaPoints: number;  // Calculado con algoritmo
  karmaLevel: 'seed' | 'sprout' | 'tree' | 'forest' | 'ocean';

  // Impacto indirecto
  indirectImpact: number;  // Regalos generados por tus regalos
}

// Algoritmo de Karma
function calculateKarma(user: User): number {
  const giving = user.giftsGiven * 10;
  const gratitude = user.gratitudeExpressed * 5;
  const payItForward = user.giftsAfterReceiving * 20;  // Multiplicador mayor
  const indirectImpact = user.indirectImpact * 2;

  return giving + gratitude + payItForward + indirectImpact;
}
```

### 1.6 Visualización del Flujo de Regalos

**Gift Flow Map**: Mapa interactivo que muestra cómo circulan los regalos:

```
Usuario A regala libro → Usuario B
    ↓
Usuario B regala bicicleta → Usuario C
    ↓
Usuario C regala clases → Usuario D
    ↓
Usuario D regala comida → Usuario A
    ✓ Círculo cerrado (sin planificación)
```

**Métricas visuales:**
- **Círculos de reciprocidad**: Cuántos ciclos completos se han cerrado
- **Grados de separación**: Distancia promedio entre regalos
- **Efecto multiplicador**: 1 regalo → cuántos más genera

### 1.7 Historias de Regalo

Cada regalo puede tener una historia asociada:

```typescript
interface GiftStory {
  gift: GiftOffer;
  giver: User;
  receiver: User;

  // Narrativa
  title: string;
  story: string;  // Historia personal del regalo
  photos: Media[];

  // Impacto
  impact: string;  // Cómo cambió la vida del receptor

  // Visibilidad
  public: boolean;
  featured: boolean;  // Destacado en homepage

  // Engagement
  reactions: Reaction[];
  inspired: number;  // Cuántos usuarios se inspiraron a regalar

  createdAt: Date;
}
```

**Ejemplo:**

```json
{
  "title": "La guitarra que sanó un corazón",
  "story": "Mi abuelo me regaló esta guitarra hace 30 años. Aprendí a tocar con ella. Ahora que él no está, quiero que alguien más le dé vida. María la necesitaba para su terapia musical. Ver su sonrisa fue como abrazar a mi abuelo de nuevo.",
  "impact": "María usa la guitarra en su trabajo con niños autistas. 20 niños han conectado con la música gracias a este regalo.",
  "inspired": 45  // 45 personas regalaron algo después de leer esto
}
```

---

## 🏛️ 2. GOBERNANZA AVANZADA

### 2.1 Tipos de Propuestas

```typescript
enum ProposalType {
  // Operacionales
  OPERATIONAL        = 'operational',       // Decisiones del día a día
  BUDGET             = 'budget',            // Asignación presupuestaria
  MEMBERSHIP         = 'membership',        // Admisión/expulsión miembros

  // Estructurales
  GOVERNANCE         = 'governance',        // Cambios en gobernanza
  PROTOCOL           = 'protocol',          // Modificaciones al protocolo
  CONSTITUTION       = 'constitution',      // Cambios constitucionales

  // Económicas
  ECONOMIC_POLICY    = 'economic_policy',   // Políticas económicas
  POOL_ALLOCATION    = 'pool_allocation',   // Uso de fondos comunes
  FEE_STRUCTURE      = 'fee_structure',     // Estructura de tarifas

  // Sociales
  COMMUNITY_PROJECT  = 'community_project', // Proyectos comunitarios
  PARTNERSHIP        = 'partnership',       // Alianzas externas
  EVENT              = 'event',             // Eventos comunitarios

  // Emergencias
  EMERGENCY          = 'emergency'          // Decisiones urgentes
}
```

### 2.2 Fases de Propuesta

Proceso formal de deliberación:

```typescript
enum ProposalPhase {
  DRAFT             = 'draft',              // Borrador (no público)
  DISCUSSION        = 'discussion',         // Fase de discusión (7 días)
  REFINEMENT        = 'refinement',         // Refinamiento por feedback (3 días)
  VOTING            = 'voting',             // Votación (5-14 días)
  EXECUTION         = 'execution',          // En ejecución
  COMPLETED         = 'completed',          // Completada
  REJECTED          = 'rejected',           // Rechazada
  EXPIRED           = 'expired'             // Expirada sin quórum
}

interface ProposalLifecycle {
  proposal: Proposal;

  phases: {
    current: ProposalPhase;
    history: {
      phase: ProposalPhase;
      startedAt: Date;
      endedAt?: Date;
      actions: ProposalAction[];
    }[];
  };

  // Métricas de fase
  discussionComments: number;
  refinementChanges: number;
  votingParticipation: number;

  // Timeline
  estimatedCompletion: Date;
  actualCompletion?: Date;
}
```

### 2.3 Votación Cuadrática

Evita tiranía de mayorías y plutocracias:

```typescript
interface QuadraticVote {
  voter: User;
  proposal: Proposal;

  // Créditos apostados
  creditsAllocated: number;

  // Peso del voto (raíz cuadrada)
  voteWeight: number;  // = sqrt(creditsAllocated)

  // Multiplicador por Proof-of-Help
  proofOfHelpMultiplier: number;  // 0.5 - 2.0

  // Peso final
  finalWeight: number;  // voteWeight * proofOfHelpMultiplier

  // Posición
  position: 'for' | 'against' | 'abstain';
  reasoning?: string;

  createdAt: Date;
}

// Ejemplo
// Usuario con 100 créditos y 1.5x multiplier:
const vote = {
  creditsAllocated: 100,
  voteWeight: Math.sqrt(100) = 10,
  proofOfHelpMultiplier: 1.5,
  finalWeight: 10 * 1.5 = 15
};

// Usuario rico pero sin contribución (0.5x multiplier):
const richVote = {
  creditsAllocated: 10000,
  voteWeight: Math.sqrt(10000) = 100,
  proofOfHelpMultiplier: 0.5,
  finalWeight: 100 * 0.5 = 50
};
// La contribución pesa más que el dinero ✓
```

### 2.4 Delegación Transitiva

Cadenas de delegación:

```typescript
interface VoteDelegation {
  delegator: User;
  delegate: User;

  // Alcance
  scope: {
    topics: ProposalType[];     // Por temas
    communities: Community[];   // Por comunidades
    timeRange?: {
      start: Date;
      end: Date;
    };
  };

  // Transitiva
  allowTransitiveDelegation: boolean;  // ¿El delegado puede re-delegar?
  transitiveDelegationLimit?: number;  // Máximo niveles de delegación

  // Revocación
  revocable: boolean;
  revokedAt?: Date;

  // Notificaciones
  notifyOnVote: boolean;  // Avisar cuando el delegado vota

  createdAt: Date;
}

// Cadena transitiva
Usuario A delega → Usuario B (experto en economía)
    ↓ (B permite transitiva)
Usuario B delega → Usuario C (economista profesional)
    ↓
Cuando hay propuesta económica:
Voto de C cuenta como 3 votos (A + B + C)
```

### 2.5 Consenso Dinámico

Sistema de **convergencia gradual** hacia el consenso:

```typescript
interface ConsensusProcess {
  proposal: Proposal;

  // Umbrales dinámicos
  quorumRequired: number;      // % de participación mínima
  approvalThreshold: number;   // % de aprobación (inicial: 60%)

  // Fases de convergencia
  rounds: ConsensusRound[];

  currentRound: {
    number: number;
    startedAt: Date;
    endsAt: Date;

    // Votos actuales
    votesFor: number;
    votesAgainst: number;
    abstentions: number;

    // Convergencia
    polarization: number;      // 0-1 (0 = consenso total)
    trendingTowards: 'approval' | 'rejection' | 'stalemate';
  };

  // Resultado
  consensusReached: boolean;
  finalDecision?: 'approved' | 'rejected' | 'needs_revision';
}

interface ConsensusRound {
  number: number;
  duration: number;  // días

  // Ajustes automáticos
  thresholdAdjustment: number;  // Si hay consenso cercano, reducir threshold

  // Feedback
  votingParticipation: number;
  newArguments: ProposalComment[];
  positionChanges: number;  // Usuarios que cambiaron de voto

  result: 'continue' | 'consensus' | 'irreconcilable';
}
```

**Ejemplo de Convergencia:**

```
Propuesta: "Crear pool de emergencia con 10,000 créditos"

Ronda 1 (3 días):
- A favor: 45%
- En contra: 55%
- Participación: 40%
- Polarización: 0.7 (alta)
→ Continuar, threshold baja a 58%

Ronda 2 (3 días):
- Propuesta refinada: "Pool de 5,000 créditos con auditoría mensual"
- A favor: 62%
- En contra: 38%
- Participación: 55%
- Polarización: 0.4 (media)
→ Consenso alcanzado ✓
```

### 2.6 Hol

ocracy (Holacracia)

Organizarse en **círculos auto-gestionados**:

```typescript
interface Circle {
  id: string;
  name: string;
  purpose: string;

  // Jerarquía de círculos
  parentCircle?: Circle;
  childCircles: Circle[];

  // Miembros y roles
  members: CircleMember[];
  roles: Role[];

  // Autonomía
  domain: string[];  // Áreas de autoridad
  accountabilities: string[];  // Responsabilidades

  // Gobernanza
  governanceMeetings: Meeting[];
  tacticalMeetings: Meeting[];

  // Métricas
  health: number;  // 0-10
  tensionsResolved: number;
  proposalsProcessed: number;

  createdAt: Date;
}

interface Role {
  id: string;
  circle: Circle;
  name: string;
  purpose: string;

  // Autoridad
  domains: string[];  // Áreas bajo su control
  accountabilities: string[];  // Qué debe hacer

  // Asignación
  filledBy?: User;
  elections: RoleElection[];

  // Evolución
  previousVersions: Role[];
  proposalsAffecting: Proposal[];
}

interface Meeting {
  type: 'governance' | 'tactical';
  circle: Circle;
  facilitator: User;
  secretary: User;

  // Agenda
  tensions: Tension[];  // Tensiones a procesar
  proposals: Proposal[];  // Propuestas a decidir

  // Resultado
  decisionsCount: number;
  tensionsResolved: number;
  duration: number;  // minutos

  date: Date;
}

interface Tension {
  raisedBy: User;
  description: string;
  type: 'role_clarification' | 'policy_change' | 'new_role' | 'project';

  // Resolución
  proposals: Proposal[];
  resolved: boolean;
  resolvedHow: string;

  createdAt: Date;
}
```

### 2.7 Presupuesto Participativo

Ciudadanía decide directamente el uso de fondos:

```typescript
interface ParticipatoryBudget {
  id: string;
  community: Community;

  // Presupuesto
  totalBudget: {
    euros: number;
    credits: number;
  };

  // Fases
  phase: 'proposal' | 'deliberation' | 'voting' | 'execution';

  // Propuestas de gasto
  proposals: BudgetProposal[];

  // Votación
  votingMethod: 'approval' | 'ranked_choice' | 'quadratic';
  votersEligible: User[];
  votersParticipated: User[];

  // Resultado
  approvedProposals: BudgetProposal[];
  budgetAllocated: number;
  budgetRemaining: number;

  // Timeline
  startDate: Date;
  endDate: Date;
}

interface BudgetProposal {
  id: string;
  author: User;
  title: string;
  description: string;

  // Financiación
  amountRequested: number;
  currency: 'EUR' | 'CREDITS';

  // Impacto esperado
  beneficiaries: number;
  category: 'infrastructure' | 'social' | 'environmental' | 'cultural';
  sdgs: SDG[];

  // Apoyo comunitario
  endorsements: User[];
  votes: number;
  comments: Comment[];

  // Ejecución
  approved: boolean;
  executed: boolean;
  actualCost: number;
  impactReport?: ImpactReport;

  createdAt: Date;
}
```

### 2.8 Recall (Revocación de Mandato)

Remover roles o delegaciones que no funcionan:

```typescript
interface RecallProcess {
  target: User;
  role?: Role;               // Rol del que se solicita remoción
  delegation?: VoteDelegation;  // Delegación a revocar

  // Iniciadores
  initiatedBy: User[];
  minSignaturesRequired: number;  // % de comunidad
  signaturesCollected: number;

  // Motivos
  reasons: string;
  evidence: Media[];

  // Defensa
  targetResponse?: string;
  supportStatements: string[];

  // Votación
  voteRequired: boolean;
  votes: RecallVote[];

  // Resultado
  result: 'removed' | 'maintained' | 'withdrawn';

  createdAt: Date;
  resolvedAt?: Date;
}

interface RecallVote {
  voter: User;
  position: 'remove' | 'maintain';
  reasoning?: string;

  // Peso
  voteWeight: number;  // Basado en Proof-of-Help
}
```

### 2.9 Constitución Viva

Documento constitucional que evoluciona:

```typescript
interface Constitution {
  community: Community;
  version: number;

  // Artículos
  articles: ConstitutionArticle[];

  // Valores fundamentales
  coreValues: string[];
  mission: string;
  vision: string;

  // Principios de gobernanza
  governancePrinciples: {
    decisionMaking: string;
    conflictResolution: string;
    memberRights: string[];
    memberResponsibilities: string[];
  };

  // Enmiendas
  amendments: ConstitutionAmendment[];

  // Ratificación
  ratifiedBy: User[];
  ratificationDate: Date;

  // Próxima revisión
  nextReviewDate: Date;
}

interface ConstitutionArticle {
  number: number;
  title: string;
  content: string;

  // Historial
  previousVersions: string[];
  lastAmended: Date;
  amendmentProposals: Proposal[];
}

interface ConstitutionAmendment {
  article: ConstitutionArticle;
  proposer: User;

  // Cambio propuesto
  oldText: string;
  newText: string;
  justification: string;

  // Proceso
  proposal: Proposal;
  superMajorityRequired: boolean;  // 2/3 o 3/4 requerido

  // Resultado
  approved: boolean;
  votesFor: number;
  votesAgainst: number;

  effectiveDate: Date;
}
```

### 2.10 Auditoría y Transparencia

Todos los procesos son auditables:

```typescript
interface AuditLog {
  id: string;

  // Acción
  entity: string;  // 'proposal', 'vote', 'transaction', etc.
  entityId: string;
  action: string;  // 'created', 'updated', 'deleted', 'executed'

  // Actor
  actor: User;
  actorRole?: Role;

  // Contexto
  before: any;  // Estado anterior
  after: any;   // Estado posterior
  metadata: any;  // Datos adicionales

  // Verificación
  hash: string;  // Hash criptográfico
  signature?: string;  // Firma digital (roadmap blockchain)

  timestamp: Date;
}

// Transparencia financiera
interface FinancialReport {
  community: Community;
  period: {
    start: Date;
    end: Date;
  };

  // Ingresos
  income: {
    contributions: number;
    grants: number;
    services: number;
    total: number;
  };

  // Gastos
  expenses: {
    infrastructure: number;
    projects: number;
    operations: number;
    total: number;
  };

  // Balance
  balance: {
    euros: number;
    credits: number;
  };

  // Desglose
  transactions: Transaction[];

  // Auditoría
  auditedBy?: User;
  auditReport?: string;

  generatedAt: Date;
}
```

---

## 📊 Resumen Comparativo

| Aspecto | Modelo Tradicional | Truk |
|---------|-------------------|----------------|
| **Economía** | Escasez artificial | Abundancia compartida + Regalo |
| **Intercambio** | Transaccional directo | Reciprocidad generalizada |
| **Valor** | Solo monetario | 3 tipos + karma + impacto |
| **Decisiones** | Plutocracia o democracia simple | Proof-of-Help + delegación líquida + consenso |
| **Participación** | Voto cada 4 años | Participación continua + holacracia |
| **Transparencia** | Opaca | Auditoría pública total |
| **Revocación** | Casi imposible | Proceso recall continuo |
| **Constitución** | Rígida | Viva y evolutiva |
| **Presupuesto** | Decidido por élites | Participativo |
| **Gratitud** | No sistematizada | Sistematizada y pública |

---

## 🌟 Casos de Uso Transformadores

### Caso 1: Círculo de Regalo "Huerto Compartido"

```
15 vecinos crean círculo de regalo
    ↓
Comparten excedentes de cosecha semanalmente
    ↓
Cada uno regala sin llevar cuenta
    ↓
En 6 meses:
- 500 kg de alimentos compartidos
- 0€ gastados en supermercado
- Conexión profunda entre vecinos
- 5 nuevos huertos inspirados
    ↓
Karma colectivo del círculo: 15,000 puntos
```

### Caso 2: Propuesta Compleja con Consenso Dinámico

```
Propuesta: "Crear moneda local propia"
    ↓
Ronda 1: Polarización alta (60-40)
    ↓
Fase de discusión: 150 comentarios
    ↓
Refinamiento: "Moneda híbrida EUR-CRD"
    ↓
Ronda 2: Convergencia (75-25)
    ↓
Consenso alcanzado
    ↓
Ejecución automática via smart contract
```

---

**Actualizado**: Enero 2025
**Versión**: 1.0
**Próxima Actualización**: Marzo 2025
