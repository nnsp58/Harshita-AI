const { MasterTaxAgent } = require('../departments/tax/MasterTaxAgent');

/**
 * Wrapper to auto-load MasterTaxAgent into the existing SkillRegistry.
 */
class TaxSkill extends MasterTaxAgent {
  constructor() {
    super();
    // Inherits everything from MasterTaxAgent
  }
}

module.exports = { TaxSkill };
