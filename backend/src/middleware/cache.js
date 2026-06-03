import { catchAsync } from '../utils/catchAsync.js';
import { getRedis } from '../config/redis.js';

/**
 * Cache-aside middleware. Only caches GET JSON responses.
 * @param {number} ttl seconds
 * @param {(req) => string | null} keyFn custom key; null = skip cache
 */
export const cache =
  (ttl = 300, keyFn = null) =>
  catchAsync(async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = keyFn ? keyFn(req) : `cache:${req.originalUrl}`;
    if (!key) return next();

    try {
      const hit = await getRedis().get(key);
      if (hit) {
        res.set('X-Cache', 'HIT');
        return res.json(JSON.parse(hit));
      }
    } catch {
      return next();
    }

    res.set('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) {
        getRedis()
          .setex(key, ttl, JSON.stringify(body))
          .catch(() => {});
      }
      return originalJson(body);
    };
    next();
  });

export async function invalidateKeys(pattern) {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    /* redis optional degradation */
  }
}

export async function invalidateInternshipListCache() {
  await invalidateKeys('cache:GET:/api/v1/internships*');
}

export async function invalidateInternshipCache(id) {
  await getRedis().del(`internship:${id}`).catch(() => {});
  await invalidateInternshipListCache();
}
