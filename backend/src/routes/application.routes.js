import { Router } from 'express';
import Joi from 'joi';
import * as applicationController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, companyOnly, studentOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { applyLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', authenticate, applicationController.list);
router.post('/', authenticate, studentOnly, applyLimiter, validate(Joi.object({
  internshipId: Joi.string().required(),
  coverLetter: Joi.string().max(2000),
})), applicationController.apply);
router.patch('/:id/status', authenticate, companyOnly, validate(Joi.object({
  status: Joi.string().required(),
  note: Joi.string(),
})), applicationController.updateStatus);
router.post('/:id/withdraw', authenticate, studentOnly, applicationController.withdraw);

export default router;
