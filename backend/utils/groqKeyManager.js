// backend/utils/groqKeyManager.js
let keys = [];
let idx = 0;

function initKeys(envKeys) {
  keys = envKeys.split(',').map((k) => k.trim()).filter(Boolean);
  idx = 0;
}

function getNextKey() {
  if (!keys.length) throw new Error('No GROQ API keys configured');
  const key = keys[idx];
  idx = (idx + 1) % keys.length; // round‑robin rotation
  return key;
}

module.exports = { initKeys, getNextKey };
