/**
 * TemplateEngine - Offline Document Generator & Legal Rules Engine
 *
 * Generates high-quality legal drafts without requiring external AI APIs
 */

class TemplateEngine {
  constructor() {
    this.supportedTypes = [
      'affidavit',
      'rent_agreement',
      'gift_deed',
      'legal_notice',
      'noc',
      'complaint',
      'will',
      'power_of_attorney'
    ];
  }

  /**
   * Run rules engine and output formatted legal text
   */
  generate(docType, inputs = {}) {
    const today = new Date().toLocaleDateString('en-IN');
    const name = inputs.name || '[आपका नाम / Your Name]';
    const fatherName = inputs.fatherName || '[पिता का नाम / Father\'s Name]';
    const address = inputs.address || '[पूरा पता / Address]';
    const district = inputs.district || '[जिला / District]';
    const state = inputs.state || '[राज्य / State]';

    switch (docType.toLowerCase().replace(/[\s-]/g, '_')) {
      case 'affidavit':
      case 'shapath_patra':
        return this._generateAffidavit(name, fatherName, address, district, state, today, inputs);
      case 'rent_agreement':
      case 'kiraya_nama':
        return this._generateRentAgreement(name, fatherName, address, today, inputs);
      case 'gift_deed':
      case 'dan_patra':
        return this._generateGiftDeed(name, fatherName, address, today, inputs);
      case 'legal_notice':
      case 'cheque_bounce_notice':
        return this._generateLegalNotice(name, fatherName, address, today, inputs);
      case 'noc':
      case 'no_objection_certificate':
        return this._generateNoc(name, fatherName, address, today, inputs);
      case 'complaint':
      case 'first_information_report':
      case 'fir':
        return this._generateComplaint(name, fatherName, address, today, inputs);
      default:
        return this._generateGeneralAgreement(name, fatherName, address, today, inputs);
    }
  }

  _generateAffidavit(name, fatherName, address, district, state, today, inputs) {
    const purpose = inputs.purpose || 'सामान्य सत्यापन (General Verification)';
    return `शपथ पत्र / AFFIDAVIT
═══════════════════════════════════════════════════════════════════

मैं, ${name}, पुत्र/पुत्री श्री ${fatherName}, निवासी ${address}, जिला ${district}, ${state}, एतदद्वारा शपथपूर्वक निम्नलिखित घोषणा करता/करती हूँ:

1. यह कि मैं उपरोक्त पते का स्थाई निवासी हूँ और मेरी पहचान के दस्तावेज इस शपथ पत्र के साथ संलग्न हैं।
2. यह कि मैं यह शपथ पत्र ${purpose} के प्रयोजन हेतु निष्पादित कर रहा/रही हूँ।
3. यह कि मेरे द्वारा दी गई उपरोक्त जानकारी सत्य और सही है और इसमें कोई तथ्य छुपाया नहीं गया है।

सत्यापन (Verification):
मैं, उपरोक्त शपथकर्ता, सत्यापित करता/करती हूँ कि इस शपथ पत्र की सामग्री मेरे सर्वोत्तम ज्ञान और विश्वास के अनुसार सत्य और सही है।

दिनांक: ${today}
स्थान: ${district}

शपथकर्ता के हस्ताक्षर (Signature of Deponent)
_________________________________________`;
  }

