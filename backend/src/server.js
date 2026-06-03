import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { initCloudinary } from './config/cloudinary.js';
import { config } from './config/index.js';

async function start() {
  await connectDatabase();
  initCloudinary();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
