@echo off
cd /d %~dp0
echo ============================================
echo   Cadena de Suministros - Iniciar Proyecto
echo ============================================
echo.
echo Abriendo proyecto en el navegador...
start "" "%~dp0index.html"
echo.
echo Proyecto abierto correctamente!
echo Presiona cualquier tecla para salir...
pause >nul
