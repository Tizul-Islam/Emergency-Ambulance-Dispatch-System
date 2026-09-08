import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  authUser?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as {
      id: string;
      role: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, email: true, isActive: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new AppError(401, 'User not found');
    }

    if (!user.isActive) {
      throw new AppError(403, 'User account is inactive');
    }

    req.authUser = {
      id: user.id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return next(new AppError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.authUser.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }

    next();
  };
};
