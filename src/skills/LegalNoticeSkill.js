/**
 * LegalNoticeSkill — Advocate Legal Notice Generator with Letterhead
 *
 * User flow:
 *   1. Pehli baar advocate apna profile setup kare (naam, enrollment, chamber)
 *   2. Profile localStorage + backend memory mein save ho
 *   3. Agle baar koi bhi legal notice → automatic letterhead use ho
 *   4. AI poora professional notice draft kare
 *
 * Subjects supported (any):
 *   - Money recovery
 *   - Defamation
 *   - Property dispute
 *   - Cheque bounce (Section 138)
 *   - Eviction
 *   - Breach of contract
 *   - Consumer complaint
 *   - Custom (any subject)
 */

const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');

class LegalNoticeSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'legal_notice';
    this.displayName = 'कानूनी नोटिस (वकील)';
    this.displayNameEn = 'Legal Notice Generator';
    this.description = 'किसी भी विषय पर वकील के letterhead पर professional legal notice';
    this.descriptionEn = 'Professional legal notices on advocate letterhead for any subject';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 7;

    this.intents = ['legal_notice', 'advocate_notice', 'lawyer_notice', 'cheque_bounce_notice',
                    'defamation_notice', 'recovery_notice', 'eviction_notice'];

    this.keywords = {
      hi: ['कानूनी नोटिस', 'वकील नोटिस', 'अधिवक्ता', 'चेक बाउंस', 'मानहानि',
           'वसूली', 'बेदखली', 'अनुबंध भंग', 'उपभोक्ता शिकायत', 'letterhead'],
      en: ['legal notice', 'advocate notice', 'lawyer notice', 'cheque bounce',
           'defamation', 'recovery notice', 'eviction', 'section 138', 'letterhead'],
      hinglish: ['legal notice bhejo', 'vakil ka notice', 'cheque bounce notice',
                 'recovery notice banao', 'advocate letterhead', 'notice draft karo',
                 'lawyer notice likho']
    };

    // Per-user advocate profiles (in-memory; should be DB-backed in production)
    this.advocateProfiles = new Map();

    this.aiManager = aiProviderManager;
  }

  async execute(context) {
    const { message, userId } = context;
    const text = message?.toLowerCase() || '';

    // Setup advocate profile commands
    if (this._isSetupProfile(text)) {
      return this.handleProfileSetup(userId, message);
    }

    // Show current profile
    if (/profile|प्रोफाइल|letterhead/.test(text) && /(show|dikhao|दिखाओ|view)/.test(text)) {
      return this.showProfile(userId);
    }

    // Generate notice (default action)
    return await this.generateNotice(userId, message);
  }

  // ═══════════════════════════════════════════════════════════
  //  ADVOCATE PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════
  setProfile(userId, profile) {
    this.advocateProfiles.set(userId, { ...profile, updatedAt: new Date().toISOString() });
  }

  getProfile(userId) {
    return this.advocateProfiles.get(userId) || null;
  }

  handleProfileSetup(userId, message) {
    // Parse profile fields from natural language
    const profile = this.getProfile(userId) || {};

    const nameMatch = message.match(/(?:naam|name|नाम)\s*[:=]?\s*([^,\n।]+)/i);
    const enrollMatch = message.match(/(?:enroll(?:ment)?|registration|बार\s*काउंसिल)\s*(?:no|number|न)?\s*[:=]?\s*([A-Z0-9\/\-]+)/i);
    const chamberMatch = message.match(/(?:chamber|कक्ष|address|पता)\s*[:=]?\s*([^,\n।]+(?:[,\s][^,\n।]+){0,3})/i);
    const phoneMatch = message.match(/(?:phone|mobile|फोन|मोबाइल)\s*[:=]?\s*(\+?\d{10,13})/i);
    const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
    const courtMatch = message.match(/(?:court|न्यायालय|practising|practice\s*at)\s*[:=]?\s*([^,\n।]+)/i);

    if (nameMatch) profile.name = nameMatch[1].trim();
    if (enrollMatch) profile.enrollmentNumber = enrollMatch[1].trim();
    if (chamberMatch) profile.chamberAddress = chamberMatch[1].trim();
    if (phoneMatch) profile.phone = phoneMatch[1].trim();
    if (emailMatch) profile.email = emailMatch[0].trim();
    if (courtMatch) profile.court = courtMatch[1].trim();

    this.setProfile(userId, profile);

    const filled = Object.keys(profile).filter(k => k !== 'updatedAt').length;
    const required = ['name', 'enrollmentNumber', 'chamberAddress', 'phone'];
    const missing = required.filter(k => !profile[k]);

    if (missing.length > 0) {
      return this._reply(
        `📝 *Advocate Profile Setup*\n\n` +
        `✅ Saved:\n${this._formatProfile(profile)}\n\n` +
        `⚠️ अभी ये fields बाकी हैं:\n${missing.map(m => `• ${this._fieldLabel(m)}`).join('\n')}\n\n` +
        `Example कैसे बताएं:\n"Mera naam Adv. Ramesh Kumar hai, enrollment UP/12345/2018, chamber 12, Civil Court Road Lucknow, phone 9876543210"`,
        { mode: 'profile_setup', profile, missing }
      );
    }

    return this._reply(
      `✅ *Advocate Profile Complete!*\n\n${this._formatProfile(profile)}\n\n` +
      `💡 अब आप कोई भी legal notice बनवा सकते हैं:\n` +
      `• "Cheque bounce notice bhejo Sham Lal ko ₹50000 ka"\n` +
      `• "Property eviction notice tenant ko"\n` +
      `• "Money recovery notice ₹2 lakh ka"\n` +
      `• "Defamation notice for false allegations"`,
      { mode: 'profile_complete', profile }
    );
  }

  showProfile(userId) {
    const profile = this.getProfile(userId);
    if (!profile) {
      return this._reply(
        `⚠️ Advocate profile setup नहीं है।\n\n` +
        `पहले अपना profile setup करें:\n` +
        `"Mera naam Adv. [नाम], enrollment [no], chamber [पता], phone [नंबर]"`,
        { mode: 'no_profile' }
      );
    }
    return this._reply(`📇 *Advocate Profile:*\n\n${this._formatProfile(profile)}`, { mode: 'profile_view', profile });
  }

  _formatProfile(p) {
    return [
      p.name && `👤 ${p.name}`,
      p.enrollmentNumber && `🎫 Enrollment: ${p.enrollmentNumber}`,
      p.chamberAddress && `🏢 Chamber: ${p.chamberAddress}`,
      p.phone && `📞 Phone: ${p.phone}`,
      p.email && `📧 Email: ${p.email}`,
      p.court && `⚖️ Court: ${p.court}`,
    ].filter(Boolean).join('\n');
  }

  _fieldLabel(key) {
    const labels = {
      name: 'Name (नाम)',
      enrollmentNumber: 'Enrollment Number (पंजीकरण संख्या)',
      chamberAddress: 'Chamber Address (कक्ष का पता)',
      phone: 'Phone (फोन)',
      email: 'Email (ईमेल — optional)',
      court: 'Practising Court (न्यायालय — optional)',
    };
    return labels[key] || key;
  }

  _isSetupProfile(text) {
    return /(set|update|change|setup|बदलो|बनाओ).*profile/i.test(text)
        || /(mera|my|main).*(advocate|वकील|enrollment).*?(naam|name)/i.test(text)
        || /\b(advocate|वकील)\s+profile\b/i.test(text);
  }

  // ═══════════════════════════════════════════════════════════
  //  LEGAL NOTICE GENERATION (AI-powered)
  // ═══════════════════════════════════════════════════════════
  async generateNotice(userId, message) {
    const profile = this.getProfile(userId);
    if (!profile || !profile.name || !profile.enrollmentNumber) {
      return this._reply(
        `⚠️ *Profile Setup Required*\n\n` +
        `Legal notice भेजने के लिए पहले advocate profile setup करें:\n\n` +
        `Example: "Mera naam Adv. Ramesh Kumar hai, enrollment UP/12345/2018, chamber 12 Civil Court Road Lucknow, phone 9876543210, email rk@law.com"`,
        { mode: 'profile_required' }
      );
    }

    // Detect notice type
    const noticeType = this._detectNoticeType(message);

    // Try AI generation
    if (this.aiManager) {
      try {
        const noticeBody = await this._generateNoticeWithAI(message, noticeType, profile);
        if (noticeBody) {
          const fullNotice = this._wrapWithLetterhead(noticeBody, profile);
          return this._reply(fullNotice, {
            mode: 'notice_generated',
            noticeType,
            advocate: profile,
            editable: true,
          });
        }
      } catch (err) {
        console.error('[LegalNoticeSkill] AI failed:', err.message);
      }
    }

    // Fallback to template
    const template = this._templateNotice(message, noticeType, profile);
    return this._reply(template, {
      mode: 'notice_template',
      noticeType,
      advocate: profile,
      editable: true,
      note: 'Template-based (AI unavailable)',
    });
  }

  _detectNoticeType(text) {
    const lower = text.toLowerCase();
    if (/cheque|चेक|138|bounce/i.test(lower)) return 'cheque_bounce';
    if (/recovery|वसूली|paisa|paise|due|उधार|loan/i.test(lower)) return 'money_recovery';
    if (/defamation|मानहानि|false.*allegation|गलत.*आरोप/i.test(lower)) return 'defamation';
    if (/eviction|बेदखली|tenant|किरायेदार|vacate.*premises/i.test(lower)) return 'eviction';
    if (/breach.*contract|अनुबंध.*भंग|contract.*violation/i.test(lower)) return 'breach_contract';
    if (/consumer|उपभोक्ता|service.*deficiency/i.test(lower)) return 'consumer_complaint';
    if (/property.*dispute|सम्पत्ति.*विवाद/i.test(lower)) return 'property_dispute';
    if (/divorce|तलाक|matrimonial/i.test(lower)) return 'matrimonial';
    return 'general'; // any subject
  }

  async _generateNoticeWithAI(userInput, noticeType, profile) {
    const noticeTypeNames = {
      cheque_bounce: 'Cheque Bounce Notice under Section 138 of Negotiable Instruments Act, 1881',
      money_recovery: 'Money Recovery Notice',
      defamation: 'Defamation Notice',
      eviction: 'Eviction Notice / Notice to Vacate',
      breach_contract: 'Notice for Breach of Contract',
      consumer_complaint: 'Consumer Complaint Notice',
      property_dispute: 'Property Dispute Notice',
      matrimonial: 'Matrimonial Notice',
      general: 'Legal Notice',
    };

    const noticeTitle = noticeTypeNames[noticeType] || 'Legal Notice';

    const systemPrompt = `You are an expert Indian advocate drafting a professional legal notice. The notice will be printed on the advocate's letterhead.

CRITICAL REQUIREMENTS:
1. Generate ONLY the body of the notice (not the letterhead — that will be added separately)
2. Output should follow Indian legal notice format:
   - "NOTICE" / "नोटिस" header
   - "Through registered post / WhatsApp / Email"
   - "TO," (Recipient details)
   - "Sir/Madam" / "महोदय / महोदया"
   - "Subject:"
   - "Under instructions from my client..."
   - Numbered paragraphs (1, 2, 3...) describing facts
   - Demand clause: "I hereby call upon you to..."
   - Time limit: "...within 15 days from receipt of this notice"
   - Consequence clause: "Failing which... legal proceedings... at your risk and cost"
   - "Take notice accordingly"
   - "Yours faithfully," (Advocate signature placeholder)
3. Include both Hindi and English versions OR primarily English with Hindi key phrases
4. Use formal legal language with proper sections of relevant Acts
5. Length: 500-900 words
6. Use [Recipient Name], [Client Name], [Date] etc. as placeholders if not specified

=== QUALITY ENGINE RULES FOR LEGAL NOTICE ===
- AUTO CAPITALIZATION: All proper nouns must be Title Case. Legal headings in ALL CAPS.
- ENTITY PLACEHOLDERS: If client/recipient details are missing, use:
  - [आधार संख्या / Aadhaar No.: ____________________]
  - [पैन संख्या / PAN No.: ____________________]
  - [पता / Address: ____________________]
  - [मोबाइल / Mobile No.: ____________________]
  NEVER leave any identity field blank without a professional placeholder.
- HALLUCINATION PREVENTION: NEVER invent names, addresses, amounts, or dates.
- LEGAL SECTIONS: Always cite the correct Act and Section (e.g., Section 138 NI Act, Section 420 IPC).
- Include legal remedy + monetary claim calculation placeholder if applicable.
- Reply period MUST be explicitly stated (typically 15 days).
- Include "Copy to" section at the end.

Notice type: ${noticeTitle}

Output ONLY the notice body — no advocate letterhead, no preamble, no explanation.`;

    const userPrompt = `Draft a complete professional ${noticeTitle} for the following matter:

"${userInput}"

Use [Client Name], [Recipient Name], [Address], [Amount], [Date] as placeholders where specifics are not provided. Generate the full notice body now.`;

    try {
      const response = await this.aiManager.createChatCompletion('LegalDraftAgent', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      });
      const body = response?.choices?.[0]?.message?.content?.trim();
      if (body && body.length > 200) return body;
    } catch (err) {
      console.error('[LegalNoticeSkill] AI generation error:', err.message);
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════
  //  LETTERHEAD WRAPPER
  // ═══════════════════════════════════════════════════════════
  _wrapWithLetterhead(noticeBody, profile) {
    const today = new Date().toLocaleDateString('en-IN');
    const letterhead = `
═══════════════════════════════════════════════════════════════
                    ${(profile.name || 'ADVOCATE').toUpperCase()}
                          Advocate
${profile.court ? `              Practising at: ${profile.court}\n` : ''}
   Enrollment No: ${profile.enrollmentNumber || '[ENROLLMENT NO]'}
   Chamber: ${profile.chamberAddress || '[CHAMBER ADDRESS]'}
   Phone: ${profile.phone || '[PHONE]'}${profile.email ? ` | Email: ${profile.email}` : ''}
═══════════════════════════════════════════════════════════════

Ref. No: LN/${new Date().getFullYear()}/____            Date: ${today}

`;
   const footer = `

═══════════════════════════════════════════════════════════════

                                          ${profile.name || '[Advocate Name]'}
                                          (Advocate / अधिवक्ता)
                                          Enroll. No: ${profile.enrollmentNumber || '____'}
                                          आधार संख्या / Aadhaar No.: ____________________
                                          पैन संख्या / PAN No.: ____________________

═══════════════════════════════════════════════════════════════
NOTE: This is a formal legal notice. Reply within 15 days of receipt.
This notice is sent through Registered Post AD / Email / WhatsApp.

Copy to:
1. The Addressee (by Registered Post AD)
2. Retained in Advocate's office for record
═══════════════════════════════════════════════════════════════`;

    return letterhead + noticeBody + footer;
  }

  // Template fallback
  _templateNotice(input, noticeType, profile) {
    const today = new Date().toLocaleDateString('en-IN');
    const body = `NOTICE
Through Registered Post AD / Email

TO,
[Recipient Name]
[Recipient Full Address]
[City, State, PIN]

Sir / Madam,

Under instructions from and on behalf of my client, I hereby serve upon you the following notice:

1. That my client [Client Name], S/o [Father's Name], R/o [Address], is aggrieved by your following acts:

   ${input}

2. That despite repeated requests, you have failed to address the matter amicably, leaving my client with no choice but to issue this formal legal notice.

3. That your aforesaid acts/omissions have caused mental agony, financial loss, and harassment to my client, for which you are legally liable.

4. I hereby call upon you to:
   a) Cease and desist from the aforementioned acts immediately;
   b) Make good the loss caused to my client;
   c) Send a written reply to this notice within 15 (fifteen) days from the date of receipt;
   d) Comply with the demands stated above.

5. TAKE NOTICE that in case you fail to comply with the above demands within the stipulated time, my client shall be constrained to initiate appropriate civil and/or criminal proceedings against you in the competent court of law, at your sole risk, costs, and consequences, without any further notice or intimation.

6. A copy of this notice is being retained in my office for record and future reference.

Take notice accordingly.

Yours faithfully,`;

    return this._wrapWithLetterhead(body, profile);
  }
}

module.exports = { LegalNoticeSkill };
