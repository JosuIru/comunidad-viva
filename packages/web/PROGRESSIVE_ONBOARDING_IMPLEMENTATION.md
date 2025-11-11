# Sistema de Onboarding Progresivo - Implementación Completa

## Resumen

✅ **Implementación completada exitosamente**

Se ha creado un sistema completo de onboarding progresivo que muestra tips contextuales a los usuarios según su nivel de experiencia. El sistema es:

- **No intrusivo**: Los tips aparecen en la esquina inferior derecha
- **Contextual**: Solo muestra tips relevantes según el nivel del usuario
- **Adaptativo**: Se muestra solo una vez por tip (configurable)
- **Animado**: Animaciones suaves de entrada y salida
- **Auto-gestionado**: Se cierra automáticamente después de 8 segundos

## Archivos Creados

### 1. `/home/josu/comunidad-viva/packages/web/src/lib/progressiveOnboarding.ts` (190 líneas)

**Responsabilidades:**
- Define la estructura de los tips (`OnboardingTip`)
- Contiene todos los tips del sistema en `ONBOARDING_TIPS`
- Gestiona el almacenamiento local de tips mostrados
- Proporciona métodos para obtener tips relevantes según contexto

**Características principales:**
```typescript
export interface OnboardingTip {
  id: string;              // Identificador único
  title: string;           // Título del tip
  description: string;     // Descripción detallada
  icon: string;            // Emoji/icono
  minLevel: number;        // Nivel mínimo del usuario
  maxLevel: number;        // Nivel máximo donde es relevante
  trigger: 'manual' | 'auto' | 'action';  // Cómo se activa
  action?: string;         // Acción que lo dispara (opcional)
  page?: string;           // Página donde aparece (opcional)
  once: boolean;           // Mostrar solo una vez
}
```

**Métodos públicos:**
- `getUserLevel()`: Obtiene el nivel actual del usuario
- `setUserLevel(level)`: Actualiza el nivel del usuario
- `getShownTips()`: Lista de tips ya mostrados
- `markTipShown(tipId)`: Marca un tip como mostrado
- `getRelevantTips(page?, action?)`: Obtiene tips relevantes
- `getNextTipForPage(page)`: Obtiene el siguiente tip para una página
- `triggerActionTip(action)`: Dispara un tip por acción específica

### 2. `/home/josu/comunidad-viva/packages/web/src/components/OnboardingTipDisplay.tsx` (134 líneas)

**Responsabilidades:**
- Renderiza visualmente los tips de onboarding
- Maneja las animaciones de entrada/salida
- Gestiona el auto-cierre (8 segundos)
- Proporciona botones de interacción

**Características visuales:**
- **Posición**: Esquina inferior derecha (fixed bottom-6 right-6)
- **Colores**: Gradiente verde (from-green-500 to-green-600)
- **Tamaño**: max-w-sm (28rem / 448px)
- **Animación**: Fade + translate-y con duration-300
- **Sombra**: shadow-2xl para dar profundidad
- **z-index**: 50 (por encima de la mayoría del contenido)

**Props:**
```typescript
interface OnboardingTipDisplayProps {
  tip: OnboardingTip | null;     // El tip a mostrar
  onClose: () => void;            // Callback al cerrar
  onDismissForever: () => void;   // Callback para no mostrar más
}
```

**Elementos interactivos:**
- ✕ Botón de cerrar (esquina superior derecha)
- "No mostrar más" - Link discreto
- "Entendido" - Botón primario (CTA)
- Barra de progreso de auto-cierre

### 3. Integración en `/home/josu/comunidad-viva/packages/web/src/pages/index.tsx`

**Cambios realizados:**

1. **Imports agregados:**
```typescript
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import ProgressiveOnboardingManager, { OnboardingTip } from '@/lib/progressiveOnboarding';
```

2. **Estado agregado:**
```typescript
const [currentOnboardingTip, setCurrentOnboardingTip] = useState<OnboardingTip | null>(null);
```

