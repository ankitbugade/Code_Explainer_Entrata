// backend/src/routes/health.js
const { Router } = require('express');

const healthRouter = Router();

// Simple health‑check endpoint – no auth
healthRouter.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = { healthRouter };
