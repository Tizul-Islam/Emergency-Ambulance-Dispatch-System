import { Request, Response, NextFunction } from 'express';
import * as requestService from '../services/request.service';
import { sendSuccessResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const request = await requestService.createRequest(req.body, req.user.id);
    res.status(201).json(sendSuccessResponse('Emergency request created successfully', request));
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { page, limit } = req.query as any;
    const result = await requestService.getMyRequests(req.user.id, page, limit);
    res.status(200).json(sendSuccessResponse('My requests retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const request = await requestService.getRequestById(req.params.id, req.user);
    res.status(200).json(sendSuccessResponse('Request retrieved successfully', request));
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const request = await requestService.cancelRequest(req.params.id, req.user.id);
    res.status(200).json(sendSuccessResponse('Request cancelled successfully', request));
  } catch (error) {
    next(error);
  }
};
