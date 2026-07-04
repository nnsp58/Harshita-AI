const { aiProviderManager } = require('../../../utils/aiProviderManager');

class IntentAndClassificationEngine {
  /**
   * Phase 1 & 2: Legal Intent Detection and Document Classification
   */
  async process(userInput) {
    const prompt = `
You are the Harshita AI Legal Intent & Classification Engine.
Analyze the user's request and determine:
1. The exact Legal Intent (e.g., Recovery of Money, Property Dispute, Family Matter, Police Complaint, etc.).
2. The specific Document Classification required (e.g., Legal Notice, Police Complaint, Affidavit, Agreement, Rent Agreement, Consumer Complaint, etc.).

USER INPUT:
"${userInput}"

OUTPUT FORMAT (Strict JSON):
{
  "intent": "Legal Intent Name",
  "documentClassification": "Document Category Name",
  "confidence": 0.95
}
`;
    try {
      const response = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '');
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      return JSON.parse(jsonStr.trim());
    } catch (error) {
      console.error("[IntentAndClassificationEngine] Error:", error);
      return { intent: "General Legal Matter", documentClassification: "General Draft", confidence: 0.5 };
    }
  }
}

module.exports = new IntentAndClassificationEngine();
