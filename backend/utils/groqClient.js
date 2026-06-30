// backend/utils/groqClient.js
const { Groq } = require('groq-sdk');
const { initKeys, getNextKey } = require('./groqKeyManager');
const dotenv = require('dotenv');

dotenv.config();

// Initialize key rotation once on module load
if (process.env.GROQ_API_KEYS) {
  initKeys(process.env.GROQ_API_KEYS);
}

function createGroqClient() {
  const apiKey = getNextKey();
  return new Groq({ apiKey });
}

module.exports = { createGroqClient };
