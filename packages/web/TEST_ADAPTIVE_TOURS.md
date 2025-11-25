# Plan de Pruebas - Sistema de Tours Adaptativos

## Pre-requisitos

- Servidor de desarrollo corriendo: `npm run dev`
- Usuario autenticado en la plataforma
- Navegador con DevTools abierto (F12)

## Test 1: Primera vez sin perfil

### Pasos:
1. Abrir DevTools → Console
2. Ejecutar:
   ```javascript
   localStorage.removeItem('user_profile');
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.removeItem('homepage_tour_completed');
   ```
3. Recargar página (F5)

### Resultado esperado:
- ✅ Después de 1 segundo aparece modal "Selecciona tu perfil"
- ✅ Se muestran 5 opciones de perfil con iconos
- ✅ No se puede confirmar sin seleccionar un perfil
- ✅ Botón "Cancelar" funciona

## Test 2: Selección de perfil "Nuevo Usuario"

### Pasos:
1. En el modal de ProfileSelector, hacer clic en "Nuevo Usuario" 👋
2. Hacer clic en "Confirmar"

### Resultado esperado:
- ✅ Modal se cierra
- ✅ Después de 0.5 segundos aparece tour interactivo
- ✅ Tour muestra 4 pasos:
  - Paso 1: Pestañas de navegación
  - Paso 2: Acciones rápidas
  - Paso 3: Vista mapa/feed
  - Paso 4: Filtros inteligentes
- ✅ Cada paso resalta el elemento correcto
- ✅ Se puede navegar con "Siguiente" y "Anterior"

## Test 3: Completar tour

### Pasos:
1. Hacer clic en "Siguiente" hasta llegar al último paso
2. Hacer clic en "Completar"

### Resultado esperado:
- ✅ Tour se cierra
- ✅ Aparece widget de feedback
- ✅ En console: "Tour adaptativo completado: Bienvenida Completa"
- ✅ Badge "Explorer" se otorga (notificación)
- ✅ En localStorage: `adaptive_tours_completed` contiene `["newbie_homepage"]`

## Test 4: Recargar después de completar

### Pasos:
1. Recargar página (F5)

### Resultado esperado:
- ✅ NO aparece modal de ProfileSelector
- ✅ NO aparece tour (ya completado)
- ✅ Después de 2 segundos aparece tip de onboarding progresivo (si hay disponible)

## Test 5: Perfil "Consumidor"

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.setItem('user_profile', 'consumer');
   ```
2. Recargar página (F5)

### Resultado esperado:
- ✅ Aparece tour con 2 pasos:
  - Paso 1: Vista mapa/feed
  - Paso 2: Filtros por categoría
- ✅ Descripción y título apropiados para consumidores

## Test 6: Perfil "Proveedor"

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.setItem('user_profile', 'provider');
   ```
2. Recargar página (F5)

### Resultado esperado:
- ✅ Aparece tour con 2 pasos:
  - Paso 1: Publicar recursos
  - Paso 2: Gestionar actividad
- ✅ Contenido enfocado en creación de recursos

## Test 7: Perfil "Gestor de Comunidad"

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.setItem('user_profile', 'community_manager');
   ```
2. Recargar página (F5)

### Resultado esperado:
- ✅ Aparece tour con 2 pasos:
  - Paso 1: Panel de Control Comunitario
  - Paso 2: Crear Eventos Masivos
- ✅ Contenido enfocado en gestión comunitaria

## Test 8: Perfil "Usuario Experto"

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.removeItem('adaptive_tours_completed');
   localStorage.setItem('user_profile', 'power_user');
   ```
2. Recargar página (F5)

### Resultado esperado:
- ✅ Aparece tour con 1 paso:
  - Paso 1: Filtros Avanzados
- ✅ Contenido mínimo para usuarios experimentados

## Test 9: Saltar tour

### Pasos:
1. Resetear tours:
   ```javascript
   localStorage.removeItem('adaptive_tours_completed');
   ```
2. Recargar página (F5)
3. Cuando aparezca tour, hacer clic en "Saltar" o "×"

### Resultado esperado:
- ✅ Tour se cierra inmediatamente
- ✅ Analytics registra `TOUR_SKIPPED`
- ✅ Tour NO se marca como completado en localStorage
- ✅ Al recargar, tour aparece de nuevo

## Test 10: Responsividad móvil

