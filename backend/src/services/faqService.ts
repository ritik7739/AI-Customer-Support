import prisma from '../config/database';

export class FAQService {
  async searchFAQs(query: string, category?: string): Promise<any[]> {
    const where: any = {
      OR: [
        { question: { contains: query, mode: 'insensitive' } },
        { answer: { contains: query, mode: 'insensitive' } },
        { keywords: { has: query.toLowerCase() } },
      ],
    };

    if (category) {
      where.category = category;
    }

    return await prisma.fAQ.findMany({
      where,
      take: 5,
    });
  }

  async getAllFAQs(): Promise<any[]> {
    return await prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFAQsByCategory(category: string): Promise<any[]> {
    return await prisma.fAQ.findMany({
      where: { category },
      orderBy: { createdAt: 'desc' },
    });
  }
}
