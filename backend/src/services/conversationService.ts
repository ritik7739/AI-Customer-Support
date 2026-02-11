import prisma from '../config/database';
import { Conversation, Message } from '../types';

export class ConversationService {
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    return await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    }) as Conversation;
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    }) as Conversation | null;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }) as Conversation[];
  }

  async deleteConversation(id: string): Promise<void> {
    await prisma.conversation.delete({
      where: { id },
    });
  }

  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    return await prisma.conversation.update({
      where: { id },
      data: { title },
    }) as Conversation;
  }
}

export class MessageService {
  async createMessage(data: {
    conversationId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentType?: string;
    reasoning?: string;
    toolCalls?: any;
  }): Promise<Message> {
    return await prisma.message.create({
      data,
    }) as Message;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    }) as Message[];
  }

  async getRecentMessages(conversationId: string, limit: number = 10): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }) as Message[];
  }
}
