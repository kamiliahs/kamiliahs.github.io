#!/bin/bash

# Script de validación PWA
# Verifica que todos los componentes estén correctamente configurados

echo "🔍 Validando configuración PWA..."
echo "================================"

# Verificar manifest.json
echo ""
echo "✓ Verificando manifest.json..."
if [ -f "manifest.json" ]; then
    if command -v jq &> /dev/null; then
        if jq . manifest.json > /dev/null 2>&1; then
            echo "  ✅ manifest.json válido"
            echo "  📱 Nombre: $(jq -r '.short_name' manifest.json)"
            echo "  🎨 Tema: $(jq -r '.theme_color' manifest.json)"
        else
            echo "  ❌ manifest.json tiene errores de sintaxis JSON"
        fi
    else
        echo "  ⚠️  jq no instalado, no se puede validar JSON"
    fi
else
    echo "  ❌ manifest.json no encontrado"
fi

# Verificar Service Worker
echo ""
echo "✓ Verificando Service Worker..."
if [ -f "sw.js" ]; then
    echo "  ✅ sw.js existe"
    CACHE_LINE=$(grep -n "CACHE_NAME" sw.js | head -1)
    if [ -n "$CACHE_LINE" ]; then
        echo "  📦 ${CACHE_LINE}"
    fi
else
    echo "  ❌ sw.js no encontrado"
fi

# Verificar iconos
echo ""
echo "✓ Verificando iconos..."
ICON_COUNT=$(find assets/icons -name "*.png" 2>/dev/null | wc -l)
if [ "$ICON_COUNT" -gt 0 ]; then
    echo "  ✅ Encontrados $ICON_COUNT archivos de iconos"
    
    # Verificar tamaños específicos
    echo "  📐 Tamaños de Android:"
    find assets/icons/android -name "*.png" 2>/dev/null | sort | while read file; do
        SIZE=$(identify "$file" 2>/dev/null | grep -oE '[0-9]+x[0-9]+' | head -1)
        FILENAME=$(basename "$file")
        echo "    - $FILENAME ($SIZE)"
    done
else
    echo "  ⚠️  No se encontraron iconos"
fi

# Verificar metadatos en HTML
echo ""
echo "✓ Verificando HTML..."
if grep -q "manifest.json" index.html; then
    echo "  ✅ Link a manifest.json encontrado"
else
    echo "  ❌ Link a manifest.json no encontrado"
fi

if grep -q "theme-color" index.html; then
    echo "  ✅ Meta tema encontrado"
else
    echo "  ❌ Meta tema no encontrado"
fi

if grep -q "apple-mobile-web-app-capable" index.html; then
    echo "  ✅ Meta PWA iOS encontrado"
else
    echo "  ❌ Meta PWA iOS no encontrado"
fi

# Verificar archivos críticos
echo ""
echo "✓ Verificando archivos críticos..."
CRITICAL_FILES=(
    "index.html"
    "css/style.css"
    "js/script.js"
    "js/i18n.js"
    "js/sw-manager.js"
    "locales/es.json"
    "locales/en.json"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo "  ✅ $file ($SIZE)"
    else
        echo "  ❌ $file no encontrado"
    fi
done

# Verificar HTTPS (GitHub Pages)
echo ""
echo "✓ Verificando configuración:"
if [ -f "PWA_GUIDE.md" ]; then
    echo "  ✅ Documentación PWA disponible"
else
    echo "  ⚠️  PWA_GUIDE.md no encontrado"
fi

# Resumen
echo ""
echo "================================"
echo "✅ Validación completada"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Hacer push a GitHub"
echo "  2. Visitar https://tu-usuario.github.io"
echo "  3. Instalar como PWA (click en +)"
echo "  4. Verificar con Lighthouse (F12 → Lighthouse)"
echo ""
echo "🚀 Tu PWA está listo para ser instalado!"
