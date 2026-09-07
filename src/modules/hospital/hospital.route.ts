import { Router } from 'express';
import * as hospitalController from './hospital.controller';
import { validate } from '../../middlewares/validate';
import {
  createHospitalSchema,
  getHospitalsSchema,
  updateHospitalAvailabilitySchema,
  updateHospitalSchema,
  searchHospitalsSchema,
} from './hospital.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  requireRole([Role.ADMIN]),
  validate(createHospitalSchema),
  hospitalController.createHospital,
);
router.get(
  '/',
  requireRole([Role.ADMIN, Role.DISPATCHER, Role.PATIENT]),
  validate(getHospitalsSchema),
  hospitalController.getHospitals,
);
router.get(
  '/search',
  requireRole([Role.ADMIN, Role.DISPATCHER, Role.PATIENT]),
  validate(searchHospitalsSchema),
  hospitalController.searchHospitals,
);
router.get(
  '/:id',
  requireRole([Role.ADMIN, Role.DISPATCHER, Role.PATIENT]),
  hospitalController.getHospitalById,
);
router.patch(
  '/:id/availability',
  requireRole([Role.ADMIN, Role.DISPATCHER]),
  validate(updateHospitalAvailabilitySchema),
  hospitalController.updateHospitalAvailability,
);
router.patch(
  '/:id',
  requireRole([Role.ADMIN]),
  validate(updateHospitalSchema),
  hospitalController.updateHospital,
);
router.delete('/:id', requireRole([Role.ADMIN]), hospitalController.deleteHospital);

export const HospitalRoutes = router;
