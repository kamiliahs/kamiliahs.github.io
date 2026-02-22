# 🛠️ Tech Stack

## Frontend Framework
- **HTML5** - Semántica, PWA metadata
- **CSS3** - Variables dinámicas, flexbox, grid
- **JavaScript (Vanilla)** - Sin dependencias runtime

## UI Framework
- **Bootstrap 5.3.0** - Componentes responsivos
- **Bootstrap Icons 1.11.0** - Iconografía vectorial

## Internacionalización
- **i18next 23.7.6** - Motor de traducciones
- **i18next HTTP Backend** - Carga dinámica
- **i18next Browser Language Detector** - Detección automática

## Fuentes
- **Google Fonts** - Kaushan Script (headers)

## PWA
- **Service Worker API** - Cacheo y offline
- **Manifest API** - Configuración de app
- **Cache API** - Gestión de recursos
- **IndexedDB** (listo para expandir)

## Hosting
- **GitHub Pages** - HTTPS incluido

## Herramientas de Desarrollo
- **Bash** - Scripts de validación
- **Git** - Control de versiones

---

## 📊 Arquitectura

### Modular JavaScript
```
js/
├── i18n.js           → Configuración i18next + temas
├── sw-manager.js     → Registro y actualización de SW
├── pwa-devtools.js   → Herramientas de debugging
└── script.js         → Lógica principal
```

### Estructura de datos
```
locales/
├── es.json           → Traducciones español
└── en.json           → Traducciones inglés
```

### Storage
```
localStorage:
├── language          → Idioma seleccionado
├── theme             → Tema elegido
└── [i18next]         → Cache de i18next
```

---

## 🔄 Flujo de ejecución

1. **Load HTML** → Parsin del DOM
2. **Load CSS** → Estilos aplicados
3. **Load JS** → Scripts ejecutándose
   - sw-manager.js: Registra Service Worker
   - i18n.js: Inicializa traducciones y temas
   - pwa-devtools.js: Expone herramientas
   - script.js: Lógica de la aplicación
4. **Service Worker** → Intercepta fetch, cachea recursos
5. **i18next** → Traduce elementos con data-i18n
6. **Temas** → Aplica variables CSS según preferencia

---

## 📦 Tamaños

| Archivo | Tamaño |
|---------|--------|
| index.html | 8KB |
| style.css | 8KB |
| script.js | 8KB |
| i18n.js | 8KB |
| sw-manager.js | 5KB |
| pwa-devtools.js | 6KB |
| es.json | 4KB |
| en.json | 4KB |
| manifest.json | 3KB |
| sw.js | 8KB |
| **Total** | **~55KB** |

---

## 🚀 Performance

### First Paint
- Cache hit: <100ms
- Network: ~500ms

### Service Worker
- Instalación: <1s
- Activación: <100ms
- Cacheo: Automático en background

### Bundle
- Critical: 55KB (inline en HTML)
- Async: CDN (Bootstrap, i18next, fonts)

---

## 🔒 Seguridad

- ✅ HTTPS requerido (GitHub Pages)
- ✅ Service Worker solo en HTTPS/localhost
- ✅ Content Security Policy ready
- ✅ Sin datos sensibles en localStorage

---

## ♿ Accesibilidad

- ✅ ARIA labels en componentes
- ✅ Contraste de colores WCAG AA
- ✅ Navegación por teclado
- ✅ Meta tags semánticos

---

## 📱 Compatibilidad

### Navegadores soportados
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Dispositivos
- ✅ Mobile (iOS/Android)
- ✅ Tablet
- ✅ Desktop
- ✅ TV (responsive)

### PWA
- ✅ Chrome/Edge (desktop)
- ✅ Chrome (Android)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ✅ Edge (Windows)

---

## 🔧 Dependencias externas

### CDN
```
├── Bootstrap 5.3.0 (CSS + JS)
├── Bootstrap Icons 1.11.0
├── i18next 23.7.6
├── i18next HTTP Backend 2.4.2
├── i18next Browser Language Detector 7.2.0
└── Google Fonts (Kaushan Script)
```

### Sin dependencias NPM
- Todo está incluido en HTML
- CDN con SRI (Subresource Integrity)
- Fallback local para offline

---

## 🧪 Testing

### Manual
- F12 Lighthouse (PWA audit)
- DevTools Network throttling
- DevTools Application (SW/Cache)

### Automated
- validate-pwa.sh (validación local)

---

## 🔄 Versionado

```
manifest.json:
└── version: 1.0.0

sw.js:
└── CACHE_NAME: 'kamiliahs-v1'

package.json:
└── (no usado, todo es vanilla)
```

---

## 📚 Referencias

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Bootstrap Docs](https://getbootstrap.com/)
- [i18next Guide](https://www.i18next.com/)
- [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

**Stack actualizado:** 22 de febrero de 2026
