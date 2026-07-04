class BaseAgent {
  constructor(name) {
    this.name = name;
  }

  /**
   * Standardized Agent Communication Protocol
   * Every agent must implement this method and return the exact structure below.
   * 
   * @param {Object} input - Input data for the agent
   * @param {Object} context - Session or global context
   * @returns {Object} AgentResponse
   */
  async execute(input, context) {
    // Default implementation returns a fallback
    return this.createResponse({
      status: 'error',
      confidenceScore: 0,
      output: null,
      warnings: ['Execute method not implemented by agent.'],
      requiredNextAgent: null
    });
  }

  /**
   * Helper to format response according to PRD-023 Standard Protocol
   */
  createResponse({ status, confidenceScore, output, warnings = [], suggestions = [], requiredNextAgent = null }) {
    return {
      agentName: this.name,
      status, // 'success' | 'error' | 'clarification'
      confidenceScore, // 0 - 100
      output, // String or Object
      warnings, // Array of strings
      suggestions, // Array of strings
      requiredNextAgent // String or null
    };
  }
}

module.exports = BaseAgent;
