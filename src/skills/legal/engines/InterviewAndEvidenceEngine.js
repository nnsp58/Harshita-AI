const { aiProviderManager } = require('../../../utils/aiProviderManager');

class InterviewAndEvidenceEngine {
  /**
   * Phase 3: Legal Interview Engine
   * Phase 5: Evidence Collection Engine
   * Phase 10: Language Selection
   */
  async generateQuestions(documentClassification, currentFacts, missingFields, contradictions, needsLanguage) {
    const prompt = `
You are Harshita AI, a professional Legal Assistant conducting a Legal Interview.
The user wants to draft a: ${documentClassification}

Currently known facts: ${JSON.stringify(currentFacts)}
Missing info identified by Verification Engine: ${missingFields ? missingFields.join(', ') : 'None'}
Contradictions identified: ${contradictions ? contradictions.join(', ') : 'None'}
Needs Language Selection: ${needsLanguage}

YOUR INSTRUCTIONS:
1. Generate ONLY the essential questions needed to draft a strong ${documentClassification}.
2. Ask maximum 7 questions.
3. If contradictions exist, ask the user to explain them gently.
4. Always ask what Evidence is available (e.g. Cash Receipt, Bank Statement, WhatsApp Chat, Agreement, Witness) if not already provided.
5. If needsLanguage is true, ask whether they want the document in Hindi, English, or Bilingual.
6. Format your output as a polite, conversational message in Hindi/Hinglish (bullet points for questions). Do NOT draft the document yet.
`;

    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (error) {
      console.error("[InterviewAndEvidenceEngine] Error:", error);
      return "एक मजबूत दस्तावेज़ तैयार करने के लिए, कृपया कुछ और जानकारी दें (तारीख, पैसे, सबूत) और बताएँ कि ड्राफ्ट हिंदी में चाहिए या इंग्लिश में?";
    }
  }
}

module.exports = new InterviewAndEvidenceEngine();
