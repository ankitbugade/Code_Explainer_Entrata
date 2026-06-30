// src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { explainRouter } from './routes/explain';
import { snippetsRouter } from './routes/snippets';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

import { healthRouter } from './routes/health';
app.use('/api/health', healthRouter);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
