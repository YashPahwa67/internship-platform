import { Router } from 'express';
import Joi from 'joi';
import multer from 'multer';
import * as applicationController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, companyOnly, studentOnly, notSuspended } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { applyLimiter } from '../middleware/rateLimiter.js';
import { config } from '../config/env.js';

const router = Router();

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxResumeBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = config.upload.allowedResumeMimes.includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'), ok);
  },
}).single('resume');

function optionalResume(req, res, next) {
  resumeUpload(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}

router.get('/export', authenticate, companyOnly, applicationController.exportCsv);
router.get('/', authenticate, applicationController.list);
router.get('/:id', authenticate, applicationController.getById);
const applySchema = Joi.object({
  internshipId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid internship id',
    'string.length': 'Invalid internship id',
  }),
  coverLetter: Joi.string().max(2000).allow('', null).optional(),
});

router.post('/', authenticate, studentOnly, notSuspended, applyLimiter, optionalResume, validate(applySchema), applicationController.apply);
router.patch('/:id/status', authenticate, companyOnly, notSuspended, validate(Joi.object({
  status: Joi.string().required(),
  note: Joi.string(),
})), applicationController.updateStatus);
router.post('/:id/withdraw', authenticate, studentOnly, applicationController.withdraw);
router.post('/:id/student-review', authenticate, studentOnly, validate(Joi.object({ rating: Joi.number().min(1).max(5).required(), comment: Joi.string().max(1000).allow('', null) })), applicationController.submitStudentReview);
router.post('/:id/company-review', authenticate, companyOnly, validate(Joi.object({ rating: Joi.number().min(1).max(5).required(), comment: Joi.string().max(1000).allow('', null) })), applicationController.submitCompanyReview);
router.get('/:id/certificate', authenticate, studentOnly, applicationController.getCertificate);

export default router;
