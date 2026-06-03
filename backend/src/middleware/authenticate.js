import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.access_token;

    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (!user || user.status === 'suspended') {
      throw new ApiError(401, 'UNAUTHORIZED', 'Invalid session');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'TOKEN_EXPIRED', 'Access token expired'));
    }
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}
