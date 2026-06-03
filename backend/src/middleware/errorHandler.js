import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: { code: err.code, details: err.details },
      timestamp: new Date().toISOString(),
      ...(config.nodeEnv === 'development' && { correlationId: req.correlationId }),
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      error: { code: 'CONFLICT' },
      timestamp: new Date().toISOString(),
    });
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
    path: req.originalUrl,
  });

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    error: { code: 'INTERNAL_ERROR' },
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
}
