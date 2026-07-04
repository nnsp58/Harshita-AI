const BaseAgent = require('./BaseAgent');
const GeneralChatSkill = require('../skills/GeneralChatSkill');

class GeneralChatAgent extends BaseAgent {
  constructor() {
    super('GeneralChatAgent');
    this.skill = new GeneralChatSkill();
  }

  async execute(input, context) {
    try {
      const response = await this.skill.execute({ message: input, ...context });
      return this.createResponse({
        status: 'success',
        confidenceScore: 90,
        output: response,
      });
    } catch (e) {
      return this.createResponse({ status: 'error', confidenceScore: 0, warnings: [e.message] });
    }
  }
}
module.exports = new GeneralChatAgent();
