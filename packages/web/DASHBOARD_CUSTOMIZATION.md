# Sistema de Personalización del Dashboard

## Descripción

El sistema de personalización del dashboard permite a los usuarios configurar qué widgets ven en cada pestaña del dashboard principal (Descubre, Mi Actividad, Comunidad).

## Archivos Creados

### 1. `/src/lib/dashboardSettings.ts`

Biblioteca principal que gestiona la configuración de widgets:

- **`DashboardWidget`**: Interface que define la estructura de un widget
- **`AVAILABLE_WIDGETS`**: Objeto con todos los widgets disponibles
- **`DashboardSettings`**: Clase con métodos estáticos para:
  - `getEnabledWidgets()`: Obtiene los widgets habilitados
  - `setEnabledWidgets(widgetIds)`: Guarda la configuración
  - `toggleWidget(widgetId)`: Activa/desactiva un widget
  - `isWidgetEnabled(widgetId)`: Verifica si un widget está habilitado
  - `getWidgetsForTab(tab)`: Obtiene widgets de una pestaña específica

### 2. `/src/components/DashboardCustomizer.tsx`

Componente modal para personalizar el dashboard:

- Modal responsive con backdrop
- Lista de todos los widgets disponibles
- Toggle switches para activar/desactivar
- Filtros por pestaña (Descubre, Mi Actividad, Comunidad, Todos)
- Botón "Restaurar Predeterminados"
- Indicador de cambios sin guardar
- Confirmación al cancelar con cambios pendientes

### 3. Integración en `/src/pages/index.tsx`

- Importa `DashboardSettings` y `DashboardCustomizer`
- Agrega estado para widgets habilitados
- Botón "Personalizar" en la barra de pestañas
- Renderizado condicional de widgets basado en configuración
- Widgets personalizables:
  - `quick_actions`: Acciones Rápidas (tab Descubre)
  - `map_view`: Vista de Mapa (tab Descubre)
  - `community_stats`: Estadísticas (tab Comunidad)
  - `daily_seed`: Semilla Diaria (tab Comunidad)
  - `personal_feed`: Mi Feed (tab Mi Actividad)
  - `upcoming_events`: Próximos Eventos (tab Comunidad)

## Almacenamiento

La configuración se guarda en `localStorage` con la clave `dashboard_settings`. El formato es un array de strings con los IDs de los widgets habilitados:

```json
["quick_actions", "map_view", "community_stats", "daily_seed", "personal_feed", "upcoming_events"]
```

## Uso

### Para el usuario:

1. Hacer clic en el botón "Personalizar" (⚙️) en la barra de pestañas
2. Activar/desactivar widgets según preferencia
3. Filtrar por pestaña para ver solo widgets relevantes
4. Hacer clic en "Guardar Cambios" para aplicar
5. Opcionalmente, "Restaurar Predeterminados" para volver a la configuración inicial

### Para desarrolladores:

#### Agregar un nuevo widget:

1. Agregar entrada en `AVAILABLE_WIDGETS` en `dashboardSettings.ts`:

```typescript
MY_WIDGET: {
  id: 'my_widget',
  name: 'Mi Widget',
  icon: '🎯',
  description: 'Descripción del widget',
  component: 'MyComponent',
  defaultEnabled: true,
  tab: 'discover', // o 'activity' o 'community'
}
```

2. Importar el componente en `index.tsx`

3. Renderizarlo condicionalmente:

```typescript
{enabledWidgets.includes('my_widget') && <MyComponent />}
```

4. Agregar traducciones en `messages/es.json` y `messages/eu.json`:

```json
"dashboard": {
  "customizer": {
    "widgets": {
      "my_widget": {
        "name": "Mi Widget",
        "description": "Descripción del widget"
      }
    }
  }
}
```

## Traducciones

Las traducciones están disponibles en:
- Español: `/messages/es.json` → `dashboard.customizer`
- Euskera: `/messages/eu.json` → `dashboard.customizer`

## Analytics

El sistema registra los siguientes eventos:
- `DASHBOARD_CUSTOMIZER_OPENED`: Cuando se abre el modal
- `DASHBOARD_CUSTOMIZED`: Cuando se guardan cambios (incluye lista de widgets habilitados)

## Características

- ✅ Persistencia en localStorage
- ✅ Restaurar valores predeterminados
- ✅ Confirmación al descartar cambios
- ✅ Indicador visual de widgets activos/inactivos
- ✅ Filtrado por pestaña
- ✅ Diseño responsive (desktop y móvil)
- ✅ Modo oscuro compatible
- ✅ Animaciones suaves con Framer Motion
- ✅ Soporte multiidioma (ES/EU)
- ✅ Integración con Analytics

## Próximas Mejoras Sugeridas

1. Drag & drop para reordenar widgets
2. Vista previa en tiempo real
3. Plantillas predefinidas (Comerciante, Consumidor, Organizador, etc.)
4. Importar/exportar configuración
5. Sincronización con backend (guardar en base de datos)
6. Widgets personalizables con opciones avanzadas
