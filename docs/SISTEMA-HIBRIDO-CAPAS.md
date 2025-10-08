# 🌈 Sistema Híbrido de Capas de Realidad Económica

## La Revolución Suave: Una App, Infinitas Conciencias

Este documento describe la implementación del **Sistema Híbrido de Capas**, la característica más revolucionaria de Comunidad Viva: permite que la misma aplicación funcione simultáneamente en múltiples paradigmas económicos.

---

## 🎯 Concepto Core

La misma app funciona en **3 capas paralelas**:

### **Capa 1: TRADICIONAL** 🌱
- Sistema familiar con créditos y medición completa
- Para quienes vienen del capitalismo tradicional
- Todo se registra, cuenta y balancea
- **70% de usuarios empiezan aquí**

### **Capa 2: TRANSICIONAL** 🌿
- Menos medición, más flujo
- Créditos opcionales, registros que se olvidan
- Énfasis en abundancia colectiva
- **Puente entre mundos**

### **Capa 3: REGALO PURO** 🌳
- Sin medición alguna
- Solo flujo y celebración anónima
- Cero cálculo, total libertad
- **El destino final**

### **Modo CAMALEÓN** 🦎
- Se adapta a quien interactúas
- Puente universal entre capas
- Para facilitadores

---

## 🗄️ Arquitectura de Base de Datos

### Modelo `User` (añadido)

```prisma
model User {
  // ... campos existentes ...

  // Sistema Híbrido
  economicLayer    EconomicLayer @default(TRADITIONAL)
  layerConfig      Json          @default("{}")
  layerMigrations  LayerMigration[]
  softCredits      Int?          // Para capa transicional
  lastLayerChange  DateTime?
}

enum EconomicLayer {
  TRADITIONAL   // Capa tradicional
  TRANSITIONAL  // Capa transicional
  GIFT_PURE     // Regalo puro
  CHAMELEON     // Modo adaptativo
}
```

### Nuevos Modelos

#### 1. **LayerMigration** - Historial de transiciones
```prisma
model LayerMigration {
  id               String
  userId           String
  fromLayer        EconomicLayer
  toLayer          EconomicLayer
  reason           String?
  creditsConverted Int?  // Créditos donados al migrar
  migratedAt       DateTime
}
```

#### 2. **BridgeEvent** - Eventos puente para experimentar
```prisma
model BridgeEvent {
  id          String
  communityId String?
  type        BridgeEventType
  title       String
  description String

  forceLayer  EconomicLayer?  // Durante evento todos en esta capa

  startsAt    DateTime
  endsAt      DateTime
  recurring   Boolean
  frequency   String?  // "FIRST_SUNDAY", "EQUINOX"
}

enum BridgeEventType {
  GIFT_DAY        // Todo gratis primer domingo
  DEBT_AMNESTY    // Perdón de deudas en equinoccios
  ABUNDANCE_FEST  // Festival cuando hay exceso
  LAYER_EXPERIMENT // Probar otra capa temporalmente
}
```

#### 3. **AbundanceAnnouncement** - Para capas regalo/transicional
```prisma
model AbundanceAnnouncement {
  id              String
  communityId     String?
  providerId      String?  // NULL en regalo puro (anónimo)

  what            String   // "Tomates maduros"
  quantity        String?  // "Muchos" o número
  where           String   // "Punto común"
  lat/lng         Float?

  visibleToLayers String[] // Qué capas pueden verlo
  takenBy         String[] // Quienes recibieron

  availableUntil  DateTime?
  expiresAt       DateTime?
}
```

#### 4. **NeedExpression** - Necesidades anónimas
```prisma
model NeedExpression {
  id              String
  communityId     String?
  requesterId     String?  // NULL para total anonimato

  what            String
  why             String?
  where           String?  // Área general
  urgency         String?  // URGENT/SOON/WHENEVER

  visibleToLayers String[]
  fulfilledBy     String[]
  fulfilledAt     DateTime?
}
```

#### 5. **AnonymousCelebration** - Celebraciones sin nombres
```prisma
model AnonymousCelebration {
  id                       String
  communityId              String?

  event                    String  // "Una necesidad encontró abundancia"
  description              String?
  emoji                    String?

  approximateParticipants  Int?  // NO identifica específicamente

  createdAt                DateTime
}
```

