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

    // Check if the user just typed a generic trigger keyword without subject
    if (!message || message.length < 5 || ['application', 'prarthna patra', 'write application', 'एप्लीकेशन'].includes(message.trim().toLowerCase())) {
      return this._reply(
        'नमस्ते! मैं आपके लिए किसी भी अधिकारी (जैसे DM, SDM, प्रिंसिपल, पुलिस स्टेशन आदि) को प्रार्थना पत्र (Application) लिख सकता हूँ। \n\nकृपया मुझे बताएं कि आपको किस अधिकारी को और किस विषय पर पत्र लिखना है? \n\nउदाहरण: "डीएम साहब को गांव की सड़क खराब होने की शिकायत का पत्र लिखो।"',
        { mode: 'application_prompt' }
      );
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

1. PRARTHNA PATRA STRUCTURE:
Every application must follow this traditional structure strictly:
सेवा में,

श्रीमान / महोदय (Designation of the Officer)
(Office/Department Name)
(District/City Name)

विषय: (Clear, concise professional subject line)

महोदय,

सविनय निवेदन है कि ............. (Body of facts, problem, and request)

अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए आवश्यक कार्यवाही करने की कृपा करें। (PRAYER CLAUSE)

दिनांक: ____________________
स्थान: ____________________

भवदीय,
हस्ताक्षर: ____________________
नाम: [Applicant Name]
पिता का नाम: [Father Name]
पता: [Address]
मोबाइल नंबर: [Mobile Number]

2. SUBJECT GENERATION ENGINE:
Automatically generate a highly professional subject. E.g.:
- "Meri 10th marksheet gum ho gayi" -> विषय: डुप्लीकेट अंकपत्र जारी किए जाने हेतु प्रार्थना पत्र
- "Gaon me bijli ki problem hai" -> विषय: विद्युत आपूर्ति सुचारू किए जाने हेतु प्रार्थना पत्र
- "Vridhavastha pension nahi mil rahi" -> विषय: वृद्धावस्था पेंशन स्वीकृत / पुनः प्रारम्भ किए जाने हेतु प्रार्थना पत्र
- "Rasta par kabja ho gaya" -> विषय: सार्वजनिक मार्ग से अवैध कब्जा हटवाए जाने हेतु प्रार्थना पत्र

3. AUTHORITY DETECTION ENGINE:
Detect the correct authority automatically:
- School/College Matter -> Principal (प्रधानाचार्य)
- University Matter -> Registrar (कुलसचिव)
- Police Matter -> SHO / Station House Officer (थानाध्यक्ष / थाना प्रभारी)
- Revenue Matter -> Tehsildar (तहसीलदार)
- Land Matter -> SDM (उपजिलाधिकारी)
- District Matter -> DM (जिलाधिकारी)
- Electricity Matter -> Executive Engineer (अधिशासी अभियंता)
- Water Matter -> Jal Nigam Officer (जल निगम अधिकारी)
- Pension Matter -> District Social Welfare Officer (जिला समाज कल्याण अधिकारी)

4. APPLICATION CATEGORY ENGINE:
Properly draft based on categories (School/College/University, Duplicate Marksheet, Migration Certificate, Character Certificate, Transfer Certificate, Scholarship, Police Complaint, Missing Document, Electricity/Water/Road/Drain Complaint, Pension (Widow/Divyang/Old Age), Land Dispute, Encroachment, RTI, Public Grievance, DM/SDM/Tehsildar/Lekhpal Representation).

5. AUTO FACT EXTRACTION & CAPITALIZATION:
- Extract facts like Name, Father Name, Village, Post, District, State, Pin, Mobile, Document Details, Institution Name, Date, Problem, and Requested Relief.
- Capitalize and normalize proper names correctly (e.g. nar narayan singh -> Nar Narayan Singh, meer singh -> Meer Singh, sikhera -> Sikhera, bulandshahr -> Bulandshahr, uttar pradesh -> Uttar Pradesh).

6. LANGUAGE RULES:
Use formal, respectful, and official Hindi (government style) unless English is explicitly requested.

7. NEVER format as an affidavit (शपथ पत्र/Affidavit). DO NOT include stamp paper reference numbers, witnesses, first/second party, or legal swearing/affirmation headers. This is a simple formal application/letter (प्रार्थना पत्र).

8. Output ONLY the drafted application. Do not include any chatty text before or after the application.`;

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
