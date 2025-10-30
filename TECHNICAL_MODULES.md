# COMUNIDAD VIVA - Módulos Técnicos Complementarios

## Documentación de Módulos Implementados No Incluidos en Whitepaper Principal

---

## 📱 1. Red Social Integrada

### Posts & Comentarios

Sistema completo de red social dentro de cada comunidad:

```typescript
interface Post {
  id: string;
  author: User;
  community: Community;
  content: string;
  media: Media[];           // Imágenes, vídeos
  visibility: 'public' | 'community' | 'connections';

  // Engagement
  reactions: Reaction[];    // ❤️ 👍 😂 😮 😢 😡
  comments: Comment[];
  shares: number;

  // Métricas
  views: number;
  engagement: number;

  createdAt: Date;
}

interface Comment {
  id: string;
  post: Post;
  author: User;
  content: string;
  parentComment?: Comment;  // Para hilos de respuestas

  reactions: Reaction[];
  createdAt: Date;
}

interface Reaction {
  user: User;
  type: 'love' | 'like' | 'laugh' | 'surprise' | 'sad' | 'angry';
}
```

**Características:**
- **Feed Algorítmico**: Prioriza contenido relevante (comunidad, conexiones, engagement)
- **Hilos de Comentarios**: Respuestas anidadas
- **Reacciones Emoji**: 6 tipos de reacciones
- **Moderación Comunitaria**: Reportes y votos para contenido inapropiado

**API Endpoints:**
```
POST   /posts                  - Crear post
GET    /posts/feed             - Feed personalizado
GET    /posts/:id              - Ver post específico
POST   /posts/:id/react        - Reaccionar a post
POST   /posts/:id/comment      - Comentar post
DELETE /posts/:id              - Eliminar post
POST   /posts/:id/share        - Compartir post
```

---

## 💬 2. Sistema de Mensajería P2P

Chat privado directo entre usuarios:

```typescript
interface Message {
  id: string;
  sender: User;
  receiver: User;
  content: string;
  media?: Media[];

  // Estado
  read: boolean;
  readAt?: Date;
  delivered: boolean;
  deliveredAt?: Date;

  // Metadata
  createdAt: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

interface Conversation {
  participants: [User, User];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}
```

**Características:**
- **Tiempo Real**: WebSocket para mensajes instantáneos
- **Indicadores**: Estado de lectura/entrega
- **Multimedia**: Envío de imágenes/archivos
- **Notificaciones Push**: Alertas de mensajes nuevos
- **Privacidad**: Mensajes encriptados end-to-end (roadmap)

**API Endpoints:**
```
GET    /messages/conversations       - Lista de conversaciones
GET    /messages/:userId             - Chat con usuario específico
POST   /messages/:userId             - Enviar mensaje
PUT    /messages/:id/read            - Marcar como leído
DELETE /messages/:id                 - Eliminar mensaje
```

---

## 📊 3. Analytics & Métricas Avanzadas

Dashboard completo de impacto social y económico:

### 3.1 Métricas de Usuario

```typescript
interface UserAnalytics {
  // Económicas
  totalEarned: {
    euros: number;
    credits: number;
    hours: number;
  };
  totalSpent: {
    euros: number;
    credits: number;
    hours: number;
  };

  // Sociales
  needsCovered: number;
  needsCreated: number;
  projectsSupported: number;
  hoursShared: number;
  peopleHelped: number;

  // Ambientales
  co2Avoided: number;          // kg de CO2
  wasteReduced: number;        // kg de residuos
  resourcesShared: number;     // items compartidos

  // Engagement
  postsCreated: number;
  commentsCount: number;
  reactionsReceived: number;
  activeStreak: number;        // días consecutivos activo
}
```

### 3.2 Métricas de Comunidad

```typescript
interface CommunityAnalytics {
  // Demográficas
  totalMembers: number;
  activeMembers: number;       // activos últimos 30 días
  newMembers: number;          // últimos 30 días
  churnRate: number;           // % de bajas

  // Económicas
  totalVolume: {
    euros: number;
    credits: number;
    hours: number;
  };
  averageTransactionSize: number;
  velocityOfMoney: number;     // veces que circula un crédito/mes

  // Impacto Social
  needsCovered: number;
  projectsCompleted: number;
  sdgsImpacted: SDG[];
  beneficiariesReached: number;

  // Engagement
  dailyActiveUsers: number;
  averageSessionTime: number;
  postsPerDay: number;

  // Tendencias
  growthRate: number;          // % crecimiento mensual
  healthScore: number;         // índice de salud (0-100)
}
```

