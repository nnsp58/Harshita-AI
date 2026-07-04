const BaseAgent = require('./BaseAgent');
const DocumentOcrSkill = require('../skills/DocumentOcrSkill');

class DocumentOcrAgent extends BaseAgent {
  constructor() {
    super('DocumentOcrAgent');
    this.skill = new DocumentOcrSkill();
  }

  async execute(input, context) {
    try {
      const response = await this.skill.execute({ message: input, ...context });
      return this.createResponse({
        status: 'success',
        confidenceScore: 95,
        output: response,
      });
    } catch (e) {
      return this.createResponse({ status: 'error', confidenceScore: 0, warnings: [e.message] });
    }
  }
}
module.exports = new DocumentOcrAgent();
