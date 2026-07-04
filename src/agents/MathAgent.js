const BaseAgent = require('./BaseAgent');
const MathSkill = require('../skills/MathSkill');

class MathAgent extends BaseAgent {
  constructor() {
    super('MathAgent');
    this.skill = new MathSkill();
  }

  async execute(input, context) {
    try {
      const response = await this.skill.execute({ message: input, ...context });
      return this.createResponse({
        status: 'success',
        confidenceScore: 98,
        output: response,
      });
    } catch (e) {
      return this.createResponse({ status: 'error', confidenceScore: 0, warnings: [e.message] });
    }
  }
}
module.exports = new MathAgent();