### 3.3 Dashboards Visuales

```typescript
// Gráficos disponibles
enum ChartType {
  TRANSACTION_VOLUME    = 'transaction_volume',    // Volumen por mes
  USER_GROWTH          = 'user_growth',            // Crecimiento usuarios
  NEEDS_FUNNEL         = 'needs_funnel',           // Embudo de necesidades
  SDG_IMPACT           = 'sdg_impact',             // Impacto por ODS
  ECONOMIC_FLOW        = 'economic_flow',          // Flujo económico
  ENGAGEMENT_HEATMAP   = 'engagement_heatmap',     // Mapa de calor
  TOP_CONTRIBUTORS     = 'top_contributors'        // Leaderboard
}
```

**API Endpoints:**
```
GET /analytics/user/:userId          - Analytics individuales
GET /analytics/community/:id         - Analytics comunitarias
GET /analytics/global                - Analytics globales
GET /analytics/export                - Exportar datos (CSV/JSON)
```

---

## 🔔 4. Sistema de Notificaciones

Notificaciones en tiempo real multi-canal:

```typescript
enum NotificationType {
  // Social
  NEW_MESSAGE        = 'new_message',
  POST_REACTION      = 'post_reaction',
  POST_COMMENT       = 'post_comment',
  MENTION            = 'mention',

  // Transacciones
  OFFER_PURCHASE     = 'offer_purchase',
  PAYMENT_RECEIVED   = 'payment_received',
  CREDITS_EARNED     = 'credits_earned',

  // Ayuda Mutua
  NEED_CONTRIBUTION  = 'need_contribution',
  NEED_COVERED       = 'need_covered',
  PROJECT_UPDATE     = 'project_update',
  PROJECT_COMPLETED  = 'project_completed',

  // Gobernanza
  NEW_PROPOSAL       = 'new_proposal',
  PROPOSAL_RESULT    = 'proposal_result',
  VOTE_DELEGATED     = 'vote_delegated',

  // Sistema
  LEVEL_UP           = 'level_up',
  BADGE_EARNED       = 'badge_earned',
  CHALLENGE_WON      = 'challenge_won',
  DAILY_SEEDS        = 'daily_seeds'
}

interface Notification {
  id: string;
  recipient: User;
  type: NotificationType;
  title: string;
  message: string;
  data: any;                // Datos adicionales

  // Estado
  read: boolean;
  readAt?: Date;
  clicked: boolean;
  clickedAt?: Date;

  // Canales
  channels: ('in_app' | 'email' | 'push')[];

  createdAt: Date;
}
```

**Características:**
- **Multi-Canal**: In-app, Email, Push (mobile)
- **Agrupación**: Notificaciones similares se agrupan
- **Preferencias**: Usuario controla qué notificaciones recibe
- **Tiempo Real**: WebSocket para notificaciones instantáneas
- **Batch Processing**: Resumen diario/semanal por email

**API Endpoints:**
```
GET    /notifications                 - Lista de notificaciones
PUT    /notifications/:id/read        - Marcar como leída
PUT    /notifications/read-all        - Marcar todas como leídas
DELETE /notifications/:id             - Eliminar notificación
GET    /notifications/preferences     - Preferencias usuario
PUT    /notifications/preferences     - Actualizar preferencias
```

---

## 🔍 5. Búsqueda Avanzada

Motor de búsqueda multi-entidad:

```typescript
interface SearchQuery {
  query: string;
  filters: {
    entities?: ('users' | 'offers' | 'needs' | 'projects' | 'communities')[];
    location?: {
      lat: number;
      lng: number;
      radiusKm: number;
    };
    priceRange?: {
      min: number;
      max: number;
      currency: 'EUR' | 'CREDITS' | 'TIME_HOURS';
    };
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  sort?: 'relevance' | 'date' | 'price' | 'distance';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  entity: 'user' | 'offer' | 'need' | 'project' | 'community';
  id: string;
  title: string;
  description: string;
  relevance: number;        // 0-1 score
  distance?: number;        // km (si aplica)
  data: any;                // Entidad completa
}
```

**Características:**
- **Full-Text Search**: PostgreSQL full-text
- **Geolocalización**: Búsqueda por proximidad
- **Filtros Múltiples**: Por tipo, precio, ubicación, fecha
- **Sugerencias**: Autocompletado
- **Fuzzy Matching**: Tolerante a errores de escritura

