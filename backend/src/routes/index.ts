import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { doctorRouter } from './doctorRoutes.js';
import { appointmentRouter } from './appointmentRoutes.js';
import { agentRouter } from './agentRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/doctors', doctorRouter);
apiRouter.use('/appointments', appointmentRouter);
apiRouter.use('/agent', agentRouter);

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Clinic AI Agent API',
    version: '1.0.0',
  });
});
