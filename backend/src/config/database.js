import mongoose from 'mongoose';
import { config } from './env.js';
import logger from '../utils/logger.js';

const ATLAS_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { message: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const isAtlas = config.mongoUri.includes('mongodb.net');
      await mongoose.connect(config.mongoUri, isAtlas ? ATLAS_OPTIONS : {});
      logger.info(isAtlas ? 'MongoDB Atlas connected' : 'MongoDB connected');
      return;
    } catch (err) {
      attempt += 1;
      logger.warn(`MongoDB connect attempt ${attempt}/${MAX_RETRIES} failed`, { message: err.message });
      if (attempt >= MAX_RETRIES) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}

export function getDbHealth() {
  return mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
}
