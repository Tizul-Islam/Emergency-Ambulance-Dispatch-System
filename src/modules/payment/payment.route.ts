import express, { Router } from 'express';
import * as paymentController from './payment.controller';
import { validate } from '../../middlewares/validate';
import { initiatePaymentSchema, getPaymentSchema } from './payment.validation';
import { authenticate, requireRole } from '../../middlewares/auth';
import { Role } from '../../generated/prisma/client';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

router.post('/sslcommerz/success', paymentController.handleSslcommerzSuccess);
router.post('/sslcommerz/fail', paymentController.handleSslcommerzFail);
router.post('/sslcommerz/cancel', paymentController.handleSslcommerzCancel);
router.post('/sslcommerz/ipn', paymentController.handleSslcommerzIpn);

router.use(authenticate);

router.post(
  '/initiate',
  requireRole([Role.PATIENT]),
  validate(initiatePaymentSchema),
  paymentController.initiatePayment,
);
router.get(
  '/:id',
  requireRole([Role.PATIENT, Role.ADMIN]),
  validate(getPaymentSchema),
  paymentController.getPaymentById,
);

router.get(
  '/bkash/execute',
  requireRole([Role.PATIENT, Role.ADMIN]),
  paymentController.executeBkashPayment,
);

export const PaymentRoutes = router;
