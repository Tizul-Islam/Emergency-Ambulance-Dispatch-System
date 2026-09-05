import { Router } from 'express';
import * as hospitalController from '../controllers/hospital.controller';
import { validate } from '../middlewares/validate';
import { createHospitalSchema, getHospitalsSchema, updateHospitalBedsSchema, updateHospitalSchema } from '../validations/hospital.validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole([Role.ADMIN]), validate(createHospitalSchema), hospitalController.createHospital);
// GET allows all authenticated roles (ADMIN, DISPATCHER, CALLER)
router.get('/', requireRole([Role.ADMIN, Role.DISPATCHER, Role.CALLER]), validate(getHospitalsSchema), hospitalController.getHospitals);
router.patch('/:id/bed-availability', requireRole([Role.ADMIN, Role.DISPATCHER]), validate(updateHospitalBedsSchema), hospitalController.updateHospitalBeds);
router.patch('/:id', requireRole([Role.ADMIN]), validate(updateHospitalSchema), hospitalController.updateHospital);
router.delete('/:id', requireRole([Role.ADMIN]), hospitalController.deleteHospital);

export const HospitalRoutes = router;
