import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { registerPatientSchema, loginSchema } from '../validators/authValidators.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerPatientSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
authRouter.get('/me', authenticateJWT, authController.getMe);
