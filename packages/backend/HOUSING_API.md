# Housing System API Documentation

## Overview

El sistema de vivienda de Truk proporciona cuatro subsistemas principales:

1. **Banco de Espacios (Space Bank)** - Compartir espacios físicos (huertos, talleres, almacenes, etc.)
2. **Hospedaje Temporal** - Alojamiento de corto plazo entre miembros
3. **Cooperativas de Vivienda** - Creación y gestión de co-housing
4. **Garantía Comunitaria** - Aval comunitario para acceder a vivienda tradicional

Todos los endpoints están bajo el prefijo `/housing`

Base URL: `http://localhost:4000/housing`

---

## 1. Banco de Espacios (Space Bank)

### 1.1 Crear Espacio

```http
POST /housing/spaces
Authorization: Bearer {token}
```

**Body:**
```json
{
  "type": "GARDEN|WORKSHOP|STORAGE|PARKING|KITCHEN|MEETING_ROOM|OTHER",
  "title": "Huerto comunitario en Malasaña",
  "description": "Espacio de 50m2 para cultivar vegetales",
  "capacity": 10,
  "size": 50.0,
  "exchangeType": "FREE|EUR|CREDITS|TIME_HOURS|MIXED",
  "pricePerHour": 5.0,          // si exchangeType = EUR o MIXED
  "creditsPerHour": 10,         // si exchangeType = CREDITS o MIXED
  "hoursPerHour": 1.0,          // si exchangeType = TIME_HOURS o MIXED
  "isFree": false,
  "minReputation": 100,         // Reputación mínima requerida
  "communityId": "uuid",        // opcional
  "address": "Calle del Pez 1",
  "latitude": 40.4268,
  "longitude": -3.7038,
  "images": ["url1", "url2"],
  "amenities": ["WIFI", "TOOLS", "ELECTRICITY"],
  "rules": "No fumar, limpiar después de usar",
  "availability": {
    "monday": { "from": "09:00", "to": "18:00" },
    "tuesday": { "from": "09:00", "to": "18:00" }
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "ownerId": "uuid",
  "type": "GARDEN",
  "title": "Huerto comunitario en Malasaña",
  "status": "ACTIVE",
  "createdAt": "2025-10-10T12:00:00Z",
  ...
}
```

### 1.2 Buscar Espacios

```http
GET /housing/spaces?type=GARDEN&communityId=uuid&isFree=true&lat=40.4268&lng=-3.7038&radiusKm=5
```

**Query Parameters:**
- `type` - Tipo de espacio (GARDEN, WORKSHOP, etc.)
- `communityId` - Filtrar por comunidad
- `isFree` - Solo espacios gratuitos (true/false)
- `exchangeType` - Tipo de intercambio (EUR, CREDITS, etc.)
- `lat`, `lng`, `radiusKm` - Búsqueda geográfica

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "GARDEN",
    "title": "Huerto comunitario",
    "owner": { "id": "uuid", "name": "María" },
    "exchangeType": "FREE",
    "latitude": 40.4268,
    "longitude": -3.7038,
    ...
  }
]
```

### 1.3 Ver Detalle de Espacio

```http
GET /housing/spaces/:id
```

**Response:**
```json
{
  "id": "uuid",
  "owner": {
    "id": "uuid",
    "name": "María García",
    "generosityScore": 850
  },
  "type": "GARDEN",
  "title": "Huerto comunitario",
  "bookings": [
    {
      "id": "uuid",
      "booker": { "name": "Juan" },
      "startTime": "2025-10-15T10:00:00Z",
      "endTime": "2025-10-15T14:00:00Z",
      "status": "CONFIRMED"
    }
  ],
  ...
}
```

### 1.4 Reservar Espacio

```http
POST /housing/spaces/:id/book
Authorization: Bearer {token}
```

**Body:**
```json
{
  "startTime": "2025-10-15T10:00:00Z",
  "endTime": "2025-10-15T14:00:00Z",
  "message": "Me gustaría usar el espacio para plantar tomates",
  "participants": 3
}
```

**Validaciones:**
- Usuario debe tener reputación mínima requerida
- Usuario debe tener créditos suficientes (si aplica)
- Horario debe estar disponible

**Response:**
```json
{
  "id": "uuid",
  "spaceId": "uuid",
  "bookerId": "uuid",
  "status": "PENDING",
  "startTime": "2025-10-15T10:00:00Z",
  "endTime": "2025-10-15T14:00:00Z",
  "hours": 4.0,
  "paidEur": 0,
  "paidCredits": 40,
  "paidHours": 0,
  "message": "Me gustaría usar el espacio...",
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 1.5 Aprobar Reserva de Espacio

```http
POST /housing/spaces/bookings/:bookingId/approve
Authorization: Bearer {token}
```

**Permisos:** Solo el dueño del espacio

**Response:**
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "approvedAt": "2025-10-10T12:30:00Z"
}
```

### 1.6 Completar Uso de Espacio

```http
POST /housing/spaces/bookings/:bookingId/complete
Authorization: Bearer {token}
```

**Body:**
```json
{
  "ownerReview": {
    "rating": 5,
    "comment": "Excelente usuario, dejó todo limpio"
  },
  "bookerReview": {
    "rating": 5,
    "comment": "Espacio perfecto para el huerto"
  }
}
```

**Permisos:** Dueño o reservador

**Efectos:**
- Transfiere créditos del reservador al dueño
- Crea reseñas bidireccionales
- Actualiza reputación de ambos usuarios

**Response:**
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "completedAt": "2025-10-15T14:00:00Z",
  "reviews": [...]
}
```

