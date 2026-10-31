import { inMemoryDb, type DbConversation, type DbMessage } from './db.js';
import { NotFoundError } from '../utils/errors.js';

export class ConversationService {
  /**
   * Get or create a conversation record by unique sessionId
   */
  async getOrCreateConversation(sessionId: string, patientId?: string): Promise<DbConversation> {
    let conversation = inMemoryDb.conversations.get(sessionId);

    if (!conversation) {
      conversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sessionId,
        patientId: patientId ?? null,
        title: 'Clinic Agent Consultation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDb.conversations.set(sessionId, conversation);
    } else if (patientId && !conversation.patientId) {
      conversation.patientId = patientId;
      conversation.updatedAt = new Date();
      inMemoryDb.conversations.set(sessionId, conversation);
    }

    return conversation;
  }

  /**
   * Add a message to an active conversation
   */
  async appendMessage(
    conversationId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<DbMessage> {
    const message: DbMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      role,
      content,
      metadata: metadata ?? null,
      createdAt: new Date(),
    };

    inMemoryDb.messages.set(message.id, message);
    return message;
  }

  /**
   * Retrieve full conversation history by sessionId
   */
  async getConversationBySessionId(sessionId: string) {
    const conversation = inMemoryDb.conversations.get(sessionId);
    if (!conversation) {
      throw new NotFoundError(`No conversation session found with ID '${sessionId}'`);
    }

    const messages = Array.from(inMemoryDb.messages.values())
      .filter((m) => m.conversationId === conversation.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return {
      id: conversation.id,
      sessionId: conversation.sessionId,
      patientId: conversation.patientId,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        metadata: m.metadata,
        createdAt: m.createdAt,
      })),
    };
  }
}

export const conversationService = new ConversationService();
