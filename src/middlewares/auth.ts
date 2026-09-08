import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '../generated/prisma/client';
import { AppError } from '../utils/AppError';

import prisma from '../utils/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError(401, 'You are not logged in. Please log in to get access.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as any;

    const currentUser = await prisma.user.findFirst({
      where: { id: decoded.id, deletedAt: null, isActive: true },
    });

    if (!currentUser) {
      return next(new AppError(401, 'The user belonging to this token does no longer exist.'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError(401, 'Invalid token or token has expired'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
};
