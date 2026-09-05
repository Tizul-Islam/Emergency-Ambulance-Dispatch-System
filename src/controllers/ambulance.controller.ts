import { Request, Response, NextFunction } from 'express';
import * as ambulanceService from '../services/ambulance.service';
import { sendSuccessResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export const createAmbulance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulance = await ambulanceService.createAmbulance(req.body);
    res.status(201).json(sendSuccessResponse('Ambulance created successfully', ambulance));
  } catch (error) {
    next(error);
  }
};

export const getAmbulances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, type, page, limit } = req.query as any;
    const result = await ambulanceService.getAmbulances({ status, type, page, limit });
    res.status(200).json(sendSuccessResponse('Ambulances retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const updateAmbulance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const ambulance = await ambulanceService.updateAmbulance(req.params.id, req.body, req.user.id);
    res.status(200).json(sendSuccessResponse('Ambulance updated successfully', ambulance));
  } catch (error) {
    next(error);
  }
};

export const deleteAmbulance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    await ambulanceService.deleteAmbulance(req.params.id, req.user.id);
    res.status(200).json(sendSuccessResponse('Ambulance deleted successfully', null));
  } catch (error) {
    next(error);
  }
};
