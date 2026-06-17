/**
 * SecuritySkill — AI Content Moderation & Guardrail (Priority 10)
 * 
 * Ensures Harshita AI never answers illegal, unethical, or inappropriate questions.
 * 
 * Architecture:
 *   1. SecuritySkill.scanMessage(text) — static method called by IntentDetector
 *      BEFORE any skill routing happens.
 *   2. If dangerous content detected → returns blocked response immediately.
 *   3. If safe → returns null, routing continues normally.
 */
const { BaseSkill } = require('./BaseSkill');

class SecuritySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'security_guardrail';
    this.displayName = 'Suraksha Guardrail';
    this.displayNameEn = 'Security Guardrail';
    this.description = 'अवैध और अनुचित प्रश्नों को तुरंत रोकना';
    this.descriptionEn = 'Blocks illegal and inappropriate questions immediately.';
    this.version = '2.0.0';
    this.category = 'security';
    this.canRunOffline = true;
    this.priority = 10; // Highest priority

    this.intents = ['illegal_activity'];

    this.keywords = {
      hi: ['hack', 'हैकिंग', 'बम', 'bomb', 'fake', 'जाली', 'illegal', 'गैर कानूनी'],
      en: ['hack', 'bomb', 'illegal', 'drugs', 'weapon', 'porn', 'scam', 'fraud'],
      hinglish: ['hack karo', 'bomb banao', 'fake aadhaar', 'otp bypass']
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  STATIC PRE-SCAN — Called by IntentDetector BEFORE routing
  //  Returns blocked response object if dangerous, null if safe
  // ═══════════════════════════════════════════════════════════

  /**
   * Static pre-scan method. Call this before routing any message.
   * @param {string} text - User's raw message
   * @returns {Object|null} - Blocked response if dangerous, null if safe
   */
  static scanMessage(text) {
    if (!text) return null;
    const lower = text.toLowerCase();

    // Exact dangerous phrases (high confidence → block immediately)
    const dangerousPhrases = [
      'hack bank', 'hack account', 'hack website', 'hack server',
      'bypass otp', 'otp bypass', 'otp hack', 'otp chori',
      'fake aadhaar', 'fake aadhar', 'fake pan', 'jali aadhaar', 'jali aadhar',
      'bomb banana', 'bomb banao', 'bomb kaise banta', 'bomb kaise banaye',
      'fake certificate', 'jali certificate', 'nakli certificate',
      'hack karo', 'hack karna', 'hacking sikhao', 'hacking seekho',
      'drug dealer', 'drugs kahan', 'ganja kahan', 'charas kahan',
      'weapon buy', 'gun kharidna', 'hathiyar kharidna',
      'kill someone', 'poison kaise', 'suicide kaise', 'marne ka tarika',
      'child porn', 'xxx video', 'rape video',
      'fraud karna', 'scam karna', 'paisa lootna', 'bank fraud',
      'fake voter id', 'fake driving license', 'nakli licence',
    ];

    for (const phrase of dangerousPhrases) {
      if (lower.includes(phrase)) {
        return SecuritySkill._blockedResponse(phrase);
      }
    }

    // Single dangerous keywords — only block when combined (at least 2 matches)
    const dangerousWords = [
      'hack', 'hacking', 'हैकिंग',
      'bomb', 'बम', 'explosive', 'विस्फोटक',
      'fake', 'nakli', 'जाली', 'नकली',
      'illegal', 'गैर कानूनी', 'गैरकानूनी',
      'drugs', 'नशा', 'smack', 'heroin',
      'weapon', 'हथियार', 'gun', 'बंदूक',
      'porn', 'xxx', 'adult video',
      'suicide', 'आत्महत्या',
      'kill', 'murder', 'हत्या',
      'scam', 'fraud', 'धोखाधड़ी',
      'bypass', 'चोरी',
    ];

    let matchCount = 0;
    const matched = [];
    for (const word of dangerousWords) {
      // Use word boundary check for short words to avoid false positives
      const hasMatch = word.length <= 4 
        ? new RegExp(`\\b${word}\\b`, 'i').test(lower) 
        : lower.includes(word);
      if (hasMatch) {
        matchCount++;
        matched.push(word);
      }
    }

    // Need 2+ dangerous keyword matches to block (avoids false positives)
    if (matchCount >= 2) {
      return SecuritySkill._blockedResponse(matched.join(', '));
    }

    return null; // Safe — continue routing
  }

  /**
   * Build the blocked response object
   */
  static _blockedResponse(trigger) {
    console.warn(`[SecuritySkill] ⛔ BLOCKED — Trigger: "${trigger}"`);
    return {
      type: 'ai',
      message: '⚠️ **सुरक्षा चेतावनी (Security Alert)**\n\n' +
        'मैं **Harshita AI** हूँ, एक सुरक्षित और एथिकल सरकारी सेवा सहायक।\n' +
        'मैं किसी भी प्रकार की **अवैध (illegal), हैकिंग, या अनुचित** गतिविधि का समर्थन नहीं करती और न ही ऐसे सवालों के जवाब देती हूँ।\n\n' +
        '🛡️ यह प्रश्न सुरक्षा नीति के अंतर्गत रोका गया है।\n\n' +
        'कृपया केवल कानूनी और अधिकृत कार्यों के लिए मेरा उपयोग करें।',
      skill: 'security_guardrail',
      blocked: true,
      trigger: trigger,
    };
  }

  // Standard execute (if IntentDetector routes here via 'illegal_activity' intent)
  async execute(context) {
    return {
      type: 'ai',
      message: '⚠️ **सुरक्षा चेतावनी (Security Alert)**\n\n' +
        'मैं **Harshita AI** हूँ, एक सुरक्षित और एथिकल सरकारी सेवा सहायक।\n' +
        'मैं किसी भी प्रकार की **अवैध (illegal), हैकिंग, या अनुचित** गतिविधि का समर्थन नहीं करती और न ही ऐसे सवालों के जवाब देती हूँ।\n\n' +
        'कृपया केवल कानूनी और अधिकृत कार्यों के लिए मेरा उपयोग करें।',
      skill: this.name,
      blocked: true,
    };
  }
}

module.exports = { SecuritySkill };
