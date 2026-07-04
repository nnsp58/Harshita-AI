const BaseAgent = require('./BaseAgent');
const FormFillSkill = require('../skills/FormFillSkill');

class FormFillAgent extends BaseAgent {
  constructor() {
    super('FormFillAgent');
    this.skill = new FormFillSkill();
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
module.exports = new FormFillAgent();
