/**
 * IntentDetector — AI-Powered Intent Detection System
 * 
 * यह सिस्टम यूज़र के मैसेज से उसका इरादा (intent) पहचानता है।
 * 
 * काम करने का तरीका:
 *   1. पहले AI (Groq/Gemini) से पूछता है — सबसे सटीक
 *   2. अगर AI न मिले, तो कीवर्ड मैचिंग से पहचानता है — backup
 * 
 * उदाहरण:
 *   "मुझे SSC की नौकरी चाहिए"   → intent: 'job_search'
 *   "राशन कार्ड बनवाओ"          → intent: 'ration_card'
 *   "TA/DA निकालो"               → intent: 'tada_process'
 *   "आधार कार्ड से नाम निकालो"   → intent: 'document_ocr'
 */

const { aiProviderManager } = require('../utils/aiProviderManager');
const { SecuritySkill } = require('./SecuritySkill');

class IntentDetector {
  constructor(skillRegistry) {
    this.registry = skillRegistry;
    this.name = 'IntentDetector';

    // Cache — बार-बार AI को न पूछना पड़े
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 मिनट
  }

  // ═══════════════════════════════════════════════════════════
  //  मुख्य विधि: Intent पहचानो
  // ═══════════════════════════════════════════════════════════

  /**
   * यूज़र के मैसेज से intent पहचानो
   * 
   * @param {string} userMessage - यूज़र ने क्या कहा
   * @param {Array} history - Conversation history
   * @returns {Object} - { intent, confidence, skill, params, method }
   */
  async detect(userMessage, lang = null, history = []) {
    if (!userMessage || userMessage.trim().length === 0) {
      return { intent: 'general_chat', confidence: 0, skill: null, params: {}, method: 'empty' };
    }

    const cleanMessage = userMessage.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    const cacheKey = cleanMessage.toLowerCase().substring(0, 100);

    // ── Step 0A: HARDCODED OVERRIDES (Highest priority for known misrouted patterns) ──
    // "passport photo banao", "passport size photo", etc. → ALWAYS PhotoMaker, never OCR
    if (/passport.*(?:photo|size|banao|banana|फोटो|साइज़|साइज|बनाओ|बनाना)|photo.*passport|पासपोर्ट.*(?:फोटो|साइज़|साइज|बनाओ)/i.test(lowerMessage)) {
      const result = { intent: 'create_passport_photo', confidence: 1.0, params: {}, method: 'hardcoded_override' };
      const skill = this.registry.findByIntent('create_passport_photo');
      if (skill) { result.skill = skill.name; result.skillDisplayName = skill.displayName; }
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // "application likhni hai principal ko" or school/leave application -> application_writer (letter writing)
    if (/application.*(?:likh|लिख|principal|headmaster|sir|madam)|(?:likh|लिख).*application|prarthna.*patra|प्रार्थना.*पत्र|chutti|अवकाश/i.test(lowerMessage)) {
      const result = { intent: 'application_writer', confidence: 1.0, params: {}, method: 'hardcoded_override' };
      const skill = this.registry.findByIntent('application_writer');
      if (skill) { result.skill = skill.name; result.skillDisplayName = skill.displayName; }
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // ── Step 0: Security Pre-Scan (HIGHEST PRIORITY) ──
    // Runs BEFORE cache, AI, or keywords — blocks dangerous queries immediately
    const securityResult = SecuritySkill.scanMessage(cleanMessage);
    if (securityResult) {
      return {
        intent: 'illegal_activity',
        confidence: 1.0,
        skill: 'security_guardrail',
        skillDisplayName: 'Suraksha Guardrail',
        params: {},
        method: 'security_scan',
        blocked: true,
        blockedResponse: securityResult,
      };
    }

    // Cache check
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return { ...cached.result, method: 'cache' };
    }

    // ── Step 1: AI-based Detection (Best accuracy) ──
    let result = await this._detectWithAI(cleanMessage, lang, history);

    // ── Step 2: Keyword Fallback (अगर AI fail हो) ──
    if (!result || result.confidence < 0.4) {
      const keywordResult = this._detectWithKeywords(cleanMessage);
      
      // AI result कमज़ोर है तो keyword result लो
      if (!result || keywordResult.confidence > result.confidence) {
        result = keywordResult;
      }
    }

    // ── Step 3: Skill खोजो ──
    if (result.intent && result.intent !== 'general_chat') {
      const skill = this.registry.findByIntent(result.intent);
      if (skill) {
        result.skill = skill.name;
        result.skillDisplayName = skill.displayName;
      }
    }

    // Cache में रखो
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  // ═══════════════════════════════════════════════════════════
  //  AI-Based Detection (Groq / Gemini / OpenAI)
  // ═══════════════════════════════════════════════════════════

  async _detectWithAI(message, lang, history = []) {
    try {
      // सभी उपलब्ध intents की लिस्ट बनाओ
      const availableIntents = this._buildIntentList();

      // Build context from history
      let historyContext = '';
      if (history && history.length > 0) {
        historyContext = '\nRecent Conversation History:\n';
        const recentHistory = history.slice(-3); // Last 3 messages
        recentHistory.forEach(h => {
          historyContext += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.message}\n`;
        });
      }

      const prompt = `You are an intent classifier for "Harshita AI" — a Government Service AI Assistant used in Indian CSC (Common Service Centre) centers.

The user can speak in Hindi, English, or Hinglish (Roman Hindi). Your job is to identify their INTENT.

Available Intents:
${availableIntents}
${historyContext}
Current User Message: "${message}"

CRITICAL RULES FOR ANALYSIS:
1. DEEP ANALYSIS REQUIRED: Read the user's message carefully. Determine their EXACT intention before routing.
2. Return ONLY raw JSON, no markdown, no explanation.
3. **GENERAL KNOWLEDGE / INFORMATIONAL QUESTIONS must ALWAYS go to "general_chat"**:
   - "abhi harshita ai kitne agent kaam kar rahe hai" → general_chat
   - "tell me about your agents" → general_chat
   - "Who invented telephone?" → general_chat
   - "Is bungee jumping dangerous?" → general_chat
   - "naukari pane ke liye 11 me best subject konsa hai?" → general_chat (advice, NOT skill)
   - "kya sarkari job ke liye 12 pass hona jaruri hota h?" → general_chat (educational query)
   - ANY question asking about Harshita AI, agents, general information, career advice, facts, science, health, or situational law → general_chat
4. **Only route to a specific skill when the user clearly wants to USE A SERVICE:**
   - "Mera SSC ka eligibility check karo" → eligibility_check
   - "SSC ka form bharo" → form_fill
   - "passport size photo banao" → create_passport_photo
   - "photo compress karo" → compress_file
5. **Follow-up responses ("haan", "yes", "ok") should use conversation history.** If history has NO relevant service context, route to general_chat.
6. **When in doubt, choose "general_chat"** — it's better to give a conversational AI answer than to route to the wrong service.
7. Extract any useful parameters into "params".
8. Confidence should be 0.0 to 1.0. Use LOW confidence (< 0.4) if the intent is ambiguous.

Return format:
{"intent": "intent_name", "confidence": 0.85, "params": {"key": "value"}}`;

      const response = await aiProviderManager.createChatCompletion(this.name, {
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
        responseFormat: 'json'
      });

      let content = response.choices[0].message.content.trim();
      // Markdown code block हटाओ अगर AI ने लगाया हो
      content = content.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');

      const parsed = JSON.parse(content);

      return {
        intent: parsed.intent || 'general_chat',
        confidence: parsed.confidence || 0.5,
        params: parsed.params || {},
        method: 'ai'
      };

    } catch (error) {
      console.error('[IntentDetector] AI detection failed:', error.message);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  Keyword-Based Detection (Offline Backup)
  // ═══════════════════════════════════════════════════════════

  _detectWithKeywords(message) {
    const skills = this.registry.getAllSkills();
    let bestMatch = { intent: 'general_chat', confidence: 0, params: {}, method: 'keyword' };

    for (const skill of skills) {
      const confidence = skill.matchKeywords(message);
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          intent: skill.intents[0] || skill.name,
          confidence,
          params: {},
          method: 'keyword',
          skill: skill.name,
          skillDisplayName: skill.displayName
        };
      }
    }

    // अगर कोई मैच नहीं मिला, hardcoded keywords भी check करो
    if (bestMatch.confidence < 0.3) {
      const hardcoded = this._hardcodedKeywordMatch(message);
      if (hardcoded.confidence > bestMatch.confidence) {
        bestMatch = hardcoded;
      }
    }

    return bestMatch;
  }

  /**
   * Hardcoded keyword mapping — आखिरी backup
   * जब कोई स्किल लोड न हो तब भी काम करे
   */
  _hardcodedKeywordMatch(message) {
    const lower = message.toLowerCase();

    const intentMap = [
      {
        intent: 'job_search',
        words: ['ssc', 'job', 'naukri', 'bharti', 'vacancy', 'भर्ती', 'नौकरी', 'वैकेंसी',
                'railway', 'army', 'banking', 'police', 'upsc', 'sipahi', 'सिपाही', 'फौज']
      },
      {
        intent: 'tada_process',
        words: ['tada', 'ta/da', 'ta da', 'travel allowance', 'भत्ता', 'यात्रा भत्ता',
                'dearness', 'टीए', 'डीए', 'safar', 'सफर खर्चा']
      },
      {
        intent: 'document_ocr',
        words: ['aadhaar', 'aadhar', 'pan', 'marksheet', 'certificate', 'document', 'scan',
                'आधार', 'पैन', 'मार्कशीट', 'प्रमाणपत्र', 'दस्तावेज़', 'extract', 'निकालो',
                'data nikalo', 'photo se', 'फोटो से']
      },
      {
        intent: 'form_fill',
        words: ['form', 'fill', 'bharo', 'apply online', 'registration', 'register',
                'फॉर्म', 'भरो', 'भरना', 'भरवाओ', 'आवेदन पत्र', 'अप्लाई', 'form bharo', 'form bharwao']
      },
      {
        intent: 'ration_card',
        words: ['ration', 'rashan', 'bpl', 'apl', 'राशन', 'कार्ड', 'बीपीएल', 'खाद्य',
                'ration card', 'rashan card', 'राशन कार्ड']
      },
      {
        intent: 'land_record',
        words: ['land', 'bhulekh', 'khasra', 'khatauni', 'zameen', 'plot', 'registry',
                'भूलेख', 'खसरा', 'खतौनी', 'ज़मीन', 'जमीन', 'रजिस्ट्री', 'पट्टा']
      },
      {
        intent: 'legal_draft',
        words: ['legal', 'draft', 'affidavit', 'agreement', 'kanoon', 'vakeel',
                'कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'एफिडेविट', 'अनुबंध', 'वकील']
      },
      {
        intent: 'project_report',
        words: ['project report', 'pmegp', 'mudra', 'business plan', 'loan',
                'प्रोजेक्ट रिपोर्ट', 'बिजनेस प्लान', 'लोन', 'मुद्रा', 'उद्योग']
      },
      {
        intent: 'ticket_booking',
        words: ['ticket', 'train', 'bus', 'flight', 'booking', 'book',
                'टिकट', 'ट्रेन', 'बस', 'बुकिंग', 'यात्रा']
      },
      {
        intent: 'eligibility_check',
        words: ['eligible', 'eligibility', 'yogya', 'yogyata', 'qualification', 'age limit',
                'योग्य', 'योग्यता', 'पात्रता', 'उम्र सीमा', 'qualification check']
      },
      {
        intent: 'notepad',
        words: ['notepad', 'likho', 'write', 'shayari', 'poem', 'letter', 'type',
                'नोटपैड', 'लिखो', 'शायरी', 'कविता', 'पत्र', 'टाइप']
      },
      {
        intent: 'resume_maker',
        words: ['resume', 'cv', 'biodata', 'curriculum vitae', 'रिज्यूमे', 'बायोडाटा', 'सीवी', 'parcha', 'resume banao', 'biodata banao']
      },
      {
        intent: 'general_chat',
        words: ['hello', 'hi', 'namaste', 'kaise ho', 'help', 'kaun ho',
                'नमस्ते', 'हेलो', 'कैसे हो', 'मदद', 'कौन हो', 'thank', 'धन्यवाद']
      },
      {
        intent: 'self_healing',
        words: ['self healing', 'healing', 'theek karo', 'evolve', 'galtiyan', 'sudharo']
      },
      {
        intent: 'whatsapp',
        words: ['whatsapp', 'मैसेज', 'संदेश', 'भेजो', 'कनेक्ट', 'qr code']
      },
      {
        intent: 'bulk_import',
        words: ['bulk', 'excel', 'csv', 'import', 'बल्क', 'एक्सेल', 'फाइल']
      },
      {
        intent: 'web_learning',
        words: ['seekho portal', 'learn portal', 'website analyze', 'website seekho', 'एनालाइज करो']
      },
      {
        intent: 'ui_builder',
        words: ['ui banao', 'dashboard banao', 'layout banao', 'design karo', 'यूआई बनाओ', 'कंपोनेंट बनाओ']
      },
      {
        intent: 'network_monitor',
        words: ['network check', 'internet speed', 'server status', 'नेटवर्क चेक', 'इंटरनेट स्पीड']
      },
      {
        intent: 'validator',
        words: ['validate karo', 'verify karo', 'audit karo', 'गलती ढूंढो', 'सुधार करो']
      },
      {
        intent: 'file_processor',
        words: ['compress', 'convert', 'pdf', 'image', 'छोटा', 'साइज']
      },
      {
        intent: 'result_generator',
        words: ['mera result', 'result check', 'result dekho', 'merit list', 'score card',
                'नतीजा देखो', 'परिणाम चेक', 'result aa gaya', 'merit dekho']
      }
    ];

    let best = { intent: 'general_chat', confidence: 0.1, params: {}, method: 'keyword_hardcoded' };

    for (const entry of intentMap) {
      let matches = 0;
      for (const word of entry.words) {
        if (lower.includes(word)) matches++;
      }
      // Require higher confidence — single keyword match alone shouldn't trigger routing
      const confidence = matches > 0 ? Math.min(0.25 + (matches * 0.25), 0.9) : 0;
      if (confidence > best.confidence && confidence >= 0.5) {
        best = { intent: entry.intent, confidence, params: {}, method: 'keyword_hardcoded' };
      }
    }

    return best;
  }

  // ═══════════════════════════════════════════════════════════
  //  Utility Methods
  // ═══════════════════════════════════════════════════════════

  /**
   * AI prompt के लिए सभी available intents की list बनाओ
   */
  _buildIntentList() {
    const skills = this.registry.getAllSkills();
    let list = '';
    let index = 1;

    for (const skill of skills) {
      const intents = skill.intents.join(', ');
      const keywords = [...(skill.keywords.hi || []).slice(0, 3), ...(skill.keywords.en || []).slice(0, 3)];
      list += `${index}. ${skill.intents[0]} — ${skill.description || skill.descriptionEn} [Keywords: ${keywords.join(', ')}]\n`;
      index++;
    }

    // General chat — with explicit guidance
    list += `${index}. general_chat — Casual talk, greetings, general knowledge questions, informational queries, "who invented X", "what is Y", study material requests, opinion questions, factual questions, or anything that does NOT require a CSC service action\n`;

    return list;
  }

  /**
   * Cache साफ़ करो
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = { IntentDetector };
