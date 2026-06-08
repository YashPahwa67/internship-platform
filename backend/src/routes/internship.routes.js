import { Router } from 'express';
import Joi from 'joi';
import * as internshipController from '../controllers/internship.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { adminOnly, companyOnly, notSuspended } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  requirements: Joi.array().items(Joi.string()),
  skills: Joi.array().items(Joi.string()),
  type: Joi.string().valid('remote', 'hybrid', 'onsite'),
  location: Joi.string(),
  stipend: Joi.object({ min: Joi.number(), max: Joi.number(), currency: Joi.string() }),
  durationWeeks: Joi.number().min(1),
  openings: Joi.number().min(1),
  applicationDeadline: Joi.date(),
  submit: Joi.boolean(),
});

// No Redis cache on list — avoids stale data on student portal after HR publishes
router.get('/', internshipController.list);
router.get('/company/mine', authenticate, companyOnly, internshipController.companyList);
router.get('/company/:id', authenticate, companyOnly, internshipController.companyGetOne);
router.get('/admin/pending', authenticate, adminOnly, internshipController.pendingReview);
router.get('/:id', internshipController.getById);
router.post('/', authenticate, companyOnly, notSuspended, validate(createSchema), internshipController.create);
router.put('/:id', authenticate, companyOnly, notSuspended, validate(createSchema), internshipController.update);
router.delete('/:id', authenticate, companyOnly, notSuspended, internshipController.remove);
router.post('/:id/approve', authenticate, adminOnly, internshipController.approve);

export default router;
