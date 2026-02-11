import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.order.deleteMany();
  await prisma.fAQ.deleteMany();

  console.log('✅ Cleared existing data');

  // Seed FAQs
  const faqs = await prisma.fAQ.createMany({
    data: [
      {
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on "Forgot Password" on the login page. You will receive an email with instructions to reset your password.',
        category: 'general',
        keywords: ['password', 'reset', 'login', 'forgot'],
      },
      {
        question: 'What are your shipping options?',
        answer: 'We offer standard shipping (5-7 business days), express shipping (2-3 business days), and overnight shipping. Shipping costs vary based on your location and order total.',
        category: 'orders',
        keywords: ['shipping', 'delivery', 'options', 'mail'],
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier website.',
        category: 'orders',
        keywords: ['track', 'tracking', 'order', 'shipment'],
      },
      {
        question: 'What is your refund policy?',
        answer: 'We offer a 30-day money-back guarantee on all purchases. If you are not satisfied with your order, you can request a refund within 30 days of delivery. The item must be unused and in original packaging.',
        category: 'billing',
        keywords: ['refund', 'return', 'money back', 'policy'],
      },
      {
        question: 'How do I update my billing information?',
        answer: 'You can update your billing information by logging into your account, going to Account Settings > Billing Information, and updating your payment method.',
        category: 'billing',
        keywords: ['billing', 'payment', 'credit card', 'update'],
      },
    ],
  });

  console.log(`✅ Created ${faqs.count} FAQs`);

  // Seed Orders
  const orders = await prisma.order.createMany({
    data: [
      {
        orderNumber: 'ORD-000001',
        userId: 'default-user',
        status: 'delivered',
        totalAmount: 299.99,
        items: [
          { name: 'Wireless Headphones', quantity: 1, price: 299.99 },
        ],
        shippingInfo: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
        },
        trackingNumber: 'TRK123456789',
      },
      {
        orderNumber: 'ORD-000002',
        userId: 'default-user',
        status: 'shipped',
        totalAmount: 149.50,
        items: [
          { name: 'USB Cable', quantity: 2, price: 24.99 },
          { name: 'Phone Case', quantity: 1, price: 99.52 },
        ],
        shippingInfo: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
        },
        trackingNumber: 'TRK987654321',
      },
      {
        orderNumber: 'ORD-000003',
        userId: 'default-user',
        status: 'processing',
        totalAmount: 599.00,
        items: [
          { name: 'Smart Watch', quantity: 1, price: 599.00 },
        ],
        shippingInfo: {
          address: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
        },
        trackingNumber: null,
      },
    ],
  });

  console.log(`✅ Created ${orders.count} orders`);

  // Seed Invoices
  const invoices = await prisma.invoice.createMany({
    data: [
      {
        invoiceNumber: 'INV-000001',
        userId: 'default-user',
        orderId: 'ORD-000001',
        amount: 299.99,
        status: 'paid',
        dueDate: new Date('2024-01-15'),
        paidDate: new Date('2024-01-10'),
        items: [
          { description: 'Wireless Headphones', amount: 299.99 },
        ],
      },
      {
        invoiceNumber: 'INV-000002',
        userId: 'default-user',
        orderId: 'ORD-000002',
        amount: 149.50,
        status: 'paid',
        dueDate: new Date('2024-02-15'),
        paidDate: new Date('2024-02-05'),
        items: [
          { description: 'USB Cable x2', amount: 49.98 },
          { description: 'Phone Case', amount: 99.52 },
        ],
      },
      {
        invoiceNumber: 'INV-000003',
        userId: 'default-user',
        orderId: 'ORD-000003',
        amount: 599.00,
        status: 'pending',
        dueDate: new Date('2024-03-15'),
        paidDate: null,
        items: [
          { description: 'Smart Watch', amount: 599.00 },
        ],
      },
    ],
  });

  console.log(`✅ Created ${invoices.count} invoices`);

  // Seed Refunds
  const refunds = await prisma.refund.createMany({
    data: [
      {
        refundNumber: 'RFN-000001',
        userId: 'default-user',
        orderId: 'ORD-000001',
        amount: 299.99,
        status: 'completed',
        reason: 'Product not as described',
        processedDate: new Date('2024-01-20'),
      },
      {
        refundNumber: 'RFN-000002',
        userId: 'default-user',
        orderId: 'ORD-000002',
        amount: 149.50,
        status: 'pending',
        reason: 'Changed mind',
        processedDate: null,
      },
    ],
  });

  console.log(`✅ Created ${refunds.count} refunds`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
