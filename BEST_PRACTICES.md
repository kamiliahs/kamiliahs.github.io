# Mejores Prácticas - Kamiliahs PWA

## 📋 Guía de Desarrollo y Mantenimiento

---

## 🎨 Estándares de Código

### CSS
```css
/* ✅ CORRECTO - Usar variables CSS */
.button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-base);
    transition: var(--transition-fast);
    min-height: 44px; /* Touch target */
}

/* ❌ INCORRECTO - Valores hardcoded */
.button {
    padding: 1rem 1.5rem;
    font-size: 16px;
    transition: all 0.3s ease;
}
```

### HTML
```html
<!-- ✅ CORRECTO - Semántica y accesibilidad -->
<button 
    type="button"
    aria-label="Descripción clara"
    aria-pressed="false">
    Click
</button>

<!-- ❌ INCORRECTO -->
<div onclick="handleClick()" style="cursor: pointer;">Click</div>
```

### JavaScript
```javascript
/* ✅ CORRECTO - Event delegation y cleanup */
function initListener() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (btn) handleAction(btn);
    });
}

/* ❌ INCORRECTO - Multiple listeners */
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', handler);
});
```

---

## 🌍 Trabajo con Traducciones (i18n)

### ✅ Añadir Nuevo Texto

1. **HTML**: Usar atributo `data-i18n`
```html
<h1 data-i18n="hero.title">Bienvenido</h1>
```

2. **locales/es.json**: Agregar traducción
```json
{
    "hero": {
        "title": "Bienvenido"
    }
}
```

3. **locales/en.json**: Agregar traducción en inglés
```json
{
    "hero": {
        "title": "Welcome"
    }
}
```

4. **js/i18n.js**: Actualizar en ambas secciones de resources
```javascript
es: { translation: { hero: { title: "Bienvenido" } } },
en: { translation: { hero: { title: "Welcome" } } }
```

### ❌ NO hacer

```javascript
// ❌ MAL - Textos hardcoded
showMessage("Hola mundo");

// ✅ BIEN - Usar i18next
showMessage(i18next.t('messages.welcome'));
```

---

## 🎯 Agregar Nuevos Componentes

### Paso 1: Crear HTML
```html
<button 
    class="btn btn-primary"
    data-action="submit"
    aria-label="Enviar formulario"
    type="button">
    <i class="bi bi-send" aria-hidden="true"></i>
    <span data-i18n="button.submit">Enviar</span>
</button>
```

