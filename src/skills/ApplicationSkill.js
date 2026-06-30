/**
 * ApplicationSkill — AI-Powered Formal Application Generator
 *
 * User provides a subject, and AI generates a formal application (prarthna patra)
 * addressed to the appropriate officer (e.g., DM, SDM, Tehsildar, Principal, etc.)
 */

const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { autoCapitalizeText, eliminatePlaceholders } = require('../utils/capitalization');

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

    // Ensure minimum routing
    if (!message || message.trim() === '') {
      return this._reply(this._getHelpMessage(), { mode: 'application_prompt' });
    }

    try {
      this._reply('मैं आपके विषय पर एक प्रोफेशनल प्रार्थना पत्र तैयार कर रहा हूँ। कृपया 10-15 सेकंड प्रतीक्षा करें...', null, 'processing');
      
      const processedInput = autoCapitalizeText(message);
      let draft = await this._generateApplication(processedInput);
      
      if (draft) {
        draft = autoCapitalizeText(draft);
        draft = eliminatePlaceholders(draft);
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

    const systemPrompt = `You are an expert Indian Government / Official document writer, experienced clerk, advocate, and government application writer.
Your job is to write a highly professional, respectful, and perfectly formatted formal application (प्रार्थना पत्र) based on the user's request.

Follow these strict PRARTHNA PATRA INTELLIGENCE ENGINE rules:

1. MANDATORY 18-POINT APPLICATION STRUCTURE:
Every application MUST follow this exact top-to-bottom layout visually. NEVER change this order. NEVER generate plain paragraphs without this structure.

सेवा में,

[अधिकारी का नाम / Officer Name (if known)]
[पदनाम / Designation]
[कार्यालय / Office Address]
[शहर, जिला / City, District]

विषय: (Clear, concise professional subject line)

महोदय / महोदया,

सविनय निवेदन है कि ............. (Body of facts, problem, and request. Well-formatted with proper paragraph spacing)

अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए आवश्यक कार्यवाही करने की कृपा करें। (Closing Request Paragraph)

धन्यवाद।

दिनांक: ____________________
स्थान: ____________________

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पिता/पति का नाम: ____________________
पता: ____________________
मोबाइल नंबर: ____________________

(Note: Generate Multiple Applicant/Signature list if required by the context)

2. ZERO QUESTIONS & PLACEHOLDERS RULE (CRITICAL):
NEVER ask the user to provide missing information or more details.
If required information (like applicant name, exact address, amounts, exact dates) is missing, AUTOMATICALLY insert professional blank placeholders (e.g., "[____________________]").
Always use today's date automatically unless the user specifies otherwise. DO NOT stop the generation process. DO NOT say "Please provide details".

3. AUTHORITY DETECTION ENGINE:
Detect the correct authority automatically:
- Tubewell/Panchayat Matter -> BDO (खंड विकास अधिकारी) / Gram Pradhan
- School/College Matter -> Principal (प्रधानाचार्य)
- University Matter -> Registrar (कुलसचिव)
- Police Matter -> SHO / Station House Officer (थानाध्यक्ष / थाना प्रभारी)
- Revenue Matter -> Tehsildar (तहसीलदार)
- Land Matter -> SDM (उपजिलाधिकारी)
- District Matter -> DM (जिलाधिकारी)
- Electricity Matter -> Executive Engineer (अधिशासी अभियंता)
- Water Matter -> Jal Nigam Officer (जल निगम अधिकारी)
- Pension Matter -> District Social Welfare Officer (जिला समाज कल्याण अधिकारी)
- Job Applications -> HR Manager (मानव संसाधन प्रबंधक)

4. APPLICATION CATEGORY ENGINE (30+ Domains):
Support Government (Electricity, Water, Road, Pension, Scholarship, Ration Card, Income/Caste/Residence/Character Certificates), Institutional (School/College Leave, TC, Fee Concession, Exam Re-eval, Admission), Employment (Job App, Leave, Resign, Transfer, Salary Slip, Experience Certificate), Rural/Panchayat (Tubewell, Village Mapping, Gram Sabha, PM Awas).

5. LANGUAGE RULES:
Use formal, respectful, and official Hindi (government style) unless English is explicitly requested. Keep the output ready for direct printing on A4 size.

6. Output ONLY the drafted application. Do not include any conversational chatty text before or after the application.`;

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
    return `सेवा में,

[अधिकारी का पदनाम / Designation]
[कार्यालय/विभाग का नाम / Department Name]
[शहर/जिला / City/District]

विषय: ${subject} के सन्दर्भ में प्रार्थना पत्र।

महोदय,

सविनय निवेदन है कि मैं [आपका नाम], [पिता/पति का नाम] का निवासी हूँ। मेरा पता [पूरा पता] है।

मैं आपका ध्यान उपरोक्त विषय की ओर आकृष्ट करना चाहता हूँ। (यहाँ अपनी समस्या या अनुरोध का विस्तार से वर्णन करें... ${subject})

अत: आपसे विनम्र निवेदन है कि कृपया मेरी समस्या का जल्द से जल्द निवारण करने की कृपा करें। मैं सदैव आपका आभारी रहूँगा।

सधन्यवाद,

दिनांक: ${today}

भवदीय / प्रार्थी,
हस्ताक्षर: ___________________
नाम: _______________________
पता: _______________________
मोबाइल: ____________________`;
  }
}

module.exports = { ApplicationSkill };
