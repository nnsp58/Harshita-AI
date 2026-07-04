const BaseAgent = require('./BaseAgent');
const ResumeSkill = require('../skills/ResumeSkill');

class ResumeAgent extends BaseAgent {
  constructor() {
    super('ResumeAgent');
    this.skill = new ResumeSkill();
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
module.exports = new ResumeAgent();
