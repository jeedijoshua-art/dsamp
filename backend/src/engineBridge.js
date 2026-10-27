const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const ENGINE_DIR = path.resolve(__dirname, '../../engine');
const isWindows = process.platform === 'win32';

function getEngineBinaryPath() {
  const exePath = path.resolve(ENGINE_DIR, 'bin/fraudgraph_engine.exe');
  const binPath = path.resolve(ENGINE_DIR, 'bin/fraudgraph_engine');

  if (isWindows) {
    if (fs.existsSync(exePath)) return exePath;
    if (fs.existsSync(binPath)) return binPath;
    return exePath;
  } else {
    if (fs.existsSync(binPath)) return binPath;
    if (fs.existsSync(exePath)) return exePath;
    return binPath;
  }
}

let ENGINE_BIN = getEngineBinaryPath();

function ensureEngineBuilt() {
  ENGINE_BIN = getEngineBinaryPath();
  if (!fs.existsSync(ENGINE_BIN)) {
    console.log('[FraudGraph Bridge] C++ binary not found. Compiling engine...');
    const binDir = path.resolve(ENGINE_DIR, 'bin');
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    try {
      execSync('make all', { cwd: ENGINE_DIR, stdio: 'inherit' });
    } catch (err) {
      console.log('[FraudGraph Bridge] make command failed or not found. Attempting direct C++ compiler fallback...');
      const targetOut = isWindows ? 'bin/fraudgraph_engine.exe' : 'bin/fraudgraph_engine';
      const cmd = `g++ -std=c++17 -O2 -Wall -Wextra -Iinclude -Isrc src/main.cpp src/graph.cpp src/algorithms.cpp src/rules.cpp -o ${targetOut}`;
      try {
        execSync(cmd, { cwd: ENGINE_DIR, stdio: 'inherit' });
      } catch (fallbackErr) {
        throw new Error(`Failed to compile C++ engine via make and g++ fallback: ${fallbackErr.message}`);
      }
    }
    ENGINE_BIN = getEngineBinaryPath();
  }
}

/**
 * Safely executes the compiled C++ graph engine by passing input JSON via stdin
 * and receiving structured JSON via stdout. Shell interpolation is strictly avoided.
 * 
 * @param {Object} payload Input JSON object containing accounts, transactions, action, params
 * @returns {Promise<Object>} Output JSON object returned by the C++ engine
 */
function runEngine(payload) {
  return new Promise((resolve, reject) => {
    try {
      ensureEngineBuilt();
    } catch (err) {
      return reject(err);
    }

    const child = spawn(ENGINE_BIN, [], {
      cwd: ENGINE_DIR,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdoutData = '';
    let stderrData = '';

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('C++ graph engine execution timed out (limit: 8000ms)'));
    }, 8000);

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString('utf8');
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString('utf8');
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn C++ engine process: ${err.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0 && !stdoutData.trim()) {
        return reject(new Error(`C++ engine exited with code ${code}. Stderr: ${stderrData.trim()}`));
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse C++ engine JSON output: ${parseErr.message}\nRaw Output: ${stdoutData.substring(0, 500)}`));
      }
    });

    // Write input JSON to engine's stdin
    try {
      const inputStr = JSON.stringify(payload);
      child.stdin.write(inputStr);
      child.stdin.end();
    } catch (writeErr) {
      clearTimeout(timer);
      reject(new Error(`Failed to stream JSON payload to C++ engine stdin: ${writeErr.message}`));
    }
  });
}

module.exports = {
  runEngine,
  ensureEngineBuilt,
  get ENGINE_BIN() {
    return getEngineBinaryPath();
  },
  getEngineBinaryPath
};
