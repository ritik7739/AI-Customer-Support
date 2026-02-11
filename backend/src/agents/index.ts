import OpenAI from 'openai';
import { config } from '../config/config';
import { supportTools, orderTools, billingTools } from './tools';
import { contextManager } from '../utils/contextManager';

// Use Hugging Face Inference API (free!)
const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  baseURL: 'https://router.huggingface.co/v1',
});

export type AgentType = 'router' | 'support' | 'order' | 'billing';

interface AgentResponse {
  content: string;
  agentType: AgentType;
  reasoning?: string;
  toolCalls?: any[];
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Router Agent - Analyzes and delegates to sub-agents
export class RouterAgent {
  async classify(userMessage: string, conversationHistory: Message[]): Promise<{
    agentType: AgentType;
    reasoning: string;
  }> {
    const systemPrompt = `You are a router agent for a customer support system. Your job is to analyze the customer's query and classify it into one of three categories:

1. SUPPORT - General support inquiries, FAQs, troubleshooting, product questions, account help
2. ORDER - Order status, tracking, modifications, cancellations, shipping questions
3. BILLING - Payment issues, refunds, invoices, subscription queries, pricing questions

Analyze the user's message and respond with a JSON object containing:
- agentType: one of "support", "order", or "billing"
- reasoning: brief explanation of why you chose this agent (1 sentence)

Only respond with the JSON object, nothing else.`;

    try {
      // Use context manager to prepare history
      const messages = contextManager.prepareContext(
        systemPrompt,
        conversationHistory,
        userMessage,
        2000 // Token limit for classification
      );

      const response = await openai.chat.completions.create({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        agentType: result.agentType || 'support',
        reasoning: result.reasoning || 'Classified based on query context',
      };
    } catch (error) {
      console.error('Router classification error:', error);
      return {
        agentType: 'support',
        reasoning: 'Defaulting to support agent due to classification error',
      };
    }
  }
}

// Support Agent - Handles general inquiries
export class SupportAgent {
  async process(
    userMessage: string,
    conversationHistory: Message[],
    conversationId: string,
    userId: string
  ): Promise<AgentResponse> {
    const systemPrompt = `You are a helpful customer support agent. You assist customers with general inquiries, FAQs, troubleshooting, and product information.

You have access to the following tools:
- queryConversationHistory: Retrieve past conversation context
- searchFAQs: Search knowledge base for answers

When you need to use a tool, respond with a JSON object:
{
  "needsTool": true,
  "toolName": "toolName",
  "toolParams": {...}
}

Otherwise, provide a helpful, friendly response to the customer's query.`;

    try {
      // Use context manager to prepare history
      const messages = contextManager.prepareContext(
        systemPrompt,
        conversationHistory,
        userMessage,
        4000 // Token limit for support agent
      );

      const response = await openai.chat.completions.create({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';

      // Check if tool usage is needed
      if (content.includes('"needsTool": true')) {
        try {
          const toolRequest = JSON.parse(content);
          const toolResult = await this.executeTool(
            toolRequest.toolName,
            toolRequest.toolParams,
            conversationId,
            userId
          );

          // Get final response with tool results using context management
          const finalMessages = contextManager.prepareContext(
            systemPrompt,
            conversationHistory,
            `Previous response: ${content}\n\nTool result: ${JSON.stringify(toolResult)}. Now provide a helpful response to the customer based on this information.`,
            4000
          );

          const finalResponse = await openai.chat.completions.create({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: finalMessages,
            temperature: 0.7,
          });

          return {
            content: finalResponse.choices[0].message.content || 'I apologize, but I encountered an issue processing your request.',
            agentType: 'support',
            reasoning: `Used tool: ${toolRequest.toolName}`,
            toolCalls: [{ tool: toolRequest.toolName, params: toolRequest.toolParams, result: toolResult }],
          };
        } catch (e) {
          // If tool parsing fails, return regular response
        }
      }

      return {
        content,
        agentType: 'support',
      };
    } catch (error) {
      console.error('Support agent error:', error);
      return {
        content: 'I apologize, but I encountered an error. Please try again.',
        agentType: 'support',
      };
    }
  }

  private async executeTool(toolName: string, params: any, conversationId: string, userId: string) {
    const tool = (supportTools as any)[toolName];
    if (tool && tool.execute) {
      // Inject required IDs if needed
      if (toolName === 'queryConversationHistory') {
        params.conversationId = conversationId;
      }
      return await tool.execute(params);
    }
    return { success: false, error: 'Tool not found' };
  }
}

// Order Agent - Handles order-related queries
export class OrderAgent {
  async process(
    userMessage: string,
    conversationHistory: Message[],
    conversationId: string,
    userId: string
  ): Promise<AgentResponse> {
    const systemPrompt = `You are an order management specialist. You help customers with order status, tracking, modifications, and cancellations.

You have access to the following tools:
- fetchOrderDetails: Get complete order information by order number
- checkDeliveryStatus: Check shipping and tracking status
- getUserOrders: List all orders for a user

When you need to use a tool, respond with a JSON object:
{
  "needsTool": true,
  "toolName": "toolName",
  "toolParams": {...}
}

When customers mention an order, look for order numbers in format ORD-XXXXXX. Always use tools to fetch actual data before responding.`;

    try {
      // Use context manager to prepare history
      const messages = contextManager.prepareContext(
        systemPrompt,
        conversationHistory,
        userMessage,
        4000 // Token limit for order agent
      );

      const response = await openai.chat.completions.create({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content || '';

      if (content.includes('"needsTool": true')) {
        try {
          const toolRequest = JSON.parse(content);
          const toolResult = await this.executeTool(
            toolRequest.toolName,
            toolRequest.toolParams,
            userId
          );

          const finalMessages = contextManager.prepareContext(
            systemPrompt,
            conversationHistory,
            `Previous response: ${content}\n\nTool result: ${JSON.stringify(toolResult)}. Now provide a clear response to the customer about their order.`,
            4000
          );

          const finalResponse = await openai.chat.completions.create({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: finalMessages,
            temperature: 0.5,
          });

          return {
            content: finalResponse.choices[0].message.content || 'Unable to process order request.',
            agentType: 'order',
            reasoning: `Used tool: ${toolRequest.toolName}`,
            toolCalls: [{ tool: toolRequest.toolName, params: toolRequest.toolParams, result: toolResult }],
          };
        } catch (e) {
          console.error('Tool execution error:', e);
        }
      }

      return {
        content,
        agentType: 'order',
      };
    } catch (error) {
      console.error('Order agent error:', error);
      return {
        content: 'I apologize, but I encountered an error processing your order request.',
        agentType: 'order',
      };
    }
  }

  private async executeTool(toolName: string, params: any, userId: string) {
    const tool = (orderTools as any)[toolName];
    if (tool && tool.execute) {
      if (toolName === 'getUserOrders') {
        params.userId = userId;
      }
      return await tool.execute(params);
    }
    return { success: false, error: 'Tool not found' };
  }
}

// Billing Agent - Handles payment and billing queries
export class BillingAgent {
  async process(
    userMessage: string,
    conversationHistory: Message[],
    conversationId: string,
    userId: string
  ): Promise<AgentResponse> {
    const systemPrompt = `You are a billing specialist. You help customers with payment issues, refunds, invoices, and subscription queries.

You have access to the following tools:
- getInvoiceDetails: Retrieve invoice information by invoice number
- checkRefundStatus: Check the status of a refund request
- getUserInvoices: List all invoices for a user
- requestRefund: Create a new refund request

When you need to use a tool, respond with a JSON object:
{
  "needsTool": true,
  "toolName": "toolName",
  "toolParams": {...}
}

Look for invoice numbers (INV-XXXXXX) and refund numbers (RFN-XXXXXX) in customer messages. Always use tools to fetch real data.`;

    try {
      // Use context manager to prepare history
      const messages = contextManager.prepareContext(
        systemPrompt,
        conversationHistory,
        userMessage,
        4000 // Token limit for billing agent
      );

      const response = await openai.chat.completions.create({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content || '';

      if (content.includes('"needsTool": true')) {
        try {
          const toolRequest = JSON.parse(content);
          const toolResult = await this.executeTool(
            toolRequest.toolName,
            toolRequest.toolParams,
            userId
          );

          const finalMessages = contextManager.prepareContext(
            systemPrompt,
            conversationHistory,
            `Previous response: ${content}\n\nTool result: ${JSON.stringify(toolResult)}. Now provide a professional response about the billing matter.`,
            4000
          );

          const finalResponse = await openai.chat.completions.create({
            model: 'Qwen/Qwen2.5-72B-Instruct',
            messages: finalMessages,
            temperature: 0.5,
          });

          return {
            content: finalResponse.choices[0].message.content || 'Unable to process billing request.',
            agentType: 'billing',
            reasoning: `Used tool: ${toolRequest.toolName}`,
            toolCalls: [{ tool: toolRequest.toolName, params: toolRequest.toolParams, result: toolResult }],
          };
        } catch (e) {
          console.error('Tool execution error:', e);
        }
      }

      return {
        content,
        agentType: 'billing',
      };
    } catch (error) {
      console.error('Billing agent error:', error);
      return {
        content: 'I apologize, but I encountered an error processing your billing request.',
        agentType: 'billing',
      };
    }
  }

  private async executeTool(toolName: string, params: any, userId: string) {
    const tool = (billingTools as any)[toolName];
    if (tool && tool.execute) {
      if (toolName === 'getUserInvoices' || toolName === 'requestRefund') {
        params.userId = userId;
      }
      return await tool.execute(params);
    }
    return { success: false, error: 'Tool not found' };
  }
}
