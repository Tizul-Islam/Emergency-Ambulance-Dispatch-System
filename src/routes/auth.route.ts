import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, refreshTokenSchema, logoutSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', validate(logoutSchema), logout);

export const AuthRoutes = router;
