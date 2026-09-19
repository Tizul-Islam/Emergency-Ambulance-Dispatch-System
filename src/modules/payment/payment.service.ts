import Stripe from 'stripe';
import { PrismaClient, PaymentStatus, PaymentProvider, Role } from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';
import { createNotification } from '../notification/notification.service';

import prisma from '../../utils/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-08-26.dahlia' as any,
});

export const initiatePayment = async (tripId: string, currentUser: { id: string; role: Role }, provider: PaymentProvider = PaymentProvider.STRIPE) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      emergencyRequest: true,
      payment: true,
      ambulance: true,
    },
  });

  if (!trip) throw new AppError(404, 'Trip not found');
  if (currentUser.role === Role.PATIENT && trip.emergencyRequest.patientId !== currentUser.id) {
    throw new AppError(403, 'You do not have permission to pay for this trip');
  }

  const patientUserId = trip.emergencyRequest.patientId;
  if (!trip.fare) {
    throw new AppError(400, 'Trip fare has not been calculated yet');
  }
  if (trip.payment && trip.payment.status === PaymentStatus.SUCCESS) {
    throw new AppError(400, 'This trip has already been paid for');
  }

  let sessionUrl = '';
  let transactionId = '';

  if (provider === PaymentProvider.STRIPE) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `Emergency Ambulance Trip - ${trip.ambulance.registrationNumber}`,
            },
            unit_amount: Math.round(trip.fare * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5000/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/api/v1/payments/cancel`,
      metadata: {
        tripId: trip.id,
      },
    });
    sessionUrl = session.url || '';
    transactionId = session.id;
  } else if (provider === PaymentProvider.BKASH) {
    // bKash Skeleton logic
    // 1. Get Grant Token
    // 2. Create Payment
    // For demonstration, mocking the bKash checkout URL as it requires valid merchant credentials
    const mockBkashTxId = `BKASH_TX_${Date.now()}`;
    transactionId = mockBkashTxId;
    sessionUrl = `https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/payment/create?paymentID=${mockBkashTxId}`;
  } else {
    throw new AppError(400, 'Unsupported payment provider');
  }

  const payment = await prisma.payment.upsert({
    where: { tripId: trip.id },
    update: {
      amount: trip.fare,
      provider: provider,
      transactionId: transactionId,
      paymentUrl: sessionUrl,
      status: PaymentStatus.PENDING,
    },
    create: {
      tripId: trip.id,
      patientId: patientUserId,
      amount: trip.fare,
      currency: 'BDT',
      provider: provider,
      transactionId: transactionId,
      paymentUrl: sessionUrl,
      status: PaymentStatus.PENDING,
    },
  });

  await logAudit(
    patientUserId,
    'INITIATE_PAYMENT',
    'Payment',
    payment.id,
    null,
    PaymentStatus.PENDING,
  );

  return { url: sessionUrl, paymentId: payment.id };
};

export const handleWebhook = async (rawBody: Buffer, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError(500, 'Stripe webhook secret is not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new AppError(400, `Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const tripId = session.metadata?.tripId;

    if (tripId) {
      const payment = await prisma.payment.update({
        where: { tripId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
        },
        include: { trip: { include: { emergencyRequest: true } } },
      });
      await logAudit(
        payment.patientId,
        'WEBHOOK_PAYMENT_SUCCESS',
        'Payment',
        payment.id,
        PaymentStatus.PENDING,
        PaymentStatus.SUCCESS,
      );
      await createNotification(
        payment.trip.emergencyRequest.patientId,
        'Payment Successful',
        'PAYMENT_UPDATE',
        'Your payment was successful.',
      );
    }
  } else if (
    event.type === 'checkout.session.async_payment_failed' ||
    event.type === 'checkout.session.expired'
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const tripId = session.metadata?.tripId;

    if (tripId) {
      const payment = await prisma.payment.update({
        where: { tripId },
        data: {
          status: PaymentStatus.FAILED,
        },
        include: { trip: { include: { emergencyRequest: true } } },
      });
      await logAudit(
        payment.patientId,
        'WEBHOOK_PAYMENT_FAILED',
        'Payment',
        payment.id,
        PaymentStatus.PENDING,
        PaymentStatus.FAILED,
      );
      await createNotification(
        payment.trip.emergencyRequest.patientId,
        'Payment Failed',
        'PAYMENT_UPDATE',
        'Your payment has failed.',
      );
    }
  }

  return { received: true };
};

export const getPaymentById = async (id: string, user: { id: string; role: Role }) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { trip: { include: { emergencyRequest: true, ambulance: true } } },
  });

  if (!payment) throw new AppError(404, 'Payment not found');

  if (user.role === Role.PATIENT && payment.patientId !== user.id) {
    throw new AppError(403, 'You do not have permission to view this payment');
  }

  return payment;
};

export const executeBkashPayment = async (paymentID: string) => {
  // Mock bKash execution logic
  // In production, you would call bKash execute API and verify the transaction
  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentID, provider: PaymentProvider.BKASH },
    include: { trip: { include: { emergencyRequest: true } } },
  });

  if (!payment) {
    throw new AppError(404, 'bKash payment record not found');
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return payment; // Already successful
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.SUCCESS,
      paidAt: new Date(),
    },
    include: { trip: { include: { emergencyRequest: true } } },
  });

  await logAudit(
    updatedPayment.patientId,
    'BKASH_PAYMENT_SUCCESS',
    'Payment',
    updatedPayment.id,
    PaymentStatus.PENDING,
    PaymentStatus.SUCCESS,
  );

  await createNotification(
    updatedPayment.trip.emergencyRequest.patientId,
    'bKash Payment Successful',
    'PAYMENT_UPDATE',
    'Your bKash payment was successful.',
  );

  return updatedPayment;
};
