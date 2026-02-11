export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType?: 'router' | 'support' | 'order' | 'billing';
  reasoning?: string;
  toolCalls?: any;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: any[];
  shippingInfo: any;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  orderId?: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  items: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Refund {
  id: string;
  refundNumber: string;
  userId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  reason: string;
  processedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentCapability {
  name: string;
  description: string;
  tools: string[];
}

export type AgentType = 'router' | 'support' | 'order' | 'billing';
