# ⚡ INICIO RÁPIDO

## En 3 minutos...

### Opción 1: GitHub Pages (Recomendado)

```bash
# 1. Crear repositorio en GitHub
# Nombre: yourusername.github.io

# 2. Hacer push
git add .
git commit -m "Initial commit: POS Minimalist PWA"
git push -u origin main

# 3. Activar Pages en Settings → Pages → Save

# ✅ Listo en: https://yourusername.github.io
```

### Opción 2: Servidor Local

**Windows:**
```bash
# Doble clic en startup.bat
REM O manualmente:
python -m http.server 8000
```

**Mac/Linux:**
```bash
# Ejecutar script
./startup.sh

# O manualmente:
python3 -m http.server 8000
```

Luego abre: `http://localhost:8000`

### Opción 3: Instalar en Teléfono

1. Abre URL en Chrome (Android) o Safari (iPhone)
2. Toca botón instalar/compartir
3. ✅ Tienes app en tu pantalla de inicio

## 📁 Estructura Rápida

```
📦 Proyecto
├── 📄 index.html         ← Abre esto en navegador
├── src/
│   ├── css/main.css      ← Estilos
│   └── js/
│       ├── app.js        ← Lógica principal
│       └── modules/      ← Módulos separados
├── public/
│   ├── manifest.json     ← Config PWA
│   └── sw.js             ← Offline
└── 📖 README.md          ← Documentación
```

## 🎯 Funciones Principales

| Función | Atajo |
|---------|-------|
| **Ventas** | Click nav "Ventas" |
| **Inventario** | Click nav "Stock" |
| **Reportes** | Click nav "Stats" |
| **Menú** | Click nav "Menu" |

## 💾 Los datos están aquí:

- Insumos: localStorage `min_pos_ing`
- Productos: localStorage `min_pos_prod`
- Ventas: localStorage `min_pos_sales`

## ❓ ¿Problema?

Ver documentación:
- **¿Cómo instalo?** → [INSTALACION.md](INSTALACION.md)
- **¿Cómo publico?** → [GITHUB_PAGES.md](GITHUB_PAGES.md)
- **¿Cómo modifico?** → [EJEMPLOS.md](EJEMPLOS.md)
- **¿Cómo funciona?** → [ESTRUCTURA.md](ESTRUCTURA.md)

## ✨ Tips

- Los datos se guardan automáticamente
- Funciona sin internet después de primera carga
- Abre F12 para ver consola si hay errores
- Los datos son locales a cada navegador

## 🚀 ¿Siguiente paso?

1. ✅ Prueba la app
2. ✅ Personaliza datos iniciales (si quieres)
3. ✅ Publica en GitHub Pages
4. ✅ Comparte el link
5. ✅ ¡Úsala!

---

**¿Listo?** ¡Abre `index.html` en tu navegador y comienza! 🎉
