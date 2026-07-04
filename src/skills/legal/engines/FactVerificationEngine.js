const { aiProviderManager } = require('../../../utils/aiProviderManager');

class FactVerificationEngine {
  /**
   * Phase 4: Legal Verification Engine
   * Checks Dates, Names, Addresses, Amount, Timeline, Jurisdiction, Contradictions.
   */
  async verifyFacts(userInput, documentClassification, currentFacts = {}) {
    const contextStr = JSON.stringify(currentFacts);
    const prompt = `
You are the Harshita AI Legal Verification Engine.
DOCUMENT TYPE: ${documentClassification}
KNOWN FACTS: ${contextStr}
NEW USER INPUT: "${userInput}"

Verify the following:
1. Dates and Timeline
2. Names and Addresses
3. Amounts (Are they mathematically consistent?)
4. Evidence/Proofs
5. Language preference (Hindi, English, Bilingual)

Identify any CONTRADICTIONS (e.g., 43000 given but 42000 demanded without explanation).
Identify what is still MISSING to draft a perfect ${documentClassification}.

OUTPUT FORMAT (Strict JSON):
{
  "facts": {
    "timeline": "...",
    "amounts": "...",
    "evidence": "...",
    "language": "...",
    "otherContext": "..."
  },
  "missing": ["timeline", "evidence", ...],
  "contradictions": ["Mismatch in amount..."]
}
`;
    try {
      const response = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '');
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const parsed = JSON.parse(jsonStr.trim());
      
      return {
        isComplete: parsed.missing.length === 0 && parsed.contradictions.length === 0,
        missing: parsed.missing || [],
        facts: parsed.facts || {},
        contradictions: parsed.contradictions || []
      };
    } catch (error) {
      console.error("[FactVerificationEngine] Error:", error);
      return { isComplete: false, missing: ["timeline", "evidence"], facts: {}, contradictions: [] };
    }
  }
}

module.exports = new FactVerificationEngine();