---

## 2. Hospedaje Temporal

### 2.1 Crear Alojamiento

```http
POST /housing/temporary
Authorization: Bearer {token}
```

**Body:**
```json
{
  "type": "OFFER|REQUEST",
  "accommodationType": "PRIVATE_ROOM|SHARED_ROOM|COUCH|CAMPING",
  "title": "Habitación privada en centro",
  "description": "Habitación luminosa con baño compartido",
  "beds": 1,
  "maxGuests": 2,
  "exchangeType": "TIME_HOURS",
  "hoursPerNight": 3.0,
  "isFree": false,
  "minReputation": 200,
  "minStay": 1,
  "maxStay": 7,
  "communityId": "uuid",
  "address": "Calle Mayor 10",
  "latitude": 40.4165,
  "longitude": -3.7026,
  "images": ["url1", "url2"],
  "amenities": ["WIFI", "KITCHEN", "WASHING_MACHINE"],
  "houseRules": "No fumar, no mascotas",
  "availability": [
    { "from": "2025-11-01", "to": "2025-11-15" }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "hostId": "uuid",
  "type": "OFFER",
  "accommodationType": "PRIVATE_ROOM",
  "status": "ACTIVE",
  ...
}
```

### 2.2 Buscar Alojamiento

```http
GET /housing/temporary?type=OFFER&accommodationType=PRIVATE_ROOM&minBeds=1&checkIn=2025-11-01&checkOut=2025-11-05&lat=40.4165&lng=-3.7026&radiusKm=3
```

**Query Parameters:**
- `type` - OFFER o REQUEST
- `accommodationType` - PRIVATE_ROOM, SHARED_ROOM, etc.
- `minBeds` - Número mínimo de camas
- `checkIn`, `checkOut` - Fechas de disponibilidad
- `isFree` - Solo alojamientos gratuitos
- `lat`, `lng`, `radiusKm` - Búsqueda geográfica

**Response:**
```json
[
  {
    "id": "uuid",
    "host": { "id": "uuid", "name": "Ana", "generosityScore": 920 },
    "type": "OFFER",
    "accommodationType": "PRIVATE_ROOM",
    "beds": 1,
    "exchangeType": "TIME_HOURS",
    "hoursPerNight": 3.0,
    ...
  }
]
```

### 2.3 Ver Detalle de Alojamiento

```http
GET /housing/temporary/:id
```

**Response:**
```json
{
  "id": "uuid",
  "host": {
    "id": "uuid",
    "name": "Ana López",
    "generosityScore": 920,
    "reviewsAsHost": [...]
  },
  "accommodationType": "PRIVATE_ROOM",
  "bookings": [
    {
      "id": "uuid",
      "guest": { "name": "Pedro" },
      "checkIn": "2025-11-01",
      "checkOut": "2025-11-05",
      "status": "CONFIRMED"
    }
  ],
  "availability": [...],
  ...
}
```

### 2.4 Reservar Alojamiento

```http
POST /housing/temporary/:id/book
Authorization: Bearer {token}
```

**Body:**
```json
{
  "checkIn": "2025-11-01",
  "checkOut": "2025-11-05",
  "guests": 2,
  "message": "Visitando Madrid por trabajo comunitario"
}
```

