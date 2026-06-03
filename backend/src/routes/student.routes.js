import { Router } from 'express';
import * as studentController from '../controllers/student.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { studentOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/student.validator.js';
import {
  uploadProfilePicture,
  uploadResume,
  handleMulterError,
  requireFile,
} from '../middleware/upload.js';

const router = Router();

router.use(authenticate, studentOnly);

router.get('/profile', studentController.getProfile);
router.put('/profile', validate(updateProfileSchema), studentController.updateProfile);

router.post(
  '/profile/picture',
  uploadProfilePicture,
  handleMulterError,
  requireFile,
  studentController.uploadProfilePicture
);

router.delete('/profile/picture', studentController.removeProfilePicture);

router.post(
  '/profile/resume',
  uploadResume,
  handleMulterError,
  requireFile,
  studentController.uploadResume
);

router.delete('/profile/resume', studentController.removeResume);

export default router;
