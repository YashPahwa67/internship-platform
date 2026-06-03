import multer from 'multer';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const storage = multer.memoryStorage();

function fileFilter(allowedMimes) {
  return (_req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(
        new ApiError(400, 'INVALID_FILE_TYPE', `Allowed types: ${allowedMimes.join(', ')}`),
        false
      );
    }
    cb(null, true);
  };
}

function createUploader({ maxSize, allowedMimes, fieldName }) {
  return multer({
    storage,
    limits: { fileSize: maxSize, files: 1 },
    fileFilter: fileFilter(allowedMimes),
  }).single(fieldName);
}

export const uploadProfilePicture = createUploader({
  fieldName: 'file',
  maxSize: config.upload.maxProfileImageBytes,
  allowedMimes: config.upload.allowedImageMimes,
});

export const uploadResume = createUploader({
  fieldName: 'file',
  maxSize: config.upload.maxResumeBytes,
  allowedMimes: config.upload.allowedResumeMimes,
});

/** Multer error handler — must run after upload middleware */
export function handleMulterError(err, req, res, next) {
  if (!err) return next();
  if (err instanceof ApiError) return next(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(new ApiError(400, 'FILE_TOO_LARGE', 'File exceeds maximum allowed size'));
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return next(new ApiError(400, 'INVALID_FIELD', 'Unexpected file field'));
  }
  return next(new ApiError(400, 'UPLOAD_ERROR', err.message || 'Upload failed'));
}

export function requireFile(req, _res, next) {
  if (!req.file?.buffer) {
    return next(new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded'));
  }
  if (!config.isCloudinaryConfigured) {
    return next(new ApiError(503, 'STORAGE_UNAVAILABLE', 'File storage is not configured'));
  }
  next();
}
