# COMUNIDAD VIVA
## Whitepaper Técnico v1.0
### Plataforma de Economía Solidaria y Transformación Social

---

## Resumen Ejecutivo

**Truk** es una plataforma tecnológica descentralizada que reimagina las relaciones económicas y sociales desde una perspectiva de abundancia compartida, cooperación y regeneración planetaria. A través de un sistema híbrido de tres economías (EUR, Créditos y Horas), gamificación solidaria y gobernanza participativa basada en Proof-of-Help, la plataforma demuestra que **cuando todos prosperan, cada individuo prospera**.

### Métricas Clave

- **Sistema Económico Híbrido**: 3 tipos de valor circulando simultáneamente
- **Gobernanza Descentralizada**: Delegación líquida + Proof-of-Help
- **Alcance Multinivel**: Personal → Comunitario → Intercomunitario → Global
- **Impacto Medible**: ODS de la ONU integrados en cada proyecto

---

## 1. Introducción

### 1.1 El Contexto Actual

Vivimos en una época de paradojas:
- **Abundancia tecnológica** con **escasez artificial** creada por sistemas económicos extractivos
- **Hiperconexión digital** con **desconexión humana** en comunidades locales
- **Riqueza global** sin precedentes con **desigualdad creciente**
- **Capacidad productiva** inmensa con **necesidades básicas** sin cubrir

### 1.2 La Visión Paradigmática

Truk parte de una premisa transformadora: **somos parte del planeta como organismo vivo**. No estamos separados de la Tierra, somos células de un sistema planetario mayor donde:

- Un proyecto de agua potable en India beneficia a toda la humanidad
- Un auzolan (trabajo comunitario) en Navarra regenera el tejido social global
- Una cooperativa de vivienda en Barcelona demuestra alternativas de habitar el mundo
- Cada semilla compartida multiplica la abundancia en el jardín común terrestre

### 1.3 Principios Fundamentales

**🌱 Cooperación sobre Competencia**
El sistema recompensa la colaboración, no la acumulación

**🤝 Reciprocidad Generalizada**
Lo que das vuelve multiplicado desde direcciones inesperadas

**🌍 Conciencia Planetaria**
Conecta lo local con lo global, mostrando que todo está entrelazado

**💚 Economía del Cuidado**
Visibiliza y valora el trabajo de cuidados tradicionalmente invisibilizado

**🔄 Circularidad y Regeneración**
Los recursos fluyen en ciclos, nada se desperdicia

**✨ Abundancia Compartida**
Demuestra que hay suficiente para todos cuando compartimos

---

## 2. Problema que Resuelve

### 2.1 Crisis del Modelo Económico Actual

#### Concentración de Riqueza
- El 1% más rico posee más que el 99% restante
- Los sistemas monetarios tradicionales incentivan acumulación sobre circulación
- El capital genera más capital sin crear valor social real

#### Invisibilización de Economías Alternativas
- El trabajo de cuidados no remunerado no se contabiliza en el PIB
- Los intercambios de tiempo y habilidades no tienen valor en el sistema formal
- La economía solidaria opera en los márgenes sin infraestructura tecnológica

#### Atomización Social
- Comunidades fragmentadas con recursos no compartidos
- Desconfianza entre vecinos y pérdida de tejido social
- Necesidades no cubiertas coexistiendo con recursos ociosos

#### Falta de Agencia Democrática
- Ciudadanía sin poder real sobre decisiones que les afectan
- Sistemas de votación rígidos que no reflejan la complejidad social
- Desconexión entre representantes y representados

### 2.2 Limitaciones de Soluciones Existentes

**Plataformas de Economía Colaborativa Tradicionales (Airbnb, Uber)**
- ❌ Extracción de valor por plataformas centralizadas
- ❌ Precarización laboral
- ❌ Sin redistribución de beneficios

**Monedas Sociales y Bancos de Tiempo**
- ❌ Islas aisladas sin interoperabilidad
- ❌ Tecnología obsoleta o inexistente
- ❌ Alcance local limitado

**Sistemas de Gobernanza Descentralizada (DAOs)**
- ❌ Plutocracia disfrazada (quien tiene más tokens, más poder)
- ❌ Complejidad técnica que excluye a mayorías
- ❌ Desconectados de impacto social real

---

## 3. Solución: Arquitectura de Truk

### 3.1 Sistema Híbrido de Tres Economías

Truk permite que **tres formas de valor coexistan y se interconviertan**, creando puentes entre economías y preparando la transición hacia sistemas post-capitalistas.

#### 🔵 EUR (Economía Tradicional)
```
Propósito: Interfaz con economía convencional
Unidad: Euros (€)
Características:
- Moneda fiat estándar
- Permite compras en sistema tradicional
- Puente hacia economía solidaria
- Conversión bidireccional con créditos
```

