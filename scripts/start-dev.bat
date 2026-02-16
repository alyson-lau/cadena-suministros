@echo off
REM ========================================
REM Script para iniciar el proyecto en MODO DESARROLLO
REM ========================================
REM Este script inicia MongoDB y el servidor Node.js
REM Utiliza 2 ventanas de terminal para mantenerlos activos
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   CADENA DE SUMINISTROS - MODO DESARROLLO
echo ========================================
echo.

REM Colores
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

echo [1/3] Verificando dependencias...
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %BS%[91mERROR: Node.js no está instalado o no está en PATH%BS%[0m
    pause
    exit /b 1
)
echo [OK] Node.js encontrado: 
node --version

REM Verificar si MongoDB está instalado
where mongod >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] MongoDB no está en PATH, verificando en Program Files...
    if not exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" (
        echo %BS%[91mERROR: MongoDB no está instalado%BS%[0m
        echo Descárgalo desde: https://www.mongodb.com/try/download/community
        pause
        exit /b 1
    )
)

REM Crear carpeta de datos si no existe
if not exist "C:\data\db" mkdir "C:\data\db"

echo.
echo [2/3] Instalando dependencias de npm...
call npm install
if %errorlevel% neq 0 (
    echo %BS%[91mERROR: No se pudo instalar dependencias%BS%[0m
    pause
    exit /b 1
)

echo.
echo [3/3] Iniciando servicios...
echo.

REM Iniciar MongoDB en una nueva ventana
echo Iniciando MongoDB en puerto 27017...
start "MongoDB Server 8.2" cmd /k "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath="C:\data\db" --logpath="C:\data\db\mongodb.log"

REM Esperar un poco para que MongoDB inicie
timeout /t 3 /nobreak

REM Iniciar Node.js en una nueva ventana
echo Iniciando Servidor Node.js en puerto 3000...
start "Node.js Express Server" cmd /k npm run dev

REM Esperar a que el servidor inicie
timeout /t 2 /nobreak

echo.
echo ========================================
echo   SERVICIOS INICIADOS
echo ========================================
echo.
echo   Frontend AngularJS: http://localhost:3000
echo   API REST:          http://localhost:3000/api
echo   MongoDB:           localhost:27017
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
echo (Las otras ventanas permanecerán activas)
echo ========================================
echo.

pause
