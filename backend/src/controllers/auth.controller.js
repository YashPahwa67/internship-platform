import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { config } from '../config/index.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.cookie('refresh_token', result.refreshToken, { ...cookieOptions, path: '/api/v1/auth/refresh-token' });
  res.status(201).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.cookie('refresh_token', result.refreshToken, { ...cookieOptions, path: '/api/v1/auth/refresh-token' });
  res.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const me = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user._id);
  res.json({ success: true, data });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh-token' });
  res.json({ success: true, data: { message: 'Logged out' } });
});