#### 🟢 CREDITS (Moneda Social Comunitaria)
```
Propósito: Economía colaborativa local
Unidad: Créditos (CRD)
Características:
- Generados por contribución al bien común
- Circulan solo dentro de la red
- Demurrage opcional (desincentivo a acumulación)
- Reflejan valor social, no solo monetario
```

#### 🟡 TIME_HOURS (Banco de Tiempo)
```
Propósito: Economía del cuidado y reciprocidad
Unidad: Horas (h)
Características:
- 1 hora = 1 hora (igualdad radical)
- Valoriza todo trabajo por igual
- No acumulables indefinidamente
- Promueve economía de flujo
```

#### Conversiones entre Sistemas

```javascript
// Ejemplo de tasas de conversión dinámicas
EUR ←→ CREDITS
- 1 EUR = 10 CRD (compra)
- 1 EUR = 8 CRD (venta, incentivo a mantener créditos)

CREDITS ←→ TIME_HOURS
- Valor relativo según contexto comunitario
- Bridge Events facilitan conversión
- Celebration Events redistribuyen excedentes
```

### 3.2 Proof-of-Help: Algoritmo de Consenso Social

A diferencia de Proof-of-Work (derroche energético) o Proof-of-Stake (plutocracia), **Proof-of-Help** asigna poder de gobernanza basado en contribución al bien común.

#### Métricas de Contribución

```typescript
interface ProofOfHelpScore {
  // Acciones Directas
  timeDonated: number;           // Horas compartidas
  needsCovered: number;           // Necesidades cubiertas
  projectContributions: number;   // Proyectos apoyados

  // Calidad de Impacto
  beneficiariesReached: number;   // Personas ayudadas
  sdr_impact: number;             // Alineación con ODS
  communityEndorsements: number;  // Validaciones comunitarias

  // Comportamiento Generoso
  generosityScore: number;        // Ratio dar/recibir
  flowParticipation: number;      // Velocidad de circulación

  // Longevidad
  consistencyStreak: number;      // Participación sostenida
  trustBlocks: number;            // Validaciones recibidas
}

// Cálculo de Flow Power (Poder de Voto)
flowPower = (
  timeDonated * 2 +
  projectContributions * 5 +
  generosityScore * 10 +
  communityEndorsements * 3
) / totalCommunityContribution
```

#### Ventajas del Sistema

✅ **Meritocracia Social**: Quien más aporta, más influencia
✅ **Anti-Plutocracia**: El dinero no compra votos
✅ **Incentivos Alineados**: Ayudar = Ganar poder de decisión
✅ **Inclusivo**: Cualquiera puede empezar a contribuir
✅ **Resistente a Sybil Attacks**: Las contribuciones son validadas

### 3.3 Delegación Líquida de Votos

Sistema híbrido entre democracia directa y representativa:

```
Usuario puede:
├─ Votar directamente en cada propuesta
├─ Delegar su voto a expertos por temas
│  ├─ Vivienda → Delegar a arquitecta
│  ├─ Economía → Delegar a economista
│  └─ Medioambiente → Delegar a activista
└─ Recuperar voto en cualquier momento
```

#### Características

- **Especialización**: Delegas en quien sabe del tema
- **Flexibilidad**: Cambias tu delegación cuando quieras
- **Transitiva**: Tu delegado puede re-delegar (configuración)
- **Transparente**: Ves cómo votó tu delegado

---

## 4. Módulos Principales

### 4.1 Vivienda Comunitaria

#### 4.1.1 Space Bank (Banco de Espacios)

Sistema de intercambio temporal de espacios habitables:

**Casos de Uso:**
- Estudiante de Barcelona intercambia habitación con estudiante de París
- Familia acoge a refugiado temporalmente
- Persona en transición ocupa habitación vacía a cambio de ayuda comunitaria

**Modelo de Datos:**
```typescript
interface SpaceBank {
  id: string;
  owner: User;
  location: GeoPoint;
  type: 'room' | 'apartment' | 'house' | 'coworking' | 'land';
  capacity: number;
  amenities: string[];
  availability: DateRange[];
  rules: string[];
  exchangeType: 'time_hours' | 'credits' | 'reciprocal';
  trustLevel: 'public' | 'community' | 'vouched'; // Niveles de confianza
}
```

#### 4.1.2 Cooperativas de Vivienda

Propiedad colectiva democratizada:

**Flujo:**
```
1. Creación Cooperativa
   ├─ Definir modelo de gobernanza
   ├─ Aportaciones iniciales
   └─ Búsqueda colectiva de inmueble

2. Gestión
   ├─ Cuotas mensuales equitativas
   ├─ Decisiones por consenso
   └─ Fondos de emergencia comunitarios

3. Entrada/Salida
   ├─ Nuevos miembros por aprobación
   ├─ Devolución de aportaciones
   └─ Transferencia de derechos de uso
```

