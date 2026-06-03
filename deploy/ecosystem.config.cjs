/**
 * PM2 process file
 * Usage (from anywhere):
 *   pm2 start /path/to/Internship_platform/deploy/ecosystem.config.cjs
 */
const path = require('path');

const root = path.resolve(__dirname, '..');

module.exports = {
  apps: [
    {
      name: 'imp-api',
      cwd: path.join(root, 'backend'),
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '400M',
      error_file: path.join(root, 'logs/api-error.log'),
      out_file: path.join(root, 'logs/api-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'imp-email-worker',
      cwd: path.join(root, 'backend'),
      script: 'src/jobs/emailWorker.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],
};
