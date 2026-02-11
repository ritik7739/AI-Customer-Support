import { Router } from 'express';
import { AgentController } from '../controllers/agentController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const agentController = new AgentController();

// GET /api/agents - List all available agents
router.get('/', asyncHandler(agentController.listAgents));

// GET /api/agents/:type/capabilities - Get capabilities for a specific agent
router.get('/:type/capabilities', asyncHandler(agentController.getAgentCapabilities));

export default router;
