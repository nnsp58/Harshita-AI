/**
 * MasterAgent V2 — Smart AI-Powered Orchestrator
 * 
 * ═══════════════════════════════════════════════════════════
 *  पुराना (V1): सिर्फ 3-4 keywords पकड़ता था
 *  नया (V2):    AI से कोई भी बात समझता है + Skill System
 * ═══════════════════════════════════════════════════════════
 * 
 * काम करने का तरीका:
 *   1. यूज़र कुछ बोलता है (Hindi/English/Hinglish/Voice)
 *   2. IntentDetector AI से intent पहचानता है
 *   3. SkillRegistry से सही Skill ढूंढता है
 *   4. उस Skill को execute करता है
 *   5. रिज़ल्ट यूज़र को भेजता है
 * 
 * नई Skill जोड़ना = सिर्फ /src/skills/ में फाइल बनाना, बस!
 */

const { SkillRegistry } = require('../skills/SkillRegistry');
const { IntentDetector } = require('../skills/IntentDetector');
const { selfHealingEngine } = require('../core/SelfHealingEngine');
const { verificationEngine } = require('../core/VerificationEngine');
const { memoryEngine } = require('../core/MemoryEngine');

class MasterAgent {
  constructor(io) {
    this.io = io;
    this.registry = new SkillRegistry();
    this.detector = null; // IntentDetector — registry load होने के बाद बनेगा
    this.isReady = false;

    // Conversation history (per user) — context के लिए
    this.conversations = new Map();
    this.maxHistory = 10;

    // Initialize
    this._init();
  }

  /**
   * Skill System Initialize करो
   */
  async _init() {
    try {
      // सभी Skills ऑटो-लोड करो
      await this.registry.autoLoad();

      // IntentDetector बनाओ (registry से intent list लेगा)
      this.detector = new IntentDetector(this.registry);

      this.isReady = true;
      console.log('🧠 MasterAgent V2 Ready — Smart Skill-Based Routing Active');
    } catch (error) {
      console.error('❌ MasterAgent V2 init failed:', error.message);
      this.isReady = false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  मुख्य Entry Point — हर command यहाँ आता है
  // ═══════════════════════════════════════════════════════════

  /**
   * यूज़र का command प्रोसेस करो
   * 
   * @param {string} userId - यूज़र ID
   * @param {string} cmd - यूज़र का मैसेज (Hindi/English/Hinglish कुछ भी)
   * @param {Object} options - अतिरिक्त विकल्प { app, lang, audioPath }
   * @returns {Object} - { type, message, data?, action?, skill? }
   */
  async processCommand(userId, cmd, options = {}) {
    // ── Safety: अगर Skill System तैयार नहीं है ──
    if (!this.isReady || !this.detector) {
      console.warn('[MasterAgent] ⚠️ Skill System अभी load हो रहा है...');
      return { type: 'ai', message: 'सिस्टम लोड हो रहा है, कृपया कुछ सेकंड रुकें...' };
    }

    try {
      console.log(`\n🎯 [MasterAgent Orchestrator] User ${userId}: "${cmd.substring(0, 60)}..."`);
      
      // Security Pre-Scan first
      const { SecuritySkill } = require('../skills/SecuritySkill');
      const securityResult = SecuritySkill.scanMessage(cmd);
      if (securityResult) {
        return {
          type: 'ai',
          message: `[रूटिंग सफल] ${securityResult}`,
          skill: 'security_guardrail'
        };
      }

      // FAST PATH: Local Offline Skill-Based Routing (No API Load)
      const detectResult = await this.detector.detect(cmd, options.lang, this._getHistory(userId));
      
      const { ApiFirewall } = require('../utils/ApiFirewall');
      
      if (detectResult && detectResult.skill && detectResult.skill !== 'general_chat') {
        const skill = this.registry.getSkill(detectResult.skill);
        if (skill) {
          console.log(`[MasterAgent] Offline Skill-Based Routing to: ${detectResult.skill} (Confidence: ${detectResult.confidence})`);
          const startTime = Date.now();
          
          const context = this._buildContext(userId, cmd, detectResult, options);
          const skillResult = await selfHealingEngine.executeWithHealing(skill, context, this.registry);
          const skillReply = typeof skillResult === 'string' ? skillResult : (skillResult?.message || JSON.stringify(skillResult));
          
          const execTime = Date.now() - startTime;
          ApiFirewall.logExecution(detectResult.intent, detectResult.skill, execTime, false, 'N/A', 'Local Offline Match');
          
          return {
             type: 'ai',
             message: skillReply,
             skill: detectResult.skill,
             data: skillResult?.data,
             action: skillResult?.action
          };
        }
      }

      // If no local skill is found, proceed to GeneralChatAgent (Department-Based Routing)
      console.log(`[MasterAgent] No specific skill found, routing to General Chat Agent...`);
      const generalChatSkill = this.registry.getSkill('general_chat');
      
      if (!generalChatSkill) {
         return { type: 'error', message: 'General Chat Agent is unavailable.' };
      }

      const context = this._buildContext(userId, cmd, { intent: 'general_chat', confidence: 1.0 }, options);
      const skillResult = await selfHealingEngine.executeWithHealing(generalChatSkill, context, this.registry);
      
      // Verification
      const verifyResult = await verificationEngine.verify(generalChatSkill, context, skillResult);
      let finalResult = skillResult;
      
      if (!verifyResult.verified && verifyResult.confidence === 0) {
         console.warn(`[MasterAgent] Verification failed for General Chat:`, verifyResult.issues);
         finalResult = generalChatSkill._error(`Validation Error: ${verifyResult.issues.join(', ')}`);
      }

      const skillReply = typeof finalResult === 'string' ? finalResult : (finalResult?.message || JSON.stringify(finalResult));
      
      let formattedMsg = skillReply;
      if (formattedMsg && !formattedMsg.includes('रूटिंग')) {
        formattedMsg = formattedMsg.replace(/^\[[^\]]+रूटिंग[^\]]+\]\s*/, '');
        formattedMsg = `[रूटिंग सफल] ${formattedMsg}`;
      }
      
      let finalAction = finalResult?.action || {};
      
      // 🎙️ GLOBAL VOICE MODE
      const voiceSkill = this.registry.getSkill('voice_agent');
      if (voiceSkill && typeof voiceSkill.isVoiceModeEnabled === 'function' && voiceSkill.isVoiceModeEnabled(userId)) {
        finalAction.speak = true;
        if (!finalAction.text) finalAction.text = formattedMsg;
      }

      return {
         type: 'ai',
         message: formattedMsg,
         skill: 'general_chat',
         data: finalResult?.data,
         action: Object.keys(finalAction).length > 0 ? finalAction : undefined
      };

    } catch (error) {
      console.error(`[MasterAgent] Orchestrator loop failed: ${error.message}`);
      return { type: 'error', message: 'An internal error occurred in the Master Agent.' };
    }
  }


