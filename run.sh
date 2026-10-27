#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "================================================================="
echo "   FraudGraph - Financial Transaction Graph Investigation System "
echo "   Academic Data Structures and Algorithms Micro Project         "
echo "================================================================="
echo ""

echo "[1/4] Building C++17 Graph Algorithm Engine..."
make -C engine clean
make -C engine all

echo ""
echo "[2/4] Running C++ Automated Test Suite..."
make -C engine test

echo ""
echo "[3/4] Ensuring Node.js Backend & Frontend dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo "  Installing backend dependencies..."
    (cd backend && npm install --silent)
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    (cd frontend && npm install --silent)
fi

echo ""
echo "[4/4] Starting FraudGraph Full-Stack Environment..."
echo "  Backend API:  http://localhost:5001"
echo "  Frontend Web: http://localhost:5173"
echo ""

# Trap SIGINT and SIGTERM to kill background processes
cleanup() {
    echo ""
    echo "Stopping FraudGraph servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Clean up any lingering processes on default ports
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

(cd backend && node src/server.js) &
BACKEND_PID=$!

(cd frontend && npm run dev -- --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

echo "FraudGraph MVP is LIVE!"
echo "Open your browser to: http://localhost:5173"
echo "Press Ctrl+C to terminate."

wait
