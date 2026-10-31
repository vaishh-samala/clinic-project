import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';

// Extend Express Request interface to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticateJWT(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Authorization header is missing. Expected Bearer token'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Malformed authorization header. Expected: Bearer <token>'));
  }

  const token = parts[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticateJWT(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      req.user = verifyToken(parts[1]);
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}
