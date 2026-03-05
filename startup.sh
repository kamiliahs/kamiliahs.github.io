#!/bin/bash
# startup.sh - Script para iniciar servidor local
# Uso: ./startup.sh

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}  POS Minimalist - Servidor Local${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python 3 no encontrado. Intentando con Python 2..."
    if ! command -v python &> /dev/null; then
        echo "❌ Python no está instalado. Instálalo e intenta de nuevo."
        exit 1
    fi
    PYTHON="python"
else
    PYTHON="python3"
fi

echo "✅ Python encontrado: $PYTHON"
echo ""

# Obtener el puerto
PORT=${1:-8000}

echo "🚀 Iniciando servidor en http://localhost:$PORT"
echo "📱 Presiona Ctrl+C para detener"
echo ""

# Cambiar a directorio del proyecto
cd "$(dirname "$0")"

# Iniciar servidor
$PYTHON -m http.server $PORT --directory .

# Si http.server no funciona, intentar con SimpleHTTPServer
if [ $? -ne 0 ]; then
    echo "Intentando con SimpleHTTPServer..."
    $PYTHON -m SimpleHTTPServer $PORT
fi
