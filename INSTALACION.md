# 📱 Guía de Instalación - POS Minimalist

## Opción 1: Desde el Navegador (Recomendado)

### Android 🤖

1. **Abrir la aplicación**
   - Abre Chrome/Firefox en tu teléfono Android
   - Ve a `https://yourusername.github.io`

2. **Instalar como app**
   - Toca el botón de menú (⋮) en la esquina superior derecha
   - Selecciona "Instalar aplicación" o "Agregar a pantalla de inicio"
   - Confirma la instalación

3. **Usar la aplicación**
   - Aparecerá un ícono en tu pantalla de inicio
   - Toca el ícono para abrir la aplicación
   - Funciona como una app nativa

### iPhone/iPad 🍎

1. **Abrir la aplicación**
   - Abre Safari en tu iPhone/iPad
   - Ve a `https://yourusername.github.io`

2. **Instalar como app**
   - Toca el botón de Compartir (el cuadro con flecha)
   - Desplázate hacia abajo y selecciona "Agregar a pantalla de inicio"
   - Dale un nombre a la app (opcional)
   - Toca "Agregar"

3. **Usar la aplicación**
   - La app aparecerá en tu pantalla de inicio
   - Se abrirá en pantalla completa como una app nativa
   - Ten acceso offline cuando estés sin conexión

### Windows/Mac 💻

1. **En Chrome/Edge**
   - Abre la página en Chrome o Edge
   - Verás un botón de instalación en la barra de direcciones (⬇️ + Instalar)
   - Haz clic en el botón
   - Confirma la instalación

2. **En Firefox**
   - Por ahora, abre como página normal en Firefox
   - O instala una extensión PWA

3. **Después de instalar**
   - La app aparecerá en tu menú de aplicaciones
   - Puedes hacer un acceso directo en el escritorio
   - Funciona como cualquier otra app

## Opción 2: En Desarrollo Local

Si quieres modificar el código:

### Requisitos
- Git (opcional, puedes descargar ZIP)
- Un editor de código (VS Code, Sublime Text, etc.)
- Un navegador moderno

### Pasos

1. **Clonar o descargar el repositorio**
   ```bash
   git clone https://github.com/yourusername/kamiliahs.github.io.git
   cd kamiliahs.github.io
   ```

2. **Servir localmente**
   
   Con Python 3:
   ```bash
   python -m http.server 8000
   ```
   
   Con Python 2:
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   Con Node.js (si tienes http-server):
   ```bash
   npx http-server
   ```

3. **Abrir en navegador**
   - Ve a `http://localhost:8000` en tu navegador

4. **Hacer cambios**
   - Edita los archivos en tu editor favorito
   - El navegador se actualizará automáticamente (en algunos casos)
   - Recarga la página si ves cambios sin aplicar

## Funciones Sin Conexión 🌐➜🚫

Una vez instalada, la aplicación funciona sin conexión a internet:

- ✅ Ver productos guardados
- ✅ Crear nuevos pedidos
- ✅ Ver historial de ventas
- ✅ Calcular márgenes
- ✅ Acceder a todos los datos guardados

Los datos se sincronizarán automáticamente cuando vuelvas a tener conexión.

## Solución de Problemas

### "No puedo instalar la app"
- Asegúrate de que el navegador sea moderno (Chrome v90+, Safari v14+, etc.)
- Prueba en incógnito/privado si tienes problemas
- Limpia el caché del navegador

### "Perdí mis datos"
- Los datos están en `localStorage` del navegador
- Si limpias datos del navegador, se borran los datos de la app
- Usa la función de exportar datos antes de limpiar caché

### "La app no funciona offline"
- Abre la app una vez con conexión para que se descargue todo
- Service Worker debe estar registrado
- Verifica la consola (F12) para errores

### "Quiero sincronizar entre dispositivos"
- Actualmente, los datos son locales a cada dispositivo
- Puedes exportar/importar datos como JSON manualmente
- En futuras versiones se podría agregar sincronización en cloud

## Compartir la App

Una vez publicada en GitHub Pages:

### Crear un código QR
- Usa un generador de QR con la URL: `https://yourusername.github.io`
- Escanea con cualquier teléfono para instalar rápidamente

### Compartir enlace directo
- Copia el URL de la página
- Comparte en WhatsApp, email, etc.
- Cualquiera puede instalar desde el enlace

### Documentación para usuarios
- Proporciona esta guía a tus usuarios
- Explica que funciona sin conexión
- Muestra cómo exportar datos de respaldo

## Requisitos Mínimos del Sistema

| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| **Android** | 6.0 | 11.0+ |
| **iOS** | 11.0 | 14.0+ |
| **Windows** | Windows 7 | Windows 10+ |
| **macOS** | 10.12 | 11.0+ |
| **Navegador** | Chrome 90 | Chrome 120+ |
| **RAM** | 100 MB | 500 MB |
| **Almacenamiento** | 50 MB | 500 MB |

## Consejos de Seguridad

- ⚠️ Los datos se guardan en el navegador (no en un servidor)
- ✅ No se envía información personal a terceros
- ✅ La app no requiere permisos especiales
- 💡 Haz copias de seguridad exportando tus datos regularmente

## Actualizaciones

- La app se actualiza automáticamente cuando cierres y vuelvas a abrir
- Las nuevas características estarán disponibles en la siguiente sesión
- Tus datos nunca se pierden con las actualizaciones

---

¿Problemas? Contacta al administrador o revisa el repositorio en GitHub.