#### 4.1.3 Aval Comunitario

La comunidad garantiza alquileres de sus miembros:

**Mecanismo:**
```javascript
class CommunityGuarantee {
  // Fondo solidario de garantías
  poolFund: number;

  // Cada miembro aporta según capacidad
  contributions: Map<User, number>;

  // Sistema de aval distribuido
  guarantee(member: User, rentAmount: number) {
    if (member.trustScore > THRESHOLD) {
      return {
        covered: rentAmount * 3,  // 3 meses de garantía
        cosigners: this.selectCosigners(member, 5),
        conditions: this.definePaymentPlan()
      };
    }
  }
}
```

### 4.2 Ayuda Mutua

#### 4.2.1 Sistema de Necesidades (Needs)

**4 Alcances de Necesidad:**

```typescript
enum NeedScope {
  PERSONAL      = 'personal',       // Yo necesito ayuda
  COMMUNITY     = 'community',      // Nuestra comunidad necesita
  INTERCOMMUNITY = 'intercommunity', // Red de comunidades cooperando
  GLOBAL        = 'global'          // Solidaridad planetaria
}

interface Need {
  id: string;
  creator: User;
  scope: NeedScope;

  // Descripción
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';

  // Recursos Necesarios (Sistema Híbrido)
  resourcesNeeded: {
    euros?: number;
    credits?: number;
    hours?: number;
    skills?: Skill[];
    materials?: Material[];
  };

  // Progreso
  resourcesCovered: {
    euros: number;
    credits: number;
    hours: number;
  };

  // Transparencia
  contributions: Contribution[];
  status: 'active' | 'covered' | 'in_progress' | 'completed';
}
```

**Ejemplo Real:**

```json
{
  "title": "Clases de español para refugiada siria",
  "scope": "community",
  "urgency": "high",
  "resourcesNeeded": {
    "hours": 20,
    "skills": ["teaching", "spanish"],
    "credits": 50
  },
  "beneficiaries": 1,
  "impact": "Integración social, acceso a empleo"
}
```

#### 4.2.2 Proyectos Comunitarios

Transformación social medible y transparente:

**Tipos de Proyectos:**
```typescript
enum ProjectType {
  INFRASTRUCTURE = 'infrastructure',  // Reparar frontón
  WATER          = 'water',            // Pozo en Ghana
  EDUCATION      = 'education',        // Escuela rural
  HEALTH         = 'health',           // Clínica comunitaria
  AUZOLAN        = 'auzolan',          // Trabajo comunitario euskaldun
  ENVIRONMENT    = 'environment',      // Reforestación
  FOOD           = 'food'              // Huerto urbano
}

interface CommunityProject {
  id: string;
  creator: User;
  type: ProjectType;

  // ODS Alineación
  sdgs: SDG[];  // Objetivos de Desarrollo Sostenible ONU

  // Fases
  phase: 'planning' | 'funding' | 'execution' | 'completed';

  // Financiación
  fundingGoal: {
    euros?: number;
    credits?: number;
    hours?: number;
  };
  fundingCurrent: { ... };

  // Transparencia Total
  updates: ProjectUpdate[];
  impactReports: ImpactReport[];
  evidences: Media[];  // Fotos, vídeos, documentos

  // Beneficiarios
  estimatedBeneficiaries: number;
  actualBeneficiaries: number;

  // Ubicación
  location: GeoPoint;
  community: Community;
}
```

**Ejemplo: Escuela en Ghana**

```json
{
  "title": "Construir Escuela Primaria en Kumasi",
  "type": "education",
  "sdgs": ["SDG_4_Education", "SDG_10_ReducedInequalities"],
  "fundingGoal": {
    "euros": 50000,
    "hours": 200
  },
  "estimatedBeneficiaries": 200,
  "updates": [
    {
      "date": "2025-01-15",
      "content": "Terreno adquirido, inicio construcción en 2 semanas",
      "evidences": ["terrain_photo.jpg"],
      "verifiedBy": ["NGO_Partner_Ghana"]
    }
  ],
  "impactReports": [
    {
      "metric": "children_enrolled",
      "value": 185,
      "date": "2025-06-01"
    }
  ]
}
```

### 4.3 Economía de Flujo (Flow Economics)

#### 4.3.1 Pools Económicos

Fondos comunes gestionados democráticamente:

```typescript
interface EconomicPool {
  id: string;
  name: string;
  purpose: PoolPurpose;  // 'emergency' | 'housing' | 'education' | 'health'

  // Fondos
  balance: {
    euros: number;
    credits: number;
  };

  // Contribuciones
  contributions: PoolContribution[];

  // Solicitudes
  requests: PoolRequest[];

  // Gobernanza
  minVotersRequired: number;
  approvalThreshold: number;  // % de votos a favor

  // Métricas
  totalDistributed: number;
  beneficiariesServed: number;
  averageResponseTime: number;  // horas
}
```

