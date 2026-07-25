/**
 * LegalRuleEngine
 * Manages state-specific rules and document identification.
 */
class LegalRuleEngine {
  identifyDocumentType(intent) {
    const lowerIntent = intent.toLowerCase();
    if (lowerIntent.includes('rti') || lowerIntent.includes('सूचना')) return 'RTI Application';
    if (lowerIntent.includes('gift') || lowerIntent.includes('daan')) return 'Gift Deed';
    if (lowerIntent.includes('sale') || lowerIntent.includes('sell')) return 'Sale Deed';
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
