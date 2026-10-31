import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.registerPatient(req.body);
      sendCreated(res, result, 'Patient registered successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, 'Authentication successful');
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }
      const profile = await authService.getMe(req.user.userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
