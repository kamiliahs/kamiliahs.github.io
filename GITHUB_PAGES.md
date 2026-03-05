# 🚀 GitHub Pages - Guía de Publicación

## Requisitos Previos

- Cuenta de GitHub
- Git instalado en tu computadora (opcional)
- El código del proyecto

## Opción 1: Publicar con Git (Recomendado)

### Paso 1: Inicializar repositorio Git (primera vez)

```bash
cd kamiliahs.github.io
git init
git add .
git commit -m "Proyecto inicial: POS Minimalist PWA"
```

### Paso 2: Conectar con GitHub

```bash
git remote add origin https://github.com/yourusername/kamiliahs.github.io.git
git branch -M main
git push -u origin main
```

### Paso 3: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Haz clic en "Settings" (Configuración)
3. En el menú izquierdo, busca "Pages"
4. Bajo "Source", selecciona:
   - Rama: `main`
   - Carpeta: `/ (root)`
5. Haz clic en "Save"

### Paso 4: Esperar publicación

- GitHub Pages tomará unos minutos en publicar
- Verás un mensaje azul cuando esté listo
- Tu sitio estará en: `https://yourusername.github.io`

## Opción 2: Publicar sin Git (Upload directo)

### En GitHub Web

1. **Crear repositorio**
   - Ve a https://github.com/new
   - Nombre: `yourusername.github.io`
   - Descripción: "POS Minimalist - PWA"
   - Público ✓
   - Crear

2. **Subir archivos**
   - En tu repositorio, haz clic en "Add file" → "Upload files"
   - Arrastra y suelta los archivos/carpetas del proyecto
   - Escribe un mensaje de commit
   - Haz clic en "Commit changes"

3. **Activar Pages**
   - Settings → Pages
   - Source: main
   - Save

## Después de Publicar

### Verificar que funciona

- Abre `https://yourusername.github.io` en tu navegador
- Verifica que todos los archivos se carguen correctamente
- Prueba instalar la app en un dispositivo

### Configuración de Dominio Personalizado (Opcional)

1. Settings → Pages → Custom domain
2. Ingresa tu dominio (ej: `pos.miempresa.com`)
3. Configura DNS en tu proveedor de dominios:
   ```
   Tipo A:
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

## Actualizaciones Futuras

### Hacer cambios locales

```bash
# Editar archivos...

git add .
git commit -m "Descripción del cambio"
git push origin main
```

### Sincronizar cambios automáticos

GitHub Pages se actualiza automáticamente cuando haces push.

## Troubleshooting

### "La página no carga"

1. **Verifica el nombre del repositorio**
   - Debe ser: `yourusername.github.io`
   - Sensible a mayúsculas

2. **Verifica Settings → Pages**
   - Source debe ser `main`
   - La rama debe existir

3. **Limpia caché**
   - Intenta en navegador incógnito
   - Espera 5 minutos después de push

### "Los archivos CSS/JS no cargan"

1. Verifica rutas relativas en HTML
2. Asegúrate de usar: `./` en lugar de `/`
3. Verifica que la estructura de carpetas sea correcta

### "PWA no funciona"

1. Verifica que `manifest.json` se cargue correctamente
2. Verifica que `sw.js` esté en la raíz o en `public/`
3. Abre consola (F12) para ver errores

### "Service Worker no se registra"

1. Verifica que el sitio sea HTTPS (GitHub Pages lo es por defecto)
2. Verifica la ruta en `index.html`: `./public/sw.js`
3. Revisa la consola para mensajes de error

## Optimizaciones para GitHub Pages

### Habilitar compresión

GitHub Pages comprime automáticamente. ✓

### Optimizar imágenes

Si agregas imágenes, comprimirlas con:
- TinyPNG (https://tinypng.com)
- ImageOptim
- Squoosh (https://squoosh.app)

### Cache busting

Si cambias archivos y no se actualizan:
- Limpiar caché del navegador (Ctrl+Shift+Del)
- Esperar 5 minutos
- Service Worker cachea archivos - versiona en sw.js

## Monitoreo

### Verificar que el sitio es rápido

1. Usa PageSpeed Insights: https://pagespeed.web.dev
2. Ingresa tu URL
3. Verifica score de rendimiento

### Analytics (Opcional)

Puedes agregar Google Analytics:

```html
<!-- Agregar en <head> de index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## Colaboración

Si otros desarrolladores quieren trabajar:

1. **Dame acceso** como colaborador (Settings → Collaborators)
2. **Clonan el repo**:
   ```bash
   git clone https://github.com/yourusername/kamiliahs.github.io.git
   cd kamiliahs.github.io
   ```
3. **Crean rama**:
   ```bash
   git checkout -b feature/nueva-funcion
   ```
4. **Hacen cambios** y hacen push
5. **Crean Pull Request** para revisar

## Backup y Versioning

### Hacer backup local

```bash
git clone https://github.com/yourusername/kamiliahs.github.io.git backup
```

### Ver historial

```bash
git log --oneline
git diff HEAD~1 HEAD
```

### Revertir cambios

```bash
git revert HEAD
git push origin main
```

## Tips Finales

✅ **Buenas prácticas:**
- Hacer commits pequeños y descriptivos
- Testear localmente antes de push
- Mantener README actualizado
- Documentar cambios importantes

⚠️ **Cuidado con:**
- Archivos secretos (no subas `.env` o credenciales)
- Archivos grandes (limita a 100 MB)
- Cambios directos en main sin testing

🔒 **Seguridad:**
- GitHub Pages es HTTPS por defecto
- No almacena datos de usuarios en servidor
- Los datos de la app están en el navegador del usuario

## Recursos Útiles

- [Documentación oficial de GitHub Pages](https://docs.github.com/en/pages)
- [Guía de PWA](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**¿Necesitas ayuda?** Revisa los logs de GitHub Actions en Settings → Actions para ver detalles de build.

**Última actualización:** Marzo 2026
