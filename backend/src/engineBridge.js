const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const ENGINE_DIR = path.resolve(__dirname, '../../engine');
const ENGINE_BIN = path.resolve(ENGINE_DIR, 'bin/fraudgraph_engine');

function ensureEngineBuilt() {
  if (!fs.existsSync(ENGINE_BIN)) {
    console.log('[FraudGraph Bridge] C++ binary not found. Compiling via make...');
    try {
      execSync('make all', { cwd: ENGINE_DIR, stdio: 'inherit' });
    } catch (err) {
      throw new Error(`Failed to compile C++ engine: ${err.message}`);
    }
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
  ENGINE_BIN
};