**Validaciones:**
- Reputación mínima requerida
- Créditos/horas suficientes
- Fechas disponibles
- Número de huéspedes no excede máximo

**Response:**
```json
{
  "id": "uuid",
  "housingId": "uuid",
  "guestId": "uuid",
  "status": "PENDING",
  "checkIn": "2025-11-01",
  "checkOut": "2025-11-05",
  "nights": 4,
  "paidEur": 0,
  "paidCredits": 0,
  "paidHours": 12.0,
  "message": "Visitando Madrid...",
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 2.5 Aprobar Reserva de Alojamiento

```http
POST /housing/temporary/bookings/:bookingId/approve
Authorization: Bearer {token}
```

**Body:**
```json
{
  "response": "APPROVE|REJECT",
  "message": "Bienvenido! Te espero el día 1"
}
```

**Permisos:** Solo el anfitrión

**Response:**
```json
{
  "id": "uuid",
  "status": "CONFIRMED",
  "approvedAt": "2025-10-10T12:30:00Z",
  "hostMessage": "Bienvenido! Te espero..."
}
```

### 2.6 Check-in

```http
POST /housing/temporary/bookings/:bookingId/checkin
Authorization: Bearer {token}
```

**Permisos:** Anfitrión o huésped

**Response:**
```json
{
  "id": "uuid",
  "status": "ACTIVE",
  "checkedInAt": "2025-11-01T15:00:00Z"
}
```

### 2.7 Completar Estancia

```http
POST /housing/temporary/bookings/:bookingId/complete
Authorization: Bearer {token}
```

**Body:**
```json
{
  "hostReview": {
    "rating": 5,
    "comment": "Huésped excelente, muy respetuoso"
  },
  "guestReview": {
    "rating": 5,
    "comment": "Anfitrión muy acogedor, habitación limpia"
  }
}
```

**Permisos:** Anfitrión o huésped

**Efectos:**
- Transfiere créditos/horas
- Crea reseñas bidireccionales
- Actualiza reputación

**Response:**
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "completedAt": "2025-11-05T11:00:00Z",
  "reviews": [...]
}
```

---

## 3. Cooperativas de Vivienda

### 3.1 Crear Cooperativa

```http
POST /housing/coops
Authorization: Bearer {token}
```

**Body:**
```json
{
  "name": "Co-housing Malasaña",
  "type": "RENTAL|OWNERSHIP|LAND_TRUST|COHOUSING|COLLECTIVE",
  "governance": "CONSENSUS|MAJORITY|QUADRATIC|DELEGATION",
  "description": "Cooperativa de vivienda intergeneracional",
  "decisionThreshold": 0.66,
  "minMembers": 5,
  "maxMembers": 20,
  "communityId": "uuid",
  "targetUnits": 10,
  "location": "Malasaña, Madrid",
  "estimatedCostPerUnit": 150000,
  "rules": "Normas de convivencia...",
  "vision": "Crear comunidad sostenible y solidaria"
}
```

**Efectos:**
- Crea la cooperativa en fase FORMING
- El creador se convierte en miembro fundador con rol FOUNDER
- Se registra con status ACTIVE

**Response:**
```json
{
  "id": "uuid",
  "name": "Co-housing Malasaña",
  "type": "COHOUSING",
  "governance": "QUADRATIC",
  "phase": "FORMING",
  "status": "ACTIVE",
  "currentMembers": 1,
  "members": [
    {
      "userId": "uuid",
      "role": "FOUNDER",
      "status": "ACTIVE",
      "votingPower": 1.0
    }
  ],
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 3.2 Buscar Cooperativas

```http
GET /housing/coops?type=COHOUSING&phase=FORMING&openToMembers=true
```

**Query Parameters:**
- `type` - Tipo de cooperativa
- `phase` - FORMING, PLANNING, FUNDING, BUILDING, OPERATING
- `openToMembers` - Solo cooperativas abiertas a nuevos miembros

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Co-housing Malasaña",
    "type": "COHOUSING",
    "phase": "FORMING",
    "currentMembers": 5,
    "maxMembers": 20,
    "openToMembers": true,
    ...
  }
]
```

### 3.3 Ver Detalle de Cooperativa

