import prisma from '../config/database';
import { Order } from '../types';

export class OrderService {
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { orderNumber },
    });
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id: orderId },
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async searchOrders(query: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query, mode: 'insensitive' } },
          { trackingNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  }
}
