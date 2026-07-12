/**
 * ApplicationSkill — AI-Powered Formal Application Generator
 *
 * User provides a subject, and AI generates a formal application (prarthna patra)
 * addressed to the appropriate officer (e.g., DM, SDM, Tehsildar, Principal, etc.)
 */

const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { autoCapitalizeText, eliminatePlaceholders } = require('../utils/capitalization');
const { documentIntelligence, AUTHORITY_MAP, DEPARTMENT_MAP } = require('./DocumentIntelligenceEngine');

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

  // ─── REQUIRED FIELDS for a proper application ──────────────────
  // These must be collected before we can generate a good draft.
  _getRequiredFields() {
    return [
      { key: 'applicantName', question: 'आपका नाम क्या है? (Aapka naam kya hai?)', hint: 'e.g. Ramesh Kumar' },
      { key: 'authority', question: 'यह application किसको लिखनी है? जैसे Principal, DM, SDM, BDO, HR आदि।', hint: 'e.g. Principal' },
      { key: 'subject', question: 'Application का विषय / कारण क्या है? जैसे छुट्टी, शिकायत, प्रमाण पत्र आदि।', hint: 'e.g. 5 din ki chhutti' },
    ];
  }

  // ─── SESSION HELPERS ─────────────────────────────────────────────
  _getSession(userId) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, { step: 'collecting', data: {}, questionIndex: 0 });
    }
    return this.sessions.get(userId);
  }

  _clearSession(userId) {
    this.sessions.delete(userId);
  }

  // ─── MAIN EXECUTE — Enterprise Conversation Framework ────────────
  async execute(context) {
    const { message, userId } = context;
    const userIdSafe = userId || 'anon';
    const msg = (message || '').trim();

    if (!msg) {
      return this._reply(this._getHelpMessage(), { mode: 'application_prompt' });
    }

    const session = this._getSession(userIdSafe);

    // ── User wants to reset / cancel ──────────────────────────────
    const resetWords = ['cancel', 'reset', 'dobara', 'रद्द', 'छोड़ो', 'start again'];
    if (resetWords.some(w => msg.toLowerCase().includes(w))) {
      this._clearSession(userIdSafe);
      return this._reply('ठीक है, फिर से शुरू करते हैं। आप किस विषय पर Application लिखवाना चाहते हैं?', { mode: 'reset' });
    }

    const required = this._getRequiredFields();

    // ── COLLECTING PHASE: gather required info one-by-one ─────────
    if (session.step === 'collecting') {
      // If this is first message (no data collected yet), extract what we can
      if (session.questionIndex === 0 && Object.keys(session.data).length === 0) {
        // Try to extract authority from the first message
        const msg_lower = msg.toLowerCase();
        if (msg_lower.includes('principal') || msg_lower.includes('प्रधानाचार्य')) session.data.authority = 'Principal (प्रधानाचार्य)';
        else if (msg_lower.includes('dm ') || msg_lower.includes('जिलाधिकारी')) session.data.authority = 'DM (जिलाधिकारी)';
        else if (msg_lower.includes('sdm') || msg_lower.includes('उपजिलाधिकारी')) session.data.authority = 'SDM (उपजिलाधिकारी)';
        else if (msg_lower.includes('bdo') || msg_lower.includes('खंड विकास')) session.data.authority = 'BDO (खंड विकास अधिकारी)';

        if (msg_lower.includes('छुट्टी') || msg_lower.includes('leave')) session.data.subject = msg_lower.includes('medical') ? 'Medical Leave (बीमारी के कारण छुट्टी)' : 'Leave Application (अवकाश हेतु आवेदन)';
        else if (msg_lower.includes('complaint') || msg_lower.includes('शिकायत')) session.data.subject = 'शिकायत पत्र';
        else if (msg_lower.includes('certificate') || msg_lower.includes('प्रमाण पत्र')) session.data.subject = 'प्रमाण पत्र हेतु आवेदन';
      } else {
        // Save the answer to the current question
        const currentField = required.find(f => !session.data[f.key]);
        if (currentField) {
          session.data[currentField.key] = msg;
        }
      }

      // Find the next missing required field
      const nextMissing = required.find(f => !session.data[f.key]);
      if (nextMissing) {
        // Ask next question
        const filledCount = Object.keys(session.data).length;
        const totalRequired = required.length;
        const progress = `(${filledCount}/${totalRequired} जानकारी मिली)`;
        session.questionIndex = filledCount;
        return this._reply(
          `${nextMissing.question} ${progress}\n\n💡 उदाहरण: ${nextMissing.hint}`,
          { mode: 'collecting', conversationState: 'collecting', type: 'question', field: nextMissing.key }
        );
      }

      // All required fields collected — move to generation
      session.step = 'generating';
    }

    // ── GENERATION PHASE: all info collected, generate draft ──────
    if (session.step === 'generating') {
      const collectedData = session.data;

      // PRD-021: Extract classification params for authority/department injection
      const authorityKey = context.params?.authority || null;
      const departmentKey = context.params?.department || null;
      const authorityInfo = context.params?.authorityInfo || (authorityKey && AUTHORITY_MAP[authorityKey]) || null;
      const departmentInfo = context.params?.departmentInfo || (departmentKey && DEPARTMENT_MAP[departmentKey]) || null;

      try {
        this._reply('सभी जानकारी मिल गई! ✅ Application तैयार हो रही है... (10-15 सेकंड)', null, 'processing');

        const enrichedInput = `
Applicant Name: ${collectedData.applicantName || '[आवेदक का नाम]'}
Authority: ${collectedData.authority || 'Concerned Authority'}
Subject/Reason: ${collectedData.subject || message}
Extra Details: ${collectedData.extraDetails || ''}
Original Request: ${message}
        `.trim();

        const processedInput = autoCapitalizeText(enrichedInput);
        let draft = await this._generateApplication(processedInput, authorityInfo, departmentInfo);

        // Clear session after successful generation
        this._clearSession(userIdSafe);

        if (draft) {
          draft = autoCapitalizeText(draft);
          draft = eliminatePlaceholders(draft);
          return this._reply(draft, {
            mode: 'application_generated',
            editable: true,
            originalQuery: message,
            collectedData,
          });
        }
      } catch (err) {
        console.error('[ApplicationSkill] AI generation failed:', err.message);
      }

      // Fallback if AI fails
      const fallback = this._generateFallbackTemplate(session.data.subject || message, authorityInfo, departmentInfo);
      this._clearSession(userIdSafe);
      return this._reply(fallback, {
        mode: 'application_generated_template',
        editable: true,
        originalQuery: message,
        note: 'Template (AI unavailable)',
      });
    }

    // Should not reach here — reset session
    this._clearSession(userIdSafe);
    return this._reply('कुछ गड़बड़ हो गई। दोबारा शुरू करें।', { mode: 'error' });
  }


  async _generateApplication(userInput, authorityInfo = null, departmentInfo = null, retryCount = 0) {
    if (!this.aiManager) return null;

    // PRD-021: Build authority-specific instruction if available
    let authorityInstruction = '';
    if (authorityInfo) {
      authorityInstruction = `\n\n=== AUTHORITY DETECTION (PRD-021 AUTO-DETECTED) ===\nThe application MUST be addressed to: ${authorityInfo.title} (${authorityInfo.titleEn})\nUse this exact designation in the "सेवा में" section. Do NOT guess or use a generic officer.`;
    }
    if (departmentInfo) {
      authorityInstruction += `\nDepartment: ${departmentInfo.name} (${departmentInfo.nameEn})`;
    }

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
${authorityInstruction}

6. Output ONLY the drafted application. NEVER use markdown formatting (like **, ##, or bullet points) inside the document. The output must be pure plain text formatted with proper line breaks and spaces, identical to a printed government letter. Do not include any conversational chatty text before or after the application.`;

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

  _generateFallbackTemplate(subject, authorityInfo = null, departmentInfo = null) {
    const today = new Date().toLocaleDateString('hi-IN');
    const officerLine = authorityInfo ? `श्रीमान ${authorityInfo.title}` : '[अधिकारी का पदनाम / Designation]';
    const deptLine = departmentInfo ? departmentInfo.name : '[कार्यालय/विभाग का नाम / Department Name]';
    return `सेवा में,

${officerLine}
${deptLine}
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
