import { Router } from 'express';
import * as requestController from '../controllers/request.controller';
import { validate } from '../middlewares/validate';
import { createRequestSchema, getMyRequestsSchema } from '../validations/request.validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole([Role.CALLER]), validate(createRequestSchema), requestController.createRequest);
router.get('/my', requireRole([Role.CALLER]), validate(getMyRequestsSchema), requestController.getMyRequests);
router.get('/:id', requireRole([Role.CALLER, Role.DISPATCHER, Role.ADMIN]), requestController.getRequestById);
router.patch('/:id/cancel', requireRole([Role.CALLER]), requestController.cancelRequest);

export const RequestRoutes = router;