**API Endpoints:**
```
GET /search?q=...&filters=...         - Búsqueda general
GET /search/suggestions?q=...         - Autocompletado
GET /search/nearby?lat=...&lng=...    - Buscar cercanos
```

---

## ⭐ 6. Sistema de Reputación y Reseñas

Confianza distribuida y verificable:

```typescript
interface Review {
  id: string;
  reviewer: User;
  reviewed: User;
  transaction?: Transaction;    // Opcional: review post-transacción

  // Calificación
  rating: number;               // 1-5 estrellas
  categories: {
    communication: number;      // 1-5
    reliability: number;        // 1-5
    quality: number;            // 1-5
    value: number;              // 1-5
  };

  // Contenido
  title?: string;
  content: string;
  pros?: string;
  cons?: string;
  photos?: Media[];

  // Verificación
  verified: boolean;            // Verificado con transacción real
  helpful: number;              // Votos útiles

  createdAt: Date;
}

interface ReputationScore {
  user: User;

  // Scores
  overallRating: number;        // 0-5 promedio
  totalReviews: number;
  verifiedReviews: number;

  // Breakdown
  communicationScore: number;
  reliabilityScore: number;
  qualityScore: number;
  valueScore: number;

  // Trust Metrics
  trustScore: number;           // 0-100 calculado
  endorsements: number;         // Respaldos comunitarios
  completedTransactions: number;
  responseRate: number;         // % respuestas a mensajes
  responseTime: number;         // minutos promedio

  // Tendencia
  recentRating: number;         // últimos 30 días
  trend: 'up' | 'stable' | 'down';
}
```

**Características:**
- **Verificación**: Reviews vinculadas a transacciones reales
- **Multi-Dimensional**: 4 categorías de evaluación
- **Prevención de Spam**: Solo usuarios con transacciones pueden opinar
- **Mutual Review**: Ambas partes se evalúan
- **Decay**: Reviews antiguas pesan menos

**API Endpoints:**
```
POST   /reviews                       - Crear review
GET    /reviews/user/:userId          - Reviews de usuario
GET    /reviews/received/:userId      - Reviews recibidas
GET    /users/:id/reputation          - Score de reputación
PUT    /reviews/:id/helpful           - Marcar como útil
POST   /users/:id/endorse             - Respaldar usuario
```

---

## 🎯 7. Engagement Viral Features

Mecánicas avanzadas de engagement:

### 7.1 Stories (Historias)

Contenido efímero tipo Instagram/Snapchat:

```typescript
interface Story {
  id: string;
  creator: User;
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    backgroundColor?: string;
  };

  // Metadata
  duration: number;             // segundos (3-15)
  music?: string;               // URL de música

  // Engagement
  views: StoryView[];
  reactions: StoryReaction[];   // Emoji reactions

  // Lifecycle
  expiresAt: Date;              // 24h después
  createdAt: Date;
}
```

**Características:**
- **24h Expiration**: Desaparecen automáticamente
- **Vistas**: Tracking de quién vio
- **Reacciones Rápidas**: Emojis
- **Música**: Integración de audio

### 7.2 Flash Deals

Ofertas urgentes con tiempo limitado:

```typescript
interface FlashDeal {
  id: string;
  offer: Offer;
  merchant: User;

  // Descuento
  originalPrice: number;
  flashPrice: number;
  discountPercent: number;

  // Límites
  quantity: number;
  claimed: number;
  maxPerUser: number;

  // Tiempo
  startsAt: Date;
  expiresAt: Date;              // 1-24h duración
  urgent: boolean;              // < 2h restantes

  // Engagement
  views: number;
  claims: number;
  conversionRate: number;       // % claims/views
}
```

**Características:**
- **Urgencia**: Cronómetro visible
- **Escasez**: Cantidad limitada
- **Notificaciones Push**: Alerta a usuarios cercanos
- **FOMO**: Miedo a perdérselo

### 7.3 Micro Actions

Pequeñas acciones que suman:

```typescript
interface MicroAction {
  user: User;
  type: 'profile_view' | 'offer_like' | 'need_share' | 'event_interested';
  target: any;
  reward: {
    credits: number;            // 1-5 créditos
    xp: number;                 // experiencia
  };
  createdAt: Date;
}
```

**Tipos de Micro Actions:**
- **Ver Perfil**: +1 crédito
- **Like Oferta**: +2 créditos
- **Compartir Necesidad**: +5 créditos
- **Interesado en Evento**: +3 créditos

---

## 🏆 8. Sistema de Niveles y Badges

Gamificación profunda:

