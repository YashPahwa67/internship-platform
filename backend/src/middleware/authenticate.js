import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.access_token;

  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Invalid session');
    if (user.status === 'deleted') {
      throw new ApiError(403, 'ACCOUNT_DELETED', 'Your account has been blocked by admin.');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Access token expired');
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token');
  }
});
