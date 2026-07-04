const intentEngine = require('./engines/IntentAndClassificationEngine');
const interviewEngine = require('./engines/InterviewAndEvidenceEngine');
const verificationEngine = require('./engines/FactVerificationEngine');
const riskEngine = require('./engines/RiskAnalysisEngine');
const draftingEngine = require('./engines/AdvocateDraftingEngine');
const qualityEngine = require('./engines/QualityValidationEngine');

class LegalEnginePipeline {
  constructor() {
    // Session state shape:
    // {
    //    stage: 'intent' | 'interview' | 'drafting',
    //    intent: string,
    //    documentClassification: string,
    //    facts: object,
    //    missingFields: string[],
    //    contradictions: string[],
    //    riskAssessment: string
    // }
    this.sessions = new Map();
  }

  async processRequest(userId, message) {
    let session = this.sessions.get(userId) || this.createSession();

    // ── Phase 1 & 2: Intent & Classification ──
    if (session.stage === 'intent') {
      const classification = await intentEngine.process(message);
      session.intent = classification.intent;
      session.documentClassification = classification.documentClassification;
      session.stage = 'interview';
    }

    // ── Phase 3, 4, 5, 10: Interview, Verification & Evidence ──
    if (session.stage === 'interview') {
      const verificationResult = await verificationEngine.verifyFacts(message, session.documentClassification, session.facts);
      
      // Update accumulated facts
      session.facts = { ...session.facts, ...verificationResult.facts };
      session.missingFields = verificationResult.missing;
      session.contradictions = verificationResult.contradictions;

      const needsLanguage = !session.facts.language;

      if (!verificationResult.isComplete || needsLanguage) {
        this.sessions.set(userId, session);
        // Phase 3 & 10: Ask max 7 questions
        const questions = await interviewEngine.generateQuestions(
          session.documentClassification, 
          session.facts, 
          session.missingFields, 
          session.contradictions,
          needsLanguage
        );
        return { reply: questions, mode: 'legal_verification' };
      } else {
        session.stage = 'drafting';
      }
    }

    // ── Phase 6, 7, 8, 12, 14: Risk Analysis, Drafting & Quality ──
    if (session.stage === 'drafting') {
      // Phase 6: Risk Analysis
      const riskAssessment = await riskEngine.analyzeRisk(session.facts, session.documentClassification);

      // Phase 7 & 14: Draft Generation
      const initialDraft = await draftingEngine.generateDraft(session.facts, session.documentClassification);

      // Phase 8 & 12: Quality Validation
      let finalDraft = await qualityEngine.validateAndImprove(initialDraft, session.facts);

      // Combine Risk Assessment with Final Draft
      const finalResponse = `⚠️ **विधिक विश्लेषण (Legal Risk Assessment):**\n${riskAssessment}\n\n---\n\n${finalDraft}`;

      // Clear session after successful generation
      this.sessions.delete(userId);

      // Phase 9: Output in Center A4 Workspace
      return {
        reply: finalResponse,
        mode: 'legal_generated', // Triggers Center A4 Document mode in the frontend
        docType: session.documentClassification
      };
    }
  }

  createSession() {
    return {
      stage: 'intent',
      intent: null,
      documentClassification: null,
      facts: {},
      missingFields: [],
      contradictions: [],
      riskAssessment: null
    };
  }
}

module.exports = new LegalEnginePipeline();
