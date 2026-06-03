import Redis from 'ioredis';
import { config } from './env.js';
import logger from '../utils/logger.js';

let redis = null;
let redisAvailable = false;

export function isRedisAvailable() {
  return redisAvailable;
}

export function getRedis() {
  if (!redisAvailable || !redis) {
    throw new Error('Redis is not connected');
  }
  return redis;
}

export async function connectRedis() {
  if (redisAvailable && redis) return redis;

  const client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 5000,
    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 300, 1000);
    },
  });

  try {
    await client.connect();
    client.on('error', (err) => {
      logger.error('Redis runtime error', { message: err.message });
    });
    redis = client;
    redisAvailable = true;
    logger.info('Redis connected', { url: config.redisUrl.replace(/:[^:@]+@/, ':***@') });
    return redis;
  } catch (err) {
    client.disconnect();
    throw err;
  }
}

export async function disconnectRedis() {
  if (redis) {
    try {
      await redis.quit();
    } catch {
      /* already closed */
    }
    redis = null;
    redisAvailable = false;
    logger.info('Redis disconnected');
  }
}

export async function pingRedis() {
  if (!redisAvailable || !redis) return 'unhealthy';
  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'healthy' : 'unhealthy';
  } catch {
    return 'unhealthy';
  }
}
