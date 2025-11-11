# 📱 Truk - Progressive Web App (PWA)

Truk ahora es una **Progressive Web App (PWA)** completa, lo que significa que puede instalarse como una aplicación nativa en dispositivos móviles y de escritorio.

## ✨ Características PWA Implementadas

### 1. **Funcionalidad Offline**
- La aplicación funciona sin conexión a internet
- Caché inteligente de páginas visitadas, imágenes y datos de API
- Página offline personalizada cuando no hay conexión
- Sincronización automática cuando se recupera la conexión

### 2. **Instalable**
- Los usuarios pueden instalar Truk en su pantalla de inicio
- Banner de instalación inteligente que aparece en el momento adecuado
- Soporte completo para iOS, Android y Desktop
- Instrucciones específicas para cada plataforma

### 3. **Service Worker**
- Estrategias de caché optimizadas:
  - **Network First**: Para páginas HTML (siempre contenido fresco)
  - **Cache First**: Para imágenes y assets estáticos (carga rápida)
  - **API Strategy**: Para llamadas API con timeout y fallback
- Actualización automática con notificación al usuario
- Limpieza automática de caché antiguo

### 4. **Manifest**
- Configuración completa de PWA en `manifest.json`
- Iconos optimizados para todas las plataformas
- Theme color personalizado
- Configuración de orientación y display

### 5. **Push Notifications** (Preparado)
- Infrastructure lista para notificaciones push
- Manejadores de eventos implementados
- Click en notificaciones abre la app

## 📂 Archivos Creados

### Service Worker
- **`/packages/web/public/sw.js`** - Service Worker principal con estrategias de caché

### Páginas
- **`/packages/web/src/pages/offline.tsx`** - Página mostrada cuando no hay conexión

### Componentes
- **`/packages/web/src/components/PWAInstallPrompt.tsx`** - Banner de instalación inteligente

### Configuración
- **`/packages/web/public/manifest.json`** - Manifest de PWA
- **`/packages/web/next.config.js`** - Headers HTTP para SW y manifest
- **`/packages/web/src/pages/_document.tsx`** - Meta tags y favicons
- **`/packages/web/src/pages/_app.tsx`** - Registro de Service Worker

### Assets
- `/packages/web/public/favicon.ico` - Multi-resolución (256-16px)
- `/packages/web/public/apple-touch-icon.png` - 180x180px
- `/packages/web/public/android-chrome-192x192.png` - 192x192px
- `/packages/web/public/android-chrome-512x512.png` - 512x512px

## 🚀 Cómo Funciona

### En Producción (HTTPS)
1. El usuario visita https://truk.app
2. El Service Worker se registra automáticamente
3. Después de 3-5 segundos, aparece el banner de instalación
4. El usuario puede instalar la app con un clic
5. La app funciona offline después de la primera visita

### En Desarrollo
- El Service Worker **NO** se registra en desarrollo (`NODE_ENV !== 'production'`)
- Esto evita problemas con hot reload y cache durante desarrollo
- Para probar PWA en desarrollo, construye y sirve en producción:

```bash
cd packages/web
npm run build
npm start
```

## 📱 Instalación por Plataforma

### Android (Chrome/Edge)
1. Visita la aplicación
2. Aparece el banner "Instalar Truk"
3. Clic en "Instalar ahora"
4. La app se añade a la pantalla de inicio

### iOS (Safari)
1. Visita la aplicación
2. Aparece el banner con instrucciones
3. Toca el botón "Compartir" (cuadrado con flecha hacia arriba)
4. Selecciona "Añadir a inicio"
5. Pulsa "Añadir"

### Desktop (Chrome/Edge)
1. Visita la aplicación
2. Aparece el banner o icono de instalación en la barra de direcciones
3. Clic en "Instalar"
4. La app se abre en su propia ventana

## 🔧 Configuración y Personalización

### Actualizar Versión del Caché
Cuando hagas cambios significativos, actualiza la versión en `sw.js`:

```javascript
const CACHE_VERSION = 'truk-v1.0.1'; // Incrementa la versión
```

### Cambiar Estrategia de Caché
En `sw.js`, puedes modificar las estrategias:

```javascript
// Para hacer una ruta específica Cache First:
if (url.pathname.startsWith('/tus-rutas/')) {
  event.respondWith(cacheFirst(request, CACHE_STATIC));
  return;
}
```

### Ajustar Límites de Caché
```javascript
const CACHE_LIMITS = {
  images: 100,  // máximo 100 imágenes en caché
  pages: 50,    // máximo 50 páginas en caché
  api: 50,      // máximo 50 respuestas API en caché
};
```

### Personalizar Banner de Instalación
Edita `/packages/web/src/components/PWAInstallPrompt.tsx`:

