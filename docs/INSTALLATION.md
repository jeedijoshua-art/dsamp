# Installation & Setup Guide — FraudGraph

This guide provides end-to-end instructions for cloning, compiling, and running **FraudGraph** locally. The instructions have been tested on macOS (Apple Silicon arm64) and verified for standard Linux distributions and Windows Subsystem for Linux (WSL2).

---

## 1. Prerequisites & Version Requirements

| Dependency | Required Version | Verified Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.0.0` | `v24.14.1` | Backend API bridge & Frontend Vite bundler |
| **npm** | `>= 9.0.0` | `11.11.0` | Package management |
| **C++ Compiler** | `C++17` capable (`clang++` or `g++`) | `Apple clang 17.0.0` / `gcc 11+` | Native Graph Engine compilation |
| **GNU Make** | `>= 3.81` | `GNU Make 3.81` | Engine build automation |
| **Git** | `>= 2.25.0` | `2.54.0` | Repository cloning and version control |

### Platform Installation Commands

#### macOS (via Homebrew & Command Line Tools)
```bash
# 1. Install Xcode Command Line Tools (provides clang++ and make)
xcode-select --install

# 2. Install Node.js (if not already installed)
brew install node
```

#### Ubuntu / Debian Linux
```bash
# Install C++17 build essentials, make, git, and Node.js
sudo apt update
sudo apt install -y build-essential clang make git nodejs npm
```

#### Windows (WSL2 Recommended)
FraudGraph relies on POSIX child-process streaming and standard Makefiles. On Windows, use **WSL2 (Ubuntu)**:
```bash
wsl --install
# Inside Ubuntu terminal, execute the Linux commands above
```

---

## 2. Cloning the Repository

```bash
git clone https://github.com/jeedijoshua-art/dsamp.git
cd dsamp
```

---

## 3. Quick Start (Automated Single-Command Launch)

The project includes an executable bash script `run.sh` that automates compilation, unit testing, dependency installation, and service startup.

```bash
chmod +x run.sh
./run.sh
```

### What `run.sh` Does Automatically:
1. Compiles the C++17 engine (`make -C engine all`).
2. Runs the 92-assertion C++ test suite (`make -C engine test`).
3. Installs backend dependencies if `backend/node_modules/` is missing.
4. Installs frontend dependencies if `frontend/node_modules/` is missing.
5. Frees lingering processes on ports `5001` and `5173`.
6. Launches the Express backend on port `5001`.
7. Launches the Vite React frontend on port `5173`.
8. Hooks `SIGINT` (`Ctrl+C`) to terminate both services cleanly.

**Browser Access:** Once running, navigate to `http://localhost:5173`.

---

## 4. Manual Component-by-Component Setup

If you prefer to run services in separate terminal windows for isolated logging and debugging, follow these steps in order:

### Step 1: Compile & Test the C++17 Engine
In terminal 1:
```bash
# Navigate to engine directory
cd engine

# Clean previous build artifacts and compile
make clean
make all

# Run unit test suite
make test
```
*Expected Output:*
```
==========================================================
   Summary: 92/92 assertions passed.
==========================================================
ALL TESTS PASSED SUCCESSFULLY!
```
*Compiled binary path:* `engine/bin/fraudgraph_engine`

### Step 2: Start the Backend API Bridge
In terminal 2:
```bash
cd backend

# Install dependencies (only required on first clone)
npm install

# Start Express server
npm start
```
*Expected Output:*
```
==========================================================
  FraudGraph Express Backend Server Running on Port 5001
  C++ Engine Linked: /.../dsamp/engine/bin/fraudgraph_engine
  Health Check: http://localhost:5001/api/health
==========================================================
```

**Verify Backend Health:**
In a separate terminal, test the health check endpoint:
```bash
curl -s http://localhost:5001/api/health
```
*Expected JSON:*
```json
{
  "status": "ok",
  "service": "FraudGraph API Bridge",
  "engine_binary_present": true,
  "engine_binary_path": ".../engine/bin/fraudgraph_engine",
  "timestamp": "..."
}
```

### Step 3: Start the Frontend Dashboard
In terminal 3:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Expected Output:*
```
  VITE v6.0.1  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser to: **`http://localhost:5173`**

---

## 5. Environment Variables & Port Configuration

The default configuration runs out of the box without creating any `.env` files. If you need custom ports, copy `.env.example`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Backend HTTP API listener port |
| `NODE_ENV` | `development` | Runtime environment mode |
| `VITE_PORT` | `5173` | Frontend dev server port |
| `VITE_API_URL`| `http://localhost:5001` | Target URL proxied by Vite for `/api/*` |

### How Frontend Communicates with Backend
The frontend Vite configuration (`frontend/vite.config.ts`) includes a reverse proxy:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true
    }
  }
}
```
All frontend calls to `/api/health`, `/api/datasets`, `/api/execute`, etc. are proxied to `http://localhost:5001` without CORS errors.

---

## 6. Verification & Automated Test Suites

To verify all components after installation:

```bash
# 1. C++ Engine Unit Tests
make -C engine test

# 2. End-to-End API and Engine Regression Suite (requires backend running)
node test_e2e.js

# 3. All 5 Datasets Catalog Test
node test_all_datasets.js

# 4. Custom Investigation Lab Regression Test
node test_custom_lab.js

# 5. Frontend Production Build Check
cd frontend && npm run build
```

---

## 7. Clean Shutdown

- If running `./run.sh`, press `Ctrl+C`. The script's trap handler will terminate backend and frontend processes.
- If running manual terminals, press `Ctrl+C` in each terminal window.
- If a port remains occupied, free it manually:
  ```bash
  lsof -ti :5001 | xargs kill -9
  lsof -ti :5173 | xargs kill -9
  ```
