#!/bin/bash

# Script para actualizar versión, hacer commit y push automáticamente
# Uso: bash update-version.sh "Título del Commit" "Descripción opcional"

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un título para el commit."
    echo "Uso: bash update-version.sh \"Título del mensaje\" \"Descripción opcional\""
    exit 1
fi

COMMIT_NAME="$1"
COMMIT_DESC="$2"



# 1. Obtener versión actual e incrementar
if [ ! -f version.json ]; then
    echo "{\"version\":\"1.0.0\",\"name\":\"Inicio\",\"description\":\"Primera versión\",\"date\":\"$(date +%Y-%m-%d)\"}" > version.json
fi

VERSION=$(grep '"version"' version.json | cut -d '"' -f 4)
BASE_VERSION=$(echo $VERSION | cut -d. -f1-2)
PATCH_VERSION=$(echo $VERSION | cut -d. -f3)
NEW_PATCH=$((PATCH_VERSION + 1))
NEW_VERSION="$BASE_VERSION.$NEW_PATCH"
DATE=$(date +%Y-%m-%d)

# 2. Actualizar version.json
cat > version.json <<EOF
{
  "version": "$NEW_VERSION",
  "name": "$COMMIT_NAME",
  "description": "$COMMIT_DESC",
  "date": "$DATE"
}
EOF

# 3. Actualizar sw.js para forzar caché
sed -i "s/const CACHE_NAME = '.*';/const CACHE_NAME = 'pos-minimalist-v$NEW_VERSION';/" sw.js

echo "✅ Archivos de versión actualizados a v$NEW_VERSION"

# 4. Git Add, Commit y Push
echo "🚀 Iniciando carga a GitHub..."
git add .
if [ -z "$COMMIT_DESC" ]; then
    git commit -m "$COMMIT_NAME"
else
    git commit -m "$COMMIT_NAME" -m "$COMMIT_DESC"
fi
git push

echo "✨ ¡Todo listo! La actualización v$NEW_VERSION ya está en camino."
