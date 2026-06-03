import { Router } from 'express';
import Joi from 'joi';
import * as internshipController from '../controllers/internship.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { adminOnly, companyOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { cache } from '../middleware/cache.js';

const router = Router();

const listCacheKey = (req) => {
  const qs = new URLSearchParams(
    Object.entries(req.query).filter(([, v]) => v != null && v !== '')
  ).toString();
  return `cache:GET:/api/v1/internships${qs ? `?${qs}` : ''}`;
};
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

router.get('/', cache(300, listCacheKey), internshipController.list);
router.get('/company/mine', authenticate, companyOnly, internshipController.companyList);
router.get('/admin/pending', authenticate, adminOnly, internshipController.pendingReview);
router.get('/:id', internshipController.getById);
router.post('/', authenticate, companyOnly, validate(createSchema), internshipController.create);
router.put('/:id', authenticate, companyOnly, validate(createSchema), internshipController.update);
router.post('/:id/approve', authenticate, adminOnly, internshipController.approve);

export default router;
