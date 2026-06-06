/**
 * AISkillHelper — Common AI helper for all skills with CognitiveTrainer integration
 */

const { aiProviderManager } = require('../utils/aiProviderManager');
const { cognitiveTrainer } = require('../core/cognitiveTrainer');

class AISkillHelper {
  /**
   * Extract structured data from user input
   * @param {object} opts
   * @param {string} opts.userInput - User's message
   * @param {string} opts.skillName - Skill identifier (e.g. "ration_card")
   * @param {Array<{key,desc}>} opts.fields - Fields to extract
   * @param {string} opts.context - Past conversation context (optional)
   * @returns {Promise<{intent, entities, missingFields, ready}>}
   */
  static async extractIntent({ userInput, skillName, fields = [], context = '' }) {
    if (!userInput) return { intent: null, entities: {}, missingFields: fields.map(f => f.key), ready: false };

    const fieldsList = fields.map(f => `- ${f.key}: ${f.desc}`).join('\n');

    const systemRole = `You are an entity extractor for the "${skillName}" skill.
Analyze the user's message and extract structured data.
Return ONLY valid JSON in this exact shape:
{
  "intent": "string - what user wants to do (e.g., 'check_status', 'apply_new', 'search')",
  "entities": { /* extracted fields */ },
  "missingFields": [/* which required fields are missing */],
  "ready": false /* true only when all required fields are present */
}

Required fields to extract:
${fieldsList || '(no specific fields — extract whatever is relevant)'}`;

    const guidanceList = [
      "Be lenient with Hindi/English/Hinglish.",
      "Extract Aadhaar numbers, names, IDs, addresses, phone numbers, dates etc. when present.",
      "Always return ONLY valid JSON. No markdown backticks, no explanations."
    ];

    const systemPrompt = cognitiveTrainer.compileSystemPrompt(
      skillName + "_extractor",
      systemRole,
      guidanceList
    );

    const userPrompt = `${context ? `Past context:\n${context}\n\n` : ''}User says: "${userInput}"\n\nExtract the JSON now.`;

    try {
      const response = await aiProviderManager.createChatCompletion('IntentDetector', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 600,
        json: true,
      });
      const text = response?.choices?.[0]?.message?.content?.trim() || '{}';
      const cleanText = text.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(cleanText);
      return {
        intent: parsed.intent || null,
        entities: parsed.entities || {},
        missingFields: parsed.missingFields || [],
        ready: parsed.ready === true,
      };
    } catch (err) {
      console.warn(`[AISkillHelper:${skillName}] extractIntent failed:`, err.message);
      return { intent: null, entities: {}, missingFields: fields.map(f => f.key), ready: false };
    }
  }

  /**
   * Generate a smart conversational reply
   * @param {object} opts
   * @param {string} opts.skillName
   * @param {string} opts.userInput
   * @param {string} opts.context - Past conversation
   * @param {string} opts.systemRole - "You are an AI helping users with X..."
   * @param {Array<string>} opts.guidance - Specific instructions
   * @returns {Promise<string>}
   */
  static async generateReply({ skillName, userInput, context = '', systemRole, guidance = [] }) {
    const combinedGuidance = [
      ...guidance,
      "Reply in the SAME language as user (Hindi/English/Hinglish auto-detect)",
      "Be concise but helpful (max 200 words)",
      "Use bullet points if listing options",
      "Use emojis sparingly (1-3 max)",
      "If user asked something this skill cannot do, politely redirect or ask for clarification"
    ];

    const systemPrompt = cognitiveTrainer.compileSystemPrompt(
      skillName,
      systemRole,
      combinedGuidance
    );

    const userPrompt = `${context ? `Past conversation:\n${context}\n\n` : ''}User: ${userInput}`;

    try {
      const response = await aiProviderManager.createChatCompletion('MasterAgent', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 500,
      });
      return response?.choices?.[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.warn(`[AISkillHelper:${skillName}] generateReply failed:`, err.message);
      return '';
    }
  }

  /**
   * Detect user language
   */
  static detectLanguage(text) {
    if (!text) return 'en';
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (hasDevanagari) return 'hi';
    // Romanized Hindi heuristic
    const hinglishWords = /\b(kya|kaise|kar|karo|karein|hai|hain|main|mera|meri|mujhe|kaha|kahan|chahiye|batao|dikhao)\b/i;
    if (hinglishWords.test(text)) return 'hi-Latn';
    return 'en';
  }
}

module.exports = { AISkillHelper };
