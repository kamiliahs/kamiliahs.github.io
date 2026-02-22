# 🎉 Kamiliahs - PWA Instalable

Proyecto web completo como Progressive Web App (PWA) con soporte para instalación como aplicación nativa en cualquier dispositivo.

## ⚡ Características principales

✨ **PWA Completo**
- Instalable como aplicación nativa
- Funciona completamente offline
- Sincronización en background
- Notificaciones push listas

🌐 **Multiidioma (i18n)**
- Soporte para Español e Inglés
- Traductor integrado i18next
- Cambio de idioma instantáneo

🌙 **Tema Claro/Oscuro**
- Detección automática del sistema
- Cambio manual de tema
- Persistencia en localStorage
- Transiciones suaves

📱 **Responsive**
- Mobile-first design
- Adaptado para cualquier pantalla
- Bootstrap 5 integrado
- Icons de Bootstrap incluidos

🎨 **Diseño moderno**
- Navbar con offcanvas
- Fuente Kausan Script personalizada
- Animaciones y transiciones
- Interfaz limpia y profesional

## 🚀 Instalación

### En navegadores de escritorio (Chrome/Edge)
1. Abre https://tu-usuario.github.io
2. Click en el botón "+" en la barra de direcciones
3. Selecciona "Instalar"

### En Android
1. Abre https://tu-usuario.github.io en Chrome
2. Toca Menu → "Instalar aplicación"
3. Confirma la instalación

### En iOS (Safari)
1. Abre https://tu-usuario.github.io en Safari
2. Toca Compartir → "Agregar a pantalla de inicio"
3. Elige el nombre y confirma

### En Windows
1. Abre https://tu-usuario.github.io en Edge
2. Click en "..." → Aplicaciones → "Instalar esta aplicación"
3. Sigue los pasos

## 📁 Estructura del Proyecto

```
kamiliahs.github.io/
├── index.html                   # Página principal
├── manifest.json                # Configuración PWA
├── sw.js                        # Service Worker
├── README.md                    # Este archivo
├── PWA_GUIDE.md                 # Guía completa PWA
├── ICONOS_INTEGRADOS.md         # Info sobre iconos
├── validate-pwa.sh              # Script de validación
│
├── css/
│   └── style.css                # Estilos con variables de tema
│
├── js/
│   ├── script.js                # JavaScript principal
│   ├── i18n.js                  # Configuración i18next
│   ├── sw-manager.js            # Gestor de Service Worker
│   └── pwa-devtools.js          # Herramientas de desarrollo
│
├── locales/
│   ├── es.json                  # Traducciones español
│   └── en.json                  # Traducciones inglés
│
└── assets/
    ├── icons/
    │   ├── android/             # Iconos Android
    │   ├── ios/                 # Iconos iOS
    │   ├── windows11/           # Iconos Windows
    │   └── icons.json           # Referencia de iconos
    └── README.md                # Guía de recursos
```

## 🚀 Inicio Rápido

### Localmente

1. **Clonar o descargar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/kamiliahs.github.io.git
   cd kamiliahs.github.io
   ```

2. **Servir localmente** (opcional)
   - Usar una extensión como [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) en VS Code
   - O con Python: `python -m http.server 8000`
   - O con Node: `npx http-server`

3. **Acceder en el navegador**
   - `http://localhost:8000` (o el puerto que uses)

### En GitHub Pages

Tu sitio estará disponible en: `https://tu-usuario.github.io`

## 🎨 Personalización

### Cambiar nombre de la aplicación
Edita `manifest.json`:
```json
{
  "name": "Mi App",
  "short_name": "App"
}
```

### Cambiar colores de tema
Edita variables CSS en [css/style.css](css/style.css):
```css
:root {
    --color-primary: #007bff;
    --color-secondary: #6c757d;
    /* ... más variables */
}
```

### Agregar nuevos idiomas
1. Crea archivo en `/locales/nuevo-idioma.json`
2. Copia estructura de `es.json`
3. Actualiza `js/i18n.js` con el nuevo idioma

### Cambiar contenido
Cualquier modificación de texto debe:
1. Actualizar en ambos archivos: `/locales/es.json` y `/locales/en.json`
2. Usar atributo `data-i18n="clave"` en HTML
3. Usar `i18next.t('clave')` en JavaScript

