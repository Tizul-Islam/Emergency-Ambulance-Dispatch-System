import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './modules';
import { errorHandler } from './middlewares/error.middleware';
import { AppError } from './utils/AppError';
import { setupSwagger } from './swagger';

const app = express(); 
setupSwagger(app);

// Middlewares
app.use(helmet());
app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: process.env.NODE_ENV === 'production' ? 100 : 5000, // Relax limits in development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Application Routes
app.use('/api/v1', routes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Emergency Ambulance Dispatch System API',
  });
});

// Not Found Handler
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
