# API Sistema Híbrido de Capas Económicas

Sistema revolucionario que permite la coexistencia de múltiples paradigmas económicos en una sola aplicación.

## 🌱 Filosofía

> "La misma app derrumba el capitalismo... suavemente"

Tres capas de realidad económica:
- **TRADITIONAL**: Capitalismo familiar con créditos
- **TRANSITIONAL**: Medición suave, olvido automático (30 días)
- **GIFT_PURE**: Regalo puro, sin cálculo, sin tracking
- **CHAMELEON**: Se adapta a quien interactúas (puente universal)

## 📡 Endpoints

### Migración entre Capas

#### `POST /hybrid/migrate`
Migrar usuario a una capa económica diferente

**Request:**
```json
{
  "toLayer": "GIFT_PURE",
  "reason": "Quiero experimentar el regalo puro"
}
```

**Response:**
```json
{
  "title": "Has entrado al regalo puro 🌳",
  "body": "Ya no hay cuentas que llevar. Solo flujo y celebración.",
  "released": ["Créditos al común", "Identidad transaccional"],
  "gained": ["Libertad total", "Presencia en el regalo", "Cero cálculo mental"]
}
```

#### `GET /hybrid/layer`
Obtener capa económica actual del usuario

**Response:**
```json
{
  "economicLayer": "GIFT_PURE",
  "layerConfig": {},
  "softCredits": null,
  "credits": 0,
  "lastLayerChange": "2025-10-07T12:00:00.000Z",
  "layer": "GIFT_PURE"
}
```

#### `GET /hybrid/migrations`
Historial de migraciones del usuario

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user-id",
    "fromLayer": "TRADITIONAL",
    "toLayer": "TRANSITIONAL",
    "reason": "Quiero menos presión",
    "creditsConverted": 0,
    "migratedAt": "2025-10-01T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "userId": "user-id",
    "fromLayer": "TRANSITIONAL",
    "toLayer": "GIFT_PURE",
    "reason": "Listo para el regalo",
    "creditsConverted": 150,
    "migratedAt": "2025-10-07T12:00:00.000Z"
  }
]
```

---

### Abundancia

#### `POST /hybrid/abundance`
Anunciar abundancia (anónimo en GIFT_PURE)

**Request:**
```json
{
  "what": "20 tomates maduros",
  "quantity": "20",
  "where": "Huerto comunitario",
  "lat": 40.4168,
  "lng": -3.7038,
  "availableUntil": "2025-10-10T18:00:00.000Z",
  "visibleToLayers": ["TRADITIONAL", "TRANSITIONAL", "GIFT_PURE"]
}
```

**Response (GIFT_PURE):**
```json
{
  "id": "abundance-id",
  "message": "🎁 Abundancia anunciada: 20 tomates maduros",
  "anonymous": true
}
```

**Response (TRADITIONAL/TRANSITIONAL):**
```json
{
  "id": "abundance-id",
  "message": "✨ Has compartido: 20 tomates maduros",
  "anonymous": false
}
```

#### `GET /hybrid/abundance`
Feed de abundancia filtrado por capa del usuario

**Query params:**
- `communityId` (optional): Filtrar por comunidad
- `limit` (optional, default: 50): Número de resultados

**Response:**
```json
[
  {
    "id": "uuid",
    "what": "20 tomates maduros",
    "quantity": "20",
    "where": "Huerto comunitario",
    "lat": 40.4168,
    "lng": -3.7038,
    "providerId": null,  // null en GIFT_PURE
    "visibleToLayers": ["TRADITIONAL", "TRANSITIONAL", "GIFT_PURE"],
    "takenBy": [],
    "availableUntil": "2025-10-10T18:00:00.000Z",
    "createdAt": "2025-10-07T10:00:00.000Z"
  }
]
```

#### `POST /hybrid/abundance/:id/take`
Tomar abundancia anunciada

**Response:**
```json
{
  "message": "✨ Has recibido: 20 tomates maduros",
  "what": "20 tomates maduros",
  "where": "Huerto comunitario"
}
```

---

### Necesidades

#### `POST /hybrid/needs`
Expresar necesidad (puede ser anónima)

**Request:**
```json
{
  "what": "Ayuda para reparar bicicleta",
  "why": "Para ir al trabajo",
  "where": "Plaza Mayor",
  "urgency": "SOON",
  "anonymous": false,
  "visibleToLayers": ["TRADITIONAL", "TRANSITIONAL", "GIFT_PURE"]
}
```

**Urgency options:**
- `URGENT`: Urgente
- `SOON`: Pronto
- `WHENEVER`: Cuando sea

**Response:**
```json
{
  "id": "need-id",
  "message": "🙏 Has expresado una necesidad: Ayuda para reparar bicicleta",
  "anonymous": false
}
```

#### `GET /hybrid/needs`
Feed de necesidades filtrado por capa del usuario

**Query params:**
- `communityId` (optional): Filtrar por comunidad
- `urgency` (optional): URGENT, SOON, WHENEVER
- `limit` (optional, default: 50): Número de resultados

**Response:**
```json
[
  {
    "id": "uuid",
    "what": "Ayuda para reparar bicicleta",
    "why": "Para ir al trabajo",
    "where": "Plaza Mayor",
    "urgency": "SOON",
    "requesterId": "user-id",  // null si es anónima
    "visibleToLayers": ["TRADITIONAL", "TRANSITIONAL", "GIFT_PURE"],
    "fulfilledBy": [],
    "fulfilledAt": null,
    "createdAt": "2025-10-07T10:00:00.000Z"
  }
]
```

#### `POST /hybrid/needs/:id/fulfill`
Cumplir una necesidad expresada

**Response:**
```json
{
  "message": "💚 Has ayudado con: Ayuda para reparar bicicleta",
  "what": "Ayuda para reparar bicicleta"
}
```

---

### Celebraciones

#### `GET /hybrid/celebrations`
Celebraciones anónimas de la comunidad

**Query params:**
- `communityId` (optional): Filtrar por comunidad
- `limit` (optional, default: 20): Número de resultados

**Response:**
```json
[
  {
    "id": "uuid",
    "event": "Una necesidad encontró abundancia 💝",
    "description": null,
    "emoji": "🎁",
    "communityId": "community-id",
    "approximateParticipants": null,
    "createdAt": "2025-10-07T12:00:00.000Z"
  }
]
```

---

### Estadísticas

#### `GET /hybrid/stats`
Estadísticas de distribución de capas en la comunidad

**Query params:**
- `communityId` (optional): Filtrar por comunidad específica (si no se proporciona, estadísticas globales)

**Response:**
```json
{
  "distribution": {
    "traditional": 45,
    "transitional": 32,
    "gift": 18,
    "chameleon": 5
  },
  "percentages": {
    "traditional": 45,
    "transitional": 32,
    "gift": 18,
    "chameleon": 5
  },
  "total": 100
}
```

---

### Eventos Puente (Bridge Events)

#### `GET /hybrid/bridge-events`
Obtener eventos puente activos

**Query params:**
- `communityId` (optional): Filtrar por comunidad

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "GIFT_DAY",
    "title": "Domingo de Regalo 🎁",
    "description": "Todo gratis hoy. Experimenta el regalo puro sin compromiso.",
    "forceLayer": "GIFT_PURE",
    "startsAt": "2025-10-13T00:00:00.000Z",
    "endsAt": "2025-10-13T23:59:59.000Z",
    "recurring": true,
    "frequency": "FIRST_SUNDAY",
    "communityId": "community-id"
  }
]
```

