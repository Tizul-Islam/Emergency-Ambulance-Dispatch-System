import { Request, Response, NextFunction } from 'express';
import * as tripService from './trip.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit, sortBy } = req.query as any;
    const result = await tripService.getTrips({
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortBy,
    });
    res.status(200).json(sendSuccessResponse('Trips retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const trip = await tripService.getTripById(req.params.id, req.user);
    res.status(200).json(sendSuccessResponse('Trip retrieved successfully', trip));
  } catch (error) {
    next(error);
  }
};