**Proceso de Solicitud:**

```
Usuario solicita ayuda del pool
    ↓
Comunidad revisa solicitud (72h)
    ↓
Votación cuadrática (peso por Proof-of-Help)
    ↓
Si aprobado → Desembolso automático
    ↓
Seguimiento de uso
    ↓
Reporte de impacto
```

#### 4.3.2 Seeds (Semillas Diarias)

Ingreso básico universal por participación:

```typescript
interface DailySeed {
  user: User;
  date: Date;

  // Acciones que generan Seeds
  actionsCompleted: {
    login: boolean;              // +5 credits
    profileUpdate: boolean;       // +3 credits
    offerCreated: boolean;        // +10 credits
    needCovered: boolean;         // +20 credits
    projectContributed: boolean;  // +15 credits
    communityEventAttended: boolean; // +10 credits
  };

  totalEarned: number;

  // Límite diario para evitar gaming
  maxDailyEarnings: number = 50;
}
```

**Filosofía:**
Participación activa = Ingreso básico. Incentiva engagement sin necesidad de capital inicial.

### 4.4 Gamificación Solidaria

#### 4.4.1 Swipe & Match

Tipo "Tinder" pero para cooperación:

```typescript
interface Swipe {
  user: User;
  targetType: 'offer' | 'need' | 'project';
  targetId: string;
  action: 'like' | 'super_like' | 'pass';
}

// Algoritmo de Matching
function matchAlgorithm(user: User): (Offer | Need)[] {
  return recommendations
    .filterBy(user.interests)
    .filterBy(user.location, radiusKm: user.searchRadius)
    .filterBy(user.economicLayer)  // Compatible con su capa económica
    .sortBy([
      user.skills,           // Match con habilidades
      user.needsHistory,     // Necesidades previas
      communityPriority,     // Urgencia comunitaria
      socialImpact          // Potencial de impacto
    ])
    .limit(50);
}
```

#### 4.4.2 Challenges y Leaderboards

Competencia sana por contribuir más:

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';

  // Objetivos
  goal: {
    metric: 'hours_shared' | 'needs_covered' | 'projects_funded';
    target: number;
  };

  // Duración
  startDate: Date;
  endDate: Date;

  // Recompensas
  rewards: {
    credits: number;
    badge: Badge;
    recognition: string;
  };

  // Participantes
  participants: ChallengeParticipant[];
  leaderboard: Leaderboard;
}
```

**Ejemplo:**
"Challenge de las 1000 Horas de Marzo": Comunidad compite para compartir 1000 horas colectivas. Gamifica la solidaridad.

#### 4.4.3 Compras Grupales (Group Buys)

Poder de compra colectivo:

```typescript
interface GroupBuy {
  id: string;
  offer: Offer;
  organizer: User;

  // Participación
  participants: GroupBuyParticipant[];
  minParticipants: number;
  maxParticipants: number;
  currentParticipants: number;

  // Precios escalonados
  priceBreaks: PriceBreak[];  // Más participantes = menor precio
  currentTier: PriceBreak;

  // Logística
  deadline: Date;
  pickupLocation: GeoPoint;
  pickupAddress: string;

  // Estado
  status: 'active' | 'confirmed' | 'closed' | 'completed';
  totalQuantity: number;
}

interface PriceBreak {
  minQuantity: number;
  pricePerUnit: number;
  savings: number;  // % descuento respecto a precio base
}
```

**Ejemplo:**
Compra grupal de 50kg de arroz ecológico. Con 10 personas → 3€/kg. Con 30 personas → 2.20€/kg.

### 4.5 Gobernanza Participativa

#### 4.5.1 Sistema de Propuestas

```typescript
enum ProposalType {
  OPERATIONAL   = 'operational',    // Cambios operativos
  ECONOMIC      = 'economic',       // Decisiones económicas
  GOVERNANCE    = 'governance',     // Cambios en gobernanza
  PROTOCOL      = 'protocol',       // Modificaciones al protocolo
  EMERGENCY     = 'emergency'       // Decisiones urgentes
}

interface Proposal {
  id: string;
  author: User;
  type: ProposalType;

  // Contenido
  title: string;
  description: string;
  motivation: string;
  implementation: string;

  // Ubicación geográfica si aplica
  lat?: number;
  lng?: number;
  location?: string;

  // Votación
  votingPhase: 'discussion' | 'voting' | 'execution' | 'completed';
  votingStart: Date;
  votingEnd: Date;
  quorumRequired: number;

  // Resultados
  votes: ProposalVote[];
  result: 'pending' | 'approved' | 'rejected';

  // Ejecución Automática
  executableAction?: ExecutableAction;
  executedAt?: Date;
}

