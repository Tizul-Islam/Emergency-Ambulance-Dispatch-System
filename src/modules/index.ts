import { Router } from 'express';
import { HealthRoutes } from './health/health.route';
import { AuthRoutes } from './auth/auth.route';
import { RequestRoutes } from './request/request.route';
import { AmbulanceRoutes } from './ambulance/ambulance.route';
import { DispatchRoutes } from './dispatch/dispatch.route';
import { HospitalRoutes } from './hospital/hospital.route';
import { PaymentRoutes } from './payment/payment.route';
import { NotificationRoutes } from './notification/notification.route';
import { AdminRoutes } from './admin/admin.route';
import { DriverRoutes } from './driver/driver.route';
import { UserRoutes } from './user/user.route';
import { TripRoutes } from './trip/trip.route';

const router = Router();

router.use('/health', HealthRoutes);
router.use('/auth', AuthRoutes);
router.use('/requests', RequestRoutes);
router.use('/emergency-requests', RequestRoutes);
router.use('/ambulances', AmbulanceRoutes);
router.use('/dispatches', DispatchRoutes);
router.use('/hospitals', HospitalRoutes);
router.use('/payments', PaymentRoutes);
router.use('/notifications', NotificationRoutes);
router.use('/admin', AdminRoutes);
router.use('/drivers', DriverRoutes);
router.use('/users', UserRoutes);
router.use('/trips', TripRoutes);

export default router;
