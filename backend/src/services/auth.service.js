import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Company } from '../models/Company.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import { signAccessToken, signRefreshToken } from './token.service.js';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function register({ email, password, role, firstName, lastName, companyName }) {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'EMAIL_EXISTS', 'Email already registered');

  const passwordHash = await User.hashPassword(password);
  let companyId = null;

  if (role === ROLES.COMPANY_HR) {
    if (!companyName) throw new ApiError(400, 'VALIDATION_ERROR', 'Company name is required');
    const slug = slugify(companyName) + '-' + Date.now().toString(36);
    const company = await Company.create({
      name: companyName,
      slug,
      approvalStatus: 'pending',
    });
    companyId = company._id;
  }

  const user = await User.create({
    email,
    passwordHash,
    role,
    firstName,
    lastName,
    companyId,
    status: 'active',
    emailVerified: true,
    refreshTokenFamily: uuidv4(),
  });

  if (role === ROLES.STUDENT) {
    await Student.create({
      userId: user._id,
      fullName: [firstName, lastName].filter(Boolean).join(' ').trim(),
      skills: [],
    });
  }

  const tokens = issueTokens(user);
  await User.findByIdAndUpdate(user._id, { refreshTokenFamily: tokens.family });

  const populated = await User.findById(user._id).populate('companyId', 'name approvalStatus');
  return { user: sanitizeUser(populated), ...tokens };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash').populate('companyId', 'name approvalStatus');
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(423, 'ACCOUNT_LOCKED', 'Account temporarily locked');
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

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  const family = uuidv4();
  user.refreshTokenFamily = family;
  await user.save();

  const tokens = issueTokens(user, family);
  const populated = await User.findById(user._id).populate('companyId', 'name approvalStatus');
  return { user: sanitizeUser(populated), ...tokens };
}

export function issueTokens(user, family) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, family: tokenFamily } = signRefreshToken(user, family);
  return { accessToken, refreshToken, family: tokenFamily };
}

export async function getMe(userId) {
  const user = await User.findById(userId).populate('companyId', 'name approvalStatus');
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
  let profile = null;
  if (user.role === ROLES.STUDENT) {
    profile = await Student.findOne({ userId: user._id });
  }
  return { user: sanitizeUser(user), profile };
}

function sanitizeUser(user) {
  return {
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    companyId: user.companyId?._id || user.companyId,
    company: user.companyId?.name ? { name: user.companyId.name, approvalStatus: user.companyId.approvalStatus } : undefined,
    status: user.status,
  };
}
