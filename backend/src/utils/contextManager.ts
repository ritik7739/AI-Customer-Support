import { Message } from '../types';

export class ContextManager {
  private readonly MAX_CONTEXT_TOKENS = 4000;
  private readonly TOKENS_PER_MESSAGE = 100; // Rough estimate

  /**
   * Compact conversation history when approaching token limit
   * Keeps most recent messages and system context
   */
  compactHistory(messages: Message[], maxMessages: number = 10): Message[] {
    if (messages.length <= maxMessages) {
      return messages;
    }

    // Keep first message (often system context) and most recent messages
    const recentMessages = messages.slice(-maxMessages);
    
    return recentMessages;
  }

  /**
   * Estimate token count for messages
   */
  estimateTokens(messages: any[]): number {
    return messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4); // 1 token ≈ 4 characters
    }, 0);
  }

  /**
   * Smart compaction - removes middle messages but keeps important ones
   */
  smartCompact(messages: any[], maxTokens: number = 4000): any[] {
    const estimatedTokens = this.estimateTokens(messages);
    
    if (estimatedTokens <= maxTokens) {
      return messages;
    }

    // Keep first (system) and last N messages
    const keepRecent = 8;
    const keepFirst = 1;
    
    if (messages.length <= keepFirst + keepRecent) {
      return messages;
    }

    return [
      ...messages.slice(0, keepFirst),
      {
        role: 'system',
        content: '[Earlier conversation history compressed]',
      },
      ...messages.slice(-keepRecent),
    ];
  }

  /**
   * Prepare context for AI with token management
   */
  prepareContext(
    systemPrompt: string,
    conversationHistory: any[],
    userMessage: string,
    maxContextTokens: number = 3000
  ): any[] {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.smartCompact(conversationHistory, maxContextTokens - 500),
      { role: 'user', content: userMessage },
    ];

    return messages;
  }
}

export const contextManager = new ContextManager();
