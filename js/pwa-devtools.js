/**
 * Utilidades de desarrollo para PWA
 * Herramientas útiles para debuggear y probar el PWA
 */

class PWADevTools {
    /**
     * Obtiene información del Service Worker
     */
    static async getSWInfo() {
        const info = {
            supported: 'serviceWorker' in navigator,
            registered: false,
            active: false,
            status: null,
            cache: []
        };

        if (!info.supported) return info;

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            info.registered = !!registration;
            
            if (registration) {
                info.active = !!registration.active;
                info.status = {
                    installing: !!registration.installing,
                    waiting: !!registration.waiting,
                    active: !!registration.active
                };
            }

            // Obtener caches
            const cacheNames = await caches.keys();
            info.cache = cacheNames;

        } catch (error) {
            console.error('Error obteniendo info SW:', error);
        }

        return info;
    }

    /**
     * Obtiene el contenido de un cache específico
     */
    static async getCacheContents(cacheName) {
        try {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            const contents = [];

            for (const request of keys) {
                const response = await cache.match(request);
                contents.push({
                    url: request.url,
                    status: response.status,
                    type: response.type,
                    size: response.headers.get('content-length') || 'unknown'
                });
            }

            return contents;
        } catch (error) {
            console.error('Error leyendo cache:', error);
            return [];
        }
    }

    /**
     * Limpia todo el cache
     */
    static async clearAllCache() {
        try {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
            }
            console.log('✅ Todos los caches eliminados');
            return true;
        } catch (error) {
            console.error('Error limpiando cache:', error);
            return false;
        }
    }

    /**
     * Limpia un cache específico
     */
    static async clearCache(cacheName) {
        try {
            const success = await caches.delete(cacheName);
            if (success) {
                console.log(`✅ Cache '${cacheName}' eliminado`);
            } else {
                console.log(`❌ Cache '${cacheName}' no encontrado`);
            }
            return success;
        } catch (error) {
            console.error('Error limpiando cache:', error);
            return false;
        }
    }

    /**
     * Desinstala el Service Worker
     */
    static async unregisterSW() {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.unregister();
                console.log('✅ Service Worker desinstalado');
                window.location.reload();
                return true;
            } else {
                console.log('❌ No hay Service Worker registrado');
                return false;
            }
        } catch (error) {
            console.error('Error desinstalando SW:', error);
            return false;
        }
    }

    /**
     * Fuerza una actualización del Service Worker
     */
    static async forceUpdate() {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
                console.log('✅ Actualización del SW iniciada');
                return true;
            }
        } catch (error) {
            console.error('Error actualizando SW:', error);
            return false;
        }
    }

    /**
     * Obtiene información sobre conectividad
     */
    static getConnectionInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            online: navigator.onLine,
            type: connection ? connection.type : 'unknown',
            effectiveType: connection ? connection.effectiveType : 'unknown',
            downlink: connection ? connection.downlink : 'unknown',
            rtt: connection ? connection.rtt : 'unknown',
            saveData: connection ? connection.saveData : false
        };
    }

    /**
     * Simula modo offline
     */
    static goOffline() {
        // Nota: Esto es una simulación. El navegador no permite desconectar verdaderamente.
        console.log('⚠️ Para modo offline verdadero, usa DevTools:');
        console.log('1. F12 → Network');
        console.log('2. Click en "No throttling" → "Offline"');
    }

    /**
     * Genera reporte completo del PWA
     */
    static async generateReport() {
        console.log('📊 REPORTE PWA');
        console.log('='.repeat(50));

        // Info del navegador
        const ua = navigator.userAgent;
        console.log('\n📱 Navegador:');
        console.log(ua);

        // Soporte PWA
        console.log('\n✨ Soporte PWA:');
        console.log('Service Worker:', 'serviceWorker' in navigator ? '✅' : '❌');
        console.log('Web App Manifest:', document.querySelector('link[rel="manifest"]') ? '✅' : '❌');
        console.log('HTTPS:', location.protocol === 'https:' ? '✅' : '❌');
        console.log('Cache API:', 'caches' in window ? '✅' : '❌');
        console.log('IndexedDB:', 'indexedDB' in window ? '✅' : '❌');

        // Service Worker
        console.log('\n🔧 Service Worker:');
        const swInfo = await this.getSWInfo();
        console.table(swInfo);

        // Conectividad
        console.log('\n🌐 Conectividad:');
        console.table(this.getConnectionInfo());

        // Caches
        console.log('\n💾 Caches:');
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
            const contents = await this.getCacheContents(name);
            console.log(`\n📦 ${name} (${contents.length} items):`);
            console.table(contents.slice(0, 5)); // Mostrar primeros 5
        }

        console.log('\n' + '='.repeat(50));
        console.log('Fin del reporte');
    }

    /**
     * Abre la consola de desarrollo para PWA
     */
    static showDevPanel() {
        console.clear();
        console.log('%c🛠️  PWA DEV TOOLS', 'color: #007bff; font-size: 16px; font-weight: bold;');
        console.log('%cComandos disponibles:', 'color: #28a745; font-weight: bold;');
        console.log('PWADevTools.getSWInfo() - Info del Service Worker');
        console.log('PWADevTools.getCacheContents(name) - Contenido del cache');
        console.log('PWADevTools.clearCache(name) - Limpiar cache específico');
        console.log('PWADevTools.clearAllCache() - Limpiar todo');
        console.log('PWADevTools.unregisterSW() - Desinstalar SW');
        console.log('PWADevTools.forceUpdate() - Forzar actualización');
        console.log('PWADevTools.getConnectionInfo() - Info de conexión');
        console.log('PWADevTools.generateReport() - Reporte completo');
        console.log('PWADevTools.goOffline() - Info modo offline');
    }
}

// Mostrar mensaje de bienvenida
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('%c🚀 PWA Dev Tools disponible', 'color: #007bff; font-size: 14px;');
    console.log('%cEscribe: PWADevTools.showDevPanel()', 'color: #666;');
}

// Exportar globalmente
window.PWADevTools = PWADevTools;
