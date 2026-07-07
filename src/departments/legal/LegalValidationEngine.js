/**
 * LegalValidationEngine
 * Validates mandatory information and scores draft quality.
 */
class LegalValidationEngine {
  checkMissingInformation(documentType, memory) {
    const missing = [];
    if (documentType === 'Gift Deed' || documentType === 'Sale Deed') {
      if (!memory.propertyDetails || !memory.propertyDetails.khasraNumber) missing.push('Khasra Number');
      if (!memory.propertyDetails || !memory.propertyDetails.area) missing.push('Property Area');
      if (!memory.witnesses || memory.witnesses.length < 2) missing.push('Two Witnesses (Mandatory)');
    }
    return missing;
  }

  scoreDraft(draft) {
    let score = 100;
    // Penalty for missing mandatory clauses
    if (!draft.includes('JURISDICTION')) score -= 10;
    if (!draft.includes('SCHEDULE_OF_PROPERTY')) score -= 15;
    return score;
  }
}

module.exports = { LegalValidationEngine };
