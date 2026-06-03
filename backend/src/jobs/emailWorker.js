import { getEmailQueue } from './emailQueue.js';
import { sendEmail } from '../services/email.service.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { connectRedis, disconnectRedis } from '../config/redis.js';
import logger from '../utils/logger.js';

async function start() {
  await connectDatabase();
  await connectRedis();

  const queue = getEmailQueue();

  queue.process('application-confirmation', async (job) => {
    await sendEmail({
      to: job.data.to,
      subject: `Application received — ${job.data.internshipTitle}`,
      text: `Hi ${job.data.name},\n\nYour application for "${job.data.internshipTitle}" was submitted successfully.\n\n— IMP`,
      html: `<p>Hi ${job.data.name},</p><p>Your application for <strong>${job.data.internshipTitle}</strong> was submitted successfully.</p><p>— IMP</p>`,
    });
  });

  queue.process('application-status', async (job) => {
    await sendEmail({
      to: job.data.to,
      subject: `Application update — ${job.data.internshipTitle}`,
      text: `Your application status is now: ${job.data.status}`,
      html: `<p>Your application for <strong>${job.data.internshipTitle}</strong> is now: <strong>${job.data.status}</strong></p>`,
    });
  });

  logger.info('Email worker started');
}

start().catch((err) => {
  logger.error('Email worker failed', { message: err.message });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await getEmailQueue().close();
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(0);
});
