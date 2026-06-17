import { getRedis, isRedisAvailable } from '../config/redis.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

// Holds registrations that have NOT yet been email-verified. Nothing is written
// to MongoDB until the OTP is confirmed, so abandoned/unverified sign-ups never
// pollute the users collection. Entries auto-expire with the OTP (10 min).
const PENDING_TTL_SECONDS = 10 * 60;
const key = (email) => `pending_reg:${email.toLowerCase().trim()}`;

// In-memory fallback for local dev when Redis isn't running. Not used in
// production (Redis is required there), so a single instance is fine.
const memoryStore = new Map();

function useMemory() {
  return config.nodeEnv !== 'production' && !isRedisAvailable();
}

export async function savePendingRegistration(email, data) {
  const payload = JSON.stringify(data);
  if (useMemory()) {
    memoryStore.set(key(email), payload);
    setTimeout(() => memoryStore.delete(key(email)), PENDING_TTL_SECONDS * 1000).unref?.();
    logger.warn('Redis unavailable — pending registration held in memory', { email });
    return;
  }
  await getRedis().setex(key(email), PENDING_TTL_SECONDS, payload);
}

export async function getPendingRegistration(email) {
  const raw = useMemory() ? memoryStore.get(key(email)) : await getRedis().get(key(email));
  return raw ? JSON.parse(raw) : null;
}

export async function deletePendingRegistration(email) {
  if (useMemory()) {
    memoryStore.delete(key(email));
    return;
  }
  await getRedis().del(key(email));
}
