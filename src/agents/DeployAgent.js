const BaseAgent = require('./BaseAgent');
const DeploySkill = require('../skills/DeploySkill');

class DeployAgent extends BaseAgent {
  constructor() {
    super('DeployAgent');
    this.skill = new DeploySkill();
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
module.exports = new DeployAgent();