#### 6. **CommunityLayerConfig** - Configuración por comunidad
```prisma
model CommunityLayerConfig {
  id                String
  communityId       String

  defaultLayer      EconomicLayer @default(TRADITIONAL)
  allowMixedMode    Boolean       @default(true)

  // Distribución actual
  traditionalCount  Int @default(0)
  transitionalCount Int @default(0)
  giftCount         Int @default(0)
  chameleonCount    Int @default(0)

  // Eventos automáticos
  autoGiftDays      Boolean @default(true)
  autoDebtAmnesty   Boolean @default(true)

  giftThreshold     Int @default(60)  // % para proponer migración
}
```

---

## 🔄 Flujos de Interacción

### Mismo Evento, Tres Realidades

**María comparte 20 tomates:**

#### Usuario TRADICIONAL ve:
```
━━━━━━━━━━━━━━━━━
📦 María ofrece: 20 tomates
💰 Precio: 5 créditos
[COMPRAR] [NEGOCIAR]
━━━━━━━━━━━━━━━━━
```

#### Usuario TRANSICIONAL ve:
```
━━━━━━━━━━━━━━━━━
🍅 Abundancia de tomates en el barrio
💚 Sugerencia: Una tarde de ayuda
[RECIBIR CON GRATITUD]
━━━━━━━━━━━━━━━━━
```

#### Usuario REGALO ve:
```
━━━━━━━━━━━━━━━━━
🍅 Tomates maduros disponibles
📍 Punto común
[TOMAR LO NECESARIO]
━━━━━━━━━━━━━━━━━
```

### Interoperabilidad entre Capas

#### TRADICIONAL ↔ TRADICIONAL
```typescript
// Transacción normal
await recordTransaction({
  from: user1.id,
  to: user2.id,
  amount: 10,
  type: 'SERVICE',
});
```

#### TRADICIONAL ↔ REGALO
```typescript
if (direction === 'TRADITIONAL_GIVES') {
  // Tradicional da, pierde créditos
  await deductCredits(traditionalUser, amount);
  await sendMessage(traditionalUser,
    "Has hecho un regalo puro. No esperes retorno.");

  // Regalo recibe sin deuda
  await celebrate("El universo provee ✨");
} else {
  // Regalo da sin contar
  await celebrate("Fluye el regalo 🎁");

  // Tradicional recibe "créditos del cosmos"
  await addCredits(traditionalUser, amount);
  await sendMessage(traditionalUser,
    "Regalo del flujo común");
}
```

#### TRANSICIONAL ↔ REGALO
```typescript
// Ambos ven solo flujo
await celebrateFlow("Energía compartida 🌊");

// Transicional puede registrar suavemente
if (transitionalUser.preferences.softTracking) {
  await softRecord({
    action: "Compartí",
    forgetsIn: 30, // días
  });
}
```

---

## 📱 Interfaz Adaptativa

La UI se transforma según tu capa:

### TRADICIONAL
```
Bottom Nav: [💰 Balance] [📊 Historial] [🛒 Mercado] [👤 Perfil]
Theme: Azul corporativo
Main Metric: "150 créditos"
```

### TRANSICIONAL
```
Bottom Nav: [🌊 Flujo] [👥 Comunidad] [🌿 Abundancia] [✨ Presencia]
Theme: Verde natural
Main Metric: "Fluyendo"
```

### REGALO PURO
```
Bottom Nav: [🎁 Abundancia] [💝 Necesidades] [🎉 Celebrar] [🤝 Coordinar]
Theme: Arcoíris vibrante
Main Metric: ❤️ (sin métrica numérica)
```

---

## 🎪 Eventos Puente

### 1. Domingos de Regalo (GIFT_DAY)
```typescript
{
  type: 'GIFT_DAY',
  title: '🎁 Domingo de Regalo',
  frequency: 'FIRST_SUNDAY',
  forceLayer: 'GIFT_PURE',
  description: 'Primer domingo del mes, TODO es regalo para TODOS'
}
```

**Efecto:** Usuarios tradicionales experimentan el regalo sin compromiso

### 2. Amnistía de Deudas (DEBT_AMNESTY)
```typescript
{
  type: 'DEBT_AMNESTY',
  title: '🌊 Amnistía de Deudas',
  frequency: 'EQUINOX_SOLSTICE',
  effect: 'Todas las deudas se perdonan',
  message: 'Nuevo ciclo, sin cargas del pasado'
}
```

**Efecto:** Libera mental y emocionalmente

