// backend/src/routes/health.ts
import { Router } from 'express';

export const healthRouter = Router();

// Simple health‑check endpoint – no auth
healthRouter.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
