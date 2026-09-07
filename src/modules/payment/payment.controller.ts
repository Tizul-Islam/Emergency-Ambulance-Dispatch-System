import { Request, Response, NextFunction } from 'express';
import * as paymentService from './payment.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { tripId } = req.body;
    if (!tripId) throw new AppError(400, 'tripId is required');

    const result = await paymentService.initiatePayment(tripId, req.user.id);
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
