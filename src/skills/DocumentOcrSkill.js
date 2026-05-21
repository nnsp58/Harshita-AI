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
      { id: 'aadhaar', name: 'आधार कार्ड', nameEn: 'Aadhaar Card' },
      { id: 'pan', name: 'पैन कार्ड', nameEn: 'PAN Card' },
      { id: 'marksheet_10', name: '10वीं मार्कशीट', nameEn: '10th Marksheet' },
      { id: 'marksheet_12', name: '12वीं मार्कशीट', nameEn: '12th Marksheet' },
      { id: 'degree', name: 'डिग्री/ग्रेजुएशन', nameEn: 'Degree Certificate' },
      { id: 'caste', name: 'जाति प्रमाणपत्र', nameEn: 'Caste Certificate' },
      { id: 'income', name: 'आय प्रमाणपत्र', nameEn: 'Income Certificate' },
      { id: 'domicile', name: 'निवास प्रमाणपत्र', nameEn: 'Domicile Certificate' },
      { id: 'ews', name: 'EWS प्रमाणपत्र', nameEn: 'EWS Certificate' }
    ];
  }

  async execute(context) {
    const { message, params } = context;
    const text = message.toLowerCase();

    // कौन सा document type detect हुआ
    let docType = params?.documentType || 'general';
    if (text.includes('aadhaar') || text.includes('आधार')) docType = 'aadhaar';
    else if (text.includes('pan') || text.includes('पैन')) docType = 'pan';
    else if (text.includes('marksheet') || text.includes('मार्कशीट')) docType = 'marksheet';
    else if (text.includes('caste') || text.includes('जाति')) docType = 'caste';
    else if (text.includes('degree') || text.includes('डिग्री')) docType = 'degree';

    // Document type बताया — upload करवाओ
    if (docType !== 'general') {
      const docInfo = this.supportedDocTypes.find(d => d.id === docType || docType.includes(d.id));
      const displayName = docInfo ? docInfo.name : docType;

      return this._reply(
        `📸 *${displayName}* प्रोसेस करने के लिए तैयार!\n\nकृपया अपने ${displayName} की साफ़ फोटो या PDF अपलोड करें।\n\nमैं इसमें से ऑटोमैटिक निकालूँगा:\n• नाम, पिता का नाम\n• जन्म तिथि\n• पता और पिनकोड\n• नंबर (आधार/पैन)\n\n💡 *टिप:* साफ़ और सीधी फोटो भेजने से रिज़ल्ट बेहतर आता है।`,
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
