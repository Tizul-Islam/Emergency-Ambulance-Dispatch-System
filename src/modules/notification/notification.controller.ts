import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { page, limit } = req.query as any;
    const result = await notificationService.getMyNotifications(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
    );
    res.status(200).json(sendSuccessResponse('Notifications retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json(sendSuccessResponse('Notification marked as read', notification));
  } catch (error) {
    next(error);
  }
};
