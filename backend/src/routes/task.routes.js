import { Router } from 'express';
import Joi from 'joi';
import * as taskController from '../controllers/task.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { companyOnly, studentOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', authenticate, taskController.list);
router.post('/', authenticate, companyOnly, validate(Joi.object({
  applicationId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string(),
  deadline: Joi.date(),
  priority: Joi.string().valid('low', 'medium', 'high'),
})), taskController.create);
router.post('/:id/submit', authenticate, studentOnly, validate(Joi.object({
  notes: Joi.string().required(),
})), taskController.submit);
router.post('/:id/review', authenticate, companyOnly, validate(Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'revision_requested').required(),
  feedback: Joi.string(),
  rating: Joi.number().min(1).max(5),
})), taskController.review);

export default router;