```http
GET /housing/coops/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Co-housing Malasaña",
  "type": "COHOUSING",
  "governance": "QUADRATIC",
  "phase": "FORMING",
  "members": [
    {
      "user": { "id": "uuid", "name": "María", "generosityScore": 850 },
      "role": "FOUNDER",
      "status": "ACTIVE",
      "contributedAmount": 5000,
      "contributedHours": 120,
      "votingPower": 1.0,
      "joinedAt": "2025-09-01T00:00:00Z"
    }
  ],
  "proposals": [
    {
      "id": "uuid",
      "type": "MEMBERSHIP|RULE_CHANGE|BUDGET|BUILDING_DECISION|OTHER",
      "title": "Aprobar nuevo miembro: Juan",
      "currentVotes": 8,
      "requiredVotes": 10,
      "deadline": "2025-10-20T00:00:00Z",
      "status": "VOTING"
    }
  ],
  ...
}
```

### 3.4 Solicitar Unirse a Cooperativa

```http
POST /housing/coops/:id/join
Authorization: Bearer {token}
```

**Body:**
```json
{
  "message": "Soy arquitecta y me encantaría contribuir al diseño",
  "proposedContribution": 10000,
  "skills": ["arquitectura", "diseño bioclimático"]
}
```

**Efectos:**
- Crea propuesta de membresía automáticamente
- Los miembros actuales pueden votar
- Requiere aprobación según governance de la cooperativa

**Response:**
```json
{
  "membership": {
    "id": "uuid",
    "status": "PENDING",
    "createdAt": "2025-10-10T12:00:00Z"
  },
  "proposal": {
    "id": "uuid",
    "type": "MEMBERSHIP",
    "title": "Aprobar nuevo miembro: Elena",
    "status": "VOTING",
    "requiredVotes": 10,
    "currentVotes": 0,
    "deadline": "2025-10-17T12:00:00Z"
  }
}
```

### 3.5 Votar Propuesta

```http
POST /housing/coops/proposals/:proposalId/vote
Authorization: Bearer {token}
```

**Body:**
```json
{
  "decision": "APPROVE|REJECT|ABSTAIN",
  "points": 3,
  "reason": "Elena tiene experiencia muy valiosa en arquitectura sostenible"
}
```

**Sistema de Votación Cuadrática:**
- Cada punto de voto cuesta points² créditos
- Ejemplo: 3 puntos = 9 créditos
- Evita concentración de poder

**Validaciones:**
- Usuario debe ser miembro activo
- Usuario debe tener créditos suficientes (points²)
- Propuesta debe estar en estado VOTING

**Efectos:**
- Deduce créditos del votante
- Incrementa currentVotes de la propuesta
- Si currentVotes >= requiredVotes → ejecuta propuesta automáticamente

**Response:**
```json
{
  "id": "uuid",
  "vote": {
    "decision": "APPROVE",
    "points": 3,
    "cost": 9,
    "reason": "Elena tiene experiencia..."
  },
  "proposal": {
    "currentVotes": 11,
    "requiredVotes": 10,
    "status": "APPROVED"
  }
}
```

**Auto-ejecución de propuestas:**
- `MEMBERSHIP` → Activa al nuevo miembro
- `RULE_CHANGE` → Actualiza reglas de la cooperativa
- `BUDGET` → Marca como aprobada para implementación
- `BUILDING_DECISION` → Avanza fase si corresponde

---

## 4. Garantía Comunitaria

### 4.1 Solicitar Garantía

```http
POST /housing/guarantee/request
Authorization: Bearer {token}
```

