const { aiProviderManager } = require('../utils/aiProviderManager');
const outputRouter = require('./OutputRouter');
const agentRegistry = require('./AgentRegistry');
const skillRegistry = require('./SkillRegistry');
const dynamicWrapperFactory = require('./DynamicWrapperFactory');

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
      let currentAgent = this.resolveAgent(routeInfo);
      let currentInput = userInput;
      let finalResult = null;
      let loopCount = 0;
      
      // Coordinate multiple agents sequentially (e.g. ResumeAgent -> PDFAgent)
      while (currentAgent && loopCount < 5) {
        loopCount++;
        
        // Execute the agent
        const agentResponse = await currentAgent.execute(currentInput, { userId });
        
        // Handle Error Recovery
        if (agentResponse.status === 'error') {
           console.error(`[MasterAI] Agent ${currentAgent.name} failed:`, agentResponse.warnings);
           return { success: false, message: "Error processing request.", mode: 'chat' };
        }

        // If the agent requires another agent to finish the task
        if (agentResponse.requiredNextAgent) {
          currentAgent = agentRegistry.getAgent(agentResponse.requiredNextAgent)?.instance;
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
- DeployAgent (for deployment tasks)
- DocumentOcrAgent (for reading documents and images)
- FormFillAgent (for filling forms)
- GeneralChatAgent (for casual conversation and general queries)
- MathAgent (for calculations, geometry, and unit conversion)
- NotepadAgent (for taking notes)
- PhotoMakerAgent (for generating images)
- ResumeAgent (for building resumes)
- StoryVideoAgent (for creating videos from stories)
- TadaAgent (for TA/DA calculations and forms)
- VoiceAgent (for voice interactions)

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

  resolveAgent(routeInfo) {
    if (routeInfo.selectedAgent) {
       const agent = agentRegistry.getAgent(routeInfo.selectedAgent);
       if (agent && agent.instance) {
         return agent.instance;
       }
    }
    
    if (!routeInfo.skillId) {
      // Fallback if no skill detected
      const fallback = agentRegistry.getAgent('ApplicationAgent') || agentRegistry.getAgent('GeneralChatAgent');
      return fallback?.instance || null;
    }

    const skill = skillRegistry.getSkill(routeInfo.skillId);
    if (!skill) return null;

    // PRD-024 Phase 3: Capability Matching
    const existingAgent = agentRegistry.findAgentForSkill(skill.id, skill.capabilitiesRequired);
    if (existingAgent) {
      console.log(`[MasterAI] Reusing existing agent: ${existingAgent.id}`);
      return existingAgent.instance;
    }

    // PRD-024 Phase 4: Dynamic Wrapper System
    console.log(`[MasterAI] No agent found. Creating dynamic wrapper for skill: ${skill.id}`);
    return dynamicWrapperFactory.createWrapperForSkill(skill);
  }
}

module.exports = new MasterAIOrchestrator();
