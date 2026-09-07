import { Router } from 'express';
import * as tripController from './trip.controller';
import { validate } from '../../middlewares/validate';
import { getTripsSchema } from './trip.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  validate(getTripsSchema),
  tripController.getTrips,
);
router.get(
  '/:id',
  requireRole([Role.ADMIN, Role.DISPATCHER, Role.PATIENT]),
  tripController.getTripById,
);

export const TripRoutes = router;
