import Stripe from 'stripe';
import { PrismaClient, PaymentStatus, PaymentProvider, Role } from '../../generated/prisma/client';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../audit/audit.service';
import { createNotification } from '../notification/notification.service';
// @ts-ignore
import SSLCommerzPayment from 'sslcommerz-lts';
import prisma from '../../utils/prisma';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-08-26.dahlia' as any,
});

const sslcz = new SSLCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID || '',
  process.env.SSLCOMMERZ_STORE_PASSWORD || '',
  process.env.SSLCOMMERZ_IS_LIVE === 'true',
);

export const initiatePayment = async (
  tripId: string,
  currentUser: { id: string; role: Role },
  provider: PaymentProvider = PaymentProvider.STRIPE,
) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      emergencyRequest: {
        include: { patient: true },
      },
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
  } else if (provider === PaymentProvider.SSLCOMMERZ) {
    const transactionIdVal = `AMB-${trip.id.substring(0, 8)}-${Date.now()}`;
    transactionId = transactionIdVal;

    const data = {
      total_amount: trip.fare,
      currency: 'BDT',
      tran_id: transactionIdVal,
      success_url: `http://localhost:5000/api/v1/payments/sslcommerz/success`,
      fail_url: `http://localhost:5000/api/v1/payments/sslcommerz/fail`,
      cancel_url: `http://localhost:5000/api/v1/payments/sslcommerz/cancel`,
      ipn_url: `http://localhost:5000/api/v1/payments/sslcommerz/ipn`,
      shipping_method: 'No',
      product_name: `Ambulance Trip - ${trip.ambulance.registrationNumber}`,
      product_category: 'Emergency Service',
      product_profile: 'general',
      cus_name: trip.emergencyRequest.patient.name || 'Unknown',
      cus_email: trip.emergencyRequest.patient.email || 'patient@example.com',
      cus_add1: trip.emergencyRequest.pickupAddress || 'Dhaka',
      cus_add2: 'N/A',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: trip.emergencyRequest.patient.phone || '01700000000',
      cus_fax: '01700000000',
      ship_name: 'N/A',
      ship_add1: 'N/A',
      ship_add2: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      value_a: trip.id,
    };

    const apiResponse = await sslcz.init(data).catch((err: any) => {
      console.error('[SSLCOMMERZ INIT ERROR]', {
        message: err.message,
        status: err.status || err.statusCode,
        transactionId: transactionIdVal,
        isLive: process.env.SSLCOMMERZ_IS_LIVE === 'true',
      });
      return null;
    });

    if (!apiResponse?.GatewayPageURL) {
      console.error(
        '[SSLCOMMERZ INIT FAILED] GatewayPageURL missing in response:',
        apiResponse,
        'TransactionID:',
        transactionIdVal,
      );
      throw new AppError(500, 'Failed to initialize SSLCOMMERZ gateway');
    }
    sessionUrl = apiResponse.GatewayPageURL;
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

export const handleSslcommerzCallback = async (
  body: any,
  status: 'SUCCESS' | 'FAIL' | 'CANCEL' | 'IPN',
) => {
  const { val_id, tran_id, status: gatewayStatus, amount, currency, value_a: tripId } = body;

  if (!tran_id || !tripId) throw new AppError(400, 'Invalid callback payload');

  const payment = await prisma.payment.findFirst({
    where: { tripId, transactionId: tran_id, provider: PaymentProvider.SSLCOMMERZ },
    include: { trip: { include: { emergencyRequest: true } } },
  });

  if (!payment) throw new AppError(404, 'Payment not found');
  if (payment.status === PaymentStatus.SUCCESS) return payment;

  if (status === 'SUCCESS' || status === 'IPN') {
    if (gatewayStatus !== 'VALID' && gatewayStatus !== 'VALIDATED') {
      throw new AppError(400, 'Invalid gateway status');
    }
    if (!val_id) throw new AppError(400, 'Validation ID missing');

    const validation = await sslcz.validate({ val_id });
    if (validation?.status !== 'VALID' && validation?.status !== 'VALIDATED') {
      throw new AppError(400, 'Validation failed');
    }
    if (Number(validation.amount) !== payment.amount || validation.currency !== payment.currency) {
      throw new AppError(400, 'Amount or currency mismatch');
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
    });

    await logAudit(
      payment.patientId,
      'SSLCOMMERZ_PAYMENT_SUCCESS',
      'Payment',
      payment.id,
      payment.status,
      PaymentStatus.SUCCESS,
    );

    await createNotification(
      payment.trip.emergencyRequest.patientId,
      'Payment Successful',
      'PAYMENT_UPDATE',
      'Your SSLCOMMERZ payment was successful.',
    );
    return updated;
  } else if (status === 'FAIL' || status === 'CANCEL') {
    const finalStatus = status === 'CANCEL' ? PaymentStatus.CANCELLED : PaymentStatus.FAILED;
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: finalStatus },
    });

    await logAudit(
      payment.patientId,
      `SSLCOMMERZ_PAYMENT_${status}`,
      'Payment',
      payment.id,
      payment.status,
      finalStatus,
    );
    return updated;
  }
};
