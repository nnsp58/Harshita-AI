/**
 * IntentDetector (v4) — PRD-013 Multi-Model Intelligent Fallback Engine
 * Step 1: Offline First - Checks all offline knowledge categories before any API call
 */
const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { SecuritySkill } = require('./SecuritySkill');
const { documentIntelligence } = require('./DocumentIntelligenceEngine');

// PRD-013 Offline Knowledge Categories
const OFFLINE_CATEGORIES = [
  'Math', 'Physics', 'Chemistry', 'Biology', 'Medical', 'Geography', 'History',
  'Grammar', 'Translation', 'Dictionary', 'Periodic Table', 'Formula Database',
  'Land Measurement', 'GST Formula', 'TA/DA', 'ITR Rules', 'Legal Rules',
  'Government Schemes', 'Resume', 'Application', 'Calculator', 'Unit Conversion',
  'Date Time', 'Percentage', 'Age', 'Interest', 'Distance', 'Area', 'Volume',
  'Scientific Constants', 'Offline Knowledge'
];

class IntentDetector {
  constructor(skillRegistry) {
    this.registry = skillRegistry;
    this.name = 'IntentDetector';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000;
    this.overrides = [];
    this._loadOverrides();
    
    // PRD-013 Offline Knowledge Database
    this.offlineKnowledge = new Map();
    this._loadOfflineKnowledge();
  }

