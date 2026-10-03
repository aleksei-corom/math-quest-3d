@echo off
chcp 65001 >nul
title 🛑 Detener MATH QUEST 3D
color 0C

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║     🛑  DETENER SERVIDOR MATH QUEST 3D  🛑          ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Buscando procesos del servidor...
echo.

REM Matar procesos de Python en puerto 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo  Deteniendo proceso PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Matar procesos de PowerShell
taskkill /F /IM powershell.exe /FI "WINDOWTITLE eq *MATH QUEST*" >nul 2>&1

echo.
echo  ✅ Servidor detenido
echo.
echo  ═══════════════════════════════════════════════════════
echo.
pause