import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/env.js';
import { replaceAsset, deleteAsset } from '../utils/cloudinary.util.js';
import { buildPrimaryEducationPayload, resolveEducation } from '../utils/formatStudentProfile.js';

const PROFILE_FIELDS = [
  'fullName', 'phone', 'college', 'degree', 'skills', 'bio',
  'linkedIn', 'github', 'portfolio', 'location',
  'education', 'projects', 'experience', 'certifications',
  'university', 'graduationYear', 'rollNo', 'cgpa',
];

function sanitizeProfilePayload(body) {
  const payload = {};
  for (const key of PROFILE_FIELDS) {
    if (body[key] !== undefined) payload[key] = body[key];
  }
  if (payload.college) payload.university = payload.college;
  if (payload.university && !payload.college) payload.college = payload.university;
  return payload;
}

/** Keep User.firstName / lastName in sync with Student.fullName for nav & dashboards */
export async function syncUserFromFullName(userId, fullName) {
  const trimmed = fullName?.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || '';

  return User.findByIdAndUpdate(
    userId,
    { firstName, lastName },
    { new: true }
  ).select('email firstName lastName role');
}

function formatProfile(doc) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  const user = p.userId && typeof p.userId === 'object' ? p.userId : null;
  const fullName =
    p.fullName?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '';

  return {
    id: p._id,
    userId: user?._id?.toString() || p.userId?.toString(),
    email: user?.email,
    fullName,
    phone: p.phone,
    college: p.college || p.university,
    degree: p.degree,
    skills: p.skills || [],
    bio: p.bio,
    linkedIn: p.linkedIn,
    github: p.github,
    portfolio: p.portfolio,
    location: p.location,
    profilePicture: p.profilePicture,
    resume: p.resume,
    education: resolveEducation(p),
    projects: p.projects || [],
    experience: p.experience || [],
    certifications: p.certifications || [],
    rollNo: p.rollNo,
    cgpa: p.cgpa,
    graduationYear: p.graduationYear,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    user: user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }
      : undefined,
  };
}

async function loadProfileResponse(userId) {
  const profile = await Student.findByUserId(userId);
  if (!profile) throw new ApiError(404, 'NOT_FOUND', 'Student profile not found');
  return formatProfile(profile);
}

export async function getOrCreateProfile(userId) {
  let profile = await Student.findByUserId(userId);
  if (!profile) {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');
    profile = await Student.create({
      userId,
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
      college: '',
      skills: [],
    });
    profile = await Student.findByUserId(userId);
  }
  return formatProfile(profile);
}

/** Keep education[] in DB aligned with college / degree / graduation year on every save */
function mergePrimaryEducation(payload, existing) {
  const education = buildPrimaryEducationPayload({
    college: payload.college,
    degree: payload.degree,
    graduationYear: payload.graduationYear,
    existing,
  });
  if (education) payload.education = education;
  return payload;
}

export async function updateProfile(userId, body) {
  const existing = await Student.findOne({ userId }).lean();
  const payload = sanitizeProfilePayload(body);
  mergePrimaryEducation(payload, existing);

  await Student.findOneAndUpdate(
    { userId },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  );

  if (payload.fullName?.trim()) {
    await syncUserFromFullName(userId, payload.fullName);
  }

  return loadProfileResponse(userId);
}

export async function uploadProfilePicture(userId, file) {
  const profile = await Student.findOne({ userId });
  if (!profile) throw new ApiError(404, 'NOT_FOUND', 'Student profile not found');

  const asset = await replaceAsset(profile.profilePicture, file.buffer, {
    resourceType: 'image',
    mimeType: file.mimetype,
    originalFilename: file.originalname,
    cloudinaryOptions: {
      folder: `${config.cloudinary.folder}/profile-pictures`,
      transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
    },
  });

  profile.profilePicture = asset;
  await profile.save();
  return loadProfileResponse(userId);
}

export async function uploadResume(userId, file) {
  const profile = await Student.findOne({ userId });
  if (!profile) throw new ApiError(404, 'NOT_FOUND', 'Student profile not found');

  const asset = await replaceAsset(profile.resume, file.buffer, {
    resourceType: 'raw',
    mimeType: file.mimetype,
    originalFilename: file.originalname,
    cloudinaryOptions: {
      folder: `${config.cloudinary.folder}/resumes`,
      resource_type: 'raw',
    },
  });

  profile.resume = asset;
  await profile.save();
  return loadProfileResponse(userId);
}

export async function deleteProfilePicture(userId) {
  const profile = await Student.findOne({ userId });
  if (!profile?.profilePicture?.publicId) {
    throw new ApiError(404, 'NOT_FOUND', 'No profile picture to delete');
  }
  await deleteAsset(profile.profilePicture.publicId, 'image');
  profile.profilePicture = undefined;
  await profile.save();
  return loadProfileResponse(userId);
}

export async function deleteResume(userId) {
  const profile = await Student.findOne({ userId });
  if (!profile?.resume?.publicId) {
    throw new ApiError(404, 'NOT_FOUND', 'No resume to delete');
  }
  await deleteAsset(profile.resume.publicId, 'raw');
  profile.resume = undefined;
  await profile.save();
  return loadProfileResponse(userId);
}
