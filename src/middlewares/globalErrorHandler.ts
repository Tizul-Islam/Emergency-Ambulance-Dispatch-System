import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/responseHelper';
import { AppError } from '../utils/AppError';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err?.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Handle specific errors like ZodValidation, Mongoose errors, etc. here if needed

  res.status(statusCode).json(sendErrorResponse(message, errors));
};
