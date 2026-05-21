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
   * @param {string} lang - भाषा (auto-detect if null)
   * @returns {Object} - { intent, confidence, skill, params, method }
   */
  async detect(userMessage, lang = null) {
    if (!userMessage || userMessage.trim().length === 0) {
      return { intent: 'general_chat', confidence: 0, skill: null, params: {}, method: 'empty' };
    }

    const cleanMessage = userMessage.trim();

    // Cache check
    const cacheKey = cleanMessage.toLowerCase().substring(0, 100);
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return { ...cached.result, method: 'cache' };
    }

    // ── Step 1: AI-based Detection (Best accuracy) ──
    let result = await this._detectWithAI(cleanMessage, lang);

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

  async _detectWithAI(message, lang) {
    try {
      const client = aiProviderManager.getClient(this.name);
      if (!client) {
        console.log('[IntentDetector] ⚠️ कोई AI provider नहीं मिला, keyword fallback use होगा');
        return null;
      }

      const model = aiProviderManager.getModel(this.name);

      // सभी उपलब्ध intents की लिस्ट बनाओ
      const availableIntents = this._buildIntentList();

      const prompt = `You are an intent classifier for "Harshita AI" — a Government Service AI Assistant used in Indian CSC (Common Service Centre) centers.

The user can speak in Hindi, English, or Hinglish (Roman Hindi). Your job is to identify their INTENT.

Available Intents:
${availableIntents}

User Message: "${message}"

Rules:
1. Return ONLY raw JSON, no markdown, no explanation
2. If the message is casual talk / greeting, use "general_chat"
3. Extract any useful parameters (like service name, document type, person name) into "params"
4. Confidence should be 0.0 to 1.0

Return format:
{"intent": "intent_name", "confidence": 0.85, "params": {"key": "value"}}`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200
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
        words: ['form', 'fill', 'bharo', 'apply', 'application', 'registration', 'register',
                'फॉर्म', 'भरो', 'भरना', 'भरवाओ', 'आवेदन', 'अप्लाई', 'form bharo', 'form bharwao']
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
        intent: 'whatsapp',
        words: ['whatsapp', 'मैसेज', 'संदेश', 'भेजो', 'कनेक्ट', 'qr code']
      },
      {
        intent: 'bulk_import',
        words: ['bulk', 'excel', 'csv', 'import', 'बल्क', 'एक्सेल', 'फाइल']
      },
      {
        intent: 'web_learning',
        words: ['seekho', 'learn', 'portal', 'website', 'train', 'एनालाइज']
      },
      {
        intent: 'ui_builder',
        words: ['ui', 'dashboard', 'design', 'layout', 'बनाओ', 'कंपोनेंट']
      },
      {
        intent: 'network_monitor',
        words: ['network', 'internet', 'speed', 'server', 'status', 'चेक']
      },
      {
        intent: 'validator',
        words: ['validate', 'verify', 'correct', 'audit', 'गलती', 'सुधार']
      },
      {
        intent: 'file_processor',
        words: ['compress', 'convert', 'pdf', 'image', 'छोटा', 'साइज']
      },
      {
        intent: 'result_generator',
        words: ['result', 'merit', 'score', 'check', 'नतीजा', 'परिणाम']
      }
    ];

    let best = { intent: 'general_chat', confidence: 0.1, params: {}, method: 'keyword_hardcoded' };

    for (const entry of intentMap) {
      let matches = 0;
      for (const word of entry.words) {
        if (lower.includes(word)) matches++;
      }
      const confidence = matches > 0 ? Math.min(0.3 + (matches * 0.2), 0.9) : 0;
      if (confidence > best.confidence) {
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

    // General chat हमेशा available रहे
    list += `${index}. general_chat — Casual talk, greetings, or unclear messages\n`;

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
