import { asyncHandler } from '../utils/asyncHandler.js';
import * as studentService from '../services/student.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const data = await studentService.getOrCreateProfile(req.user._id);
  res.json({ success: true, data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await studentService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data });
});

export const uploadProfilePicture = asyncHandler(async (req, res) => {
  const data = await studentService.uploadProfilePicture(req.user._id, req.file);
  res.json({ success: true, data });
});

export const uploadResume = asyncHandler(async (req, res) => {
  const data = await studentService.uploadResume(req.user._id, req.file);
  res.json({ success: true, data });
});

export const removeProfilePicture = asyncHandler(async (req, res) => {
  const data = await studentService.deleteProfilePicture(req.user._id);
  res.json({ success: true, data });
});

export const removeResume = asyncHandler(async (req, res) => {
  const data = await studentService.deleteResume(req.user._id);
  res.json({ success: true, data });
});
