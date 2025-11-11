# Community Onboarding Packs

Sistema completo para onboarding rápido de comunidades organizadas con configuraciones pre-definidas.

## 📋 Índice

- [Visión General](#visión-general)
- [Arquitectura](#arquitectura)
- [Tipos de Packs](#tipos-de-packs)
- [Flujo de Usuario](#flujo-de-usuario)
- [API Endpoints](#api-endpoints)
- [Componentes Frontend](#componentes-frontend)
- [Base de Datos](#base-de-datos)
- [Configuración](#configuración)

## 🎯 Visión General

El sistema de Community Onboarding Packs permite que comunidades organizadas (grupos de consumo, cooperativas, bares comunitarios, etc.) puedan configurar su espacio en Truk en **menos de 10 minutos** con:

- ✅ Configuración pre-definida específica para su tipo
- ✅ Asistente guiado paso a paso
- ✅ Funcionalidades activadas automáticamente
- ✅ Métricas de impacto desde el día 1
- ✅ Dashboard personalizado

### Problema que Resuelve

**Antes:** Una comunidad nueva tenía que:
- Explorar toda la plataforma para entender qué hacer
- Configurar manualmente todas las funcionalidades
- No tenía claro qué métricas trackear
- El onboarding podía llevar semanas

**Ahora:** Con los packs:
- Landing page específica que explica los beneficios
- Setup wizard de 5 pasos guiados
- Funcionalidades pre-configuradas para su caso de uso
- Métricas y dashboard listos desde el inicio
- Onboarding completo en 10 minutos

## 🏗️ Arquitectura

### Backend (NestJS)

```
packages/backend/src/
├── community-packs/
│   ├── dto/
│   │   ├── create-community-pack.dto.ts
│   │   ├── update-community-pack.dto.ts
│   │   ├── complete-step.dto.ts
│   │   └── update-metric.dto.ts
│   ├── community-packs.controller.ts
│   ├── community-packs.service.ts
│   └── community-packs.module.ts
└── communities/
    ├── dto/create-community.dto.ts  # Extended with onboardingPack
    └── communities.service.ts        # Creates pack automatically
```

### Frontend (Next.js)

```
packages/web/src/
├── lib/
│   └── communityPacks.ts            # Pack configurations
├── components/
│   ├── community-packs/
│   │   ├── MetricsDashboard.tsx     # Visualize metrics
│   │   └── SetupProgress.tsx        # Show setup progress
│   └── ui/
│       └── tabs.tsx                  # Tab component
└── pages/
    ├── comunidades/
    │   ├── index.tsx                 # Pack selector
    │   ├── grupo-consumo.tsx         # Consumer group landing
    │   ├── cooperativa-vivienda.tsx  # Housing coop landing
    │   ├── bar-comunitario.tsx       # Community bar landing
    │   └── setup.tsx                 # Setup wizard
    └── communities/[slug]/
        └── dashboard.tsx             # Community dashboard with metrics
```

### Base de Datos (Prisma)

```prisma
model CommunityPack {
  id                String                 @id @default(uuid())
  communityId       String                 @unique
  packType          OrganizedCommunityType
  setupCompleted    Boolean                @default(false)
  setupProgress     Int                    @default(0)
  enabledFeatures   String[]               @default([])
  customConfig      Json                   @default("{}")
  trackingMetrics   String[]               @default([])
  goals             Json                   @default("{}")
  setupSteps        CommunitySetupStep[]
  metrics           CommunityMetric[]
}

model CommunitySetupStep {
  id            String    @id @default(uuid())
  packId        String
  stepKey       String
  completed     Boolean   @default(false)
  completedAt   DateTime?
  stepData      Json      @default("{}")
}

model CommunityMetric {
  id            String   @id @default(uuid())
  packId        String
  metricKey     String
  value         Float    @default(0)
  previousValue Float?
  lastUpdated   DateTime @default(now())
  notes         String?
}
```

## 📦 Tipos de Packs

### 1. CONSUMER_GROUP (Grupo de Consumo)

**Landing Page:** `/comunidades/grupo-consumo`

**Funcionalidades:**
- 📦 Gestión de pedidos colectivos
- 💰 Calculadora de distribución de costes
- 🚚 Coordinación de recogida y reparto
- 🌾 Directorio de productores locales
- ⭐ Sistema de evaluación de calidad
- 📊 Estadísticas de ahorro colectivo
- 📅 Calendario de pedidos recurrentes
- 💬 Chat grupal para coordinación

**Métricas:**
- Ahorro mensual (€)
- Miembros activos
- Pedidos completados
- Productores locales
- Comida local (kg)
- CO2 evitado (kg)

**Setup Steps (45 min estimado):**
1. Información básica (5 min)
2. Invitar primeros miembros (10 min)
3. Configurar sistema de pedidos (15 min)
4. Definir punto de recogida (5 min)
5. Crear primer pedido (10 min) - opcional

### 2. HOUSING_COOP (Cooperativa de Vivienda)

**Landing Page:** `/comunidades/cooperativa-vivienda`

**Funcionalidades:**
- 🔧 Banco de herramientas compartidas
- 📅 Reserva de espacios comunes
- 💰 Gestión de gastos comunes
- 🗳️ Votaciones y propuestas
- 📋 Tablón de anuncios
- ⏰ Banco de tiempo entre vecinos
- 🛠️ Coordinación de mantenimiento
- 📊 Dashboard de administración

**Métricas:**
- Usos de herramientas
- Ahorro por vivienda (€/año)
- Reservas de espacios
- Tasa de participación (%)

**Setup Steps (40 min estimado):**
1. Información de la cooperativa (5 min)
2. Añadir viviendas/unidades (10 min)
3. Configurar espacios comunes (10 min)
4. Crear banco de herramientas (15 min) - opcional
5. Sistema de gobernanza (10 min)

### 3. COMMUNITY_BAR (Bar Comunitario)

**Landing Page:** `/comunidades/bar-comunitario`

**Funcionalidades:**
- 📅 Gestión de eventos y actividades
- 🍺 Proveedores locales
- 💳 Sistema de moneda local
- 👥 Gestión de socios
- 🎫 Venta de entradas
- 📊 Dashboard de gestión
- 💬 Comunidad de clientes habituales
- 🎨 Calendario cultural

**Métricas:**
- Eventos realizados
- Socios activos
- Moneda local circulando (€)
- Proveedores locales

**Setup Steps (30 min estimado):**
1. Información del bar (5 min)
2. Sistema de socios (10 min) - opcional
3. Proveedores locales (15 min) - opcional
4. Crear primer evento (10 min) - opcional

## 🔄 Flujo de Usuario

### 1. Descubrimiento
```
Usuario llega → /comunidades → Ve los packs disponibles → Elige uno
```

### 2. Landing Page
```
/comunidades/grupo-consumo
- Hero con propuesta de valor
- Caso de éxito real
- Grid de funcionalidades
- Preview de pasos de setup
- Métricas que podrá trackear
- CTA: "Empezar Gratis (10 min)"
```

### 3. Setup Wizard
```
Click CTA → /comunidades/setup?type=CONSUMER_GROUP

5 pasos guiados:
1. ✏️ Información básica (nombre, ubicación, descripción)
2. 👥 Invitar primeros miembros (emails)
3. ⚙️ Configurar funcionalidades (frecuencia pedidos, etc.)
4. 📍 Punto de recogida
5. ✅ Revisión y confirmación

POST /communities con { onboardingPack: { type, setupData } }
```

### 4. Community Created
```
Backend:
1. Crea Community
2. Añade usuario como ADMIN
3. Crea CommunityPack
4. Inicializa SetupSteps
5. Inicializa Metrics con valor 0

Redirect → /communities/:slug?welcome=true
```

### 5. Dashboard
```
/communities/:slug/dashboard

Tabs:
- Configuración: Muestra progreso del setup, pasos pendientes
- Métricas: Dashboard con visualización de métricas
- Ajustes: Configuración del pack
```

## 🔌 API Endpoints

### Pack Types

```typescript
GET /community-packs/types
// Returns all available pack types with configurations

GET /community-packs/types/:packType
// Returns configuration for specific pack type
// Response: { type, config: { setupSteps, defaultFeatures, defaultMetrics } }
```

### Pack Management

```typescript
POST /community-packs/communities/:communityId
// Create a pack for a community
// Body: CreateCommunityPackDto
// Auth: Required (must be community admin)

GET /community-packs/communities/:communityId
// Get pack with steps and metrics
// Response: CommunityPack with setupSteps[] and metrics[]

PATCH /community-packs/communities/:communityId
// Update pack configuration
// Body: UpdateCommunityPackDto
// Auth: Required (must be community admin)
```

### Setup Steps

```typescript
POST /community-packs/communities/:communityId/steps/complete
// Mark a setup step as complete
// Body: { stepKey: string, stepData?: Record<string, any> }
// Auth: Required (must be community admin)
// Side effects:
//   - Updates setupProgress percentage
//   - Checks if all required steps are complete
//   - Merges stepData into customConfig
```

### Metrics

```typescript
GET /community-packs/communities/:communityId/metrics
// Get all metrics for a community
// Response: CommunityMetric[]

PATCH /community-packs/communities/:communityId/metrics/:metricKey
// Update a metric value
// Body: { value: number, note?: string }
// Auth: Required (must be community admin)
// Side effects:
//   - Stores previousValue before updating
//   - Updates lastUpdated timestamp
```

### Community Creation (Extended)

```typescript
POST /communities
// Create community with optional onboarding pack
// Body: CreateCommunityDto {
//   ...communityData,
//   onboardingPack?: {
//     type: OrganizedCommunityType,
//     setupData?: Record<string, any>
//   }
// }
// Side effect: If onboardingPack provided, automatically creates pack
```

## 🎨 Componentes Frontend

### MetricsDashboard

**Props:**
```typescript
{
  communityId: string;
  packType: OrganizedCommunityType;
}
```

**Características:**
- Fetches metrics from API
- Muestra cada métrica con:
  - Icono y nombre
  - Valor actual formateado
  - Cambio porcentual (trending up/down)
  - Barra de progreso hacia objetivo
  - Última actualización
  - Notas opcionales
- Loading y error states
- Botón de refresh

### SetupProgress

**Props:**
```typescript
{
  communityId: string;
  onStepClick?: (stepKey: string) => void;
}
```

**Características:**
- Fetches pack from API
- Muestra progreso general (%)
- Lista de pasos con:
  - Número/checkmark
  - Título y descripción
  - Tiempo estimado
  - Estado (pending/in_progress/completed)
  - Fecha de completado
  - Badge "Requerido" si aplica
- Click handler para continuar setup
- Mensaje de congratulación al completar

### Community Dashboard Page

**URL:** `/communities/[slug]/dashboard`

**Tabs:**
1. **Configuración:** SetupProgress component
2. **Métricas:** MetricsDashboard component
3. **Ajustes:** Pack settings (en desarrollo)

## ⚙️ Configuración

### Añadir un Nuevo Pack

1. **Definir configuración** en `/lib/communityPacks.ts`:

```typescript
export const MY_NEW_PACK: CommunityPackConfig = {
  type: 'MY_TYPE',
  name: 'Mi Pack',
  shortDescription: '...',
  fullDescription: '...',
  icon: '🎯',
  color: 'purple',
  targetAudience: ['...'],
  features: ['...'],
  setupSteps: [
    {
      key: 'basic_info',
      title: 'Información Básica',
      description: '...',
      estimatedMinutes: 5,
      required: true,
    },
    // ...
  ],
  metrics: [
    {
      key: 'my_metric',
      name: 'Mi Métrica',
      unit: 'unidad',
      icon: '📊',
      description: '...',
      targetValue: 100,
    },
    // ...
  ],
};
```

2. **Añadir al registro**:

```typescript
export const COMMUNITY_PACKS: Record<OrganizedCommunityType, CommunityPackConfig> = {
  // ... existing packs
  MY_TYPE: MY_NEW_PACK,
};
```

3. **Añadir configuración backend** en `/community-packs/community-packs.service.ts`:

```typescript
const PACK_CONFIGS = {
  // ... existing configs
  MY_TYPE: {
    setupSteps: ['basic_info', '...'],
    requiredSteps: ['basic_info'],
    defaultFeatures: ['feature1', 'feature2'],
    defaultMetrics: ['my_metric'],
  },
};
```

4. **Crear landing page** en `/pages/comunidades/mi-pack.tsx`

5. **Actualizar selector** en `/pages/comunidades/index.tsx`

## 📊 Métricas Sugeridas por Tipo

### Grupos de Consumo
- Ahorro económico (€)
- Miembros activos (#)
- Pedidos completados (#)
- Productores locales (#)
- Kg comida local (kg)
- CO2 evitado (kg)

### Cooperativas de Vivienda
- Usos de herramientas (#)
- Ahorro por vivienda (€/año)
- Reservas de espacios (#)
- Tasa de participación (%)

### Bares Comunitarios
- Eventos realizados (#)
- Socios activos (#)
- Moneda local circulando (€)
- Proveedores locales (#)

### Centros Sociales
- Actividades realizadas (#)
- Asistentes (#)
- Colectivos alojados (#)
- Horas de uso del espacio (h)

## 🔮 Roadmap

### Fase 1 (Completada) ✅
- [x] Base de datos (Prisma models)
- [x] Backend API (NestJS module)
- [x] 3 packs definidos (Consumer Group, Housing Coop, Community Bar)
- [x] Landing pages específicas
- [x] Setup wizard
- [x] Dashboard de métricas
- [x] Componente de progreso de setup

### Fase 2 (Siguiente)
- [ ] Automatización de métricas (calcular desde transacciones reales)
- [ ] Recomendaciones basadas en progreso
- [ ] Conexiones entre comunidades (CommunityBridge)
- [ ] Casos de replicación (ReplicationCase)
- [ ] Dashboard público agregado

### Fase 3 (Futuro)
- [ ] Packs adicionales (Social Center, Ecovillage, etc.)
- [ ] Onboarding adaptativo basado en comportamiento
- [ ] Comparación con otras comunidades similares
- [ ] Exportar/importar configuraciones
- [ ] Plantillas de documentos legales por tipo

## 🎓 Casos de Uso

### Ejemplo 1: Grupo de Consumo "Zurriola"

1. Aterrizan en `/comunidades/grupo-consumo`
2. Ven caso de éxito similar (67 familias, €8,040 ahorrados)
3. Click "Empezar Gratis"
4. Setup wizard:
   - Nombre: "Grupo Consumo Zurriola"
   - Ubicación: Donostia
   - Invitan 15 correos de familias iniciales
   - Configuran: pedidos quincenales, viernes
   - Punto de recogida: Centro Cívico Zurriola
5. ¡Comunidad creada!
6. Dashboard muestra: 0€ ahorrados, 15 miembros, 0 pedidos
7. Crean primer pedido → Métrica se actualiza automáticamente

### Ejemplo 2: Cooperativa "Errotaberri"

1. Aterrizan en `/comunidades/cooperativa-vivienda`
2. Leen sobre banco de herramientas y espacios comunes
3. Setup wizard:
   - Añaden 24 viviendas
   - Definen espacios: lavandería, sala común, jardín
   - Catálogo inicial: taladro, escalera, cortacésped
4. Dashboard tracking: 0 usos, 0% participación
5. Vecinos empiezan a reservar herramientas → Métricas suben

## 📝 Notas de Implementación

### Consideraciones de Performance
- Métricas se cachean (no se recalculan en cada request)
- Updates de métricas son manuales o por batch job nocturno
- Landing pages son estáticas (pre-rendered)

### Seguridad
- Solo admins de la comunidad pueden completar steps
- Solo admins pueden actualizar métricas
- Rate limiting en endpoints de creación

### Extensibilidad
- Nuevos packs sin cambios en DB (solo config)
- Métricas customizables por comunidad
- Setup steps opcionales vs. requeridos

## 🤝 Contribuir

Para añadir un nuevo tipo de pack:

1. Fork el repo
2. Añade configuración en `communityPacks.ts`
3. Crea landing page
4. Actualiza backend PACK_CONFIGS
5. Añade tests
6. PR con descripción detallada

---

**Documentación actualizada:** 2025-11-10
**Versión:** 1.0.0
