const BaseAgent = require('./BaseAgent');
const StoryVideoSkill = require('../skills/StoryVideoSkill');

class StoryVideoAgent extends BaseAgent {
  constructor() {
    super('StoryVideoAgent');
    this.skill = new StoryVideoSkill();
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
module.exports = new StoryVideoAgent();
