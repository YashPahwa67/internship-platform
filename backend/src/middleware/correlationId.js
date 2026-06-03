import crypto from 'crypto';

export function correlationId(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.set('X-Correlation-ID', req.correlationId);
  next();
}
