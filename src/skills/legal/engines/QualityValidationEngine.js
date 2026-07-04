const { aiProviderManager } = require('../../../utils/aiProviderManager');

class QualityValidationEngine {
  /**
   * Phase 8: Document Quality Validation
   * Phase 12: Advocate Review Mode
   */
  async validateAndImprove(draft, facts) {
    const prompt = `
You are a Senior Advocate and Quality Validator.
Review the following Legal Draft.

DRAFT:
${draft}

VERIFIED FACTS:
${JSON.stringify(facts)}

=== PHASE 12: ADVOCATE REVIEW MODE ===
Would an advocate approve this draft?
Check for:
1. Grammar, Spelling, Consistency.
2. Correct Formatting (A4 print layout suitable).
3. Legal Language weight and tone.
4. Correct Amounts, Dates, Names matching the Verified Facts.
5. Missing critical elements (Subject, Signature, Demands).

INSTRUCTIONS:
If there are errors, weaknesses, or formatting issues, FIX THEM and output the ENHANCED draft.
If it is already perfect, output it as is.
DO NOT output anything except the final improved draft.
`;

    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (error) {
      console.error("[QualityValidationEngine] Error:", error);
      return draft; // Fallback to original if quality check fails
    }
  }
}

module.exports = new QualityValidationEngine();
