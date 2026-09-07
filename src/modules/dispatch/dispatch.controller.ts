import { Request, Response, NextFunction } from 'express';
import * as dispatchService from './dispatch.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const updated = await dispatchService.updateStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json(sendSuccessResponse('Dispatch status updated successfully', updated));
  } catch (error) {
    next(error);
  }
};

export const getDispatchById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dispatch = await dispatchService.getDispatchById(req.params.id);
    res.status(200).json(sendSuccessResponse('Dispatch retrieved successfully', dispatch));
  } catch (error) {
    next(error);
  }
};

export const getMyAssignedDispatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const dispatches = await dispatchService.getMyAssignedDispatches(req.user.id);
    res
      .status(200)
      .json(sendSuccessResponse('Assigned dispatches retrieved successfully', dispatches));
  } catch (error) {
    next(error);
  }
};

export const selectHospital = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const updated = await dispatchService.selectHospital(
      req.params.id,
      req.body.hospitalId,
      req.user.id,
    );
    res.status(200).json(sendSuccessResponse('Hospital selected successfully', updated));
  } catch (error) {
    next(error);
  }
};

export const searchDispatches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await dispatchService.searchDispatches(String(req.query.q));
    res.status(200).json(sendSuccessResponse('Search results retrieved successfully', results));
  } catch (error) {
    next(error);
  }
};
