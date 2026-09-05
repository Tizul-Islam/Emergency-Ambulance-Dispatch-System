import { Router } from 'express';
import { HealthRoutes } from './health.route';
import { AuthRoutes } from './auth.route';
import { UserRoutes } from './user.route';
import { AmbulanceRoutes } from './ambulance.route';
import { DriverRoutes } from './driver.route';
import { HospitalRoutes } from './hospital.route';
import { RequestRoutes } from './request.route';

const router = Router();

router.use('/health', HealthRoutes);
router.use('/auth', AuthRoutes);
router.use('/users', UserRoutes);
router.use('/ambulances', AmbulanceRoutes);
router.use('/drivers', DriverRoutes);
router.use('/hospitals', HospitalRoutes);
router.use('/requests', RequestRoutes);

export default router;