  _loadOfflineKnowledge() {
    try {
      const p = path.join(process.cwd(), 'data', 'offline-knowledge.json');
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        for (const [category, entries] of Object.entries(data)) {
          this.offlineKnowledge.set(category.toLowerCase(), entries);
        }
        console.log(`[IntentDetector] Loaded ${this.offlineKnowledge.size} offline knowledge categories`);
      }
    } catch (e) {
      console.error('[IntentDetector] Error loading offline knowledge:', e.message);
    }
  }

  _loadOverrides() {
    try {
      const p = path.join(process.cwd(), 'data', 'intent-overrides.json');
      if (fs.existsSync(p)) {
        this.overrides = JSON.parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (e) {
      console.error('[IntentDetector] Error loading overrides:', e.message);
    }
  }

  async detect(userMessage, lang = null, history = []) {
    if (!userMessage || userMessage.trim().length === 0) {
      return { intent: 'general_chat', confidence: 0, skill: null, params: {}, method: 'empty' };
    }

    const cleanMessage = userMessage.trim();
    const lowerMessage = this.normalizeText(cleanMessage);
    const cacheKey = lowerMessage.substring(0, 100);

    // Step 0: Security Scan
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

    // Step 1: Offline Knowledge Check (PRD-013)
    const offlineResult = this._checkOfflineKnowledge(cleanMessage, lowerMessage);
    if (offlineResult) {
      console.log(`[IntentDetector] PRD-013 Offline Knowledge HIT for: ${offlineResult.category}`);
      const skill = this.registry.findByIntent(offlineResult.intent);
      const result = {
        intent: offlineResult.intent,
        confidence: 0.99,
        params: { raw: cleanMessage, offlineAnswer: offlineResult.answer, category: offlineResult.category },
        method: 'offline_knowledge',
      };
      if (skill) {
        result.skill = skill.name;
        result.skillDisplayName = skill.displayName;
      }
      return this._finalizeResult(result, cacheKey);
    }

    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return { ...cached.result, method: 'cache' };
    }

    // Determine Information vs Execution
    const isInfo = /(?:kya hai|batao|bare me|explain|what is|how to|kaise|kaun|who|where|kaha|kab|when|why|kyon|kya hoti hai|kya hota)/i.test(lowerMessage);
    const isExecution = /(?:banao|bharo|apply|generate|create|likho|draft|calculate|karo|do|solve|nikalo)/i.test(lowerMessage);
    const queryType = isExecution ? 'execution' : (isInfo ? 'information' : 'unknown');

    // PRD-CORE-001: Intercept Information Queries early to prevent execution overrides
    if (queryType === 'information' && /(?:itr|income tax|tax|pan|gift deed|sale deed|affidavit|rent agreement|legal notice|resume|cv|biodata|application)/i.test(lowerMessage)) {
        const result = { intent: 'general_chat', confidence: 0.95, params: { raw: cleanMessage, queryType }, method: 'info_intercept' };
        return this._finalizeResult(result, cacheKey);
    }

    // Step 1: Pattern Overrides
    for (const override of this.overrides) {
      const regex = new RegExp(override.pattern, override.flags || 'i');
      if (regex.test(lowerMessage)) {
        const result = { intent: override.intent, confidence: 1.0, params: override.params || {}, method: 'override' };
        const skill = this.registry.findByIntent(override.intent);
        if (skill) { result.skill = skill.name; result.skillDisplayName = skill.displayName; }
        return this._finalizeResult(result, cacheKey);
      }
    }

    // Step 1.5: PRD-021 Document Intelligence Fast-Path
    const docClassification = documentIntelligence.classify(cleanMessage);
    if (docClassification && docClassification.confidence >= 0.80) {
      const docResult = {
        intent: docClassification.intent,
        confidence: docClassification.confidence,
        params: {
          docCategory: docClassification.category,
          docType: docClassification.subType,
          authority: docClassification.authority,
          department: docClassification.department,
          authorityInfo: docClassification.authorityInfo,
          departmentInfo: docClassification.departmentInfo,
          language: docClassification.language,
          classification: docClassification,
        },
        method: 'document_intelligence',
      };
      const skill = this.registry.findByIntent(docResult.intent);
      if (skill) {
        docResult.skill = skill.name;
        docResult.skillDisplayName = skill.displayName;
      }
      console.log(`[IntentDetector] PRD-021 Fast-Path: ${docClassification.category} → ${docClassification.intent} (${(docClassification.confidence * 100).toFixed(0)}%)`);
      return this._finalizeResult(docResult, cacheKey);
    }

    // Step 2: Advanced Pattern Detection (e.g. Geometry)
    const patternResult = this._detectWithPatterns(lowerMessage);
    if (patternResult) {
      const skill = this.registry.findByIntent(patternResult.intent);
      if (skill) { patternResult.skill = skill.name; patternResult.skillDisplayName = skill.displayName; }
      return this._finalizeResult(patternResult, cacheKey);
    }

    // Step 3: Keyword Fallback
    const keywordResult = this._detectWithKeywords(cleanMessage);
    let result = keywordResult;

    // Step 4: Assign Skill
    if (result.intent && result.intent !== 'general_chat') {
      const skill = this.registry.findByIntent(result.intent);
      if (skill) {
        result.skill = skill.name;
        result.skillDisplayName = skill.displayName;
      } else {
        result.intent = 'general_chat';
      }
    }

    // Step 5: Multi-Intent Check & Skill Suggestions for low confidence
    if (result.confidence < 0.6 && result.intent !== 'general_chat') {
      result.suggestions = this._buildSkillSuggestions(cleanMessage);
    }

    return this._finalizeResult(result, cacheKey);
  }

  _detectWithPatterns(message) {
    const lowerMessage = message.toLowerCase();
    
    // Determine query type (Information vs Execution)
    const isInfo = /(?:kya hai|batao|bare me|explain|what is|how to|kaise|kaun|who|where|kaha|kab|when|why|kyon)/i.test(lowerMessage);
    const isExecution = /(?:banao|bharo|apply|generate|create|likho|draft|calculate|karo|do|solve|nikalo)/i.test(lowerMessage);
    const queryType = isExecution ? 'execution' : (isInfo ? 'information' : 'unknown');

    // 1. Core Calculations (Math, Finance, Conversion) -> Always Executed by MathSkill/Offline
    if (/(?:gole|ghanatv|formula|sutra|sphere|volume|density)/i.test(lowerMessage) && /(?:kya|batao|hai|what)/i.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.98, params: { raw: message, queryType }, method: 'pattern' };
    }
    // Math/Geometry Pattern (e.g. "22 front 43 back 90 length")
    if (/\b(?:front|back|length|width|height|चौड़ाई|लम्बाई|फुट|ft)\b/i.test(lowerMessage) && /\d+/.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.95, params: { raw: message, queryType }, method: 'pattern' };
    }
    // Simple Arithmetic
    if (/[0-9]+\s*[\+\-\*\/\%]\s*[0-9]+/.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.99, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }
    // Trigonometry
    if (/\b(?:sin|cos|tan|cosec|sec|cot)\b/i.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.99, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }
    // Math/Scientific Formulas
    if (/\b(?:formula|formulas|सूत्र)\b/i.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.99, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }
    // Algebra / Equations
    if (/(?:solve|hal karo|siddh karo|prove|x\^2|x2|x 2|a\+b|a3|b3|a\^3|equation)/i.test(lowerMessage) && /[0-9\+\-\=xab]+/.test(lowerMessage)) {
      return { intent: 'math_skill', confidence: 0.98, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }
    // Unit Conversion
    if (/\b(?:convert|badlo|bigha|acre|hectare|sq ft|sq m)\b/i.test(lowerMessage) && /\d+/.test(lowerMessage)) {
      return { intent: 'convert_area', confidence: 0.9, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }
    // Financial Pattern
    if (/(?:gst|emi|interest|tax|percentage|percent|interest|ब्याज|प्रतिशत|%)/i.test(lowerMessage) && /\d+/.test(lowerMessage)) {
      return { intent: 'math_financial', confidence: 0.95, params: { raw: message, queryType: 'execution' }, method: 'pattern' };
    }

    // 2. Information vs Execution overrides based on verbs
    // E.g., "ITR kya hai" vs "ITR bharo"
    if (/(?:itr|income tax|pan|tax)/i.test(lowerMessage)) {
        if (queryType === 'information') {
            return { intent: 'general_chat', confidence: 0.95, params: { raw: message, queryType, domain: 'TAX' }, method: 'pattern' };
        } else {
            return { intent: 'master_tax_agent', confidence: 0.90, params: { raw: message, queryType }, method: 'pattern' };
        }
    }
    if (/(?:resume|cv|biodata)/i.test(lowerMessage)) {
        if (queryType === 'information') {
            return { intent: 'general_chat', confidence: 0.95, params: { raw: message, queryType, domain: 'DOCUMENT' }, method: 'pattern' };
        } else {
            return { intent: 'resume_maker', confidence: 0.90, params: { raw: message, queryType }, method: 'pattern' };
        }
    }
    if (/(?:gift deed|sale deed|affidavit|rent agreement|legal notice)/i.test(lowerMessage)) {
        if (queryType === 'information') {
            return { intent: 'general_chat', confidence: 0.95, params: { raw: message, queryType, domain: 'LEGAL' }, method: 'pattern' };
        } else {
            return { intent: 'legal_draft', confidence: 0.90, params: { raw: message, queryType }, method: 'pattern' };
        }
    }
    if (/(?:weather|mausam)/i.test(lowerMessage)) {
        return { intent: 'utility_tools', confidence: 0.90, params: { raw: message, queryType: 'information' }, method: 'pattern' };
    }

    // 3. Creative / Code / Long-form LLM Fallback (PRD-CORE-001)
    if (/(?:poem|story|kavita|kahani|essay|nibandh|code|react|flutter|write|explain|who is|what is|how to|kaise|kaun|kaha|kab|why|kyon)/i.test(lowerMessage)) {
        return { intent: 'general_chat', confidence: 0.85, params: { raw: message, queryType: 'llm_task' }, method: 'pattern' };
    }
    
    return null;
  }

  _buildSkillSuggestions(message) {
    const skills = this.registry.getAllSkills();
    const suggestions = [];
    const lower = message.toLowerCase();
    for (const skill of skills) {
      if (skill.matchKeywords(lower) > 0.1) {
        suggestions.push({ name: skill.name, displayName: skill.displayName, description: skill.description });
      }
    }
    return suggestions.slice(0, 3);
  }


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
    return bestMatch;
  }

  _buildIntentList() {
    const skills = this.registry.getAllSkills();
    let list = '';
    let index = 1;
    for (const skill of skills) {
      const keywords = [...(skill.keywords.hi || []).slice(0, 3), ...(skill.keywords.en || []).slice(0, 3)];
      list += `${index}. ${skill.intents[0]} — ${skill.description || skill.descriptionEn} [Keywords: ${keywords.join(', ')}]\n`;
      index++;
    }
    list += `${index}. general_chat — Casual talk, general knowledge.\n`;
    return list;
  }

  normalizeText(text) {
    if (!text) return '';
    let normalized = text.normalize('NFC').toLowerCase();
    // Normalize Hindi matras - standardizing common variants:
    normalized = normalized.replace(/\u0901/g, '\u0902'); // ChandraBindu -> Bindu
    // Remove common punctuations, keeping mathematical operator characters (+ - * / % ^ =)
    normalized = normalized.replace(/[.,#!$&\*;:{}\_`~()?'"\[\]\\]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }

  _checkOfflineKnowledge(message, lowerMessage) {
    const normalizedMessage = this.normalizeText(message);
    const flatEntries = [];
    for (const [category, entries] of this.offlineKnowledge.entries()) {
      for (const [query, data] of Object.entries(entries)) {
        flatEntries.push({ query, data, category });
      }
    }
    
    // Sort by query length descending to check longest phrases first
    flatEntries.sort((a, b) => b.query.length - a.query.length);

    for (const entry of flatEntries) {
      const qNormalized = this.normalizeText(entry.query);
      
      // Ignore single-character keys unless exact match
      if (qNormalized.length === 1) {
        if (normalizedMessage === qNormalized) {
          return { ...entry.data, category: entry.category, matchedQuery: entry.query };
        }
        continue;
      }

      // Unicode-aware word/phrase boundary regex supporting English & Devanagari Hindi (\u0900-\u097F)
      const escaped = qNormalized.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9\u0900-\u097F])${escaped}(?:$|[^a-zA-Z0-9\u0900-\u097F])`, 'i');
      
      if (regex.test(normalizedMessage)) {
        return { ...entry.data, category: entry.category, matchedQuery: entry.query };
      }
    }
    return null;
  }

  _finalizeResult(result, cacheKey) {
    const CANONICAL_MAP = {
      'math_skill': 'math',
      'math_arithmetic': 'math',
      'math_geometry': 'math',
      'math_land': 'math',
      'math_finance': 'math',
      'math_algebra': 'math',
      'math_calculus': 'math',
      'math_converter': 'math',
      'math_statistics': 'math',
      'math_trigonometry': 'math',
      'math_mensuration': 'math',
      'convert_area': 'math',
      'math_financial': 'math',
      'geometry_skill': 'math',
      'land_measurement_skill': 'math',
      'unit_conversion_skill': 'math',
      
      'legal_notice': 'legal_notice',
      'legal_draft': 'legal_draft',
      'application_writer': 'application_writer',
      'resume_maker': 'resume_maker',
      'general_chat': 'general_chat'
    };
    
    if (result && result.intent) {
      result.intent = CANONICAL_MAP[result.intent] || result.intent;
    }
    
    if (cacheKey) {
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
    }
    return result;
  }

  _checkInternalAgentSkills(detection) {
    if (detection?.params?.requiresOCR || detection?.params?.requiresBrowser) {
      return {
        intent: detection.intent,
        confidence: detection.confidence,
        params: { ...detection.params, method: 'internal_agent' },
      };
    }
    return null;
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { IntentDetector };
