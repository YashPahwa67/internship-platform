import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Company } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from './token.service.js';
import {
  storeRefreshToken,
  revokeRefreshToken,
  validateRefreshToken,
} from './redisToken.service.js';
import { sendOtpEmail, sendEmailChangeOtp, sendPasswordResetOtp } from './email.service.js';
import {
  savePendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
} from './pendingRegistration.service.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtp(email, firstName, otp) {
  try {
    await sendOtpEmail({ to: email, firstName, otp });
  } catch (err) {
    logger.error('OTP email failed', { email, reason: err.message });
    if (config.nodeEnv !== 'production') {
      console.log(`\n\x1b[33m[DEV] OTP for ${email}: \x1b[1m${otp}\x1b[0m\n`);
      return;
    }
    // In production, never pretend the code was sent — surface it so the
    // user retries instead of waiting forever for an email that never came.
    throw new ApiError(502, 'EMAIL_SEND_FAILED', 'We could not send your verification code. Please try again.');
  }
}

export async function register({ email, password, role, firstName, lastName, companyName }) {
  const normalizedEmail = email.toLowerCase().trim();

  // A user only exists in the DB once verified, so any hit here is a real account.
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');

  if (role === ROLES.COMPANY_HR && !companyName) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Company name is required');
  }

  const passwordHash = await User.hashPassword(password);
  const otp = generateOtp();

  // Hold everything in the temporary store — nothing is persisted to MongoDB
  // until the OTP is verified.
  await savePendingRegistration(normalizedEmail, {
    email: normalizedEmail,
    passwordHash,
    role,
    firstName,
    lastName,
    companyName: companyName || null,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  try {
    await sendOtp(normalizedEmail, firstName, otp);
  } catch (err) {
    // Don't leave an orphan pending entry if we couldn't deliver the code.
    await deletePendingRegistration(normalizedEmail);
    throw err;
  }

  return { requiresVerification: true, email: normalizedEmail };
}

export async function verifyOtp(email, otp) {
  const normalizedEmail = email.toLowerCase().trim();

  const pending = await getPendingRegistration(normalizedEmail);
  if (!pending) {
    // Either never registered, already verified, or the pending entry expired.
    const alreadyUser = await User.findOne({ email: normalizedEmail });
    if (alreadyUser?.emailVerified) {
      throw new ApiError(400, 'ALREADY_VERIFIED', 'Email is already verified');
    }
    throw new ApiError(400, 'OTP_EXPIRED', 'Code has expired. Please request a new one.');
  }

  if (pending.otp !== otp) throw new ApiError(400, 'INVALID_OTP', 'Invalid verification code');
  if (pending.expiresAt < Date.now()) {
    await deletePendingRegistration(normalizedEmail);
    throw new ApiError(400, 'OTP_EXPIRED', 'Code has expired. Please request a new one.');
  }

  // Guard against a race where the email got registered after the pending entry.
  const taken = await User.findOne({ email: normalizedEmail });
  if (taken) {
    await deletePendingRegistration(normalizedEmail);
    throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');
  }

  // Verified — now create the real records.
  let companyId = null;
  if (pending.role === ROLES.COMPANY_HR) {
    const slug = slugify(pending.companyName) + '-' + Date.now().toString(36);
    const company = await Company.create({ name: pending.companyName, slug, approvalStatus: 'pending' });
    companyId = company._id;
  }

  const user = await User.create({
    email: pending.email,
    passwordHash: pending.passwordHash,
    role: pending.role,
    firstName: pending.firstName,
    lastName: pending.lastName,
    companyId,
    status: 'active',
    emailVerified: true,
    refreshTokenFamily: uuidv4(),
  });

  if (pending.role === ROLES.STUDENT) {
    await Student.create({
      userId: user._id,
      fullName: [pending.firstName, pending.lastName].filter(Boolean).join(' ').trim(),
      skills: [],
    });
  }

  await deletePendingRegistration(normalizedEmail);

  const created = await User.findById(user._id).populate('companyId', 'name approvalStatus');
  const tokens = await issueTokens(created);
  return { user: sanitizeUser(created), ...tokens };
}

export async function resendOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  const pending = await getPendingRegistration(normalizedEmail);
  if (!pending) {
    const alreadyUser = await User.findOne({ email: normalizedEmail });
    if (alreadyUser?.emailVerified) {
      throw new ApiError(400, 'ALREADY_VERIFIED', 'Email is already verified');
    }
    throw new ApiError(404, 'NOT_FOUND', 'No pending registration found. Please sign up again.');
  }

  const otp = generateOtp();
  await savePendingRegistration(normalizedEmail, {
    ...pending,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  await sendOtp(normalizedEmail, pending.firstName, otp);
  return { message: 'New code sent' };
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  const valid = await user.comparePassword(oldPassword);
  if (!valid) throw new ApiError(400, 'WRONG_PASSWORD', 'Current password is incorrect');

  const passwordHash = await User.hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, { $set: { passwordHash } });
  return { message: 'Password updated' };
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  // Don't reveal whether email exists
  if (!user) return { message: 'If that email is registered, a code has been sent' };

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await User.findByIdAndUpdate(user._id, {
    $set: { passwordResetOtp: otp, passwordResetOtpExpiry: otpExpiry },
  });

  try {
    await sendPasswordResetOtp({ to: email, firstName: user.firstName, otp });
  } catch (err) {
    logger.error('Password reset OTP failed', { reason: err.message });
    if (config.nodeEnv !== 'production') {
      console.log(`\n\x1b[33m[DEV] Password reset OTP for ${email}: \x1b[1m${otp}\x1b[0m\n`);
    }
  }

  return { message: 'If that email is registered, a code has been sent' };
}

export async function resetPassword(email, otp, newPassword) {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+passwordResetOtp +passwordResetOtpExpiry');

  if (!user || !user.passwordResetOtp) throw new ApiError(400, 'INVALID_OTP', 'Invalid or expired code');
  if (user.passwordResetOtp !== otp) throw new ApiError(400, 'INVALID_OTP', 'Invalid verification code');
  if (user.passwordResetOtpExpiry < new Date()) throw new ApiError(400, 'OTP_EXPIRED', 'Code has expired. Please request a new one.');

  const passwordHash = await User.hashPassword(newPassword);
  await User.findByIdAndUpdate(user._id, {
    $set: { passwordHash },
    $unset: { passwordResetOtp: 1, passwordResetOtpExpiry: 1 },
  });

  return { message: 'Password reset successfully' };
}

export async function requestEmailChange(userId, newEmail) {
  const normalized = newEmail.toLowerCase().trim();
  const taken = await User.findOne({ email: normalized });
  if (taken) throw new ApiError(409, 'EMAIL_EXISTS', 'That email is already in use');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  if (user.email === normalized) throw new ApiError(400, 'SAME_EMAIL', 'New email is the same as current');

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    $set: { pendingEmail: normalized, pendingEmailOtp: otp, pendingEmailOtpExpiry: otpExpiry },
  });

  try {
    await sendEmailChangeOtp({ to: normalized, firstName: user.firstName, otp });
  } catch (err) {
    logger.error('Email change OTP failed', { reason: err.message });
    if (config.nodeEnv !== 'production') {
      console.log(`\n\x1b[33m[DEV] Email change OTP for ${normalized}: \x1b[1m${otp}\x1b[0m\n`);
    }
  }

  return { message: 'Verification code sent to new email' };
}