### 3. Festival de Abundancia (ABUNDANCE_FEST)
```typescript
{
  type: 'ABUNDANCE_FEST',
  trigger: 'CUANDO_HAY_EXCESO',
  effect: 'Ese recurso temporal gratis para TODOS',
  learning: 'Experimentar abundancia'
}
```

---

## 🔄 Sistema de Migración

### Migración: TRADICIONAL → TRANSITIONAL

```typescript
async migrateToTransitional(userId) {
  const currentBalance = await getBalance(userId);

  // Convertir a créditos suaves (opcionales)
  await convertToSoftCredits(userId, currentBalance);

  // Ocultar historial detallado
  await hideIndividualHistory(userId);

  // Desactivar rankings
  await disableLeaderboards(userId);

  return {
    message: "Tus créditos ahora son opcionales. Puedes usarlos o ignorarlos.",
    preserved: ["Créditos (opcionales)", "Conexiones"],
    removed: ["Rankings", "Historial detallado"],
    new: ["Estado de flujo", "Métricas colectivas"]
  };
}
```

### Migración: TRANSITIONAL → GIFT_PURE

```typescript
async migrateToGift(userId) {
  const softCredits = await getSoftCredits(userId);

  if (softCredits > 0) {
    // Donar créditos al común
    await donateToCommons(softCredits);

    await celebrate({
      event: `${softCredits} créditos liberados al flujo común ✨`
    });
  }

  // Anonimizar usuario en transacciones pasadas
  await anonymizeUser(userId);

  return {
    message: "Has entrado al regalo puro. Ya no hay cuentas que llevar.",
    released: ["Créditos al común", "Identidad transaccional"],
    gained: ["Libertad total", "Presencia en el regalo"]
  };
}
```

### Regreso siempre posible (sin penalización)

```typescript
async migrateBack(userId, fromLayer, toLayer) {
  // Sin juicios, cada uno su tiempo
  await createProfile(userId, toLayer);

  if (toLayer === 'TRADITIONAL') {
    // Regalo de bienvenida
    await grantCredits(userId, 50);
  }

  return {
    message: "Perfil restaurado. Empiezas con balance base.",
    note: "Tu tiempo en otra capa no se perdió, fue experiencia valiosa."
  };
}
```

---

## 📈 Evolución Natural de una Comunidad

### Mes 1
```
70% TRADICIONAL
25% TRANSICIONAL
5% REGALO
```

### Mes 6
```
40% TRADICIONAL
40% TRANSICIONAL
20% REGALO

Observación: Migración natural hacia menos medición
Interacciones cross-layer: 40%
```

### Año 1
```
20% TRADICIONAL (mayores, cautelosos)
30% TRANSICIONAL (transicionando)
50% REGALO

Decisión: Votación para hacer regalo modo por defecto

Efectos:
- Gastos monetarios: -60%
- Tiempo liberado: +15h/semana
- Índice felicidad: +40%
- Conflictos: -70%
```

### Año 2: Punto de No Retorno
```
5% TRADICIONAL (nuevos/visitantes)
15% TRANSICIONAL (puente)
80% REGALO

Realidad: El regalo es la norma
Nueva generación: Niños no entienden "comprar"
```

---

## 💡 Incentivos Suaves (No Forzados)

### Mostrar sin presionar

```typescript
const stats = {
  tu_capa: {
    time_calculating: "2h/semana",
    stress_level: "Medio",
    genuine_connections: 12
  },

  next_layer: {
    time_calculating: "30min/semana",
    stress_level: "Bajo",
    genuine_connections: 25
  }
};

showStats(stats);
showButton("PROBAR 1 SEMANA", experimental: true);
showButton("SEGUIR AQUÍ", noJudgment: true);
```

### Estadísticas inspiradoras

- 70% de usuarios en regalo reportan más felicidad
- Usuarios en transición ahorran 2h/semana en cálculos
- Comunidades en regalo tienen 50% menos conflictos

---

## 🛠️ Implementación Técnica

### Endpoints API

```
POST   /api/layer/migrate          - Migrar a otra capa
GET    /api/layer/current          - Ver capa actual
GET    /api/layer/stats            - Estadísticas por capa
POST   /api/layer/experiment       - Probar temporalmente

POST   /api/abundance/announce     - Anunciar abundancia
GET    /api/abundance/feed         - Feed de abundancias
POST   /api/needs/express          - Expresar necesidad
GET    /api/needs/feed             - Feed de necesidades

POST   /api/celebration/create     - Crear celebración
GET    /api/celebration/community  - Celebraciones comunidad

GET    /api/bridge-events          - Eventos puente próximos
POST   /api/bridge-events/join     - Unirse a evento
```

