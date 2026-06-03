import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5001),
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/internship_platform'),
  JWT_ACCESS_SECRET: Joi.string().min(16).default('dev-access-secret-change-in-production-32chars'),
  JWT_REFRESH_SECRET: Joi.string().min(16).default('dev-refresh-secret-change-in-production-32chars'),
  JWT_ACCESS_EXPIRES: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES: Joi.string().default('7d'),
  CLIENT_URL: Joi.string().uri().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CLOUDINARY_API_KEY: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CLOUDINARY_API_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  CLOUDINARY_FOLDER: Joi.string().default('imp'),
  MAX_PROFILE_IMAGE_MB: Joi.number().default(2),
  MAX_RESUME_MB: Joi.number().default(5),
}).unknown(true);

const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });

if (error && process.env.NODE_ENV === 'production') {
  throw new Error(`Config validation error: ${error.message}`);
}

const resolved = env || process.env;

export const config = {
  nodeEnv: resolved.NODE_ENV || 'development',
  port: parseInt(resolved.PORT || '5001', 10),
  mongoUri: resolved.MONGODB_URI || process.env.MONGODB_URI,
  jwtAccessSecret: resolved.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: resolved.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET,
  jwtAccessExpires: resolved.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: resolved.JWT_REFRESH_EXPIRES || '7d',
  clientUrl: resolved.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: resolved.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: resolved.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
    apiSecret: resolved.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
    folder: resolved.CLOUDINARY_FOLDER || 'imp',
  },
  upload: {
    maxProfileImageBytes: (resolved.MAX_PROFILE_IMAGE_MB || 2) * 1024 * 1024,
    maxResumeBytes: (resolved.MAX_RESUME_MB || 5) * 1024 * 1024,
    allowedImageMimes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedResumeMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  isCloudinaryConfigured: Boolean(
    (resolved.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME) &&
    (resolved.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY) &&
    (resolved.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET)
  ),
};