```typescript
interface Level {
  number: number;
  name: string;
  requiredXP: number;
  rewards: {
    credits: number;
    unlocks: Feature[];
  };
}

const LEVELS = [
  { number: 1, name: 'Semilla', requiredXP: 0, rewards: { credits: 0 } },
  { number: 2, name: 'Brote', requiredXP: 100, rewards: { credits: 50 } },
  { number: 3, name: 'Planta', requiredXP: 300, rewards: { credits: 100 } },
  { number: 4, name: 'Árbol', requiredXP: 1000, rewards: { credits: 200 } },
  { number: 5, name: 'Bosque', requiredXP: 3000, rewards: { credits: 500 } },
  // ... hasta nivel 50
];

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'social' | 'economic' | 'environmental' | 'governance' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

  // Criterios
  criteria: {
    type: string;
    threshold: number;
  };

  // Recompensas
  rewards: {
    credits: number;
    xp: number;
    unlocks?: Feature[];
  };
}
```

**Ejemplos de Badges:**

```javascript
[
  {
    name: 'Primera Ayuda',
    description: 'Cubriste tu primera necesidad',
    icon: '🤝',
    category: 'social',
    rarity: 'common',
    criteria: { type: 'needs_covered', threshold: 1 },
    rewards: { credits: 50, xp: 100 }
  },
  {
    name: 'Héroe Local',
    description: 'Cubriste 50 necesidades comunitarias',
    icon: '🦸',
    category: 'social',
    rarity: 'epic',
    criteria: { type: 'needs_covered', threshold: 50 },
    rewards: { credits: 1000, xp: 5000 }
  },
  {
    name: 'Guardián del Planeta',
    description: 'Evitaste 1 tonelada de CO2',
    icon: '🌍',
    category: 'environmental',
    rarity: 'legendary',
    criteria: { type: 'co2_avoided', threshold: 1000 },
    rewards: { credits: 5000, xp: 10000 }
  }
]
```

---

## 🔐 9. Sistema de Moderación Descentralizada

DAO para moderación comunitaria:

```typescript
interface ModerationReport {
  id: string;
  reporter: User;
  reportedUser: User;
  reportedContent: Post | Comment | Offer;

  // Tipo de reporte
  type: 'spam' | 'abuse' | 'scam' | 'misinformation' | 'hate_speech' | 'other';
  description: string;
  evidence: Media[];

  // Votación comunitaria
  votes: ModerationVote[];
  votingEndsAt: Date;

  // Resultado
  status: 'pending' | 'reviewing' | 'resolved';
  resolution?: 'warning' | 'temporary_ban' | 'permanent_ban' | 'dismissed';
  moderatorNotes?: string;

  createdAt: Date;
}

interface ModerationVote {
  voter: User;
  action: 'dismiss' | 'warn' | 'temp_ban' | 'perm_ban';
  weight: number;               // Basado en Proof-of-Help
  reasoning?: string;
  createdAt: Date;
}
```

**Proceso:**

```
1. Usuario reporta contenido
   ↓
2. 24h de revisión comunitaria
   ↓
3. Votación ponderada (Proof-of-Help)
   ↓
4. Ejecución automática si > 60% consenso
   ↓
5. Appeal posible (revisión humana)
```

**Transparencia:**
- Todos los reportes son públicos (anónimos opcionales)
- Votos son auditables
- Historial de moderación accesible

---

## 🌐 10. Capa Híbrida Económica (Detallada)

Sistema de transición progresiva entre economías:

```typescript
enum EconomicLayer {
  TRADITIONAL   = 'traditional',     // 100% EUR
  TRANSITIONAL  = 'transitional',    // EUR + Créditos opcionales
  COLLABORATIVE = 'collaborative',   // EUR + CRD + Horas (pleno)
  RADICAL       = 'radical'          // Solo CRD + Horas (post-capitalista)
}

interface LayerConfig {
  layer: EconomicLayer;

  // Visibilidad
  showEUR: boolean;
  showCREDITS: boolean;
  showHOURS: boolean;

  // Conversiones permitidas
  allowEURToCREDITS: boolean;
  allowCREDITSToEUR: boolean;
  allowCREDITSToHOURS: boolean;

  // Límites
  maxCreditsAccumulation?: number;
  demurrageEnabled: boolean;
  demurrageRate?: number;          // % mensual

  // Incentivos
  bonusForNonMonetary: number;     // % extra por usar CRD/Hours
}
```

### Flujo de Transición

