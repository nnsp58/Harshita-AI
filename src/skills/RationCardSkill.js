/**
 * RationCardSkill — AI-Powered Ration Card Service
 *
 * Capabilities:
 *   - Status check (by ration card number / Aadhaar / name)
 *   - Search by name + father's name + district
 *   - New application guidance
 *   - Multi-state support (UP, Delhi, Maharashtra, Bihar, MP)
 *   - Smart conversational AI replies
 */

const { BaseSkill } = require('./BaseSkill');
const { AISkillHelper } = require('./AISkillHelper');
const { RationCardAgent } = require('../agents/rationCardAgent');

class RationCardSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'ration_card';
    this.displayName = 'राशन कार्ड';
    this.displayNameEn = 'Ration Card Service';
    this.description = 'राशन कार्ड स्टेटस, खोज, और नया आवेदन — AI से';
    this.descriptionEn = 'Ration card status, search, and apply with AI';
    this.version = '2.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.priority = 7;

    this.intents = ['ration_card', 'rashan_card', 'bpl_card', 'ration_status', 'ration_search', 'ration_apply'];

    this.keywords = {
      hi: ['राशन', 'बीपीएल', 'खाद्य', 'राशन कार्ड', 'राशनकार्ड', 'अंत्योदय', 'पात्रता',
           'सदस्य जोड़ो', 'सदस्य हटाओ', 'खाद्य सुरक्षा', 'पीएचएच'],
      en: ['ration', 'bpl', 'apl', 'nfsa', 'ration card', 'food security', 'antyodaya',
           'phh', 'priority household', 'aay', 'check ration'],
      hinglish: ['rashan card', 'ration card banwao', 'bpl card', 'ration status check karo',
                 'rashan ka status', 'naya ration card', 'ration card number kya hai',
                 'rashan search karo', 'ration dhundo', 'family member add karo']
    };

    // Browser-automation backend agent
    this.agent = new RationCardAgent();

    // Per-user collected data (multi-turn conversation)
    this.userSessions = new Map();
  }

  async execute(context) {
    const { message, userId, app } = context;
    if (!message) return this._reply(this._getMenu());

    const userIdSafe = userId || 'anon';
    const session = this._getSession(userIdSafe);
    const pastContext = this._getContext ? this._getContext(userIdSafe, 5) : '';

    // Use AI to extract intent + entities
    const fields = [
      { key: 'rationCardNumber', desc: 'Ration card number (12-15 digits)' },
      { key: 'aadhaarNumber', desc: 'Aadhaar number (12 digits)' },
      { key: 'name', desc: 'Card holder full name' },
      { key: 'fatherName', desc: 'Father / Husband name' },
      { key: 'state', desc: 'State (UP, Delhi, Maharashtra, etc.)' },
      { key: 'district', desc: 'District name' },
      { key: 'block', desc: 'Block / tehsil name' },
    ];

    const aiResult = await AISkillHelper.extractIntent({
      userInput: message,
      skillName: 'ration_card',
      fields,
      context: pastContext,
    });

    // Merge with existing session data
    Object.assign(session.entities, aiResult.entities || {});
    if (aiResult.intent) session.intent = aiResult.intent;

    // Default state to UP if not specified
    if (!session.entities.state) session.entities.state = 'uttar_pradesh';

    const intent = session.intent || this._fallbackIntentDetect(message);

    // ────── Route based on intent ──────
    switch (intent) {
      case 'check_status':
      case 'ration_status':
      case 'status':
        return await this._handleStatusCheck(session);

      case 'search':
      case 'find':
      case 'ration_search':
        return await this._handleSearch(session);

      case 'apply_new':
      case 'new_application':
      case 'ration_apply':
        return await this._handleNewApplication(session);

      case 'add_member':
      case 'remove_member':
        return this._handleMemberOps(session, intent);

      default:
        // Use AI for natural conversational reply
        return await this._smartReply(message, pastContext);
    }
  }

  // ─────────── Status Check ───────────
  async _handleStatusCheck(session) {
    let { rationCardNumber, aadhaarNumber, name, state, district } = session.entities;

    // Need at least ration card number OR (name + district)
    if (!rationCardNumber && !aadhaarNumber && !(name && district)) {
      return this._reply(
        `🔍 *राशन कार्ड स्टेटस चेक*\n\n` +
        `मुझे ये जानकारी चाहिए:\n` +
        `• राशन कार्ड नंबर, या\n` +
        `• आधार नंबर, या\n` +
        `• पूरा नाम + जिला\n\n` +
        `Example: "Mera ration card 123456789012 hai, status batao"\n` +
        `Or: "Naam Ramesh Kumar, district Kannauj, ration card status batao"`,
        { mode: 'awaiting_details', collected: session.entities }
      );
    }

    // Aadhaar number strict validation (12 digits)
    if (aadhaarNumber) {
      const cleanAadhaar = String(aadhaarNumber).replace(/[\s-]/g, '');
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        return this._reply(
          `⚠️ *अमान्य आधार संख्या (Invalid Aadhaar Number)*\n\n` +
          `कृपया एक वैध 12 अंकों का आधार नंबर प्रदान करें (जैसे: 123456789012)।`,
          { mode: 'validation_error', field: 'aadhaarNumber' }
        );
      }
      session.entities.aadhaarNumber = cleanAadhaar;
      aadhaarNumber = cleanAadhaar;
    }

    // Ration Card number strict validation (12 or 15 digits)
    if (rationCardNumber) {
      const cleanRation = String(rationCardNumber).replace(/[\s-]/g, '');
      if (!/^\d{12}$/.test(cleanRation) && !/^\d{15}$/.test(cleanRation)) {
        return this._reply(
          `⚠️ *अमान्य राशन कार्ड संख्या (Invalid Ration Card Number)*\n\n` +
          `भारतीय राशन कार्ड नंबर आमतौर पर 12 या 15 अंकों का होता है। कृपया इसे चेक करें।`,
          { mode: 'validation_error', field: 'rationCardNumber' }
        );
      }
      session.entities.rationCardNumber = cleanRation;
      rationCardNumber = cleanRation;
    }

    // Trigger browser automation
    try {
      const result = await this.agent.execute({
        action: 'check_status',
        state,
        rationCardNumber,
        name,
        district,
      });

      if (result.success) {
        return this._reply(
          `✅ *Browser खुल गया!*\n\n` +
          `📍 Portal: ${result.portal}\n` +
          `🔍 Searching for: ${rationCardNumber || name}\n\n` +
          `${result.requiresManualStep ? '⚠️ कृपया browser में CAPTCHA भरें — bas! Status दिख जाएगा।' : ''}`,
          { mode: 'browser_opened', portal: result.portal }
        );
      }
      return this._reply(
        `❌ Status check failed: ${result.message || result.error}\n\nFCS पोर्टल manually visit करें: https://fcs.up.gov.in`
      );
    } catch (err) {
      return this._reply(
        `⚠️ Browser automation error: ${err.message}\n\n` +
        `मैन्युअल लिंक:\n` +
        `• UP: https://fcs.up.gov.in\n` +
        `• Delhi: https://nfs.delhi.gov.in\n` +
        `• Maharashtra: https://rcms.mahafood.gov.in`
      );
    }
  }

  // ─────────── Search ───────────
  async _handleSearch(session) {
    const { name, fatherName, state, district } = session.entities;
    if (!name) {
      return this._reply(
        `🔎 *Ration card search*\n\nनाम + पिता का नाम + जिला बताएं:\n\n` +
        `Example: "Search Ramesh Kumar S/o Mohan Lal in Kannauj district"`,
        { mode: 'awaiting_search_details' }
      );
    }
    try {
      const result = await this.agent.execute({
        action: 'search', state, name, fatherName, district,
      });
      return this._reply(
        `✅ Search portal opened on ${result.portal || 'NFSA'}.\n\n` +
        `Browser में:\n1. नाम fill होगा\n2. CAPTCHA भरें\n3. Submit करें`,
        { mode: 'search_initiated', name, district }
      );
    } catch (err) {
      return this._reply(`Error: ${err.message}`);
    }
  }

  // ─────────── New Application ───────────
  async _handleNewApplication(session) {
    return this._reply(
      `📝 *नया राशन कार्ड आवेदन*\n\n` +
      `मुझे ये जानकारी चाहिए:\n` +
      `1. परिवार के मुखिया का नाम\n` +
      `2. आधार कार्ड नंबर\n` +
      `3. परिवार के सभी सदस्यों के आधार\n` +
      `4. वर्तमान पता\n` +
      `5. आय प्रमाण पत्र\n` +
      `6. जिला + ब्लॉक\n\n` +
      `📎 आधार कार्ड की photo upload करें — मैं details auto-fill कर दूंगा!`,
      { mode: 'apply_new', step: 'collect_documents' },
      'openUploader'
    );
  }

  _handleMemberOps(session, op) {
    const action = op === 'add_member' ? 'जोड़ने' : 'हटाने';
    return this._reply(
      `👥 *परिवार सदस्य ${action}*\n\n` +
      `मुझे बताएं:\n` +
      `• आपका राशन कार्ड नंबर\n` +
      `• ${op === 'add_member' ? 'नए सदस्य' : 'जिस सदस्य'} का नाम और आधार\n\n` +
      `यह काम SDM/तहसील दफ्तर में होता है। Form भरने में मदद कर सकती हूँ।`
    );
  }

  // ─────────── AI Smart Reply ───────────
  async _smartReply(userInput, context) {
    const reply = await AISkillHelper.generateReply({
      skillName: 'ration_card',
      userInput,
      context,
      systemRole: `You are a helpful AI for Indian Ration Card services (NFSA, BPL, APL, AAY).
You help users with:
- Status check (by card number / Aadhaar / name)
- Search ration card details
- New application
- Member add/remove
- Information about food security schemes`,
      guidance: [
        'If user provides name + district, ask them to confirm and offer to search',
        'If user wants something this skill cannot directly do, suggest visiting the portal manually',
        'Always offer concrete next steps',
      ],
    });

    if (reply) return this._reply(reply, { mode: 'ai_reply' });
    return this._reply(this._getMenu());
  }

  _fallbackIntentDetect(text) {
    const t = text.toLowerCase();
    if (/status|स्टेटस|check.*ration|ration.*check/i.test(t)) return 'check_status';
    if (/search|find|खोज|dhund|number.*kya|naam.*se/i.test(t)) return 'search';
    if (/apply|new|naya|बनवा|banwao|application/i.test(t)) return 'apply_new';
    if (/add.*member|सदस्य.*जोड़|member.*add/i.test(t)) return 'add_member';
    if (/remove.*member|सदस्य.*हटा|member.*remove/i.test(t)) return 'remove_member';
    return 'unknown';
  }

  _getSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, { entities: {}, intent: null, createdAt: Date.now() });
    }
    return this.userSessions.get(userId);
  }

  _getMenu() {
    return `🍚 *राशन कार्ड सेवा (Ration Card Service)*\n\n` +
      `मुझसे क्या काम है? बस अपनी बात बताओ:\n\n` +
      `📋 *उदाहरण:*\n` +
      `• "मेरा ration card 123456789012 ka status check karo"\n` +
      `• "Ram Singh S/o Mohan Lal ke naam ka ration card dhundo Kannauj me"\n` +
      `• "Naya ration card banwana hai"\n` +
      `• "Family mein naya member add karna hai"\n` +
      `• "BPL aur APL ka difference batao"\n\n` +
      `मैं Hindi, English, ya Hinglish — किसी भी भाषा में बात कर सकती हूँ।`;
  }
}

module.exports = { RationCardSkill };
