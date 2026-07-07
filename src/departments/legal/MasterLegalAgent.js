const { LegalDraftingEngine } = require('./LegalDraftingEngine');
const { LegalValidationEngine } = require('./LegalValidationEngine');
const { LegalRuleEngine } = require('./LegalRuleEngine');
const { PropertyLawAgent } = require('./domain/PropertyLawAgent');
const { FamilyLawAgent } = require('./domain/FamilyLawAgent');
const { CivilLawAgent } = require('./domain/CivilLawAgent');
const { CriminalLawAgent } = require('./domain/CriminalLawAgent');
const { RevenueLawAgent } = require('./domain/RevenueLawAgent');

/**
 * MasterLegalAgent
 * Orchestrates the entire Legal Department. Routes requests to specialized departments
 * (Property Law, Family Law, etc.) and manages the pipeline.
 */
class MasterLegalAgent {
  constructor() {
    this.draftingEngine = new LegalDraftingEngine();
    this.validationEngine = new LegalValidationEngine();
    this.ruleEngine = new LegalRuleEngine();
    
    // Initialize Domain Agents
    this.propertyLawAgent = new PropertyLawAgent(this.draftingEngine, this.validationEngine);
    this.familyLawAgent = new FamilyLawAgent(this.draftingEngine, this.validationEngine);
    this.civilLawAgent = new CivilLawAgent(this.draftingEngine, this.validationEngine);
    this.criminalLawAgent = new CriminalLawAgent(this.draftingEngine, this.validationEngine);
    this.revenueLawAgent = new RevenueLawAgent(this.draftingEngine, this.validationEngine);
  }

  /**
   * Process a legal request
   * @param {Object} context User intent, context, and existing memory
   */
  async processRequest(context) {
    // 1. Identify Document Type & Purpose
    const documentType = this.ruleEngine.identifyDocumentType(context.intent);
    
    let draftResult;
    
    // Route to appropriate domain agent
    if (['Gift Deed', 'Sale Deed', 'Will', 'Partition', 'Lease'].includes(documentType)) {
      draftResult = await this.propertyLawAgent.process(documentType, context.memory);
    } else {
      // Default to generic drafting
      const missingInfo = this.validationEngine.checkMissingInformation(documentType, context.memory);
      if (missingInfo.length > 0) {
        return {
          status: 'WAITING_FOR_INFO',
          missingFields: missingInfo,
          message: `To draft the ${documentType}, I need the following details: ${missingInfo.join(', ')}`
        };
      }
      const draft = await this.draftingEngine.generateDraft(documentType, context.memory);
      draftResult = { status: 'SUCCESS', document: draft };
    }

    if (draftResult.status === 'WAITING_FOR_INFO') {
      return {
        status: 'WAITING_FOR_INFO',
        missingFields: draftResult.missingFields,
        message: `To draft the ${documentType}, I need the following details: ${draftResult.missingFields.join(', ')}`
      };
    }

    // 4. Final Review
    const reviewScore = this.validationEngine.scoreDraft(draftResult.document);
    if (reviewScore < 95) {
      return {
        status: 'ERROR',
        message: 'Draft failed quality checks. Regenerating...',
        score: reviewScore
      };
    }

    return {
      status: 'SUCCESS',
      document: draftResult.document,
      score: reviewScore
    };
  }
}

module.exports = { MasterLegalAgent };
