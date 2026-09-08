import { Request, Response, NextFunction } from 'express';
import * as ambulanceService from './ambulance.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';
import { redis } from '../../config';
import { AmbulanceStatus } from '../../generated/prisma/client';

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
    const { status, page, limit } = req.query as any;

    if (status === AmbulanceStatus.AVAILABLE && (!page || page === '1')) {
      const cached = await redis.get('ambulances:available');
      if (cached) {
        return res
          .status(200)
          .json(
            sendSuccessResponse('Ambulances retrieved successfully (cached)', JSON.parse(cached)),
          );
      }
    }

    const result = await ambulanceService.getAmbulances({
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    if (status === AmbulanceStatus.AVAILABLE && (!page || page === '1')) {
      await redis.set('ambulances:available', JSON.stringify(result), 'EX', 10);
    }

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

export const getAmbulanceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulance = await ambulanceService.getAmbulanceById(req.params.id);
    res.status(200).json(sendSuccessResponse('Ambulance retrieved successfully', ambulance));
  } catch (error) {
    next(error);
  }
};

export const getAvailableAmbulances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ambulances = await ambulanceService.getAvailableAmbulances();
    res.status(200).json(sendSuccessResponse('Available ambulances retrieved successfully', ambulances));
  } catch (error) {
    next(error);
  }
};

export const searchAmbulances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    const result = await ambulanceService.searchAmbulances({
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json(sendSuccessResponse('Ambulances searched successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getNearestAmbulance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const result = await ambulanceService.getNearestAmbulance(lat, lng);
    res.status(200).json(sendSuccessResponse('Nearest ambulance retrieved', result));
  } catch (error) {
    next(error);
  }
};
