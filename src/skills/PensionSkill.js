const { BaseSkill } = require('./BaseSkill');

class PensionSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'pension_automation';
    this.description = 'Pension and Ex-Servicemen Welfare Automation workflows';
    this.intents = ['pension', 'sparsh', 'welfare', 'ex_servicemen'];
    this.displayName = 'पेंशन ऑटोमेशन';
    this.displayNameEn = 'Pension Automation';
    this.category = 'government';
  }

  async execute(context) {
    try {
      // Lazy load the agent to prevent circular dependency issues during boot
      const formFillAgent = require('../agents/FormFillAgent');
      
      const profile = context.profile || { 
        name: 'Citizen', 
        aadhaar: '000000000000', 
        ppoNumber: 'DEFAULT-PPO' 
      };
      
      const agentContext = { 
        workflow: 'pension_automation', 
        profile,
        ...context 
      };
      
      const result = await formFillAgent.execute(context.message || 'Process pension', agentContext);
      
      return {
        type: 'text',
        message: result.output,
        metadata: { masked: true }
      };
    } catch (e) {
      return {
        type: 'text',
        message: `Pension Workflow Error: ${e.message}`,
        metadata: { masked: false }
      };
    }
  }
}

module.exports = { PensionSkill };
