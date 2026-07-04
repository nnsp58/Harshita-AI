const BaseAgent = require('./BaseAgent');
const legalEnginePipeline = require('../skills/legal/LegalEnginePipeline');

class LegalAgent extends BaseAgent {
  constructor() {
    super('LegalAgent');
  }

  async execute(input, context) {
    try {
      const response = await legalEnginePipeline.processRequest(context.userId, input);
      
      return this.createResponse({
        status: 'success',
        confidenceScore: 98,
        output: response.reply,
        requiredNextAgent: null 
      });
    } catch (e) {
      return this.createResponse({
        status: 'error',
        confidenceScore: 0,
        output: null,
        warnings: ['Legal Pipeline failed.']
      });
    }
  }
}

module.exports = new LegalAgent();
