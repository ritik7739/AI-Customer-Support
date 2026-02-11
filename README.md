# AI Customer Support System

A full-stack AI-powered customer support application with a multi-agent architecture built with Next.js, Express, PostgreSQL, and Hugging Face AI.

## 🎯 Features

### Core Features
- **Multi-Agent Architecture**: Router, Support, Order, and Billing specialized agents
- **Intelligent Routing**: Automatic classification of user queries to appropriate agents
- **Agent Tools**: 9 specialized tools for database operations
- **Real-time Chat**: Modern chat interface with typing indicators
- **Conversation Management**: Persistent conversation history
- **Rate Limiting**: API protection with configurable limits
- **Context Management**: Smart token limit handling with message compaction

### Bonus Features ✨
1. ✅ **Rate Limiting Implementation**: Express middleware with 100 req/15min (API) and 20 msg/min (Chat)
2. ✅ **AI Reasoning Display**: Shows agent decision-making process in UI
3. ✅ **Context Management**: Automatic token limit handling with smart message compaction
4. ✅ **Enhanced Status Indicators**: Random status words (Thinking, Analyzing, Searching, etc.)

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js 14    │  Frontend (Port 3000)
│   + Tailwind    │
└────────┬────────┘
         │
    REST API
         │
┌────────▼────────┐
│   Express.js    │  Backend (Port 3005)
│  + TypeScript   │
└────────┬────────┘
         │
   ┌─────▼─────┐
   │  Agents   │
   ├───────────┤
   │  Router   │──┐
   │  Support  │  │  Hugging Face API
   │  Order    │  ├─► (Qwen/Qwen2.5-72B-Instruct)
   │  Billing  │  │
   └─────┬─────┘──┘
         │
   ┌─────▼─────┐
   │  Prisma   │
   │    ORM    │
   └─────┬─────┘
         │
   ┌─────▼─────┐
   │PostgreSQL │  Neon Cloud Database
   │   (Neon)  │
   └───────────┘
```

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon Cloud)
- **AI**: Hugging Face API (via OpenAI SDK)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Hugging Face account (free)
- Neon database account (free)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Assignment
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Backend `.env`:
```env
DATABASE_URL="postgresql://neondb_owner:npg_pass@ep-crimson-firefly-ai331ajo-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
OPENAI_API_KEY="your_huggingface_token_here"
PORT=3005
```

Frontend `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3005
```

4. **Set up database**
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3005

## 🗄️ Database Schema

### Models
1. **Conversation**: User chat sessions
2. **Message**: Individual messages with agent metadata
3. **Order**: E-commerce orders with tracking
4. **Invoice**: Billing records
5. **Refund**: Refund requests and status
6. **FAQ**: Knowledge base articles

## 🤖 Agent System

### 1. Router Agent
- **Purpose**: Classifies incoming queries
- **Outputs**: Agent type + reasoning
- **Categories**: Support, Order, Billing

### 2. Support Agent
**Tools:**
- `queryConversationHistory`: Retrieve past context
- `searchFAQs`: Search knowledge base

### 3. Order Agent
**Tools:**
- `fetchOrderDetails`: Get order information
- `checkDeliveryStatus`: Track shipping
- `getUserOrders`: List all user orders

### 4. Billing Agent
**Tools:**
- `getInvoiceDetails`: Retrieve invoices
- `checkRefundStatus`: Check refund status
- `getUserInvoices`: List user invoices
- `requestRefund`: Create refund request

## 📡 API Endpoints

### Chat
- `POST /api/chat/messages` - Send message
- `GET /api/chat/conversations/:id` - Get conversation
- `GET /api/chat/conversations/user/:userId` - List user conversations

### Agents
- `GET /api/agents/status` - Get agent status

### Orders
- `GET /api/orders/:orderNumber` - Get order details
- `GET /api/orders/user/:userId` - List user orders

### Billing
- `GET /api/billing/invoices/:invoiceNumber` - Get invoice
- `GET /api/billing/invoices/user/:userId` - List user invoices
- `POST /api/billing/refunds` - Request refund
- `GET /api/billing/refunds/:refundNumber` - Get refund status

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, smooth animations
- **Responsive Layout**: Works on desktop and mobile
- **Agent Badges**: Visual indicators for agent types
- **Reasoning Display**: Shows AI decision-making
- **Typing Indicators**: Dynamic status phrases
- **Conversation Sidebar**: Easy navigation
- **Message History**: Persistent chat sessions

## ⚙️ Configuration

### Rate Limiting
```typescript
// API Endpoints
- 100 requests per 15 minutes

// Chat Endpoint
- 20 messages per minute
```

### Context Management
```typescript
// Token limits per agent
- Router: 2000 tokens
- Support: 4000 tokens
- Order: 4000 tokens
- Billing: 4000 tokens
```

## 🧪 Testing Scenarios

1. **Support Query**: "How do I reset my password?"
2. **Order Tracking**: "What's the status of order ORD-100001?"
3. **Billing Question**: "Can I get a refund for invoice INV-100001?"
4. **Mixed Query**: "I need help with my order and billing"

## 📝 Seeded Data

The database includes sample data:
- 3 Orders (ORD-100001 to ORD-100003)
- 3 Invoices (INV-100001 to INV-100003)
- 2 Refunds (RFN-100001, RFN-100002)
- 5 FAQ articles

## 🔐 Environment Variables

### Required
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: Hugging Face API token
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Optional
- `PORT`: Backend port (default: 3005)

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set `Root Directory` to `frontend`
4. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
5. Deploy

### Backend (Railway/Render)
1. Push code to GitHub
2. Create new service
3. Set `Root Directory` to `backend`
4. Set environment variables:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `PORT`
5. Deploy

### Database (Neon)
- Already configured in cloud
- Connection string in `.env`
- Auto-scaling and backups included

## 🛠️ Development

### Project Structure
```
Assignment/
├── backend/
│   ├── src/
│   │   ├── agents/        # Multi-agent system
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities (Context Manager)
│   │   └── config/        # Configuration
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   └── components/    # React components
│   └── package.json
└── package.json           # Root workspace config
```

### Scripts

Backend:
```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Start production
npm run seed      # Seed database
```

Frontend:
```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Start production
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Neon connection string
- Check if IP is whitelisted
- Ensure SSL mode is enabled

### AI API Errors
- Verify Hugging Face token
- Check API rate limits
- Ensure correct model name

### Port Conflicts
- Change PORT in backend `.env`
- Update NEXT_PUBLIC_API_URL in frontend

## 📊 Implementation Status

### Core Requirements ✅
- ✅ Multi-agent architecture (Router + 3 specialized agents)
- ✅ Agent tools (9 tools total)
- ✅ Next.js frontend with modern UI
- ✅ Express backend with TypeScript
- ✅ PostgreSQL database with Prisma
- ✅ API endpoints (8 endpoints)
- ✅ Conversation management

### Bonus Features
- ✅ Rate limiting implementation
- ✅ AI reasoning display
- ✅ Context management/compaction
- ✅ Enhanced status indicators
- ❌ Hono RPC + Turborepo (major refactor not included)
- ❌ useworkflow.dev integration
- ❌ Unit/integration tests
- ❌ Live demo deployment

## 📄 License

MIT License - feel free to use for your projects!

## 👤 Author

Built as part of the AI Customer Support System assignment.

## 🙏 Acknowledgments

- Hugging Face for free AI inference
- Neon for cloud PostgreSQL
- OpenAI SDK for API compatibility layer
