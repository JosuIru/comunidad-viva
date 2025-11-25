# Sistema de Tours Adaptativos

## Descripción

El sistema de tours adaptativos personaliza la experiencia de onboarding según el perfil del usuario, mostrando solo la información relevante para cada tipo de usuario.

## Archivos Creados/Modificados

### 1. `/src/lib/adaptiveTours.ts` (NUEVO)

**Componentes principales:**

- **`UserProfile`**: Tipo que define los perfiles de usuario disponibles:
  - `newbie`: Usuario nuevo que nunca usó la plataforma
  - `consumer`: Usuario que principalmente busca/consume recursos
  - `provider`: Usuario que principalmente crea/ofrece recursos
  - `community_manager`: Gestor de comunidad
  - `power_user`: Usuario experimentado

- **`TourStep`**: Interfaz que define cada paso del tour
  ```typescript
  {
    target: string;      // Selector CSS del elemento
    title: string;       // Título del paso
    description: string; // Descripción detallada
    position?: 'top' | 'bottom' | 'left' | 'right';
  }
  ```

- **`AdaptiveTour`**: Interfaz que define un tour completo
  ```typescript
  {
    id: string;          // ID único del tour
    name: string;        // Nombre descriptivo
    profile: UserProfile; // Perfil al que pertenece
    page: string;        // Página donde se muestra
    steps: TourStep[];   // Pasos del tour
    priority: number;    // Prioridad (mayor = se muestra primero)
  }
  ```

- **`AdaptiveTourManager`**: Clase singleton que gestiona los tours
  - `detectUserProfile()`: Detecta el perfil del usuario
  - `setUserProfile(profile)`: Establece manualmente el perfil
  - `getCompletedTours()`: Obtiene tours completados
  - `markTourCompleted(tourId)`: Marca un tour como completado
  - `getNextTourForProfile(page)`: Obtiene el siguiente tour para mostrar
  - `shouldShowTour(tourId)`: Verifica si se debe mostrar un tour

**Tours definidos:**

1. **NEWBIE_HOMEPAGE**: Tour completo de 4 pasos para usuarios nuevos
   - Explicación de tabs
   - Acciones rápidas
   - Vista mapa/feed
   - Filtros inteligentes

2. **CONSUMER_HOMEPAGE**: Tour de 2 pasos para consumidores
   - Vista mapa/feed
   - Filtros por categoría

3. **PROVIDER_HOMEPAGE**: Tour de 2 pasos para proveedores
   - Publicar recursos
   - Gestionar actividad

4. **CM_HOMEPAGE**: Tour de 2 pasos para community managers
   - Panel de control comunitario
   - Crear eventos masivos

5. **POWER_USER_HOMEPAGE**: Tour de 1 paso para usuarios expertos
   - Filtros avanzados

### 2. `/src/components/ProfileSelector.tsx` (NUEVO)

**Componente modal** que permite al usuario seleccionar su perfil.

**Props:**
- `onProfileSelected?: (profile: UserProfile) => void`: Callback al seleccionar perfil
- `isOpen: boolean`: Estado de visibilidad
- `onClose: () => void`: Callback al cerrar

**Características:**
- Modal responsivo y accesible
- 5 opciones de perfil con iconos descriptivos
- Muestra el perfil actual del usuario
- Animaciones suaves
- Validación antes de confirmar

**Perfiles disponibles:**
1. **Nuevo Usuario** 👋: Primera vez en la plataforma
2. **Consumidor** 🔍: Principalmente busca recursos
3. **Proveedor** ⚡: Crea y ofrece recursos
4. **Gestor de Comunidad** 🎯: Organiza eventos y administra
5. **Usuario Experto** 🚀: Conoce la plataforma

### 3. `/src/pages/index.tsx` (MODIFICADO)

**Cambios realizados:**

1. **Importaciones agregadas:**
   ```typescript
   import AdaptiveTourManager, { AdaptiveTour } from '@/lib/adaptiveTours';
   import ProfileSelector from '@/components/ProfileSelector';
   ```

2. **Nuevos estados:**
   ```typescript
   const [showProfileSelector, setShowProfileSelector] = useState(false);
   const [adaptiveTour, setAdaptiveTour] = useState<AdaptiveTour | null>(null);
   ```

3. **Lógica modificada en `useEffect`:**
   - Si el usuario no tiene perfil seleccionado → Mostrar ProfileSelector
   - Si tiene perfil → Cargar tour adaptativo correspondiente
   - Si completó todos los tours → Mostrar tips de onboarding progresivo

4. **Tour steps dinámicos:**
   ```typescript
   const tourSteps = adaptiveTour ? adaptiveTour.steps : [/* default steps */];
   ```

