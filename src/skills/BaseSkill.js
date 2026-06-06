/**
 * BaseSkill — हर स्किल का आधार (Base Template)
 * 
 * नई स्किल बनाने के लिए बस इसे extend करें:
 *   class MySkill extends BaseSkill { ... }
 * 
 * हर स्किल में होना चाहिए:
 *   - name: यूनिक नाम (जैसे 'job_search')
 *   - displayName: दिखाने वाला नाम (जैसे 'नौकरी खोज')
 *   - intents: कौन-कौन से इरादे (intents) यह स्किल संभाल सकती है
 *   - keywords: हिंदी/इंग्लिश/हिंग्लिश में कीवर्ड्स (AI न हो तो backup)
 *   - execute(): मुख्य कार्य
 *
 * SELF-LEARNING: हर BaseSkill automatic learning karta hai!
 *   - User inputs analyze hote hain
 *   - Naye keywords auto-learn hote hain
 *   - Failed patterns track hote hain
 *   - Successful patterns yaad rahte hain
 */

const { learningEngine } = require('../core/learningEngine');

class BaseSkill {
  constructor() {
    // ─── स्किल की पहचान (Identity) ───
    this.name = '';                  // यूनिक ID, जैसे: 'job_search'
    this.displayName = '';           // दिखाने के लिए नाम: 'नौकरी खोज'
    this.displayNameEn = '';         // English नाम: 'Job Search'
    this.description = '';           // क्या करती है (Hindi)
    this.descriptionEn = '';         // What it does (English)
    this.version = '1.0.0';
    this.author = 'Harshita-AI';

    // ─── इरादे (Intents) जो यह स्किल संभालती है ───
    this.intents = [];               // जैसे: ['job_search', 'find_vacancy', 'naukri_dhundho']

    // ─── कीवर्ड्स (AI Backup) — जब AI उपलब्ध न हो ───
    this.keywords = {
      hi: [],        // हिंदी: ['नौकरी', 'भर्ती', 'वैकेंसी']
      en: [],        // English: ['job', 'vacancy', 'recruitment']
      hinglish: []   // हिंग्लिश: ['naukri', 'bharti', 'form bharo']
    };

    // ─── तकनीकी जानकारी (Technical Info) ───
    this.canRunOffline = false;      // क्या बिना इंटरनेट चल सकती है?
    this.requiresAuth = false;       // क्या लॉगिन चाहिए?
    this.requiresGPU = false;        // क्या GPU चाहिए?
    this.priority = 5;              // 1-10, ज्यादा = ज्यादा ज़रूरी
    this.category = 'general';      // 'government', 'document', 'automation', 'utility'

    // ─── Dependencies ───
    this.requiredAgents = [];        // कौन से एजेंट्स चाहिए: ['documentAIAgent']
    this.requiredAPIs = [];          // कौन से API keys चाहिए: ['GROQ_API_KEY']
    this.requiredServices = [];      // कौन सी सर्विसेज़: ['redis', 'prisma']

    // ─── Runtime State ───
    this.isLoaded = false;
    this.lastUsed = null;
    this.usageCount = 0;
  }

  // ═══════════════════════════════════════════════════════════
  //  मुख्य कार्य (Main Method) — हर स्किल को यह implement करना होगा
  // ═══════════════════════════════════════════════════════════

  /**
   * स्किल को चलाओ (Execute the skill)
   * 
   * @param {Object} context - सारी जानकारी
   * @param {string} context.userId - यूज़र ID
   * @param {string} context.message - यूज़र का मैसेज
   * @param {string} context.intent - पहचाना गया इरादा
   * @param {string} context.lang - भाषा ('hi', 'en', 'hi-Latn')
   * @param {Object} context.params - अतिरिक्त पैरामीटर्स (AI द्वारा निकाले गए)
   * @param {Object} context.io - Socket.IO instance
   * @param {Object} context.app - Express app (for accessing other agents)
   * @returns {Object} - { type, message, data?, action? }
   */
  async execute(context) {
    throw new Error(`⚠️ ${this.name}: execute() method implement नहीं किया गया!`);
  }

  // ═══════════════════════════════════════════════════════════
  //  सहायक विधियाँ (Helper Methods) — सभी स्किल्स इन्हें इस्तेमाल कर सकती हैं
  // ═══════════════════════════════════════════════════════════

  /**
   * क्या यह स्किल इस intent को संभाल सकती है?
   */
  canHandle(intent) {
    return this.intents.includes(intent);
  }