**Bridge Event Types:**
- `GIFT_DAY`: Día de regalo (todo gratis)
- `DEBT_AMNESTY`: Amnistía de deudas
- `ABUNDANCE_FEST`: Festival de abundancia
- `LAYER_EXPERIMENT`: Experimento temporal de capa

#### `POST /hybrid/bridge-events`
Crear evento puente

**Request:**
```json
{
  "type": "GIFT_DAY",
  "title": "Domingo de Regalo 🎁",
  "description": "Todo gratis hoy. Experimenta el regalo puro sin compromiso.",
  "forceLayer": "GIFT_PURE",
  "startsAt": "2025-10-13T00:00:00.000Z",
  "endsAt": "2025-10-13T23:59:59.000Z",
  "recurring": true,
  "frequency": "FIRST_SUNDAY",
  "communityId": "community-id"
}
```

---

### Configuración de Comunidad

#### `GET /hybrid/community/:communityId/config`
Obtener configuración de capas de la comunidad

**Response:**
```json
{
  "id": "uuid",
  "communityId": "community-id",
  "defaultLayer": "TRADITIONAL",
  "allowMixedMode": true,
  "traditionalCount": 45,
  "transitionalCount": 32,
  "giftCount": 18,
  "chameleonCount": 5,
  "autoGiftDays": true,
  "autoDebtAmnesty": true,
  "giftThreshold": 60
}
```

#### `PUT /hybrid/community/:communityId/config`
Actualizar configuración de capas de la comunidad

**Request:**
```json
{
  "defaultLayer": "TRANSITIONAL",
  "allowMixedMode": true,
  "autoGiftDays": true,
  "autoDebtAmnesty": false,
  "giftThreshold": 70
}
```

#### `GET /hybrid/community/:communityId/gift-threshold`
Verificar si comunidad alcanzó umbral para migración a GIFT_PURE

**Response (umbral NO alcanzado):**
```json
{
  "shouldPropose": false,
  "currentPercentage": 45,
  "threshold": 60
}
```

**Response (umbral alcanzado):**
```json
{
  "shouldPropose": true,
  "currentPercentage": 65,
  "threshold": 60,
  "message": "🌳 ¡65% de la comunidad ya vive en regalo puro!\n\n¿Quieren migrar toda la comunidad al modo GIFT_PURE?"
}
```

---

## 🔄 Flujo de Migración

### Migración Progresiva (Recomendada)

