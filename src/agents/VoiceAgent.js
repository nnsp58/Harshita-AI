const BaseAgent = require('./BaseAgent');
const VoiceAgentSkill = require('../skills/VoiceAgentSkill');

class VoiceAgent extends BaseAgent {
  constructor() {
    super('VoiceAgent');
    this.skill = new VoiceAgentSkill();
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
module.exports = new VoiceAgent();
