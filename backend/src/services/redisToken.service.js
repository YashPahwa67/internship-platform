import { getRedis } from '../config/redis.js';
import { config } from '../config/env.js';
import { verifyRefreshToken } from './token.service.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

const refreshKey = (userId) => `refresh:${userId}`;

export async function storeRefreshToken(userId, token) {
  try {
    const redis = getRedis();
    await redis.setex(refreshKey(userId), config.refreshTtlSeconds, token);
  } catch (err) {
    if (config.nodeEnv === 'production') throw err;
    logger.warn('Redis unavailable — refresh token not persisted', { userId, message: err.message });
  }
}

export async function getStoredRefreshToken(userId) {
  return getRedis().get(refreshKey(userId));
}

export async function revokeRefreshToken(userId) {
  try {
    await getRedis().del(refreshKey(userId));
  } catch (err) {
    if (config.nodeEnv === 'production') throw err;
    logger.warn('Redis unavailable — could not revoke refresh token', { userId, message: err.message });
  }
}

export async function validateRefreshToken(userId, token) {
  const payload = verifyRefreshToken(token);
  if (payload.sub !== userId.toString()) {
    throw new ApiError(401, 'REFRESH_INVALID', 'Token mismatch');
  }

  let stored;
  try {
    stored = await getStoredRefreshToken(userId);
  } catch (err) {
    if (config.nodeEnv === 'production') {
      throw new ApiError(401, 'REFRESH_INVALID', 'Refresh token validation failed');
    }
    logger.warn('Redis unavailable — skipping refresh token store check', { message: err.message });
    return payload;
  }

  if (!stored || stored !== token) {
    throw new ApiError(401, 'REFRESH_INVALID', 'Refresh token invalid or revoked');
  }

  return payload;
}
