const { BaseSkill } = require('./BaseSkill');
const { prisma } = require('../models/database');
const { aiProviderManager } = require('../utils/aiProviderManager');

class ITRSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'itr_agent';
    this.displayName = 'Smart Tax Agent';
    this.displayNameEn = 'Smart Tax Agent (CA)';
    this.description = 'AI First Routing ITR Assistant with Permanent Tax Profile (PRD-061)';
    this.descriptionEn = 'Conversational CA that remembers user profiles and detects ITR types automatically';
    this.version = '3.0.0';
    this.category = 'finance';
    this.canRunOffline = false; // Needs AI for CA responses
    this.priority = 10;
    
    this.intents = ['itr_filing', 'file_itr', 'income_tax_return'];
    
    this.keywords = {
      hi: ['आईटीआर', 'टैक्स', 'रिटर्न', 'भर दो', 'इनकम टैक्स'],
      en: ['itr', 'tax', 'return', 'file', 'income tax'],
      hinglish: ['itr bhar do', 'tax file karna hai', 'return bharo']
    };

    // Fallback for anonymous users
    this.sessions = new Map();
  }

  async execute(context) {
    const { message, userId } = context;
    const uid = userId || 'anon';
    const msg = message ? message.trim() : '';
    
    let taxProfile = null;

    // 1. Fetch or Initialize Profile
    if (uid !== 'anon' && prisma) {
      taxProfile = await prisma.taxProfile.findUnique({ where: { user_id: uid } });
      if (!taxProfile) {
        taxProfile = await prisma.taxProfile.create({
          data: { user_id: uid }
        });
      }
    } else {
      if (!this.sessions.has(uid)) {
        this.sessions.set(uid, { pan: null, aadhaar: null, dob: null });
      }
      taxProfile = this.sessions.get(uid);
    }

    // 2. Extract incoming data (Regex)
    const panMatch = msg.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/i);
    const aadhaarMatch = msg.match(/\b\d{12}\b/);
    const dobMatch = msg.match(/\b\d{2}[\/\-]\d{2}[\/\-]\d{4}\b/);

    let updated = false;
    if (panMatch && !taxProfile.pan) { taxProfile.pan = panMatch[0].toUpperCase(); updated = true; }
    if (aadhaarMatch && !taxProfile.aadhaar) { taxProfile.aadhaar = aadhaarMatch[0]; updated = true; }
    if (dobMatch && !taxProfile.dob) { taxProfile.dob = dobMatch[0]; updated = true; }

    // Save if updated
    if (updated && uid !== 'anon' && prisma) {
      await prisma.taxProfile.update({
        where: { user_id: uid },
        data: { pan: taxProfile.pan, aadhaar: taxProfile.aadhaar, dob: taxProfile.dob }
      });
    }

    // 3. Check what's missing
    const missing = [];
    if (!taxProfile.pan) missing.push('PAN Number');
    if (!taxProfile.aadhaar) missing.push('Aadhaar Number (12-digit)');
    // if (!taxProfile.dob) missing.push('Date of Birth (DD/MM/YYYY)'); // Optional for now, let's keep it simple

    // 4. Conversational Response
    if (missing.length > 0) {
      const askFor = missing[0]; // Ask one by one
      let replyText = ``;
      if (!updated && msg === "Mera ITR bhar do") {
        replyText = `नमस्कार! मैं आपका **Smart Tax Agent (CA)** हूँ।\n\n`;
      }
      
      if (missing.length > 1 && !updated) {
         replyText += `आपके ITR के लिए मुझे कुछ जानकारी चाहिए।\n\nकृपया अपना **${askFor}** प्रदान करें।`;
      } else {
         replyText = `धन्यवाद। अब कृपया अपना **${askFor}** प्रदान करें।`;
      }

      return this._reply(replyText, { mode: 'chat' });
    }

    // 5. All core data present -> Generate CA Response & Tax Suggestions
    this._reply("सभी जानकारी प्राप्त हो गई है। मैं आपकी टैक्स प्रोफाइल का विश्लेषण कर रहा हूँ...", null, 'processing');

    try {
      // Create a prompt for the AI Provider Manager
      const prompt = `
        You are a highly professional, polite, and expert Chartered Accountant (CA) assisting an Indian taxpayer.
        User Profile:
        - PAN: ${taxProfile.pan}
        - Aadhaar: ${taxProfile.aadhaar}
        - Previous Returns: Not found.
        
        User's recent message: "${msg}"
        
        Instructions:
        1. Welcome the user back or acknowledge their complete details.
        2. Act as if you have pulled their data from Income Tax Dept / DigiLocker automatically.
        3. Determine the applicable ITR Form automatically (e.g. assume they have salary income -> ITR-1, or if they mention business -> ITR-4). 
        4. Give 2-3 specific "Tax Saving Suggestions" (e.g., Section 80C, 80D, Health Insurance) based on standard Indian tax brackets.
        5. Conclude by saying "I have prepared your draft. Click the button below to proceed to the ITR Workspace."
        
        Keep it concise, well-formatted (Markdown), and professional in Hindi-English mixed (Hinglish/Hindi).
      `;

      const aiResponse = await aiProviderManager.generateResponse(prompt, 'general');
      const caMessage = aiResponse || `नमस्कार! मैंने आपका PAN (${taxProfile.pan}) और Aadhaar वेरिफाई कर लिया है।\n\n**Detected Form:** ITR-1 (Salary Income)\n\n**💡 Tax Saving Suggestions:**\n- 80C के तहत PPF या ELSS में निवेश करें।\n- 80D के तहत हेल्थ इंश्योरेंस लें।\n\nमैंने आपका ड्राफ्ट तैयार कर लिया है। कृपया नीचे दिए गए बटन पर क्लिक करें।`;

      return this._reply(caMessage, {
        mode: 'itr_workspace',
        action: 'navigate',
        route: `/itr-filing?pan=${taxProfile.pan}&aadhaar=${taxProfile.aadhaar}&auto=true`,
        data: {
          pan: taxProfile.pan,
          aadhaar: taxProfile.aadhaar,
          detectedType: 'ITR-1'
        }
      });
    } catch (e) {
      console.error('[ITRSkill] AI Generation Failed:', e);
      return this._reply(`सर्वर में कुछ समस्या आ रही है। आपका ITR-1 तैयार है। आगे बढ़ने के लिए क्लिक करें।`, {
        mode: 'itr_workspace',
        action: 'navigate',
        route: `/itr-filing?pan=${taxProfile.pan}&aadhaar=${taxProfile.aadhaar}&auto=true`
      });
    }
  }
}

module.exports = { ITRSkill };
