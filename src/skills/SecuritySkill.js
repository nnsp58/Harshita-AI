/**
 * SecuritySkill — AI Content Moderation & Guardrail (Priority 10)
 * 
 * Ensures Harshita AI never answers illegal, unethical, or inappropriate questions.
 * It runs before any other skill.
 */
const { BaseSkill } = require('./BaseSkill');

class SecuritySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'security_guardrail';
    this.displayName = 'Suraksha Guardrail';
    this.description = 'Blocks illegal and inappropriate questions immediately.';
    this.version = '1.0.0';
    this.category = 'security';
    this.canRunOffline = true;
    this.priority = 10; // Highest priority — intercepts everything first

    this.intents = ['illegal_activity'];

    // Keywords that trigger the security block
    this.keywords = {
      hi: ['hack', 'हैकिंग', 'बम', 'bomb', 'fake', 'जाली', 'illegal', 'गैर कानूनी', 'गैंग', 'gang', 'drugs', 'हथियार', 'weapon', 'porn', 'adult', 'abuse', 'गाली', 'bypass', 'scam', 'fraud', 'चोरी']
    };
  }

  // Override canHandle to be extremely aggressive in matching
  canHandle(intent, text = '') {
    if (super.canHandle(intent, text)) return true;
    
    const lowerText = text.toLowerCase();
    const badWords = [
      'hack', 'bomb', 'fake aadhaar', 'fake pan', 'illegal', 'drugs', 'weapon', 'porn', 'xxx', 
      'abuse', 'scam', 'fraud', 'bypass otp', 'hack bank', 'मारने का तरीका', 'suicide', 'kill'
    ];

    return badWords.some(word => lowerText.includes(word));
  }

  async execute(context) {
    // Immediate block message
    return this._reply(
      '⚠️ **सुरक्षा चेतावनी (Security Alert)**\n\n' +
      'मैं **Harshita AI** हूँ, एक सुरक्षित और एथिकल सरकारी सेवा सहायक।\n' +
      'मैं किसी भी प्रकार की **अवैध (illegal), हैकिंग, या अनुचित** गतिविधि का समर्थन नहीं करती और न ही ऐसे सवालों के जवाब देती हूँ।\n\n' +
      'कृपया केवल कानूनी और अधिकृत कार्यों के लिए मेरा उपयोग करें।'
    );
  }
}

module.exports = { SecuritySkill };
