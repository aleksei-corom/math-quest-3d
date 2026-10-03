#!/bin/bash

# MATH QUEST 3D - Servidor para Linux/Mac
# Steam Fair 2025 - Grado 9° N4

clear

echo ""
echo "  ╔══════════════════════════════════════════════════════╗"
echo "  ║                                                      ║"
echo "  ║     🎮  MATH QUEST 3D - CAMINO AL END  🎮           ║"
echo "  ║                                                      ║"
echo "  ║     ⛏️  Minecraft Voxel Math Adventure  ⛏️          ║"
echo "  ║                                                      ║"
echo "  ║     🏆  Steam Fair 2025 - Grado 9° N4  🏆           ║"
echo "  ║                                                      ║"
echo "  ╚══════════════════════════════════════════════════════╝"
echo ""
echo "  👥 Integrantes:"
echo "     • Gabriela Sofía Ramírez Martínez"
echo "     • David Alejandro Corpas Muñoz"
echo "     • Ángela María Crizón Herrera"
echo ""
echo "  ═══════════════════════════════════════════════════════"
echo ""

PORT=8000
URL="http://localhost:$PORT"

# Función para abrir navegador
open_browser() {
    sleep 2
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$URL"
    fi
}

# Verificar Python
if command -v python3 &> /dev/null; then
    echo "  ✅ Python3 detectado"
    echo ""
    echo "  🚀 Iniciando servidor en $URL"
    echo ""
    echo "  ⚠️  NO cierres esta ventana mientras juegas"
    echo "  ⚠️  Presiona Ctrl+C para detener"
    echo ""
    echo "  ═══════════════════════════════════════════════════════"
    echo ""
    
    # Abrir navegador en background
    open_browser &
    
    # Iniciar servidor
    python3 -m http.server $PORT
    
elif command -v python &> /dev/null; then
    echo "  ✅ Python detectado"
    echo ""
    echo "  🚀 Iniciando servidor en $URL"
    echo ""
    
    open_browser &
    python -m http.server $PORT
    
else
    echo "  ❌ Python no está instalado"
    echo ""
    echo "  📦 Instala Python desde: https://python.org"
    echo ""
    exit 1
fi

echo ""
echo "  🛑 Servidor detenido"
echo ""