3. **Lógica en useEffect:**
```typescript
useEffect(() => {
  const token = localStorage.getItem('access_token');

  if (token) {
    const tourCompleted = localStorage.getItem('homepage_tour_completed');
    if (tourCompleted) {
      // Si el tour ya fue completado, mostrar tip progresivo
      setTimeout(() => {
        const tip = ProgressiveOnboardingManager.getNextTipForPage('homepage');
        if (tip) {
          setCurrentOnboardingTip(tip);
        }
      }, 2000);
    }
  }
}, []);
```

4. **Integración con el tour:**
```typescript
onComplete={() => {
  // ... código existente ...

  // Show progressive onboarding tip after tour completes
  setTimeout(() => {
    const tip = ProgressiveOnboardingManager.getNextTipForPage('homepage');
    if (tip) {
      setCurrentOnboardingTip(tip);
    }
  }, 2000);
}}
```

5. **Componente agregado al final:**
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

## Tips Configurados

### Nivel 1-2 (Principiantes)

**FIRST_CREDITS** (Acción: earn_first_credits)
- Título: "¡Ganaste tus primeros créditos! 🎉"
- Descripción: Explica qué son los créditos y cómo ganar más
- Trigger: action

**EXPLORE_MAP** (Página: homepage)
- Título: "Explora el mapa 🗺️"
- Descripción: Cómo usar el mapa para encontrar recursos
- Trigger: auto

### Nivel 3-5 (Intermedios)

**USE_FILTERS** (Página: homepage)
- Título: "Usa los filtros avanzados 🎯"
- Descripción: Combinar filtros para búsquedas precisas
- Trigger: auto

**JOIN_COMMUNITY** (Página: communities)
- Título: "Únete a más comunidades 🏘️"
- Descripción: Beneficios de participar en múltiples comunidades
- Trigger: auto

### Nivel 5-8 (Avanzados)

**TIMEBANK_ADVANCED** (Página: timebank)
- Título: "Maximiza tu Banco de Tiempo ⏰"
- Descripción: Estrategias para destacar tus habilidades
- Trigger: auto

**CREATE_PROJECT** (Página: homepage)
- Título: "Crea un proyecto colaborativo 🚀"
- Descripción: Coordinar esfuerzos hacia objetivos comunes
- Trigger: auto

### Nivel 8+ (Expertos)

**BECOME_CM** (Página: profile)
- Título: "¿Quieres ser Community Manager? 👑"
- Descripción: Solicitar permisos para gestionar comunidades
- Trigger: auto

**ADVANCED_ANALYTICS** (Página: profile)
- Título: "Accede a tus analytics 📊"
- Descripción: Revisar estadísticas detalladas
- Trigger: auto

## Flujo de Usuario

```
Usuario entra a la homepage
           |
           v
    ¿Autenticado?
      /        \
    NO         SÍ
    |           |
    v           v
Landing    ¿Tour completado?
Page         /         \
           NO          SÍ
           |            |
           v            v
     Mostrar Tour   ¿Hay tip relevante?
           |         /          \
           v       NO           SÍ
     Tour completa |             |
           |       v             v
           +-----> Continuar  Mostrar tip
                   normal      (2s delay)
                               |
                               v
                         Usuario interactúa
                         (Entendido / No mostrar más)
                               |
                               v
                         Marcar como mostrado
                               |
                               v
                         Enviar analytics
```

## Almacenamiento Local

### Keys utilizadas:

1. **`onboarding_tips_shown`**
   - Tipo: `string[]` (JSON serializado)
   - Contiene: Array de IDs de tips ya mostrados
   - Ejemplo: `["explore_map", "first_credits", "use_filters"]`

2. **`user_level`**
   - Tipo: `number` (string serializado)
   - Contiene: Nivel actual del usuario (1-99)
   - Default: 1

## Eventos de Analytics

El sistema registra los siguientes eventos:

