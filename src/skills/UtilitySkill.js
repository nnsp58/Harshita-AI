/**
 * UtilitySkill — QR Generator, Password Creator, Calculator
 * 
 * Handles utility intents and triggers the native UtilityTools component.
 */
const { BaseSkill } = require('./BaseSkill');

class UtilitySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'utility_tools';
    this.displayName = 'यूटिलिटी टूल्स';
    this.displayNameEn = 'Utility Tools';
    this.description = 'QR कोड, पासवर्ड और कैलकुलेटर';
    this.descriptionEn = 'QR Code, Password Generator, Calculator';
    this.version = '2.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 4;
    
    this.intents = ['generate_qr', 'generate_password', 'calculator'];
    this.keywords = {
      hi: ['क्यूआर कोड', 'पासवर्ड', 'कैलकुलेटर', 'हिसाब'],
      en: ['qr code', 'password', 'calculator', 'math'],
      hinglish: ['qr banao', 'password bana do', 'calculate karo']
    };
  }

  async execute(context) {
    return this._reply(
      '🛠️ *Quick Utility Tools*\n\nमैंने यूटिलिटी हब खोल दिया है। यहाँ आप **QR Code** बना सकते हैं, **Secure Password** जनरेट कर सकते हैं, या **Calculator** का इस्तेमाल कर सकते हैं।',
      { mode: 'open_tool', toolName: 'UtilityTools' }
    );
  }
}

module.exports = { UtilitySkill };
