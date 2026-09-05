import { Router } from 'express';
import * as ambulanceController from '../controllers/ambulance.controller';
import { validate } from '../middlewares/validate';
import { createAmbulanceSchema, getAmbulancesSchema, updateAmbulanceSchema } from '../validations/ambulance.validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole([Role.ADMIN]), validate(createAmbulanceSchema), ambulanceController.createAmbulance);
router.get('/', requireRole([Role.ADMIN, Role.DISPATCHER]), validate(getAmbulancesSchema), ambulanceController.getAmbulances);
router.patch('/:id', requireRole([Role.ADMIN]), validate(updateAmbulanceSchema), ambulanceController.updateAmbulance);
router.delete('/:id', requireRole([Role.ADMIN]), ambulanceController.deleteAmbulance);

export const AmbulanceRoutes = router;
