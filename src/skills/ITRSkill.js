const { BaseSkill } = require('./BaseSkill');

class ITRSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'itr_agent';
    this.displayName = 'ITR Agent';
    this.displayNameEn = 'Income Tax Return Agent';
    this.description = 'AI First Routing ITR Assistant (PRD-060)';
    this.descriptionEn = 'Seamless ITR filing workflow triggered by natural language';
    this.version = '2.0.0';
    this.category = 'finance';
    this.canRunOffline = true;
    this.priority = 10;
    
    this.intents = ['itr_filing', 'file_itr', 'income_tax_return'];
    
    this.keywords = {
      hi: ['आईटीआर', 'टैक्स', 'रिटर्न', 'भर दो', 'इनकम टैक्स'],
      en: ['itr', 'tax', 'return', 'file', 'income tax'],
      hinglish: ['itr bhar do', 'tax file karna hai', 'return bharo']
    };

    // Store conversational states per user
    // format: { pan: null, aadhaar: null, dob: null, step: 'pan' }
    this.sessions = new Map();
  }

  async execute(context) {
    const { message, userId } = context;
    const uid = userId || 'anon';
    
    // Initialize session if not exists
    if (!this.sessions.has(uid)) {
      this.sessions.set(uid, { pan: null, aadhaar: null, dob: null, step: 'pan' });
      return this._reply("✔ ITR Agent Selected.\n\nTo file your Income Tax Return, please provide your **PAN Number**.", { mode: 'chat' });
    }

    const session = this.sessions.get(uid);
    const msg = message ? message.trim().toUpperCase() : '';

    // Simple State Machine
    if (session.step === 'pan') {
      if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(msg)) {
        session.pan = msg;
        session.step = 'aadhaar';
        return this._reply(`PAN (${msg}) received.\n\nNow, please provide your **Aadhaar Number** (12 digits).`, { mode: 'chat' });
      } else {
        return this._reply("That doesn't look like a valid PAN. Please provide a valid 10-character PAN Number (e.g., ABCDE1234F).", { mode: 'chat' });
      }
    }

    if (session.step === 'aadhaar') {
      if (/^\d{12}$/.test(msg.replace(/\s/g, ''))) {
        session.aadhaar = msg.replace(/\s/g, '');
        session.step = 'dob';
        return this._reply(`Aadhaar (${session.aadhaar}) received.\n\nFinally, please provide your **Date of Birth** (DD/MM/YYYY).`, { mode: 'chat' });
      } else {
        return this._reply("That doesn't look like a valid Aadhaar. Please provide a valid 12-digit Aadhaar Number.", { mode: 'chat' });
      }
    }

    if (session.step === 'dob') {
      // Basic check for Date of birth
      if (msg.length >= 8) {
        session.dob = msg;
        session.step = 'complete';
        
        // Mock API Fetch & Analysis
        const replyText = `Fetching Available Data for PAN: ${session.pan}...\nChecking Income Type...\n\n**Detected:** ITR-1 (Sahaj)\n\nReady to File. I have pre-filled your basic details.`;
        
        // Clear session so they can start over next time
        this.sessions.delete(uid);

        return this._reply(replyText, {
          mode: 'itr_workspace',
          action: 'navigate',
          route: `/itr-filing?pan=${session.pan}&aadhaar=${session.aadhaar}&auto=true`,
          data: {
            pan: session.pan,
            aadhaar: session.aadhaar,
            dob: session.dob,
            detectedType: 'ITR-1'
          }
        });
      } else {
        return this._reply("Please provide a valid Date of Birth (e.g. 01/01/1990).", { mode: 'chat' });
      }
    }

    // Fallback
    this.sessions.delete(uid);
    return this._reply("ITR session reset. How can I help you?", { mode: 'chat' });
  }
}

module.exports = { ITRSkill };
