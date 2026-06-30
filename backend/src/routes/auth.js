// backend/src/routes/auth.js
const { Router } = require('express');
const { randomUUID } = require('crypto');
const { hashPassword, comparePassword, generateJwt } = require('../utils/auth');
const { db } = require('../db');

const authRouter = Router();

// Register a new user
authRouter.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    // Check if username exists
    const existing = await db('users').where('username', username).first();
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    const password_hash = await hashPassword(password);
    const id = randomUUID();
    await db('users').insert({ id, username, password_hash });
    const token = generateJwt({ userId: id });
    // HttpOnly cookie
    res
      .cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({ message: 'User registered', userId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login existing user
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    const user = await db('users').where('username', username).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateJwt({ userId: user.id });
    res
      .cookie('auth_token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: 'Logged in', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout endpoint
authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth_token').json({ message: 'Logged out' });
});

module.exports = { authRouter };
