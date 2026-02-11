import { Request, Response } from 'express';
import { ConversationService, MessageService } from '../services/conversationService';
import { RouterAgent, SupportAgent, OrderAgent, BillingAgent } from '../agents';
import { AppError } from '../middleware/errorHandler';

const conversationService = new ConversationService();
const messageService = new MessageService();
const routerAgent = new RouterAgent();
const supportAgent = new SupportAgent();
const orderAgent = new OrderAgent();
const billingAgent = new BillingAgent();

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    const { conversationId, message, userId = 'default-user' } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    let conversation;

    // Create or get conversation
    if (conversationId) {
      conversation = await conversationService.getConversation(conversationId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }
    } else {
      conversation = await conversationService.createConversation(userId);
    }

    // Save user message
    await messageService.createMessage({
      conversationId: conversation.id,
      role: 'user',
      content: message,
    });

    // Get conversation history for context
    const history = await messageService.getConversationMessages(conversation.id);
    const conversationHistory = history.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    // Step 1: Router classifies the query
    const { agentType, reasoning } = await routerAgent.classify(
      message,
      conversationHistory
    );

    // Step 2: Delegate to appropriate sub-agent
    let agentResponse;
    switch (agentType) {
      case 'support':
        agentResponse = await supportAgent.process(
          message,
          conversationHistory,
          conversation.id,
          userId
        );
        break;
      case 'order':
        agentResponse = await orderAgent.process(
          message,
          conversationHistory,
          conversation.id,
          userId
        );
        break;
      case 'billing':
        agentResponse = await billingAgent.process(
          message,
          conversationHistory,
          conversation.id,
          userId
        );
        break;
      default:
        agentResponse = await supportAgent.process(
          message,
          conversationHistory,
          conversation.id,
          userId
        );
    }

    // Save assistant response
    const assistantMessage = await messageService.createMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: agentResponse.content,
      agentType: agentResponse.agentType,
      reasoning: reasoning || agentResponse.reasoning,
      toolCalls: agentResponse.toolCalls,
    });

    // Update conversation title if it's the first exchange
    if (history.length <= 1 && conversation.title === 'New Conversation') {
      const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
      await conversationService.updateConversationTitle(conversation.id, title);
    }

    res.json({
      success: true,
      conversationId: conversation.id,
      message: assistantMessage,
      agentType: agentResponse.agentType,
      reasoning: reasoning || agentResponse.reasoning,
    });
  }

  async getConversation(req: Request, res: Response) {
    const { id } = req.params;

    const conversation = await conversationService.getConversation(id);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    res.json({
      success: true,
      conversation,
    });
  }

  async getUserConversations(req: Request, res: Response) {
    const { userId = 'default-user' } = req.query;

    const conversations = await conversationService.getUserConversations(
      userId as string
    );

    res.json({
      success: true,
      conversations,
    });
  }

  async deleteConversation(req: Request, res: Response) {
    const { id } = req.params;

    await conversationService.deleteConversation(id);

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  }
}
