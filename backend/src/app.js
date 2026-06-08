import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { config } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { correlationId } from './middleware/correlationId.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { pingRedis } from './config/redis.js';
import { getDbHealth } from './config/database.js';
import logger from './utils/logger.js';
import './config/passport.js';

export function createApp() {
  const app = express();

  app.use(correlationId);

  app.use(
    helmet({
      contentSecurityPolicy:
        config.nodeEnv === 'production'
          ? { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] } }
          : false,
      hsts: config.nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );

  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp({ whitelist: ['skills', 'sort', 'type', 'status'] }));
  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));
  app.use(compression());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.use(
    morgan((tokens, req, res) =>
      JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: Number(tokens.status(req, res)),
        responseTime: tokens['response-time'](req, res),
        correlationId: req.correlationId,
        userId: req.user?._id?.toString(),
      })
    )
  );

  app.get('/health', async (_req, res) => {
    const db = getDbHealth();
    const redis = await pingRedis();
    const ok = db === 'healthy' && redis === 'healthy';
    res.status(ok ? 200 : 503).json({
      success: ok,
      data: { status: ok ? 'ok' : 'degraded', db, redis },
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1', globalLimiter, routes);
  app.use(errorHandler);

  return app;
}

export function registerProcessHandlers(server) {
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    const forceTimer = setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);

    server.close(async () => {
      try {
        const { closeEmailQueue } = await import('./jobs/emailQueue.js');
        await closeEmailQueue();
        const { disconnectRedis } = await import('./config/redis.js');
        const { disconnectDatabase } = await import('./config/database.js');
        await disconnectRedis();
        await disconnectDatabase();
        logger.info('All connections closed');
        clearTimeout(forceTimer);
        process.exit(0);
      } catch (err) {
        logger.error('Shutdown error', { message: err.message });
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
