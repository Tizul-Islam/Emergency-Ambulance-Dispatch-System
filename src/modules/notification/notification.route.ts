import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/my', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);

export const NotificationRoutes = router;
