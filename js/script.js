/**
 * Script principal
 * Funcionalidad de la aplicación con optimizaciones para mobile
 */

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    console.log('Aplicación iniciada:', new Date().toLocaleString('es-ES'));
    
    // Inicializar Service Worker
    if ('serviceWorker' in navigator) {
        swManager.init().catch(err => {
            console.error('Error inicializando PWA:', err);
        });
    }
    
    // Inicializar tema
    initializeTheme();
    detectSystemThemeChanges();
    
    // Esperar a que i18next esté listo
    setTimeout(() => {
        initializeLanguageSelector();
        initializeThemeSelector();
        initializeEventListeners();
        addAnimationStyles();
    }, 100);
});

/* ========================================
   INICIALIZADORES
   ======================================== */

/**
 * Inicializa el selector de idioma
 */
function initializeLanguageSelector() {
    const currentLang = getCurrentLanguage();
    
    // Marcar el idioma actual como activo
    document.querySelectorAll('[data-lang]').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === currentLang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
        btn.addEventListener('click', handleLanguageChange);
    });
}

/**
 * Inicializa el selector de tema
 */
function initializeThemeSelector() {
    const currentTheme = getCurrentTheme();
    
    // Marcar el tema actual como activo
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
        const isActive = btn.getAttribute('data-theme-btn') === currentTheme;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
        btn.addEventListener('click', handleThemeChange);
    });
}

/**
 * Inicializa todos los event listeners
 */
function initializeEventListeners() {
    // Evento para el botón principal
    const saludarBtn = document.getElementById('saludar');
    if (saludarBtn) {
        saludarBtn.addEventListener('click', handleButtonClick);
        saludarBtn.addEventListener('touchstart', handleTouchStart);
        saludarBtn.addEventListener('touchend', handleTouchEnd);
    }

    // Eventos para los enlaces de navegación
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavClick);
    });

    // Feedback para botones al hacer clic
    document.querySelectorAll('button, a.btn').forEach(element => {
        element.addEventListener('click', addClickFeedback);
    });
}

/* ========================================
   MANEJADORES DE EVENTOS
   ======================================== */

/**
 * Maneja el cambio de idioma
 */
function handleLanguageChange(event) {
    event.preventDefault();
    const target = event.target.closest('[data-lang]');
    if (!target) return;
    
    const language = target.getAttribute('data-lang');
    
    // Actualizar estado visual
    document.querySelectorAll('[data-lang]').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === language;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
    
    changeLanguage(language);
}

/**
 * Maneja el cambio de tema
 */
function handleThemeChange(event) {
    event.preventDefault();
    const target = event.target.closest('[data-theme-btn]');
    if (!target) return;
    
    const theme = target.getAttribute('data-theme-btn');
    
    // Actualizar estado visual
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
        const isActive = btn.getAttribute('data-theme-btn') === theme;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
    
    changeTheme(theme);
}

/**
 * Maneja el evento del botón principal
 */
function handleButtonClick(event) {
    event.preventDefault();
    const message = i18next.t('messages.welcome');
    showMessage(message, 'success');
}

/**
 * Maneja el inicio del toque (para feedback visual)
 */
function handleTouchStart(event) {
    event.target.style.opacity = '0.8';
}

/**
 * Maneja el fin del toque (restaura opacity)
 */
function handleTouchEnd(event) {
    event.target.style.opacity = '1';
}

/**
 * Maneja el evento de navegación
 */
function handleNavClick(event) {
    const href = event.target.getAttribute('href');
    if (href && href.startsWith('#')) {
        const scrollMsg = i18next.t('messages.scrollTo');
        console.log(scrollMsg + href);
    }
}

/**
 * Agregar feedback visual al hacer clic
 */
function addClickFeedback(event) {
    const element = event.target.closest('button, a.btn');
    if (!element) return;
    
    // Crear ripple effect
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.6);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: ripple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

/* ========================================
   FUNCIONES DE MENSAJES
   ======================================== */

/**
 * Muestra un mensaje al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje: 'success', 'error', 'info', 'warning'
 */
function showMessage(message, type = 'info') {
    const colors = {
        success: { bg: '#28a745', border: '#20c997' },
        error: { bg: '#dc3545', border: '#e74c3c' },
        info: { bg: '#17a2b8', border: '#3498db' },
        warning: { bg: '#ffc107', border: '#f39c12' }
    };
    
    const color = colors[type] || colors.info;
    
    // Crear contenedor del mensaje
    const messageDiv = document.createElement('div');
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        left: 20px;
        background-color: ${color.bg};
        border-left: 4px solid ${color.border};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-weight: 500;
        font-size: 1rem;
        max-width: 400px;
        margin: 0 auto;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

/**
 * Muestra un error al usuario
 */
function showError(message) {
    showMessage(message, 'error');
}

/**
 * Muestra un mensaje de éxito
 */
function showSuccess(message) {
    showMessage(message, 'success');
}

/* ========================================
   ESTILOS DE ANIMACIÓN
   ======================================== */

/**
 * Agregar animaciones CSS globales
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        @keyframes ripple {
            from {
                transform: scale(0);
                opacity: 1;
            }
            to {
                transform: scale(4);
                opacity: 0;
            }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }

        /* Smooth transitions para elementos interactivos */
        button, a.btn, [role="button"] {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:active, a.btn:active {
            transform: scale(0.98);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
            button, a.btn {
                min-height: 44px;
                min-width: 44px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
        }

        /* Prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation: none !important;
                transition: none !important;
            }
        }

        /* Dark mode specific animations */
        [data-theme="dark"] button:hover {
            box-shadow: 0 0 20px rgba(13, 110, 253, 0.25);
        }
    `;
    document.head.appendChild(style);
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */

console.log('Script principal cargado y listo');
