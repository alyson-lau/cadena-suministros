@echo off
echo ============================================
echo   Cadena de Suministros - Servidor Local
echo ============================================
echo.
echo Cambiando al directorio del proyecto...
cd /d "%~dp0"
echo.
echo Instalando dependencias (si no existen)...
npm install
echo.
echo Iniciando servidor...
echo.
echo   Frontend: http://localhost:3000/app
echo   API:      http://localhost:3000/api
echo.
echo Presiona Ctrl+C para detener.
echo.
npm start
pause
