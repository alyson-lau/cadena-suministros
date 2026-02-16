@echo off
REM ========================================
REM Script para DETENER todos los servicios
REM ========================================
REM Mata los procesos de MongoDB y Node.js
REM ========================================

echo.
echo ========================================
echo   DETENIENDO SERVICIOS
echo ========================================
echo.

echo Deteniendo MongoDB...
taskkill /IM mongod.exe /F >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] MongoDB detenido
) else (
    echo [WARN] MongoDB no estaba corriendo
)

echo.
echo Deteniendo Node.js...
taskkill /IM node.exe /F >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detenido
) else (
    echo [WARN] Node.js no estaba corriendo
)

echo.
timeout /t 2 /nobreak
echo.
echo ========================================
echo   SERVICIOS DETENIDOS
echo ========================================
echo.
