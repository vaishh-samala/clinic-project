export type UrgencyLevel = 'NORMAL' | 'URGENT' | 'RED_FLAG';

export interface TriageAssessment {
  urgency: UrgencyLevel;
  isEmergency: boolean;
  symptomsSummary: string;
  possibleExplanations: string[];
  suggestedQuestionsForDoctor: string[];
  recommendedNextSteps: string[];
  disclaimer: string;
}

export interface AgentAction {
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
}

export interface AgentResponse {
  sessionId: string;
  reply: string;
  urgency: UrgencyLevel;
  assessment?: TriageAssessment;
  actionsExecuted?: AgentAction[];
  suggestedPrompts: string[];
  disclaimer: string;
}

export interface AgentEngine {
  processMessage(
    sessionId: string,
    userMessage: string,
    patientId?: string
  ): Promise<AgentResponse>;
}
