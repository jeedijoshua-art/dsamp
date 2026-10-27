# FraudGraph - Financial Transaction Graph Investigation System
# Windows PowerShell Automated Launch Script

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   FraudGraph - Financial Transaction Graph Investigation System " -ForegroundColor Cyan
Write-Host "   Windows Automated Launch Script (PowerShell)                   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

if (-not (Test-Path "engine/bin")) {
    New-Item -ItemType Directory -Force -Path "engine/bin" | Out-Null
}

Write-Host "[1/4] Building C++17 Graph Algorithm Engine..." -ForegroundColor Yellow
$hasMake = Get-Command make -ErrorAction SilentlyContinue
$hasGpp = Get-Command g++ -ErrorAction SilentlyContinue
$hasClang = Get-Command clang++ -ErrorAction SilentlyContinue

if ($hasMake) {
    Write-Host "  Using make to build engine..."
    Set-Location engine
    make clean
    make all
    Set-Location ..
} elseif ($hasGpp) {
    Write-Host "  make not found. Using g++ directly to compile C++17 engine..."
    g++ -std=c++17 -O2 -Wall -Wextra -Iengine/include -Iengine/src engine/src/main.cpp engine/src/graph.cpp engine/src/algorithms.cpp engine/src/rules.cpp -o engine/bin/fraudgraph_engine.exe
    g++ -std=c++17 -O2 -Wall -Wextra -Iengine/include -Iengine/src engine/tests/test_engine.cpp engine/src/graph.cpp engine/src/algorithms.cpp engine/src/rules.cpp -o engine/bin/test_engine.exe
    Write-Host "  Build successful: engine/bin/fraudgraph_engine.exe"
} elseif ($hasClang) {
    Write-Host "  Using clang++ directly to compile C++17 engine..."
    clang++ -std=c++17 -O2 -Wall -Wextra -Iengine/include -Iengine/src engine/src/main.cpp engine/src/graph.cpp engine/src/algorithms.cpp engine/src/rules.cpp -o engine/bin/fraudgraph_engine.exe
    clang++ -std=c++17 -O2 -Wall -Wextra -Iengine/include -Iengine/src engine/tests/test_engine.cpp engine/src/graph.cpp engine/src/algorithms.cpp engine/src/rules.cpp -o engine/bin/test_engine.exe
    Write-Host "  Build successful: engine/bin/fraudgraph_engine.exe"
} else {
    Write-Host ""
    Write-Host "[ERROR] No C++ compiler (g++, clang++, or make) was found in your PATH!" -ForegroundColor Red
    Write-Host "To run FraudGraph on Windows, install one of the following:" -ForegroundColor Red
    Write-Host "  1. MinGW-w64 (via MSYS2, winget, or w64devkit) and add g++ to PATH" -ForegroundColor Yellow
    Write-Host "  2. Or install WSL2: wsl --install -d Ubuntu and run ./run.sh" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

Write-Host ""
Write-Host "[2/4] Running C++ Automated Test Suite..." -ForegroundColor Yellow
if (Test-Path "engine/bin/test_engine.exe") {
    & "engine/bin/test_engine.exe"
} elseif (Test-Path "engine/bin/test_engine") {
    & "engine/bin/test_engine"
}

Write-Host ""
Write-Host "[3/4] Ensuring Node.js Backend & Frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "  Installing backend dependencies..."
    Set-Location backend; npm install --silent; Set-Location ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "  Installing frontend dependencies..."
    Set-Location frontend; npm install --silent; Set-Location ..
}

Write-Host ""
Write-Host "[4/4] Starting FraudGraph Full-Stack Environment..." -ForegroundColor Green
Write-Host "  Backend API:  http://localhost:5001" -ForegroundColor Gray
Write-Host "  Frontend Web: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "FraudGraph servers launched in separate windows!" -ForegroundColor Green
Write-Host "Open your browser to: http://localhost:5173" -ForegroundColor Cyan
