import { Router } from 'express';
import * as ambulanceController from './ambulance.controller';
import { validate } from '../../middlewares/validate';
import {
  createAmbulanceSchema,
  getAmbulancesSchema,
  updateAmbulanceSchema,
  nearestAmbulanceSchema,
  searchAmbulancesSchema,
} from './ambulance.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '../../generated/prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole([Role.ADMIN]),
  validate(createAmbulanceSchema),
  ambulanceController.createAmbulance,
);
router.get(
  '/',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  validate(getAmbulancesSchema),
  ambulanceController.getAmbulances,
);
router.get(
  '/search',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  validate(searchAmbulancesSchema),
  ambulanceController.searchAmbulances,
);
router.get(
  '/nearest',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  validate(nearestAmbulanceSchema),
  ambulanceController.getNearestAmbulance,
);
router.get(
  '/available',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  ambulanceController.getAvailableAmbulances,
);
router.get(
  '/:id',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  ambulanceController.getAmbulanceById,
);
router.patch(
  '/:id',
  requireRole([Role.ADMIN]),
  validate(updateAmbulanceSchema),
  ambulanceController.updateAmbulance,
);
router.delete('/:id', requireRole([Role.ADMIN]), ambulanceController.deleteAmbulance);

export const AmbulanceRoutes = router;
