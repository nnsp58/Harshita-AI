const { aiProviderManager } = require('../utils/aiProviderManager');

class LegalVerificationEngine {
  constructor() {
    this.checklist = [
      "timeline", // Dates of events
      "amounts", // Financials (given, remaining, contradiction handling)
      "paymentMode", // Cash/Bank/UPI
      "evidence", // Written agreement, witnesses, receipts
      "language", // Hindi, English, Bilingual
      "senderRole" // Self or Advocate
    ];
  }

  /**
   * Evaluates user input against the legal checklist.
   * Returns { complete: boolean, missing: string[], facts: object, contradictions: string[] }
   */
  async evaluateFacts(userInput, currentFacts = {}) {
    // Combine current known facts with new input
    const contextStr = JSON.stringify(currentFacts);
    const prompt = `
You are the Harshita AI Legal Verification Engine.
Your job is to analyze the user's input for a Legal Notice / Document and extract facts, identify missing critical information, and find logical contradictions.

CURRENT KNOWN FACTS:
${contextStr}

NEW USER INPUT:
"${userInput}"

CHECKLIST TO VERIFY:
1. timeline: When did the incident/transaction occur? Are dates clear?
2. amounts: How much money was given? How much is demanded? Are they logically consistent? (e.g., if 43000 given and 42000 demanded, where is the 1000?)
3. paymentMode: How was the money paid? (Cash, Bank, UPI)
4. evidence: Is there any proof? (Agreement, Receipts, Audio, WhatsApp, Witnesses)
5. language: Has the user specified if they want the notice in Hindi, English, or Bilingual?
6. senderRole: Are they sending it themselves (Self-issued) or through an Advocate?

INSTRUCTIONS:
1. Extract all facts.
2. Identify which of the 6 checklist items are still completely MISSING or UNCLEAR.
3. Identify any logical CONTRADICTIONS (like amounts not matching without explanation).

OUTPUT FORMAT (Strict JSON):
{
  "facts": {
    "timeline": "extracted timeline or null",
    "amounts": "extracted amounts or null",
    "paymentMode": "extracted mode or null",
    "evidence": "extracted evidence or null",
    "language": "Hindi/English/Bilingual or null",
    "senderRole": "Self/Advocate or null",
    "other": "any other important context"
  },
  "missing": ["timeline", "paymentMode", ...],
  "contradictions": ["User gave 43000 but wants 42000. Why?"]
}`;

    try {
      const response = await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
      // Clean json
      let jsonStr = response.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json/g, '');
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```/g, '');
      
      const parsed = JSON.parse(jsonStr.trim());
      
      return {
        complete: parsed.missing.length === 0 && parsed.contradictions.length === 0,
        missing: parsed.missing || [],
        facts: parsed.facts || {},
        contradictions: parsed.contradictions || []
      };
    } catch (error) {
      console.error("[LegalVerificationEngine] Error parsing AI response:", error);
      // Fallback
      return { complete: false, missing: ["timeline", "evidence", "language"], facts: {}, contradictions: [] };
    }
  }

  /**
   * Generates a natural language response asking the user for missing info.
   */
  async generateQuestions(evaluationResult) {
    const prompt = `
You are Harshita AI, a professional Legal Advisor.
The user wants to draft a Legal Notice/Document, but some critical facts are missing or contradictory.

MISSING INFO: ${evaluationResult.missing.join(', ')}
CONTRADICTIONS: ${evaluationResult.contradictions.join(', ')}

Your task: Write a polite, professional, and concise message (in conversational Hindi/Hinglish) asking the user to provide this missing information so you can draft a strong legal document. 
Do NOT draft the notice yet.
If "language" is missing, ask them if they want the final notice in Hindi, English, or Bilingual.
If there are contradictions, ask them to clarify gently.
Keep it bulleted and easy to read.
`;
    
    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (e) {
      return "मुझे एक मजबूत कानूनी नोटिस बनाने के लिए कुछ और जानकारी चाहिए। कृपया बताएं: घटना की तारीख, पैसों का लेन-देन कैसे हुआ (कैश/बैंक), क्या कोई लिखित सबूत या गवाह है, और आप नोटिस हिंदी में चाहते हैं या अंग्रेजी में?";
    }
  }

  /**
   * Generates a risk assessment before generating the final draft.
   */
  async generateRiskAssessment(facts) {
    const prompt = `
You are Harshita AI, a Legal Advisor.
The user is about to generate a Legal Notice with these facts:
${JSON.stringify(facts)}

Briefly tell the user (in conversational Hindi/Hinglish) about any legal risks based on the facts (e.g., if there's no written agreement or cash was used, it might be hard to prove in court). 
Then state: "मैं अब आपका कानूनी नोटिस तैयार कर रही हूँ।" (I am now preparing your legal notice).
Keep it under 3-4 sentences.
`;
    try {
      return await aiProviderManager.generateResponse(prompt, { model: 'gemini-1.5-pro' });
    } catch (e) {
      return "ध्यान दें: बिना मजबूत लिखित सबूत के कोर्ट में केस साबित करना थोड़ा मुश्किल हो सकता है। फिर भी, मैं अब आपका कानूनी नोटिस तैयार कर रही हूँ।";
    }
  }
}

module.exports = new LegalVerificationEngine();
