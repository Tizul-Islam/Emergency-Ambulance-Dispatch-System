import { Router, Request, Response } from 'express';
import { getMe, updateMe } from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { updateMeSchema } from '../validations/user.validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { sendSuccessResponse } from '../utils/responseHelper';

const router = Router();

// Protect all routes below this middleware
router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', validate(updateMeSchema), updateMe);

// Dummy route to test RBAC (Admin/Dispatcher only)
router.get('/admin-only', requireRole([Role.ADMIN, Role.DISPATCHER]), (req: Request, res: Response) => {
  res.status(200).json(sendSuccessResponse('You have accessed an admin/dispatcher only route'));
});

export const UserRoutes = router;
