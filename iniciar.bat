@echo off
chcp 65001 >nul
title MATH QUEST 3D - Servidor
color 0A

echo.
echo =======================================================
echo     MATH QUEST 3D - CAMINO AL END
echo     Minecraft Voxel Math Adventure
echo     Steam Fair 2025 - Grado 9 N4
echo =======================================================
echo.

REM Verificar si Python esta instalado
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Python detectado
    echo.
    echo Iniciando servidor en http://localhost:8000
    echo.
    echo ATENCION: NO cierres esta ventana mientras juegas.
    echo El navegador se abrira automaticamente.
    echo.
    echo =======================================================
    echo.
    
    REM Abrir navegador despues de 2 segundos
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"
    
    REM Iniciar servidor Python
    python -m http.server 8000
    
) else (
    echo [X] Python no esta instalado
    echo.
    echo Intentando con PowerShell - Servidor Portable...
    echo.
    
    REM Intentar con PowerShell
    powershell -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"
)

echo.
echo =======================================================
echo Servidor detenido
echo =======================================================
pause