```
Usuario Nuevo (0 experiencia)
    ↓
    [Capa TRADITIONAL]
    - Ve solo EUR
    - Compra como en cualquier plataforma
    ↓
    (Completa 5 transacciones)
    ↓
    [Unlock: Créditos opcionales]
    ↓
    [Capa TRANSITIONAL]
    - Ve EUR + opción de créditos
    - Gana créditos por contribuir
    - Puede comprar con créditos (10% descuento)
    ↓
    (Usa créditos 10 veces)
    ↓
    [Unlock: Banco de Tiempo]
    ↓
    [Capa COLLABORATIVE]
    - EUR + CRD + Horas
    - Puede pagar servicios con tiempo
    - Economía del cuidado visible
    ↓
    (Completa 50 intercambios no-monetarios)
    ↓
    [Unlock: Capa Radical]
    ↓
    [Capa RADICAL]
    - Solo CRD + Horas
    - EUR relegado a conversiones
    - Vive en economía post-capitalista
```

---

## 🔄 11. WebSocket & Tiempo Real

Comunicación bidireccional instantánea:

```typescript
// Eventos de WebSocket
enum WebSocketEvent {
  // Mensajería
  MESSAGE_SENT      = 'message:sent',
  MESSAGE_RECEIVED  = 'message:received',
  MESSAGE_READ      = 'message:read',
  TYPING            = 'typing',

  // Notificaciones
  NOTIFICATION_NEW  = 'notification:new',

  // Actualizaciones en vivo
  OFFER_UPDATED     = 'offer:updated',
  NEED_PROGRESS     = 'need:progress',
  PROJECT_UPDATE    = 'project:update',

  // Presencia
  USER_ONLINE       = 'user:online',
  USER_OFFLINE      = 'user:offline',

  // Gamificación
  LEVEL_UP          = 'level:up',
  BADGE_EARNED      = 'badge:earned'
}
```

**Uso:**

```javascript
// Cliente
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: { token: localStorage.getItem('token') }
});

// Escuchar mensajes nuevos
socket.on('message:received', (message) => {
  showNotification(message);
  updateChatUI(message);
});

// Emitir evento de escritura
socket.emit('typing', { conversationId, isTyping: true });
```

---

## 📱 12. Progressive Web App (PWA)

Aplicación instalable y offline-first:

**Características:**
- **Instalable**: Añadir a pantalla de inicio
- **Offline**: Funciona sin conexión (Service Worker)
- **Push Notifications**: Notificaciones nativas
- **Background Sync**: Sincronización en segundo plano
- **Responsive**: Adaptado a todos los dispositivos

**Manifest:**

```json
{
  "name": "Comunidad Viva",
  "short_name": "ComunidadViva",
  "description": "Economía Solidaria y Transformación Social",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔧 13. API Pública (Roadmap)

Para desarrolladores externos:

```typescript
// Endpoints públicos
GET  /api/v1/communities             // Lista de comunidades
GET  /api/v1/offers                  // Ofertas públicas
GET  /api/v1/needs                   // Necesidades públicas
GET  /api/v1/projects                // Proyectos

// Webhooks
POST /api/v1/webhooks/transaction    // Notificación de transacción
POST /api/v1/webhooks/need_covered   // Necesidad cubierta
POST /api/v1/webhooks/project        // Update de proyecto

// OAuth2
POST /api/v1/oauth/authorize
POST /api/v1/oauth/token
```

**Casos de Uso:**
- Integración con comercios locales
- Plugins para WordPress/Shopify
- Apps móviles nativas
- Bots de Telegram

---

## 📚 Resumen de Módulos

| Módulo | Estado | Prioridad | Impacto |
|--------|--------|-----------|---------|
| Red Social | ✅ Implementado | Alta | Alto |
| Mensajería | ✅ Implementado | Alta | Alto |
| Analytics | ✅ Implementado | Media | Medio |
| Notificaciones | ✅ Implementado | Alta | Alto |
| Búsqueda | ✅ Implementado | Media | Medio |
| Reviews | ✅ Implementado | Alta | Alto |
| Stories | ✅ Implementado | Media | Medio |
| Flash Deals | ✅ Implementado | Media | Medio |
| Badges | ✅ Implementado | Media | Medio |
| Moderación DAO | 🔄 En progreso | Alta | Alto |
| WebSocket | ✅ Implementado | Alta | Alto |
| PWA | 🔄 En progreso | Media | Medio |
| API Pública | 📋 Planificado | Media | Alto |

---

**Actualizado**: Enero 2025
**Versión Whitepaper**: 1.0
**Próxima Revisión**: Marzo 2025