// Votación Cuadrática
interface ProposalVote {
  voter: User;
  votePower: number;  // Basado en Proof-of-Help
  credits: number;     // Créditos apostados
  position: 'for' | 'against' | 'abstain';
  weight: number;      // sqrt(credits) * votePower
}
```

**Ejemplo de Ejecución Automática:**

```typescript
{
  "title": "Crear Pool de Emergencia con 10,000 créditos",
  "type": "economic",
  "executableAction": {
    "type": "create_pool",
    "params": {
      "name": "Emergency Fund 2025",
      "initialBalance": 10000,
      "purpose": "emergency"
    }
  },
  // Si la propuesta se aprueba → se ejecuta automáticamente
}
```

#### 4.5.2 Delegación Líquida

```typescript
interface VoteDelegation {
  delegator: User;
  delegate: User;
  scope: DelegationScope;

  // Puede ser por temas
  topics?: ProposalType[];

  // O general
  isGeneral: boolean;

  // Transitiva
  allowRedelegation: boolean;

  // Temporal
  expiresAt?: Date;

  // Auditable
  createdAt: Date;
  revokedAt?: Date;
}
```

---

## 5. Arquitectura Técnica

### 5.1 Stack Tecnológico

```
┌─────────────────────────────────────────┐
│           Frontend Layer                 │
│  Next.js 14 + React + TypeScript         │
│  TailwindCSS + React Query               │
│  Leaflet Maps + Chart.js                 │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│           Backend Layer                  │
│  NestJS + TypeScript                     │
│  JWT Authentication                      │
│  Prisma ORM                              │
│  Event-Driven Architecture               │
└──────────────┬──────────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────────┐
│           Data Layer                     │
│  PostgreSQL 14+                          │
│  PostGIS (Geographic Data)               │
│  JSONB (Flexible Schemas)                │
└─────────────────────────────────────────┘
```

### 5.2 Modelo de Datos

#### Entidades Principales

**User (Usuario)**
```sql
- Identidad: id, email, password, name, avatar
- Ubicación: lat, lng, address, neighborhood
- Economía: credits, economicLayer, softCredits
- Gamificación: level, experience, activeStreak
- Gobernanza: voteCredits, flowPower, generosityScore
- Stats: hoursShared, peopleHelped, co2Avoided
```

**Community (Comunidad)**
```sql
- Identidad: slug, name, description, logo
- Ubicación: location, lat, lng, radiusKm
- Config: type, visibility, requiresApproval
- Gobernanza: governance config
```

**Need (Necesidad)**
```sql
- Básico: title, description, scope, urgency
- Recursos: resourcesNeeded, resourcesCovered
- Estado: status, completionDate
- Ubicación: lat, lng, location
```

**CommunityProject (Proyecto)**
```sql
- Info: title, type, description
- Financiación: fundingGoal, fundingCurrent
- Impacto: sdgs, estimatedBeneficiaries
- Fases: phase (planning → execution → completed)
- Transparencia: updates, impactReports, evidences
```

**Proposal (Propuesta de Gobernanza)**
```sql
- Contenido: title, description, type
- Votación: votingPhase, quorum, votes
- Ejecución: executableAction, executedAt
- Ubicación: lat, lng (si aplica)
```

### 5.3 Arquitectura de Capas Económicas

```typescript
enum EconomicLayer {
  TRADITIONAL   = 'traditional',   // Solo EUR
  TRANSITIONAL  = 'transitional',  // EUR + Créditos opcionales
  COLLABORATIVE = 'collaborative', // EUR + Créditos + Horas
  RADICAL       = 'radical'        // Solo Créditos + Horas (post-capitalista)
}

interface LayerMigration {
  user: User;
  fromLayer: EconomicLayer;
  toLayer: EconomicLayer;
  reason: string;
  date: Date;
}
```

**Transición Progresiva:**

```
Usuario Nuevo
    ↓
Capa TRADITIONAL (solo EUR, familiar)
    ↓
Experimenta con créditos opcionales
    ↓
Capa TRANSITIONAL (EUR + CRD)
    ↓
Participa en banco de tiempo
    ↓
Capa COLLABORATIVE (EUR + CRD + Horas)
    ↓
Se desmonetiza parcialmente
    ↓
Capa RADICAL (solo CRD + Horas)
```

### 5.4 Seguridad y Privacidad

#### Autenticación
```
- JWT Tokens con expiración
- Refresh Tokens
- 2FA opcional (Email/SMS)
- Rate limiting en endpoints sensibles
```

#### Autorización
```
- Role-Based Access Control (RBAC)
- Roles: CITIZEN, MODERATOR, ADMIN
- Permisos granulares por recurso
```

#### Privacidad
```typescript
interface PrivacySettings {
  profileVisibility: 'public' | 'community' | 'private';
  locationPrecision: 'exact' | 'neighborhood' | 'city';
  showStatistics: boolean;
  allowMessages: 'everyone' | 'community' | 'connections';
}
```

#### Moderación Descentralizada
```typescript
interface ModerationDAO {
  reporter: User;
  reported: User;
  reportType: 'spam' | 'abuse' | 'scam' | 'misinformation';
  evidence: string;

