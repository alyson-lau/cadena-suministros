# ========================================
# Script PowerShell para gestionar proyecto
# Uso: .\scripts\start-dev.ps1 -Action (start|stop|status|logs)
# ========================================

param(
    [ValidateSet('start', 'stop', 'status', 'logs')]
    [string]$Action = 'start'
)

# Variables
$mongodbBin = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
$dataPath = "C:\data\db"
$logPath = "$dataPath\mongodb.log"
$projectRoot = Split-Path -Parent $PSScriptRoot

# Colores
$colors = @{
    Green  = 'Green'
    Red    = 'Red'
    Yellow = 'Yellow'
    Cyan   = 'Cyan'
    Blue   = 'Blue'
}

function Write-Header {
    param([string]$Text, [string]$Color = 'Cyan')
    Write-Host "========================================" -ForegroundColor $Color
    Write-Host "  $Text" -ForegroundColor $Color
    Write-Host "========================================" -ForegroundColor $Color
}

function Start-Services {
    Write-Header "INICIANDO SERVICIOS" Green
    
    # Verificar y crear carpeta de datos
    if (-not (Test-Path $dataPath)) {
        Write-Host "Creando carpeta de datos: $dataPath" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
    }
    
    # Iniciar MongoDB
    Write-Host "Iniciando MongoDB..." -ForegroundColor Green
    if (Get-Process mongod -ErrorAction SilentlyContinue) {
        Write-Host "  ⚠ MongoDB ya está en ejecución" -ForegroundColor Yellow
    } else {
        & $mongodbBin --dbpath=$dataPath --logpath=$logPath | Out-Null &
        Start-Sleep -Seconds 3
        Write-Host "  ✓ MongoDB iniciado en puerto 27017" -ForegroundColor Green
    }
    
    # Instalar dependencias
    Write-Host "Instalando dependencias npm..." -ForegroundColor Green
    Push-Location $projectRoot
    npm install
    Pop-Location
    
    # Iniciar Node.js
    Write-Host "Iniciando servidor Node.js..." -ForegroundColor Green
    Push-Location $projectRoot
    npm run dev
    Pop-Location
}

function Stop-Services {
    Write-Header "DETENIENDO SERVICIOS" Red
    
    Write-Host "Deteniendo MongoDB..." -ForegroundColor Red
    Stop-Process -Name mongod -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ MongoDB detenido" -ForegroundColor Green
    
    Write-Host "Deteniendo Node.js..." -ForegroundColor Red
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Node.js detenido" -ForegroundColor Green
    
    Start-Sleep -Seconds 1
    Write-Host "Servicios detenidos correctamente" -ForegroundColor Green
}

function Get-Status {
    Write-Header "ESTADO DE SERVICIOS" Blue
    
    $mongoStatus = if (Get-Process mongod -ErrorAction SilentlyContinue) { "✓ ACTIVO" } else { "✗ DETENIDO" }
    $nodeStatus = if (Get-Process node -ErrorAction SilentlyContinue) { "✓ ACTIVO" } else { "✗ DETENIDO" }
    
    Write-Host "MongoDB:     $mongoStatus" -ForegroundColor $(if ($mongoStatus.Contains("ACTIVO")) { "Green" } else { "Red" })
    Write-Host "Node.js:     $nodeStatus" -ForegroundColor $(if ($nodeStatus.Contains("ACTIVO")) { "Green" } else { "Red" })
    
    Write-Host ""
    Write-Host "PUERTOS:" -ForegroundColor Cyan
    Write-Host "  MongoDB:  27017" -ForegroundColor Cyan
    Write-Host "  Node.js:  3000" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "ACCESO:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  API:      http://localhost:3000/api" -ForegroundColor Cyan
}

function Show-Logs {
    Write-Header "LOGS DE MONGODB" Blue
    
    if (Test-Path $logPath) {
        Get-Content $logPath -Tail 50
    } else {
        Write-Host "No hay logs disponibles" -ForegroundColor Yellow
    }
}

# Ejecutar acción
switch ($Action) {
    'start' { Start-Services }
    'stop' { Stop-Services }
    'status' { Get-Status }
    'logs' { Show-Logs }
    default { Write-Host "Acción no reconocida: $Action" -ForegroundColor Red }
}