1. **`ONBOARDING_TIP_CLOSED`**
   - Cuando: Usuario hace clic en "Entendido" o cierra el tip
   - Datos: `{ tipId: string }`

2. **`ONBOARDING_TIP_DISMISSED_FOREVER`**
   - Cuando: Usuario hace clic en "No mostrar más"
   - Datos: `{ tipId: string }`

## Testing Manual

Para probar el sistema localmente:

### 1. Limpiar localStorage
```javascript
localStorage.removeItem('onboarding_tips_shown');
localStorage.removeItem('user_level');
```

### 2. Establecer nivel de usuario
```javascript
localStorage.setItem('user_level', '1'); // Nivel 1-2: Principiantes
localStorage.setItem('user_level', '3'); // Nivel 3-5: Intermedios
localStorage.setItem('user_level', '5'); // Nivel 5-8: Avanzados
localStorage.setItem('user_level', '8'); // Nivel 8+: Expertos
```

### 3. Marcar tour como completado
```javascript
localStorage.setItem('homepage_tour_completed', 'true');
```

### 4. Recargar la página
Los tips apropiados deberían mostrarse según el nivel.

## Extensibilidad

### Agregar tip a nueva página

1. Definir el tip en `ONBOARDING_TIPS`:
```typescript
NEW_TIP: {
  id: 'new_tip',
  title: 'Nuevo Tip 🎯',
  description: 'Descripción del tip...',
  icon: '🎯',
  minLevel: 1,
  maxLevel: 5,
  trigger: 'auto',
  page: 'nueva-pagina',
  once: true,
},
```

2. En la nueva página:
```typescript
import { useState, useEffect } from 'react';
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import ProgressiveOnboardingManager from '@/lib/progressiveOnboarding';

export default function NuevaPagina() {
  const [currentTip, setCurrentTip] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const tip = ProgressiveOnboardingManager.getNextTipForPage('nueva-pagina');
      if (tip) setCurrentTip(tip);
    }, 2000);
  }, []);

  return (
    <>
      {/* Tu contenido */}

      <OnboardingTipDisplay
        tip={currentTip}
        onClose={() => {
          if (currentTip) {
            ProgressiveOnboardingManager.markTipShown(currentTip.id);
          }
          setCurrentTip(null);
        }}
        onDismissForever={() => {
          if (currentTip) {
            ProgressiveOnboardingManager.markTipShown(currentTip.id);
          }
          setCurrentTip(null);
        }}
      />
    </>
  );
}
```

### Disparar tips por acción

```typescript
const handleUserAction = () => {
  // Tu lógica...

  const tip = ProgressiveOnboardingManager.triggerActionTip('action_name');
  if (tip) {
    setCurrentTip(tip);
  }
};
```

## Mejoras Futuras

1. **Sincronización con Backend**
   - Almacenar progreso de onboarding en la base de datos
   - Sincronizar nivel de usuario con sistema de gamificación

2. **A/B Testing**
   - Probar diferentes mensajes y estilos
   - Medir efectividad de cada tip

3. **Analytics Avanzados**
   - Dashboard de métricas de onboarding
   - Tasas de conversión por tip
   - Tiempo promedio de visualización

4. **Inteligencia Artificial**
   - Tips dinámicos basados en comportamiento
   - Predicción del momento óptimo para mostrar cada tip

5. **Internacionalización**
   - Traducir tips a múltiples idiomas
   - Usar sistema i18n existente

6. **Más triggers**
   - Tiempo en la página
   - Scroll depth
   - Interacción con elementos específicos

## Estado del Proyecto

✅ **Completado y funcionando**

- Sistema base implementado
- Tips definidos para todos los niveles
- Integrado en homepage
- Sin errores de compilación
- Sin warnings de ESLint
- Documentación completa

## Próximos Pasos Recomendados

1. Integrar en más páginas (communities, timebank, profile)
2. Conectar nivel de usuario con sistema de gamificación existente
3. Agregar más tips según feedback de usuarios
4. Implementar sincronización con backend
5. Agregar tests unitarios e integración
