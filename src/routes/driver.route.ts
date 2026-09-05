import { Router } from 'express';
import * as driverController from '../controllers/driver.controller';
import { validate } from '../middlewares/validate';
import { createDriverSchema, getDriversSchema, updateDriverStatusSchema, updateDriverSchema } from '../validations/driver.validation';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole([Role.ADMIN]), validate(createDriverSchema), driverController.createDriver);
router.get('/', requireRole([Role.ADMIN, Role.DISPATCHER]), validate(getDriversSchema), driverController.getDrivers);
router.patch('/:id/status', requireRole([Role.ADMIN, Role.DISPATCHER]), validate(updateDriverStatusSchema), driverController.updateDriverStatus);
router.patch('/:id', requireRole([Role.ADMIN]), validate(updateDriverSchema), driverController.updateDriver);
router.delete('/:id', requireRole([Role.ADMIN]), driverController.deleteDriver);

export const DriverRoutes = router;
