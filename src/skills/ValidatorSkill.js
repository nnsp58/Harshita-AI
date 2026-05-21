/**
 * ValidatorSkill — डेटा और डॉक्यूमेंट वैलिडेशन
 */
const { BaseSkill } = require('./BaseSkill');

class ValidatorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'validator';
    this.displayName = 'डेटा वैलिडेटर';
    this.displayNameEn = 'Data Validator';
    this.description = 'आधार, पैन और अन्य डेटा की शुद्धता की जाँच';
    this.descriptionEn = 'Validate Aadhaar, PAN and other data accuracy';
    this.version = '1.0.0';
    this.category = 'system';
    this.canRunOffline = true;
    this.priority = 5;
    this.intents = ['validate_data', 'check_error', 'verify_fields', 'audit_form'];
    this.keywords = {
      hi: ['चेक', 'वैलिडेट', 'गलती', 'सुधार', 'सत्यापन', 'audit'],
      en: ['validate', 'verify', 'audit', 'check', 'error', 'correct'],
      hinglish: ['data check karo', 'galti dhundo', 'form verify karo']
    };
    this.requiredAgents = ['validatorAgent'];
  }

  async execute(context) {
    return this._reply('✅ डेटा वैलिडेशन सिस्टम तैयार है।\n\nआप किसी भी फॉर्म का डेटा या डॉक्यूमेंट नंबर दें, मैं उसकी शुद्धता (Accuracy) चेक कर लूँगा।', { action: 'start_validation' });
  }
}

module.exports = { ValidatorSkill };
