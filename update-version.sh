#!/bin/bash

# Script para sincronizar version.json y sw.js con Git
# Uso: bash update-version.sh

if [ ! -f version.json ]; then
    echo "{\"version\":\"1.0.0\",\"name\":\"Inicio\",\"description\":\"Primera versión\",\"date\":\"$(date +%Y-%m-%d)\"}" > version.json
fi

# 1. Obtener versión actual e incrementar
VERSION=$(grep '"version"' version.json | cut -d '"' -f 4)
BASE_VERSION=$(echo $VERSION | cut -d. -f1-2)
PATCH_VERSION=$(echo $VERSION | cut -d. -f3)
NEW_PATCH=$((PATCH_VERSION + 1))
NEW_VERSION="$BASE_VERSION.$NEW_PATCH"

# 2. Obtener info del último commit
COMMIT_NAME=$(git log -1 --pretty=%s | sed 's/"/\\"/g')
COMMIT_DESC=$(git log -1 --pretty=%b | tr '\n' ' ' | sed 's/"/\\"/g')

# Si la descripción está vacía, poner un genérico
if [ -z "$COMMIT_DESC" ] || [ "$COMMIT_DESC" == " " ]; then
    COMMIT_DESC="Mejoras de rendimiento y optimización de código."
fi

# 3. Escribir el nuevo version.json
DATE=$(date +%Y-%m-%d)

cat > version.json <<EOF
{
  "version": "$NEW_VERSION",
  "name": "$COMMIT_NAME",
  "description": "$COMMIT_DESC",
  "date": "$DATE"
}
EOF

# 4. Actualizar el Service Worker para forzar la actualización en el navegador
# Buscamos la línea const CACHE_NAME = '...'; y la reemplazamos
sed -i "s/const CACHE_NAME = '.*';/const CACHE_NAME = 'pos-minimalist-v$NEW_VERSION';/" sw.js

echo "✅ version.json actualizado: v$NEW_VERSION"
echo "🔄 Service Worker (sw.js) actualizado para forzar caché v$NEW_VERSION"
echo "📝 Título: $COMMIT_NAME"
