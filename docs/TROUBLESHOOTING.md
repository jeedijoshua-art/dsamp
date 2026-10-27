# Troubleshooting Guide — FraudGraph

This guide documents common operational issues, error messages, and verified remedies when developing, building, or demonstrating **FraudGraph**.

---

## 1. Port Conflicts (`EADDRINUSE`)

### Symptom
When starting the backend or running `./run.sh`, the terminal logs:
```
Error: listen EADDRINUSE: address already in use :::5001
```
or the frontend reports Vite port collision:
```
Port 5173 is in use, trying another one...
```

### Root Cause
A previous instance of Node.js or Vite was not cleanly terminated and is still bound to port `5001` or `5173`.

### Resolution
Identify and terminate the lingering process:

#### On macOS / Linux:
```bash
# Free port 5001 (Backend)
lsof -ti :5001 | xargs kill -9

# Free port 5173 (Frontend)
lsof -ti :5173 | xargs kill -9
```

#### On Windows (PowerShell):
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

Alternatively, configure alternative ports in `.env`:
```bash
PORT=5002
VITE_PORT=5174
```

---

## 2. C++ Compiler or Make Issues

### Symptom A: `clang++` or `make` Command Not Found
```
make: clang++: Command not found
```

### Resolution
- **macOS:** Install Xcode command line tools:
  ```bash
  xcode-select --install
  ```
- **Ubuntu/Debian:** Install `build-essential`:
  ```bash
  sudo apt update && sudo apt install -y build-essential clang make
  ```

### Symptom B: C++ Standard Error
```
error: unknown standard 'c++17'
```
Your compiler is outdated. Upgrade your C++ compiler to Clang 12+ or GCC 9+:
```bash
clang++ --version
g++ --version
```

---

## 3. C++ Engine Binary Missing in Backend

### Symptom
The UI displays a red indicator **"Engine Offline"**, or the backend health check returns:
```json
{
  "status": "ok",
  "engine_binary_present": false
}
```

### Root Cause
The native engine binary `engine/bin/fraudgraph_engine` has not been compiled yet.

### Resolution
Navigate to `engine/` and build the binary:
```bash
cd engine
make clean
make all
```
Verify the binary exists:
```bash
ls -l bin/fraudgraph_engine
```
The backend `engineBridge.js` will now automatically discover the binary.

---

## 4. Frontend "Failed to Fetch" or Network Errors

### Symptom
Clicking "Find Shortest Route" or "Run Cycle Detection" yields:
```
Failed to fetch or Engine execution failed
```

### Root Cause
The Vite development server is unable to proxy requests to `http://localhost:5001` because the backend server is not running.

### Resolution
1. Verify whether the backend process is active:
   ```bash
   curl -s http://localhost:5001/api/health
   ```
2. If `curl` fails to connect, start the backend server in a separate terminal:
   ```bash
   cd backend
   npm start
   ```

---

## 5. Node.js Version Incompatibility

### Symptom
Errors mentioning unsupported syntax or missing core modules:
```
SyntaxError: Unexpected token '?'
```

### Root Cause
FraudGraph requires Node.js v18 or later for modern ECMAScript features and stream interfaces.

### Resolution
Check your current Node.js version:
```bash
node -v
```
If it is below `v18.0.0`, update using [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm):
```bash
nvm install 20
nvm use 20
```

---

## 6. Permissions Denied on `run.sh`

### Symptom
```
bash: ./run.sh: Permission denied
```

### Resolution
Add executable permissions to the bash script:
```bash
chmod +x run.sh
./run.sh
```