### Pasos:
1. Abrir DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Seleccionar "iPhone 12 Pro"
3. Resetear y recargar:
   ```javascript
   localStorage.removeItem('user_profile');
   ```
4. Recargar página

### Resultado esperado:
- ✅ Modal ProfileSelector se adapta a pantalla móvil
- ✅ Tour interactivo se muestra correctamente en móvil
- ✅ Todos los botones son accesibles
- ✅ No hay scroll horizontal

## Test 11: Accesibilidad

### Pasos:
1. Abrir modal ProfileSelector
2. Usar solo teclado:
   - Tab para navegar entre opciones
   - Enter para seleccionar
   - Esc para cerrar

### Resultado esperado:
- ✅ Se puede navegar con Tab
- ✅ Focus visible en elemento activo
- ✅ Enter selecciona perfil
- ✅ Esc cierra modal
- ✅ Tour sigue navegación con teclado

## Test 12: Persistencia entre sesiones

### Pasos:
1. Seleccionar perfil "Proveedor"
2. Completar tour
3. Cerrar navegador completamente
4. Abrir navegador y volver a la página

### Resultado esperado:
- ✅ Perfil "Proveedor" sigue seleccionado
- ✅ Tour NO aparece (ya completado)
- ✅ localStorage conserva:
  - `user_profile: "provider"`
  - `adaptive_tours_completed: ["provider_homepage"]`

## Test 13: Cambio de perfil (manual)

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.setItem('user_profile', 'newbie');
   localStorage.removeItem('adaptive_tours_completed');
   ```
2. Recargar página

### Resultado esperado:
- ✅ Tour de "Nuevo Usuario" aparece
- ✅ Contenido correcto para el perfil

## Test 14: Elementos con data-tour

### Pasos:
1. Inspeccionar elementos en DevTools
2. Buscar atributos `data-tour`

### Resultado esperado:
- ✅ `[data-tour="tabs"]` existe en pestañas
- ✅ `[data-tour="quick-actions"]` existe en acciones rápidas
- ✅ `[data-tour="map-toggle"]` existe en botones mapa/feed
- ✅ `[data-tour="filters"]` existe en panel de filtros

## Test 15: Compatibilidad con sistema existente

### Pasos:
1. En console ejecutar:
   ```javascript
   localStorage.setItem('homepage_tour_completed', 'true');
   localStorage.removeItem('user_profile');
   ```
2. Recargar página

### Resultado esperado:
- ✅ Sistema funciona sin errores
- ✅ Se muestra ProfileSelector (primera vez)
- ✅ Tour adaptativo funciona normalmente

## Checklist de Bugs Comunes

- [ ] Tour no aparece → Verificar que elementos con `data-tour` existan en DOM
- [ ] Modal no cierra → Verificar callbacks `onClose`
- [ ] Tour muestra pasos incorrectos → Verificar perfil en localStorage
- [ ] Error en console → Verificar importaciones y rutas de archivos
- [ ] Tour aparece dos veces → Verificar lógica de detección en useEffect
- [ ] Perfil no persiste → Verificar escritura en localStorage
- [ ] Tours se repiten → Verificar función `markTourCompleted`

## Comandos Útiles

### Limpiar todo:
```javascript
localStorage.clear();
location.reload();
```

### Ver estado actual:
```javascript
console.log('Perfil:', localStorage.getItem('user_profile'));
console.log('Tours completados:', localStorage.getItem('adaptive_tours_completed'));
console.log('Tour legacy:', localStorage.getItem('homepage_tour_completed'));
```

### Simular diferentes perfiles:
```javascript
// Newbie
localStorage.setItem('user_profile', 'newbie');
localStorage.removeItem('adaptive_tours_completed');

// Consumer
localStorage.setItem('user_profile', 'consumer');
localStorage.removeItem('adaptive_tours_completed');

// Provider
localStorage.setItem('user_profile', 'provider');
localStorage.removeItem('adaptive_tours_completed');

// Community Manager
localStorage.setItem('user_profile', 'community_manager');
localStorage.removeItem('adaptive_tours_completed');

// Power User
localStorage.setItem('user_profile', 'power_user');
localStorage.removeItem('adaptive_tours_completed');
```

## Resultado Final

- **Tests pasados**: __ / 15
- **Fecha**: ___________
- **Tester**: ___________
- **Notas**: ___________

---

**Nota**: Todos los tests deben pasar antes de considerar la feature como completa.
