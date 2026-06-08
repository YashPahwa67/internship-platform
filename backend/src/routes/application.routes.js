import { Router } from 'express';
import Joi from 'joi';
import * as applicationController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize, companyOnly, studentOnly, notSuspended } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { applyLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', authenticate, applicationController.list);
router.get('/:id', authenticate, applicationController.getById);
const applySchema = Joi.object({
  internshipId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid internship id',
    'string.length': 'Invalid internship id',
  }),
  coverLetter: Joi.string().max(2000).allow('', null).optional(),
});

router.post('/', authenticate, studentOnly, notSuspended, applyLimiter, validate(applySchema), applicationController.apply);
router.patch('/:id/status', authenticate, companyOnly, notSuspended, validate(Joi.object({
  status: Joi.string().required(),
  note: Joi.string(),
})), applicationController.updateStatus);
router.post('/:id/withdraw', authenticate, studentOnly, applicationController.withdraw);

export default router;
