const BaseAgent = require('./BaseAgent');
const NotepadSkill = require('../skills/NotepadSkill');

class NotepadAgent extends BaseAgent {
  constructor() {
    super('NotepadAgent');
    this.skill = new NotepadSkill();
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
module.exports = new NotepadAgent();
