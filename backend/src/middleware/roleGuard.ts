import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}
