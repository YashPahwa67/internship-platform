import { Router } from 'express';
import Joi from 'joi';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { adminOnly } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/status', validate(Joi.object({ status: Joi.string().valid('active', 'suspended') })), adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/restore', adminController.restoreUser);
router.get('/companies/pending', adminController.pendingCompanies);
router.post('/companies/:id/approve', validate(Joi.object({ approved: Joi.boolean().required() })), adminController.approveCompany);
router.get('/analytics', adminController.analytics);

export default router;
