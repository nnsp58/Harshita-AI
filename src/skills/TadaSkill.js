/**
 * TadaSkill — TA/DA (यात्रा भत्ता / दैनिक भत्ता) प्रोसेसिंग
 * 
 * पुलिस / सरकारी कर्मचारियों के TA/DA फॉर्म से डेटा निकालना,
 * नया TA/DA बनाना, और रूट/दूरी की जानकारी देना।
 * मौजूदा pdfProcessorAgent का उपयोग करती है।
 */

const { BaseSkill } = require('./BaseSkill');

class TadaSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'tada_process';
    this.displayName = 'TA/DA प्रोसेसर';
    this.displayNameEn = 'TA/DA Processor';
    this.description = 'यात्रा भत्ता / दैनिक भत्ता (TA/DA) फॉर्म प्रोसेसिंग और जनरेशन';
    this.descriptionEn = 'Travel Allowance / Dearness Allowance form processing and generation';
    this.version = '1.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.priority = 7;

    this.intents = ['tada_process', 'ta_da_form', 'travel_allowance', 'yatra_bhatta'];

    this.keywords = {
      hi: ['भत्ता', 'यात्रा भत्ता', 'दैनिक भत्ता', 'टीए', 'डीए', 'सफर खर्चा', 'ड्यूटी', 'नक्शा'],
      en: ['tada', 'ta/da', 'ta da', 'travel allowance', 'dearness allowance', 'duty', 'conveyance'],
      hinglish: ['tada nikalo', 'ta da banao', 'safar kharcha', 'duty ka bhatta', 'tada form',
                 'yatra bhatta', 'tada process karo']
    };

    this.requiredAgents = ['pdfProcessorAgent'];
  }

  async execute(context) {
    const { message, params, app } = context;
    const text = message.toLowerCase();

    // PDF प्रोसेसिंग — पुराने TA/DA से सीखना
    if (text.includes('process') || text.includes('प्रोसेस') || text.includes('सीखो') ||
        text.includes('learn') || text.includes('pdf') || text.includes('upload')) {
      return this._reply(
        '📄 TA/DA PDF प्रोसेसर तैयार है!\n\nकृपया अपना TA/DA फॉर्म (PDF) अपलोड करें।\nमैं उसमें से सारा डेटा निकालकर सीख लूँगा — जैसे:\n• कर्मचारी का नाम और पद\n• यात्रा का रूट और दूरी\n• DA रेट और कुल खर्चा\n\nइससे अगली बार मैं खुद TA/DA बना सकूँगा!',
        { mode: 'tada_upload', action: 'upload_pdf' },
        'openUploader'
      );
    }

    // नया TA/DA बनाना
    if (text.includes('बनाओ') || text.includes('generate') || text.includes('new') || 
        text.includes('नया') || text.includes('banao') || text.includes('nikalo')) {
      return this._reply(
        '📝 नया TA/DA फॉर्म बनाने के लिए मुझे ये जानकारी चाहिए:\n\n1. कर्मचारी का नाम और PNO\n2. पद (Designation)\n3. कहाँ से कहाँ गए (From → To)\n4. तारीख (Date)\n5. ड्यूटी का उद्देश्य\n\nआप बोलकर या टाइप करके बता सकते हैं।',
        { mode: 'tada_create', step: 'collect_info' }
      );
    }

    // सामान्य TA/DA अनुरोध
    return this._reply(
      '🧾 TA/DA प्रोसेसर तैयार है!\n\nआप ये कर सकते हैं:\n• "TA/DA PDF अपलोड करो" — पुराने फॉर्म से सीखने के लिए\n• "नया TA/DA बनाओ" — नया फॉर्म जनरेट करने के लिए\n• "TA/DA रेट बताओ" — DA रेट्स जानने के लिए\n\nक्या करना है बताइए!',
      { mode: 'tada_menu' }
    );
  }
}

module.exports = { TadaSkill };