  /**
   * कीवर्ड से मैच करो (AI backup)
   * @returns {number} - confidence score (0-1)
   */
  matchKeywords(text) {
    if (!text) return 0;
    const lower = text.toLowerCase();
    let matches = 0;
    let totalKeywords = 0;

    for (const lang of ['hi', 'en', 'hinglish']) {
      const keywords = this.keywords[lang] || [];
      totalKeywords += keywords.length;
      for (const keyword of keywords) {
        if (lower.includes(keyword.toLowerCase())) {
          matches++;
        }
      }
    }

    return totalKeywords > 0 ? Math.min(matches / Math.max(totalKeywords * 0.3, 1), 1.0) : 0;
  }

  /**
   * स्किल को initialize करो (ज़रूरी setup)
   * Override करें अगर कोई setup चाहिए
   */
  async initialize() {
    this.isLoaded = true;
    console.log(`✅ Skill Loaded: ${this.displayName} (${this.name})`);
  }

  /**
   * स्किल की Health Check
   */
  async healthCheck() {
    return {
      name: this.name,
      healthy: this.isLoaded,
      usageCount: this.usageCount,
      lastUsed: this.lastUsed
    };
  }

  /**
   * स्किल की पूरी जानकारी (Metadata)
   */
  getMetadata() {
    return {
      name: this.name,
      displayName: this.displayName,
      displayNameEn: this.displayNameEn,
      description: this.description,
      version: this.version,
      intents: this.intents,
      keywords: this.keywords,
      canRunOffline: this.canRunOffline,
      requiresAuth: this.requiresAuth,
      requiresGPU: this.requiresGPU,
      priority: this.priority,
      category: this.category,
      isLoaded: this.isLoaded,
      usageCount: this.usageCount
    };
  }

  /**
   * Usage ट्रैक करो
   */
  _trackUsage() {
    this.usageCount++;
    this.lastUsed = new Date();
  }

  /**
   * रिस्पॉन्स बनाने का हेल्पर
   */
  _reply(message, data = null, action = null) {
    this._trackUsage();
    const response = { type: 'ai', message, skill: this.name };
    if (data) response.data = data;
    if (action) response.action = action;
    return response;
  }

  /**
   * एरर रिस्पॉन्स
   */
  _error(message) {
    return { type: 'error', message, skill: this.name };
  }

  // ═══════════════════════════════════════════════════════════
  //  Self-Learning Helpers — har skill use kar sakti hai
  // ═══════════════════════════════════════════════════════════

  /**
   * Conversation history record karo (user message + AI response)
   * Skill ke execute() mein call karein:
   *   this._remember(userId, message, response.message)
   */
  _remember(userId, userMessage, aiResponse, success = true) {
    try {
      const { conversationMemory } = require('../core/conversationMemory');
      const { learningEngine } = require('../core/learningEngine');

      // Save conversation
      conversationMemory.addMessage(userId, this.name, 'user', userMessage);
      conversationMemory.addMessage(userId, this.name, 'assistant', aiResponse, { success });

      // Track in learning engine
      learningEngine.learn(this.name, userId, userMessage, { message: aiResponse }, success);
    } catch (e) {
      // Don't break skill if memory fails
    }
  }

  /**
   * Past conversation context lao (last N messages)
   * AI prompts mein use karein for better context
   */
  _getContext(userId, lastN = 5) {
    try {
      const { conversationMemory } = require('../core/conversationMemory');
      return conversationMemory.getContextString(userId, this.name, lastN);
    } catch {
      return '';
    }
  }

  /**
   * Past similar queries dhundo (auto-learning patterns)
   */
  _findSimilarPast(userId, currentInput, limit = 3) {
    try {
      const { learningEngine } = require('../core/learningEngine');
      return learningEngine.findSimilarPatterns(this.name, currentInput, limit);
    } catch {
      return [];
    }
  }

  /**
   * Collaborative Cognitive Action: Query another specialized skill from the registry.
   */
  async queryOtherSkill(targetSkillName, context) {
    try {
      const { SkillRegistry } = require('./SkillRegistry');
      const registry = new SkillRegistry();
      await registry.autoLoad();
      const targetSkill = registry.getSkill(targetSkillName);
      if (targetSkill) {
        return await targetSkill.execute(context);
      }
    } catch (e) {
      console.warn(`[BaseSkill] Failed to collaborate with ${targetSkillName}:`, e.message);
    }
    return null;
  }
}

module.exports = { BaseSkill };