  // ═══════════════════════════════════════════════════════════
  //  Context Builder — Skill को सारी जानकारी देने के लिए
  // ═══════════════════════════════════════════════════════════

  _buildContext(userId, message, detection, options = {}) {
    // Merge frontend context (docType, language, skill) into params
    const frontendContext = options.context || {};
    const detectedParams = detection.params || {};
    
    // Inject User Profile from MemoryEngine
    const userProfile = memoryEngine.getUserProfile(userId);

    return {
      userId,
      message,
      intent: detection.intent,
      confidence: detection.confidence,
      params: { ...detectedParams, ...frontendContext },
      lang: frontendContext.language || options.lang || userProfile.preferences.language || 'hi',
      userProfile, // V2: Pass full memory profile to skills
      io: this.io,
      app: options.app || null,
      audioPath: options.audioPath || null,
      history: this._getHistory(userId)
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  Conversation History
  // ═══════════════════════════════════════════════════════════

  _addToHistory(userId, role, message, intent) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    const history = this.conversations.get(userId);
    history.push({ role, message: message?.substring(0, 200), intent, time: new Date() });

    // ज्यादा पुरानी history हटाओ
    if (history.length > this.maxHistory) {
      history.splice(0, history.length - this.maxHistory);
    }
  }

  _getHistory(userId) {
    return this.conversations.get(userId) || [];
  }

  // ═══════════════════════════════════════════════════════════
  //  Dashboard / API Endpoints के लिए
  // ═══════════════════════════════════════════════════════════

  /**
   * सभी उपलब्ध Skills की जानकारी
   */
  getAvailableSkills() {
    return this.registry.getSkillSummary();
  }

  /**
   * System Stats
   */
  getStats() {
    return {
      isReady: this.isReady,
      skills: this.registry.getStats(),
      activeUsers: this.conversations.size
    };
  }

  /**
   * Health Check
   */
  async healthCheck() {
    return await this.registry.healthCheckAll();
  }
}

module.exports = { MasterAgent };
