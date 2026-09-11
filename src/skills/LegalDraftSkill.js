const { BaseSkill } = require('./BaseSkill');
const { MasterLegalAgent } = require('../departments/legal/MasterLegalAgent');
const { legalComplaintEngine } = require('../departments/legal/LegalComplaintEngine');

class LegalDraftSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_draft';
    this.displayName = 'कानूनी ड्राफ्ट';
    this.displayNameEn = 'Legal Document Generator (AI)';
    this.description = 'AI व स्थानीय कानूनी तर्क इंजन से कोर्ट व पुलिस शिकायत मसौदा तैयार करना';
    this.descriptionEn = 'AI & Local Legal Reasoning Engine for Police Complaints & Legal Drafting';
    this.version = '5.0.0';
    this.category = 'document';
    this.canRunOffline = true; // 100% Offline Capable via Legal Engines
    this.priority = 9;
    
    // Catch-all intents for legal matters
    this.intents = [
      'legal_draft', 'affidavit', 'agreement', 'legal_document', 'gift_deed', 'noc',
      'partition_deed', 'will', 'police_complaint', 'rti', 'consumer_complaint',
      'electricity_complaint', 'revenue_application', 'pension_application', 'court_draft',
      'prayer_letter', 'application', 'draft', 'representation', 'complaint', 'notice', 'undertaking',
      'money_recovery'
    ];

    this.visible = true;
    this.type = 'application';
    this.route = '/workspace/legal/affidavit';
    this.keywords = {
      hi: ['कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'अनुबंध', 'वकील', 'कानून', 'नोटिस', 'शिकायत', 'चोरी', 'थाना'],
      en: ['legal', 'draft', 'affidavit', 'agreement', 'contract', 'lawyer', 'notice', 'complaint', 'police', 'theft'],
      hinglish: ['legal draft banao', 'affidavit banao', 'agreement likho', 'notice bhejo', 'police complaint', 'chori ki shikayat']
    };
  }

  async execute(context) {
    const { message, userId } = context;
    if (!message) {
      return this._reply("कृपया बताएं, आपको किस प्रकार का कानूनी दस्तावेज़ या शिकायत पत्र बनवाना है?", { mode: 'legal_menu' });
    }

    try {
      // 1. Check if this is a Police Complaint / Criminal Allegation
      if (legalComplaintEngine.isComplaintRequest(message) || context.params?.docCategory === 'police_complaint' || context.params?.docType === 'police_complaint') {
        const complaintResult = legalComplaintEngine.process(message);
        return this._reply(complaintResult.message, complaintResult.action, 'openDocumentStudio');
      }

      // 2. Delegate to MasterLegalAgent
      const masterAgent = new MasterLegalAgent();
      const response = await masterAgent.processRequest({
          intent: message,
          memory: context.extractedEntities || {}
      });
      
      let replyMessage = response.message || response.document;
      
      return this._reply(replyMessage, {
        mode: response.mode || 'legal_generated',
        docType: response.docType || 'general',
        editable: true,
        originalQuery: message,
      });
    } catch (error) {
      console.error("[LegalDraftSkill] Pipeline execution error:", error);
      
      // Offline Emergency Fallback: If anything fails, use complaint engine
      try {
        const fallbackResult = legalComplaintEngine.process(message);
        return this._reply(fallbackResult.message, fallbackResult.action, 'openDocumentStudio');
      } catch (e) {
        return this._reply("क्षमा करें, कानूनी दस्तावेज़ प्रोसेस करने में कुछ तकनीकी समस्या आई है। कृपया पुनः प्रयास करें।", { mode: 'error' });
      }
    }
  }
}

module.exports = { LegalDraftSkill };
