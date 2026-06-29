// src/routes/snippets.ts
import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';

export const snippetsRouter = Router();

// Protect all snippet routes
snippetsRouter.use(authMiddleware);

// Get all snippets
snippetsRouter.get('/', async (req, res) => {
  try {
    const snippets = await db('snippets').select('*');
    res.json(snippets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific snippet by ID
snippetsRouter.get('/:id', async (req, res) => {
  try {
    const snippet = await db('snippets').where('id', req.params.id).first();
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(snippet);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a snippet by ID
snippetsRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await db('snippets').where('id', req.params.id).del();
    if (!deleted) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
