/**
 * ApplicationSkill — AI-Powered Formal Application Generator
 *
 * User provides a subject, and AI generates a formal application (prarthna patra)
 * addressed to the appropriate officer (e.g., DM, SDM, Tehsildar, Principal, etc.)
 */

const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');

class ApplicationSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'application_writer';
    this.displayName = 'प्रार्थना पत्र एजेंट';
    this.displayNameEn = 'Application Writer (AI)';
    this.description = 'किसी भी विषय पर अधिकारियों (DM, SDM, Principal आदि) को प्रार्थना पत्र लिखें';
    this.descriptionEn = 'Automatically draft formal applications based on a subject';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 6;
    
    this.intents = ['application_writer', 'write_application', 'prarthna_patra', 'application_likho'];
    
    this.keywords = {
      hi: ['एप्लीकेशन', 'प्रार्थना पत्र', 'शिकायत पत्र', 'आवेदन पत्र', 'अधिकारी', 'डीएम', 'एसडीएम', 'लिखो', 'छुट्टी'],
      en: ['application', 'complaint letter', 'leave application', 'write application', 'official letter'],
      hinglish: ['application likho', 'prarthna patra banao', 'shikayat likho', 'dm ko application']
    };

    this.aiManager = aiProviderManager;
    this.sessions = new Map();
  }

  async execute(context) {
    const { message, userId } = context;
    const userIdSafe = userId || 'anon';

    // Check if the user just typed a generic trigger keyword without subject
    if (!message || message.length < 5 || ['application', 'prarthna patra', 'write application', 'एप्लीकेशन'].includes(message.trim().toLowerCase())) {
      return this._reply(
        'नमस्ते! मैं आपके लिए किसी भी अधिकारी (जैसे DM, SDM, प्रिंसिपल, पुलिस स्टेशन आदि) को प्रार्थना पत्र (Application) लिख सकता हूँ। \n\nकृपया मुझे बताएं कि आपको किस अधिकारी को और किस विषय पर पत्र लिखना है? \n\nउदाहरण: "डीएम साहब को गांव की सड़क खराब होने की शिकायत का पत्र लिखो।"',
        { mode: 'application_prompt' }
      );
    }

    try {
      this._reply('मैं आपके विषय पर एक प्रोफेशनल प्रार्थना पत्र तैयार कर रहा हूँ। कृपया 10-15 सेकंड प्रतीक्षा करें...', null, 'processing');
      
      const draft = await this._generateApplication(message);
      
      if (draft) {
        return this._reply(draft, {
          mode: 'application_generated',
          editable: true,
          originalQuery: message,
        });
      }
    } catch (err) {
      console.error('[ApplicationSkill] AI generation failed:', err.message);
    }

    // Fallback if AI fails
    const fallback = this._generateFallbackTemplate(message);
    return this._reply(fallback, {
      mode: 'application_generated_template',
      editable: true,
      originalQuery: message,
      note: 'Generated from template (AI unavailable)',
    });
  }

  async _generateApplication(userInput, retryCount = 0) {
    if (!this.aiManager) return null;

    const systemPrompt = `You are an expert Indian Government / Official document writer with years of experience drafting formal applications (prarthna patra) and complaint letters in Hindi and English.

MISSION:
Write a highly professional, respectful, and perfectly formatted formal application based on the user's request.

RULES:
1. Identify the Addressee: Automatically determine the correct officer/authority to address (e.g., District Magistrate, SDM, Tehsildar, SHO, Principal, Bank Manager, etc.) based on the subject.
2. Structure:
   - "सेवा में," or "To,"
   - [Designation of the Officer]
   - [Department / Office Name]
   - [City / District Name]
   - "विषय:" or "Subject:" -> Clear and concise subject line.
   - "महोदय," or "Respected Sir/Madam,"
   - Body of the application (Polite, formal, and clear). Include placeholders like [Your Name], [Your Village/Area] if exact details are missing.
   - "सधन्यवाद," or "Thanking you,"
   - "भवदीय / प्रार्थी," or "Yours faithfully,"
   - Signature, Name, Address, Mobile, Date placeholders.
3. Language: Generate the application primarily in Hindi, as it is most commonly used in Indian government offices. If the user explicitly asks for English, write in English. If the user's prompt is mixed, default to highly formal Hindi.
4. Professional Tone: Use words like "सविनय निवेदन है कि", "अत: आपसे विनम्र निवेदन है", "कृपा करें" in Hindi.
5. No Hallucinations: Do not invent names or addresses. Use blank lines (_______________) for missing information.
6. Output ONLY the drafted application. Do not include any chatty text before or after the application.`;

    const userPrompt = `User Request: "${userInput}"

Draft the formal application now.`;

    try {
      const response = await this.aiManager.createChatCompletion('ApplicationSkill', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      let draft = response?.choices?.[0]?.message?.content?.trim();

      // If draft is too short, retry once
      if (draft && draft.length < 100 && retryCount < 1) {
        console.log('[ApplicationSkill] Draft too short — auto-retrying...');
        return this._generateApplication(userInput, retryCount + 1);
      }
      
      return draft;
    } catch (err) {
      console.error('[ApplicationSkill] AI call error:', err.message);
      return null;
    }
  }

  _generateFallbackTemplate(subject) {
    const today = new Date().toLocaleDateString('hi-IN');
    return \`सेवा में,

[अधिकारी का पदनाम / Designation]
[कार्यालय/विभाग का नाम / Department Name]
[शहर/जिला / City/District]

विषय: \${subject} के सन्दर्भ में प्रार्थना पत्र।

महोदय,

सविनय निवेदन है कि मैं [आपका नाम], [पिता/पति का नाम] का निवासी हूँ। मेरा पता [पूरा पता] है।

मैं आपका ध्यान उपरोक्त विषय की ओर आकृष्ट करना चाहता हूँ। (यहाँ अपनी समस्या या अनुरोध का विस्तार से वर्णन करें... \${subject})

अत: आपसे विनम्र निवेदन है कि कृपया मेरी समस्या का जल्द से जल्द निवारण करने की कृपा करें। मैं सदैव आपका आभारी रहूँगा।

सधन्यवाद,

दिनांक: \${today}

भवदीय / प्रार्थी,
हस्ताक्षर: ___________________
नाम: _______________________
पता: _______________________
मोबाइल: ____________________\`;
  }
}

module.exports = { ApplicationSkill };
