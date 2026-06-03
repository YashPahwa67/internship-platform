import logger from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Sends email via SMTP when configured; otherwise logs (dev-friendly).
 */
export async function sendEmail({ to, subject, text, html }) {
  if (!config.smtp.host) {
    logger.info('Email (dev log)', { to, subject });
    return { messageId: 'dev-log' };
  }

  const nodemailer = await import('nodemailer').catch(() => null);
  if (!nodemailer) {
    logger.warn('nodemailer not installed; logging email', { to, subject });
    return { messageId: 'skipped' };
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port || 587,
    secure: false,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  const info = await transporter.sendMail({
    from: config.smtp.from || config.smtp.user,
    to,
    subject,
    text,
    html,
  });

  logger.info('Email sent', { to, messageId: info.messageId });
  return info;
}
