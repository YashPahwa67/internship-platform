import { Router } from 'express';
import Joi from 'joi';
import * as mentorshipController from '../controllers/mentorship.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/mentors', mentorshipController.listMentors);
router.post('/request', authorize(['student']), validate(Joi.object({
  mentorId: Joi.string().hex().length(24).required(),
  applicationId: Joi.string().hex().length(24).allow(null, '').optional(),
})), mentorshipController.requestMentorship);

router.get('/mine', mentorshipController.listMyMentorships);

router.patch('/:id/respond', authorize(['mentor']), validate(Joi.object({ accept: Joi.boolean().required() })), mentorshipController.respondToRequest);
router.post('/:id/session-note', authorize(['mentor', 'student']), validate(Joi.object({ content: Joi.string().max(2000).required() })), mentorshipController.addSessionNote);
router.post('/:id/progress', authorize(['mentor', 'student']), validate(Joi.object({ entry: Joi.string().max(2000).required() })), mentorshipController.addProgressEntry);

export default router;
