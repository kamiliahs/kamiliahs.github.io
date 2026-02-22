# 📱 Guía PWA (Progressive Web App)

Tu proyecto ahora está configurado como una PWA completamente funcional. Esta guía te explica todas las características y cómo usarlas.

## 🎯 ¿Qué es una PWA?

Una Progressive Web App es una aplicación web que funciona como una aplicación nativa:
- ✅ Funciona offline
- ✅ Se instala como app en el dispositivo
- ✅ Tiene icono en la pantalla de inicio
- ✅ Funciona sin conexión a internet
- ✅ Notificaciones push
- ✅ Sincronización en segundo plano

## 📦 Archivos PWA principales

- **manifest.json** - Metadatos de la aplicación
- **sw.js** - Service Worker (cacheo, offline)
- **js/sw-manager.js** - Gestor del Service Worker
- **/assets/icons/** - Iconos en múltiples tamaños

## 🚀 Instalación

### En Chrome/Edge (Desktop)
1. Abre el sitio
2. Click en el icono "+" en la barra de direcciones
3. Click en "Instalar"

### En Chrome/Android (Mobile)
1. Abre el sitio
2. Menu → "Instalar aplicación"
3. O toca el banner de instalación

### En Safari (iOS)
1. Abre el sitio
2. Compartir → "Agregar a pantalla de inicio"

### En Firefox
1. Menu → Crear acceso directo
2. "Crear acceso directo" en escritorio

## ⚙️ Características implementadas

### 1. **Service Worker**
- Cachea recursos automáticamente
- Funciona completamente offline
- Estrategia inteligente de caché (Cache-First para estáticos, Network-First para dinámicos)
- Sincronización en segundo plano

### 2. **Manifest**
- Define nombre, descripción, iconos
- Configura pantalla de inicio personalizada
- Atajos de navegación rápida
- Tema y colores personalizados

### 3. **Actualización automática**
- Detecta versiones nuevas
- Notifica al usuario
- Permite actualizar sin recargar
- Se auto-actualiza cada hora

### 4. **Soporte offline**
- Contenido cacheado disponible sin internet
- Símbolos dinámicos descargados en caché
- CSS y JavaScript offline

## 🔧 Configuración personalizada

### Cambiar nombre de la app
Edita `manifest.json`:
```json
{
  "name": "Nuevo nombre",
  "short_name": "Nombre corto"
}
```

### Cambiar color de tema
```json
{
  "theme_color": "#007bff",
  "background_color": "#ffffff"
}
```

### Agregar atajos rápidos
Edita los `shortcuts` en `manifest.json` para agregar más enlaces rápidos.

### Cambiar icono de la app
1. Genera iconos con la guía en `assets/ICONS_GUIDE.md`
2. Coloca los archivos en `/assets/icons/`
3. Los tamaños se referencian automáticamente en `manifest.json`

## 📊 Verificación del PWA

### Con Lighthouse (Google Chrome)
```
F12 → Lighthouse → Progressive Web App → Analyze
```

Deberías obtener: **✅ 100/100**

Requisitos clave:
- ✅ HTTPS (GitHub Pages lo proporciona)
- ✅ Manifest.json válido
- ✅ Service Worker registrado
- ✅ Iconos en múltiples tamaños
- ✅ Responsive design
- ✅ Sin errores de consola

### Aplicación instalada

Una vez instalada, podrás:
1. Ejecutar como app independiente
2. Acceso a pantalla de inicio
3. Funciona offline completamente
4. Icono en dock/taskbar
5. Atajos rápidos disponibles

## 🔄 Manejo de actualizaciones

### Cómo funciona
1. El navegador verifica actualizaciones cada hora
2. Si hay versión nueva, notifica al usuario
3. Usuario elige "Actualizar" o "Después"
4. Si actualiza, recarga la página con nueva versión
5. Cache antiguo se elimina automáticamente

### Versiones del cache
Actualmente usamos: `CACHE_NAME = 'kamiliahs-v1'`

Para actualizar la app:
```javascript
// En sw.js, cambia v1 a v2
const CACHE_NAME = 'kamiliahs-v2';
```

## 🌐 Sobre conexión offline

El Service Worker implementa:

**Cache-First:**
- CSS, JS, imágenes
- Se sirven desde cache
- Se actualizan en background

**Network-First:**
- HTML, JSON
- Intenta conexión primero
- Fallback a cache

**Offline:**
- Si nada coincide, muestra página offline

## 📱 Responsive Design

El PWA se adapta a:
- 📱 Celulares (360px+)
- 📱 Tablets (600px+)
- 🖥️ Escritorio (1200px+)
- 🔄 Orientación horizontal

## 🐛 Debugging

### Ver estado del Service Worker
En consola:
```javascript
console.log(swManager.getStatus());
// {registered: true, active: true, installing: false, waiting: false}
```

### Ver cache almacenado
```javascript
caches.keys().then(names => console.log(names));
```

### Limpiar cache
```javascript
caches.delete('kamiliahs-v1');
```

### Desinstalar SW (desarrollo)
```javascript
swManager.unregister();
```

## 🔐 Consideraciones de seguridad

- ✅ HTTPS requerido (GitHub Pages proporciona)
- ✅ Service Worker solo en HTTPS o localhost
- ✅ Manifest requiere HTTPS
- ✅ Sin datos sensibles en cache

## 📈 Monitoreo

Cosas a monitorear:
- Tamaño del cache (máx ~50MB en algunos navegadores)
- Versión de SW activo
- Errores de sincronización
- Actualizaciones disponibles

## 🚨 Problemas comunes

### "No se instala"
- ✅ Verifica HTTPS
- ✅ Iconos debe existir
- ✅ Manifest.json válido
- ✅ Service Worker registrado

### "No funciona offline"
- ✅ Service Worker debe estar activo
- ✅ Recursos deben estar en cache
- ✅ Verifica consola para errores

### "Cambios no aparecen"
- ✅ Limpia cache: DevTools → Application → Clear storage
- ✅ Desinstala y reinstala app
- ✅ Borra cache: `caches.delete('kamiliahs-v1')`

## 🔗 Recursos útiles

- [PWA Builder](https://www.pwabuilder.com/)
- [Google Developers - PWA](https://developers.google.com/web/progressive-web-apps)
- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN - Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Web.dev - Installable](https://web.dev/install-criteria/)

## ✨ Siguientes pasos

1. 📸 Genera los iconos (ver `assets/ICONS_GUIDE.md`)
2. 🧪 Instala localmente y prueba funcionalidad offline
3. 📊 Verifica con Lighthouse
4. 📢 Comparte tu PWA instalable
5. 📈 Monitorea uso y feedback

---

¡Tu PWA está lista para ser instalada como una aplicación! 🎉