```
TRADITIONAL → TRANSITIONAL → GIFT_PURE
```

1. **TRADITIONAL → TRANSITIONAL**
   - Créditos se vuelven "soft credits" (opcionales)
   - Historial detallado desaparece
   - Olvido automático después de 30 días
   - Métricas colectivas en vez de individuales

2. **TRANSITIONAL → GIFT_PURE**
   - Soft credits donados al común
   - Celebración anónima de liberación
   - Cero tracking personal
   - Solo flujo y abundancia

### Migración Directa

```
TRADITIONAL → GIFT_PURE
```

- Salto cuántico directo
- Todos los créditos liberados al común
- Total libertad inmediata

### Retorno (Sin Penalización)

Cualquier migración es reversible sin juicio:

```
GIFT_PURE → TRANSITIONAL (regalo de 50 soft credits)
GIFT_PURE → TRADITIONAL (regalo de 100 créditos)
TRANSITIONAL → TRADITIONAL (créditos preservados)
```

### Modo Camaleón

```
Cualquier capa → CHAMELEON → Cualquier capa
```

- Traductor universal entre capas
- Se adapta a quien interactúas
- Facilita puentes entre paradigmas

---

## 🌉 Sistema de Puentes

### Eventos Automáticos (si configurado)

1. **Gift Days** (Días de Regalo)
   - Frecuencia: Primer domingo de mes (configurable)
   - Durante el evento: Todos en capa GIFT_PURE
   - Propósito: Experimentar sin compromiso

2. **Debt Amnesty** (Amnistía de Deudas)
   - Frecuencia: Equinoccios (configurable)
   - Durante el evento: Todas las deudas perdonadas
   - Propósito: Nuevo comienzo limpio

### Eventos Manuales

Crear eventos personalizados para:
- Festivales de abundancia
- Experimentos temporales
- Transiciones comunitarias

---

## 🎯 Casos de Uso

### Usuario Individual

```javascript
// 1. Ver mi capa actual
GET /hybrid/layer

// 2. Migrar a transición
POST /hybrid/migrate
{
  "toLayer": "TRANSITIONAL",
  "reason": "Quiero menos presión con los créditos"
}

// 3. Anunciar abundancia
POST /hybrid/abundance
{
  "what": "Clases de guitarra",
  "where": "Mi casa",
  "visibleToLayers": ["TRADITIONAL", "TRANSITIONAL"]
}

// 4. Ver necesidades de la comunidad
GET /hybrid/needs?urgency=URGENT
```

### Comunidad

```javascript
// 1. Ver estadísticas de capas
GET /hybrid/stats?communityId=xxx

// 2. Verificar si alcanzamos umbral de regalo
GET /hybrid/community/xxx/gift-threshold

// 3. Crear evento puente
POST /hybrid/bridge-events
{
  "type": "GIFT_DAY",
  "title": "Día de Experimentación",
  "startsAt": "2025-10-20T00:00:00Z",
  "endsAt": "2025-10-20T23:59:59Z"
}

// 4. Configurar comunidad
PUT /hybrid/community/xxx/config
{
  "giftThreshold": 50,
  "autoGiftDays": true
}
```

---

## 💡 Mejores Prácticas

### Para Usuarios

1. **Empieza en TRADITIONAL** - Familiar y seguro
2. **Experimenta en eventos puente** - Sin compromiso
3. **Migra cuando te sientas list@** - Sin presión
4. **Regresa si lo necesitas** - Sin juicio

### Para Comunidades

1. **Habilitar modo mixto** - Permitir coexistencia de capas
2. **Crear eventos puente regulares** - Facilitar experimentación
3. **Configurar umbral razonable** - 60-70% para propuesta de migración total
4. **Celebrar las migraciones** - Reconocer la evolución colectiva

---

## 🔐 Seguridad y Privacidad

- **GIFT_PURE**: Anuncios anónimos por defecto
- **Celebraciones**: Siempre anónimas
- **Necesidades**: Opcional expresar anónimamente
- **Historial**: Solo visible para el usuario
- **Migraciones**: Privadas, sin juicio público

---

## 📊 Evolución Natural

El sistema está diseñado para evolución orgánica:

```
Año 1: 70% TRADITIONAL, 25% TRANSITIONAL, 5% GIFT_PURE
Año 2: 50% TRADITIONAL, 30% TRANSITIONAL, 20% GIFT_PURE
Año 3: 20% TRADITIONAL, 30% TRANSITIONAL, 50% GIFT_PURE
Año 4: 10% TRADITIONAL, 10% TRANSITIONAL, 80% GIFT_PURE
```

Cuando 60%+ está en GIFT_PURE, se propone migración total de la comunidad.

---

## 🌳 Filosofía del Regalo

En GIFT_PURE:
- No hay tracking de quien da/recibe
- No hay deuda ni obligación
- Solo celebración de flujo
- Abundancia compartida libremente
- Confianza total en el sistema

> "El verdadero regalo es dar sin esperar nada a cambio, ni siquiera reconocimiento"
