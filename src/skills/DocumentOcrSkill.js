/**
 * DocumentOcrSkill — दस्तावेज़ से डेटा निकालना (OCR + AI)
 * 
 * आधार, पैन, मार्कशीट, जाति प्रमाणपत्र आदि से
 * फोटो/PDF भेजने पर ऑटोमैटिक डेटा निकालती है।
 * मौजूदा documentAIAgent का उपयोग करती है।
 */

const { BaseSkill } = require('./BaseSkill');

class DocumentOcrSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'document_ocr';
    this.displayName = 'दस्तावेज़ OCR';
    this.displayNameEn = 'Document OCR & Extraction';
    this.description = 'आधार/पैन/मार्कशीट से फोटो या PDF द्वारा डेटा निकालना';
    this.descriptionEn = 'Extract data from Aadhaar, PAN, Marksheet via photo or PDF';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = true; // Tesseract offline चल सकता है
    this.priority = 8;

    this.intents = ['document_ocr', 'extract_data', 'scan_document', 'read_aadhaar', 'read_pan'];

    this.keywords = {
      hi: ['आधार', 'पैन', 'मार्कशीट', 'प्रमाणपत्र', 'दस्तावेज़', 'स्कैन', 'फोटो', 'निकालो', 'पढ़ो'],
      en: ['aadhaar', 'aadhar', 'pan', 'marksheet', 'certificate', 'document', 'scan', 'extract',
           'ocr', 'read', 'photo', 'upload'],
      hinglish: ['data nikalo', 'photo se', 'aadhaar bhejo', 'pan card', 'document padho',
                 'marksheet upload', 'photo upload karo', 'scan karo']
    };

    this.requiredAgents = ['documentAIAgent'];

    // किस तरह के दस्तावेज़ समझ सकती है
    this.supportedDocTypes = [
      { id: 'aadhaar', name: 'आधार कार्ड', nameEn: 'Aadhaar Card', fields: 'नाम, पिता, जन्मतिथि, पता, आधार नंबर' },
      { id: 'pan', name: 'पैन कार्ड', nameEn: 'PAN Card', fields: 'नाम, पिता, जन्मतिथि, PAN नंबर' },
      { id: 'voter_id', name: 'मतदाता पहचान पत्र', nameEn: 'Voter ID (EPIC)', fields: 'नाम, पिता, EPIC नंबर, पता, फोटो' },
      { id: 'driving_license', name: 'ड्राइविंग लाइसेंस', nameEn: 'Driving License (DL)', fields: 'नाम, DL नंबर, वैधता, पता, वाहन श्रेणी' },
      { id: 'marksheet_10', name: '10वीं मार्कशीट', nameEn: '10th Marksheet', fields: 'नाम, रोल नं, विषय, अंक, वर्ष' },
      { id: 'marksheet_12', name: '12वीं मार्कशीट', nameEn: '12th Marksheet', fields: 'नाम, रोल नं, विषय, अंक, वर्ष' },
      { id: 'degree', name: 'डिग्री/ग्रेजुएशन', nameEn: 'Degree Certificate', fields: 'नाम, विश्वविद्यालय, डिग्री, वर्ष' },
      { id: 'caste', name: 'जाति प्रमाणपत्र', nameEn: 'Caste Certificate', fields: 'नाम, जाति, जिला, प्रमाणपत्र संख्या' },
      { id: 'income', name: 'आय प्रमाणपत्र', nameEn: 'Income Certificate', fields: 'नाम, वार्षिक आय, जिला, प्रमाणपत्र संख्या' },
      { id: 'domicile', name: 'निवास प्रमाणपत्र', nameEn: 'Domicile Certificate', fields: 'नाम, पता, जिला, प्रमाणपत्र संख्या' },
      { id: 'ews', name: 'EWS प्रमाणपत्र', nameEn: 'EWS Certificate', fields: 'नाम, आय, जिला, प्रमाणपत्र संख्या' },
      { id: 'passport', name: 'पासपोर्ट', nameEn: 'Passport', fields: 'नाम, पासपोर्ट नंबर, वैधता, पता' }
    ];
  }

  async execute(context) {
    const { message, params } = context;
    const text = message.toLowerCase();

    // कौन सा document type detect हुआ
    let docType = params?.documentType || 'general';
    if (/\baadhar\b|\baadhaar\b/i.test(text) || text.includes('आधार')) docType = 'aadhaar';
    else if (/\bpan\b|\bpancard\b/i.test(text) || text.includes('पैन')) docType = 'pan';
    else if (/\bvoter\b/i.test(text) || text.includes('मतदाता') || text.includes('epic')) docType = 'voter_id';
    else if (/\bdriving\b|\blicense\b|\bdl\b/i.test(text) || text.includes('लाइसेंस')) docType = 'driving_license';
    else if ((/\bpassport\b/i.test(text) || text.includes('पासपोर्ट')) && !/photo|फोटो|size|साइज|banao|बनाओ|banana|बनाना/i.test(text)) docType = 'passport';
    else if (/\bmarksheet\b/i.test(text) || text.includes('मार्कशीट')) docType = 'marksheet';
    else if (/\bcaste\b/i.test(text) || text.includes('जाति')) docType = 'caste';
    else if (/\bdegree\b/i.test(text) || text.includes('डिग्री')) docType = 'degree';

    // Document type बताया — upload करवाओ
    if (docType !== 'general') {
      const docInfo = this.supportedDocTypes.find(d => d.id === docType || docType.includes(d.id));
      const displayName = docInfo ? docInfo.name : docType;
      const fields = docInfo?.fields || 'नाम, पिता का नाम, जन्म तिथि, पता, नंबर';

      return this._reply(
        `📸 *${displayName}* प्रोसेस करने के लिए तैयार!\n\nकृपया अपने ${displayName} की साफ़ फोटो या PDF अपलोड करें।\n\nमैं इसमें से ऑटोमैटिक निकालूँगा:\n${fields.split(', ').map(f => `• ${f}`).join('\n')}\n\n💡 *टिप:* साफ़ और सीधी फोटो भेजने से रिज़ल्ट बेहतर आता है।\n\n⚠️ *नोट:* यदि कोई फील्ड पढ़ने में नहीं आता, तो उसकी जगह "____________________" छोड़ दी जाएगी जिसे आप बाद में भर सकते हैं।`,
        { mode: 'document_upload', docType, action: 'upload_document' },
        'openUploader'
      );
    }

    // सामान्य — कौन सा document भेजना है पूछो
    const docList = this.supportedDocTypes.map(d => `• ${d.name} (${d.nameEn})`).join('\n');
    return this._reply(
      `📄 Document OCR तैयार है!\n\nमैं इन दस्तावेज़ों से डेटा निकाल सकता हूँ:\n${docList}\n\nकृपया बताएं कौन सा दस्तावेज़ भेजना है, या सीधे फोटो/PDF अपलोड करें — मैं खुद पहचान लूँगा।`,
      { mode: 'document_select', supportedTypes: this.supportedDocTypes }
    );
  }
}

module.exports = { DocumentOcrSkill };