  // Votación comunitaria
  votes: ModerationVote[];
  threshold: number;  // % necesario para acción

  // Resolución
  resolution: 'warning' | 'temporary_ban' | 'permanent_ban' | 'dismissed';
}
```

---

## 6. Tokenomics: Sistema de Créditos

### 6.1 Generación de Créditos

Los créditos se generan exclusivamente por **contribución al bien común**, no por compra o inversión:

```typescript
enum CreditSource {
  // Contribuciones Directas
  NEED_COVERED       = 'need_covered',        // +20 CRD
  PROJECT_DONATION   = 'project_donation',    // Variable según impacto
  TIME_SHARED        = 'time_shared',         // +10 CRD/hora
  SKILL_SHARED       = 'skill_shared',        // +15-50 CRD según skill

  // Participación Activa
  DAILY_SEEDS        = 'daily_seeds',         // +5-50 CRD/día
  EVENT_ATTENDANCE   = 'event_attendance',    // +10 CRD
  PROPOSAL_CREATED   = 'proposal_created',    // +5 CRD
  VOTE_CASTED        = 'vote_casted',         // +2 CRD

  // Crecimiento Red
  REFERRAL           = 'referral',            // +50 CRD (ambos lados)
  ONBOARDING_HELP    = 'onboarding_help',     // +20 CRD

  // Recompensas
  CHALLENGE_WON      = 'challenge_won',       // Variable
  BADGE_EARNED       = 'badge_earned',        // Variable
  IMPACT_VERIFIED    = 'impact_verified'      // +100 CRD
}
```

### 6.2 Circulación de Créditos

Los créditos deben **fluir**, no acumularse:

#### Demurrage (Decaimiento Opcional)
```javascript
// En capas avanzadas, créditos pierden valor si no circulan
function applyDemurrage(user) {
  if (user.economicLayer === 'RADICAL') {
    const monthlyDecay = 0.05;  // 5% mensual
    const timeSinceLastFlow = Date.now() - user.lastTransaction;

    if (timeSinceLastFlow > 30 days) {
      user.credits *= (1 - monthlyDecay);

      // Créditos decayentes van a pool comunitario
      communityPool.credits += user.credits * monthlyDecay;
    }
  }
}
```

#### Límites de Acumulación
```typescript
const ACCUMULATION_LIMITS = {
  'TRADITIONAL': Infinity,     // Sin límite
  'TRANSITIONAL': 10000,       // Límite moderado
  'COLLABORATIVE': 5000,       // Límite bajo
  'RADICAL': 1000              // Límite muy bajo (flujo forzado)
};
```

### 6.3 Usos de Créditos

```typescript
enum CreditUsage {
  // Comercio P2P
  BUY_OFFER           = 'buy_offer',
  BUY_SERVICE         = 'buy_service',

  // Acceso a Recursos
  SPACE_BOOKING       = 'space_booking',
  EVENT_TICKET        = 'event_ticket',

  // Contribuciones
  DONATE_TO_NEED      = 'donate_to_need',
  FUND_PROJECT        = 'fund_project',
  POOL_CONTRIBUTION   = 'pool_contribution',

  // Gobernanza
  PROPOSAL_CREATION   = 'proposal_creation',    // Stake para crear propuesta
  QUADRATIC_VOTING    = 'quadratic_voting',     // Apostar en votos

  // Conversión
  EXCHANGE_TO_EUR     = 'exchange_to_eur',
  EXCHANGE_TO_HOURS   = 'exchange_to_hours'
}
```

### 6.4 Puentes entre Economías

#### Bridge Events (Eventos Puente)
```typescript
interface BridgeEvent {
  type: 'eur_to_credits' | 'credits_to_hours' | 'hours_to_credits';
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;

  // Spread para incentivar mantener créditos
  buyRate: number;   // 1 EUR = 10 CRD
  sellRate: number;  // 1 EUR = 8 CRD
}
```

#### Celebration Events (Redistribución Festiva)
```typescript
interface CelebrationEvent {
  name: string;
  date: Date;
  poolToDistribute: number;

  // Redistribución basada en participación
  distribution: {
    [userId: string]: number;
  };

