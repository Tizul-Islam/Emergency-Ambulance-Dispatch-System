import { Router } from 'express';
import * as dispatchController from './dispatch.controller';
import { validate } from '../../middlewares/validate';
import {
  updateDispatchStatusSchema,
  selectHospitalSchema,
  searchDispatchesSchema,
} from './dispatch.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '../../generated/prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/my-assigned',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  dispatchController.getMyAssignedDispatches,
);
router.get(
  '/search',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(searchDispatchesSchema),
  dispatchController.searchDispatches,
);
router.get('/:id', requireRole([Role.DISPATCHER, Role.ADMIN]), dispatchController.getDispatchById);
router.patch(
  '/:id/status',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(updateDispatchStatusSchema),
  dispatchController.updateStatus,
);
router.post(
  '/:id/select-hospital',
  requireRole([Role.DISPATCHER, Role.ADMIN]),
  validate(selectHospitalSchema),
  dispatchController.selectHospital,
);

export const DispatchRoutes = router;
