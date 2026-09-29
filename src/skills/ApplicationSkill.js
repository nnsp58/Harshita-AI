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
      hi: ['एप्लीकेशन', 'प्रार्थना पत्र', 'शिकायत पत्र', 'आवेदन पत्र', 'अधिकारी', 'डीएम', 'एसडीएम', 'छुट्टी'],
      en: ['application', 'complaint letter', 'leave application', 'write application', 'official letter'],
      hinglish: ['application likho', 'prarthna patra banao', 'shikayat likho', 'dm ko application']
    };

    this.aiManager = aiProviderManager;
    this.sessions = new Map();
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

  _inferAuthority(text, params = {}) {
    if (params.authorityInfo?.title) return params.authorityInfo.title;
    if (params.authority) return params.authority;

    const lower = (text || '').toLowerCase();
    const isLeave = /leave|छुट्टी|अवकाश|chhutti|chutti/.test(lower);
    if (isLeave && /police|पुलिस/.test(lower)) return 'सक्षम अधिकारी / विभागाध्यक्ष, पुलिस विभाग';
    if (/school|विद्यालय|स्कूल|प्रधानाचार्य/.test(lower)) return 'प्रधानाचार्य';
    if (/college|महाविद्यालय|कॉलेज/.test(lower)) return 'महाविद्यालय के प्राचार्य';
    if (/bank|बैंक|शाखा/.test(lower)) return 'शाखा प्रबंधक';
    if (/bijli|बिजली|electricity|विद्युत/.test(lower)) return 'संबंधित विद्युत विभाग के सक्षम अधिकारी';
    if (/water|पानी|जल\s*(?:कनेक्शन|निगम)/.test(lower)) return 'संबंधित जल विभाग के सक्षम अधिकारी';
    if (/police|पुलिस|थाना|थानाध्यक्ष/.test(lower)) return 'थाना प्रभारी';
    return 'संबंधित विभाग के सक्षम अधिकारी';
  }

  // ─── MAIN EXECUTE — Enterprise Conversation Framework ────────────
  async execute(context) {
    const { message, userId } = context;
    const userIdSafe = userId || 'anon';
    const msg = (message || '').trim();

    console.log(`[${new Date().toISOString()}] [ApplicationSkill] execute() start | userId=${userIdSafe} | msg="${msg.substring(0, 60)}"`);

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

    // Generate on the first turn. Missing identity, rank, address, or exact
    // dates belong in editable blanks; they must never block a useful draft.
    const facts = context.userFacts || {};
    session.data = {
      applicantName: facts.applicantName || facts.name || '',
      authority: this._inferAuthority(msg, context.params),
      subject: msg,
      extraDetails: msg,
    };
    session.step = 'generating';

    // ── GENERATION PHASE: all info collected, generate draft ──────
    if (session.step === 'generating') {
      const collectedData = session.data;

      // PRD-021: Extract classification params for authority/department injection
      const authorityKey = context.params?.authority || null;
      const departmentKey = context.params?.department || null;
      const authorityInfo = context.params?.authorityInfo || (authorityKey && AUTHORITY_MAP[authorityKey]) || null;
      const departmentInfo = context.params?.departmentInfo || (departmentKey && DEPARTMENT_MAP[departmentKey]) || null;

      try {
        console.log(`[${new Date().toISOString()}] [ApplicationSkill] all info collected — starting generation`);

        const enrichedInput = `
Applicant Name: ${collectedData.applicantName || '[आवेदक का नाम]'}
Authority: ${collectedData.authority || 'Concerned Authority'}
Subject/Reason: ${collectedData.subject || message}
Extra Details: ${collectedData.extraDetails || ''}
Original Request: ${message}
        `.trim();

        const processedInput = autoCapitalizeText(enrichedInput);
        let draft = await this._generateApplication(processedInput, authorityInfo, departmentInfo);

        // Do not forward a fragment to the editor. A complete local application
        // is better than an incomplete model response.
        if (draft && (draft.length < 180 || !/(सेवा में|To\s*,)/i.test(draft) || !/(विषय|Subject)/i.test(draft))) {
          console.warn('[ApplicationSkill] Incomplete draft detected — using the complete local template.');
          draft = null;
        }

        // Clear session after successful generation
        this._clearSession(userIdSafe);

        if (draft) {
          draft = autoCapitalizeText(draft);
          draft = eliminatePlaceholders(draft);
          const docTitle = 'प्रार्थना पत्र (Application)';
          return this._reply(draft, {
            mode: 'application_generated',
            openDocumentStudio: true,
            title: docTitle,
            content: draft,
            editable: true,
            originalQuery: message,
            collectedData,
          }, {
            mode: 'open_document_studio',
            title: docTitle,
            content: draft,
            editable: true
          });
        }
      } catch (err) {
        console.error('[ApplicationSkill] AI generation failed:', err.message);
      }

      // Fallback if AI fails
      const fallback = this._generateFallbackTemplate(session.data.subject || message, authorityInfo, departmentInfo, message);
      this._clearSession(userIdSafe);
      const fallbackTitle = 'प्रार्थना पत्र (Application Template)';
      return this._reply(fallback, {
        mode: 'application_generated_template',
        openDocumentStudio: true,
        title: fallbackTitle,
        content: fallback,
        editable: true,
        originalQuery: message,
        note: 'Template (AI unavailable)',
      }, {
        mode: 'open_document_studio',
        title: fallbackTitle,
        content: fallback,
        editable: true
      });
    }

    // Should not reach here — reset session
    this._clearSession(userIdSafe);
    return this._reply('कुछ गड़बड़ हो गई। दोबारा शुरू करें।', { mode: 'error' });
  }


  async _generateApplication(userInput, authorityInfo = null, departmentInfo = null, retryCount = 0) {
    if (!this.aiManager) {
      console.log(`[${new Date().toISOString()}] [ApplicationSkill] no aiManager configured — using local template`);
      return null;
    }

    // P0 FIX: If no LLM providers are configured, skip the network entirely
    // and let execute() fall back to the local template immediately.
    if (!this.aiManager.providers || this.aiManager.providers.size === 0) {
      console.log(`[${new Date().toISOString()}] [ApplicationSkill] no AI providers registered — using local template`);
      return null;
    }

    // P0 FIX: Hard 30s cap so execute() can NEVER hang on a stalled provider.
    const GENERATION_TIMEOUT_MS = 30000;
    const withHardTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('ApplicationSkill generation timed out (30s)')), ms)),
      ]);

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
Always use today's date automatically unless the user specifies otherwise. DO NOT stop the generation process. DO NOT say "Please provide details". Preserve every supplied fact, including leave days, reason, and dates; use blanks only for details the user did not supply.