### Paso 2: Estilizar en CSS
```css
.btn-custom {
    padding: var(--spacing-md) var(--spacing-lg);
    min-height: 44px;  /* Touch target */
    border-radius: var(--border-radius-lg);
    transition: var(--transition-fast);
    font-weight: var(--font-weight-semibold);
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

### Paso 3: Agregar Event Listener en JS
```javascript
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="submit"]')) {
        handleSubmit(e);
    }
});
```

---

## 🎨 Sistema de Temas

### Usar en CSS
```css
:root {
    --color-primary: #007bff;
    --bg-primary: #ffffff;
    --text-primary: #212529;
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
}
```

### Usar en Componentes
```css
.card {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
```

---

## 📱 Responsive Design

### Mobile-First Workflow
```css
/* BASE: Mobile (375px) */
.section {
    padding: var(--spacing-lg) var(--gutter-mobile);
}

/* ENHANCE: Tablet (768px+) */
@media (min-width: 768px) {
    :root { --gutter-mobile: 1.5rem; }
    .section { padding: var(--spacing-3xl) var(--gutter-mobile); }
}

/* ENHANCE: Desktop (1024px+) */
@media (min-width: 1024px) {
    .section { padding: var(--spacing-3xl) 4rem; }
}
```

### Testing Responsive
```
Probar en:
- 375px (iPhone SE)
- 414px (iPhone 12)
- 480px (Galaxy S10)
- 768px (iPad)
- 1024px (Desktop)
- 1440px+ (Ultra-wide)
```

---

## ♿ Accesibilidad

### Checklist de Accesibilidad
- [ ] Touch targets ≥44x44px
- [ ] Contrast ratio ≥4.5:1 (AA)
- [ ] Labels en formularios
- [ ] Alt text en imágenes
- [ ] Keyboard navigation (Tab)
- [ ] Focus visible en todos los elementos
- [ ] aria-label/aria-pressed apropiados
- [ ] semantic HTML

### Test de Keyboard
```
1. Tab - Navega elementos
2. Enter/Space - Activa botones
3. Escape - Cierra modales
4. Arrow Keys - Navega menús
```

### Test de Screen Reader (NVDA/JAWS)
```
1. Todos los botones tienen aria-label
2. Formularios tienen labels <label>
3. Regiones tienen roles semánticos
4. Mensajes tienen role="alert"
```

---

## 🚀 Performance

### Optimizaciones Implementadas
- ✅ CSS variables (sin duplicate values)
- ✅ Scripts `defer` (no bloquean parsing)
- ✅ Selectors eficientes (IDs > Classes > Tags)
- ✅ Event delegation (menos listeners)
- ✅ GPU animations (transform, opacity)

### Evitar
- ❌ Reflows innecesarios
- ❌ Cambios de estilo en loops
- ❌ Selectors complejos
- ❌ Inline styles (usar CSS)
- ❌ setTimeout en loops

### Medir Performance
```javascript
// Chrome DevTools > Performance tab
performance.mark('start');
// ... código ...
performance.mark('end');
performance.measure('duration', 'start', 'end');
```

---

## 🔍 Debugging

### Service Worker
```javascript
// Ver registros
navigator.serviceWorker.getRegistrations()
    .then(regs => console.log(regs));

// Usar PWA Dev Tools
window.pwaDevTools.getSWInfo();
```

### Storage
```javascript
// Ver localStorage
localStorage.getItem('language');
localStorage.getItem('theme');

// Limpiar
localStorage.clear();
```

### i18n
```javascript
// Ver idioma actual
i18next.language;

// Cambiar
i18next.changeLanguage('en');

// Obtener traducción
i18next.t('navbar.brand');
```

---

## 📊 Validación de Código

### Validar HTML
```bash
# Usando extensión de navegador o:
# https://validator.w3.org/
```

### Validar CSS
```bash
# https://jigsaw.w3.org/css-validator/
```

### Validar Accesibilidad
```bash
# Chrome DevTools > Lighthouse
# axe DevTools extension
# WAVE extension
```

---

## 🔄 Flujo de Git

### Crear rama para feature
```bash
git checkout -b feature/add-new-component
```

### Commit mensaje semántico
```bash
git commit -m "feat(ui): añadir nuevo componente button"
git commit -m "fix(a11y): mejorar contrast ratio en links"
git commit -m "docs(i18n): actualizar traducciones"
git commit -m "style(css): refactorizar variables"
```

### Tipos de commit
- `feat:` Nueva funcionalidad
- `fix:` Arreglar bug
- `docs:` Documentación
- `style:` Formato/variables
- `refactor:` Reorganizar código
- `test:` Tests
- `perf:` Performance

---

## 📋 Checklist de Deployment

Antes de hacer `git push`:

- [ ] Validar HTML con W3C validator
- [ ] Validar CSS
- [ ] Ejecutar Lighthouse audit
- [ ] Probar en mobile real (375px, 414px)
- [ ] Probar en tablet (768px)
- [ ] Probar navegación por teclado
- [ ] Probar con screen reader
- [ ] Verificar traducciones (ES/EN)
- [ ] Verificar temas (Light/Dark/System)
- [ ] Verificar Service Worker
- [ ] No hay console errors
- [ ] No hay warnings en DevTools

---

## 🆘 Troubleshooting Común

### Problema: Tema no cambia
```javascript
// Verificar
document.documentElement.getAttribute('data-theme');
// Debe ser: light, dark, o null (sistema)
```

### Problema: Traducciones no se actualizan
```javascript
// Forzar actualización
i18next.changeLanguage('es');
updatePageTranslations();
```

### Problema: Service Worker no actualiza
```javascript
// Limpiar cache
await caches.delete('assets-v1');
// Desregistrar
navigator.serviceWorker.unregister();
```

### Problema: Elemento no responde a clicks
```javascript
// Verificar z-index
// Verificar pointer-events: none
// Verificar display: none
// Verificar min-height/width (touch target)
```

---

## 📚 Recursos Útiles

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev Best Practices](https://web.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [i18next Documentation](https://www.i18next.com/)
- [Bootstrap 5 Docs](https://getbootstrap.com/docs/5.0/)

---

## 🎯 Roadmap Futuro

- [ ] Agregar bottom navigation bar
- [ ] Implementar swipe gestures
- [ ] Agregar más idiomas (FR, DE, IT)
- [ ] Dark mode schedule (por horario)
- [ ] Network status indicator
- [ ] Offline page mejorada
- [ ] Analytics tracking
- [ ] Performance monitoring

---

**Versión**: 1.0  
**Última actualización**: 2024  
**Mantenedor**: Kamiliahs Team
