/**
 * WhatsAppSkill — व्हाट्सएप मैसेजिंग और ऑटोमेशन
 */
const { BaseSkill } = require('./BaseSkill');

class WhatsAppSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'whatsapp';
    this.displayName = 'व्हाट्सएप एजेंट';
    this.displayNameEn = 'WhatsApp Agent';
    this.description = 'व्हाट्सएप पर मैसेज भेजना और नोटिफिकेशन मैनेज करना';
    this.descriptionEn = 'Send WhatsApp messages and manage notifications';
    this.version = '1.0.0';
    this.category = 'communication';
    this.canRunOffline = false;
    this.priority = 8;
    this.intents = ['whatsapp_send', 'whatsapp_status', 'send_message', 'whatsapp_connect'];
    this.keywords = {
      hi: ['व्हाट्सएप', 'मैसेज', 'भेजो', 'whatsapp', 'कनेक्ट', 'संदेश'],
      en: ['whatsapp', 'message', 'send', 'connect', 'broadcast'],
      hinglish: ['whatsapp karo', 'message bhej do', 'whatsapp connect karo']
    };
    this.requiredAgents = ['whatsAppAgent'];
  }

  async execute(context) {
    const { message, params } = context;
    const text = message.toLowerCase();

    if (text.includes('connect') || text.includes('कनेक्ट')) {
      return this._reply('📱 व्हाट्सएप कनेक्ट करने के लिए QR कोड स्कैन करें। क्या मैं QR कोड जनरेट करूँ?', { action: 'whatsapp_qr' });
    }

    if (text.includes('send') || text.includes('भेजो')) {
      return this._reply('💬 मैसेज भेजने के लिए कृपया नंबर और मैसेज बताएं।\nउदाहरण: "9876543210 पर हेलो भेजो"', { step: 'collect_info' });
    }

    return this._reply('📲 व्हाट्सएप सेवा:\n• "व्हाट्सएप कनेक्ट करो"\n• "मैसेज भेजो"\n• "स्टेटस चेक करो"\n\nमैं आपकी क्या मदद करूँ?', { mode: 'whatsapp_menu' });
  }
}

module.exports = { WhatsAppSkill };
