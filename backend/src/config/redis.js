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

function isLocalRedis(url) {
  return !url || url.includes('127.0.0.1') || url.includes('localhost');
}

function redisHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

export async function connectRedis() {
  if (redisAvailable && redis) return redis;

  const url = config.redisUrl;

  if (config.nodeEnv === 'production' && isLocalRedis(url)) {
    throw new Error(
      'REDIS_URL is not set on Render. Go to imp-api → Environment → add REDIS_URL with your Upstash URL (rediss://default:...@....upstash.io:6379).'
    );
  }

  // Upstash requires TLS (rediss://) and these ioredis options
  const client = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    connectTimeout: 20000,
    ...(url.startsWith('rediss://') ? { tls: {} } : {}),
    retryStrategy(times) {
      if (times > 10) return null;
      return Math.min(times * 200, 2000);
    },
  });

  try {
    await client.connect();
    const pong = await client.ping();
    if (pong !== 'PONG') {
      throw new Error(`Unexpected ping response: ${pong}`);
    }

    client.on('error', (err) => {
      logger.error('Redis runtime error', { message: err.message });
    });

    redis = client;
    redisAvailable = true;
    logger.info('Redis connected', { host: redisHost(url) });
    return redis;
  } catch (err) {
    try {
      client.disconnect();
    } catch {
      /* already closed */
    }
    throw new Error(
      `Redis connection failed (${redisHost(url)}): ${err.message}. ` +
        'Use the Upstash TCP URL starting with rediss:// as REDIS_URL on Render.'
    );
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