  _generateRentAgreement(name, fatherName, address, today, inputs) {
    const tenantName = inputs.tenantName || '[किरायेदार का नाम / Tenant Name]';
    const rentAmount = inputs.rentAmount || '10,000/-';
    const depositAmount = inputs.depositAmount || '20,000/-';
    const propertyDesc = inputs.propertyDesc || '[संपत्ति का विवरण / Property Description]';

    return `किराया अनुबंध / RENT AGREEMENT
═══════════════════════════════════════════════════════════════════

यह किराया अनुबंध आज दिनांक ${today} को निम्नलिखित पक्षों के मध्य निष्पादित किया गया:

मकान मालिक (Landlord):
श्री ${name}, पुत्र श्री ${fatherName}, निवासी ${address} (प्रथम पक्ष)

किरायेदार (Tenant):
श्री ${tenantName}, निवासी [Tenant Address] (द्वितीय पक्ष)

WHEREAS:
1. प्रथम पक्ष उपरोक्त संपत्ति ${propertyDesc} का वास्तविक स्वामी है।
2. द्वितीय पक्ष ने उक्त संपत्ति को घरेलू निवास हेतु किराये पर लेने का अनुरोध किया है।

शर्तें (Terms & Conditions):
1. यह अनुबंध 11 महीनों की अवधि के लिए वैध होगा।
2. द्वितीय पक्ष प्रतिमाह ₹${rentAmount} की दर से किराये का भुगतान प्रत्येक माह की 10 तारीख तक करेगा।
3. द्वितीय पक्ष ने प्रथम पक्ष के पास ₹${depositAmount} बतौर सुरक्षा निधि (Security Deposit) जमा कराए हैं।

गवाह (Witnesses):
1. ___________________              2. ___________________

मकान मालिक हस्ताक्षर                      किरायेदार हस्ताक्षर
___________________                  ___________________`;
  }

  _generateGiftDeed(name, fatherName, address, today, inputs) {
    const doneeName = inputs.doneeName || '[प्राप्तकर्ता का नाम / Donee Name]';
    const relationship = inputs.relationship || 'पुत्री (Daughter)';
    const assetDesc = inputs.assetDesc || '[गिफ्ट की जाने वाली संपत्ति / Gift Asset Description]';

    return `दान विलेख / GIFT DEED
═══════════════════════════════════════════════════════════════════

यह दान विलेख आज दिनांक ${today} को स्वेच्छा से निष्पादित किया गया:

दाता (Donor):
श्री ${name}, पुत्र श्री ${fatherName}, निवासी ${address}

दानग्राही (Donee):
श्री/सुश्री ${doneeName}, जो दाता की ${relationship} हैं।

विवरण (Declaration):
1. दाता अपनी संपत्ति ${assetDesc} का पूर्ण स्वामी है।
2. दाता अपने प्राकृतिक प्रेम और स्नेह के कारण दानग्राही को उक्त संपत्ति बिना किसी प्रतिफल के दान करता है।
3. दानग्राही इस दान को स्वीकार करता/करती है और संपत्ति का वास्तविक कब्ज़ा प्राप्त करता/करती है।

गवाह (Witnesses):
1. ___________________              2. ___________________

दाता के हस्ताक्षर (Donor)               दानग्राही के हस्ताक्षर (Donee)
___________________                  ___________________`;
  }

  _generateLegalNotice(name, fatherName, address, today, inputs) {
    const oppositeParty = inputs.oppositeParty || '[विपक्षी पक्ष का नाम / Opposite Party]';
    const amount = inputs.amount || '50,000/-';
    const chequeNo = inputs.chequeNo || '[चेक नंबर / Cheque Number]';
    const chequeDate = inputs.chequeDate || '[चेक दिनांक / Cheque Date]';
    const bankName = inputs.bankName || '[बैंक का नाम / Bank Name]';

    return `कानूनी नोटिस / LEGAL NOTICE (SECTION 138 NI ACT)
═══════════════════════════════════════════════════════════════════

प्रेषक (Sender):
श्री ${name}, निवासी ${address}

प्रेषित (To):
श्री ${oppositeParty}, निवासी [Opposite Party Address]

महोदय,
मेरे मुवक्किल की ओर से आपको यह कानूनी नोटिस निम्नलिखित तथ्यों के तहत प्रेषित किया जा रहा है:

1. यह कि आपने मेरे मुवक्किल से अपनी पारिवारिक आवश्यकता हेतु ₹${amount} ऋण स्वरूप प्राप्त किए थे।
2. ऋण चुकता करने हेतु आपने हमें बैंक ${bankName} का चेक संख्या ${chequeNo} दिनांक ${chequeDate} प्रदान किया था।
3. उक्त चेक को जब भुगतान हेतु बैंक में प्रस्तुत किया गया, तो वह अपर्याप्त कोष (Funds Insufficient) के कारण अनादृत (Bounce) होकर वापस आ गया।

अतः इस नोटिस के प्राप्त होने के 15 दिनों के भीतर उक्त राशि ₹${amount} का भुगतान सुनिश्चित करें, अन्यथा आपके विरुद्ध अदालत में मुकदमा दायर किया जाएगा।

भवदीय (Sincerely),

वकील हस्ताक्षर / Advocate Stamp
__________________________________`;
  }

