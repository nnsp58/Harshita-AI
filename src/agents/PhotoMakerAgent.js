const BaseAgent = require('./BaseAgent');
const PhotoMakerSkill = require('../skills/PhotoMakerSkill');

class PhotoMakerAgent extends BaseAgent {
  constructor() {
    super('PhotoMakerAgent');
    this.skill = new PhotoMakerSkill();
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
module.exports = new PhotoMakerAgent();
