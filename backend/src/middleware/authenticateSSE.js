import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';
import { catchAsync } from '../utils/catchAsync.js';

// SSE connections can't send custom headers, so token comes as ?_t=...
export const authenticateSSE = catchAsync(async (req, res, next) => {
  const token = req.query._t;
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required');

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Invalid session');
    if (user.status === 'deleted') throw new ApiError(403, 'ACCOUNT_DELETED', 'Account removed');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token');
  }
});
