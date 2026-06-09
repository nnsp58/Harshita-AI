/**
 * ProjectReportSkill — बिजनेस प्रोजेक्ट रिपोर्ट (PMEGP/मुद्रा)
 */
const { BaseSkill } = require('./BaseSkill');

class ProjectReportSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'project_report';
    this.displayName = 'प्रोजेक्ट रिपोर्ट';
    this.displayNameEn = 'Business Project Report';
    this.description = 'PMEGP/मुद्रा लोन के लिए बिजनेस प्रोजेक्ट रिपोर्ट बनाना';
    this.descriptionEn = 'Generate business project reports for PMEGP/Mudra loans';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 6;
    this.intents = ['project_report', 'business_plan', 'pmegp_report', 'mudra_loan'];
    this.keywords = {
      hi: ['प्रोजेक्ट रिपोर्ट', 'बिजनेस प्लान', 'लोन', 'मुद्रा', 'उद्योग', 'व्यापार'],
      en: ['project report', 'business plan', 'pmegp', 'mudra', 'loan', 'enterprise'],
      hinglish: ['project report banao', 'business plan chahiye', 'mudra loan', 'pmegp form']
    };
    this.requiredAgents = ['projectReportAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('pmegp')) {
      return this._reply(
        '📊 *PMEGP प्रोजेक्ट रिपोर्ट*\n\n' +
        'कृपया रिपोर्ट बनाने के लिए ये जानकारी दें:\n' +
        '1. आवेदक का नाम: ____________________\n' +
        '2. आधार संख्या / Aadhaar No.: ____________________\n' +
        '3. पैन संख्या / PAN No.: ____________________\n' +
        '4. बिजनेस का नाम (Business Name): ____________________\n' +
        '5. बिजनेस का प्रकार (Manufacturing/Service): ____________________\n' +
        '6. प्रोजेक्ट कॉस्ट / कुल खर्च: ₹____________________\n' +
        '7. अपनी तरफ से निवेश (Own Contribution 5%/10%): ₹____________________\n' +
        '8. लोन राशि (Bank Loan): ₹____________________\n\n' +
        '🔗 [PMEGP e-Portal](https://www.kviconline.gov.in/pmegpeportal)',
        { mode: 'pmegp_report', step: 'collect' }
      );
    }

    if (text.includes('mudra') || text.includes('मुद्रा')) {
      return this._reply(
        '🏦 *मुद्रा लोन (Mudra Loan) रिपोर्ट*\n\n' +
        'कृपया ये जानकारी दें:\n' +
        '1. आवेदक का नाम: ____________________\n' +
        '2. आधार और पैन नंबर: ____________________\n' +
        '3. लोन का प्रकार (शिशु ₹50k/किशोर ₹5L/तरुण ₹10L): ____________________\n' +
        '4. बिजनेस का नाम और प्रकार: ____________________\n' +
        '5. लोन राशि: ₹____________________\n\n' +
        '🔗 [Udyamimitra Portal](https://www.udyamimitra.in)',
        { mode: 'mudra_report', step: 'collect' }
      );
    }

    return this._reply(
      '📊 *प्रोजेक्ट रिपोर्ट सेवा (Business Project Report)*\n\n' +
      'बैंक लोन के लिए प्रोफेशनल प्रोजेक्ट रिपोर्ट और CMA Data:\n\n' +
      '• "PMEGP रिपोर्ट बनाओ" (25-35% subsidy)\n' +
      '• "मुद्रा लोन रिपोर्ट" (Shishu/Kishor/Tarun)\n' +
      '• "CMYK / PMFME लोन रिपोर्ट"\n\n' +
      'किस scheme के लिए प्रोजेक्ट रिपोर्ट चाहिए?',
      { mode: 'report_menu' }
    );
  }
}

module.exports = { ProjectReportSkill };
