import mongoose from 'mongoose';
import { config } from './index.js';

const ATLAS_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority',
};

export async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log('MongoDB Atlas connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  const isAtlas = config.mongoUri.includes('mongodb.net');
  await mongoose.connect(config.mongoUri, isAtlas ? ATLAS_OPTIONS : {});

  if (isAtlas) {
    console.log('Using MongoDB Atlas cluster');
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
