/**
 * Service Worker para PWA
 * Maneja cacheo, sincronización y funcionalidad offline
 */

const CACHE_NAME = 'kamiliahs-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/script.js',
    '/js/i18n.js',
    '/manifest.json',
    '/locales/es.json',
    '/locales/en.json',
    '/assets/icons/android/android-launchericon-48-48.png',
    '/assets/icons/android/android-launchericon-72-72.png',
    '/assets/icons/android/android-launchericon-96-96.png',
    '/assets/icons/android/android-launchericon-144-144.png',
    '/assets/icons/android/android-launchericon-192-192.png',
    '/assets/icons/android/android-launchericon-512-512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css',
    'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
    'https://cdn.jsdelivr.net/npm/i18next@23.7.6/dist/umd/i18next.min.js',
    'https://cdn.jsdelivr.net/npm/i18next-http-backend@2.4.2/dist/umd/i18nextHttpBackend.min.js',
    'https://cdn.jsdelivr.net/npm/i18next-browser-languagedetector@7.2.0/dist/umd/i18nextBrowserLanguageDetector.min.js'
];

/* ========================================
   Instalación del Service Worker
   ======================================== */

self.addEventListener('install', event => {
    console.log('Service Worker instalándose...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache abierto:', CACHE_NAME);
            // Cachear solo los archivos locales
            return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
        }).catch(err => {
            console.error('Error durante la instalación:', err);
        })
    );
    
    // Activar inmediatamente sin esperar a que se cierre
    self.skipWaiting();
});

/* ========================================
   Activación del Service Worker
   ======================================== */

self.addEventListener('activate', event => {
    console.log('Service Worker activándose...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Tomar control de todas las páginas
    self.clients.claim();
});

/* ========================================
   Estrategia de Fetch
   ======================================== */

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // No cachear solicitudes de cross-origin (CDNs)
    if (url.origin !== location.origin) {
        event.respondWith(
            fetch(request).catch(() => {
                // Si falla, intentar del cache
                return caches.match(request);
            })
        );
        return;
    }
    
    // Estrategia Cache First para archivos estáticos
    if (isStaticAsset(request.url)) {
        event.respondWith(
            caches.match(request).then(response => {
                return response || fetch(request).then(response => {
                    // Cachear la respuesta exitosa
                    if (!response || response.status !== 200 || response.type === 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                }).catch(() => {
                    // Página offline si no hay respuesta
                    return caches.match('/index.html');
                });
            })
        );
        return;
    }
    
    // Estrategia Network First para otros archivos
    event.respondWith(
        fetch(request)
            .then(response => {
                if (!response || response.status !== 200) {
                    return response;
                }
                
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });
                
                return response;
            })
            .catch(() => {
                return caches.match(request).then(response => {
                    return response || createOfflineResponse();
                });
            })
    );
});

/* ========================================
   Funciones auxiliares
   ======================================== */

/**
 * Determina si una solicitud es para un activo estático
 */
function isStaticAsset(url) {
    return /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/.test(url) ||
           url.endsWith('/') ||
           url.endsWith('.html');
}

/**
 * Crea una respuesta para cuando no hay conexión
 */
function createOfflineResponse() {
    return new Response(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Offline</title></head><body><h1>Modo sin conexión</h1><p>No hay conexión a internet. Algunas características pueden no estar disponibles.</p></body></html>',
        {
            headers: { 'Content-Type': 'text/html' }
        }
    );
}

/* ========================================
   Sincronización en Segundo Plano
   ======================================== */

self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        console.log('Sincronizando datos...');
        // Aquí se pueden sincronizar datos cuando se recupere la conexión
        return Promise.resolve();
    } catch (error) {
        console.error('Error al sincronizar:', error);
        throw error;
    }
}

/* ========================================
   Notificaciones Push
   ======================================== */

self.addEventListener('push', event => {
    if (!event.data) return;
    
    const options = {
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: 'notification',
        requireInteraction: false
    };
    
    event.waitUntil(
        self.registration.showNotification('Kamiliahs', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // Si hay una ventana abierta, enfocarse en ella
            for (let i = 0; i < clientList.length; i++) {
                if (clientList[i].url === '/' && 'focus' in clientList[i]) {
                    return clientList[i].focus();
                }
            }
            // Si no hay ventana, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

console.log('Service Worker cargado correctamente');
