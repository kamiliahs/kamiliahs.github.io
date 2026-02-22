# Generación de Iconos PWA

Para que el PWA funcione correctamente, necesitas iconos en múltiples tamaños. Esta guía te ayuda a generarlos.

## 📐 Tamaños necesarios

```
- icon-72x72.png        (tablets pequeños)
- icon-96x96.png        (tablets)
- icon-128x128.png      (escritorio)
- icon-144x144.png      (tablets)
- icon-152x152.png      (tablets iPad)
- icon-192x192.png      (Android home screen)
- icon-384x384.png      (splash screen Android)
- icon-512x512.png      (splash screen, store)
- icon-maskable-192x192.png  (adaptive icon Android)
- icon-maskable-512x512.png  (adaptive icon Android)
```

## 🎨 Herramientas recomendadas

### Opción 1: Generador Online (Recomendado)
https://www.pwabuilder.com/imageGgoogle driveenerator

1. Sube tu logo/imagen (al menos 512x512px)
2. Descarga el archivo ZIP
3. Extrae los iconos en `/assets/icons/`

### Opción 2: CLI con `pwa-asset-generator`

```bash
npm install -g @ducanh2912/pwa-asset-generator
pwa-asset-generator logo.png assets/icons/
```

### Opción 3: ImageMagick

```bash
# Instalar ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Linux

# Generar iconos
convert logo.png -resize 72x72 assets/icons/icon-72x72.png
convert logo.png -resize 96x96 assets/icons/icon-96x96.png
# ... repetir para cada tamaño
```

### Opción 4: Gimp o Photoshop

1. Abre tu logo en Gimp/Photoshop
2. Exporta con cada tamaño especificado
3. Guarda en `/assets/icons/`

## 📸 Screenshots (Opcional)

Si quieres que tu PWA tenga screenshots en la tienda:

- `screenshot-1.png`: 540x720px (narrow/mobile)
- `screenshot-2.png`: 1280x720px (wide/desktop)

## ✅ Verificación

Una vez que hayas agregado los iconos, verifica que:

```bash
ls -la assets/icons/
# Deberías ver todos los .png listados
```

## 🧪 Prueba tu PWA

1. **Chrome DevTools**
   - F12 → Application → Manifest
   - Verifica que se cargen todos los iconos

2. **Lighthouse**
   - F12 → Lighthouse
   - Ejecuta "Progressive Web App"
   - Deberías tener 100/100

3. **Instalar**
   - En Chrome: Click en el icono "+" en la barra de direcciones
   - En otros navegadores: Menu → Instalar aplicación

## 📝 Notas importantes

- Los iconos deben estar en formato PNG
- Asegúrate de que tengan fondo transparente para iconos "maskable"
- Mantén la calidad: usa vectores cuando sea posible
- Los iconos deben ser legibles en tamaños pequeños

## 🔗 Resources

- [MDN - Web App Manifests](https://developer.mozilla.org/es/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
- [Google PWA Docs](https://developers.google.com/web/progressive-web-apps)
- [Web.dev - Installable](https://web.dev/install-criteria/)
