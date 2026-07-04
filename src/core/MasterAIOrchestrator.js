const { aiProviderManager } = require('../utils/aiProviderManager');
const outputRouter = require('./OutputRouter');

// Lazy loading agents as per Performance Rules
const agentRegistry = {
  'ApplicationAgent': () => require('../agents/ApplicationAgent'),
  'PDFAgent': () => require('../agents/PDFAgent'),
  'LegalAgent': () => require('../agents/LegalAgent'),
  'TranslationAgent': () => require('../agents/TranslationAgent'),
};

class MasterAIOrchestrator {
  constructor() {
    this.sessionStates = new Map();
  }

  /**
   * Main entry point for all user requests.
   */
  async processRequest(userId, userInput) {
    try {
      // Phase 1: Intent & Agent Selection
      const routeInfo = await this.analyzeIntent(userInput);
      
      // Phase 2: Clarification Engine
      if (routeInfo.confidence < 90) {
        return {
          success: false,
          message: `I think you want to ${routeInfo.intent}, but I need to be sure. Can you clarify?`,
          mode: 'chat'
        };
      }

      // Phase 3 & 4: Multi-Agent Coordination Loop
      let currentAgentName = routeInfo.selectedAgent;
      let currentInput = userInput;
      let finalResult = null;
      let loopCount = 0;
      
      // Coordinate multiple agents sequentially (e.g. ResumeAgent -> PDFAgent)
      while (currentAgentName && loopCount < 5) {
        loopCount++;
        const agent = this.loadAgent(currentAgentName);
        
        if (!agent) {
          throw new Error(`Agent ${currentAgentName} not found.`);
        }

        // Execute the agent
        const agentResponse = await agent.execute(currentInput, { userId });
        
        // Handle Error Recovery
        if (agentResponse.status === 'error') {
           console.error(`[MasterAI] Agent ${currentAgentName} failed:`, agentResponse.warnings);
           // Fallback logic could go here. For now, abort.
           return { success: false, message: "Error processing request.", mode: 'chat' };
        }

        // If the agent requires another agent to finish the task
        if (agentResponse.requiredNextAgent) {
          currentAgentName = agentResponse.requiredNextAgent;
          currentInput = agentResponse.output; // Pass output to next agent
        } else {
          // Task completed
          finalResult = agentResponse;
          break;
        }
      }

      // Phase 5: Output Routing
      return outputRouter.route(finalResult);

    } catch (error) {
      console.error("[MasterAI] Orchestration error:", error);
      return { success: false, message: "Internal Master AI Error.", mode: 'error' };
    }
  }

  /**
   * Uses AI to determine the correct initial agent based on the prompt.
   */
  async analyzeIntent(userInput) {
    const prompt = `
You are the Master AI Intent Engine for Harshita AI.
Analyze this user request: "${userInput}"

Select the most appropriate agent to handle this task from the following list:
- ApplicationAgent (for leave letters, general letters)
- PDFAgent (for direct PDF conversion requests)
- LegalAgent (for legal notices, court drafts)
- TranslationAgent
- CodingAgent

OUTPUT FORMAT (Strict JSON):
{
  "intent": "Brief description of intent",
  "selectedAgent": "AgentName",
  "confidence": 95
}
`;
    try {
      const response = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '');
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      return JSON.parse(jsonStr.trim());
    } catch (error) {
       // Fallback
       return { intent: "Unknown", selectedAgent: "ApplicationAgent", confidence: 100 };
    }
  }

  loadAgent(agentName) {
    if (agentRegistry[agentName]) {
      return agentRegistry[agentName](); // Lazy load
    }
    return null;
  }
}

module.exports = new MasterAIOrchestrator();
