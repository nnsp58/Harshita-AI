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
      
      // Conjunction split check (P0-5 Multi Intent Support)
      const splitKeywords = /\s+(?:aur|and|&|bhi|साथ\s+ही)\s+/gi;
      if (splitKeywords.test(cmd)) {
        const parts = cmd.split(splitKeywords).map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          console.log(`[MasterAgent] Multi-intent detected. Splitting into ${parts.length} tasks:`, parts);
          const results = [];
          for (const part of parts) {
            const res = await this._processSingleCommand(userId, part, options);
            results.push(res);
          }
          
          // Combine results
          const combinedMsg = results.map((r, i) => `[Task ${i+1}: ${parts[i]}]\n${r.message}`).join('\n\n');
          return {
            type: 'ai',
            message: combinedMsg,
            skill: results.map(r => r.skill).join(', '),
            usedLLM: results.some(r => r.usedLLM),
            data: results.map(r => r.data),
            action: results.map(r => r.action).find(a => a !== undefined)
          };
        }
      }

      return this._processSingleCommand(userId, cmd, options);
    } catch (e) {
      console.error(`[MasterAgent] Orchestrator loop failed: ${e.message}`);
      return { type: 'error', message: 'An internal error occurred in the Master Agent.' };
    }
  }

  async _processSingleCommand(userId, cmd, options = {}) {
    // Security Pre-Scan first
    const { SecuritySkill } = require('../skills/SecuritySkill');
    const securityResult = SecuritySkill.scanMessage(cmd);
    if (securityResult) {
      return {
        type: 'ai',
        message: `[रूटिंग सफल] ${securityResult}`,
        skill: 'security_guardrail',
        usedLLM: false
      };
    }

    // FAST PATH: Local Offline Skill-Based Routing (No API Load)
    const detectResult = await this.detector.detect(cmd, options.lang, this._getHistory(userId));
    const conf = Number(detectResult?.confidence) || 0;
    
    let matchedSkill = null;
    if (detectResult?.skill) {
      matchedSkill = this.registry.getSkill(detectResult.skill);
    }

    // Keyword match backup if intent didn't map to a skill (P0-7 Confidence Rule)
    if (!matchedSkill) {
      const bestSkill = this.registry.getAllSkills()
        .filter(s => !this.registry.disabledSkills.has(s.name))
        .map(s => ({ skill: s, score: s.matchKeywords(cmd) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)[0];
        
      if (bestSkill) {
        matchedSkill = bestSkill.skill;
        detectResult.skill = matchedSkill.name;
        detectResult.intent = matchedSkill.intents[0] || matchedSkill.name;
        detectResult.confidence = bestSkill.score;
      }
    }

    // P0-3 & P0-6 Offline-First & LLM Guard Logic
    if (matchedSkill && matchedSkill.canRunOffline) {
      console.log(`[MasterAgent] Running Offline Skill: ${matchedSkill.name}`);
      const context = this._buildContext(userId, cmd, detectResult, options);
      const skillResult = await selfHealingEngine.executeWithHealing(matchedSkill, context, this.registry);
      
      const skillReply = typeof skillResult === 'string' ? skillResult : (skillResult?.message || JSON.stringify(skillResult));
      this._addToHistory(userId, 'user', cmd, detectResult.intent);
      this._addToHistory(userId, 'assistant', skillReply, detectResult.intent);

      return {
         type: 'ai',
         message: skillReply,
         skill: matchedSkill.name,
         usedLLM: false, // Strict LLM Guard
         data: skillResult?.data,
         action: skillResult?.action
      };
    }

    // Execute standard online skill if matched
    if (matchedSkill) {
      console.log(`[MasterAgent] Running Skill: ${matchedSkill.name} (Confidence: ${conf})`);
      const context = this._buildContext(userId, cmd, detectResult, options);
      const skillResult = await selfHealingEngine.executeWithHealing(matchedSkill, context, this.registry);
      
      const skillReply = typeof skillResult === 'string' ? skillResult : (skillResult?.message || JSON.stringify(skillResult));
      this._addToHistory(userId, 'user', cmd, detectResult.intent);
      this._addToHistory(userId, 'assistant', skillReply, detectResult.intent);

      return {
         type: 'ai',
         message: skillReply,
         skill: matchedSkill.name,
         usedLLM: matchedSkill.requiresLLM || false,
         data: skillResult?.data,
         action: skillResult?.action
      };
    }

    // Fallback to General Chat (LLM)
    console.log(`[MasterAgent] Routing to General Chat Agent (LLM Fallback)...`);
    const generalChatSkill = this.registry.getSkill('general_chat');
    
    if (!generalChatSkill) {
       return { type: 'error', message: 'General Chat Agent is unavailable.' };
    }

    const context = this._buildContext(userId, cmd, { intent: 'general_chat', confidence: 1.0 }, options);
    const skillResult = await selfHealingEngine.executeWithHealing(generalChatSkill, context, this.registry);
    
    const skillReply = typeof skillResult === 'string' ? skillResult : (skillResult?.message || JSON.stringify(skillResult));
    
    let formattedMsg = skillReply;
    if (formattedMsg && !formattedMsg.includes('रूटिंग')) {
      formattedMsg = formattedMsg.replace(/^\[[^\]]+रूटिंग[^\]]+\]\s*/, '');
      formattedMsg = `[रूटिंग सफल] ${formattedMsg}`;
    }
    
    this._addToHistory(userId, 'user', cmd, 'general_chat');
    this._addToHistory(userId, 'assistant', formattedMsg, 'general_chat');

    let finalAction = skillResult?.action || {};
    
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
       usedLLM: true,
       data: skillResult?.data,
       action: Object.keys(finalAction).length > 0 ? finalAction : undefined
    };
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
