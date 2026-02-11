import prisma from '../config/database';
import { Order } from '../types';

export class OrderService {
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { orderNumber },
    }) as Order | null;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }) as Order[];
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return await prisma.order.findUnique({
      where: { id: orderId },
    }) as Order | null;
  }

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<Order> {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    }) as Order;
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
    }) as Order[];
  }
}
