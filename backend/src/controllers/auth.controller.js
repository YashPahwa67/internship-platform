import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';

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

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Refresh token required');

  const result = await authService.refreshAccessToken(token);
  res.cookie('refresh_token', result.refreshToken, { ...cookieOptions, path: '/api/v1/auth/refresh-token' });
  res.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id.toString());
  res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh-token' });
  res.json({ success: true, data: { message: 'Logged out' } });
});
