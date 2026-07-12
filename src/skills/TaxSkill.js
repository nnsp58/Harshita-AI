const { MasterTaxAgent } = require('../departments/tax/MasterTaxAgent');

/**
 * TaxSkill — Wrapper to auto-load MasterTaxAgent into the existing SkillRegistry.
 * Inherits all execute() logic, intents, and keywords from MasterTaxAgent.
 * BugFix: Previous stub had no execute() — now properly delegates to MasterTaxAgent.
 */
class TaxSkill extends MasterTaxAgent {
  constructor() {
    super();
    // Override name to match SkillRegistry expectations if needed
    // this.name is inherited as 'master_tax_agent' from MasterTaxAgent
  }

  // execute() is inherited from MasterTaxAgent — no override needed
}

const taxSkillInstance = new TaxSkill();
module.exports = { TaxSkill, taxSkillInstance };
