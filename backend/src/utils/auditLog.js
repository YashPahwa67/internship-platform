import { AuditLog } from '../models/AuditLog.js';
import logger from './logger.js';

export async function logAudit(req, action, targetType, targetId, metadata = {}) {
  try {
    await AuditLog.create({
      actorId: req.user._id,
      actorEmail: req.user.email,
      action,
      targetType,
      targetId,
      targetEmail: metadata.targetEmail,
      metadata,
    });
  } catch (err) {
    logger.warn('Audit log failed', { action, message: err.message });
  }
}
