import { Request, Response, NextFunction } from 'express';
import * as hospitalService from './hospital.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

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
    const result = await hospitalService.getHospitals({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json(sendSuccessResponse('Hospitals retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const searchHospitals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    const result = await hospitalService.searchHospitals({
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json(sendSuccessResponse('Hospitals searched successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getHospitalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hospital = await hospitalService.getHospitalById(req.params.id);
    res.status(200).json(sendSuccessResponse('Hospital retrieved successfully', hospital));
  } catch (error) {
    next(error);
  }
};

export const updateHospitalAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const hospital = await hospitalService.updateHospitalAvailability(
      req.params.id,
      req.body.emergencyAvailable,
      req.user.id,
    );
    res
      .status(200)
      .json(sendSuccessResponse('Hospital availability updated successfully', hospital));
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
