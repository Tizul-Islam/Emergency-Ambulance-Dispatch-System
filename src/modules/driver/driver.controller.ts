import { Request, Response, NextFunction } from 'express';
import * as driverService from './driver.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const createDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(sendSuccessResponse('Driver created successfully', driver));
  } catch (error) {
    next(error);
  }
};

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = req.query as any;
    const result = await driverService.getDrivers({ status, page, limit });
    res.status(200).json(sendSuccessResponse('Drivers retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const updateDriverStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const driver = await driverService.updateDriverStatus(
      req.params.id,
      req.body.status,
      req.user.id,
    );
    res.status(200).json(sendSuccessResponse('Driver status updated successfully', driver));
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const driver = await driverService.updateDriver(req.params.id, req.body, req.user.id);
    res.status(200).json(sendSuccessResponse('Driver updated successfully', driver));
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    await driverService.deleteDriver(req.params.id, req.user.id);
    res.status(200).json(sendSuccessResponse('Driver deleted successfully', null));
  } catch (error) {
    next(error);
  }
};
