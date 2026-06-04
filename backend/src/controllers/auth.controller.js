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
  res.status(201).json({ success: true, data: result });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, 'VALIDATION_ERROR', 'Email and code are required');
  const result = await authService.verifyOtp(email, otp);
  res.cookie('refresh_token', result.refreshToken, { ...cookieOptions, path: '/api/v1/auth/refresh-token' });
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'VALIDATION_ERROR', 'Email is required');
  const result = await authService.resendOtp(email);
  res.json({ success: true, data: result });
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

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) throw new ApiError(400, 'VALIDATION_ERROR', 'Both passwords are required');
  if (newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new ApiError(400, 'WEAK_PASSWORD', 'Password must be min 8 chars with upper, lower, and digit');
  }
  const result = await authService.changePassword(req.user._id, oldPassword, newPassword);
  res.json({ success: true, data: result });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'VALIDATION_ERROR', 'Email is required');
  const result = await authService.forgotPassword(email);
  res.json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(400, 'VALIDATION_ERROR', 'All fields are required');
  if (newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new ApiError(400, 'WEAK_PASSWORD', 'Password must be min 8 chars with upper, lower, and digit');
  }
  const result = await authService.resetPassword(email, otp, newPassword);
  res.json({ success: true, data: result });
});

export const requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail) throw new ApiError(400, 'VALIDATION_ERROR', 'New email is required');
  const result = await authService.requestEmailChange(req.user._id, newEmail);
  res.json({ success: true, data: result });
});

export const confirmEmailChange = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  if (!otp) throw new ApiError(400, 'VALIDATION_ERROR', 'Code is required');
  const result = await authService.confirmEmailChange(req.user._id, otp);
  res.json({ success: true, data: result });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await authService.deleteAccount(req.user._id);
  res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh-token' });
  res.json({ success: true, data: { message: 'Account deleted' } });
});
