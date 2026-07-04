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
const { autoCapitalizeText, eliminatePlaceholders } = require('../utils/capitalization');
const { documentIntelligence, DOCUMENT_CATEGORIES } = require('./DocumentIntelligenceEngine');
const legalVerificationEngine = require('./LegalVerificationEngine');

class LegalDraftSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_draft';
    this.displayName = 'कानूनी ड्राफ्ट';
    this.displayNameEn = 'Legal Document Generator (AI)';
    this.description = 'AI से कोई भी कानूनी दस्तावेज़ बनाना — affidavit, gift deed, NOC, agreement, will आदि';
    this.descriptionEn = 'AI-powered automatic legal document generation';
    this.version = '3.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 7;
    this.intents = [
      'legal_draft', 'affidavit', 'agreement', 'legal_document', 'gift_deed', 'noc',
      'partition_deed', 'will', 'police_complaint', 'rti', 'consumer_complaint',
      'electricity_complaint', 'revenue_application', 'pension_application', 'court_draft',
      'prayer_letter', 'application', 'draft', 'representation', 'complaint', 'notice', 'undertaking'
    ];
    this.keywords = {
      hi: ['कानूनी', 'ड्राफ्ट', 'शपथपत्र', 'एफिडेविट', 'अनुबंध', 'वकील', 'कानून',
           'दान विलेख', 'गिफ्ट डीड', 'बंटवारा', 'पार्टीशन', 'अनापत्ति', 'NOC',
           'किराया', 'वसीयत', 'मुख्तारनामा', 'सम्पत्ति', 'पत्नी', 'नाम परिवर्तन',
           'पुलिस', 'शिकायत', 'एफआईआर', 'थाना', 'सूचना का अधिकार', 'आरटीआई',
           'उपभोक्ता', 'बिजली', 'विद्युत', 'राजस्व', 'पेंशन', 'न्यायालय',
           'प्रार्थना पत्र', 'आवेदन पत्र', 'मसौदा', 'अभ्यावेदन', 'नोटिस', 'वचनबद्धता'],
      en: ['legal', 'draft', 'affidavit', 'agreement', 'contract', 'lawyer', 'notary',
           'gift deed', 'partition', 'noc', 'will', 'power of attorney', 'rent agreement',
           'declaration', 'sworn statement', 'police complaint', 'fir', 'rti',
           'consumer complaint', 'electricity', 'revenue', 'pension', 'court',
           'prayer letter', 'application', 'representation', 'notice', 'undertaking'],
      hinglish: ['legal draft banao', 'affidavit banao', 'agreement likho', 'kanuni document',
                  'gift deed banao', 'partition deed', 'wife ke naam', 'patni ke naam',
                  'sampatti transfer', 'naam change', 'noc banao', 'rent agreement',
                  'police complaint likho', 'fir darj karo', 'rti lagao',
                  'bijli ki shikayat', 'pension ke liye', 'thana mein report']
    };

    this.aiManager = aiProviderManager;
    this.sessions = new Map(); // userId → { docType, collected: {}, stage: 'collecting' | 'ready' }
  }

  async execute(context) {
    const { message, userId } = context;
    if (!message) {
      return this._reply(this._getHelpMessage(), { mode: 'legal_menu' });
    }

    const userIdSafe = userId || 'anon';

    // ── PRD-021: Use DocumentIntelligenceEngine classification if available ──
    const classification = context.params?.classification || null;
    const docCategoryFromParams = context.params?.docCategory || context.params?.docType || null;

    // ── SMART APPLICANT MODIFIER DETECTION ──
    // Detect if the draft should be written on behalf of someone else
    const lowerMsg = message.toLowerCase();
    let applicantModifier = null;
    if (/पत्नी\s*की\s*तरफ\s*से|wife\s*ki\s*taraf\s*se|patni\s*ki\s*taraf/i.test(lowerMsg)) {
      applicantModifier = 'wife'; // Draft as wife/spouse
    } else if (/पिता\s*की\s*तरफ\s*से|father\s*ki\s*taraf|pita\s*ki\s*taraf/i.test(lowerMsg)) {
      applicantModifier = 'father';
    } else if (/माता\s*की\s*तरफ\s*से|mother\s*ki\s*taraf|mata\s*ki\s*taraf/i.test(lowerMsg)) {
      applicantModifier = 'mother';
    } else if (/वकील\s*की\s*तरफ\s*से|advocate.*taraf|through\s*advocate|through\s*lawyer/i.test(lowerMsg)) {
      applicantModifier = 'advocate';
    } else if (/भाई\s*की\s*तरफ\s*से|brother\s*ki\s*taraf|bhai\s*ki\s*taraf/i.test(lowerMsg)) {
      applicantModifier = 'brother';
    } else if (/बहन\s*की\s*तरफ\s*से|sister\s*ki\s*taraf|behen\s*ki\s*taraf/i.test(lowerMsg)) {
      applicantModifier = 'sister';
    }
    let session = this.sessions.get(userIdSafe);

    // Detect selected/incoming category
    let selectedCategory = context.params?.docType || null;
    const lowerMessage = message.toLowerCase();
    
    if (!selectedCategory) {
      if (/gift\s*deed|दान\s*विलेख/i.test(lowerMessage)) selectedCategory = 'gift_deed';
      else if (/noc|अनापत्ति/i.test(lowerMessage)) selectedCategory = 'noc';
      else if (/rent|किराया/i.test(lowerMessage)) selectedCategory = 'rent_agreement';
      else if (/partition|बंटवारा/i.test(lowerMessage)) selectedCategory = 'partition_deed';
      else if (/will|वसीयत/i.test(lowerMessage)) selectedCategory = 'will';
      else if (/power\s*of\s*attorney|मुख्तारनामा/i.test(lowerMessage)) selectedCategory = 'power_of_attorney';
      else if (/name\s*change|नाम\s*परिवर्तन/i.test(lowerMessage)) selectedCategory = 'name_change';
      else if (/declaration/i.test(lowerMessage)) selectedCategory = 'declaration';
      else if (/defamation/i.test(lowerMessage)) selectedCategory = 'defamation';
      // ── NEW document types ──
      else if (/police|पुलिस|fir|एफआईआर|थाना|thana/i.test(lowerMessage)) selectedCategory = 'police_complaint';
      else if (/rti|सूचना\s*का\s*अधिकार|आरटीआई|right\s*to\s*information/i.test(lowerMessage)) selectedCategory = 'rti';
      else if (/consumer|उपभोक्ता|ग्राहक/i.test(lowerMessage)) selectedCategory = 'consumer_complaint';
      else if (/electricity|बिजली|विद्युत|bijli/i.test(lowerMessage)) selectedCategory = 'electricity_complaint';
      else if (/revenue|राजस्व|लेखपाल|तहसील/i.test(lowerMessage)) selectedCategory = 'revenue_application';
      else if (/pension|पेंशन|वृद्धावस्था|विधवा|divyang/i.test(lowerMessage)) selectedCategory = 'pension_application';
      else if (/court|न्यायालय|अदालत|कोर्ट/i.test(lowerMessage)) selectedCategory = 'court_draft';
      else selectedCategory = 'affidavit';
    }

    // Run Legal Matter Detection Engine first
    let detectedMatter = null;
    let recommendedCategory = null;
    let confidenceScore = 0.95;

    if (/marksheet\s*gum|10th.*12th.*marksheet|gum\s*ho\s*gayi/i.test(lowerMessage)) {
      detectedMatter = 'Lost Documents';
      recommendedCategory = 'affidavit';
    } else if (/contractor.*kaam\s*chhod|contractor.*paise\s*lekar|contrator/i.test(lowerMessage)) {
      detectedMatter = 'Contract Breach / Money Recovery';
      recommendedCategory = 'contract_breach_notice / money_recovery_notice';
    } else if (/kirayedar.*khali/i.test(lowerMessage)) {
      detectedMatter = 'Eviction Matter';
      recommendedCategory = 'eviction_notice';
    } else if (/jhoothe\s*aarop|false\s*allegations/i.test(lowerMessage)) {
      detectedMatter = 'Defamation Matter';
      recommendedCategory = 'defamation_notice';
    } else if (/bijli\s*ki\s*line|electricity/i.test(lowerMessage)) {
      detectedMatter = 'Electricity Complaint';
      recommendedCategory = 'application_writer';
    }

    // Wrong Category Rejection logic
    if (selectedCategory && detectedMatter) {
      let isMismatch = false;
      if (selectedCategory === 'defamation' && (detectedMatter.includes('Money Recovery') || detectedMatter.includes('Contract'))) {
        isMismatch = true;
      }
      if (selectedCategory === 'gift_deed' && detectedMatter === 'Lost Documents') {
        isMismatch = true;
      }

      if (isMismatch) {
        const rejectionMsg = `REJECTED: Mismatch detected.
Detected Matter: ${detectedMatter}
Selected Category: ${selectedCategory === 'gift_deed' ? 'Gift Deed' : selectedCategory === 'defamation' ? 'Defamation' : selectedCategory}
Confidence Score: ${(confidenceScore * 100).toFixed(0)}%
Recommended Category: ${recommendedCategory === 'affidavit' ? 'Affidavit' : recommendedCategory}`;
        
        return this._reply(rejectionMsg, {
          mode: 'category_rejected',
          detectedMatter,
          selectedCategory,
          confidenceScore,
          recommendedCategory
        });
      }
    }

    // PRD-021: Use classification from DocumentIntelligenceEngine if available
    let docType;
    if (docCategoryFromParams) {
      // Map PRD-021 category to internal docType
      docType = this._mapCategoryToDocType(docCategoryFromParams, message);
      console.log(`[LegalDraftSkill] PRD-021: Using classified docType: ${docType} (from category: ${docCategoryFromParams})`);
    } else {
      // Detect document type from natural language input
      docType = this._detectDocumentType(message);
    }

    // If no active session or new document type, start fresh
    if (!session || session.docType !== docType) {
      session = {
        docType,
        collected: {},
        stage: 'verifying_facts',
        facts: {}
      };
      this.sessions.set(userIdSafe, session);
    }

    // PRD-021: Legal Verification Engine Loop
    if (session.stage === 'verifying_facts') {
      const evaluation = await legalVerificationEngine.evaluateFacts(message, session.facts);
      
      // Update facts in session
      session.facts = { ...session.facts, ...evaluation.facts };
      
      if (!evaluation.complete) {
        // Facts are missing or contradictory. Ask user for clarification.
        this.sessions.set(userIdSafe, session);
        const questionMsg = await legalVerificationEngine.generateQuestions(evaluation);
        return this._reply(questionMsg, {
          mode: 'legal_verification',
          docType,
          missing: evaluation.missing,
        });
      } else {
        // Facts are complete. Move to generation.
        session.stage = 'ready';
        this.sessions.set(userIdSafe, session);
      }
    }

    // Apply auto-capitalization on input message
    const processedMessage = autoCapitalizeText(message);

    // Generate Risk Assessment
    let riskMsg = "";
    if (session.facts && Object.keys(session.facts).length > 0) {
       riskMsg = await legalVerificationEngine.generateRiskAssessment(session.facts);
    }

    // Generate using AI
    try {
      // Inject verified facts into the prompt generation
      const enrichedMessage = `Verified Facts:\n${JSON.stringify(session.facts || {})}\n\nUser Request: ${processedMessage}`;
      let draft = await this._generateWithAI(enrichedMessage, docType, 0, applicantModifier);
      if (draft) {
        draft = autoCapitalizeText(draft);
        draft = eliminatePlaceholders(draft);
        this.sessions.delete(userIdSafe); // clear after generation
        
        // Prepend risk message to draft
        const finalResponse = riskMsg ? `⚠️ **कानूनी विश्लेषण (Legal Risk Assessment):**\n${riskMsg}\n\n---\n\n${draft}` : draft;
        
        return this._reply(finalResponse, {
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
    let fallback = this._generateFromTemplate(processedMessage, docType);
    fallback = autoCapitalizeText(fallback);
    fallback = eliminatePlaceholders(fallback);
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
      { type: 'prayer_letter', match: /prayer\s*letter|प्रार्थना\s*पत्र|prarthna|prathna/i },
      { type: 'application', match: /application|आवेदन/i },
      { type: 'representation', match: /representation|अभ्यावेदन/i },
      { type: 'complaint', match: /complaint\s*letter|शिकायत\s*पत्र|shikayat/i },
      { type: 'notice', match: /notice|नोटिस/i },
      { type: 'undertaking', match: /undertaking|वचनबद्धता/i },
      { type: 'draft', match: /draft|मसौदा/i },
      { type: 'gift_deed', match: /gift\s*deed|दान\s*विलेख|patni\s*ke\s*naam|पत्नी\s*के\s*नाम|wife.*naam|sampatti.*transfer|husband.*naam|पति\s*के\s*नाम/i },
      { type: 'partition_deed', match: /partition|बंटवारा|पार्टीशन|baantwara|baantna|sampatti\s*baant|sampatti\s*bantwara|property\s*bantwara|property\s*divide|baant\s*do|baant\s*dena|baant\s*karna|sampatti\s*baant\s*do/i },
      { type: 'noc', match: /\bnoc\b|no\s*objection|अनापत्ति|nopatti/i },
      { type: 'rent_agreement', match: /rent|किराया|kiraya|tenant|rental|lease|agreement|अनुबंध/i },
      { type: 'will', match: /\bwill\b|वसीयत|wasiyat|testament/i },
      { type: 'power_of_attorney', match: /power\s*of\s*attorney|मुख्तारनामा|poa\b/i },
      { type: 'name_change', match: /naam\s*change|नाम\s*परिवर्तन|name\s*change/i },
      { type: 'police_complaint', match: /police|पुलिस|fir|एफआईआर|थाना|thana/i },
      { type: 'rti', match: /rti|सूचना\s*का\s*अधिकार|आरटीआई|right\s*to\s*information/i },
      { type: 'consumer_complaint', match: /consumer|उपभोक्ता|ग्राहक/i },
      { type: 'electricity_complaint', match: /electricity|बिजली|विद्युत|bijli/i },
      { type: 'revenue_application', match: /revenue|राजस्व|लेखपाल|तहसील/i },
      { type: 'pension_application', match: /pension|पेंशन|वृद्धावस्था|विधवा|divyang/i },
      { type: 'court_draft', match: /court|न्यायालय|अदालत|कोर्ट/i },
      { type: 'affidavit', match: /affidavit|शपथ.*पत्र|एफिडेविट|sworn|घोषणा/i },
      { type: 'declaration', match: /declaration|घोषणा|declar/i },
    ];
    for (const p of patterns) {
      if (p.match.test(lower)) return p.type;
    }
    return 'draft'; // default fallback for PRD-021
  }

  // ═══════════════════════════════════════════════════════════
  //  AI-POWERED DRAFT GENERATION (with 20-Point Quality Engine)
  // ═══════════════════════════════════════════════════════════
  async _generateWithAI(userInput, docType, retryCount = 0, applicantModifier = null) {
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
      police_complaint: 'Police Complaint (पुलिस शिकायत / FIR Application)',
      rti: 'RTI Application (सूचना का अधिकार आवेदन)',
      consumer_complaint: 'Consumer Complaint (उपभोक्ता शिकायत)',
      electricity_complaint: 'Electricity Complaint (विद्युत विभाग शिकायत)',
      revenue_application: 'Revenue Application (राजस्व विभाग आवेदन)',
      pension_application: 'Pension Application (पेंशन आवेदन)',
      court_draft: 'Court Draft (न्यायालय मसौदा)',
      prayer_letter: 'Prayer Letter (प्रार्थना पत्र)',
      application: 'Application (आवेदन पत्र)',
      draft: 'Draft (मसौदा)',
      representation: 'Representation (अभ्यावेदन)',
      complaint: 'Complaint Letter (शिकायत पत्र)',
      notice: 'Legal Notice (विधिक नोटिस)',
      undertaking: 'Undertaking (वचनबद्धता)'
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
STEP 7: MISSING INFORMATION ENGINE (CRITICAL RULE). NEVER ask the user to provide missing information or more details. If required information (like applicant name, address, amounts, exact dates) is missing, AUTOMATICALLY insert professional placeholders (e.g., "[____________________]"). Always use today's date automatically unless the user specifies otherwise. DO NOT stop the generation process.
STEP 8: LEGAL NOTICE ENGINE. Generate Parties, Facts, Cause Of Action, Demand, Time Limit, Legal Consequences.
STEP 9: LIMITATION REVIEW. Extract dates. Check potential limitation issue. Show: "Legal review recommended" if potentially time barred (do not stop draft generation).
STEP 10: PROFESSIONAL LANGUAGE ENGINE. Draft quality must be suitable for Advocate, Notary, Oath Commissioner, Tehsil, SDM, Collector, District Court, Civil Court, Consumer Commission, Government Department.
STEP 11: BILINGUAL ENGINE. Hindi, English, Hindi + English (must match).
STEP 12: PLACEHOLDER ELIMINATION ENGINE. NEVER leave internal prompt variables like [CLIENT NAME] or [RESPONDENT NAME]. Use professional blank lines:
- [नाम / Name: ____________________]
- [पिता का नाम / Father's Name: ____________________]
- [पूरा पता / Full Address: ____________________]
- [आधार संख्या / Aadhaar No.: ____________________]
- [पैन संख्या / PAN No.: ____________________]
- [तारीख / Date: ____________________]
STEP 13: QUALITY CHECK (Internal Chain-of-Thought). Before final output verify.
STEP 14: LEGAL REASONING ENGINE. Before generating any document:
1. Extract facts.
2. Determine actual legal matter.
3. Calculate confidence score for the selected Document Type.
4. Compare with selected document type.
5. If mismatch > 20% (Confidence < 80%):
   - DO NOT GENERATE the document.
   - Output ONLY a warning starting exactly with "REJECTED:"
   - Suggest the correct document.
   Never force facts into the selected template. Never rewrite money dispute as defamation. Never rewrite contractor dispute as tenancy dispute.
FINAL RULE: Harshita AI must think like Lawyer, Legal Drafting Expert, Court Clerk, Notary Assistant. Use the provided Verified Facts as the absolute truth. Do not invent missing financial contradictions.`;

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

    if (docType === 'notice') {
      typeSpecificRules = `
=== LEGAL NOTICE (विधिक नोटिस) - STRICT COMPLIANCE RULES ===
1. SUBJECT LINE IS MANDATORY: Must clearly state the purpose (e.g. "विषय: मकान निर्माण हेतु दी गई राशि ₹42,000 की वापसी के संबंध में विधिक नोटिस।").
2. SENDER ROLE: Clearly indicate at the top if it is "Through Advocate" (अधिवक्ता के माध्यम से) or "Self-issued Legal Notice" (स्वयं प्रेषित विधिक नोटिस).
3. TIMELINE: Explicitly list the dates (e.g., when money was given, work started, work abandoned, payment demanded).
4. LEGAL GROUND: State the exact violation (e.g., Breach of Contract, Misappropriation, Fraud).
5. CLEAR DEMAND: Must include a specific time limit and exact amount (e.g., "आप इस नोटिस की प्राप्ति से 15 दिनों के भीतर ₹42,000 का भुगतान करें").
6. PAYMENT MODE: Specify how to pay (Cash/Bank Transfer/UPI).
7. LEGAL CONSEQUENCES: Specify exactly what action will be taken if unpaid (e.g., Civil Suit, Recovery Suit, Costs of Litigation).
8. EVIDENCE: Mention the evidence relied upon (Agreement, WhatsApp, Witnesses).
9. SIGNATURE BLOCK: ONLY Name, Address, Mobile, Signature. NEVER ask for Aadhar or PAN in a Legal Notice signature block.
10. LANGUAGE: Strict adherence to either Hindi or English (NO mixing) unless Bilingual is specifically requested.`;
    } else if (docType === 'gift_deed') {
      typeSpecificRules = `
=== GIFT DEED (दान विलेख) - SENIOR ADVOCATE RULES ===
- Clearly identify Donor (दानकर्ता) and Donee(s) (दानग्रहीता/दानग्रहीतागण).
- If multiple Donees are mentioned (e.g. wife and daughter together, like Geeta and Harshita), include BOTH in the Donee section (e.g., Donee 1: wife Geeta, Donee 2: daughter Harshita) with their respective names.
- Extract details from Roman/Hinglish text. If names/places are given in English/Roman script (e.g., "nar narayan singh", "meer singh", "geeta", "harshita", "sikhera"), convert/transliterate them correctly to Devanagari Hindi for the Hindi part (e.g. नर नारायण सिंह, मीर सिंह, गीता, हर्षिता, सीखेरा) and proper capitalized Title Case in the English part (e.g. Nar Narayan Singh, Meer Singh, Geeta, Harshita, Sikhera).
- DO NOT leave placeholders like [Name], [नाम], or [Address] for details that are provided in the prompt. Extract and print them exactly.
- Detect Property Type: Movable + Immovable (चल एवं अचल सम्पत्ति).
- Extract Share details: if the user gifts "apni sari sampatti" (all property), it means 100% of the donor's properties. If multiple donees, they hold it in equal shares (50% each or as specified).
- Must include: Natural Love & Affection Clause, Absolute Ownership Clause, No Consideration Clause, Possession Transfer Clause.
- Add Registration & Stamp Duty reminder.
- Use proper revenue language: "स्थायी रूप से हस्तांतरित", "बिना किसी प्रतिफल के" etc.
- Structure must have strong WHEREAS recitals explaining love/affection and ownership.
- Include Donor's and Donees' Aadhaar/PAN placeholder if not provided in the input, but fill the names and relationships completely.`;
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
    } else if (docType === 'police_complaint') {
      typeSpecificRules = `
=== POLICE COMPLAINT / FIR APPLICATION (पुलिस शिकायत) - SENIOR ADVOCATE RULES ===
- THIS IS A FORMAL APPLICATION (प्रार्थना पत्र) TO THE POLICE STATION.
- Use official Government Application format: सेवा में, श्रीमान थाना प्रभारी..., विषय..., महोदय..., सविनय निवेदन..., प्रार्थना खंड..., प्रार्थी.
- Auto-detect the police station name from user input (e.g. "थाना ककोड़" → थाना प्रभारी ककोड़).
- Extract the EXACT amounts, dates, and incident details. Never invent or modify the monetary amounts.
- Include FIR registration request if applicable.
- Include relevant IPC/BNS sections if identifiable from the facts (e.g. theft → Section 379 IPC / Section 303 BNS).
- Prayer clause: Request FIR registration + investigation + recovery + action against accused.
- Include applicant details block: Name, Father's Name, Address, Mobile, Aadhaar placeholder.`;
    } else if (docType === 'rti') {
      typeSpecificRules = `
=== RTI APPLICATION (सूचना का अधिकार आवेदन) - SENIOR ADVOCATE RULES ===
- Follow RTI Act 2005 format strictly.
- Address to the PIO (Public Information Officer) of the relevant department.
- Format numbered information points clearly.
- Include application fee reference (₹10 postal order / court fee stamp).
- Add "RTI Act 2005, Section 6(1)" reference.
- Include applicant details with Aadhaar placeholder.
- If department is unclear from user input, use a professional placeholder.`;
    } else if (docType === 'consumer_complaint') {
      typeSpecificRules = `
=== CONSUMER COMPLAINT (उपभोक्ता शिकायत) - SENIOR ADVOCATE RULES ===
- Address to District Consumer Disputes Redressal Forum / Commission.
- Identify Complainant and Opposite Party clearly.
- Include invoice/bill/receipt reference placeholders.
- Cite Consumer Protection Act 2019 sections.
- Include compensation demand and relief sought.
- Include affidavit of complainant placeholder.
- Prayer clause: specific relief + compensation + costs.`;
    } else if (docType === 'electricity_complaint') {
      typeSpecificRules = `
=== ELECTRICITY COMPLAINT (विद्युत विभाग शिकायत) - SENIOR ADVOCATE RULES ===
- THIS IS A FORMAL APPLICATION TO THE ELECTRICITY DEPARTMENT.
- Address to Executive Engineer / अधिशासी अभियंता, Electricity Department.
- Use official Government Application format: सेवा में..., विषय..., महोदय..., सविनय निवेदन...
- Include consumer number / meter number placeholder.
- Extract the specific complaint (overcharging, no supply, faulty meter, new connection, etc.).
- Include bill amount references if mentioned.
- Prayer clause: request immediate action on the complaint.`;
    } else if (docType === 'revenue_application') {
      typeSpecificRules = `
=== REVENUE APPLICATION (राजस्व विभाग आवेदन) - SENIOR ADVOCATE RULES ===
- Address to appropriate revenue officer: Tehsildar / SDM / Collector / Lekhpal.
- Use official Government Application format.
- Include Khasra, Khata, Plot numbers if mentioned.
- Include property survey details and boundaries if available.
- Reference relevant revenue laws (UP Revenue Code, etc.).
- Common categories: mutation, demarcation, encroachment removal, land record correction.
- Prayer clause: specific revenue action requested.`;
    } else if (docType === 'pension_application') {
      typeSpecificRules = `
=== PENSION APPLICATION (पेंशन आवेदन) - SENIOR ADVOCATE RULES ===
- Address to District Social Welfare Officer / जिला समाज कल्याण अधिकारी.
- Detect pension type: Old Age (वृद्धावस्था), Widow (विधवा), Disability (दिव्यांग).
- Include age proof placeholder, income certificate placeholder.
- Include bank account details placeholder (account number, IFSC, branch).
- Include BPL/APL status if relevant.
- Prayer clause: approval and disbursement of pension.`;
    } else if (docType === 'court_draft') {
      typeSpecificRules = `
=== COURT DRAFT (न्यायालय मसौदा) - SENIOR ADVOCATE RULES ===
- Identify court type: Civil Court, Family Court, Consumer Court, Criminal Court.
- Include case number placeholder if not provided.
- Follow court filing format: IN THE COURT OF..., CASE NO..., PARTIES..., FACTS..., PRAYER.
- Use professional court language.
- Include vakalatnama reference if applicable.
- Include court fee stamp placeholder.`;
    }

    // ── SMART APPLICANT MODIFIER INJECTION ──
    let applicantInstruction = '';
    if (applicantModifier) {
      const modifierMap = {
        wife: 'The application/draft must be written AS IF THE WIFE is the applicant. The applicant section must show the wife\'s name and identity details. The husband is the complainant\'s spouse, not the applicant. Use "मैं [पत्नी का नाम], पत्नी श्री [पति का नाम]" format.',
        father: 'The application/draft must be written AS IF THE FATHER is the applicant. Use "मैं [पिता का नाम], पिता [बच्चे का नाम]" format.',
        mother: 'The application/draft must be written AS IF THE MOTHER is the applicant. Use "मैं [माता का नाम], माता [बच्चे का नाम]" format.',
        advocate: 'The application/draft must be written BY AN ADVOCATE on behalf of the client. Include vakalatnama reference. Use "मेरे मुवक्किल [नाम]" and advocate signature block.',
        brother: 'The application/draft must be written AS IF THE BROTHER is the applicant on behalf of the family.',
        sister: 'The application/draft must be written AS IF THE SISTER is the applicant on behalf of the family.'
      };
      applicantInstruction = `\n\n=== APPLICANT MODIFIER (MANDATORY) ===\n${modifierMap[applicantModifier]}\nThis is NON-NEGOTIABLE. The applicant identity MUST reflect this modifier.`;
    }

    const systemPrompt = `You are a senior advocate with 20+ years of experience in Indian law.

${baseRules}

${typeSpecificRules}
${applicantInstruction}

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
      if (process.env.FORCE_OFFLINE === 'true') {
        throw new Error('Offline mode active - HASA routing to Template Engine');
      }
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
        const hasVerification = /सत्यापन|verification|verified|प्रार्थी|भवदीय/i.test(draft);
        
        // Enhanced self-review: check for amount/date preservation
        const inputAmounts = userInput.match(/₹[\d,.]+|\d+,\d+|रुपये\s*\d+/g) || [];
        let amountsPreserved = true;
        for (const amt of inputAmounts) {
          const numericPart = amt.replace(/[₹,रुपये\s]/g, '');
          if (numericPart && !draft.includes(numericPart)) {
            amountsPreserved = false;
            break;
          }
        }

        // Check applicant modifier compliance
        let modifierCompliant = true;
        if (applicantModifier === 'wife' && !/पत्नी|wife/i.test(draft)) {
          modifierCompliant = false;
        }
        
        if (!draft.includes('REJECTED') && (!hasSignatureBlock || !hasVerification || !amountsPreserved || !modifierCompliant) && retryCount < 1) {
          console.log(`[LegalDraftSkill] Quality check failed (sig:${hasSignatureBlock}, ver:${hasVerification}, amt:${amountsPreserved}, mod:${modifierCompliant}) — auto-retrying...`);
          return this._generateWithAI(userInput, docType, retryCount + 1, applicantModifier);
        }
        return draft;
      }

      // If draft too short, retry once
      if (draft && !draft.includes('REJECTED') && retryCount < 1) {
        console.log('[LegalDraftSkill] Draft too short — auto-retrying...');
        return this._generateWithAI(userInput, docType, retryCount + 1, applicantModifier);
      }
      
      return draft;
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
      police_complaint: this._policeComplaintTemplate(userInput, today),
      rti: this._rtiTemplate(userInput, today),
      consumer_complaint: this._consumerComplaintTemplate(userInput, today),
      electricity_complaint: this._electricityComplaintTemplate(userInput, today),
      revenue_application: this._revenueApplicationTemplate(userInput, today),
      pension_application: this._pensionApplicationTemplate(userInput, today),
      court_draft: this._courtDraftTemplate(userInput, today),
      prayer_letter: this._prayerLetterTemplate(userInput, today),
      complaint: this._generalComplaintTemplate(userInput, today),
      representation: this._representationTemplate(userInput, today),
      undertaking: this._undertakingTemplate(userInput, today),
      draft: this._generalDraftTemplate(userInput, today),
      application: this._generalApplicationTemplate(userInput, today),
      notice: this._generalNoticeTemplate(userInput, today),
    };
    return templates[docType] || templates.affidavit;
  }

  // ═══════════════════════════════════════════════════════════
  //  PRD-021: Category → DocType Mapper
  // ═══════════════════════════════════════════════════════════
  _mapCategoryToDocType(category, message) {
    // Direct match if it's already a valid docType
    const directTypes = ['gift_deed', 'affidavit', 'noc', 'rent_agreement', 'partition_deed',
      'police_complaint', 'rti', 'consumer_complaint', 'electricity_complaint',
      'revenue_application', 'pension_application', 'court_draft', 'prayer_letter',
      'application', 'draft', 'complaint', 'notice', 'representation', 'undertaking',
      'name_change', 'will', 'power_of_attorney', 'declaration'];
    if (directTypes.includes(category)) return category;

    // Map PRD-021 categories to docTypes
    const categoryMap = {
      'general_prayer': 'prayer_letter',
      'government_prayer': 'prayer_letter',
      'revenue_prayer': 'prayer_letter',
      'police_prayer': 'prayer_letter',
      'municipal_prayer': 'prayer_letter',
      'panchayat_prayer': 'prayer_letter',
      'bank_prayer': 'prayer_letter',
      'general_application': 'application',
      'school_application': 'application',
      'leave_application': 'application',
      'admission_application': 'application',
      'tc_application': 'application',
      'scholarship_application': 'application',
      'fee_concession_application': 'application',
      'income_certificate_application': 'application',
      'caste_certificate_application': 'application',
      'residence_certificate_application': 'application',
      'character_certificate_application': 'application',
      'job_application': 'application',
      'resignation_letter': 'application',
      'experience_certificate_application': 'application',
      'general_complaint': 'complaint',
      'water_complaint': 'complaint',
      'road_complaint': 'complaint',
      'general_draft': 'draft',
      'general_affidavit': 'affidavit',
      'lost_document_affidavit': 'affidavit',
      'name_change_affidavit': 'name_change',
      'dob_correction_affidavit': 'affidavit',
      'rti_application': 'rti',
      'general_agreement': 'rent_agreement',
      'legal_notice': 'notice',
      'cheque_bounce_notice': 'notice',
      'eviction_notice': 'notice',
      'recovery_notice': 'notice',
      'defamation_notice': 'notice',
      'general_notice': 'notice',
      'general_undertaking': 'undertaking',
      'government_representation': 'representation',
    };
    if (categoryMap[category]) return categoryMap[category];

    // Fallback to detection from message
    return this._detectDocumentType(message);
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

  // ═══════════════════════════════════════════════════════════
  //  NEW TEMPLATE FALLBACKS (Application/Government Format)
  // ═══════════════════════════════════════════════════════════

  _policeComplaintTemplate(input, date) {
    return `सेवा में,

श्रीमान थाना प्रभारी
[थाना का नाम / Police Station Name]
[जिला / District]

विषय: ${input} — के सम्बन्ध में शिकायत / प्राथमिकी दर्ज कराने हेतु प्रार्थना पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम / Name], पुत्र/पत्नी [पिता/पति का नाम],
निवासी [पूरा पता / Full Address], मोबाइल: [____________________],
आधार संख्या: [____________________]।

मेरे साथ उपरोक्त विषय से सम्बन्धित घटना हुई है जिसका विवरण निम्नवत है:

(यहाँ घटना का पूरा विवरण: ${input})

अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए मेरी शिकायत पर प्राथमिकी (FIR) दर्ज करने तथा आवश्यक कार्यवाही करने की कृपा करें।

दिनांक / Date: ${date}
स्थान / Place: ____________________

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पिता/पति का नाम: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _rtiTemplate(input, date) {
    return `सेवा में,

जनसूचना अधिकारी (PIO)
[विभाग का नाम / Department Name]
[कार्यालय का पता / Office Address]

विषय: सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अन्तर्गत सूचना प्राप्त करने हेतु आवेदन

महोदय,

मैं, [नाम / Name], पुत्र/पुत्री [पिता का नाम], निवासी [पूरा पता],
सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अन्तर्गत निम्नलिखित सूचना प्राप्त करना चाहता/चाहती हूँ:

${input}

कृपया उपरोक्त सूचना 30 दिनों के अन्दर उपलब्ध कराने की कृपा करें।

आवेदन शुल्क: ₹10 (कोर्ट फी स्टाम्प / पोस्टल ऑर्डर संलग्न)

दिनांक: ${date}

प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _consumerComplaintTemplate(input, date) {
    return `जिला उपभोक्ता विवाद प्रतितोष आयोग
[जिला / District]

शिकायत क्रमांक: ______ / ______

परिवादी / COMPLAINANT:
[नाम], पुत्र/पुत्री [पिता का नाम], निवासी [पता]

बनाम / VS

विपक्षी / OPPOSITE PARTY:
[कम्पनी/व्यक्ति का नाम], [पता]

विषय: ${input}

तथ्य / FACTS:
1. ${input}
2. (अतिरिक्त तथ्य यहाँ भरें)

मांगी गई राहत / RELIEF SOUGHT:
1. क्षतिपूर्ति / Compensation: ₹____________________
2. मानसिक एवं शारीरिक पीड़ा के लिए: ₹____________________
3. वाद व्यय / Cost of litigation: ₹____________________

दिनांक: ${date}

परिवादी / Complainant
हस्ताक्षर: ____________________
नाम: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _electricityComplaintTemplate(input, date) {
    return `सेवा में,

श्रीमान अधिशासी अभियंता
विद्युत वितरण खण्ड
[विभाग/खण्ड का नाम]
[जिला / District]

विषय: ${input} — के सम्बन्ध में शिकायत / प्रार्थना पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम], पुत्र/पुत्री [पिता का नाम],
निवासी [पूरा पता], उपभोक्ता संख्या: [____________________],
मीटर संख्या: [____________________]।

मेरी उपरोक्त विषय से सम्बन्धित शिकायत है:
${input}

अतः श्रीमान जी से विनम्र निवेदन है कि कृपया मेरी शिकायत पर शीघ्र कार्यवाही करें।

दिनांक: ${date}

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
उपभोक्ता संख्या: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _revenueApplicationTemplate(input, date) {
    return `सेवा में,

श्रीमान [तहसीलदार / उपजिलाधिकारी / जिलाधिकारी]
[तहसील / जनपद का नाम]

विषय: ${input} — के सम्बन्ध में प्रार्थना पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम], पुत्र/पुत्री [पिता का नाम],
निवासी [ग्राम / मोहल्ला], [पोस्ट], [तहसील], [जनपद]।

मेरी उपरोक्त विषय से सम्बन्धित प्रार्थना है:
${input}

खसरा संख्या: ____________________
खाता संख्या: ____________________
रकबा: ____________________

अतः श्रीमान जी से विनम्र निवेदन है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए आवश्यक कार्यवाही करने की कृपा करें।

दिनांक: ${date}

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पिता का नाम: ____________________
पता: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _pensionApplicationTemplate(input, date) {
    return `सेवा में,

श्रीमान जिला समाज कल्याण अधिकारी
[जनपद / District]

विषय: ${input} — पेंशन स्वीकृत / पुनः प्रारम्भ किए जाने हेतु प्रार्थना पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम], पुत्र/पत्नी [पिता/पति का नाम],
आयु [____] वर्ष, निवासी [पूरा पता],
आधार संख्या: [____________________]।

${input}

बैंक खाता विवरण:
खाता संख्या: ____________________
IFSC कोड: ____________________
शाखा: ____________________

अतः श्रीमान जी से विनम्र निवेदन है कि मेरी पेंशन स्वीकृत / पुनः प्रारम्भ करने की कृपा करें।

दिनांक: ${date}

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
आयु: ____________________
पता: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _courtDraftTemplate(input, date) {
    return `IN THE COURT OF [न्यायालय का नाम / Court Name]
[जनपद / District]

वाद संख्या / Case No.: ______ / ______

वादी / PLAINTIFF:
[नाम], पुत्र/पुत्री [पिता का नाम], निवासी [पता]

बनाम / VS

प्रतिवादी / DEFENDANT:
[नाम], [पता]

विषय / SUBJECT: ${input}

तथ्य / FACTS:
1. ${input}
2. (अतिरिक्त तथ्य)

प्रार्थना / PRAYER:
अतः यह निवेदन है कि न्यायालय कृपया उचित आदेश पारित करने की कृपा करें।

दिनांक: ${date}

वादी / Plaintiff
हस्ताक्षर: ____________________
नाम: ____________________

अधिवक्ता / Advocate (if applicable)
नाम: ____________________
बार काउंसिल नं.: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
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

  // ═══════════════════════════════════════════════════════════
  //  PRD-021: NEW TEMPLATE FALLBACKS
  // ═══════════════════════════════════════════════════════════

  _prayerLetterTemplate(input, date) {
    return `सेवा में,

श्रीमान [अधिकारी का पदनाम / Officer Designation]
[कार्यालय / विभाग का नाम / Office/Department]
[जिला / District]

विषय: ${input} — के सम्बन्ध में प्रार्थना पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम / Name], पुत्र/पुत्री/पत्नी [पिता/पति का नाम],
निवासी [ग्राम/मोहल्ला], [पोस्ट], [तहसील], [जनपद],
मोबाइल: [____________________], आधार संख्या: [____________________]।

उपरोक्त विषय के सम्बन्ध में आपसे निवेदन है कि:

${input}

अतः श्रीमान जी से सविनय प्रार्थना है कि उपरोक्त तथ्यों को दृष्टिगत रखते हुए मेरी प्रार्थना पर सहानुभूतिपूर्वक विचार करते हुए आवश्यक कार्यवाही करने की कृपा करें। आपकी अति कृपा होगी।

सधन्यवाद।

दिनांक: ${date}
स्थान: ____________________

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पिता/पति का नाम: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _generalComplaintTemplate(input, date) {
    return `सेवा में,

श्रीमान [अधिकारी का पदनाम / Officer Designation]
[विभाग / Department]
[जिला / District]

विषय: ${input} — के सम्बन्ध में शिकायत पत्र

महोदय,

सविनय निवेदन है कि मैं [नाम / Name], पुत्र/पुत्री/पत्नी [पिता/पति का नाम],
निवासी [पूरा पता / Full Address],
मोबाइल: [____________________]।

मैं आपका ध्यान निम्नलिखित शिकायत की ओर आकृष्ट करना चाहता/चाहती हूँ:

${input}

अतः श्रीमान जी से विनम्र निवेदन है कि मेरी शिकायत पर शीघ्र कार्यवाही करने की कृपा करें।

दिनांक: ${date}

भवदीय / शिकायतकर्ता,
हस्ताक्षर: ____________________
नाम: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _representationTemplate(input, date) {
    return `अभ्यावेदन / REPRESENTATION
═══════════════════════════════════════════════════════

सेवा में,

श्रीमान [अधिकारी का पदनाम / Officer Designation]
[विभाग / Department]
[जिला / District]

विषय: ${input} — के सम्बन्ध में अभ्यावेदन

महोदय,

हम निम्नलिखित नागरिक / ग्रामवासी / आवेदक अपना अभ्यावेदन प्रस्तुत करते हैं:

${input}

उपरोक्त तथ्यों को दृष्टिगत रखते हुए हम निम्नलिखित मांग करते हैं:

1. [मांग / Demand 1]
2. [मांग / Demand 2]
3. [मांग / Demand 3]

कृपया हमारे अभ्यावेदन पर सहानुभूतिपूर्वक विचार करने की कृपा करें।

दिनांक: ${date}

हस्ताक्षरकर्ता / Signatories:
1. नाम: ____________________ हस्ताक्षर: ____________________
2. नाम: ____________________ हस्ताक्षर: ____________________
3. नाम: ____________________ हस्ताक्षर: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _undertakingTemplate(input, date) {
    return `वचनबद्धता / UNDERTAKING
═══════════════════════════════════════════════════════

मैं, [नाम / Name], पुत्र/पुत्री/पत्नी [पिता/पति का नाम],
आयु [____] वर्ष, निवासी [पूरा पता],
आधार संख्या: [____________________],

एतद्द्वारा वचनबद्धता देता/देती हूँ कि:

${input}

मैं पूर्ण रूप से वचनबद्ध हूँ कि उपरोक्त शर्तों / बातों का पालन करूंगा/करूंगी। यदि मेरे द्वारा इस वचनबद्धता का उल्लंघन किया जाता है, तो मेरे विरुद्ध नियमानुसार कार्यवाही की जा सकती है।

यह वचनबद्धता मैंने अपनी स्वतंत्र इच्छा से, बिना किसी दबाव या बाध्यता के दी है।

दिनांक: ${date}
स्थान: ____________________

वचनबद्ध व्यक्ति / Person giving Undertaking:
हस्ताक्षर: ____________________
नाम: ____________________
पता: ____________________

साक्षी / Witness 1: ____________________
साक्षी / Witness 2: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _generalDraftTemplate(input, date) {
    return `मसौदा / DRAFT
═══════════════════════════════════════════════════════

दिनांक: ${date}

विषय: ${input}

═══════════════════════════════════════════════════════

${input}

(यह मसौदा संपादन योग्य है। कृपया आवश्यक परिवर्तन करें।)
(This draft is editable. Please make necessary changes.)

हस्ताक्षर: ____________________
नाम: ____________________
दिनांक: ${date}

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _generalApplicationTemplate(input, date) {
    return `सेवा में,

श्रीमान [अधिकारी / Officer]
[विभाग / संस्थान / Department]
[जिला / शहर / City]

विषय: ${input} — के सन्दर्भ में आवेदन पत्र

महोदय / महोदया,

सविनय निवेदन है कि मैं [नाम / Name], पुत्र/पुत्री/पत्नी [पिता/पति का नाम],
निवासी [पूरा पता / Full Address],
मोबाइल: [____________________]।

${input}

अतः आपसे विनम्र निवेदन है कि कृपया मेरे आवेदन पर विचार करते हुए आवश्यक कार्यवाही करने की कृपा करें। मैं सदैव आपका/आपकी आभारी रहूँगा/रहूँगी।

सधन्यवाद।

दिनांक: ${date}
स्थान: ____________________

भवदीय / प्रार्थी,
हस्ताक्षर: ____________________
नाम: ____________________
पिता/पति का नाम: ____________________
पता: ____________________
मोबाइल: ____________________

═══════════════════════════════════════════════════════════════════════════════`;
  }

  _generalNoticeTemplate(input, date) {
    return `नोटिस / NOTICE
═══════════════════════════════════════════════════════

दिनांक: ${date}

प्रेषक / FROM:
[नाम / Name]
[पता / Address]

प्रेषित / TO:
[नाम / Name]
[पता / Address]

विषय: ${input}

═══════════════════════════════════════════════════════

कृपया ध्यान दें कि:

${input}

आपको इस नोटिस की प्राप्ति से 15 दिनों के भीतर उचित कार्यवाही करने हेतु सूचित किया जाता है।

अन्यथा नियमानुसार आगामी कार्यवाही की जाएगी।

हस्ताक्षर: ____________________
नाम: ____________________
दिनांक: ${date}

═══════════════════════════════════════════════════════════════════════════════`;
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
• "थाना में रिपोर्ट लिखवानी है" → Police Complaint
• "RTI लगानी है" → RTI Application
• "बिजली विभाग को शिकायत" → Electricity Complaint
• "पेंशन के लिए आवेदन" → Pension Application
• "उपभोक्ता शिकायत दर्ज करनी है" → Consumer Complaint

मैं AI से professional draft generate कर दूंगा। आप उसे edit, save, print कर सकते हैं।`;
  }
}

module.exports = { LegalDraftSkill };
