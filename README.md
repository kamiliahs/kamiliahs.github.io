# 📱 FÁCIL - Aplicación Web Progresiva (PWA / SPA) para Android

**FÁCIL** es una aplicación web progresiva de página única (SPA) diseñada especialmente para **personas neófitas en tecnología y adultos mayores**.

Cuenta con un sistema de instalación in-app desde el navegador Android/Desktop, diseño minimalista, botones gigantes, contraste optimizado y funcionamiento 100% offline.

---

## 🚀 Cómo desplegar en GitHub Pages-

Esta aplicación ha sido diseñada con **rutas 100% relativas (`./`)** para funcionar en cualquier repositorio o subdirectorio de GitHub Pages (ejemplo: `https://tu-usuario.github.io/tu-repositorio/`).

### Pasos para publicar en GitHub:

1. **Crear un nuevo repositorio en GitHub**:
   - Ve a [GitHub](https://github.com/new) y crea un repositorio público (ej. `pwa-facil`).

2. **Subir los archivos del proyecto**:
   - Sube todos los archivos de esta carpeta a la rama principal (`main` o `master`):
     - `index.html`
     - `styles.css`
     - `app.js`
     - `sw.js`
     - `manifest.json`
     - `icon.svg`
     - `.nojekyll`

3. **Activar GitHub Pages**:
   - Ve a **Settings (Configuración)** de tu repositorio en GitHub.
   - En el menú lateral izquierdo, haz clic en **Pages**.
   - En **Build and deployment -> Source**, selecciona `Deploy from a branch`.
   - En **Branch**, selecciona `main` (o `master`) y la carpeta `/ (root)`.
   - Haz clic en **Save (Guardar)**.

¡En 1-2 minutos tu PWA estará disponible en tu URL de GitHub Pages con certificado SSL (HTTPS) requerido para PWAs!

---

## 🌟 Características Principales

- **Botón de Instalación In-App**: Captura el evento `beforeinstallprompt` y muestra un botón gigante *"INSTALAR AHORA"* sin necesidad de buscar en menús.
- **Service Worker Offline**: Funciona completamente sin conexión a Internet gracias a `sw.js`.
- **4 Secciones Minimalistas**:
  1. 📞 **Contactos Rápido**: Llamada con 1 toque a familiares y emergencias (112).
  2. 💊 **Mis Recordatorios**: Medicinas y tareas diarias con checkboxes gigantes.
  3. 📝 **Nota de la Compra**: Lista rápida con botones de adición de 1 toque (Leche, Pan, etc.).
  4. 💡 **Útiles**: Luz blanca de pantalla, lectura por voz (Web Speech API) y alarma sonora de emergencia SOS.
- **Accesibilidad Neófitos**: Opción de letra Extra Grande con un toque (`Aa`), voz pausada en español y retroalimentación táctil/visual.
