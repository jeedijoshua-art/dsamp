const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { ensureEngineBuilt, ENGINE_BIN } = require('./engineBridge');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    status: 'error',
    error: err.message || 'Internal server error'
  });
});

// Compile and start server
try {
  ensureEngineBuilt();
  app.listen(PORT, () => {
    console.log(`==========================================================`);
    console.log(`  FraudGraph Express Backend Server Running on Port ${PORT}`);
    console.log(`  C++ Engine Linked: ${ENGINE_BIN}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`==========================================================`);
  });
} catch (err) {
  console.error('[Fatal Error] Failed to initialize C++ engine:', err.message);
  process.exit(1);
}
