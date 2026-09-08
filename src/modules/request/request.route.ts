import { Router } from 'express';
import * as requestController from './request.controller';
import { validate } from '../../middlewares/validate';
import {
  createRequestSchema,
  getMyRequestsSchema,
  assignRequestSchema,
  getAllRequestsSchema,
  updatePrioritySchema,
  updateRequestSchema,
  searchRequestsSchema,
} from './request.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '../../generated/prisma/client';
import { requestLimiter } from '../../middlewares/rateLimiter';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requestLimiter,
  requireRole([Role.PATIENT]),
  validate(createRequestSchema),
  requestController.createRequest,
);
router.get(
  '/',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(getAllRequestsSchema),
  requestController.getAllRequests,
);
router.get(
  '/search',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(searchRequestsSchema),
  requestController.searchRequests,
);
router.get('/queue', requireRole([Role.DISPATCHER, Role.ADMIN]), requestController.getQueue);
router.get(
  '/my',
  requireRole([Role.PATIENT]),
  validate(getMyRequestsSchema),
  requestController.getMyRequests,
);
router.get(
  '/:id',
  requireRole([Role.PATIENT, Role.DISPATCHER, Role.ADMIN]),
  requestController.getRequestById,
);
router.patch(
  '/:id/priority',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(updatePrioritySchema),
  requestController.updatePriority,
);
router.patch('/:id/cancel', requireRole([Role.PATIENT]), requestController.cancelRequest);
router.patch(
  '/:id',
  requireRole([Role.PATIENT]),
  validate(updateRequestSchema),
  requestController.updateRequest,
);
router.delete(
  '/:id',
  requireRole([Role.PATIENT, Role.ADMIN]),
  requestController.deleteRequest,
);
router.post(
  '/:id/assign',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(assignRequestSchema),
  requestController.assignRequest,
);

export const RequestRoutes = router;
