class BaseAgent {
  constructor(name) {
    this.name = name;
  }

  Initialize() {
    return true;
  }

  async execute(input, context) {
    return this.createResponse({
      status: 'error',
      confidenceScore: 0,
      output: null,
      warnings: ['Execute method not implemented by agent.'],
      requiredNextAgent: null
    });
  }

  Validate(input) {
    return !!input;
  }

  Report() {
    return { name: this.name, status: 'Active' };
  }

  HealthCheck() {
    return true;
  }

  Capabilities() {
    return [];
  }

  createResponse({ status, confidenceScore, output, warnings = [], suggestions = [], requiredNextAgent = null }) {
    return {
      agentName: this.name,
      status, 
      confidenceScore, 
      output, 
      warnings, 
      suggestions, 
      requiredNextAgent 
    };
  }
}

module.exports = BaseAgent;