  _generateNoc(name, fatherName, address, today, inputs) {
    const purpose = inputs.purpose || 'विद्युत कनेक्शन / Electricity Connection';
    const propertyDesc = inputs.propertyDesc || '[संपत्ति का विवरण / Property Description]';

    return `अनापत्ति प्रमाण पत्र / NO OBJECTION CERTIFICATE (NOC)
═══════════════════════════════════════════════════════════════════

मैं, श्री ${name}, पुत्र श्री ${fatherName}, निवासी ${address}, एतदद्वारा घोषणा करता हूँ कि:

1. मैं संपत्ति ${propertyDesc} का वैध स्वामी हूँ।
2. मुझे किराएदार/आवेदक को उक्त परिसर में ${purpose} स्थापित करने में कोई आपत्ति नहीं है।
3. मैं संबंधित विभाग से अनुरोध करता हूँ कि आवेदक के पक्ष में आवश्यक अनुमति प्रदान की जाए।

दिनांक: ${today}
स्थान: _________________

हस्ताक्षर (Signature of Declarant)
_________________________________`;
  }

  _generateComplaint(name, fatherName, address, today, inputs) {
    const stationHouseOfficer = inputs.sho || 'थानाध्यक्ष (Station House Officer)';
    const incidentDate = inputs.incidentDate || '[घटना की तिथि / Date of Incident]';
    const complaintText = inputs.complaintText || '[शिकायत का विवरण / Incident description]';

    return `शिकायत पत्र (प्रथम सूचना रिपोर्ट) / COMPLAINT LETTER (FIR)
═══════════════════════════════════════════════════════════════════

सेवा में,
श्रीमान ${stationHouseOfficer},
थाना परिसर, [City/Police Station Address]

विषय: प्रथम सूचना रिपोर्ट (FIR) दर्ज करने हेतु आवेदन पत्र।

महोदय,
सविनय निवेदन यह है कि मैं, ${name}, पुत्र श्री ${fatherName}, निवासी ${address}, निम्नलिखित शिकायत दर्ज कराना चाहता हूँ:

1. यह कि दिनांक ${incidentDate} को समय [घटना का समय] मेरे साथ [घटना का स्थान] पर निम्नलिखित घटना घटित हुई:
   ${complaintText}
2. कृपया उक्त मामले का संज्ञान लेते हुए दोषियों के खिलाफ प्राथमिकी (FIR) दर्ज कर कानूनी कार्रवाई सुनिश्चित करने की कृपा करें।

दिनांक: ${today}
स्थान: _________________

प्रार्थी (Complainant)
हस्ताक्षर: _________________`;
  }

  _generateGeneralAgreement(name, fatherName, address, today, inputs) {
    return `सहमति पत्र / GENERAL AGREEMENT
═══════════════════════════════════════════════════════════════════

यह सहमति पत्र आज दिनांक ${today} को प्रेषक श्री ${name}, पुत्र श्री ${fatherName}, निवासी ${address} द्वारा निष्पादित किया गया है।

घोषणा:
मैं एतदद्वारा पुष्टि करता हूँ कि मेरे द्वारा दी गई सभी घोषणाएं स्वैच्छिक हैं और किसी भी कानून के विरुद्ध नहीं हैं।

हस्ताक्षर
_________________`;
  }
}

const templateEngine = new TemplateEngine();

module.exports = { TemplateEngine, templateEngine };
