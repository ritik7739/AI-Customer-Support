import { Request, Response } from 'express';
import { supportTools, orderTools, billingTools } from '../agents/tools';

export class AgentController {
  async listAgents(req: Request, res: Response) {
    const agents = [
      {
        type: 'support',
        name: 'Support Agent',
        description: 'Handles general support inquiries, FAQs, and troubleshooting',
        capabilities: Object.keys(supportTools),
      },
      {
        type: 'order',
        name: 'Order Agent',
        description: 'Manages order status, tracking, modifications, and cancellations',
        capabilities: Object.keys(orderTools),
      },
      {
        type: 'billing',
        name: 'Billing Agent',
        description: 'Handles payment issues, refunds, invoices, and subscription queries',
        capabilities: Object.keys(billingTools),
      },
    ];

    res.json({
      success: true,
      agents,
    });
  }

  async getAgentCapabilities(req: Request, res: Response) {
    const { type } = req.params;

    let tools: any = {};
    let agentInfo: any = {};

    switch (type) {
      case 'support':
        tools = supportTools;
        agentInfo = {
          type: 'support',
          name: 'Support Agent',
          description: 'Handles general support inquiries, FAQs, and troubleshooting',
        };
        break;
      case 'order':
        tools = orderTools;
        agentInfo = {
          type: 'order',
          name: 'Order Agent',
          description: 'Manages order status, tracking, modifications, and cancellations',
        };
        break;
      case 'billing':
        tools = billingTools;
        agentInfo = {
          type: 'billing',
          name: 'Billing Agent',
          description: 'Handles payment issues, refunds, invoices, and subscription queries',
        };
        break;
      default:
        return res.status(404).json({
          success: false,
          message: 'Agent type not found',
        });
    }

    const capabilities = Object.entries(tools).map(([name, tool]: [string, any]) => ({
      name,
      description: tool.description,
      parameters: tool.parameters,
    }));

    res.json({
      success: true,
      agent: agentInfo,
      capabilities,
    });
  }
}
