const { LegalClauseEngine } = require('./LegalClauseEngine');
const { LegalDocumentEngine } = require('./LegalDocumentEngine');

/**
 * LegalDraftingEngine
 * Handles generative assembly of clauses.
 */
class LegalDraftingEngine {
  constructor() {
    this.clauseEngine = new LegalClauseEngine();
    this.docEngine = new LegalDocumentEngine();
  }

  async generateDraft(documentType, memory) {
    const clauses = this.clauseEngine.getClausesForDocument(documentType, memory);
    const structuredDraft = this.docEngine.assemble(documentType, clauses, memory);
    return structuredDraft;
  }
}

module.exports = { LegalDraftingEngine };
