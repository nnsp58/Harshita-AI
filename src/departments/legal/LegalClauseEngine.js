/**
 * LegalClauseEngine
 * Assembles dynamic clauses based on the document type, rules, and memory.
 */
class LegalClauseEngine {
  getClausesForDocument(documentType, memory) {
    if (documentType === 'Gift Deed') {
      return this._getGiftDeedClauses(memory);
    }
    // Default fallback
    return [{ type: 'OPERATIVE', content: 'Standard operative clause.' }];
  }

  _getGiftDeedClauses(memory) {
    const property = memory.propertyDetails || {};
    const owner = memory.owner || '[Donor Name]';
    const donee = memory.donee || '[Donee Name]';
    const percent = memory.giftPercentage ? `${memory.giftPercentage}%` : 'the absolute';
    const relationship = memory.relationship || 'natural love and affection';

    return [
      { type: 'TITLE', content: `GIFT DEED` },
      { type: 'DATE_AND_JURISDICTION', content: `This Gift Deed is made and executed on this day [Date] at [Place].` },
      { type: 'PARTIES', content: `BETWEEN ${owner} (hereinafter called the DONOR) AND ${donee} (hereinafter called the DONEE).` },
      { type: 'RECITALS', content: `WHEREAS the Donor is the absolute owner of the property located at ${property.village || '[Village]'}, Tehsil ${property.tehsil || '[Tehsil]'}, District ${property.district || '[District]'}...` },
      { type: 'OPERATIVE', content: `NOW THIS DEED WITNESSES that the Donor, out of ${relationship}, hereby voluntarily and without any monetary consideration gifts ${percent} share of the said property to the Donee.` },
      { type: 'POSSESSION', content: `The Donor has handed over the physical, vacant, and peaceful possession of the said ${percent} property to the Donee.` },
      { type: 'SCHEDULE_OF_PROPERTY', content: `All that piece and parcel of property bearing Khasra No. ${property.khasraNumber || '[Missing]'}, total area ${property.area || '[Missing]'}, bounded by:\nEast: [Boundary]\nWest: [Boundary]\nNorth: [Boundary]\nSouth: [Boundary]` },
      { type: 'WITNESSES', content: `IN WITNESS WHEREOF, the Donor and Donee have signed this deed in the presence of the following witnesses:\n1. [Witness 1]\n2. [Witness 2]` }
    ];
  }
}

module.exports = { LegalClauseEngine };
