# 🚀 Quick Reference - Kamiliahs PWA

## Estructura del Proyecto

```
kamiliahs.github.io/
├── index.html                      # Página principal
├── css/
│   └── style.css                   # Estilos con variables CSS
├── js/
│   ├── script.js                   # Script principal
│   ├── i18n.js                     # Configuración i18n
│   ├── sw-manager.js               # Service Worker manager
│   ├── pwa-devtools.js             # Herramientas debug
│   └── sw.js                       # Service Worker
├── locales/
│   ├── es.json                     # Traducciones español
│   └── en.json                     # Traducciones inglés
├── assets/
│   └── icons/                      # 112 iconos PWA
│       ├── android/
│       ├── ios/
│       └── windows11/
├── manifest.json                   # Configuración PWA
├── validate-pwa.sh                 # Script de validación
└── Documentación/
    ├── MOBILE_OPTIMIZATION.md      # Guía de optimizaciones
    ├── BEST_PRACTICES.md           # Mejores prácticas
    ├── IMPROVEMENTS_SUMMARY.md     # Resumen de cambios
    └── README.md                   # Este archivo
```

---

## Variables CSS - Referencia Rápida

### Espaciado
```css
var(--spacing-xs)    /* 0.25rem (4px) */
var(--spacing-sm)    /* 0.5rem (8px) */
var(--spacing-md)    /* 1rem (16px) */
var(--spacing-lg)    /* 1.5rem (24px) */
var(--spacing-xl)    /* 2rem (32px) */
var(--spacing-2xl)   /* 3rem (48px) */
var(--spacing-3xl)   /* 4rem (64px) */
```

### Tipografía
```css
var(--font-size-xs)     /* 0.75rem (12px) */
var(--font-size-sm)     /* 0.875rem (14px) */
var(--font-size-base)   /* 1rem (16px) */
var(--font-size-lg)     /* 1.125rem (18px) */
var(--font-size-xl)     /* 1.25rem (20px) */
var(--font-size-2xl)    /* 1.5rem (24px) */
var(--font-size-3xl)    /* 1.875rem (30px) */
var(--font-size-4xl)    /* 2.25rem (36px) */
```

### Colores
```css
var(--color-primary)      /* #007bff */
var(--color-secondary)    /* #6c757d */
var(--color-success)      /* #28a745 */
var(--color-danger)       /* #dc3545 */
var(--color-warning)      /* #ffc107 */
var(--color-info)         /* #17a2b8 */
```

### Tema Light/Dark
```css
var(--bg-primary)         /* Fondo principal */
var(--bg-secondary)       /* Fondo secundario */
var(--text-primary)       /* Texto principal */
var(--text-secondary)     /* Texto secundario */
var(--border-color)       /* Color de borde */
```

### Sombras
```css
var(--shadow-sm)   /* Pequeña */
var(--shadow-md)   /* Mediana */
var(--shadow-lg)   /* Grande */
var(--shadow-xl)   /* Extra grande */
```

### Transiciones
```css
var(--transition-fast)    /* 150ms */
var(--transition)         /* 300ms */
var(--transition-slow)    /* 500ms */
```

---

## HTML - Snippets Útiles

### Botón Accesible
```html
<button 
    type="button"
    class="btn btn-primary"
    aria-label="Descripción clara"
    data-i18n="button.label">
    Label
</button>
```

### Sección con Rol
```html
<section id="seccion" class="about">
    <div class="container">
        <h2 data-i18n="section.title">Título</h2>
        <p data-i18n="section.description">Descripción</p>
    </div>
</section>
```

### Link de Navegación
```html
<a 
    href="#seccion"
    data-i18n="nav.item"
    data-bs-dismiss="offcanvas">
    Item
</a>
```

### Mensaje de Alerta
```html
<div 
    role="alert"
    aria-live="polite"
    class="alert alert-success">
    <span data-i18n="message.success">Éxito</span>
</div>
```

---

## CSS - Snippets Útiles

### Botón Estándar
```css
.btn-custom {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    border-radius: var(--border-radius-lg);
    transition: var(--transition-fast);
    min-height: 44px;
}

.btn-custom:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btn-custom:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

### Sección Responsive
```css
section {
    padding: var(--spacing-lg) var(--gutter-mobile);
}

@media (min-width: 768px) {
    section {
        padding: var(--spacing-2xl) var(--gutter-mobile);
    }
}
```

### Card Component
```css
.card {
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
}

.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}
```

### Dark Mode
```css
[data-theme="dark"] .card {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
}
```

---

## JavaScript - Snippets Útiles

### Event Delegation
```javascript
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn) {
        const action = btn.getAttribute('data-action');
        handleAction(action);
    }
});
```

### i18n - Traducción
```javascript
// Obtener traducción
const text = i18next.t('navbar.brand');

// Cambiar idioma
i18next.changeLanguage('en');

