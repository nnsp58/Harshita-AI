/**
 * LegalDraftSkill — कानूनी दस्तावेज़ ड्राफ्टिंग
 */
const { BaseSkill } = require('./BaseSkill');

class LegalDraftSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_draft';
    this.displayName = 'कानूनी ड्राफ्ट';
    this.displayNameEn = 'Legal Document Drafting';
    this.description = 'शपथपत्र, अनुबंध, और कानूनी दस्तावेज़ बनाना';
    this.descriptionEn = 'Affidavit, agreement, and legal document drafting';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 6;
    this.intents = ['legal_draft', 'affidavit', 'agreement', 'legal_document'];
    this.keywords = {
      hi: ['कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'एफिडेविट', 'अनुबंध', 'वकील', 'कानून'],
      en: ['legal', 'draft', 'affidavit', 'agreement', 'contract', 'lawyer', 'notary'],
      hinglish: ['legal draft banao', 'affidavit banao', 'agreement likho', 'kanuni document']
    };
    this.requiredAgents = ['legalDraftAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('affidavit') || text.includes('शपथपत्र') || text.includes('एफिडेविट')) {
      return this._reply('📜 शपथपत्र बनाने के लिए बताएं:\n1. किसका शपथपत्र (नाम)\n2. किस विषय पर\n3. कहाँ जमा करना है', { mode: 'affidavit', step: 'collect' });
    }

    if (text.includes('agreement') || text.includes('अनुबंध') || text.includes('contract')) {
      return this._reply('📋 अनुबंध/Agreement बनाने के लिए बताएं:\n1. किन पक्षों के बीच\n2. विषय क्या है\n3. अवधि कितनी है', { mode: 'agreement', step: 'collect' });
    }

    return this._reply('⚖️ कानूनी ड्राफ्ट सेवा:\n• "शपथपत्र बनाओ"\n• "Agreement ड्राफ्ट करो"\n• "RTI लिखो"\n\nक्या बनाना है?', { mode: 'legal_menu' });
  }
}

module.exports = { LegalDraftSkill };
