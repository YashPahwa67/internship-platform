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
router.post('/users/bulk-action', validate(Joi.object({
  ids: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  action: Joi.string().valid('suspend', 'activate', 'delete').required(),
})), adminController.bulkUserAction);
router.get('/users/export', adminController.exportUsers);
router.get('/applications/export', adminController.exportApplications);
router.get('/companies/pending', adminController.pendingCompanies);
router.post('/companies/:id/approve', validate(Joi.object({ approved: Joi.boolean().required() })), adminController.approveCompany);
router.get('/analytics', adminController.analytics);
router.get('/audit-log', adminController.getAuditLog);

export default router;