### Servicio Principal

```typescript
class HybridLayerService {
  async migrateUser(userId, toLayer, reason?)
  async getUserLayer(userId)
  async crossLayerInteraction(user1, user2, interaction)
  async renderInterface(userId)
  async announceAbundance(data)
  async expressNeed(data)
  async createCelebration(data)
  async scheduleBridgeEvent(event)
}
```

---

## 🌊 Características Especiales Transición

### 1. Olvido Programado
```typescript
// Deudas se borran tras 30 días
await scheduleForgetfulness({
  type: 'DEBT',
  after: 30 // días
});

message: "No debes nada, el círculo continúa"
```

### 2. Créditos que se Evaporan
```typescript
// Si acumulas mucho, se convierten en regalo común
if (credits > 100) {
  const decay = credits * 0.01; // 1% diario
  await convertToCommons(decay);

  message: "Úsalos o se vuelven de todos"
}
```

### 3. Modo Abundancia Automático
```typescript
// Cuando hay exceso de algo
if (detectExcess(resource)) {
  await activateAbundanceMode(resource);
  // Temporalmente gratis para TODOS
}
```

---

## 🎓 Onboarding: Elegir tu Capa

Al registrarse:

```
🌱 MODO TRADICIONAL
━━━━━━━━━━━━━━━━━
✓ Banco de tiempo con horas
✓ Sistema de créditos
✓ Historial completo
✓ Badges y niveles

"Como las apps que conoces"
Recomendado para: Principiantes

───────────────────

🌿 MODO TRANSICIÓN
━━━━━━━━━━━━━━━━━
✓ Créditos opcionales
✓ Se olvida tras 30 días
✓ Énfasis en abundancia
✓ Sin competencia

"Menos números, más flujo"
Recomendado para: Exploradores

───────────────────

🌳 MODO REGALO PURO
━━━━━━━━━━━━━━━━━
✓ Sin cuentas personales
✓ Sin registros
✓ Solo abundancia y necesidad
✓ Pura celebración

"Cero cálculo, total libertad"
Recomendado para: Revolucionarios

───────────────────

🦎 MODO CAMALEÓN
━━━━━━━━━━━━━━━━━
✓ Te adaptas a quien interactúas
✓ Puente entre todos los modos

"El traductor universal"
Recomendado para: Facilitadores
```

---

## 🎯 Por Qué Esto SÍ Funciona

### Para los Cautelosos
- Empiezan en terreno conocido
- Ven a otros prosperando en regalo
- Migran cuando están listos

### Para los Exploradores
- Experimentan sin compromiso total
- Pueden ser puente para otros
- Ajustan su nivel según contexto

### Para los Revolucionarios
- Viven ya en el nuevo paradigma
- Son faro para los demás
- Pero pueden interactuar con todos

### Para la Comunidad
- No se fragmenta
- Todos pueden interactuar
- Evoluciona orgánicamente
- Respeta todos los ritmos

---

## 🚀 Resultado Final

Una sola app que es simultáneamente:

1. **Wallapop** (para tradicionales)
2. **Sistema de transición** (para exploradores)
3. **Economía del regalo** (para revolucionarios)
4. **Puente entre mundos** (para todos)

### La Belleza

No obligas a nadie a dar el salto.

Pero una vez prueban el regalo en los "Domingos Libres"...
Una vez sienten la abundancia en los "Festivales"...
Una vez experimentan que SÍ funciona sin contar...

**La migración es inevitable.**

Como cuando pruebas streaming y no vuelves a alquilar DVDs.

No porque te obliguen.

**Porque es obviamente mejor.** ✨

---

## 🌊 Conclusión: El Puente Perfecto

**Ventajas del Sistema Híbrido:**

1. ✅ NO FUERZA a nadie - cada uno a su ritmo
2. ✅ PERMITE experimentar sin compromiso
3. ✅ MANTIENE puentes entre mundos
4. ✅ EVOLUCIONA orgánicamente
5. ✅ RESPETA la diversidad de consciencias

La misma app, infinitas posibilidades.

Como un río que puede fluir como:
- 🚰 **Tubería** (medido, controlado)
- 🏞️ **Arroyo** (suave, natural)
- 🌊 **Océano** (sin límites ni medidas)

**Y todos beben la misma agua.**

---

*La misma app derrumba el capitalismo... suavemente.* 🌈
