# 🏘️ Guía de Gestión de Comunidades

## 📋 Índice

1. [¿Qué son las Comunidades?](#qué-son-las-comunidades)
2. [¿Quién puede gestionar comunidades?](#quién-puede-gestionar-comunidades)
3. [Cómo explorar comunidades](#cómo-explorar-comunidades)
4. [Cómo crear una comunidad](#cómo-crear-una-comunidad)
5. [Cómo unirse a una comunidad](#cómo-unirse-a-una-comunidad)
6. [Gestión avanzada](#gestión-avanzada)
7. [API Reference](#api-reference)

---

## 🌟 ¿Qué son las Comunidades?

Las **Comunidades** son **grupos locales organizados geográficamente** donde las personas practican economía colaborativa. Cada comunidad es independiente pero puede conectarse con otras.

### Características de una Comunidad:

- 📍 **Ubicación geográfica** definida (barrio, pueblo, ciudad, comarca, región)
- 🎨 **Branding personalizado** (logo, colores, nombre)
- 🔐 **Privacidad configurable** (privada, pública, abierta, federada)
- 🏛️ **Gobernanza propia** (votaciones, moderación, reglas)
- 💱 **Sistema híbrido** de capas económicas
- 🤝 **Red de apoyo mutuo** entre miembros

### Ejemplos:

- **Barrio de Gracia** (Barcelona) - 2,500 vecinos
- **Bermeo** (Bizkaia) - 1,200 habitantes
- **Comuna La Florida** (Chile) - 10,000 residentes
- **Coworking Impact Hub** (Madrid) - 200 miembros

---

## 👥 ¿Quién puede gestionar comunidades?

### Actualmente: Sistema Abierto

**Cualquier usuario registrado puede:**
- ✅ Crear nuevas comunidades
- ✅ Ver todas las comunidades públicas
- ✅ Unirse a comunidades abiertas
- ✅ Gestionar las comunidades que creó

### Flujo de Creación:

```
Usuario Registrado
    ↓
Crea Comunidad
    ↓
Se convierte en Fundador
    ↓
Puede invitar miembros
    ↓
Comunidad se autogestiona con gobernanza descentralizada
```

### Roles en una Comunidad:

| Rol | Permisos |
|-----|----------|
| **Fundador** | Configuración inicial, bootstrap |
| **Miembro** | Participar, votar (según reputación) |
| **Moderador** | Revisar contenido (elegido por comunidad) |
| **Administrador** | Gestión completa (puede haber varios) |

> 💡 **Nota:** Los fundadores NO tienen privilegios permanentes. Después del "bootstrap period", la comunidad se autogestiona mediante votaciones.

---

## 🔍 Cómo explorar comunidades

### Página Pública: `/communities`

Acceso: **http://localhost:3000/communities**

**Características:**

- 🔎 **Búsqueda** por nombre o ubicación
- 🏷️ **Filtros** por tipo (barrio, pueblo, ciudad...)
- 🔓 **Filtros** por visibilidad (privada, pública, abierta)
- 📊 **Estadísticas** de cada comunidad
- 🗺️ **Mapa** (próximamente)

**¿Cómo acceder?**

1. Ve a la navegación principal
2. Clic en **"🏘️ Comunidades"**
3. Explora el listado
4. Haz clic en cualquier comunidad para ver detalles

---

## ➕ Cómo crear una comunidad

### Opción 1: Interfaz Web (Recomendada)

#### Paso 1: Accede al Panel de Gestión

```
http://localhost:3000/admin/communities
```

**¿Cómo llegar?**

- Desde `/communities` → clic en "Ir al Panel de Gestión"
- O acceso directo: `/admin/communities`

#### Paso 2: Haz clic en "+ Nueva Comunidad"

#### Paso 3: Rellena el Formulario

**Campos obligatorios:**

- **Nombre**: Ej: "Barrio de Gracia"
- **Slug**: URL amigable (se genera automáticamente)
  - Ej: `gracia-barcelona`
  - Se convertirá en: `/communities/gracia-barcelona`
- **Tipo**: NEIGHBORHOOD, VILLAGE, TOWN, COUNTY, REGION, CUSTOM
- **Visibilidad**: PRIVATE, PUBLIC, OPEN, FEDERATED

**Campos opcionales:**

- **Descripción**: Explica qué hace tu comunidad
- **Ubicación**: "Barcelona, España"
- **Coordenadas**: Latitud y Longitud (para geolocalización)
- **Radio**: Radio de acción en km
- **Logo**: URL de la imagen del logo
- **Banner**: URL de la imagen de portada
- **Color primario**: Para branding personalizado
- **Idioma**: es, eu, ca, gl, en
- **Moneda**: EUR, USD, GBP

**Opciones avanzadas:**

- ☑️ **Requiere aprobación manual** para nuevos miembros
- ☑️ **Permitir ofertas externas** (de comunidades conectadas)

#### Paso 4: Haz clic en "Crear Comunidad"

¡Listo! Tu comunidad está creada y aparecerá en el listado público.

---

### Opción 2: Via API (Avanzado)

```bash
# 1. Obtén tu token JWT (login)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu-email@example.com",
    "password": "tu-password"
  }'

# Copia el token que recibes

# 2. Crea la comunidad
curl -X POST http://localhost:4000/communities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "slug": "gracia-barcelona",
    "name": "Barrio de Gracia",
    "description": "Comunidad colaborativa de Gracia",
    "location": "Barcelona, España",
    "lat": 41.4036,
    "lng": 2.1589,
    "radiusKm": 2.5,
    "type": "NEIGHBORHOOD",
    "visibility": "OPEN",
    "requiresApproval": false,
    "allowExternalOffers": true,
    "primaryColor": "#4CAF50",
    "language": "es",
    "currency": "EUR"
  }'
```

---

## 🤝 Cómo unirse a una comunidad

### Para Usuarios:

1. **Explorar comunidades**: Ve a `/communities`
2. **Selecciona una comunidad**: Haz clic en la que te interese
3. **Haz clic en "Unirse"**

### Según Visibilidad:

| Visibilidad | Proceso |
|-------------|---------|
| **OPEN** | Te unes inmediatamente |
| **PUBLIC** | Envías solicitud → Fundador/Admin aprueba |
| **PRIVATE** | Solo por invitación |
| **FEDERATED** | Miembros de comunidades conectadas pueden ver contenido |

### Via API:

```bash
curl -X POST http://localhost:4000/communities/:id/join \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🛠️ Gestión avanzada

### Configurar Gobernanza

Cada comunidad puede configurar sus parámetros de gobernanza:

```javascript
// Umbrales de reputación
minProposalReputation: 10.0  // Mínimo para proponer
minVoteReputation: 1.0       // Mínimo para votar
minModerateReputation: 5.0   // Mínimo para moderar

// Parámetros de consenso
quorumPercentage: 20         // % de participación necesaria
approvalPercentage: 66       // % de votos a favor para aprobar
proposalDuration: 7          // días de discusión
votingDuration: 3            // días de votación

// Votación cuadrática
useQuadraticVoting: true     // Evita plutocracias
maxVoteCredits: 100          // Créditos máximos por propuesta

// Anti-trolls
autoModerateThreshold: 5     // Reportes para revisión
banThreshold: 10             // Reportes para ban temporal
```

### Conectar Comunidades

Las comunidades pueden conectarse entre sí para:
- Compartir ofertas
- Compartir eventos
- Crear red de apoyo regional

```bash
POST /communities/:id/connect/:targetId
```

### Sistema de Capas Económicas

Cada comunidad configura sus capas económicas híbridas:

```javascript
defaultLayer: 'TRADITIONAL'    // Capa por defecto
allowMixedMode: true           // ¿Permite modo mixto?
autoGiftDays: true             // Eventos puente automáticos
giftThreshold: 60              // % para proponer migración colectiva
```

---

## 📚 API Reference

### Endpoints Disponibles

#### GET `/communities`
Lista todas las comunidades públicas
```bash
# Parámetros:
# - type: NEIGHBORHOOD, VILLAGE, TOWN, COUNTY, REGION, CUSTOM
# - visibility: PRIVATE, PUBLIC, OPEN, FEDERATED
# - search: Buscar por nombre/ubicación

curl http://localhost:4000/communities?type=NEIGHBORHOOD&search=Barcelona
```

#### GET `/communities/:id`
Obtiene detalles de una comunidad
```bash
curl http://localhost:4000/communities/abc123
```

#### GET `/communities/slug/:slug`
Obtiene comunidad por slug
```bash
curl http://localhost:4000/communities/slug/gracia-barcelona
```

#### POST `/communities`
Crea una nueva comunidad (requiere autenticación)
```bash
curl -X POST http://localhost:4000/communities \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

#### PUT `/communities/:id`
Actualiza una comunidad (solo fundador/admin)
```bash
curl -X PUT http://localhost:4000/communities/abc123 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "description": "Nueva descripción" }'
```

#### DELETE `/communities/:id`
Elimina una comunidad (solo fundador)
```bash
curl -X DELETE http://localhost:4000/communities/abc123 \
  -H "Authorization: Bearer TOKEN"
```

#### POST `/communities/:id/join`
Unirse a una comunidad
```bash
curl -X POST http://localhost:4000/communities/abc123/join \
  -H "Authorization: Bearer TOKEN"
```

#### POST `/communities/:id/leave`
Salir de una comunidad
```bash
curl -X POST http://localhost:4000/communities/abc123/leave \
  -H "Authorization: Bearer TOKEN"
```

#### GET `/communities/:id/members`
Listar miembros de una comunidad
```bash
curl http://localhost:4000/communities/abc123/members \
  -H "Authorization: Bearer TOKEN"
```

---

## 🗺️ Estructura de Datos

### Community Model

```typescript
{
  id: string;                    // UUID
  slug: string;                  // URL-friendly: "gracia-barcelona"
  name: string;                  // "Barrio de Gracia"
  description?: string;
  logo?: string;
  bannerImage?: string;

  // Ubicación
  location?: string;             // "Barcelona, España"
  lat?: number;
  lng?: number;
  radiusKm?: number;

  // Configuración
  type: CommunityType;
  visibility: CommunityVisibility;
  requiresApproval: boolean;
  allowExternalOffers: boolean;

  // Branding
  primaryColor?: string;
  language: string;              // "es"
  currency: string;              // "EUR"

  // Stats
  membersCount: number;
  activeOffersCount: number;

  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

```typescript
enum CommunityType {
  NEIGHBORHOOD  // Barrio
  VILLAGE       // Pueblo
  TOWN          // Ciudad
  COUNTY        // Comarca
  REGION        // Región
  CUSTOM        // Personalizado
}

enum CommunityVisibility {
  PRIVATE       // Solo miembros, invisible
  PUBLIC        // Visible, requiere aprobación
  OPEN          // Visible, cualquiera puede unirse
  FEDERATED     // Conectada con otras comunidades
}
```

---

## 🎯 Casos de Uso

### 1. Barrio Urbano

**Escenario:** Barrio de Gracia quiere crear su economía local

```json
{
  "slug": "gracia-barcelona",
  "name": "Barrio de Gracia",
  "type": "NEIGHBORHOOD",
  "visibility": "OPEN",
  "radiusKm": 2.5,
  "location": "Barcelona, España",
  "requiresApproval": false
}
```

### 2. Pueblo Rural

**Escenario:** Bermeo quiere digitalizar sus intercambios

```json
{
  "slug": "bermeo",
  "name": "Bermeo",
  "type": "VILLAGE",
  "visibility": "OPEN",
  "radiusKm": 5,
  "location": "Bizkaia, Euskadi",
  "language": "eu"
}
```

### 3. Cooperativa Privada

**Escenario:** Cooperativa de vivienda con economía interna

```json
{
  "slug": "coop-sants",
  "name": "Cooperativa Sants",
  "type": "CUSTOM",
  "visibility": "PRIVATE",
  "requiresApproval": true,
  "allowExternalOffers": false
}
```

### 4. Red Regional

**Escenario:** Comarca que conecta varios pueblos

```json
{
  "slug": "uribe-kosta",
  "name": "Uribe Kosta",
  "type": "COUNTY",
  "visibility": "FEDERATED",
  "radiusKm": 15,
  "location": "Bizkaia, Euskadi"
}
```

---

## 🚀 Próximas Mejoras

- [ ] **Mapa interactivo** de comunidades
- [ ] **Sistema de verificación** de comunidades oficiales
- [ ] **Estadísticas avanzadas** por comunidad
- [ ] **Sistema de reputación** entre comunidades
- [ ] **API pública** para integrar con otras apps
- [ ] **App móvil** con geolocalización
- [ ] **Notificaciones** de nuevas comunidades cercanas
- [ ] **Badges** para comunidades destacadas

---

## 💡 FAQs

**¿Puedo crear múltiples comunidades?**
Sí, un usuario puede crear y gestionar varias comunidades.

**¿Las comunidades son jerárquicas?**
No, cada comunidad es independiente. Pueden conectarse mediante federación pero todas son iguales.

**¿Se pueden fusionar comunidades?**
Actualmente no, pero es una feature planificada.

**¿Hay límite de miembros por comunidad?**
No, las comunidades pueden escalar infinitamente.

**¿Cómo se financia una comunidad?**
Cada comunidad decide si cobra membresías, acepta donaciones, o es 100% gratuita.

---

## 📞 Soporte

¿Problemas al crear o gestionar comunidades?

- 📧 **Email:** soporte@comunidadviva.org
- 💬 **Chat:** http://localhost:3000/support
- 🐛 **GitHub Issues:** github.com/comunidad-viva/issues

---

**Versión:** 1.0
**Fecha:** Octubre 2025
