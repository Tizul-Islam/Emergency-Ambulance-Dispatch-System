import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { sendSuccessResponse } from '../../utils/responseHelper';
import { AppError } from '../../utils/AppError';
import { Role, RequestPriority } from '../../generated/prisma/client';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, page, limit } = req.query as any;
    const result = await adminService.getUsers(
      role as Role,
      Number(page) || 1,
      Number(limit) || 10,
    );
    res.status(200).json(sendSuccessResponse('Users retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    if (!q) throw new AppError(400, 'Search keyword is required');
    const result = await adminService.searchUsers({
      q,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });
    res.status(200).json(sendSuccessResponse('Users searched successfully', result));
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError(401, 'Unauthenticated');
    const { role } = req.body;
    if (!role) throw new AppError(400, 'role is required');
    const updated = await adminService.changeUserRole(req.params.id, role as Role, req.user.id);
    res.status(200).json(sendSuccessResponse('User role updated successfully', updated));
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(sendSuccessResponse('Dashboard stats retrieved successfully', stats));
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityType, page, limit } = req.query as any;
    const result = await adminService.getAuditLogs(
      entityType,
      Number(page) || 1,
      Number(limit) || 10,
    );
    res.status(200).json(sendSuccessResponse('Audit logs retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

export const getIncidentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, priority, page, limit } = req.query as any;
    const result = await adminService.getIncidentHistory(
      dateFrom,
      dateTo,
      priority as RequestPriority,
      Number(page) || 1,
      Number(limit) || 10,
    );
    res.status(200).json(sendSuccessResponse('Incident history retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};