export async function confirmEmailChange(userId, otp) {
  const user = await User.findById(userId)
    .select('+pendingEmail +pendingEmailOtp +pendingEmailOtpExpiry');

  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  if (!user.pendingEmail) throw new ApiError(400, 'NO_PENDING', 'No email change request found');
  if (user.pendingEmailOtp !== otp) throw new ApiError(400, 'INVALID_OTP', 'Invalid verification code');
  if (user.pendingEmailOtpExpiry < new Date()) {
    throw new ApiError(400, 'OTP_EXPIRED', 'Code has expired. Please request a new one.');
  }

  const newEmail = user.pendingEmail;

  // Check again in case someone else registered with this email in the meantime
  const taken = await User.findOne({ email: newEmail, _id: { $ne: userId } });
  if (taken) throw new ApiError(409, 'EMAIL_EXISTS', 'That email was just taken by another account');

  await User.findByIdAndUpdate(userId, {
    $set: { email: newEmail },
    $unset: { pendingEmail: 1, pendingEmailOtp: 1, pendingEmailOtpExpiry: 1 },
  });

  const updated = await User.findById(userId).populate('companyId', 'name approvalStatus');
  return { user: sanitizeUser(updated) };
}

export async function deleteAccount(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  await Student.deleteOne({ userId });
  await revokeRefreshToken(userId.toString());
  await User.findByIdAndDelete(userId);
}

