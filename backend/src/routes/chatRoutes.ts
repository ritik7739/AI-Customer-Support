import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { asyncHandler } from '../middleware/errorHandler';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();
const chatController = new ChatController();

// POST /api/chat/messages - Send a new message
router.post('/messages', chatLimiter, asyncHandler(chatController.sendMessage));

// GET /api/chat/conversations/:id - Get a specific conversation
router.get('/conversations/:id', asyncHandler(chatController.getConversation));

// GET /api/chat/conversations - List all conversations for a user
router.get('/conversations', asyncHandler(chatController.getUserConversations));

// DELETE /api/chat/conversations/:id - Delete a conversation
router.delete('/conversations/:id', asyncHandler(chatController.deleteConversation));

export default router;
