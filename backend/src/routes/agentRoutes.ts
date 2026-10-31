import { Router } from 'express';
import { agentController } from '../controllers/agentController.js';
import { optionalAuthenticateJWT } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { agentChatSchema, sessionParamSchema } from '../validators/agentValidators.js';

export const agentRouter = Router();

agentRouter.post('/chat', optionalAuthenticateJWT, validateBody(agentChatSchema), agentController.chat);
agentRouter.get('/conversations/:sessionId', validateParams(sessionParamSchema), agentController.getConversation);
