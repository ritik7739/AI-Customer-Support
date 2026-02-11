import prisma from '../config/database';
import { Invoice, Refund } from '../types';

export class BillingService {
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    return await prisma.invoice.findUnique({
      where: { invoiceNumber },
    });
  }

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    return await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRefundByNumber(refundNumber: string): Promise<Refund | null> {
    return await prisma.refund.findUnique({
      where: { refundNumber },
    });
  }

  async getRefundsByOrderId(orderId: string): Promise<Refund[]> {
    return await prisma.refund.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRefund(data: {
    userId: string;
    orderId: string;
    amount: number;
    reason: string;
  }): Promise<Refund> {
    const refundCount = await prisma.refund.count();
    const refundNumber = `RFN-${String(refundCount + 1).padStart(6, '0')}`;

    return await prisma.refund.create({
      data: {
        ...data,
        refundNumber,
        status: 'pending',
      },
    });
  }

  async updateRefundStatus(
    refundId: string,
    status: 'pending' | 'processing' | 'completed' | 'rejected'
  ): Promise<Refund> {
    return await prisma.refund.update({
      where: { id: refundId },
      data: {
        status,
        processedDate: status === 'completed' ? new Date() : undefined,
      },
    });
  }
}
