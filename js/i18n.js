/**
 * Configuración de i18next
 * Inicializa el sistema de internacionalización
 */

const i18nConfig = {
    debug: false,
    fallbackLng: 'es',
    lng: localStorage.getItem('language') || 'es',
    resources: {
        es: {
            translation: {
                page: {
                    title: 'Kamiliahs - Aplicación Web'
                },
                navbar: {
                    brand: 'Kamiliahs',
                    inicio: 'Inicio',
                    about: 'Acerca de',
                    contact: 'Contacto',
                    settings: 'Configuración',
                    social: 'Redes Sociales'
                },
                hero: {
                    title: 'Bienvenido a mi proyecto',
                    subtitle: 'Este es un scaffold optimizado para proyectos alojados en GitHub Pages',
                    button: 'Haz clic aquí'
                },
                about: {
                    title: 'Acerca de',
                    description: 'Esta es una estructura base optimizada para comenzar tu proyecto web estático. Incluye todas las mejores prácticas de UX/UI para dispositivos móviles, soporte de temas oscuros/claros, internacionalización y funcionalidad PWA.'
                },
                contact: {
                    title: 'Contacto',
                    description: 'Puedes contactarme en mis redes sociales o por correo electrónico.'
                },
                footer: {
                    copyright: '© 2026 Kamiliahs. Todos los derechos reservados.',
                    madeWith: 'Hecho con ❤️ usando HTML5, CSS3 y JavaScript'
                },
                messages: {
                    welcome: '¡Hola! Gracias por hacer clic en el botón.',
                    scrollTo: 'Navegando a: '
                },
                language: {
                    es: 'Español',
                    en: 'English'
                },
                theme: {
                    light: 'Claro',
                    dark: 'Oscuro',
                    system: 'Sistema',
                    toggleTheme: 'Cambiar tema'
                },
                settings: {
                    title: 'Configuración',
                    theme: 'Tema',
                    themeLight: 'Claro',
                    themeDark: 'Oscuro',
                    themeSystem: 'Sistema',
                    themeDescription: 'Elige tu tema preferido',
                    language: 'Idioma',
                    languageDescription: 'Selecciona tu idioma preferido'
                }
            }
        },
        en: {
            translation: {
                page: {
                    title: 'Kamiliahs - Web Application'
                },
                navbar: {
                    brand: 'Kamiliahs',
                    inicio: 'Home',
                    about: 'About',
                    contact: 'Contact',
                    settings: 'Settings',
                    social: 'Social Media'
                },
                hero: {
                    title: 'Welcome to my project',
                    subtitle: 'This is an optimized scaffold for projects hosted on GitHub Pages',
                    button: 'Click here'
                },
                about: {
                    title: 'About',
                    description: 'This is an optimized base structure to start your static web project. It includes all best practices for mobile UX/UI, support for dark/light themes, internationalization, and PWA functionality.'
                },
                contact: {
                    title: 'Contact',
                    description: 'You can contact me on social media or email.'
                },
                footer: {
                    copyright: '© 2026 Kamiliahs. All rights reserved.',
                    madeWith: 'Made with ❤️ using HTML5, CSS3 and JavaScript'
                },
                messages: {
                    welcome: 'Hello! Thank you for clicking the button.',
                    scrollTo: 'Navigating to: '
                },
                language: {
                    es: 'Español',
                    en: 'English'
                },
                theme: {
                    light: 'Light',
                    dark: 'Dark',
                    system: 'System',
                    toggleTheme: 'Toggle theme'
                },
                settings: {
                    title: 'Settings',
                    theme: 'Theme',
                    themeLight: 'Light',
                    themeDark: 'Dark',
                    themeSystem: 'System',
                    themeDescription: 'Choose your preferred theme',
                    language: 'Language',
                    languageDescription: 'Select your preferred language'
                }
            }
        }
    },
    interpolation: {
        escapeValue: false
    }
};

/**
 * Inicializar i18next
 */
i18next.init(i18nConfig, (err, t) => {
    if (err) {
        console.error('Error al inicializar i18next:', err);
        return;
    }
    
    console.log('i18next inicializado correctamente');
    updatePageTranslations();
});

/**
 * Actualiza todas las traducciones en la página
 */
function updatePageTranslations() {
    // Elementos con atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translatedText = i18next.t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
            element.textContent = translatedText;
        } else {
            element.textContent = translatedText;
        }
    });
}

/**
 * Cambia el idioma y actualiza la página
 * @param {string} language - Código del idioma (ej: 'es', 'en')
 */
function changeLanguage(language) {
    i18next.changeLanguage(language, (err, t) => {
        if (err) {
            console.error('Error al cambiar idioma:', err);
            return;
        }
        
        // Guardar preferencia en localStorage
        localStorage.setItem('language', language);
        
        // Actualizar traducciones
        updatePageTranslations();
        
        // Actualizar botones de idioma activos
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === language);
        });
        
        console.log('Idioma cambiado a:', language);
    });
}

/**
 * Obtiene el idioma actual
 */
function getCurrentLanguage() {
    return i18next.language;
}

/* ========================================
   GESTIÓN DE TEMAS (CLARO/OSCURO)
   ======================================== */

/**
 * Obtiene el tema actual
 */
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'system';
}

/**
 * Aplica el tema actual
 */
function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.removeAttribute('data-theme');
        localStorage.setItem('theme', 'system');
        return prefersDark ? 'dark' : 'light';
    } else if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        return 'light';
    } else if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        return 'dark';
    }
}

/**
 * Inicializa el tema según las preferencias guardadas
 */
function initializeTheme() {
    const savedTheme = getCurrentTheme();
    applyTheme(savedTheme);
}

/**
 * Cambia el tema
 * @param {string} theme - Tema a aplicar: 'light', 'dark' o 'system'
 */
function changeTheme(theme) {
    applyTheme(theme);
    updateThemeButtons();
    console.log('Tema cambiado a:', theme);
}

/**
 * Actualiza el estado de los botones de tema
 */
function updateThemeButtons() {
    const currentTheme = getCurrentTheme();
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
        const btnTheme = btn.getAttribute('data-theme-btn');
        btn.classList.toggle('active', btnTheme === currentTheme);
    });
}

/**
 * Detecta cambios en la preferencia del sistema
 */
function detectSystemThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (getCurrentTheme() === 'system') {
            applyTheme('system');
        }
    });
}
