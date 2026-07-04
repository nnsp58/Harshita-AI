const { aiProviderManager } = require('../../../utils/aiProviderManager');

class RiskAnalysisEngine {
  /**
   * Phase 6: Legal Risk Analysis
   */
  async analyzeRisk(facts, documentClassification) {
    const prompt = `
You are the Harshita AI Legal Risk Analyst.
DOCUMENT: ${documentClassification}
VERIFIED FACTS: ${JSON.stringify(facts)}

Generate a brief legal risk analysis (in conversational Hindi/Hinglish).
Cover:
- Missing evidence (if any)
- Weak points & Strong points
- Possible objections by the opposing party
- Probability of success (High/Medium/Low)
- Recommended next step

Keep it strictly under 5-6 bullet points. End the message by saying:
"मैं अब आपका ड्राफ्ट तैयार कर रही हूँ..." (I am now preparing your draft...)
`;

    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (error) {
      console.error("[RiskAnalysisEngine] Error:", error);
      return "⚠️ **विधिक विश्लेषण (Legal Risk Assessment):**\n- बिना पक्के सबूत (लिखित एग्रीमेंट) के केस थोड़ा कमजोर हो सकता है।\nमैं अब आपका ड्राफ्ट तैयार कर रही हूँ...";
    }
  }
}

module.exports = new RiskAnalysisEngine();
