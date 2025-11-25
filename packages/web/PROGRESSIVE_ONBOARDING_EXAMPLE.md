# Ejemplo Visual - Sistema de Onboarding Progresivo

## Cómo se ve un tip

```
┌─────────────────────────────────────────────────────┐
│  🗺️  Explora el mapa                          ✕   │
│                                                     │
│  El mapa muestra recursos cerca de ti. Haz zoom   │
│  y click en los marcadores para ver detalles.     │
│                                                     │
│                          No mostrar más  Entendido │
│                                                     │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │ ← Barra de progreso (8s)
└─────────────────────────────────────────────────────┘
   ↑
   Aparece en la esquina inferior derecha
```

## Secuencia de Animación

### 1. Aparición (300ms)
```
Estado inicial:
- opacity: 0
- translateY: 16px (translate-y-4)
- pointer-events: none

Estado final:
- opacity: 1
- translateY: 0
- pointer-events: auto
```

### 2. Visible (8 segundos)
```
- Barra de progreso avanza de 100% a 0%
- Usuario puede interactuar
- Hover en botones muestra feedback visual
```

### 3. Desaparición (300ms)
```
Estado final:
- opacity: 0
- translateY: 16px
- pointer-events: none

Luego se llama a onClose() o onDismissForever()
```

## Responsive Design

### Desktop (> 1024px)
```
┌────────────────────────────────┐
│  Tip en esquina inferior      │
│  derecha, ancho máximo 28rem  │
└────────────────────────────────┘
```

### Mobile (< 1024px)
```
┌──────────────────────────┐
│  Tip ocupa mayor ancho  │
│  bottom-6 right-6       │
│  max-w-sm               │
└──────────────────────────┘
```

## Estados Interactivos

### Hover en botón "Entendido"
```
Default:
bg-white text-green-600

Hover:
bg-green-50 text-green-600
```

### Hover en "No mostrar más"
```
Default:
text-white/80

Hover:
text-white
```

### Hover en botón cerrar (✕)
```
Default:
text-white/80

Hover:
text-white
```

## Casos de Uso Detallados

### Caso 1: Usuario Nuevo (Nivel 1)

**Escenario:**
- Usuario completa el registro
- Completa el tour interactivo
- Gana sus primeros créditos

**Tips que verá:**
1. **EXPLORE_MAP** (homepage)
   - Se muestra 2 segundos después del tour
   - Enseña a usar el mapa

2. **FIRST_CREDITS** (al ganar créditos)
   - Se dispara por acción
   - Explica el sistema de créditos

### Caso 2: Usuario Intermedio (Nivel 3)

**Escenario:**
- Usuario ya conoce lo básico
- Empieza a explorar más funcionalidades
- Visita la página de comunidades

**Tips que verá:**
1. **USE_FILTERS** (homepage)
   - Enseña a combinar filtros
   - Nivel 3-5

2. **JOIN_COMMUNITY** (communities)
   - Sugiere unirse a más comunidades
   - Nivel 3-6

### Caso 3: Usuario Avanzado (Nivel 5)

**Escenario:**
- Usuario activo en múltiples comunidades
- Visita el banco de tiempo
- Crea contenido regularmente

**Tips que verá:**
1. **TIMEBANK_ADVANCED** (timebank)
   - Estrategias de optimización
   - Nivel 5-10

2. **CREATE_PROJECT** (homepage)
   - Invitación a crear proyectos
   - Nivel 5-8

### Caso 4: Usuario Experto (Nivel 8+)

**Escenario:**
- Usuario con mucha experiencia
- Alta reputación en la comunidad
- Visita su perfil

**Tips que verá:**
1. **BECOME_CM** (profile)
   - Invitación a ser Community Manager
   - Nivel 8-99

2. **ADVANCED_ANALYTICS** (profile)
   - Acceso a métricas avanzadas
   - Nivel 8-99

## Código de Ejemplo - Tip Completo

### Definición del Tip
```typescript
EXPLORE_MAP: {
  id: 'explore_map',
  title: 'Explora el mapa 🗺️',
  description: 'El mapa muestra recursos cerca de ti. Haz zoom y click en los marcadores para ver detalles.',
  icon: '🔍',
  minLevel: 1,
  maxLevel: 3,
  trigger: 'auto',
  page: 'homepage',
  once: true,
}
```

