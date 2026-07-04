const { aiProviderManager } = require('../../utils/aiProviderManager');
const BaseAgent = require('./BaseAgent');

class ApplicationAgent extends BaseAgent {
  constructor() {
    super('ApplicationAgent');
  }

  async execute(input, context) {
    const prompt = `
You are the Application Writing Agent.
The user wants to write an application or letter.
USER REQUEST: "${input}"

Draft a highly professional, well-formatted application based on the request.
Return ONLY the draft text. Do not add introductory remarks.
`;

    try {
      const output = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      return this.createResponse({
        status: 'success',
        confidenceScore: 95,
        output: output.trim(),
        requiredNextAgent: 'PDFAgent' // Example of multi-agent flow request
      });
    } catch (e) {
      return this.createResponse({
        status: 'error',
        confidenceScore: 0,
        output: null,
        warnings: ['AI generation failed.']
      });
    }
  }
}

module.exports = new ApplicationAgent();
