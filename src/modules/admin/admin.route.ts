import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(requireRole([Role.ADMIN]));

router.get('/users', adminController.getUsers);
router.get('/users/search', adminController.searchUsers);
router.patch('/users/:id/role', adminController.changeUserRole);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/incident-history', adminController.getIncidentHistory);

export const AdminRoutes = router;
