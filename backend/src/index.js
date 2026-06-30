// src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { explainRouter } = require('./routes/explain');
const { snippetsRouter } = require('./routes/snippets');
const { authRouter } = require('./routes/auth');
const { healthRouter } = require('./routes/health');

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
// NOTE: original TS code imported these routers but never mounted them.
// Fixed: mount auth, explain, and snippets routers so the API actually works.
app.use('/api/auth', authRouter);
app.use('/api/explain', explainRouter);
app.use('/api/snippets', snippetsRouter);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
