/**
 * PropertyLawAgent
 * Specialized domain agent for Gift Deed, Sale Deed, Will, Partition, Lease, etc.
 */
class PropertyLawAgent {
  constructor(draftingEngine, validationEngine) {
    this.draftingEngine = draftingEngine;
    this.validationEngine = validationEngine;
  }

  async process(documentType, memory) {
    const missing = this.validationEngine.checkMissingInformation(documentType, memory);
    if (missing.length > 0) {
      return { status: 'WAITING_FOR_INFO', missingFields: missing };
    }
    const draft = await this.draftingEngine.generateDraft(documentType, memory);
    return { status: 'SUCCESS', document: draft };
  }
}

module.exports = { PropertyLawAgent };
