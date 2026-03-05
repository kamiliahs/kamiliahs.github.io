/**
 * Service Worker - PWA Offline Support
 * Proporciona funcionalidad offline y caché de recursos
 */

const CACHE_NAME = 'pos-minimalist-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './src/css/main.css',
    './src/js/modules/storage.js',
    './src/js/modules/data.js',
    './src/js/modules/ui.js',
    './src/js/modules/utils.js',
    './src/js/modules/webrtc.js',
    './src/js/modules/sync.js',
    './src/js/app.js',
    './manifest.json',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'
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

    // Estrategia: Cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Si está en caché, devolverlo
                if (response) {
                    return response;
                }

                // Si no está en caché, hacer petición de red
                return fetch(request)
                    .then((response) => {
                        // Si la petición falla, devolver error offline
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar la respuesta
                        const responseToCache = response.clone();

                        // Guardar en caché
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Fallback para recursos críticos cuando no hay conexión
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        console.log('Service Worker: Recurso no disponible offline', request.url);
                    });
            })
    );
});

// Sincronización de datos en segundo plano
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Sincronizando datos...');
    
    if (event.tag === 'sync-sales') {
        event.waitUntil(
            // Aquí se podría sincronizar datos con un servidor
            Promise.resolve()
        );
    }
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

console.log('Service Worker: Cargado y registrado');
