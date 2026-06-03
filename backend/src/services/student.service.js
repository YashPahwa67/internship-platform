import { Student } from '../models/Student.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { config } from '../config/index.js';
import { replaceAsset, deleteAsset } from '../utils/cloudinary.util.js';

const PROFILE_FIELDS = [
  'fullName', 'phone', 'college', 'degree', 'skills', 'bio',
  'linkedIn', 'github', 'portfolio', 'location',
  'education', 'projects', 'experience', 'certifications',
  'university', 'graduationYear',
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

export async function updateProfile(userId, body) {
  const payload = sanitizeProfilePayload(body);
  const profile = await Student.findOneAndUpdate(
    { userId },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  ).populate('userId', 'email firstName lastName');

  return formatProfile(profile);
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
  return formatProfile(await profile.populate('userId', 'email firstName lastName'));
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
  return formatProfile(await profile.populate('userId', 'email firstName lastName'));
}

export async function deleteProfilePicture(userId) {
  const profile = await Student.findOne({ userId });
  if (!profile?.profilePicture?.publicId) {
    throw new ApiError(404, 'NOT_FOUND', 'No profile picture to delete');
  }
  await deleteAsset(profile.profilePicture.publicId, 'image');
  profile.profilePicture = undefined;
  await profile.save();
  return formatProfile(profile);
}

export async function deleteResume(userId) {
  const profile = await Student.findOne({ userId });
  if (!profile?.resume?.publicId) {
    throw new ApiError(404, 'NOT_FOUND', 'No resume to delete');
  }
  await deleteAsset(profile.resume.publicId, 'raw');
  profile.resume = undefined;
  await profile.save();
  return formatProfile(profile);
}

function formatProfile(doc) {
  if (!doc) return null;
  const p = doc.toObject ? doc.toObject() : doc;
  const user = p.userId && typeof p.userId === 'object' ? p.userId : null;
  return {
    id: p._id,
    userId: user?._id || p.userId,
    email: user?.email,
    fullName: p.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
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
    education: p.education || [],
    projects: p.projects || [],
    experience: p.experience || [],
    certifications: p.certifications || [],
    graduationYear: p.graduationYear,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
