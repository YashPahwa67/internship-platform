import { Notification } from '../models/Notification.js';
import logger from '../utils/logger.js';

export async function createNotification({ userId, type, title, body, data }) {
  return Notification.create({ userId, type, title, body, data });
}

export async function notifyUser(userId, type, title, body, data = {}) {
  try {
    return await createNotification({ userId, type, title, body, data });
  } catch (err) {
    logger.warn('Notification failed', { userId, type, message: err.message });
  }
}
