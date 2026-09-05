import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccessResponse } from '../utils/responseHelper';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerService(req.body);
    res.status(201).json(sendSuccessResponse('User registered successfully', user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.loginService(req.body);
    res.status(200).json(sendSuccessResponse('Logged in successfully', data));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tokens = await authService.refreshTokenService(req.body.refreshToken);
    res.status(200).json(sendSuccessResponse('Token refreshed successfully', tokens));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logoutService(req.body.refreshToken);
    res.status(200).json(sendSuccessResponse('Logged out successfully', null));
  } catch (error) {
    next(error);
  }
};
