import { Router, Request, Response } from 'express';
import { sendSuccessResponse } from '../utils/responseHelper';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json(sendSuccessResponse('Server is healthy and running'));
});

export const HealthRoutes = router;
