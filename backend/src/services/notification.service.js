import { Notification } from '../models/Notification.js';

export async function createNotification({ userId, type, title, body, data }) {
  return Notification.create({ userId, type, title, body, data });
}

export async function notifyUser(userId, type, title, body, data = {}) {
  try {
    return await createNotification({ userId, type, title, body, data });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
}