**Body:**
```json
{
  "reason": "Necesito aval para alquilar piso, nuevo en la ciudad",
  "monthlyRent": 800,
  "rentMonths": 12,
  "landlordInfo": "Agencia Inmobiliaria Centro",
  "propertyAddress": "Calle Atocha 50",
  "communityId": "uuid",
  "moveInDate": "2025-11-01"
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "reason": "Necesito aval...",
  "monthlyRent": 800,
  "rentMonths": 12,
  "totalAmount": 9600,
  "currentAmount": 0,
  "requiredSupporters": 5,
  "currentSupporters": 0,
  "status": "PENDING",
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 4.2 Respaldar Garantía

```http
POST /housing/guarantee/:guaranteeId/support
Authorization: Bearer {token}
```

**Body:**
```json
{
  "months": 2,
  "amount": 1600
}
```

**Efectos:**
- Bloquea créditos del garante (amount * 1.2 para contingencias)
- Incrementa currentAmount y currentSupporters
- Si se alcanza totalAmount → status = ACTIVE

**Response:**
```json
{
  "support": {
    "id": "uuid",
    "supporterId": "uuid",
    "months": 2,
    "amount": 1600,
    "lockedCredits": 1920,
    "status": "ACTIVE"
  },
  "guarantee": {
    "currentAmount": 3200,
    "totalAmount": 9600,
    "currentSupporters": 2,
    "requiredSupporters": 5,
    "status": "PENDING"
  }
}
```

---

## 5. Dashboard de Usuario

### 5.1 Mis Reservas

```http
GET /housing/my-bookings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "spaceBookings": [
    {
      "id": "uuid",
      "space": {
        "id": "uuid",
        "type": "GARDEN",
        "title": "Huerto comunitario"
      },
      "startTime": "2025-10-15T10:00:00Z",
      "endTime": "2025-10-15T14:00:00Z",
      "status": "CONFIRMED"
    }
  ],
  "housingBookings": [
    {
      "id": "uuid",
      "housing": {
        "id": "uuid",
        "accommodationType": "PRIVATE_ROOM",
        "title": "Habitación en centro"
      },
      "checkIn": "2025-11-01",
      "checkOut": "2025-11-05",
      "status": "CONFIRMED"
    }
  ]
}
```

### 5.2 Mis Ofertas

```http
GET /housing/my-offerings
Authorization: Bearer {token}
```

**Response:**
```json
{
  "spaces": [
    {
      "id": "uuid",
      "type": "WORKSHOP",
      "title": "Taller de carpintería",
      "status": "ACTIVE",
      "bookings": [
        {
          "id": "uuid",
          "booker": { "name": "Juan" },
          "startTime": "2025-10-15T10:00:00Z",
          "status": "PENDING"
        }
      ]
    }
  ],
  "housing": [
    {
      "id": "uuid",
      "accommodationType": "PRIVATE_ROOM",
      "title": "Habitación privada",
      "status": "ACTIVE",
      "bookings": [
        {
          "id": "uuid",
          "guest": { "name": "María" },
          "checkIn": "2025-11-10",
          "status": "CONFIRMED"
        }
      ]
    }
  ],
  "coops": [
    {
      "id": "uuid",
      "name": "Co-housing Malasaña",
      "role": "FOUNDER",
      "status": "ACTIVE"
    }
  ],
  "guarantees": [
    {
      "id": "uuid",
      "type": "requested",
      "monthlyRent": 800,
      "status": "ACTIVE"
    }
  ],
  "guaranteesGiven": [
    {
      "id": "uuid",
      "for": { "name": "Pedro" },
      "amount": 1600,
      "status": "ACTIVE"
    }
  ]
}
```

---

## Tipos de Datos (Enums)

### SpaceType
- `GARDEN` - Huerto / Jardín
- `WORKSHOP` - Taller
- `STORAGE` - Almacenamiento
- `PARKING` - Estacionamiento
- `KITCHEN` - Cocina
- `MEETING_ROOM` - Sala de reuniones
- `OTHER` - Otro

### HousingType
- `OFFER` - Ofrezco alojamiento
- `REQUEST` - Busco alojamiento

### AccommodationType
- `PRIVATE_ROOM` - Habitación privada
- `SHARED_ROOM` - Habitación compartida
- `COUCH` - Sofá
- `CAMPING` - Acampar (jardín, etc.)

### ExchangeType
- `EUR` - Euros
- `CREDITS` - Créditos de la plataforma
- `TIME_HOURS` - Horas del banco de tiempo
- `MIXED` - Combinación (ej: 5€ + 10 créditos)
- `FREE` - Gratuito

### CoopType
- `RENTAL` - Cooperativa de alquiler
- `OWNERSHIP` - Cooperativa de propiedad
- `LAND_TRUST` - Fideicomiso de tierra (CLT)
- `COHOUSING` - Co-housing
- `COLLECTIVE` - Vivienda colectiva

### GovernanceType
- `CONSENSUS` - Por consenso
- `MAJORITY` - Mayoría simple
- `QUADRATIC` - Votación cuadrática
- `DELEGATION` - Delegación de votos

### CoopPhase
- `FORMING` - Formación inicial
- `PLANNING` - Planificación
- `FUNDING` - Búsqueda de financiamiento
- `BUILDING` - En construcción
- `OPERATING` - Operando

### Status (general)
- `PENDING` - Pendiente
- `ACTIVE` - Activa/o
- `CONFIRMED` - Confirmada/o
- `COMPLETED` - Completada/o
- `CANCELLED` - Cancelada/o
- `REJECTED` - Rechazada/o

---

## Integración con Sistemas Existentes

### Proof of Help (PoH)
- **Reputación mínima**: Los espacios y alojamientos pueden requerir `minReputation`
- **Validación de PoH**: Las cooperativas pueden requerir `requiredPohScore`

### Economía de Tres Capas
- **EUR**: Dinero fiduciario
- **CREDITS**: Créditos de la plataforma
- **TIME_HOURS**: Horas del banco de tiempo
- **MIXED**: Combinaciones (ej: 10€ + 20 créditos + 2 horas)

### Sistema de Consenso
- Las cooperativas usan **votación cuadrática**
- Coste de votos: `points²` créditos
- Las propuestas se ejecutan automáticamente al alcanzar el umbral

### Reseñas Bidireccionales
- Todas las interacciones generan reviews mutuas
- Impacta la reputación (generosityScore) de ambas partes

---

## Ejemplos de Flujo Completo

### Flujo 1: Reservar un Huerto

1. **Buscar huertos disponibles:**
   ```bash
   GET /housing/spaces?type=GARDEN&lat=40.4268&lng=-3.7038&radiusKm=5
   ```

2. **Ver detalle del huerto elegido:**
   ```bash
   GET /housing/spaces/abc-123
   ```

3. **Crear reserva:**
   ```bash
   POST /housing/spaces/abc-123/book
   {
     "startTime": "2025-10-15T10:00:00Z",
     "endTime": "2025-10-15T14:00:00Z",
     "message": "Para plantar tomates"
   }
   ```

4. **Dueño aprueba:**
   ```bash
   POST /housing/spaces/bookings/booking-456/approve
   ```

5. **Después de usar el espacio:**
   ```bash
   POST /housing/spaces/bookings/booking-456/complete
   {
     "ownerReview": { "rating": 5, "comment": "Excelente" },
     "bookerReview": { "rating": 5, "comment": "Perfecto" }
   }
   ```

### Flujo 2: Crear Cooperativa de Vivienda

1. **Crear cooperativa:**
   ```bash
   POST /housing/coops
   {
     "name": "Co-housing Malasaña",
     "type": "COHOUSING",
     "governance": "QUADRATIC",
     "maxMembers": 20,
     ...
   }
   ```

2. **Otro usuario solicita unirse:**
   ```bash
   POST /housing/coops/coop-789/join
   {
     "message": "Soy arquitecta",
     "proposedContribution": 10000
   }
   ```

3. **Miembros votan la propuesta:**
   ```bash
   POST /housing/coops/proposals/proposal-101/vote
   {
     "decision": "APPROVE",
     "points": 3,
     "reason": "Excelente perfil"
   }
   ```

4. **Cuando se alcanza el umbral → nuevo miembro se activa automáticamente**

---

## Códigos de Error

- `400 Bad Request` - Parámetros inválidos
- `401 Unauthorized` - Token JWT inválido o ausente
- `403 Forbidden` - Sin permisos (ej: aprobar reserva ajena, reputación insuficiente)
- `404 Not Found` - Recurso no encontrado
- `409 Conflict` - Conflicto (ej: reserva en horario ocupado, créditos insuficientes)
- `500 Internal Server Error` - Error del servidor

**Ejemplo de error:**
```json
{
  "statusCode": 403,
  "message": "Necesitas reputación mínima de 200",
  "error": "Forbidden"
}
```

---

## Notas Técnicas

### Búsqueda Geográfica
- Actualmente usa **bounding box** simple (lat/lng ± radiusKm)
- Para producción se recomienda **PostGIS** con índices espaciales

### Pagamiento Asíncrono
- Los créditos se bloquean al crear la reserva
- Se transfieren al completar la interacción
- Si se cancela, se devuelven automáticamente

### Concurrencia
- Las reservas usan transacciones para evitar double-booking
- Las votaciones verifican el estado de la propuesta antes de contar votos

### Notificaciones
- Todas las acciones importantes disparan eventos
- Pueden integrarse con el módulo de notificaciones existente

---

## Roadmap Futuro

- [ ] Sistema de disputas y mediación
- [ ] Integración con calendario (iCal, Google Calendar)
- [ ] Mapas interactivos en el frontend
- [ ] Sistema de seguros comunitarios
- [ ] Crowdfunding para cooperativas
- [ ] Calculadora de costes de cooperativa
- [ ] Matching automático hospedaje/necesidad
- [ ] Sistema de referencias entre miembros