  // Criterios de distribución
  criteria: {
    hoursShared: number;
    projectsSupported: number;
    needsCovered: number;
  };
}
```

---

## 7. Roadmap

### Fase 1: MVP (Q1 2025) ✅ Completado

- [x] Sistema de usuarios y autenticación
- [x] Comunidades y perfiles
- [x] Sistema híbrido básico (EUR + Créditos + Horas)
- [x] Marketplace de ofertas
- [x] Banco de tiempo básico
- [x] Sistema de propuestas y votación

### Fase 2: Ayuda Mutua (Q2 2025) ✅ Completado

- [x] Sistema de necesidades (4 alcances)
- [x] Proyectos comunitarios
- [x] Alineación con ODS
- [x] Transparencia total (updates + reports)
- [x] Sistema de contribuciones

### Fase 3: Vivienda & Gamificación (Q3 2025) ✅ Completado

- [x] Space Bank
- [x] Cooperativas de vivienda
- [x] Aval comunitario
- [x] Compras grupales
- [x] Swipe & Match
- [x] Challenges y Leaderboards
- [x] Sistema de referidos

### Fase 4: Gobernanza Avanzada (Q4 2025) 🔄 En Progreso

- [x] Proof-of-Help (consenso)
- [x] Delegación líquida
- [x] Votación cuadrática
- [ ] Ejecución automática de propuestas aprobadas
- [ ] Moderación descentralizada (DAO)

### Fase 5: Economía de Flujo (Q1 2026) 📋 Planificado

- [ ] Pools económicos avanzados
- [ ] Demurrage configurable
- [ ] Métricas de velocidad de flujo
- [ ] Dashboard de impacto económico
- [ ] Celebration Events automatizados

### Fase 6: Federación & Escalabilidad (Q2-Q3 2026) 📋 Planificado

- [ ] Protocolo de federación entre comunidades
- [ ] Interoperabilidad con otras plataformas
- [ ] API pública para desarrolladores
- [ ] Plugin para comercio local
- [ ] Migración a arquitectura descentralizada (P2P)

### Fase 7: Blockchain & Descentralización (Q4 2026+) 🔮 Visión

- [ ] Smart contracts para gobernanza
- [ ] Tokens nativos en blockchain
- [ ] Identidad descentralizada (DID)
- [ ] Almacenamiento distribuido (IPFS)
- [ ] DAO completa

---

## 8. Modelo de Sostenibilidad

### 8.1 Principios

Truk **no es una empresa**, es **infraestructura social**. Su sostenibilidad no se basa en maximizar beneficios, sino en **regenerar recursos**.

### 8.2 Fuentes de Financiación

#### 1. Contribuciones Voluntarias (Tier System)
```
- Ciudadano: 0€/mes (acceso completo)
- Solidario: 5€/mes (apoya el proyecto)
- Generoso: 10€/mes (subsidia a 2 usuarios)
- Mecenas: 50€/mes (subsidia a 10 usuarios)
```

#### 2. Subvenciones y Grants
```
- Fondos de innovación social
- Grants de fundaciones
- Ayudas públicas para economía social
```

#### 3. Servicios Premium Opcionales
```
- Análisis de impacto avanzado
- Personalización de comunidades
- Soporte prioritario
```

#### 4. Partnerships con Municipios
```
- Licencias para ciudades
- Integración con servicios municipales
- Co-desarrollo de funcionalidades
```

### 8.3 Costes de Operación

```
Estimación mensual (1000 usuarios activos):
- Infraestructura (servidores): 200€
- Base de datos: 150€
- CDN y almacenamiento: 100€
- Desarrollo (open source): 0€
- Moderación comunitaria: 0€
TOTAL: ~450€/mes

