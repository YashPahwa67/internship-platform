import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5001),
  MONGODB_URI: z.string().min(1),
  REDIS_URL: z.string().optional(),
  UPSTASH_REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default('imp'),
  MAX_PROFILE_IMAGE_MB: z.coerce.number().default(2),
  MAX_RESUME_MB: z.coerce.number().default(5),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  BACKEND_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  redisUrl: env.REDIS_URL || env.UPSTASH_REDIS_URL || 'redis://127.0.0.1:6379',
  jwtAccessSecret: env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: env.JWT_REFRESH_SECRET,
  jwtAccessExpires: env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: env.JWT_REFRESH_EXPIRES,
  clientUrl: env.CLIENT_URL,
  allowedOrigins: (env.ALLOWED_ORIGINS || env.CLIENT_URL).split(',').map((s) => s.trim()),
  logLevel: env.LOG_LEVEL,
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    folder: env.CLOUDINARY_FOLDER,
  },
  upload: {
    maxProfileImageBytes: env.MAX_PROFILE_IMAGE_MB * 1024 * 1024,
    maxResumeBytes: env.MAX_RESUME_MB * 1024 * 1024,
    allowedImageMimes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedResumeMimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },
  resend: {
    // HTTP email API — required on hosts like Render that block outbound SMTP.
    apiKey: env.RESEND_API_KEY,
    // Until a domain is verified in Resend, use their shared sender.
    from: env.RESEND_FROM || env.EMAIL_FROM || 'Internship Platform <onboarding@resend.dev>',
  },
  isCloudinaryConfigured: Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
  ),
  refreshTtlSeconds: 7 * 24 * 60 * 60,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
  backendUrl: env.BACKEND_URL || `http://localhost:${env.PORT || 5001}`,
};
