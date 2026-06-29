// backend/utils/groqClient.ts
import { Groq } from 'groq-sdk';
import { initKeys, getNextKey } from './groqKeyManager';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize key rotation once on module load
if (process.env.GROQ_API_KEYS) {
  initKeys(process.env.GROQ_API_KEYS);
}

export function createGroqClient(): Groq {
  const apiKey = getNextKey();
  return new Groq({ apiKey });
}