For leave applications, distinguish an occasion date (such as a wedding date) from the leave period. Mention the occasion date only as the reason. Unless the user explicitly gives the leave start/end dates, write the period as "[आरंभ तिथि] से [समाप्ति तिथि] तक". Never assume leave begins on the wedding/occasion date, even when the user gives a total number of days.

3. AUTHORITY DETECTION ENGINE:
Detect the correct authority automatically:
- Tubewell/Panchayat Matter -> BDO (खंड विकास अधिकारी) / Gram Pradhan
- School/College Matter -> Principal (प्रधानाचार्य)
- University Matter -> Registrar (कुलसचिव)
- Police complaint -> SHO / Station House Officer (थानाध्यक्ष / थाना प्रभारी)
- Leave request by a police employee -> the competent reporting/sanctioning officer in the Police Department; if rank is unknown, use "सक्षम अधिकारी / विभागाध्यक्ष" and leave the applicant's designation blank. Do not address an employee leave request to the SHO by default.
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
      console.log(`[${new Date().toISOString()}] [ApplicationSkill] AI generation started (attempt ${retryCount + 1}, hard timeout ${GENERATION_TIMEOUT_MS}ms)`);

      const response = await withHardTimeout(
        this.aiManager.createChatCompletion('ApplicationSkill', {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
        GENERATION_TIMEOUT_MS
      );

      let draft = response?.choices?.[0]?.message?.content?.trim();

      // If draft is too short, retry once
      if (draft && draft.length < 100 && retryCount < 1) {
        console.log(`[${new Date().toISOString()}] [ApplicationSkill] Draft too short — auto-retrying...`);
        return this._generateApplication(userInput, authorityInfo, departmentInfo, retryCount + 1);
      }

      console.log(`[${new Date().toISOString()}] [ApplicationSkill] AI generation succeeded (${draft ? draft.length : 0} chars)`);
      return draft;
    } catch (err) {
      console.error(`[${new Date().toISOString()}] [ApplicationSkill] AI call error (falling back to local template):`, err.message);
      return null; // execute() will use _generateFallbackTemplate — guaranteed to return
    }
  }

  _generateFallbackTemplate(subject, authorityInfo = null, departmentInfo = null, requestText = '') {
    const today = new Date().toLocaleDateString('hi-IN');
    
    // Clean up request text to remove command verbs and filler words so the template sounds natural
    let request = requestText || subject || '';
    const commandRegex = /(?:likho|likhiye|write|draft|type|banao|generate)?\s*(?:for|ke liye|के लिए|हेतु|पर|बाबत|ko|को)?\s*(?:ek|a|an|एक)?\s*(?:application|letter|prarthna patra|shikayat(?: patra)?|patra|आवेदन(?: पत्र)?|प्रार्थना पत्र|शिकायत(?: पत्र)?|एप्लीकेशन|एप्लिकेशन)\s*(?:of|for|about|on)?\s*(?:likho|likhiye|likh do|type karo|write|draft|banao|taiyar karo|likhe|लिखें|लिखो|बनाएं|बनाओ|लिख दो|तैयार करो|दीजिये|दीजिए|karo)?/gi;
    
    request = request.replace(commandRegex, ' ').trim();
    request = request.replace(/^(mujhe|meri|mere|kripya|please)\s+/gi, '').trim();
    request = request.replace(/(?:ke liye|के लिए|हेतु|पर|बाबत|ko|को|for|about|on|is|iske|isme)$/gi, '').trim();
    request = request.replace(/\s+(kare|karen|karo|plz)$/gi, '').trim();

    if (!request || request.length < 2) {
      request = 'एक आवश्यक कार्य';
    }

    const lower = (requestText || subject || '').toLowerCase();
    const isLeave = /leave|छुट्टी|अवकाश|chhutti|chutti/.test(lower);
    const isPoliceLeave = isLeave && /police|पुलिस/.test(lower);
    const isWedding = /wedding|marriage|shaadi|शादी|विवाह/.test(lower);
    const dayMatch = (requestText || subject || '').match(/([0-9०-९]+)\s*(?:दिन|दिवस|days?)\s*(?:की|का|के)?\s*(?:छुट्टी|अवकाश|leave)?/i);
    const dayCount = dayMatch?.[1] || '[दिनों की संख्या]';
    const weddingDateMatch = request.match(/([0-9०-९]{1,2}\s*(?:जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|नवम्बर|दिसंबर|January|February|March|April|May|June|July|August|September|October|November|December))(?:\s*([0-9]{4}))?/i);
    const weddingDate = weddingDateMatch
      ? `${weddingDateMatch[1]}${weddingDateMatch[2] ? ` ${weddingDateMatch[2]}` : ' [वर्ष]'} `
      : '[विवाह की तिथि]';
    const deptLine = departmentInfo?.name || (/police|पुलिस/.test(lower) ? 'पुलिस विभाग' : '[कार्यालय / विभाग का नाम]');
    const officerLine = isPoliceLeave
      ? 'सक्षम अधिकारी / विभागाध्यक्ष'
      : (authorityInfo?.title ? `श्रीमान ${authorityInfo.title}` : '[संबंधित विभाग के सक्षम अधिकारी]');
    const genericSubject = /water|पानी|जल\s*(?:कनेक्शन|निगम)/i.test(lower)
      ? 'जल कनेक्शन प्रदान करने हेतु प्रार्थना पत्र'
      : /(?:lost|gum|खो|गुम).*(?:mobile|phone|मोबाइल|फोन)|(?:mobile|phone|मोबाइल|फोन).*(?:lost|gum|खो|गुम)/i.test(lower)
        ? 'मोबाइल फोन गुम होने की सूचना दर्ज करने हेतु प्रार्थना पत्र'
        : /aadhaar|aadhar|आधार/i.test(lower)
          ? 'आधार कार्ड गुम होने के संबंध में प्रार्थना पत्र'
          : /bank|बैंक/i.test(lower) && /mobile|मोबाइल|फोन/i.test(lower)
            ? 'पंजीकृत मोबाइल नंबर बदलने हेतु प्रार्थना पत्र'
            : 'अनुरोध के संबंध में प्रार्थना पत्र';
    const subjectLine = isLeave
      ? `${dayCount} दिनों के अवकाश की स्वीकृति हेतु प्रार्थना पत्र`
      : genericSubject;
    const body = isLeave
      ? (isWedding
        ? `मैं [आवेदक का नाम], [पदनाम] के रूप में ${deptLine} में कार्यरत हूँ। मेरी पुत्री का विवाह ${weddingDate} को निर्धारित है। इस पारिवारिक दायित्व के निर्वहन हेतु मुझे ${dayCount} दिनों का अवकाश चाहिए। अवकाश की प्रस्तावित अवधि [आरंभ तिथि] से [समाप्ति तिथि] तक है।`
        : `मैं [आवेदक का नाम], [पदनाम] के रूप में ${deptLine} में कार्यरत हूँ। [अवकाश का कारण] के कारण मुझे ${dayCount} दिनों का अवकाश चाहिए। अवकाश की प्रस्तावित अवधि [आरंभ तिथि] से [समाप्ति तिथि] तक है।`)
      : `मैं [आवेदक का नाम], निवासी [पूरा पता], यह आवेदन ${request} के संबंध में प्रस्तुत कर रहा/रही हूँ। आवश्यक विवरण: [विवरण / संदर्भ संख्या / तिथि]।`;

    return `सेवा में,

${officerLine}
${deptLine}
[कार्यालय / शहर / जिला]

विषय: ${subjectLine}।

महोदय / महोदया,

सविनय निवेदन है कि ${body}

अतः आपसे विनम्र निवेदन है कि उपर्युक्त तथ्यों पर विचार करते हुए ${isLeave ? 'निर्धारित अवधि का अवकाश स्वीकृत' : 'आवश्यक कार्यवाही'} करने की कृपा करें।

सधन्यवाद।

दिनांक: ${today}
स्थान: [स्थान]

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: [आवेदक का नाम]
पदनाम: [पदनाम]
पता: [पूरा पता]
मोबाइल नंबर: [मोबाइल नंबर]`;
  }
}

module.exports = { ApplicationSkill };
