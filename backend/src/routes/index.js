import { Router } from 'express';
import authRoutes from './auth.routes.js';
import internshipRoutes from './internship.routes.js';
import applicationRoutes from './application.routes.js';
import taskRoutes from './task.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/internships', internshipRoutes);
router.use('/applications', applicationRoutes);
router.use('/tasks', taskRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/students', studentRoutes);

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

export default router;
