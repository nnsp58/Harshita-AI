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

    this.visible = true;
    this.type = 'application';
    this.route = '/tada';

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

    // नक्शा भरना / बनाना / fill करना → REDIRECT to TA/DA Naksha form page
    if (text.includes('नक्शा') || text.includes('naksha') || text.includes('fill') || 
        text.includes('भरो') || text.includes('भरना') || text.includes('bharo') ||
        text.includes('बनाओ') || text.includes('banao') || text.includes('nikalo') ||
        text.includes('generate') || text.includes('new') || text.includes('नया')) {
      return this._reply(
        '📝 TA/DA नक्शा पेज खोल रहा हूँ...\n\nवहाँ आप:\n• कर्मचारी की जानकारी भरें (नाम, PNO, पद)\n• हर दिन की यात्रा (From → To) जोड़ें\n• Live Preview देखें और Print करें\n\nProfile save करें तो अगली बार auto-fill हो जाएगा!',
        { mode: 'tada_create', navigate: '/tada-naksha' }
      );
    }

    // सामान्य TA/DA अनुरोध — also redirect to naksha page
    return this._reply(
      '🧾 TA/DA नक्शा पेज खोल रहा हूँ!\n\nआप वहाँ:\n• Per-day यात्रा entries भर सकते हैं\n• Distance, fare, DA auto-calculate होगा\n• Hindi/English दोनों में support है\n• Print-ready Legal format में preview मिलेगा',
      { mode: 'tada_menu', navigate: '/tada-naksha' }
    );
  }
}

module.exports = { TadaSkill };
