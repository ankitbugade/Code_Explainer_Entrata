// backend/utils/groqKeyManager.ts
let keys: string[] = [];
let idx = 0;

export function initKeys(envKeys: string) {
  keys = envKeys.split(',').map((k) => k.trim()).filter(Boolean);
  idx = 0;
}

export function getNextKey(): string {
  if (!keys.length) throw new Error('No GROQ API keys configured');
  const key = keys[idx];
  idx = (idx + 1) % keys.length; // round‑robin rotation
  return key;
}
