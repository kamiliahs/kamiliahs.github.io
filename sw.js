/**
 * Service Worker - PWA Offline Support
 * Proporciona funcionalidad offline y caché de recursos
 */

const CACHE_NAME = 'pos-minimalist-v1.0.18';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './src/css/main.css',
    './src/js/modules/storage.js',
    './src/js/modules/data.js',
    './src/js/modules/ui.js',
    './src/js/modules/utils.js',
    './src/js/app.js',
    './manifest.json',
    './src/lib/tailwind.min.js',
    './src/lib/peerjs.min.js',
    './src/lib/qrcode.min.js',
    './src/lib/jsQR.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caché abierto');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: Recursos cacheados');
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('Service Worker: Error en caché', err);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activado');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Eliminando caché antiguo', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Interception de peticiones (Fetch)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // No cachear la API de IP pública (siempre red)
    if (url.hostname.includes('ipify.org')) {
        return event.respondWith(fetch(request));
    }

    // Cachear Google Fonts
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(request).then((response) => {
                    return response || fetch(request).then((networkResponse) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }

    // Estrategia para scripts externos: Network First
    if (request.destination === 'script' && (request.url.includes('unpkg') || request.url.includes('jsdelivr'))) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Estrategia por defecto: Cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) return response;

                return fetch(request).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                });
            })
            .catch(() => {
                if (request.destination === 'document') {
                    return caches.match('./index.html');
                }
            })
    );
});


// Notificaciones push
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'Nueva notificación',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-192x192.png',
        tag: 'pos-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('POS Minimalist', options)
    );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Buscar ventana abierta
                for (let client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow('./');
                }
            })
    );
});

// Mensajes desde la App
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Cargado y registrado');
