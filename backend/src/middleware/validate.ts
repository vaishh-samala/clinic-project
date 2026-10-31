import type { Request, Response, NextFunction } from 'express';
import { type ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validateBody(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }));
        next(new ValidationError('Invalid request body payload', issues));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as Request['query'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }));
        next(new ValidationError('Invalid query parameters', issues));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as Request['params'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }));
        next(new ValidationError('Invalid route parameters', issues));
      } else {
        next(error);
      }
    }
  };
}
