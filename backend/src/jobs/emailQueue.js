import Bull from 'bull';
import { config } from '../config/env.js';
import { isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

let emailQueue = null;

export function getEmailQueue() {
  if (!isRedisAvailable()) {
    throw new Error('Redis is not connected — cannot use email queue');
  }
  if (!emailQueue) {
    emailQueue = new Bull('email', config.redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });

    emailQueue.on('failed', (job, err) => {
      logger.error('Email job failed', { jobId: job?.id, type: job?.name, message: err.message });
    });
  }
  return emailQueue;
}

export async function enqueueEmail(type, data) {
  try {
    const queue = getEmailQueue();
    return await queue.add(type, data);
  } catch (err) {
    logger.warn('Could not enqueue email', { type, message: err.message });
    return null;
  }
}

export async function closeEmailQueue() {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
  }
}
