/**
 * LegalClauseEngine
 * Assembles dynamic clauses based on the document type, rules, and memory.
 */
class LegalClauseEngine {
  getClausesForDocument(documentType, memory) {
    if (documentType === 'Gift Deed') {
      return this._getGiftDeedClauses(memory);
    }
    if (documentType === 'RTI Application') {
      return this._getRTIApplicationClauses(memory);
    }
    // Default fallback
    return [{ type: 'OPERATIVE', content: 'Standard operative clause.' }];
  }

  _getRTIApplicationClauses(memory) {
    const applicant = memory.applicantName || '[आवेदक का नाम]';
    const address = memory.address || '[पता]';
    const pio = memory.pio || 'जन सूचना अधिकारी (PIO)';
    const department = memory.department || '[विभाग का नाम]';
    const subject = memory.subject || 'सूचना के अधिकार अधिनियम, 2005 के अंतर्गत सूचना प्राप्त करने हेतु आवेदन।';
    const details = memory.details || '1. [सूचना बिंदु 1]\n2. [सूचना बिंदु 2]';

    return [
      { type: 'TITLE', content: `सूचना का अधिकार (RTI) आवेदन` },
      { type: 'TO', content: `सेवा में,\n\n${pio},\n${department},\n[स्थान]` },
      { type: 'SUBJECT', content: `विषय: ${subject}` },
      { type: 'SALUTATION', content: `महोदय,` },
      { type: 'OPERATIVE', content: `मैं, ${applicant}, निवासी ${address}, सूचना के अधिकार अधिनियम, 2005 के अंतर्गत निम्नलिखित जानकारी प्राप्त करना चाहता/चाहती हूँ:` },
      { type: 'DETAILS', content: `${details}` },
      { type: 'FEES', content: `मैंने इस आवेदन के साथ 10/- रुपये का निर्धारित शुल्क (पोस्टल ऑर्डर / नकद / डीडी संख्या ________) संलग्न किया है।` },
      { type: 'CLOSING', content: `कृपया मुझे निर्धारित समय सीमा (30 दिन) के भीतर जानकारी प्रदान करने की कृपा करें। यदि यह जानकारी आपके विभाग से संबंधित नहीं है, तो कृपया इसे धारा 6(3) के तहत संबंधित लोक सूचना अधिकारी को स्थानांतरित करें।` },
      { type: 'SIGNATURE', content: `भवदीय,\n\nहस्ताक्षर: ____________________\nनाम: ${applicant}\nपता: ${address}\nदिनांक: [Date]` }
    ];
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
