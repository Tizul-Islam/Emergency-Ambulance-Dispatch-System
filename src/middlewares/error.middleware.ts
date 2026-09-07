import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';

/**
 * Global error middleware.
 * Maps Zod / Prisma / JWT / AppError / Unknown → standard error envelope.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error('Error:', err.name, err.message);

  // Zod validation
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field:
        e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') ||
        e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json(errorResponse('Validation failed', errors));
  }

  // Also catch ZodError shaped as plain object (some wrappers)
  if (err.name === 'ZodError' && (err as any).issues) {
    const errors = (err as any).issues.map((issue: any) => ({
      field: Array.isArray(issue.path)
        ? issue.path.filter((p: string) => !['body', 'query', 'params'].includes(p)).join('.')
        : 'unknown',
      message: issue.message,
    }));
    return res.status(400).json(errorResponse('Validation failed', errors));
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return res
        .status(409)
        .json(errorResponse(`A record with this unique ${target} already exists`));
    }
    if (err.code === 'P2025') {
      return res.status(404).json(errorResponse('Record not found'));
    }
    if (err.code === 'P2003') {
      return res.status(400).json(errorResponse('Foreign key constraint failed'));
    }
    return res.status(400).json(errorResponse(`Database error: ${err.code}`));
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json(errorResponse('Invalid data provided'));
  }

  // Custom operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message));
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token'));
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired'));
  }

  // Unknown
  return res.status(500).json(errorResponse('Internal server error'));
};

/** Alias used by app.ts */
export const globalErrorHandler = errorHandler;
