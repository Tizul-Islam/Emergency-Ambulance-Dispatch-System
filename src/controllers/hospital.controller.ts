import { Request, Response, NextFunction } from 'express';
import * as hospitalService from '../services/hospital.service';
import { sendSuccessResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export const createHospital = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hospital = await hospitalService.createHospital(req.body);
    res.status(201).json(sendSuccessResponse('Hospital created successfully', hospital));
  } catch (error) {
    next(error);
  }
};

export const getHospitals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const result = await hospitalService.getHospitals({ page, limit });
    res.status(200).json(sendSuccessResponse('Hospitals retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const updateHospitalBeds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const hospital = await hospitalService.updateHospitalBeds(req.params.id, req.body, req.user.id);
    res.status(200).json(sendSuccessResponse('Hospital beds updated successfully', hospital));
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const hospital = await hospitalService.updateHospital(req.params.id, req.body, req.user.id);
    res.status(200).json(sendSuccessResponse('Hospital updated successfully', hospital));
  } catch (error) {
    next(error);
  }
};

export const deleteHospital = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    await hospitalService.deleteHospital(req.params.id, req.user.id);
    res.status(200).json(sendSuccessResponse('Hospital deleted successfully', null));
  } catch (error) {
    next(error);
  }
};

