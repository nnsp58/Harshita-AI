/**
 * LegalRuleEngine
 * Manages state-specific rules and document identification.
 */
class LegalRuleEngine {
  identifyDocumentType(intent) {
    if (intent.includes('gift') || intent.includes('daan')) return 'Gift Deed';
    if (intent.includes('sale') || intent.includes('sell')) return 'Sale Deed';
    return 'General Agreement';
  }

  getStateRules(state) {
    const rules = {
      'Uttar Pradesh': { stampDuty: '7%', witnesses: 2, registrationMandatory: true },
      'Delhi': { stampDuty: '6%', witnesses: 2, registrationMandatory: true }
    };
    return rules[state] || { stampDuty: 'Unknown', witnesses: 2, registrationMandatory: true };
  }
}

module.exports = { LegalRuleEngine };
