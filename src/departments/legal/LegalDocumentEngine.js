/**
 * LegalDocumentEngine
 * Structurally compiles clauses into a finalized document tree.
 */
class LegalDocumentEngine {
  assemble(documentType, clauses, memory) {
    let finalDoc = `--- ${documentType} ---\n\n`;
    clauses.forEach(clause => {
      finalDoc += `[${clause.type}]\n${clause.content}\n\n`;
    });
    return finalDoc;
  }
}

module.exports = { LegalDocumentEngine };
