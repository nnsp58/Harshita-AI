const { aiProviderManager } = require('../../../utils/aiProviderManager');

class AdvocateDraftingEngine {
  /**
   * Phase 7: Legal Draft Generator
   * Phase 11: Legal Knowledge Base (Dynamic template injection)
   * Phase 14: AI Restrictions
   */
  async generateDraft(facts, documentClassification) {
    const prompt = `
You are a Senior Advocate in India drafting a court-ready, professional document.
DOCUMENT CLASSIFICATION: ${documentClassification}
VERIFIED FACTS: ${JSON.stringify(facts)}

=== PHASE 14: AI RESTRICTIONS ===
- NEVER invent facts.
- NEVER fabricate dates.
- NEVER create fake witnesses.
- NEVER add legal sections unless supported by facts.
- If information is uncertain, mark it clearly as [User Confirmation Required].

=== PHASE 7: PROFESSIONAL FORMAT ===
Must include:
- Subject (if applicable, e.g., for Legal Notice)
- Chronology / Facts
- Legal Grounds
- Specific Demand & Time Limit (e.g., Pay within 15 days)
- Legal Consequences
- Signature Block (Name, Address, Mobile, Signature)

=== PHASE 10: LANGUAGE ===
Write the document strictly in the language preferred by the user (Hindi, English, or Bilingual) as defined in the facts. If not specified, default to Hindi. DO NOT mix languages unprofessionally.

OUTPUT ONLY THE DRAFT. DO NOT INCLUDE INTRODUCTORY TEXT.
`;

    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (error) {
      console.error("[AdvocateDraftingEngine] Error:", error);
      throw new Error("Failed to generate draft.");
    }
  }
}

module.exports = new AdvocateDraftingEngine();
