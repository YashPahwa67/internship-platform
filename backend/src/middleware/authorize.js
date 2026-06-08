import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}

export const adminOnly = authorize(ROLES.ADMIN);
export const companyOnly = authorize(ROLES.COMPANY_HR);
export const studentOnly = authorize(ROLES.STUDENT);
export const mentorOnly = authorize(ROLES.MENTOR);

export function notSuspended(req, res, next) {
  if (!req.user) return next(new ApiError(401, 'UNAUTHORIZED', 'Authentication required'));
  if (req.user.status === 'suspended') {
    return next(new ApiError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended. Contact yashpahwa1209@gmail.com for assistance.'));
  }
  next();
}
