/**
 * LegalDraftSkill — AI-Powered Legal Document Generator
 *
 * User koi bhi natural language input de (Hindi/English/Hinglish) →
 * AI samjhe → professional legal draft automatically generate kare
 *
 * Examples:
 *   "Main apni sampatti apni patni ke naam karta hoon" → Gift Deed
 *   "Naam change karna hai" → Name Change Affidavit
 *   "Vehicle transfer ke liye NOC" → NOC for Vehicle Transfer
 *   "Property bantwara karna hai" → Partition Deed
 *   "Apna kiraya ka agreement banao" → Rent Agreement
 */

const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');

class LegalDraftSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_draft';
    this.displayName = 'कानूनी ड्राफ्ट';
    this.displayNameEn = 'Legal Document Generator (AI)';
    this.description = 'AI से कोई भी कानूनी दस्तावेज़ बनाना — affidavit, gift deed, NOC, agreement, will आदि';
    this.descriptionEn = 'AI-powered automatic legal document generation';
    this.version = '2.1.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 7;
    this.intents = ['legal_draft', 'affidavit', 'agreement', 'legal_document', 'gift_deed', 'noc', 'partition_deed', 'will'];
    this.keywords = {
      hi: ['कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'एफिडेविट', 'अनुबंध', 'वकील', 'कानून',
           'दान विलेख', 'गिफ्ट डीड', 'बंटवारा', 'पार्टीशन', 'अनापत्ति', 'NOC',
           'किराया', 'वसीयत', 'मुख्तारनामा', 'सम्पत्ति', 'पत्नी', 'नाम परिवर्तन'],
      en: ['legal', 'draft', 'affidavit', 'agreement', 'contract', 'lawyer', 'notary',
           'gift deed', 'partition', 'noc', 'will', 'power of attorney', 'rent agreement',
           'declaration', 'sworn statement'],
      hinglish: ['legal draft banao', 'affidavit banao', 'agreement likho', 'kanuni document',
                 'gift deed banao', 'partition deed', 'wife ke naam', 'patni ke naam',
                 'sampatti transfer', 'naam change', 'noc banao', 'rent agreement']
    };

    this.aiManager = aiProviderManager;
    this.sessions = new Map(); // userId → { docType, collected: {}, stage: 'collecting' | 'ready' }
  }

  async execute(context) {
    const { message, userId } = context;
    if (!message || message.length < 5) {
      return this._reply(this._getHelpMessage(), { mode: 'legal_menu' });
    }

    const userIdSafe = userId || 'anon';
    let session = this.sessions.get(userIdSafe);

    // Detect document type
    const docType = this._detectDocumentType(message);

    // If no active session or new document type, start fresh
    if (!session || session.docType !== docType) {
      session = {
        docType,
        collected: {},
        stage: 'collecting'
      };
      this.sessions.set(userIdSafe, session);
    }

    // For now, if we are in collecting stage, ask for key details (simple version)
    // In next iterations we will make this smarter
    if (session.stage === 'collecting') {
      // Very basic: if message has some details, store and ask for more
      // For demo, we will move to generation quickly
      session.stage = 'ready';
      this.sessions.set(userIdSafe, session);
    }

    // Generate using AI (with collected info if any)
    try {
      const draft = await this._generateWithAI(message, docType);
      if (draft) {
        this.sessions.delete(userIdSafe); // clear after generation
        return this._reply(draft, {
          mode: 'legal_generated',
          docType,
          editable: true,
          originalQuery: message,
        });
      }
    } catch (err) {
      console.error('[LegalDraftSkill] AI generation failed:', err.message);
    }

    // Fallback
    const fallback = this._generateFromTemplate(message, docType);
    this.sessions.delete(userIdSafe);
    return this._reply(fallback, {
      mode: 'legal_generated_template',
      docType,
      editable: true,
      originalQuery: message,
      note: 'Generated from template (AI unavailable)',
    });
  }

  // Detect document type from natural language input
  _detectDocumentType(text) {
    const lower = text.toLowerCase();
    const patterns = [
      { type: 'gift_deed', match: /gift\s*deed|दान\s*विलेख|patni\s*ke\s*naam|पत्नी\s*के\s*नाम|wife.*naam|sampatti.*transfer|husband.*naam|पति\s*के\s*नाम/i },
      { type: 'partition_deed', match: /partition|बंटवारा|पार्टीशन|baantwara|baantna|sampatti\s*baant|sampatti\s*bantwara|property\s*bantwara|property\s*divide|baant\s*do|baant\s*dena|baant\s*karna|sampatti\s*baant\s*do/i },
      { type: 'noc', match: /\bnoc\b|no\s*objection|अनापत्ति|nopatti/i },
      { type: 'rent_agreement', match: /rent|किराया|kiraya|tenant|rental|lease/i },
      { type: 'will', match: /\bwill\b|वसीयत|wasiyat|testament/i },
      { type: 'power_of_attorney', match: /power\s*of\s*attorney|मुख्तारनामा|poa\b/i },
      { type: 'name_change', match: /naam\s*change|नाम\s*परिवर्तन|name\s*change/i },
      { type: 'affidavit', match: /affidavit|शपथ.*पत्र|एफिडेविट|sworn|घोषणा/i },
      { type: 'declaration', match: /declaration|घोषणा|declar/i },
    ];
    for (const p of patterns) {
      if (p.match.test(lower)) return p.type;
    }
    return 'affidavit'; // default fallback
  }

  // ═══════════════════════════════════════════════════════════
  //  AI-POWERED DRAFT GENERATION (with 20-Point Quality Engine)
  // ═══════════════════════════════════════════════════════════
  async _generateWithAI(userInput, docType, retryCount = 0) {
    if (!this.aiManager) return null;

    let targetLang = 'both';
    if (userInput.includes('Language: Hindi only')) {
      targetLang = 'hi';
    } else if (userInput.includes('Language: English only')) {
      targetLang = 'en';
    }

    let langInstruction = '';
    let outputInstruction = '';
    
    if (targetLang === 'hi') {
      langInstruction = '- Use proper Hindi legal/revenue language (especially for property documents). The entire document must be in Hindi only. DO NOT translate to English.';
      outputInstruction = '- Output ONLY the final legal document in Hindi. No English translation, no introductions, no explanations.';
    } else if (targetLang === 'en') {
      langInstruction = '- Use clean English translation and formal English legal drafting vocabulary. The entire document must be in English only. DO NOT write in Hindi.';
      outputInstruction = '- Output ONLY the final legal document in English. No Hindi translation, no introductions, no explanations.';
    } else {
      langInstruction = '- Use proper Hindi legal/revenue language (especially for property documents) + clean English translation.\n- Output MUST be bilingual: Full Hindi version first, followed by its English translation.';
      outputInstruction = '- Output ONLY the final bilingual legal document (Hindi first + English translation). No introductions, no explanations.';
    }

    const docNames = {
      gift_deed: 'Gift Deed (दान विलेख)',
      partition_deed: 'Partition Deed (बंटवारा विलेख)',
      noc: 'No Objection Certificate (अनापत्ति प्रमाण पत्र)',
      rent_agreement: 'Rent Agreement (किराया अनुबंध)',
      will: 'Last Will and Testament (वसीयत)',
      power_of_attorney: 'Power of Attorney (मुख्तारनामा)',
      name_change: 'Name Change Affidavit',
      affidavit: 'Affidavit (शपथ पत्र)',
      declaration: 'Declaration (घोषणा पत्र)',
    };

    const docName = docNames[docType] || 'Legal Affidavit';

    // ========== V3 PROFESSIONAL LEGAL INTELLIGENCE ENGINE ==========
    const qualityEngine = `
PROJECT NAME: Harshita AI Legal Draft Studio
VERSION: V3 Professional Legal Intelligence Engine

MISSION:
AI should not behave like a template filler.
AI should behave like: Senior Advocate, Legal Drafting Expert, Document Reviewer, Legal Clerk, Notary Assistant, Court Filing Assistant.

CORE RULE:
UNDERSTAND FIRST, WRITE LATER
Never generate any legal document before understanding:
1. What user wrote
2. What user wants
3. Which legal document is required
4. Which facts are available
5. Which facts are missing

PRIORITY ORDER:
1 User Intent, 2 Matter Detection, 3 Fact Extraction, 4 Legal Classification, 5 Validation, 6 Missing Information Detection, 7 Draft Generation, 8 Formatting. Selected UI type is NOT highest priority.

=== UNIVERSAL LEGAL INTELLIGENCE ENGINE ===

STEP 1: Read complete user input. Understand what happened, who is involved, relief required, legal document needed.
STEP 2: ENTITY EXTRACTION. Automatically detect Person Name, Father Name, Mother Name, Husband Name, Village, Post, Tehsil, District, State, Pin Code, Phone, Email, Property Details, Document Numbers, Vehicle Numbers, Money Amount, Dates, Agreement Dates, Institution Names, Board Names, University Names, Court Names, Police Station, Relationship, Witnesses.
STEP 3: AUTO CAPITALIZATION ENGINE. Convert proper nouns automatically (e.g. nar narayan singh → Nar Narayan Singh, meer singh → Meer Singh, deepchand → Deepchand, lal chand → Lal Chand, sikhera → Sikhera, bulandshahr → Bulandshahr, uttar pradesh → Uttar Pradesh). Never copy names exactly as typed. Normalize professionally.
STEP 4: LEGAL MATTER CLASSIFICATION. Educational/Identity Documents Lost → Affidavit. Property Gift → Gift Deed. Property Division → Partition Deed. Rental Matter → Rent Agreement. No Objection → NOC. Self Statement → Declaration. Authority Delegation → Power Of Attorney. Inheritance Distribution → Will. Money Recovery/Cheque Bounce/Construction Dispute/Contract Breach/Consumer Complaint/Property Dispute → Legal Notice.
STEP 5: CONFLICT DETECTION. If user selected Gift Deed but matter detected is Lost Documents, Auto switch. Never generate wrong document.
STEP 6: DOCUMENT SPECIFIC SKILLS.
- AFFIDAVIT: Lost Document, Name/DOB/Address Correction, Education/Identity Declaration, Verification Clause, Notary Format.
- LEGAL NOTICE: Cause Of Action, Demand Drafting, Compensation, Interest Claim, Legal Warning.
- GIFT DEED: Donor, Donee, Relationship, Property Description, Transfer Clause, Possession Clause.
- PARTITION DEED: Co Owners, Property Division, Share Allocation, Boundary Description, Partition Terms.
- RENT AGREEMENT: Landlord, Tenant, Rent Amount, Deposit, Duration, Termination/Maintenance Clause.
- DECLARATION: Self/Identity/Education/Income Declaration.
- NOC: No Objection Statement, Permission, Authority Consent.
- POWER OF ATTORNEY: Principal, Attorney Holder, Authority Scope, Duration, Restrictions.
- WILL: Testator, Assets, Beneficiaries, Distribution, Witness Clause.
STEP 7: MISSING INFORMATION ENGINE. Never hallucinate. If required information missing, generate placeholders (do not invent facts).
STEP 8: LEGAL NOTICE ENGINE. Generate Parties, Facts, Cause Of Action, Demand, Time Limit, Legal Consequences.
STEP 9: LIMITATION REVIEW. Extract dates. Check potential limitation issue. Show: "Legal review recommended" if potentially time barred (do not stop draft generation).
STEP 10: PROFESSIONAL LANGUAGE ENGINE. Draft quality must be suitable for Advocate, Notary, Oath Commissioner, Tehsil, SDM, Collector, District Court, Civil Court, Consumer Commission, Government Department.
STEP 11: BILINGUAL ENGINE. Hindi, English, Hindi + English (must match).
STEP 12: PLACEHOLDER ELIMINATION ENGINE. NEVER leave internal prompt variables like [CLIENT NAME], [RESPONDENT NAME], [SPECIFIC ACTION] in the final draft. If info missing, DO NOT hallucinate. Use professional blank lines:
- [नाम / Name: ____________________]
- [पिता का नाम / Father's Name: ____________________]
- [पूरा पता / Full Address: ____________________]
- [आधार संख्या / Aadhaar No.: ____________________]
- [पैन संख्या / PAN No.: ____________________]
- [तारीख / Date: ____________________]
STEP 13: QUALITY CHECK (Internal Chain-of-Thought). Before final output verify.
STEP 14: FAIL SAFE. If confidence below 80%, do not generate. Ask clarification.
FINAL RULE: Harshita AI must think like Lawyer, Legal Drafting Expert, Court Clerk, Notary Assistant. Not a simple template generator.`;

    // ========== MASTER SENIOR ADVOCATE PROMPT ==========
    const baseRules = `
You are a senior advocate with 20+ years of experience in Indian law, specializing in drafting court-admissible and registration-ready legal documents.

${qualityEngine}

=== MASTER RULES ===
- Never copy the user's raw text directly into the draft.
- Draft like a top senior lawyer: formal, precise, authoritative, no repetition, no weak language.
- Always follow classic Indian legal structure: Title → Parties → Recitals (WHEREAS) → Operative Part → Terms & Conditions → Attestation → Witnesses & Signatures.
${langInstruction}
- Make the document Court Ready + Sub-Registrar Registration Ready + Stamp Paper Ready.
- SIGNATURE BLOCK is MANDATORY. Include spaces for:
  "प्रथम पक्ष / First Party: ____________________"
  "द्वितीय पक्ष / Second Party: ____________________"
  "साक्षी / Witness 1: ____________________"
  "साक्षी / Witness 2: ____________________"
- Never produce beginner or generic level output.`;

    let typeSpecificRules = '';

    if (docType === 'gift_deed') {
      typeSpecificRules = `
=== GIFT DEED (दान विलेख) - SENIOR ADVOCATE RULES ===
- Clearly identify Donor (दानकर्ता) and Donee (दानग्रहीता).
- Extract exact relationship (especially if "पुत्री / बेटी / Daughter").
- Detect Property Type: Movable + Immovable (चल एवं अचल सम्पत्ति).
- Extract Share Percentage (50%, आधा हिस्सा, etc.).
- Must include: Natural Love & Affection Clause, Absolute Ownership Clause, No Consideration Clause, Possession Transfer Clause.
- Add Registration & Stamp Duty reminder.
- Use proper revenue language: "स्थायी रूप से हस्तांतरित", "बिना किसी प्रतिफल के" etc.
- Structure must have strong WHEREAS recitals explaining love/affection and ownership.
- Include Donor's Aadhaar/PAN placeholder if not provided.`;
    } else if (docType === 'affidavit') {
      typeSpecificRules = `
=== AFFIDAVIT (शपथ पत्र) - SENIOR ADVOCATE RULES ===
- Identify Deponent with full details: Name, Father's name, Age, Complete Address.
- Include Aadhaar No. placeholder: "आधार संख्या / Aadhaar No.: ____________________"
- Detect Jurisdiction (where the affidavit will be used).
- Create proper numbered facts (1, 2, 3...).
- Strong Oath language + Verification Clause.
- Make it Notary Public and Court Filing ready.
- Include Self-declaration of truthfulness.
- Add "ई-स्टाम्प / E-Stamp Reference No.: ____________________" placeholder.`;
    } else if (docType === 'partition_deed') {
      typeSpecificRules = `
=== PARTITION DEED (बंटवारा विलेख) - SENIOR ADVOCATE RULES ===
- Identify all Co-owners and their exact shares.
- Extract Property details (Khasra, Khata, Plot, Boundaries if mentioned).
- Include Aadhaar of all parties as placeholder if not provided.
- Create clear allocation of shares with mutual agreement language.
- Include Possession Clause and No Claim Clause after partition.
- Use proper family property division language.
- Add property boundary placeholders: "चतुर्सीमा / Boundaries: पूर्व: ____, पश्चिम: ____, उत्तर: ____, दक्षिण: ____"`;
    } else if (docType === 'noc') {
      typeSpecificRules = `
=== NOC (अनापत्ति प्रमाण पत्र) - SENIOR ADVOCATE RULES ===
- Identify Applicant and the Authority receiving the NOC.
- Include Aadhaar No. placeholder for identity proof.
- Clearly state the Purpose for which NOC is being issued.
- Add Liability Disclaimer and that it is issued voluntarily without any pressure.
- Mention Validity and that it can be withdrawn if facts are found false.
- Add "संदर्भ / Reference No.: ____________________" for government office use.`;
    } else if (docType === 'rent_agreement') {
      typeSpecificRules = `
=== RENT AGREEMENT (किराया अनुबंध) - SENIOR ADVOCATE RULES ===
- Clearly identify Landlord and Tenant with full details.
- Include Aadhaar/PAN placeholder for both parties.
- Extract Rent Amount, Security Deposit, Duration, Lock-in Period, Payment Date.
- Include Maintenance, Eviction, Notice Period, Police Verification clauses.
- Add that the agreement is for 11 months (standard).
- Include electric meter number / gas connection placeholders.`;
    } else if (docType === 'will') {
      typeSpecificRules = `
=== WILL (वसीयत) - SENIOR ADVOCATE RULES ===
- Identify Testator (वसीयतकर्ता) and confirm sound mind.
- Include Aadhaar placeholder for Testator.
- List all Beneficiaries with exact shares/relationships.
- Include Revocation of earlier Wills clause.
- Strong Executor appointment and distribution instructions.
- Witness requirement (minimum 2) with Aadhaar placeholders.
- Add "मेडिकल प्रमाणपत्र / Medical Certificate: ____________________" placeholder for sound mind proof.`;
    } else if (docType === 'power_of_attorney') {
      typeSpecificRules = `
=== POWER OF ATTORNEY (मुख्तारनामा) - SENIOR ADVOCATE RULES ===
- Identify Principal and Attorney Holder with full details.
- Include Aadhaar/PAN placeholder for both parties.
- Clearly define Scope of Authority (Property, Banking, Court, General).
- Add Revocation Clause and that it is revocable.
- Mention whether it is General or Special POA.
- Add validity period placeholder.`;
    } else if (docType === 'declaration') {
      typeSpecificRules = `
=== DECLARATION (घोषणा पत्र) - SENIOR ADVOCATE RULES ===
- Identify the Declarant clearly with Aadhaar placeholder.
- State the facts being declared with numbered points.
- Strong truthfulness and penalty clause for false declaration.
- Add "ई-स्टाम्प / E-Stamp Reference No.: ____________________" placeholder.`;
    } else if (docType === 'name_change') {
      typeSpecificRules = `
=== NAME CHANGE AFFIDAVIT - SENIOR ADVOCATE RULES ===
- Old Name and New Name must be clearly stated.
- Include Aadhaar No. and PAN No. placeholders.
- Include Gazette notification reference placeholder.
- Add newspaper publication clause.
- Include list of documents where name change applies (Aadhaar, PAN, Bank, School, etc.).`;
    }

    const systemPrompt = `You are a senior advocate with 20+ years of experience in Indian law.

${baseRules}

${typeSpecificRules}

=== STEP 13: QUALITY CHECK (MANDATORY BEFORE OUTPUT) ===
Before writing the final document, you MUST perform this internal quality check in your thinking:

<quality_check>
✓ Correct document type selected: [yes/no]
✓ Correct legal classification: [yes/no]
✓ Correct fact extraction: [yes/no]
✓ Names normalized (Title Case): [yes/no]
✓ Dates & Amount extracted: [yes/no]
✓ No hallucinated facts: [yes/no]
✓ No leftover [BRACKET] placeholders (only ______ allowed): [yes/no]
✓ Professional formatting: [yes/no]
✓ Legal language quality: [yes/no]
✓ Suitable for advocate review: [yes/no]
✓ Suitable for court filing: [yes/no]
✓ Suitable for notary review: [yes/no]
✓ Signature section present: [yes/no]
✓ Verification clause present: [yes/no]
</quality_check>

If ANY check fails, fix it before generating the final output. If confidence is below 80% (STEP 14), state the clarification needed.

Strict Output Rules:
${outputInstruction}
- Output ONLY the final legal document. Do NOT output the <quality_check> block — keep it internal.
- Maintain the highest professional Indian legal drafting standard.`;

    const userPrompt = `User's Request: "${userInput}"

STEP-BY-STEP TASK (FOLLOW STRICTLY):

1. UNDERSTAND FIRST (STEP 1)
   Analyze what happened, who is involved, and what relief is needed.

2. EXTRACTION (STEP 2 & 7)
   Extract the structured fields. If any info is missing, leave professional blank placeholders: "____________________" (DO NOT HALLUCINATE).

3. AUTO CAPITALIZATION (STEP 3)
   Apply Title Case to all proper nouns.

4. QUALITY CHECK (STEP 12)
   Perform the <quality_check> internally. Fix any failures.

5. DRAFT GENERATION
   Generate a complete, professional ${docName} following all rules of the Legal Intelligence Engine.

Output ONLY the final legal document. No other text.`;

    try {
      const response = await this.aiManager.createChatCompletion('LegalDraftAgent', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 3500,
      });

      let draft = response?.choices?.[0]?.message?.content?.trim();
      
      // Remove any accidentally leaked <quality_check> blocks
      if (draft) {
        draft = draft.replace(/<quality_check>[\s\S]*?<\/quality_check>/gi, '').trim();
      }

      // Self-healing: If draft is too short or missing key elements, retry once
      if (draft && draft.length > 200) {
        const hasSignatureBlock = /हस्ताक्षर|signature|sign/i.test(draft);
        const hasVerification = /सत्यापन|verification|verified/i.test(draft);
        
        if ((!hasSignatureBlock || !hasVerification) && retryCount < 1) {
          console.log('[LegalDraftSkill] Quality check failed — auto-retrying...');
          return this._generateWithAI(userInput, docType, retryCount + 1);
        }
        return draft;
      }

      // If draft too short, retry once
      if (retryCount < 1) {
        console.log('[LegalDraftSkill] Draft too short — auto-retrying...');
        return this._generateWithAI(userInput, docType, retryCount + 1);
      }
    } catch (err) {
      console.error('[LegalDraftSkill] AI call error:', err.message);
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════
  //  TEMPLATE FALLBACK (when AI fails)
  // ═══════════════════════════════════════════════════════════
  _generateFromTemplate(userInput, docType) {
    const today = new Date().toLocaleDateString('en-IN');
    const templates = {
      gift_deed: this._giftDeedTemplate(userInput, today),
      affidavit: this._affidavitTemplate(userInput, today),
      noc: this._nocTemplate(userInput, today),
      rent_agreement: this._rentAgreementTemplate(userInput, today),
      partition_deed: this._partitionTemplate(userInput, today),
    };
    return templates[docType] || templates.affidavit;
  }

  _giftDeedTemplate(input, date) {
    return `दान विलेख / GIFT DEED
═══════════════════════════════════════════════════════

यह दान विलेख आज दिनांक ${date} को निम्नलिखित पक्षकारों के बीच निष्पादित किया जाता है:
This Gift Deed is executed on this ${date} between the following parties:

दानकर्ता / DONOR:
श्री [नाम / Name], पुत्र / पुत्री [पिता का नाम / Father's Name],
निवासी [पूरा पता / Full Address]
(आधार संख्या / Aadhaar No.: [_______________])

दानग्रहीता / DONEE:
श्रीमती [पत्नी का नाम / Wife's Name], पत्नी [पति का नाम],
निवासी [पूरा पता]
(आधार संख्या: [_______________])

विषय / SUBJECT MATTER:
${input}

जबकि / WHEREAS:
1. दानकर्ता उपरोक्त सम्पत्ति का पूर्ण और निरपेक्ष स्वामी है।
   The Donor is the absolute owner of the above property.
2. दानकर्ता अपनी पत्नी (दानग्रहीता) के प्रति प्रेम एवं स्नेह के कारण यह दान करना चाहता है।
   The Donor wishes to gift this property out of natural love and affection for his wife.

अब इसलिए यह विलेख यह साक्ष्य देता है कि / NOW THIS DEED WITNESSES:
1. दानकर्ता उपरोक्त सम्पत्ति का दान दानग्रहीता को बिना किसी प्रतिफल के करता है।
2. दानग्रहीता ने उक्त दान स्वीकार किया है।
3. दानकर्ता का सम्पत्ति में अब कोई हक, टाइटल या हित नहीं रहा।

साक्षी / WITNESSES:
1. _________________________
2. _________________________

दिनांक / Date: ${date}        दानकर्ता हस्ताक्षर: _____________
स्थान / Place: ____________   दानग्रहीता हस्ताक्षर: ____________

═══════════════════════════════════════════════════════
Note: यह draft है — नज़दीकी sub-registrar office में पंजीकरण कराएं।
Please register at sub-registrar office for legal validity.`;
  }

  _affidavitTemplate(input, date) {
    return `शपथ पत्र / AFFIDAVIT
═══════════════════════════════════════════════════════════════════════════════

मैं, [नाम], पुत्र / पुत्री [पिता का नाम], आयु [____] वर्ष, निवासी [पूरा पता],
आधार संख्या [________________], सत्यनिष्ठा से शपथ लेकर निम्नलिखित घोषणा करता/करती हूँ:

I, [Name], S/o [Father's Name], aged [__] years, R/o [Full Address],
Aadhaar No. [________________], do hereby solemnly affirm and declare as under:

विषय / SUBJECT:
${input}

घोषणा / DECLARATION:
1. यह कि उपरोक्त कथन मेरी व्यक्तिगत जानकारी, विश्वास और सत्य के अनुसार पूर्णतः सही है।
2. यह कि मैंने इस शपथ पत्र में कोई भी तथ्य जानबूझकर छुपाया या विकृत नहीं किया है।
3. यह कि यह शपथ पत्र विधिक प्रयोजनों हेतु निष्पादित किया जा रहा है।

सत्यापन / VERIFICATION:
सत्यापित किया जाता है कि उपरोक्त पैरा 1 से 3 तक के कथन मेरी जानकारी और विश्वास के अनुसार सत्य हैं तथा इनमें कुछ भी असत्य नहीं है।

दिनांक / Date: ${date}                              स्थान / Place: ____________

शपथकर्ता / Deponent
नाम: ___________________________
हस्ताक्षर: _______________________

═══════════════════════════════════════════════════════════════════════════════
नोट: इस शपथ पत्र को नोटरी पब्लिक से सत्यापित करवाना अनिवार्य है।`;
  }

  _nocTemplate(input, date) {
    return `अनापत्ति प्रमाण पत्र / NO OBJECTION CERTIFICATE
═══════════════════════════════════════════════════════════════════════════════

दिनांक / Date: ${date}

प्रति / TO,
[प्राप्तकर्ता का नाम और पद / Recipient Name & Designation]
[कार्यालय का पता / Office Address]

विषय / SUBJECT: ${input}

महोदय / SIR,

मैं, [नाम], पुत्र / पुत्री [पिता का नाम], निवासी [पूरा पता],
एतद् द्वारा स्वेच्छा से, बिना किसी दबाव या प्रभाव के, पूर्ण होश और समझ के साथ घोषणा करता/करती हूँ कि उपरोक्त विषय के सम्बन्ध में मुझे कोई आपत्ति नहीं है।

I, [Name], S/o [Father's Name], R/o [Full Address], do hereby voluntarily and without any pressure or undue influence, declare that I have NO OBJECTION in respect of the above subject matter.

यह अनापत्ति मैं अपनी स्वतंत्र इच्छा से, पूर्ण ज्ञान और समझ के साथ दे रहा/रही हूँ।

I am issuing this NOC of my own free will, with full knowledge and understanding.

प्रार्थी / Yours faithfully,

हस्ताक्षर / Signature: ______________________
नाम / Name: ______________________________
दिनांक / Date: ${date}

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _rentAgreementTemplate(input, date) {
    return `किराया अनुबंध / RENT AGREEMENT
═══════════════════════════════════════════════════════

यह किराया अनुबंध दिनांक ${date} को निम्न पक्षों के बीच निष्पादित किया जाता है:

मकान मालिक / LANDLORD: [नाम], पुत्र [पिता का नाम], निवासी [पता]
किरायेदार / TENANT: [नाम], पुत्र [पिता का नाम], निवासी [पता]

विषय / SUBJECT: ${input}

शर्तें / TERMS:
1. किराया / Rent: ₹[राशि] प्रति माह / per month
2. सुरक्षा जमा / Security: ₹[राशि]
3. अवधि / Period: 11 महीने / 11 months from ${date}
4. भुगतान / Payment: हर महीने की [तारीख] तक
5. विद्युत/पानी / Utilities: किरायेदार द्वारा / by Tenant

मकान मालिक हस्ताक्षर: __________   किरायेदार हस्ताक्षर: __________
साक्षी 1: __________                साक्षी 2: __________

═══════════════════════════════════════════════════════`;
  }

  _partitionTemplate(input, date) {
    return `बंटवारा विलेख / PARTITION DEED
═══════════════════════════════════════════════════════

यह बंटवारा विलेख दिनांक ${date} को निम्न पक्षकारों के बीच निष्पादित होता है।

प्रथम पक्ष / FIRST PARTY: [नाम]
द्वितीय पक्ष / SECOND PARTY: [नाम]

विषय / SUBJECT: ${input}

बंटवारे का विवरण निम्न प्रकार है — [details to be filled]
[All parties agree to division as per mutual understanding]

═══════════════════════════════════════════════════════`;
  }

  _getHelpMessage() {
    return `⚖️ *AI-Powered Legal Draft Generator*

मुझसे कोई भी कानूनी दस्तावेज़ बनवाएं — बस अपनी बात बोलें/लिखें:

📌 *Examples (अपनी भाषा में बोलें):*
• "Apni sampatti ka half hissa patni ke naam karna hai" → Gift Deed
• "Naam change karna hai school certificate mein" → Affidavit
• "Bike transfer ke liye NOC chahiye" → NOC
• "Kiraya ka agreement banao 5000 rupaye monthly" → Rent Agreement
• "Vasiyat banani hai" → Will
• "Property bantwara karna hai bhai-bahan mein" → Partition Deed
• "Vakil ke through legal notice bhejo" → Legal Notice

मैं AI से professional draft generate कर दूंगा। आप उसे edit, save, print कर सकते हैं।`;
  }
}

module.exports = { LegalDraftSkill };
