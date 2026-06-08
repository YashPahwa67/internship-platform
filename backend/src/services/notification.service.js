import { Notification } from '../models/Notification.js';
import { pushToUser } from './sseManager.js';
import logger from '../utils/logger.js';

export async function createNotification({ userId, type, title, body, data }) {
  return Notification.create({ userId, type, title, body, data });
}

export async function notifyUser(userId, type, title, body, data = {}) {
  try {
    const notification = await createNotification({ userId, type, title, body, data });
    pushToUser(userId, 'notification', {
      id: notification._id,
      type,
      title,
      body,
      data,
      read: false,
      createdAt: notification.createdAt,
    });
    return notification;
  } catch (err) {
    logger.warn('Notification failed', { userId, type, message: err.message });
  }
}
