import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerDocument } from './config/swaggerSpec.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

export function createApp(): Application {
  const app = express();

  // 1. Security & HTTP Header Hardening
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI inline assets in dev
    })
  );

  // 2. Cross-Origin Resource Sharing
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        // Allow requests with no origin (e.g. mobile apps, curl, postman)
        if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        callback(new Error('CORS origin blocked by security policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Rate Limiting
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests from this IP address, please try again later',
      },
    },
  });
  app.use('/api/', limiter);

  // 5. Interactive Swagger / OpenAPI Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // 6. API Info & Status endpoint
  app.get('/api', (_req, res) => {
    res.json({
      name: 'Clinic AI Agent API',
      version: '1.0.0',
      description: 'Production-ready backend for Clinic AI Agent system',
      docs: '/api/docs',
      health: '/api/health',
    });
  });

  // 7. Mount Core API Router
  app.use('/api', apiRouter);

  // 8. 404 Route Handler for unmatched API routes
  app.use('/api/*', (req, _res, next) => {
    next(new NotFoundError(`API endpoint not found: [${req.method}] ${req.originalUrl}`));
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
