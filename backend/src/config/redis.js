import Redis from 'ioredis';
import { config } from './env.js';
import logger from '../utils/logger.js';

let redis = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('error', (err) => logger.error('Redis error', { message: err.message }));
    redis.on('connect', () => logger.info('Redis connected'));
  }
  return redis;
}

export async function connectRedis() {
  const client = getRedis();
  if (client.status === 'ready') return client;
  await client.connect();
  return client;
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export async function pingRedis() {
  try {
    const client = getRedis();
    if (client.status === 'wait' || client.status === 'end') {
      await client.connect();
    }
    const pong = await client.ping();
    return pong === 'PONG' ? 'healthy' : 'unhealthy';
  } catch {
    return 'unhealthy';
  }
}
