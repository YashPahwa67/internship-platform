import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { addClient, removeClient } from '../services/sseManager.js';

export const list = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.unreadOnly === 'true') filter.read = false;

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

  res.json({
    success: true,
    data: notifications.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      read: n.read,
      createdAt: n.createdAt,
    })),
    meta: { unreadCount },
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'NOT_FOUND', 'Notification not found');
  res.json({ success: true, data: { id: notification._id, read: true } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ success: true, data: { message: 'All marked as read' } });
});

// SSE stream — client keeps connection open, server pushes events in real-time
export const stream = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering (Render/Vercel proxies)
  res.flushHeaders();

  const userId = req.user._id;
  addClient(userId, res);

  // Send current unread count immediately on connect
  const unreadCount = await Notification.countDocuments({ userId, read: false });
  res.write(`event: connected\ndata: ${JSON.stringify({ unreadCount })}\n\n`);

  // Heartbeat every 25s to keep connection alive through proxies
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch { clearInterval(heartbeat); }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});
