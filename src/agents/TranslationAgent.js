const { aiProviderManager } = require('../utils/aiProviderManager');
const BaseAgent = require('./BaseAgent');

class TranslationAgent extends BaseAgent {
  constructor() {
    super('TranslationAgent');
  }

  async execute(input, context) {
    const prompt = `
You are the Translation Agent.
The user wants to translate text.
USER REQUEST: "${input}"

Provide the translation. If language is not specified, default to Hindi-to-English or English-to-Hindi based on input.
Return ONLY the translated text.
`;

    try {
      const output = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      return this.createResponse({
        status: 'success',
        confidenceScore: 95,
        output: output.trim(),
        requiredNextAgent: null
      });
    } catch (e) {
      return this.createResponse({
        status: 'error',
        confidenceScore: 0,
        output: null,
        warnings: ['Translation failed.']
      });
    }
  }
}

module.exports = new TranslationAgent();
