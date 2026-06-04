import { createApp, registerProcessHandlers } from './app.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { initCloudinary } from './config/cloudinary.js';
import { config } from './config/env.js';
import logger from './utils/logger.js';

async function start() {
  await connectDatabase();

  try {
    await connectRedis();
  } catch (err) {
    if (config.nodeEnv === 'production') {
      logger.error('Redis required in production', { message: err.message });
      throw err;
    }
    logger.warn(
      'Redis is not running. Start Redis locally, or set REDIS_URL to Upstash on Render:\n' +
        '  • Docker:  docker compose up -d redis\n' +
        '  • macOS:   brew install redis && brew services start redis',
      { message: err.message }
    );
  }

  initCloudinary();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`API running on http://localhost:${config.port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(
        `Port ${config.port} is already in use. Another API instance is probably still running.\n` +
          `Fix: lsof -ti :${config.port} | xargs kill -9\n` +
          `Then run: npm run dev`
      );
      process.exit(1);
    }
    throw err;
  });

  registerProcessHandlers(server);
}

start().catch((err) => {
  logger.error('Failed to start server', { message: err.message, stack: err.stack });
  process.exit(1);
});
