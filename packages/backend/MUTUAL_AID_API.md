# Mutual Aid & Community Projects API

## Overview

El sistema de Ayuda Mutua de Comunidad Viva conecta **necesidades** con **recursos** a escala local, intercomunitaria y global. Permite que comunidades y personas apoyen proyectos desde un auzolan local hasta una escuela en África.

**Casos de uso:**
- Necesidades individuales (comida, vivienda, salud)
- Necesidades comunitarias (reparación de centro comunitario)
- Proyectos globales (purificar agua en India, construir escuela en Ghana)
- Auzolanes (trabajo comunitario tradicional vasco)
- Ayuda en emergencias

Base URL: `http://localhost:4000/mutual-aid`

---

## 1. Necesidades (Needs)

### 1.1 Crear Necesidad

```http
POST /mutual-aid/needs
Authorization: Bearer {token}
```

**Body:**
```json
{
  "communityId": "uuid",
  "scope": "PERSONAL|COMMUNITY|INTERCOMMUNITY|GLOBAL",
  "category": "URGENT|CHRONIC|PROJECT|EMERGENCY",
  "type": "FOOD|HOUSING|HEALTH|EDUCATION|INFRASTRUCTURE|WATER|ENERGY|OTHER",
  "title": "Necesito alimentos para familia de 4",
  "description": "He perdido mi trabajo y necesito ayuda con alimentos básicos",
  "images": ["url1", "url2"],

  "location": "Pamplona, Navarra",
  "latitude": 42.8125,
  "longitude": -1.6458,
  "country": "España",

  "resourceTypes": ["FOOD", "CREDITS"],
  "targetEur": 200.0,
  "targetCredits": 500,
  "targetHours": null,
  "neededSkills": [],
  "neededMaterials": null,

  "urgencyLevel": 4,
  "deadline": "2025-11-01T00:00:00Z",

  "verificationDocs": ["url_documento"]
}
```

**Scopes:**
- `PERSONAL` - Necesidad individual
- `COMMUNITY` - Necesidad de una comunidad
- `INTERCOMMUNITY` - Entre comunidades cercanas (ej: auzolan)
- `GLOBAL` - Proyectos globales (ej: escuela en África)

