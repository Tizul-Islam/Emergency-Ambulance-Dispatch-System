import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { tripId, provider } = req.body;
    if (!tripId) throw new AppError(400, 'tripId is required');

    const result = await paymentService.initiatePayment(tripId, req.user, provider);
    res.status(200).json(sendSuccessResponse('Payment session initiated successfully', result));
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      throw new AppError(400, 'Missing stripe-signature header');
    }

    // req.body must be the raw Buffer for Stripe to verify the signature
    await paymentService.handleWebhook(req.body, signature as string);

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const payment = await paymentService.getPaymentById(req.params.id, req.user);
    res.status(200).json(sendSuccessResponse('Payment retrieved successfully', payment));
  } catch (error) {
    next(error);
  }
};

export const executeBkashPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentID, status } = req.query;
    if (!paymentID || status !== 'success') {
      throw new AppError(400, 'Invalid bKash callback parameters or payment failed');
    }
    const result = await paymentService.executeBkashPayment(paymentID as string);
    res.status(200).json(sendSuccessResponse('bKash payment executed successfully', result));
  } catch (error) {
    next(error);
  }
};

export const handleSslcommerzSuccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleSslcommerzCallback(req.body, 'SUCCESS');
    res.redirect(`http://localhost:3000/payments/success?tripId=${req.body.value_a}`);
  } catch (error) {
    res.redirect(`http://localhost:3000/payments/fail?tripId=${req.body.value_a}`);
  }
};

export const handleSslcommerzFail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleSslcommerzCallback(req.body, 'FAIL');
    res.redirect(`http://localhost:3000/payments/fail?tripId=${req.body.value_a}`);
  } catch (error) {
    res.redirect(`http://localhost:3000/payments/fail?tripId=${req.body.value_a}`);
  }
};

export const handleSslcommerzCancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleSslcommerzCallback(req.body, 'CANCEL');
    res.redirect(`http://localhost:3000/payments/cancel?tripId=${req.body.value_a}`);
  } catch (error) {
    res.redirect(`http://localhost:3000/payments/cancel?tripId=${req.body.value_a}`);
  }
};

export const handleSslcommerzIpn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.handleSslcommerzCallback(req.body, 'IPN');
    res.status(200).send('IPN Processed');
  } catch (error) {
    res.status(400).send('IPN Failed');
  }
};