export async function login({ email, password }) {
  const normalizedEmail = email?.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail })
    .select('+passwordHash')
    .populate('companyId', 'name approvalStatus');
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', 'Account temporarily locked');
  }

  if (user.status === 'deleted') {
    throw new ApiError(403, 'ACCOUNT_DELETED', 'Your account has been blocked by admin.');
  }

  if (user.status === 'suspended') {
    throw new ApiError(403, 'FORBIDDEN', 'Account suspended');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const family = uuidv4();
  await User.findByIdAndUpdate(user._id, {
    $set: { failedLoginAttempts: 0, refreshTokenFamily: family },
    $unset: { lockUntil: 1 },
  });

  const tokens = await issueTokens(user, family);
  const populated = await User.findById(user._id).populate('companyId', 'name approvalStatus');
  return { user: sanitizeUser(populated), ...tokens };
}

export async function refreshAccessToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub;
  await validateRefreshToken(userId, refreshToken);

  const user = await User.findById(userId).populate('companyId', 'name approvalStatus');
  if (!user || user.status === 'suspended') {
    throw new ApiError(401, 'UNAUTHORIZED', 'User not found or suspended');
  }
  if (user.status === 'deleted') {
    throw new ApiError(403, 'ACCOUNT_DELETED', 'Your account has been blocked by admin.');
  }

  const accessToken = signAccessToken(user);
  const { token: newRefresh } = signRefreshToken(user, payload.family);
  await storeRefreshToken(userId, newRefresh);

  return { accessToken, refreshToken: newRefresh, user: sanitizeUser(user) };
}

export async function logoutUser(userId) {
  await revokeRefreshToken(userId);
}

export async function loginWithGoogle(profile) {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new ApiError(400, 'OAUTH_EMAIL_MISSING', 'No email returned from Google');

  let user = await User.findOne({ email }).populate('companyId', 'name approvalStatus');

  if (!user) {
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    const lastName = profile.name?.familyName || '';
    user = await User.create({
      email,
      passwordHash: null,
      role: ROLES.STUDENT,
      firstName,
      lastName,
      emailVerified: true,
      status: 'active',
      refreshTokenFamily: (await import('uuid')).v4(),
    });
    await Student.create({
      userId: user._id,
      fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
      skills: [],
    });
    user = await User.findById(user._id).populate('companyId', 'name approvalStatus');
  } else {
    if (user.status === 'deleted') {
      throw new ApiError(403, 'ACCOUNT_DELETED', 'Your account has been blocked by admin.');
    }
  }

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function issueTokens(user, family) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, family: tokenFamily } = signRefreshToken(user, family);
  await storeRefreshToken(user._id.toString(), refreshToken);
  return { accessToken, refreshToken, family: tokenFamily };
}

export async function getMe(userId) {
  const user = await User.findById(userId).populate('companyId', 'name approvalStatus');
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  let profile = null;
  if (user.role === ROLES.STUDENT) {
    const { getOrCreateProfile } = await import('./student.service.js');
    profile = await getOrCreateProfile(userId);
  }

  const sanitized = sanitizeUser(user);
  if (profile?.profilePicture?.url) {
    sanitized.profilePictureUrl = profile.profilePicture.url;
  }
  if (profile?.fullName) {
    sanitized.displayName = profile.fullName;
  }

  return { user: sanitized, profile };
}

function sanitizeUser(user) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: displayName || undefined,
    companyId: user.companyId?._id || user.companyId,
    company: user.companyId?.name ? { name: user.companyId.name, approvalStatus: user.companyId.approvalStatus } : undefined,
    status: user.status,
  };
}
