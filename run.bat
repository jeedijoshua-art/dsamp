@echo off
setlocal enabledelayedexpansion

echo =================================================================
echo    FraudGraph - Financial Transaction Graph Investigation System 
echo    Windows Automated Launch Script (CMD / Batch)
echo =================================================================
echo.

if not exist "engine\bin" mkdir "engine\bin"

echo [1/4] Building C++17 Graph Algorithm Engine...
where make >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   Using make to build engine...
    cd engine
    make clean
    make all
    cd ..
) else (
    where g++ >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo   make not found. Using g++ directly to compile C++17 engine...
        g++ -std=c++17 -O2 -Wall -Wextra -Iengine\include -Iengine\src engine\src\main.cpp engine\src\graph.cpp engine\src\algorithms.cpp engine\src\rules.cpp -o engine\bin\fraudgraph_engine.exe
        g++ -std=c++17 -O2 -Wall -Wextra -Iengine\include -Iengine\src engine\tests\test_engine.cpp engine\src\graph.cpp engine\src\algorithms.cpp engine\src\rules.cpp -o engine\bin\test_engine.exe
        echo   Build successful: engine\bin\fraudgraph_engine.exe
    ) else (
        where clang++ >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo   Using clang++ directly to compile C++17 engine...
            clang++ -std=c++17 -O2 -Wall -Wextra -Iengine\include -Iengine\src engine\src\main.cpp engine\src\graph.cpp engine\src\algorithms.cpp engine\src\rules.cpp -o engine\bin\fraudgraph_engine.exe
            clang++ -std=c++17 -O2 -Wall -Wextra -Iengine\include -Iengine\src engine\tests\test_engine.cpp engine\src\graph.cpp engine\src\algorithms.cpp engine\src\rules.cpp -o engine\bin\test_engine.exe
            echo   Build successful: engine\bin\fraudgraph_engine.exe
        ) else (
            echo.
            echo [ERROR] No C++ compiler (g++, clang++, or make) was found in your PATH!
            echo To run FraudGraph on Windows, install one of the following:
            echo   1. MinGW-w64 (via MSYS2 or winlibs) and add g++ to PATH
            echo   2. Or install WSL2: wsl --install -d Ubuntu and run ./run.sh
            echo.
            pause
            exit /b 1
        )
    )
)

echo.
echo [2/4] Running C++ Automated Test Suite...
if exist "engine\bin\test_engine.exe" (
    engine\bin\test_engine.exe
) else if exist "engine\bin\test_engine" (
    engine\bin\test_engine
)

echo.
echo [3/4] Ensuring Node.js Backend ^& Frontend dependencies...
if not exist "backend\node_modules" (
    echo   Installing backend dependencies...
    cd backend && call npm install --silent && cd ..
)

if not exist "frontend\node_modules" (
    echo   Installing frontend dependencies...
    cd frontend && call npm install --silent && cd ..
)

echo.
echo [4/4] Starting FraudGraph Full-Stack Environment...
echo   Backend API:  http://localhost:5001
echo   Frontend Web: http://localhost:5173
echo.

start "FraudGraph Backend Server" cmd /k "cd backend && npm start"
start "FraudGraph Frontend Web" cmd /k "cd frontend && npm run dev"

echo FraudGraph servers launched in separate windows!
echo Open your browser to: http://localhost:5173
echo.
pause