// Actualizar página
updatePageTranslations();
```

### Mostrar Mensaje
```javascript
// Éxito
showMessage('Operación exitosa', 'success');

// Error
showMessage('Hubo un error', 'error');

// Información
showMessage('Información importante', 'info');

// Advertencia
showMessage('Por favor confirma', 'warning');
```

### Tema
```javascript
// Obtener tema actual
const theme = getCurrentTheme();  // 'light', 'dark', null

// Cambiar tema
changeTheme('dark');

// Cambiar idioma
changeLanguage('en');
```

### Service Worker
```javascript
// Obtener estado
const status = await swManager.getStatus();

// Iniciar
swManager.init();

// Forzar actualización
swManager.forceUpdate();
```

---

## i18n - Agregar Texto Nuevo

### Paso 1: HTML
```html
<h1 data-i18n="section.newText">Texto predeterminado</h1>
```

### Paso 2: js/i18n.js (Español)
```javascript
es: {
    translation: {
        section: {
            newText: "Nuevo texto en español"
        }
    }
}
```

### Paso 3: js/i18n.js (Inglés)
```javascript
en: {
    translation: {
        section: {
            newText: "New text in English"
        }
    }
}
```

### Paso 4: Usar en JS (si es necesario)
```javascript
const text = i18next.t('section.newText');
showMessage(text, 'info');
```

---

## Comandos Útiles

### Validar PWA
```bash
bash validate-pwa.sh
```

### Desarrollar localmente
```bash
# Abrir en navegador (necesita servidor local)
python -m http.server 8000
# http://localhost:8000
```

### Ver Git status
```bash
git status
git diff
```

### Commit y push
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

---

## Testing

### Chrome DevTools
```
1. F12 → Abre DevTools
2. Device Mode → Simula mobile
3. Console → Ver errors
4. Network → Ver carga
5. Application → Ver PWA/SW
6. Lighthouse → Audit
```

### Keyboard Testing
```
Tab        - Navega
Enter      - Activa
Escape     - Cierra
Arrow Keys - Menús
```

### Screen Reader (NVDA)
```
Descargar NVDA (gratis)
Activar: Ctrl + Alt + N
Testing: Tab + lectura
```

---

## Breakpoints Responsive

```css
/* Dispositivos comunes */
375px   - iPhone SE (base)
414px   - iPhone 12/13
480px   - Galaxy S10
600px   - Tablet pequeño
768px   - Tablet (BREAKPOINT 1)
1024px  - iPad Pro / Desktop (BREAKPOINT 2)
1440px+ - Gran desktop
```

---

## Checklist de Desarrollo

### Antes de Commit
- [ ] HTML válido
- [ ] CSS válido (sin errores)
- [ ] JS sin console errors
- [ ] Responsive en 375px, 768px, 1024px
- [ ] Temas light/dark funcionan
- [ ] Idiomas ES/EN funcionan
- [ ] i18n actualizado
- [ ] Sin console warnings

### Antes de Push
- [ ] Lighthouse score ≥90
- [ ] Accesibilidad (axe clean)
- [ ] Keyboard navigation OK
- [ ] Screen reader compatible
- [ ] Service Worker activo
- [ ] Offline funciona
- [ ] PWA instalable

---

## Performance Tips

### CSS
```css
/* ✅ Rápido */
.btn { transition: var(--transition-fast); }

/* ❌ Lento */
.btn { transition: all 0.3s ease; }
```

### JavaScript
```javascript
/* ✅ Rápido - Event delegation */
document.addEventListener('click', handler);

/* ❌ Lento - Múltiples listeners */
buttons.forEach(btn => btn.addEventListener('click', handler));
```

### Selectors CSS
```css
/* ✅ Rápido */
.btn { }
#hero { }

/* ❌ Lento */
div.btn.container { }
* > p > span { }
```

---

## Troubleshooting Rápido

### Tema no cambia
```javascript
// Verificar
console.log(document.documentElement.getAttribute('data-theme'));
// Resetear
localStorage.removeItem('theme');
```

### Traducción no actualiza
```javascript
// Forzar
i18next.changeLanguage('es');
updatePageTranslations();
```

### Service Worker issue
```javascript
// Desregistrar
navigator.serviceWorker.unregister();
// Limpiar cache
caches.keys().then(names => names.forEach(n => caches.delete(n)));
```

### CSS no aplica
```css
/* Verificar especificidad */
/* Verificar cascade */
/* Limpiar caché: Ctrl + Shift + R */
```

---

## Recursos Externos

- [MDN Web Docs](https://developer.mozilla.org/)
- [Bootstrap 5](https://getbootstrap.com/)
- [i18next](https://www.i18next.com/)
- [Web.dev](https://web.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última actualización**: 2024  
**Versión**: 1.0  
**Proyecto**: Kamiliahs PWA