```typescript
// Cambiar cuando aparece el banner (en milisegundos)
setTimeout(() => setShowPrompt(true), 3000); // 3 segundos

// Cambiar frecuencia de reaparición
const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
if (daysSinceDismissed > 7) // Reaparecer después de 7 días
```

## 🧪 Testing

### Probar Funcionalidad Offline
1. Abre Chrome DevTools
2. Ve a Application > Service Workers
3. Activa "Offline"
4. Navega por la app - debería funcionar
5. Visita una página nueva - verás la página offline

### Probar Instalación
1. Abre Chrome DevTools
2. Ve a Application > Manifest
3. Verifica que todos los campos estén correctos
4. Clic en "Add to homescreen" para simular instalación

### Verificar Caché
1. Abre Chrome DevTools
2. Ve a Application > Cache Storage
3. Verás caches: `truk-v1.0.0-static`, `-dynamic`, `-images`, `-api`
4. Inspecciona el contenido de cada caché

### Lighthouse Audit
```bash
# Ejecuta Lighthouse para PWA
npm install -g lighthouse
lighthouse https://tu-dominio.com --view
```

Deberías obtener **puntuación alta (90+) en PWA**.

## 🔐 Seguridad

### HTTPS Requerido
Las PWAs **requieren HTTPS** en producción. El Service Worker NO funcionará en HTTP (excepto localhost).

### Content Security Policy (CSP)
Si usas CSP, asegúrate de permitir:
```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  worker-src 'self' blob:;
  manifest-src 'self';
```

## 📊 Métricas y Monitoreo

### Eventos Disponibles
El Service Worker emite eventos útiles para analytics:

```javascript
// En tu código analytics
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_HIT') {
    // Contenido servido desde caché
    analytics.track('pwa_cache_hit', event.data);
  }
});
```

### Comandos de Gestión
El SW acepta mensajes para gestión:

```javascript
// Limpiar toda la caché
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'CLEAR_CACHE'
  });
}

// Obtener tamaño de caché
const channel = new MessageChannel();
navigator.serviceWorker.controller.postMessage(
  { type: 'GET_CACHE_SIZE' },
  [channel.port2]
);
channel.port1.onmessage = (event) => {
  console.log('Cache size:', event.data.totalSize);
};
```

## 🐛 Troubleshooting

### Service Worker no se registra
- Verifica que estés en HTTPS o localhost
- Revisa la consola por errores
- Verifica que `NODE_ENV === 'production'`

### Caché no se actualiza
- Incrementa `CACHE_VERSION` en `sw.js`
- Los usuarios recibirán actualización automática
- En desarrollo, limpia caché manualmente en DevTools

### Banner de instalación no aparece
- Solo aparece en HTTPS
- Solo en Chrome/Edge/Samsung Internet
- No aparece si ya está instalada
- No aparece si se rechazó en los últimos 7 días

### App funciona online pero no offline
- Verifica que el SW esté activo en DevTools
- Visita las páginas que quieres offline al menos una vez
- Revisa Cache Storage en DevTools

## 🚢 Deployment

### Variables de Entorno
No requiere variables adicionales, pero asegúrate de tener:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.tudominio.com
```

### Build y Deploy
```bash
cd packages/web
npm run build
npm start

# O con Docker
docker build -t truk-pwa .
docker run -p 3000:3000 truk-pwa
```

### Verificación Post-Deploy
1. Visita tu dominio
2. Abre DevTools > Application > Service Workers
3. Verifica que el SW esté "activated and running"
4. Intenta instalar la app
5. Prueba funcionalidad offline

## 📈 Próximos Pasos

### Push Notifications (Opcional)
Para implementar notificaciones push:

1. **Backend**: Generar VAPID keys
```bash
npx web-push generate-vapid-keys
```

2. **Frontend**: Solicitar permiso
```typescript
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'TU_VAPID_PUBLIC_KEY'
});
```

3. **Backend**: Enviar notificaciones
```typescript
await webpush.sendNotification(subscription, JSON.stringify({
  title: 'Nueva oferta',
  body: 'Hay una nueva oferta en tu comunidad'
}));
```

### Background Sync
Para sincronizar datos cuando vuelve la conexión:

```javascript
// En tu código
await registration.sync.register('sync-data');

// En sw.js (ya implementado)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});
```

## 📞 Soporte

Para problemas o preguntas sobre PWA:
- Revisa la consola del navegador
- Inspecciona Application > Service Workers en DevTools
- Verifica Lighthouse PWA audit
- Consulta: https://web.dev/progressive-web-apps/

---

**¡Truk ahora es una Progressive Web App completa! 🎉**
