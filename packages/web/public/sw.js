// Service Worker para Truk PWA
const CACHE_VERSION = 'truk-v1.0.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;
const CACHE_API = `${CACHE_VERSION}-api`;

// Recursos estáticos a cachear inmediatamente
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/logo-light.png',
  '/apple-touch-icon.png',
];

// Límites de caché
const CACHE_LIMITS = {
  images: 100,
  pages: 50,
  api: 50,
};

// Instalar Service Worker y cachear assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('truk-') && name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de caché: Network First con fallback a caché
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await limitCacheSize(cacheName, CACHE_LIMITS.pages);
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline');
  }
}

// Estrategia de caché: Cache First con fallback a network
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await limitCacheSize(cacheName, CACHE_LIMITS.images);
    }
    return response;
  } catch (error) {
    return new Response('Network error', { status: 408 });
  }
}

// Estrategia para API: Network First con timeout
async function apiStrategy(request) {
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve(null), 3000);
  });

  try {
    const response = await Promise.race([fetch(request), timeout]);

    if (response && response.ok) {
      const cache = await caches.open(CACHE_API);
      cache.put(request, response.clone());
      await limitCacheSize(CACHE_API, CACHE_LIMITS.api);
      return response;
    }

    // Si no hay respuesta o timeout, intentar caché
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'No connection' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Network error' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Limitar tamaño de caché
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    const itemsToDelete = keys.length - maxItems;
    for (let i = 0; i < itemsToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin && !url.origin.includes('localhost')) {
    return;
  }

  // API requests (backend)
  if (url.pathname.startsWith('/api/') || url.port === '4000') {
    event.respondWith(apiStrategy(request));
    return;
  }

  // Imágenes
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_IMAGES));
    return;
  }

  // Assets estáticos de Next.js
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  // Páginas HTML - Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHE_DYNAMIC));
    return;
  }

  // Resto de recursos - Cache First
  event.respondWith(cacheFirst(request, CACHE_DYNAMIC));
});

// Mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      caches.keys().then(async (cacheNames) => {
        let totalSize = 0;
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length;
        }
        event.ports[0].postMessage({ totalSize });
      })
    );
  }
});

// Background sync para datos pendientes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Aquí puedes implementar lógica para sincronizar datos pendientes
  console.log('[SW] Sincronizando datos pendientes...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Truk';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon.ico',
    tag: data.tag || 'notification',
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfócala
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[SW] Service Worker cargado');
