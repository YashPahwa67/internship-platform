import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis } from '../config/redis.js';

function redisStore(prefix = 'rl') {
  try {
    const redis = getRedis();
    return new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix,
    });
  } catch {
    return undefined;
  }
}

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore('rl:global:'),
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' },
    });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  store: redisStore('rl:login:'),
  keyGenerator: (req) => `login:${req.ip}:${req.body?.email || 'unknown'}`,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many failed login attempts. Try again in 15 minutes.',
      },
    });
  },
});

export const applyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  store: redisStore('rl:apply:'),
  keyGenerator: (req) => `apply:${req.user?._id || req.ip}`,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Daily application limit reached' },
    });
  },
});
