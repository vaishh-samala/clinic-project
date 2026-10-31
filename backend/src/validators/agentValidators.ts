import { z } from 'zod';

export const agentChatSchema = z.object({
  sessionId: z.string().optional().default('default-session'),
  message: z.string().min(1, 'Message content cannot be empty').max(2000),
  patientId: z.string().optional(),
});

export const sessionParamSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export type AgentChatInput = z.infer<typeof agentChatSchema>;
