/**
 * Registro e inicialización del Service Worker
 * Módulo para gestionar la instalación y actualización del SW
 */

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.updateCheckInterval = null;
    }

    /**
     * Inicializa el Service Worker
     */
    async init() {
        // Verificar soporte de Service Worker
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Workers no soportados en este navegador');
            return;
        }

        try {
            // Registrar el Service Worker
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none'
            });

            console.log('✅ Service Worker registrado correctamente:', this.registration);

            // Escuchar actualizaciones
            this.registration.addEventListener('updatefound', () => {
                this.handleUpdateFound();
            });

            // Verificar actualizaciones cada hora
            this.startPeriodicUpdates();

            // Notificar al usuario si hay una actualización pendiente
            if (this.registration.waiting) {
                this.promptUpdate();
            }

        } catch (error) {
            console.error('❌ Error al registrar Service Worker:', error);
        }

        // Escuchar mensajes del Service Worker
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 Service Worker actualizado');
                this.showUpdateNotification();
            });
        }

        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleSWMessage(event.data);
        });
    }

    /**
     * Maneja cuando se encuentra una actualización
     */
    handleUpdateFound() {
        const newWorker = this.registration.installing;

        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nueva versión disponible
                this.promptUpdate();
            }
        });
    }

    /**
     * Muestra un diálogo para actualizar la aplicación
     */
    promptUpdate() {
        const message = document.createElement('div');
        message.id = 'pwa-update-prompt';
        message.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            max-width: 300px;
            animation: slideUp 0.3s ease;
        `;

        message.innerHTML = `
            <div style="margin-bottom: 0.75rem;">
                <strong>🔄 Actualización disponible</strong>
                <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Una nueva versión de la aplicación está disponible.</p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button id="pwa-update-accept" style="flex: 1; padding: 0.5rem; background: white; color: #007bff; border: none; border-radius: 0.25rem; cursor: pointer; font-weight: 600;">Actualizar</button>
                <button id="pwa-update-dismiss" style="flex: 1; padding: 0.5rem; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 0.25rem; cursor: pointer;">Después</button>
            </div>
        `;

        document.body.appendChild(message);

        document.getElementById('pwa-update-accept').addEventListener('click', () => {
            this.updateServiceWorker();
            message.remove();
        });

        document.getElementById('pwa-update-dismiss').addEventListener('click', () => {
            message.remove();
        });
    }

    /**
     * Actualiza el Service Worker
     */
    updateServiceWorker() {
        if (this.registration.waiting) {
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    /**
     * Muestra una notificación de actualización completada
     */
    showUpdateNotification() {
        // Recargar la página silenciosamente
        window.location.reload();
    }

    /**
     * Inicia verificación periódica de actualizaciones
     */
    startPeriodicUpdates() {
        this.updateCheckInterval = setInterval(() => {
            if (this.registration) {
                this.registration.update().catch(err => {
                    console.error('Error verificando actualización:', err);
                });
            }
        }, 60 * 60 * 1000); // Cada hora
    }

    /**
     * Detiene la verificación periódica
     */
    stopPeriodicUpdates() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }
    }

    /**
     * Maneja mensajes del Service Worker
     */
    handleSWMessage(data) {
        console.log('📨 Mensaje del Service Worker:', data);
        
        if (data.type === 'UPDATE_AVAILABLE') {
            this.promptUpdate();
        } else if (data.type === 'OFFLINE') {
            this.showOfflineNotification();
        } else if (data.type === 'ONLINE') {
            this.showOnlineNotification();
        }
    }

    /**
     * Muestra notificación de modo offline
     */
    showOfflineNotification() {
        console.log('⚠️ Modo offline activado');
        // Aquí se puede mostrar una UI indicando que está offline
    }

    /**
     * Muestra notificación de conexión restaurada
     */
    showOnlineNotification() {
        console.log('✅ Conexión restaurada');
        // Aquí se puede mostrar una UI indicando que está online
    }

    /**
     * Obtiene el estado de instalación
     */
    getStatus() {
        return {
            registered: !!this.registration,
            active: !!(this.registration && this.registration.active),
            installing: !!(this.registration && this.registration.installing),
            waiting: !!(this.registration && this.registration.waiting)
        };
    }

    /**
     * Desinstala el Service Worker (para desarrollo)
     */
    async unregister() {
        if (this.registration) {
            try {
                await this.registration.unregister();
                console.log('Service Worker desinstalado');
                this.stopPeriodicUpdates();
            } catch (error) {
                console.error('Error al desinstalar Service Worker:', error);
            }
        }
    }
}

// Exportar para uso global
const swManager = new ServiceWorkerManager();
