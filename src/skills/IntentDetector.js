/**
 * IntentDetector (v3) — Confidence-Tiered AI Intent Detection
 * PRD-021: Added Document Intelligence fast-path
 */
const fs = require('fs');
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { SecuritySkill } = require('./SecuritySkill');
const { documentIntelligence } = require('./DocumentIntelligenceEngine');

class IntentDetector {
  constructor(skillRegistry) {
    this.registry = skillRegistry;
    this.name = 'IntentDetector';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000;
    this.overrides = [];
    this._loadOverrides();
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
    const lowerMessage = cleanMessage.toLowerCase();
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

    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return { ...cached.result, method: 'cache' };
    }

    // Step 1: Pattern Overrides
    for (const override of this.overrides) {
      const regex = new RegExp(override.pattern, override.flags || 'i');
      if (regex.test(lowerMessage)) {
        const result = { intent: override.intent, confidence: 1.0, params: override.params || {}, method: 'override' };
        const skill = this.registry.findByIntent(override.intent);
        if (skill) { result.skill = skill.name; result.skillDisplayName = skill.displayName; }
        this.cache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }
    }

    // Step 1.5: PRD-021 Document Intelligence Fast-Path
    // If DocumentIntelligenceEngine classifies with high confidence, skip AI call
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
      this.cache.set(cacheKey, { result: docResult, timestamp: Date.now() });
      console.log(`[IntentDetector] PRD-021 Fast-Path: ${docClassification.category} → ${docClassification.intent} (${(docClassification.confidence * 100).toFixed(0)}%)`);
      return docResult;
    }

    // Step 2: Advanced Pattern Detection (e.g. Geometry)
    const patternResult = this._detectWithPatterns(lowerMessage);
    if (patternResult) {
      const skill = this.registry.findByIntent(patternResult.intent);
      if (skill) { patternResult.skill = skill.name; patternResult.skillDisplayName = skill.displayName; }
      this.cache.set(cacheKey, { result: patternResult, timestamp: Date.now() });
      return patternResult;
    }

    // Step 3: API/LLM Detection Removed per CTO Directive (Offline First)
    let result = null;

    // Step 4: Keyword Fallback
    const keywordResult = this._detectWithKeywords(cleanMessage);
    result = keywordResult;

    // Step 5: Assign Skill
    if (result.intent && result.intent !== 'general_chat') {
      const skill = this.registry.findByIntent(result.intent);
      if (skill) {
        result.skill = skill.name;
        result.skillDisplayName = skill.displayName;
      } else {
        result.intent = 'general_chat';
      }
    }

    // Step 6: Multi-Intent Check & Skill Suggestions for low confidence
    if (result.confidence < 0.6 && result.intent !== 'general_chat') {
      result.suggestions = this._buildSkillSuggestions(cleanMessage);
    }

    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    return result;
  }

  _detectWithPatterns(message) {
    // Math/Geometry Pattern (e.g. "22 front 43 back 90 length")
    if (/\b(?:front|back|length|width|height|चौड़ाई|लम्बाई|फुट|ft)\b/i.test(message) && /\d+/.test(message)) {
      return { intent: 'geo_land', confidence: 0.95, params: { raw: message }, method: 'pattern' };
    }
    // Unit Conversion Pattern (e.g. "convert to bigha", "sq ft to acre")
    if (/\b(?:convert|badlo|bigha|acre|hectare|sq ft|sq m)\b/i.test(message) && /\d+/.test(message)) {
      return { intent: 'convert_area', confidence: 0.9, params: { raw: message }, method: 'pattern' };
    }
    // Financial/Percentage Math Pattern (e.g. "GST 18%", "15% of 5000", "interest rate")
    if (/(?:gst|emi|interest|tax|percentage|percent|interest|ब्याज|प्रतिशत|%)/i.test(message) && /\d+/.test(message)) {
      return { intent: 'math_financial', confidence: 0.95, params: { raw: message }, method: 'pattern' };
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

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { IntentDetector };