**Response:**
```json
{
  "id": "uuid",
  "creator": {
    "id": "uuid",
    "name": "María García",
    "generosityScore": 850
  },
  "scope": "PERSONAL",
  "category": "URGENT",
  "type": "FOOD",
  "title": "Necesito alimentos...",
  "status": "OPEN",
  "urgencyLevel": 4,
  "currentEur": 0,
  "targetEur": 200,
  "contributorsCount": 0,
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 1.2 Buscar Necesidades

```http
GET /mutual-aid/needs?scope=GLOBAL&type=WATER&country=India&verified=true&limit=20
```

**Query Parameters:**
- `scope` - PERSONAL, COMMUNITY, INTERCOMMUNITY, GLOBAL
- `category` - URGENT, CHRONIC, PROJECT, EMERGENCY
- `type` - FOOD, HOUSING, HEALTH, EDUCATION, etc.
- `status` - OPEN, PARTIALLY_FILLED, FILLED, CLOSED
- `communityId` - Filtrar por comunidad
- `country` - Filtrar por país (ej: "India", "Ghana", "España")
- `lat`, `lng`, `radiusKm` - Búsqueda geográfica
- `minUrgency` - Urgencia mínima (1-5)
- `resourceType` - Tipo de recurso necesitado
- `verified` - Solo necesidades verificadas (true/false)
- `limit` - Límite de resultados

**Response:**
```json
[
  {
    "id": "uuid",
    "creator": { "name": "ONG Agua Limpia" },
    "scope": "GLOBAL",
    "type": "WATER",
    "title": "Purificar fuente de agua en pueblo rural",
    "country": "India",
    "urgencyLevel": 3,
    "targetEur": 5000,
    "currentEur": 1200,
    "contributorsCount": 15,
    "isVerified": true
  }
]
```

### 1.3 Ver Detalle de Necesidad

```http
GET /mutual-aid/needs/:id
```

**Response:**
```json
{
  "id": "uuid",
  "creator": {
    "id": "uuid",
    "name": "María García",
    "bio": "Madre de 2 niños",
    "generosityScore": 850
  },
  "community": {
    "id": "uuid",
    "name": "Barrio de Gracia",
    "slug": "gracia"
  },
  "scope": "PERSONAL",
  "category": "URGENT",
  "type": "FOOD",
  "title": "Necesito alimentos...",
  "description": "...",
  "images": ["url1"],
  "location": "Pamplona",
  "country": "España",

  "resourceTypes": ["FOOD", "CREDITS"],
  "targetEur": 200,
  "targetCredits": 500,
  "currentEur": 80,
  "currentCredits": 150,
  "contributorsCount": 5,

  "urgencyLevel": 4,
  "deadline": "2025-11-01T00:00:00Z",
  "status": "PARTIALLY_FILLED",

  "isVerified": true,
  "verifiedBy": "admin-uuid",
  "verifiedAt": "2025-10-10T14:00:00Z",

  "contributions": [
    {
      "id": "uuid",
      "user": { "name": "Juan" },
      "contributionType": "MONETARY",
      "amountEur": 50,
      "status": "COMPLETED",
      "createdAt": "2025-10-10T13:00:00Z"
    }
  ],

  "relatedOffers": ["offer-id-1", "offer-id-2"],
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 1.4 Contribuir a Necesidad

```http
POST /mutual-aid/needs/:id/contribute
Authorization: Bearer {token}
```

**Body:**
```json
{
  "contributionType": "MONETARY|TIME|SKILLS|MATERIALS|EQUIPMENT|MIXED",
  "amountEur": 50.0,
  "amountCredits": 100,
  "amountHours": 0,
  "skillsOffered": [],
  "materialsOffered": null,
  "equipmentOffered": [],
  "message": "Espero que esto ayude",
  "isAnonymous": false,
  "isRecurring": false,
  "recurringMonths": null,
  "proofDocuments": []
}
```

**Efectos:**
- Deduce créditos del contribuidor (si aplica)
- Incrementa currentEur/currentCredits/currentHours de la necesidad
- Si se alcanza el objetivo → status = FILLED

**Response:**
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "name": "Juan Pérez"
  },
  "need": {
    "id": "uuid",
    "title": "Necesito alimentos..."
  },
  "contributionType": "MONETARY",
  "amountEur": 50,
  "status": "PENDING",
  "createdAt": "2025-10-10T15:00:00Z"
}
```

### 1.5 Actualizar Necesidad

```http
PUT /mutual-aid/needs/:id
Authorization: Bearer {token}
```

**Permisos:** Solo el creador

**Body:** Campos a actualizar

### 1.6 Cerrar Necesidad

```http
POST /mutual-aid/needs/:id/close
Authorization: Bearer {token}
```

**Permisos:** Solo el creador

**Response:**
```json
{
  "id": "uuid",
  "status": "CLOSED",
  "closedAt": "2025-10-10T18:00:00Z"
}
```

---

## 2. Proyectos Comunitarios (Community Projects)

### 2.1 Crear Proyecto

```http
POST /mutual-aid/projects
Authorization: Bearer {token}
```

**Body:**
```json
{
  "communityId": "uuid",
  "type": "INFRASTRUCTURE|WATER_SANITATION|EDUCATION|HEALTH|AUZOLAN|OTHER",
  "title": "Construir escuela primaria en pueblo rural",
  "description": "Proyecto para construir escuela que beneficiará a 200 niños",
  "vision": "Educación accesible para todos los niños de la región",
  "images": ["url1", "url2"],
  "videoUrl": "https://youtube.com/...",

  "location": "Pueblo de Akosombo",
  "latitude": 6.2667,
  "longitude": 0.0500,
  "country": "Ghana",
  "region": "Eastern Region",

  "beneficiaries": 200,
  "impactGoals": [
    "200 niños con acceso a educación",
    "3 profesores empleados",
    "Alfabetización 100% en 5 años"
  ],

  "targetEur": 50000,
  "targetCredits": 100000,
  "targetHours": 500,
  "targetSkills": ["construcción", "carpintería", "electricidad"],
  "materialNeeds": {
    "cemento": "50 sacos",
    "madera": "200m",
    "tejas": "500 unidades"
  },

  "participatingCommunities": [],
  "volunteersNeeded": 20,

  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "estimatedMonths": 12,

  "organizationName": "ONG Educación para Todos",
  "contactEmail": "contacto@educacion.org",
  "websiteUrl": "https://educacion.org",

  "tags": ["education", "ghana", "school", "children"],
  "sdgGoals": [4, 10]
}
```

**Project Types:**
- `INFRASTRUCTURE` - Escuelas, centros comunitarios
- `WATER_SANITATION` - Pozos, purificación de agua
- `EDUCATION` - Programas educativos
- `HEALTH` - Clínicas, salud comunitaria
- `ENVIRONMENT` - Reforestación, limpieza
- `AGRICULTURE` - Huertos, cooperativas
- `ENERGY` - Paneles solares
- `HOUSING` - Vivienda colectiva
- `AUZOLAN` - Trabajo comunitario tradicional vasco
- `EMERGENCY_RELIEF` - Ayuda en emergencias

**SDG Goals:** Objetivos de Desarrollo Sostenible de la ONU (1-17)

**Response:**
```json
{
  "id": "uuid",
  "creator": { "name": "María" },
  "type": "EDUCATION",
  "title": "Construir escuela...",
  "country": "Ghana",
  "status": "FORMING",
  "targetEur": 50000,
  "currentEur": 0,
  "beneficiaries": 200,
  "contributorsCount": 0,
  "tags": ["education", "ghana"],
  "sdgGoals": [4, 10],
  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 2.2 Buscar Proyectos

```http
GET /mutual-aid/projects?type=WATER_SANITATION&country=India&tag=water&verified=true
```

**Query Parameters:**
- `type` - Tipo de proyecto
- `status` - FORMING, FUNDING, READY, EXECUTING, COMPLETED, PAUSED, CANCELLED
- `country` - País del proyecto
- `region` - Región del proyecto
- `communityId` - Comunidad organizadora
- `tag` - Filtrar por etiqueta (ej: "water", "education", "auzolan")
- `sdg` - Filtrar por ODS (ej: "4" para educación)
- `verified` - Solo proyectos verificados
- `lat`, `lng`, `radiusKm` - Búsqueda geográfica
- `limit` - Límite de resultados

**Response:**
```json
[
  {
    "id": "uuid",
    "creator": { "name": "ONG Agua Limpia" },
    "type": "WATER_SANITATION",
    "title": "Purificar fuente de agua en 5 pueblos",
    "country": "India",
    "region": "Karnataka",
    "status": "FUNDING",
    "targetEur": 10000,
    "currentEur": 3500,
    "beneficiaries": 500,
    "contributorsCount": 45,
    "tags": ["water", "health", "sanitation"],
    "sdgGoals": [6],
    "completionRate": 0.35,
    "_count": {
      "contributions": 45,
      "updates": 5
    }
  }
]
```

### 2.3 Ver Detalle de Proyecto

```http
GET /mutual-aid/projects/:id
```

**Response:**
```json
{
  "id": "uuid",
  "creator": {
    "id": "uuid",
    "name": "María López",
    "bio": "Coordinadora de ONG"
  },
  "community": {
    "id": "uuid",
    "name": "Comunidad Solidaria Navarra"
  },
  "type": "EDUCATION",
  "title": "Construir escuela...",
  "description": "...",
  "vision": "Educación accesible para todos",
  "images": ["url1", "url2"],
  "videoUrl": "https://...",

  "location": "Akosombo",
  "country": "Ghana",
  "region": "Eastern Region",

  "beneficiaries": 200,
  "impactGoals": ["200 niños educados", "3 profesores empleados"],

  "targetEur": 50000,
  "targetCredits": 100000,
  "targetHours": 500,
  "currentEur": 15000,
  "currentCredits": 25000,
  "currentHours": 120,

  "participatingCommunities": ["community-id-1", "community-id-2"],
  "contributorsCount": 75,
  "volunteersNeeded": 20,
  "volunteersEnrolled": 8,

  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "status": "FUNDING",
  "completionRate": 0.30,

  "organizationName": "ONG Educación para Todos",
  "contactEmail": "contacto@...",
  "websiteUrl": "https://...",
  "isVerified": true,

  "tags": ["education", "ghana", "school"],
  "sdgGoals": [4, 10],

  "phases": [
    {
      "id": "uuid",
      "name": "Fase 1: Cimientos",
      "description": "Excavación y cimientos",
      "order": 1,
      "targetEur": 10000,
      "currentEur": 5000,
      "status": "ACTIVE",
      "completionRate": 0.50
    }
  ],

  "contributions": [
    {
      "id": "uuid",
      "user": { "name": "Juan" },
      "community": { "name": "Comunidad Pamplona" },
      "contributionType": "MONETARY",
      "amountEur": 100,
      "message": "Apoyamos desde Navarra",
      "status": "COMPLETED"
    }
  ],

  "updates": [
    {
      "id": "uuid",
      "author": { "name": "María" },
      "title": "¡Hemos alcanzado el 30% de financiación!",
      "content": "Gracias a todos los que han contribuido...",
      "images": ["url1"],
      "progressUpdate": 0.30,
      "beneficiariesReached": 0,
      "milestones": ["Financiación 30%", "10 comunidades participantes"],
      "createdAt": "2025-10-15T10:00:00Z"
    }
  ],

  "impactReports": [
    {
      "id": "uuid",
      "author": { "name": "María" },
      "title": "Reporte de Impacto - 6 meses",
      "impactLevel": "HIGH",
      "beneficiariesReached": 150,
      "photos": ["url1", "url2"],
      "publishedAt": "2026-07-01T00:00:00Z"
    }
  ],

  "createdAt": "2025-10-10T12:00:00Z"
}
```

### 2.4 Contribuir a Proyecto

```http
POST /mutual-aid/projects/:id/contribute
Authorization: Bearer {token}
```

**Body:**
```json
{
  "phaseId": "uuid",
  "contributionType": "MONETARY|TIME|SKILLS|MATERIALS|EQUIPMENT|MIXED",
  "amountEur": 100.0,
  "amountCredits": 200,
  "amountHours": 0,
  "skillsOffered": [],
  "materialsOffered": null,
  "equipmentOffered": [],
  "message": "Apoyamos desde nuestra comunidad en Navarra",
  "isAnonymous": false,
  "proofDocuments": []
}
```

**Efectos:**
- Deduce créditos del contribuidor
- Incrementa currentEur/currentCredits/currentHours del proyecto
- Si contributionType es TIME o SKILLS → incrementa volunteersEnrolled

**Response:**
```json
{
  "id": "uuid",
  "user": { "name": "Juan" },
  "contributionType": "MONETARY",
  "amountEur": 100,
  "status": "PENDING",
  "createdAt": "2025-10-10T15:00:00Z"
}
```

### 2.5 Añadir Fase a Proyecto

```http
POST /mutual-aid/projects/:id/phases
Authorization: Bearer {token}
```

**Permisos:** Solo el creador del proyecto

**Body:**
```json
{
  "name": "Fase 2: Estructura",
  "description": "Construcción de paredes y techo",
  "order": 2,
  "targetEur": 15000,
  "targetCredits": 30000,
  "targetHours": 200,
  "startDate": "2026-04-01",
  "endDate": "2026-08-31"
}
```

**Response:**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "name": "Fase 2: Estructura",
  "order": 2,
  "targetEur": 15000,
  "currentEur": 0,
  "status": "PENDING",
  "completionRate": 0.0,
  "createdAt": "2025-10-10T16:00:00Z"
}
```

### 2.6 Añadir Actualización

```http
POST /mutual-aid/projects/:id/updates
Authorization: Bearer {token}
```

**Permisos:** Solo el creador del proyecto

**Body:**
```json
{
  "title": "¡Hemos completado los cimientos!",
  "content": "Después de 2 meses de trabajo, hemos completado la primera fase. Gracias a todos los contribuidores...",
  "images": ["url1", "url2"],
  "videoUrl": "https://youtube.com/...",
  "progressUpdate": 0.20,
  "fundsUsed": 10000,
  "beneficiariesReached": 50,
  "milestones": ["Cimientos completados", "20 voluntarios", "10 comunidades"],
  "challenges": "Retrasos por lluvias",
  "nextSteps": "Comenzar construcción de paredes"
}
```

**Response:**
```json
{
  "id": "uuid",
  "author": { "name": "María" },
  "title": "¡Hemos completado los cimientos!",
  "content": "...",
  "images": ["url1"],
  "progressUpdate": 0.20,
  "fundsUsed": 10000,
  "beneficiariesReached": 50,
  "milestones": ["Cimientos completados"],
  "createdAt": "2025-12-15T10:00:00Z"
}
```

### 2.7 Crear Reporte de Impacto

```http
POST /mutual-aid/projects/:id/impact-reports
Authorization: Bearer {token}
```

**Permisos:** Solo el creador del proyecto

**Body:**
```json
{
  "title": "Reporte de Impacto Final - Escuela Completada",
  "summary": "La escuela fue completada exitosamente y ahora atiende a 200 niños diariamente",
  "impactLevel": "HIGH",
  "beneficiariesReached": 200,
  "jobsCreated": 3,
  "co2Avoided": null,
  "waterLitersProvided": null,
  "peopleEducated": 200,
  "customMetrics": {
    "alfabetizacion": "95%",
    "graduados_primaria": 50
  },
  "photos": ["url1", "url2", "url3"],
  "videos": ["url_video"],
  "testimonials": [
    {
      "name": "Kofi Mensah",
      "quote": "Gracias a esta escuela mi hija puede aprender a leer",
      "photo": "url_foto"
    }
  ],
  "documents": ["url_certificado"],
  "sustainabilityPlan": "La comunidad local gestionará la escuela con apoyo del gobierno",
  "futureGoals": ["Añadir biblioteca", "Programa de becas"],
  "publish": true
}
```

**Impact Levels:**
- `LOW` - < 50 personas
- `MEDIUM` - 50-500 personas
- `HIGH` - 500-5000 personas
- `TRANSFORMATIVE` - > 5000 personas

**Response:**
```json
{
  "id": "uuid",
  "author": { "name": "María" },
  "title": "Reporte de Impacto Final...",
  "summary": "...",
  "impactLevel": "HIGH",
  "beneficiariesReached": 200,
  "jobsCreated": 3,
  "peopleEducated": 200,
  "photos": ["url1", "url2"],
  "testimonials": [{...}],
  "publishedAt": "2026-12-31T00:00:00Z",
  "createdAt": "2026-12-31T00:00:00Z"
}
```

---

## 3. Contribuciones (Contributions)

### 3.1 Validar Contribución

```http
POST /mutual-aid/contributions/:id/validate
Authorization: Bearer {token}
```

**Permisos:** Solo el creador de la necesidad/proyecto

**Efectos:**
- Marca la contribución como COMPLETED
- Registra quién la validó y cuándo

**Response:**
```json
{
  "id": "uuid",
  "status": "COMPLETED",
  "validatedAt": "2025-10-10T18:00:00Z",
  "validatedBy": "uuid"
}
```

### 3.2 Cancelar Contribución

```http
POST /mutual-aid/contributions/:id/cancel
Authorization: Bearer {token}
```

**Permisos:** Solo el contribuidor, solo si status = PENDING

**Efectos:**
- Devuelve créditos al contribuidor (si aplica)
- Decrementa currentEur/currentCredits/currentHours de la necesidad/proyecto
- Marca contribución como CANCELLED

**Response:**
```json
{
  "message": "Contribución cancelada y recursos devueltos"
}
```

---

## 4. Dashboard de Usuario

### 4.1 Mis Contribuciones

```http
GET /mutual-aid/my/contributions
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "need": {
      "id": "uuid",
      "title": "Necesito alimentos...",
      "type": "FOOD",
      "status": "FILLED"
    },
    "project": null,
    "contributionType": "MONETARY",
    "amountEur": 50,
    "status": "COMPLETED",
    "createdAt": "2025-10-10T15:00:00Z"
  },
  {
    "id": "uuid",
    "need": null,
    "project": {
      "id": "uuid",
      "title": "Construir escuela...",
      "type": "EDUCATION",
      "status": "EXECUTING"
    },
    "contributionType": "MONETARY",
    "amountEur": 100,
    "status": "COMPLETED",
    "createdAt": "2025-10-10T16:00:00Z"
  }
]
```

### 4.2 Mis Necesidades

```http
GET /mutual-aid/my/needs
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "scope": "PERSONAL",
    "type": "FOOD",
    "title": "Necesito alimentos...",
    "status": "FILLED",
    "targetEur": 200,
    "currentEur": 200,
    "contributorsCount": 8,
    "contributions": [
      {
        "id": "uuid",
        "contributionType": "MONETARY",
        "amountEur": 50,
        "status": "COMPLETED"
      }
    ],
    "createdAt": "2025-10-10T12:00:00Z"
  }
]
```

### 4.3 Mis Proyectos

```http
GET /mutual-aid/my/projects
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "EDUCATION",
    "title": "Construir escuela...",
    "country": "Ghana",
    "status": "FUNDING",
    "targetEur": 50000,
    "currentEur": 15000,
    "beneficiaries": 200,
    "contributorsCount": 75,
    "contributions": [...],
    "_count": {
      "updates": 5,
      "impactReports": 0
    },
    "createdAt": "2025-10-10T12:00:00Z"
  }
]
```

---

## Tipos de Datos (Enums)

### NeedScope
- `PERSONAL` - Necesidad individual
- `COMMUNITY` - Necesidad de una comunidad
- `INTERCOMMUNITY` - Entre comunidades cercanas
- `GLOBAL` - Proyectos globales

### NeedCategory
- `URGENT` - Urgente (< 1 semana)
- `CHRONIC` - Crónica (necesidad continua)
- `PROJECT` - Proyecto con timeline
- `EMERGENCY` - Emergencia (< 24h)

### NeedType / ResourceType
- `FOOD` - Alimentos
- `HOUSING` - Vivienda
- `HEALTH` - Salud
- `EDUCATION` - Educación
- `INFRASTRUCTURE` - Infraestructura
- `WATER` - Agua potable
- `ENERGY` - Energía
- `SANITATION` - Saneamiento
- `ENVIRONMENT` - Medio ambiente
- `MATERIALS` - Materiales
- `SKILLS` - Habilidades
- `EQUIPMENT` - Equipamiento
- etc.

### ProjectType
- `INFRASTRUCTURE` - Escuelas, centros comunitarios
- `WATER_SANITATION` - Pozos, purificación de agua
- `EDUCATION` - Programas educativos
- `HEALTH` - Clínicas
- `ENVIRONMENT` - Reforestación
- `AGRICULTURE` - Huertos, cooperativas
- `ENERGY` - Paneles solares
- `HOUSING` - Vivienda colectiva
- `AUZOLAN` - Trabajo comunitario tradicional
- `EMERGENCY_RELIEF` - Ayuda en emergencias

### ContributionType
- `MONETARY` - Dinero (EUR/CREDITS)
- `TIME` - Tiempo
- `SKILLS` - Habilidades
- `MATERIALS` - Materiales
- `EQUIPMENT` - Equipamiento
- `MIXED` - Combinación

---

## Ejemplos de Flujo Completo

### Flujo 1: Ayudar con Necesidad Local

1. **Buscar necesidades urgentes locales:**
   ```bash
   GET /mutual-aid/needs?category=URGENT&scope=PERSONAL&lat=42.8125&lng=-1.6458&radiusKm=10
   ```

2. **Ver detalle de necesidad:**
   ```bash
   GET /mutual-aid/needs/need-123
   ```

3. **Contribuir:**
   ```bash
   POST /mutual-aid/needs/need-123/contribute
   {
     "contributionType": "MONETARY",
     "amountCredits": 100,
     "message": "Espero que esto ayude"
   }
   ```

### Flujo 2: Organizar Auzolan

1. **Crear proyecto de auzolan:**
   ```bash
   POST /mutual-aid/projects
   {
     "type": "AUZOLAN",
     "scope": "INTERCOMMUNITY",
     "title": "Auzolan para reparar frontón comunitario",
     "country": "España",
     "region": "Navarra",
     "targetHours": 40,
     "volunteersNeeded": 15,
     "tags": ["auzolan", "navarra", "deporte"]
   }
   ```

2. **Otras personas se ofrecen a ayudar:**
   ```bash
   POST /mutual-aid/projects/project-456/contribute
   {
     "contributionType": "TIME",
     "amountHours": 4,
     "skillsOffered": ["carpintería"]
   }
   ```

### Flujo 3: Apoyar Proyecto Global

1. **Buscar proyectos en África:**
   ```bash
   GET /mutual-aid/projects?country=Ghana&type=EDUCATION&verified=true
   ```

2. **Ver detalle del proyecto escuela:**
   ```bash
   GET /mutual-aid/projects/project-789
   ```

3. **Contribuir desde Navarra:**
   ```bash
   POST /mutual-aid/projects/project-789/contribute
   {
     "contributionType": "MONETARY",
     "amountEur": 100,
     "message": "Apoyamos desde nuestra comunidad en Pamplona"
   }
   ```

4. **Seguir actualizaciones:**
   ```bash
   GET /mutual-aid/projects/project-789
   # Ver sección "updates" con el progreso
   ```

5. **Cuando se complete, ver reporte de impacto:**
   ```bash
   GET /mutual-aid/projects/project-789
   # Ver sección "impactReports" con fotos, testimonios, métricas
   ```

---

## Integración con Sistemas Existentes

### Economía de Tres Capas
- **EUR**: Dinero fiduciario para proyectos grandes
- **CREDITS**: Créditos de la plataforma para economía local
- **TIME_HOURS**: Horas del banco de tiempo
- **MIXED**: Combinaciones (ej: 10€ + 50 créditos + 2 horas)

### Proof of Help (PoH)
- Las contribuciones incrementan `generosityScore`
- Las necesidades pueden requerir reputación mínima
- Proyectos verificados tienen mayor visibilidad

### Sistema de Ofertas
- Campo `relatedOffers` en necesidades sugiere ofertas que podrían ayudar
- Matching automático entre necesidades y ofertas disponibles

### Comunidades
- Las necesidades pueden ser comunitarias o intercomunitarias
- Los proyectos pueden tener múltiples comunidades participantes
- Las contribuciones pueden venir de comunidades enteras

---

## Casos de Uso Destacados

### 1. Escuela en Ghana
```
Tipo: EDUCATION
Scope: GLOBAL
Beneficiarios: 200 niños
Recursos: 50,000€ + 500h voluntariado + construcción
Duración: 12 meses
Participantes: 10 comunidades de España, 75 individuos
Impacto: 200 niños educados, 3 profesores empleados
```

### 2. Purificar Agua en India
```
Tipo: WATER_SANITATION
Scope: GLOBAL
Beneficiarios: 500 personas en 5 pueblos
Recursos: 10,000€ + equipamiento
ODS: 6 (Agua limpia y saneamiento)
Impacto: 500,000 litros de agua limpia/año
```

### 3. Auzolan en Navarra
```
Tipo: AUZOLAN
Scope: INTERCOMMUNITY
Objetivo: Reparar frontón comunitario
Recursos: 40 horas de trabajo voluntario
Participantes: 15 personas de 3 comunidades
Duración: 1 día
```

### 4. Necesidad Urgente Local
```
Tipo: FOOD
Scope: PERSONAL
Urgencia: 4/5
Recursos: 200€ en alimentos
Plazo: 1 semana
Contribuidores: 8 personas de la comunidad
```

---

## Transparencia y Verificación

### Verificación de Necesidades
- Documentos de verificación
- Validación por moderadores comunitarios
- Badge de "Verificado" visible

### Verificación de Proyectos
- Organización responsable identificada
- Contacto directo disponible
- Actualizaciones regulares obligatorias
- Reportes de impacto con evidencia

### Proof of Impact
- Fotos y videos del progreso
- Testimonios de beneficiarios
- Métricas cuantificables (personas educadas, litros de agua, etc.)
- Documentos de certificación

---

## Códigos de Error

- `400 Bad Request` - Parámetros inválidos, recursos insuficientes
- `401 Unauthorized` - Token JWT inválido
- `403 Forbidden` - Sin permisos (ej: actualizar proyecto ajeno)
- `404 Not Found` - Necesidad/proyecto no encontrado
- `409 Conflict` - Conflicto de estado (ej: cancelar contribución completada)

---

## Roadmap Futuro

- [ ] Matching automático necesidades-ofertas con IA
- [ ] Sistema de recomendaciones personalizadas
- [ ] Gamificación con badges por contribuciones
- [ ] Mapas interactivos de proyectos globales
- [ ] Integración con plataformas de fundraising externas
- [ ] Sistema de suscripciones recurrentes
- [ ] Calendario de auzolanes y eventos comunitarios
- [ ] Sistema de mentoring entre proyectos
- [ ] API pública para ONGs verificadas
- [ ] Blockchain para transparencia total
