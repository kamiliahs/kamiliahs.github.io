@echo off
REM startup.bat - Script para iniciar servidor local en Windows
REM Uso: startup.bat

echo.
echo ===================================
echo   POS Minimalist - Servidor Local
echo ===================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo Error: Python no está instalado o no está en el PATH.
    echo.
    echo Descarga Python desde: https://www.python.org/downloads/
    echo Asegúrate de marcar "Add Python to PATH" durante la instalación.
    echo.
    pause
    exit /b 1
)

echo OK Python encontrado
echo.

REM Obtener puerto (por defecto 8000)
set PORT=%1
if "%PORT%"=="" set PORT=8000

echo Iniciando servidor en http://localhost:%PORT%
echo Presiona Ctrl+C para detener
echo.

REM Cambiar a directorio del script
cd /d "%~dp0"

REM Intentar con http.server (Python 3)
python -m http.server %PORT%

REM Si falla, intentar con SimpleHTTPServer (Python 2)
if errorlevel 1 (
    echo Intentando con SimpleHTTPServer...
    python -m SimpleHTTPServer %PORT%
)

pause
