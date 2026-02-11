import { MessageService } from '../services/conversationService';
import { OrderService } from '../services/orderService';
import { BillingService } from '../services/billingService';
import { FAQService } from '../services/faqService';

const messageService = new MessageService();
const orderService = new OrderService();
const billingService = new BillingService();
const faqService = new FAQService();

// Support Agent Tools
export const supportTools = {
  queryConversationHistory: {
    description: 'Retrieve conversation history to provide context-aware support. Use this to understand what the customer has previously discussed.',
    parameters: {
      type: 'object',
      properties: {
        conversationId: {
          type: 'string',
          description: 'The ID of the conversation to retrieve history from',
        },
        limit: {
          type: 'number',
          description: 'Number of recent messages to retrieve (default: 10)',
        },
      },
      required: ['conversationId'],
    },
    execute: async (params: { conversationId: string; limit?: number }) => {
      try {
        const messages = await messageService.getRecentMessages(
          params.conversationId,
          params.limit || 10
        );
        return {
          success: true,
          messages: messages.reverse(),
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  searchFAQs: {
    description: 'Search the FAQ database for answers to common questions. Use this to find relevant solutions for customer inquiries.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find relevant FAQs',
        },
        category: {
          type: 'string',
          description: 'Optional category filter (general, orders, billing, technical)',
        },
      },
      required: ['query'],
    },
    execute: async (params: { query: string; category?: string }) => {
      try {
        const faqs = await faqService.searchFAQs(params.query, params.category);
        return {
          success: true,
          faqs,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
};

// Order Agent Tools
export const orderTools = {
  fetchOrderDetails: {
    description: 'Fetch complete order details by order number. Use this when customer asks about a specific order.',
    parameters: {
      type: 'object',
      properties: {
        orderNumber: {
          type: 'string',
          description: 'The order number to look up (format: ORD-XXXXXX)',
        },
      },
      required: ['orderNumber'],
    },
    execute: async (params: { orderNumber: string }) => {
      try {
        const order = await orderService.getOrderByNumber(params.orderNumber);
        if (!order) {
          return {
            success: false,
            error: 'Order not found',
          };
        }
        return {
          success: true,
          order,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  checkDeliveryStatus: {
    description: 'Check the delivery status and tracking information for an order.',
    parameters: {
      type: 'object',
      properties: {
        orderNumber: {
          type: 'string',
          description: 'The order number to check delivery status for',
        },
      },
      required: ['orderNumber'],
    },
    execute: async (params: { orderNumber: string }) => {
      try {
        const order = await orderService.getOrderByNumber(params.orderNumber);
        if (!order) {
          return {
            success: false,
            error: 'Order not found',
          };
        }
        return {
          success: true,
          status: order.status,
          trackingNumber: order.trackingNumber,
          shippingInfo: order.shippingInfo,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  getUserOrders: {
    description: 'Get all orders for a specific user. Use this to show order history.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to fetch orders for',
        },
      },
      required: ['userId'],
    },
    execute: async (params: { userId: string }) => {
      try {
        const orders = await orderService.getUserOrders(params.userId);
        return {
          success: true,
          orders,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
};

// Billing Agent Tools
export const billingTools = {
  getInvoiceDetails: {
    description: 'Retrieve invoice details by invoice number. Use this for invoice-related queries.',
    parameters: {
      type: 'object',
      properties: {
        invoiceNumber: {
          type: 'string',
          description: 'The invoice number to look up (format: INV-XXXXXX)',
        },
      },
      required: ['invoiceNumber'],
    },
    execute: async (params: { invoiceNumber: string }) => {
      try {
        const invoice = await billingService.getInvoiceByNumber(params.invoiceNumber);
        if (!invoice) {
          return {
            success: false,
            error: 'Invoice not found',
          };
        }
        return {
          success: true,
          invoice,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  checkRefundStatus: {
    description: 'Check the status of a refund request by refund number.',
    parameters: {
      type: 'object',
      properties: {
        refundNumber: {
          type: 'string',
          description: 'The refund number to check status for (format: RFN-XXXXXX)',
        },
      },
      required: ['refundNumber'],
    },
    execute: async (params: { refundNumber: string }) => {
      try {
        const refund = await billingService.getRefundByNumber(params.refundNumber);
        if (!refund) {
          return {
            success: false,
            error: 'Refund not found',
          };
        }
        return {
          success: true,
          refund,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  getUserInvoices: {
    description: 'Get all invoices for a specific user.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID to fetch invoices for',
        },
      },
      required: ['userId'],
    },
    execute: async (params: { userId: string }) => {
      try {
        const invoices = await billingService.getUserInvoices(params.userId);
        return {
          success: true,
          invoices,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
  requestRefund: {
    description: 'Create a new refund request for an order.',
    parameters: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'The user ID requesting the refund',
        },
        orderId: {
          type: 'string',
          description: 'The order ID to refund',
        },
        amount: {
          type: 'number',
          description: 'The refund amount',
        },
        reason: {
          type: 'string',
          description: 'The reason for the refund request',
        },
      },
      required: ['userId', 'orderId', 'amount', 'reason'],
    },
    execute: async (params: {
      userId: string;
      orderId: string;
      amount: number;
      reason: string;
    }) => {
      try {
        const refund = await billingService.createRefund(params);
        return {
          success: true,
          refund,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
  },
};
