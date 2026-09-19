import { Request, Response, NextFunction } from 'express';
import * as requestService from './request.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';

export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const request = await requestService.createRequest(req.body, req.user.id);
    res.status(201).json(sendSuccessResponse('Emergency request created successfully', request));
  } catch (error) {
    next(error);
  }
};

export const getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, priority, page, limit, sortBy } = req.query as any;
    const result = await requestService.getAllRequests({
      status,
      priority,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sortBy,
    });
    res.status(200).json(sendSuccessResponse('Requests retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getQueue();
    res.status(200).json(sendSuccessResponse('Queue retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { page, limit } = req.query as any;
    const result = await requestService.getMyRequests(req.user.id, Number(page) || 1, Number(limit) || 10);
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

export const updateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const request = await requestService.updateRequest(req.params.id, req.user.id, req.body);
    res.status(200).json(sendSuccessResponse('Request updated successfully', request));
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    await requestService.deleteRequest(req.params.id, req.user.id, req.user.role as any);
    res.status(200).json(sendSuccessResponse('Request deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const searchRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    const result = await requestService.searchRequests({
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json(sendSuccessResponse('Requests searched successfully', result));
  } catch (error) {
    next(error);
  }
};

export const updatePriority = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { priority } = req.body;
    const request = await requestService.updatePriority(req.params.id, priority, req.user.id);
    res.status(200).json(sendSuccessResponse('Priority updated successfully', request));
  } catch (error) {
    next(error);
  }
};

export const assignRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { ambulanceId } = req.body;
    const dispatch = await requestService.assignRequest(req.params.id, req.user.id, ambulanceId);
    res.status(200).json(sendSuccessResponse('Request assigned successfully', dispatch));
  } catch (error) {
    next(error);
  }
};
