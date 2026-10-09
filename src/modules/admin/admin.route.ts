import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '../../generated/prisma/client';

const router = Router();

// Protect all admin routes
router.use(authenticate);
// Dispatcher & Admin can view stats
router.get('/dashboard-stats', requireRole([Role.ADMIN, Role.DISPATCHER]), adminController.getDashboardStats);

// Protect all admin routes
router.use(requireRole([Role.ADMIN]));

router.get('/users', adminController.getUsers);
router.get('/users/search', adminController.searchUsers);
router.patch('/users/:id/role', adminController.changeUserRole);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/incident-history', adminController.getIncidentHistory);

export const AdminRoutes = router;
