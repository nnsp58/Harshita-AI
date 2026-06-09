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
  // ═══════════════════════════════════════════════════════════
  //  LEGAL NOTICE GENERATION (AI-powered)
  // ═══════════════════════════════════════════════════════════
  async generateNotice(userId, message) {
    const profile = this.getProfile(userId) || null;
    const isAdvocateMode = profile && profile.name && profile.enrollmentNumber;

    // Detect notice type
    const noticeType = this._detectNoticeType(message);

    // Try AI generation
    if (this.aiManager) {
      try {
        const noticeBody = await this._generateNoticeWithAI(message, noticeType, profile, isAdvocateMode);
        if (noticeBody) {
          const fullNotice = this._wrapWithLetterhead(noticeBody, profile, isAdvocateMode);
          return this._reply(fullNotice, {
            mode: 'notice_generated',
            noticeType,
            advocate: isAdvocateMode ? profile : null,
            editable: true,
          });
        }
      } catch (err) {
        console.error('[LegalNoticeSkill] AI failed:', err.message);
      }
    }

    // Fallback to template
    const template = this._templateNotice(message, noticeType, profile, isAdvocateMode);
    return this._reply(template, {
      mode: 'notice_template',
      noticeType,
      advocate: isAdvocateMode ? profile : null,
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

  async _generateNoticeWithAI(userInput, noticeType, profile, isAdvocateMode, retryCount = 0) {
    const noticeTypeNames = {
      cheque_bounce: 'Cheque Bounce Notice under Section 138 NI Act',
      money_recovery: 'Money Recovery Notice',
      defamation: 'Defamation Notice',
      eviction: 'Eviction Notice / Notice to Vacate',
      breach_contract: 'Notice for Breach of Contract',
      consumer_complaint: 'Consumer Complaint Notice',
      property_dispute: 'Property Dispute Notice',
      matrimonial: 'Matrimonial/Family Dispute Notice',
      general: 'Legal Notice',
    };

    const noticeTitle = noticeTypeNames[noticeType] || 'Legal Notice';

    const systemPrompt = `You are the LEGAL NOTICE ENGINE, an expert legal assistant drafting highly professional Indian legal notices.

Notice Type Detected: ${noticeTitle}
Mode: ${isAdvocateMode ? 'Advocate Notice (Sent by advocate on behalf of client)' : 'Self Legal Notice (Sent directly by sender)'}

=== 9-STEP LEGAL NOTICE PROTOCOL ===
STEP 1: Detect Notice Type (Money Recovery, Property Dispute, Cheque Bounce, etc.)
STEP 2: Extract Parties (Sender, Receiver, Father Name, Village, District, State)
STEP 3: Extract Claim (Money, Property, Compensation, Refund, Performance)
STEP 4: Generate Cause of Action (Who hired whom, agreement, default, loss)
STEP 5: Generate Relief Clause (Refund Amount, Interest, Compensation, Time Limit, Legal Action Warning)
STEP 6: Advocate Mode Detection (Use Self Legal Notice formatting if Advocate Mode is false)
STEP 7: Limitation Review (Calculate elapsed years. Show warning "Limitation review recommended" if potentially time barred)
STEP 8: Auto Capitalization (deepchand -> Deepchand, meer singh -> Meer Singh, uttar pradesh -> Uttar Pradesh)
STEP 9: Professional Legal Language (Suitable for Advocate, Civil Court, Consumer Forum, Government Submission)

=== OUTPUT REQUIREMENTS ===
1. Use formal legal language with proper sections of relevant Acts.
2. Numbered paragraphs (1, 2, 3...) describing facts.
3. Demand clause with explicit Time limit (typically 15 days).
4. Do not generate the letterhead or bottom signature block (it will be added by the system).
5. If placeholders are needed, use:
   - [आधार संख्या / Aadhaar No.: ____________________]
   - [पैन संख्या / PAN No.: ____________________]
   - [पता / Address: ____________________]
   - [तारीख / Date: ____________________]

=== QUALITY CHECK (MUST DO FIRST) ===
Before generating the final notice body, you MUST include a <quality_check> XML block with your internal reasoning confirming:
- ✓ Notice type detected
- ✓ Sender extracted
- ✓ Receiver extracted
- ✓ Amount extracted
- ✓ Cause of action generated
- ✓ Relief generated
- ✓ Limitation reviewed
- ✓ Mode supported
- ✓ No unnecessary profile setup request
- ✓ Professional formatting

After the </quality_check> tag, output ONLY the notice body.`;

    const userPrompt = `Draft a complete professional ${noticeTitle} based on the following input:

"${userInput}"

Do not output the letterhead. Provide the <quality_check> block, then the notice body.`;

    try {
      const response = await this.aiManager.createChatCompletion('LegalDraftAgent', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });
      
      let rawOutput = response?.choices?.[0]?.message?.content?.trim();
      if (!rawOutput) throw new Error('Empty response from AI');

      // Strip internal quality check block from final output
      const qualityCheckMatch = rawOutput.match(/<quality_check>[\s\S]*?<\/quality_check>/i);
      let body = rawOutput.replace(/<quality_check>[\s\S]*?<\/quality_check>/i, '').trim();

      // Ensure formatting is clean
      if (body.startsWith('```')) body = body.replace(/```(?:markdown)?/g, '').trim();

      // Self-healing: if too short, retry once
      if (body.length < 200 && retryCount < 1) {
        console.warn(`[LegalNoticeSkill] Notice too short (${body.length} chars). Retrying...`);
        return this._generateNoticeWithAI(userInput, noticeType, profile, isAdvocateMode, retryCount + 1);
      }

      if (body) return body;
    } catch (err) {
      console.error('[LegalNoticeSkill] AI generation error:', err.message);
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════════
  //  LETTERHEAD WRAPPER
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  //  LETTERHEAD WRAPPER
  // ═══════════════════════════════════════════════════════════
  _wrapWithLetterhead(noticeBody, profile, isAdvocateMode) {
    const today = new Date().toLocaleDateString('en-IN');
    
    let header = '';
    let footer = '';

    if (isAdvocateMode) {
      header = `
═══════════════════════════════════════════════════════════════
                    ${(profile.name || 'ADVOCATE').toUpperCase()}
                          Advocate
${profile.court ? `              Practising at: ${profile.court}\n` : ''}   Enrollment No: ${profile.enrollmentNumber || '[ENROLLMENT NO]'}
   Chamber: ${profile.chamberAddress || '[CHAMBER ADDRESS]'}
   Phone: ${profile.phone || '[PHONE]'}${profile.email ? ` | Email: ${profile.email}` : ''}
═══════════════════════════════════════════════════════════════

Ref. No: LN/${new Date().getFullYear()}/____            Date: ${today}

`;
      footer = `

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
    } else {
      // Self Notice Format
      header = `
═══════════════════════════════════════════════════════════════
                        LEGAL NOTICE
═══════════════════════════════════════════════════════════════

Date: ${today}
Place: ____________________

`;
      footer = `

═══════════════════════════════════════════════════════════════

                                          [Sender's Signature]
                                          Sender's Name: ____________________
                                          आधार संख्या / Aadhaar No.: ____________________
                                          पैन संख्या / PAN No.: ____________________
                                          Contact: ____________________

═══════════════════════════════════════════════════════════════
NOTE: This is a formal legal notice sent by the aggrieved party.
Reply within 15 days of receipt. Sent via Registered Post AD.
═══════════════════════════════════════════════════════════════`;
    }

    return header + noticeBody + footer;
  }

  // Template fallback
  _templateNotice(input, noticeType, profile, isAdvocateMode) {
    const body = `NOTICE
Through Registered Post AD / Email

TO,
[Recipient Name]
[Recipient Full Address]
[City, State, PIN]

Sir / Madam,

${isAdvocateMode ? 'Under instructions from and on behalf of my client, I hereby serve upon you the following notice:' : 'I hereby serve upon you the following formal notice:'}

1. That ${isAdvocateMode ? 'my client [Client Name]' : 'I, the undersigned'}, S/o [Father's Name], R/o [Address], am aggrieved by your following acts:

   ${input}

2. That despite repeated requests, you have failed to address the matter amicably, leaving ${isAdvocateMode ? 'my client' : 'me'} with no choice but to issue this formal legal notice.

3. That your aforesaid acts/omissions have caused mental agony, financial loss, and harassment, for which you are legally liable.

4. I hereby call upon you to:
   a) Cease and desist from the aforementioned acts immediately;
   b) Make good the loss caused;
   c) Send a written reply to this notice within 15 (fifteen) days from the date of receipt;
   d) Comply with the demands stated above.

5. TAKE NOTICE that in case you fail to comply with the above demands within the stipulated time, ${isAdvocateMode ? 'my client' : 'I'} shall be constrained to initiate appropriate civil and/or criminal proceedings against you in the competent court of law, at your sole risk, costs, and consequences.

${isAdvocateMode ? '6. A copy of this notice is being retained in my office for record and future reference.' : ''}

Take notice accordingly.

Yours faithfully,`;

    return this._wrapWithLetterhead(body, profile, isAdvocateMode);
  }
}

module.exports = { LegalNoticeSkill };
