import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError(401, 'User not authenticated'));
    }
    const profile = await userService.getProfile(req.user.id);
    res.status(200).json(sendSuccessResponse('Profile retrieved successfully', profile));
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError(401, 'User not authenticated'));
    }
    const profile = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json(sendSuccessResponse('Profile updated successfully', profile));
  } catch (error) {
    next(error);
  }
};
