import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Handle syntax/parsing errors (e.g. malformed JSON in request body)
  if ('type' in err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_JSON',
        message: 'Malformed JSON payload in request body',
      },
    });
  }

  // Fallback for unhandled unexpected server errors
  console.error('Unhandled Server Error:', err);

  const isDev = env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      ...(isDev ? { stack: err.stack, rawMessage: err.message } : {}),
    },
  });
}
