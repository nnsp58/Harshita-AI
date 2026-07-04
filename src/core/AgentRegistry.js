class AgentRegistry {
  constructor() {
    this.agents = new Map();
  }

  /**
   * Registers a new agent into the system
   * @param {Object} agentConfig 
   */
  register(agentConfig) {
    if (!agentConfig || !agentConfig.id) {
      throw new Error("Agent ID is required for registration.");
    }
    
    // Check for duplicate creation attempt
    if (this.agents.has(agentConfig.id)) {
      console.warn(`[AgentRegistry] Agent ${agentConfig.id} is already registered.`);
      return;
    }

    this.agents.set(agentConfig.id, {
      id: agentConfig.id,
      name: agentConfig.name || agentConfig.id,
      description: agentConfig.description || "No description",
      capabilities: agentConfig.capabilities || [],
      supportedSkills: agentConfig.supportedSkills || [],
      priority: agentConfig.priority || 5,
      dependencies: agentConfig.dependencies || [],
      inputTypes: agentConfig.inputTypes || ['text'],
      outputTypes: agentConfig.outputTypes || ['text'],
      status: agentConfig.status || 'active',
      confidence: agentConfig.confidence || 100,
      version: agentConfig.version || '1.0.0',
      instance: agentConfig.instance // The actual agent class instance
    });
  }

  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Searches for an agent that can handle the required skill/capabilities
   */
  findAgentForSkill(skillId, requiredCapabilities = []) {
    let bestMatch = null;
    let highestScore = 0;

    for (const agent of this.agents.values()) {
      let score = 0;
      
      if (agent.supportedSkills.includes(skillId)) {
        score += 50; 
      }
      
      const matchedCapabilities = agent.capabilities.filter(c => requiredCapabilities.includes(c));
      score += matchedCapabilities.length * 10;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = agent;
      }
    }

    // Only return an agent if overlap is reasonable
    return highestScore > 0 ? bestMatch : null;
  }
}

module.exports = new AgentRegistry();
