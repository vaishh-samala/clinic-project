import type { Request, Response, NextFunction } from 'express';
import { agentService } from '../agent/agentService.js';
import { conversationService } from '../services/conversationService.js';
import { sendSuccess } from '../utils/response.js';

export class AgentController {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, message, patientId } = req.body;
      const effectivePatientId = req.user?.patientId ?? patientId;

      const agentReply = await agentService.processMessage(sessionId, message, effectivePatientId);
      sendSuccess(res, agentReply);
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await conversationService.getConversationBySessionId(req.params.sessionId);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
}

export const agentController = new AgentController();
