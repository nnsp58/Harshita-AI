const BaseAgent = require('./BaseAgent');
const TadaSkill = require('../skills/TadaSkill');

class TadaAgent extends BaseAgent {
  constructor() {
    super('TadaAgent');
    this.skill = new TadaSkill();
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
module.exports = new TadaAgent();