5. **Callback `onComplete` actualizado:**
   - Marca el tour adaptativo como completado usando `AdaptiveTourManager.markTourCompleted()`
   - Registra analytics
   - Otorga badge de explorador
   - Muestra siguiente tip

6. **ProfileSelector agregado:**
   ```typescript
   <ProfileSelector
     isOpen={showProfileSelector}
     onClose={() => setShowProfileSelector(false)}
     onProfileSelected={(profile) => {
       // Cargar tour del perfil seleccionado
     }}
   />
   ```

## Flujo de Usuario

### Primera visita (sin perfil):
1. Usuario se autentica
2. Se muestra modal de ProfileSelector (1 segundo de delay)
3. Usuario selecciona su perfil
4. Se carga el tour adaptativo para ese perfil
5. Tour se muestra automáticamente (0.5 segundos de delay)

### Visitas posteriores (con perfil):
1. Usuario se autentica
2. Sistema detecta perfil guardado
3. Busca tour pendiente para ese perfil
4. Si hay tour pendiente → lo muestra (1.5 segundos de delay)
5. Si no hay tours pendientes → muestra tip de onboarding progresivo

### Completar tour:
1. Usuario completa todos los pasos
2. Tour se marca como completado en localStorage
3. Se otorga badge "Explorer"
4. Se muestra feedback widget
5. Después de 2 segundos → muestra próximo tip de onboarding

## Almacenamiento Local

El sistema usa `localStorage` para persistir:

- **`user_profile`**: Perfil seleccionado por el usuario
- **`adaptive_tours_completed`**: Array JSON con IDs de tours completados
- **`homepage_tour_completed`**: Flag legacy (mantener por compatibilidad)

## Extensión del Sistema

### Agregar nuevo perfil:

1. Actualizar tipo `UserProfile` en `adaptiveTours.ts`
2. Agregar opción en `ProfileSelector.tsx` (`PROFILE_OPTIONS`)
3. Crear tours correspondientes en `ADAPTIVE_TOURS`

### Agregar nuevo tour:

```typescript
export const ADAPTIVE_TOURS: Record<string, AdaptiveTour> = {
  // ... tours existentes

  NEW_TOUR_ID: {
    id: 'new_tour_id',
    name: 'Nombre del Tour',
    profile: 'newbie', // o el perfil correspondiente
    page: 'homepage', // o la página correspondiente
    priority: 85, // prioridad (1-100)
    steps: [
      {
        target: '[data-tour="elemento"]',
        title: 'Título del paso',
        description: 'Descripción detallada...',
        position: 'bottom',
      },
      // ... más pasos
    ],
  },
};
```

### Agregar tours a otras páginas:

1. Agregar tours con `page: 'nombre_pagina'` en `ADAPTIVE_TOURS`
2. En la página destino:
   ```typescript
   const tour = AdaptiveTourManager.getNextTourForProfile('nombre_pagina');
   ```
3. Agregar atributos `data-tour` a elementos relevantes

## Mejoras Futuras

1. **Detección automática de perfil**: Implementar lógica en `detectUserProfile()` basada en:
   - Acciones del usuario (crear vs consumir)
   - Badges obtenidos
   - Métricas de uso

2. **Tours contextuales**: Tours que aparecen según:
   - Tiempo de uso
   - Acciones específicas
   - Contexto de navegación

3. **A/B Testing**: Probar diferentes variantes de tours

4. **Analytics mejorado**: Trackear:
   - Tasa de completación por perfil
   - Pasos donde usuarios abandonan
   - Efectividad de cada tour

5. **Internacionalización**: Traducir tours a euskera e inglés

6. **Tours multi-página**: Tours que guían al usuario entre diferentes páginas

## Testing

Para probar el sistema:

1. Limpiar localStorage:
   ```javascript
   localStorage.removeItem('user_profile');
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.removeItem('homepage_tour_completed');
   ```

2. Recargar página → Se mostrará ProfileSelector

3. Seleccionar diferentes perfiles y verificar tours correspondientes

4. Completar tour → Verificar que no se muestra nuevamente

5. Cambiar perfil manualmente desde configuración (cuando se implemente)

## Dependencias

- `react`: Para componentes
- `localStorage`: Para persistencia (navegador)
- `InteractiveTour`: Componente existente para mostrar tours
- `Analytics`: Para tracking de eventos

## Compatibilidad

- Compatible con sistema de onboarding progresivo existente
- Compatible con sistema de badges
- No rompe funcionalidad existente (fallback a tour por defecto)

---

**Autor**: Sistema de Tours Adaptativos
**Fecha**: 2025-11-01
**Versión**: 1.0.0
