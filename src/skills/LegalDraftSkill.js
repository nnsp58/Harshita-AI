const { BaseSkill } = require('./BaseSkill');
const legalEnginePipeline = require('./legal/LegalEnginePipeline');

class LegalDraftSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_draft';
    this.displayName = 'कानूनी ड्राफ्ट';
    this.displayNameEn = 'Legal Document Generator (AI)';
    this.description = 'AI से कोई भी कानूनी दस्तावेज़ बनाना (PRD-022 Engine)';
    this.descriptionEn = 'AI-powered automatic legal document generation using Legal Reasoning Engine';
    this.version = '4.0.0'; // Upgraded for PRD-022
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 7;
    
    // Catch-all intents for legal matters
    this.intents = [
      'legal_draft', 'affidavit', 'agreement', 'legal_document', 'gift_deed', 'noc',
      'partition_deed', 'will', 'police_complaint', 'rti', 'consumer_complaint',
      'electricity_complaint', 'revenue_application', 'pension_application', 'court_draft',
      'prayer_letter', 'application', 'draft', 'representation', 'complaint', 'notice', 'undertaking',
      'money_recovery'
    ];
    this.keywords = {
      hi: ['कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'अनुबंध', 'वकील', 'कानून', 'नोटिस'],
      en: ['legal', 'draft', 'affidavit', 'agreement', 'contract', 'lawyer', 'notice'],
      hinglish: ['legal draft banao', 'affidavit banao', 'agreement likho', 'notice bhejo']
    };
  }

  async execute(context) {
    const { message, userId } = context;
    if (!message) {
      return this._reply("कृपया बताएं, आपको किस प्रकार का कानूनी दस्तावेज़ बनवाना है?", { mode: 'legal_menu' });
    }

    const userIdSafe = userId || 'anon';

    try {
      // Delegate entirely to the PRD-022 Legal Engine Pipeline
      const response = await legalEnginePipeline.processRequest(userIdSafe, message);
      
      return this._reply(response.reply, {
        mode: response.mode,
        docType: response.docType || 'general',
        editable: response.mode === 'legal_generated', // Only editable if final draft
        originalQuery: message,
      });
    } catch (error) {
      console.error("[LegalDraftSkill] Pipeline execution error:", error);
      return this._reply("क्षमा करें, आपके दस्तावेज़ को प्रोसेस करने में कुछ तकनीकी समस्या आई है। कृपया पुनः प्रयास करें।", { mode: 'error' });
    }
  }
}

module.exports = { LegalDraftSkill };