Break-even: 90 usuarios solidarios (5€/mes)
```

---

## 9. Impacto Social Esperado

### 9.1 Métricas de Impacto

#### Nivel Individual
```
- Horas compartidas por persona/mes
- Necesidades cubiertas per capita
- Conexiones significativas generadas
- Reducción de gastos por cooperación
- Incremento en bienestar percibido
```

#### Nivel Comunitario
```
- % de necesidades comunitarias cubiertas
- Velocidad de circulación de recursos
- Índice de reciprocidad (dar/recibir)
- Proyectos comunitarios completados
- Resiliencia económica (shocks externos)
```

#### Nivel Sistémico
```
- CO2 evitado por compartir recursos
- Residuos reducidos por economía circular
- Empleo generado en economía social
- Reducción de desigualdad (Gini index)
```

### 9.2 Casos de Éxito Proyectados

**Barrio de Gracia, Barcelona (500 usuarios)**
```
Escenario a 12 meses:
- 2,000 horas compartidas/mes
- 50 necesidades cubiertas/mes
- 5 proyectos comunitarios completados
- 15,000€ en compras grupales (ahorro: 20%)
- 3 cooperativas de vivienda formadas
```

**Red Intercomunitaria Navarra (10 comunidades)**
```
Escenario a 24 meses:
- 5,000 usuarios activos
- 100,000 horas intercambiadas
- 20 proyectos intercomunitarios
- 500,000€ en economía colaborativa
- Red de apoyo mutuo consolidada
```

**Solidaridad Global (100 comunidades)**
```
Escenario a 36 meses:
- 50,000 usuarios en 20 países
- 10 proyectos globales (educación, agua, salud)
- 1M€ en ayuda mutua Norte-Sur
- Demostración de modelo económico alternativo
```

---

## 10. Riesgos y Mitigaciones

### 10.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Brechas de seguridad | Media | Alto | Auditorías, bug bounties, encriptación |
| Escalabilidad | Media | Medio | Arquitectura modular, caché, CDN |
| Pérdida de datos | Baja | Alto | Backups diarios, redundancia |

### 10.2 Riesgos Sociales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Free riders (gorrones) | Alta | Medio | Proof-of-Help, reputación |
| Polarización política | Media | Alto | Moderación comunitaria, diversidad |
| Gentrificación digital | Media | Medio | Acceso sin smartphone, puntos físicos |

### 10.3 Riesgos Económicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Inflación de créditos | Media | Medio | Demurrage, límites de acumulación |
| Volatilidad EUR-CRD | Alta | Bajo | Spreads, fondos de estabilización |
| Gaming del sistema | Alta | Medio | Proof-of-Help, validación comunitaria |

---

## 11. Gobernanza del Proyecto

### 11.1 Estructura de Decisión

```
┌─────────────────────────────────────────┐
│        Asamblea de Comunidades          │
│    (decisiones estratégicas anuales)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Consejo de Gobernanza           │
│   (representantes elegidos, decisiones  │
│      operativas mensuales)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Equipos de Trabajo              │
│  - Desarrollo Técnico                   │
│  - Moderación & Soporte                 │
│  - Diseño & UX                          │
│  - Documentación & Educación            │
└─────────────────────────────────────────┘
```

### 11.2 Licencia y Código Abierto

```
- Código: MIT License (libre uso, modificación, redistribución)
- Datos: Los usuarios son dueños de sus datos
- Marca: Creative Commons BY-SA
- Protocolo: Open standard, interoperable
```

---

## 12. Conclusiones

### 12.1 Tesis Central

**Truk demuestra que otro mundo no solo es posible, sino que es más próspero, justo y satisfactorio que el actual.**

La plataforma no es solo tecnología, es:
- **Pedagógica**: Enseña cooperación por experiencia directa
- **Transformadora**: Cambia mentalidades de escasez a abundancia
- **Escalable**: De 10 personas a millones
- **Resiliente**: No depende de bancos ni gobiernos
- **Regenerativa**: Cuanto más se usa, más sana es la sociedad

### 12.2 Visión a 10 Años

```
2035: Red Global de Economía Solidaria
├─ 10 millones de usuarios
├─ 1,000 comunidades activas
├─ 50 países con presencia
├─ 10,000 proyectos comunitarios completados
├─ 1,000M€ en economía colaborativa
└─ Modelo replicado en 100 ciudades
```

### 12.3 Llamado a la Acción

Esta aplicación es **una semilla de transformación social**. Para que germine necesita:

🌱 **Desarrolladores**: Contribuir al código abierto
🌱 **Comunidades**: Adoptar la plataforma
🌱 **Activistas**: Difundir la visión
🌱 **Investigadores**: Medir el impacto
🌱 **Financiadores**: Apoyar el crecimiento
🌱 **Usuarios**: Experimentar y retroalimentar

---

## 13. Referencias y Recursos

### 13.1 Fundamentos Teóricos

- **Economía del Bien Común** - Christian Felber
- **Economía Solidaria** - Luis Razeto
- **Wealth of Commons** - David Bollier
- **Governing the Commons** - Elinor Ostrom

### 13.2 Inspiraciones Prácticas

- **Sardex**: Moneda complementaria en Cerdeña
- **Cyclos**: Software de monedas comunitarias
- **Time Banking UK**: Red de bancos de tiempo
- **Cooperation Jackson**: Economía solidaria en Mississippi

### 13.3 Documentación Técnica

- Repositorio GitHub: `github.com/comunidad-viva`
- Documentación API: `docs.comunidad-viva.org`
- Wiki: `wiki.comunidad-viva.org`
- Foro: `forum.comunidad-viva.org`

---

## 14. Contacto y Participación

**Web**: www.comunidad-viva.org
**Email**: hola@comunidad-viva.org
**GitHub**: github.com/comunidad-viva
**Telegram**: t.me/comunidad_viva
**Matrix**: #comunidad-viva:matrix.org

---

> "No cambiamos el mundo con grandes gestos, sino con millones de pequeñas acciones coordinadas. Esta aplicación es una herramienta para coordinar esas acciones y amplificar su impacto."

> "Cuando entiendes que tu bienestar depende del bienestar de otros, dejas de competir y empiezas a cooperar. Cuando cooperas, todos ganan. Esta es la semilla de un mundo nuevo."

---

**Versión**: 1.0
**Fecha**: Enero 2025
**Licencia**: CC BY-SA 4.0
**Autores**: Truk Contributors