### Uso en Componente
```typescript
// 1. Importar
import { useState, useEffect } from 'react';
import OnboardingTipDisplay from '@/components/OnboardingTipDisplay';
import ProgressiveOnboardingManager from '@/lib/progressiveOnboarding';

// 2. Estado
const [currentTip, setCurrentTip] = useState(null);

// 3. Cargar tip
useEffect(() => {
  setTimeout(() => {
    const tip = ProgressiveOnboardingManager.getNextTipForPage('homepage');
    if (tip) {
      setCurrentTip(tip);
      console.log('Mostrando tip:', tip.id);
    }
  }, 2000);
}, []);

// 4. Renderizar
<OnboardingTipDisplay
  tip={currentTip}
  onClose={() => {
    console.log('Tip cerrado:', currentTip?.id);
    if (currentTip) {
      ProgressiveOnboardingManager.markTipShown(currentTip.id);
    }
    setCurrentTip(null);
  }}
  onDismissForever={() => {
    console.log('Tip descartado permanentemente:', currentTip?.id);
    if (currentTip) {
      ProgressiveOnboardingManager.markTipShown(currentTip.id);
    }
    setCurrentTip(null);
  }}
/>
```

### Output en Console
```
Mostrando tip: explore_map
// Usuario cierra el tip
Tip cerrado: explore_map
// El tip se marca como mostrado en localStorage
```

## Testing en DevTools

### Ver tips mostrados
```javascript
console.log(
  JSON.parse(localStorage.getItem('onboarding_tips_shown') || '[]')
);
// Output: ["explore_map", "first_credits"]
```

### Ver nivel actual
```javascript
console.log(
  parseInt(localStorage.getItem('user_level') || '1')
);
// Output: 3
```

### Obtener tips disponibles para nivel 3
```javascript
import ProgressiveOnboardingManager from '@/lib/progressiveOnboarding';

ProgressiveOnboardingManager.setUserLevel(3);
const tips = ProgressiveOnboardingManager.getRelevantTips('homepage');
console.log(tips.map(t => t.id));
// Output: ["use_filters"]
```

### Simular acción
```javascript
const tip = ProgressiveOnboardingManager.triggerActionTip('earn_first_credits');
console.log(tip);
// Output: { id: 'first_credits', title: '¡Ganaste tus primeros créditos! 🎉', ... }
```

## Estructura de Archivos

```
packages/web/
├── src/
│   ├── lib/
│   │   └── progressiveOnboarding.ts      (190 líneas)
│   │       ├── OnboardingTip interface
│   │       ├── ONBOARDING_TIPS object
│   │       └── ProgressiveOnboardingManager class
│   │
│   ├── components/
│   │   └── OnboardingTipDisplay.tsx      (134 líneas)
│   │       ├── Props interface
│   │       ├── Animación de entrada/salida
│   │       ├── Auto-cierre (8s)
│   │       └── Handlers para botones
│   │
│   └── pages/
│       └── index.tsx                      (modificado)
│           ├── Import de dependencias
│           ├── Estado para tip actual
│           ├── useEffect para cargar tip
│           └── Componente OnboardingTipDisplay
│
├── PROGRESSIVE_ONBOARDING_USAGE.md        (233 líneas)
│   └── Guía de uso para desarrolladores
│
├── PROGRESSIVE_ONBOARDING_IMPLEMENTATION.md (557+ líneas)
│   └── Documentación completa de implementación
│
└── PROGRESSIVE_ONBOARDING_EXAMPLE.md      (este archivo)
    └── Ejemplos visuales y casos de uso
```

## Checklist de Implementación

### ✅ Completado

- [x] Crear interfaz `OnboardingTip`
- [x] Definir 8 tips para diferentes niveles
- [x] Implementar `ProgressiveOnboardingManager`
- [x] Crear componente `OnboardingTipDisplay`
- [x] Integrar en homepage (`index.tsx`)
- [x] Agregar animaciones suaves
- [x] Implementar auto-cierre (8s)
- [x] Agregar barra de progreso
- [x] Sincronizar con tour interactivo
- [x] Integrar con Analytics
- [x] Guardar en localStorage
- [x] Documentación completa
- [x] Sin errores de compilación
- [x] Sin warnings de ESLint

### 🔜 Pendiente (Opcional)

- [ ] Integrar en otras páginas (communities, timebank, profile)
- [ ] Conectar nivel con sistema de gamificación
- [ ] Sincronizar con backend
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Internacionalización (i18n)
- [ ] A/B testing
- [ ] Dashboard de métricas

## Contacto y Soporte

Para preguntas o mejoras, consultar:
- `PROGRESSIVE_ONBOARDING_USAGE.md` - Guía de uso
- `PROGRESSIVE_ONBOARDING_IMPLEMENTATION.md` - Documentación técnica
- Código fuente en `src/lib/progressiveOnboarding.ts`

---

**Estado**: ✅ Implementación completa y funcionando
**Última actualización**: 2025-11-01
