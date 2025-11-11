# Sistema de Onboarding Progresivo - Guía de Uso

## Descripción

El sistema de onboarding progresivo muestra tips contextuales a los usuarios según su nivel de experiencia. Los tips se muestran de forma no intrusiva y se adaptan automáticamente al progreso del usuario.

## Archivos Creados

1. **`/home/josu/comunidad-viva/packages/web/src/lib/progressiveOnboarding.ts`**
   - Manager principal del sistema
   - Define los tips disponibles según niveles
   - Gestiona el almacenamiento local de tips mostrados

2. **`/home/josu/comunidad-viva/packages/web/src/components/OnboardingTipDisplay.tsx`**
   - Componente visual para mostrar los tips
   - Animaciones suaves de entrada/salida
   - Auto-cierre después de 8 segundos
   - Botones "Entendido" y "No mostrar más"

3. **Integración en `/home/josu/comunidad-viva/packages/web/src/pages/index.tsx`**
   - Carga automática de tips relevantes
   - Se muestra después de completar el tour inicial
   - Tracking de analytics

## Cómo Usar en Otras Páginas

### 1. Importar las dependencias

```typescript
import { useState, useEffect } from 'react';
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import ProgressiveOnboardingManager, { OnboardingTip } from '@/lib/progressiveOnboarding';
import Analytics from '@/lib/analytics'; // Opcional
```

### 2. Agregar estado para el tip actual

```typescript
const [currentOnboardingTip, setCurrentOnboardingTip] = useState<OnboardingTip | null>(null);
```

### 3. Cargar el tip relevante al montar el componente

```typescript
useEffect(() => {
  // Esperar 2 segundos después de cargar la página
  setTimeout(() => {
    const tip = ProgressiveOnboardingManager.getNextTipForPage('nombre-de-tu-pagina');
    if (tip) {
      setCurrentOnboardingTip(tip);
    }
  }, 2000);
}, []);
```

### 4. Agregar el componente OnboardingTipDisplay

```typescript
<OnboardingTipDisplay
  tip={currentOnboardingTip}
  onClose={() => {
    if (currentOnboardingTip) {
      ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
      Analytics.track('ONBOARDING_TIP_CLOSED', { tipId: currentOnboardingTip.id });
    }
    setCurrentOnboardingTip(null);
  }}
  onDismissForever={() => {
    if (currentOnboardingTip) {
      ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
      Analytics.track('ONBOARDING_TIP_DISMISSED_FOREVER', { tipId: currentOnboardingTip.id });
    }
    setCurrentOnboardingTip(null);
  }}
/>
```

## Agregar Nuevos Tips

Edita el archivo `/home/josu/comunidad-viva/packages/web/src/lib/progressiveOnboarding.ts` y agrega nuevos tips al objeto `ONBOARDING_TIPS`:

```typescript
NUEVO_TIP: {
  id: 'nuevo_tip',
  title: 'Título del Tip 🎯',
  description: 'Descripción detallada del tip que ayudará al usuario.',
  icon: '🎯',
  minLevel: 1, // Nivel mínimo del usuario para ver el tip
  maxLevel: 5, // Nivel máximo donde es relevante
  trigger: 'auto', // 'auto' | 'action' | 'manual'
  page: 'nombre-pagina', // Página donde aparece
  once: true, // Mostrar solo una vez
},
```

## Disparar Tips por Acción

Para mostrar un tip cuando el usuario realiza una acción específica:

```typescript
// En el handler de la acción
const handleUserAction = () => {
  // Tu lógica de acción...

  // Disparar tip
  const tip = ProgressiveOnboardingManager.triggerActionTip('nombre_de_accion');
  if (tip) {
    setCurrentOnboardingTip(tip);
  }
};
```

## Gestión de Niveles de Usuario

### Obtener nivel actual
```typescript
const userLevel = ProgressiveOnboardingManager.getUserLevel();
```

### Actualizar nivel del usuario
```typescript
ProgressiveOnboardingManager.setUserLevel(5);
```

## Páginas Disponibles

Los tips están configurados para las siguientes páginas:
- `homepage` - Página principal
- `communities` - Listado de comunidades
- `timebank` - Banco de tiempo
- `profile` - Perfil de usuario

## Tips Configurados por Nivel

### Nivel 1-2 (Principiantes)
- **FIRST_CREDITS**: Primer logro de créditos
- **EXPLORE_MAP**: Introducción al mapa

### Nivel 3-5 (Intermedios)
- **USE_FILTERS**: Filtros avanzados
- **JOIN_COMMUNITY**: Unirse a más comunidades

### Nivel 5-8 (Avanzados)
- **TIMEBANK_ADVANCED**: Optimización del banco de tiempo
- **CREATE_PROJECT**: Proyectos colaborativos

### Nivel 8+ (Expertos)
- **BECOME_CM**: Convertirse en Community Manager
- **ADVANCED_ANALYTICS**: Acceso a analytics detallados

## Ejemplo Completo - Página de Comunidades

```typescript
import { useState, useEffect } from 'react';
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import ProgressiveOnboardingManager, { OnboardingTip } from '@/lib/progressiveOnboarding';
import Analytics from '@/lib/analytics';

export default function CommunitiesPage() {
  const [currentOnboardingTip, setCurrentOnboardingTip] = useState<OnboardingTip | null>(null);

  useEffect(() => {
    // Cargar tip relevante para la página de comunidades
    setTimeout(() => {
      const tip = ProgressiveOnboardingManager.getNextTipForPage('communities');
      if (tip) {
        setCurrentOnboardingTip(tip);
      }
    }, 2000);
  }, []);

  return (
    <div>
      {/* Tu contenido de la página */}

      {/* Componente de tip */}
      <OnboardingTipDisplay
        tip={currentOnboardingTip}
        onClose={() => {
          if (currentOnboardingTip) {
            ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
            Analytics.track('ONBOARDING_TIP_CLOSED', {
              tipId: currentOnboardingTip.id,
              page: 'communities'
            });
          }
          setCurrentOnboardingTip(null);
        }}
        onDismissForever={() => {
          if (currentOnboardingTip) {
            ProgressiveOnboardingManager.markTipShown(currentOnboardingTip.id);
            Analytics.track('ONBOARDING_TIP_DISMISSED_FOREVER', {
              tipId: currentOnboardingTip.id,
              page: 'communities'
            });
          }
          setCurrentOnboardingTip(null);
        }}
      />
    </div>
  );
}
```

## Almacenamiento Local

El sistema utiliza localStorage para:
- `onboarding_tips_shown`: Array de IDs de tips ya mostrados
- `user_level`: Nivel actual del usuario (1-99)

## Personalización Visual

El componente `OnboardingTipDisplay` usa:
- Gradiente verde (`from-green-500 to-green-600`)
- Posición: esquina inferior derecha
- Auto-cierre: 8 segundos
- Animaciones: entrada desde abajo con fade

Para personalizar, edita `/home/josu/comunidad-viva/packages/web/src/components/OnboardingTipDisplay.tsx`

## Métricas y Analytics

El sistema registra los siguientes eventos:
- `ONBOARDING_TIP_CLOSED`: Cuando el usuario cierra el tip
- `ONBOARDING_TIP_DISMISSED_FOREVER`: Cuando selecciona "No mostrar más"

## Roadmap / Mejoras Futuras

1. Sincronizar nivel del usuario con el backend
2. Agregar tips para más páginas
3. A/B testing de diferentes mensajes
4. Dashboard de métricas de onboarding
5. Tips dinámicos basados en comportamiento del usuario