## 🔧 Comandos útiles

### Validar PWA
```bash
bash validate-pwa.sh
```

### Servir localmente
```bash
# Con Python 3
python -m http.server 8000

# Con Node
npx http-server

# Con Live Server (VS Code)
# Extensión: ritwickdey.LiveServer
```

### Verificar con Lighthouse (Chrome)
1. F12 → Lighthouse
2. Selecciona "Progressive Web App"
3. Click en "Analyze"
4. Deberías obtener: ✅ 100/100

## 📊 Verificación de PWA

### Estado del Service Worker
En la consola del navegador:
```javascript
PWADevTools.showDevPanel()           // Mostrar ayuda
PWADevTools.generateReport()         // Reporte completo
PWADevTools.getSWInfo()              // Info del SW
PWADevTools.getConnectionInfo()      // Estado de conexión
```

### Probar offline
1. F12 → Application → Service Workers
2. Marca "Offline"
3. Recarga la página
4. ¡Debe funcionar sin conexión!

## 🌍 Multiidioma (i18n)

### Cambiar idioma
Los botones de idioma están en la navbar:
- **ES** - Español
- **EN** - English

El idioma se guarda automáticamente en localStorage.

### Estructura de traducciones
```json
{
  "navbar": { "brand": "..." },
  "hero": { "title": "...", "subtitle": "..." },
  "about": { "title": "...", "description": "..." }
}
```

## 🌙 Tema claro/oscuro

### Cambiar tema
Los botones en la navbar permiten:
- ☀️ **Claro** - Modo light
- 💻 **Sistema** - Detecta preferencia del OS
- 🌙 **Oscuro** - Modo dark

El tema se guarda en localStorage y se aplica automáticamente.

### Detectar cambios del sistema
Escucha cambios en `prefers-color-scheme`:
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## 🚀 Stack tecnológico

- **HTML5** - Estructura semántica con PWA metadata
- **CSS3** - Variables dinámicas, tema claro/oscuro
- **JavaScript Vanilla** - i18n, Service Worker, PWA
- **i18next** - Sistema de internacionalización
- **Bootstrap 5** - Framework responsivo
- **Bootstrap Icons** - Iconos profesionales
- **Google Fonts** - Fuente Kausan Script
- **GitHub Pages** - Hosting gratuito HTTPS

## 📚 Documentación adicional

| Archivo | Descripción |
|---------|-------------|
| [PWA_GUIDE.md](PWA_GUIDE.md) | Guía completa de PWA |
| [ICONOS_INTEGRADOS.md](ICONOS_INTEGRADOS.md) | Estado de integración de iconos |
| [assets/ICONS_GUIDE.md](assets/ICONS_GUIDE.md) | Cómo generar iconos |

## ✅ Características completadas

- [x] PWA totalmente funcional e instalable
- [x] Funcionalidad offline con Service Worker
- [x] Tema claro/oscuro con detección automática
- [x] Sistema multiidioma (español/inglés)
- [x] Navbar offcanvas responsivo
- [x] Iconos en múltiples plataformas
- [x] Cacheo inteligente de recursos
- [x] Actualización automática del SW
- [x] Sincronización en background listo
- [x] Atajos de navegación rápida
- [x] Meta tags de instalación
- [x] Validación automática de PWA

## 🚀 Próximos pasos

1. **Hacer push a GitHub**
   ```bash
   git add .
   git commit -m "PWA con iconos integrados"
   git push origin main
   ```

2. **Verificar en tu dominio**
   - Abre `https://tu-usuario.github.io`
   - Deberías ver el botón de instalar (+)

3. **Instalar como app**
   - Click en (+) y "Instalar"
   - O en mobile: Menu → "Instalar aplicación"

4. **Verificar con Lighthouse**
   - F12 → Lighthouse → Progressive Web App
   - Deberías obtener ✅ 100/100

## 📞 Soporte

Para más información:
- [PWA_GUIDE.md](PWA_GUIDE.md) - Guía completa de PWA
- [Documentación PWA de Google](https://developers.google.com/web/progressive-web-apps)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

✨ **Tu PWA está completamente configurado y listo para usar!** ✨

Última actualización: 22 de febrero de 2026
