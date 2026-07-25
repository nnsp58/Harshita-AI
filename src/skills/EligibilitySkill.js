/**
 * EligibilitySkill — योग्यता / पात्रता जाँच
 *
 * Capabilities:
 * - Multi-turn details gathering (scheme/job name, DOB, education, category)
 * - Category age relaxations (OBC +3 yrs, SC/ST +5 yrs)
 * - Execute EligibilityAgent pre-check
 */

const { BaseSkill } = require('./BaseSkill');
const { AISkillHelper } = require('./AISkillHelper');
const { EligibilityAgent } = require('../agents/eligibilityAgent');

class EligibilitySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'eligibility_check';
    this.displayName = 'पात्रता जाँच';
    this.displayNameEn = 'Eligibility Check';
    this.description = 'उपयोगकर्ता की स्वयं की सरकारी योजनाओं या नौकरियों की पात्रता जाँचना (जैसे: "क्या मैं SSC के लिए योग्य हूँ?")। ध्यान दें: सामान्य ज्ञान/नियमों के प्रश्नों (जैसे: "क्या सरकारी नौकरी के लिए 12 पास होना ज़रूरी है") के लिए इसका उपयोग न करें — उन्हें general_chat में भेजें।';
    this.descriptionEn = 'Checking user\'s personal eligibility for a specific scheme or job (e.g., "Am I eligible for SSC?"). NOT for general informational questions about requirements or rules (e.g. "is 12th pass necessary for government jobs") — send those to general_chat.';
    this.version = '2.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.priority = 6;
    this.intents = ['eligibility_check', 'yogyata_check', 'am_i_eligible', 'qualification_check'];

    this.visible = true;
    this.type = 'application';
    this.route = '/service/eligibility';
    this.keywords = {
      hi: ['योग्य', 'योग्यता', 'पात्रता', 'उम्र सीमा', 'क्वालिफिकेशन', 'पात्र'],
      en: ['eligible', 'eligibility', 'qualification', 'age limit', 'criteria', 'qualify'],
      hinglish: ['yogya hu', 'eligibility check', 'qualification check', 'age limit kya hai', 'paatra hu']
    };
    this.requiredAgents = ['eligibilityAgent'];
    this.agent = new EligibilityAgent();
    this.userSessions = new Map();
  }

  async execute(context) {
    const { message, userId } = context;
    if (!message) return this._reply(this._getMenu());

    const userIdSafe = userId || 'anon';
    const session = this._getSession(userIdSafe);
    const pastContext = this._getContext ? this._getContext(userIdSafe, 5) : '';

    const fields = [
      { key: 'dob', desc: 'Date of Birth (DD-MM-YYYY)' },
      { key: 'education', desc: 'Education qualification (10th pass, 12th pass, graduate)' },
      { key: 'category', desc: 'Category (general, obc, sc, st)' },
      { key: 'scheme', desc: 'Name of the job or scheme (e.g. ssc, railway, pmegp, police)' },
      { key: 'aadhaarNumber', desc: 'Aadhaar number (optional, for identity verification)' }
    ];

    const aiResult = await AISkillHelper.extractIntent({
      userInput: message,
      skillName: 'eligibility_check',
      fields,
      context: pastContext
    });

    Object.assign(session.entities, aiResult.entities || {});
    if (aiResult.intent) session.intent = aiResult.intent;

    const { dob, education, category, scheme } = session.entities;

    if (!scheme) {
      return this._reply(
        `🔍 *पात्रता जाँच (Eligibility Pre-Check)*\n\n` +
        `किस योजना या नौकरी की पात्रता जाँचनी है? (जैसे: ssc, railway, pmegp, police)\n\n` +
        `Example: "Mera eligibility check karo SSC ke liye"`
      );
    }

    // If info missing, prompt user
    if (!dob || !education || !category) {
      const missing = [];
      if (!dob) missing.push("जन्म तिथि (Date of Birth - e.g. 15-08-1998)");
      if (!education) missing.push("शिक्षा (Education - e.g. 12th Pass)");
      if (!category) missing.push("श्रेणी (Category - General, OBC, SC, ST)");

      return this._reply(
        `🔍 *${scheme.toUpperCase()} Eligibility Pre-Check*\n\n` +
        `पात्रता की गणना करने के लिए कृपया निम्नलिखित विवरण बताएं:\n` +
        missing.map((m, idx) => `${idx + 1}. ${m}`).join('\n') + `\n\n` +
        `Example: "Mera dob 12-04-2000 hai, general category, 12th pass"`,
        { mode: 'collecting_info', collected: session.entities }
      );
    }

    // Map education to standard categories
    let minAge = 18;
    let maxAge = 25;
    if (scheme.toLowerCase().includes('ssc')) {
      maxAge = education.toLowerCase().includes('grad') ? 32 : 27;
    } else if (scheme.toLowerCase().includes('pmegp') || scheme.toLowerCase().includes('loan') || scheme.toLowerCase().includes('mudra')) {
      minAge = 18;
      maxAge = 60;
    } else if (scheme.toLowerCase().includes('police')) {
      maxAge = 22;
    } else if (scheme.toLowerCase().includes('railway') || scheme.toLowerCase().includes('rrb')) {
      maxAge = 33;
    }

    try {
      // Reformat date from DD-MM-YYYY to YYYY-MM-DD for AgeCalculator
      let formattedDob = dob;
      const dateParts = dob.split(/[-/.]/);
      if (dateParts.length === 3) {
        if (dateParts[2].length === 4) {
          formattedDob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }

      const report = await this.agent.execute({
        userData: {
          personal: {
            dob: formattedDob,
            category: category.toLowerCase()
          }
        },
        jobDetails: {
          minAge,
          maxAge
        }
      });

      this.userSessions.delete(userIdSafe); // Reset session

      if (report.success && report.ageCheck) {
        const check = report.ageCheck;
        const resultText = check.eligible
          ? `✅ *आप योग्य हैं! (You are Eligible)*\n\n` +
            `• योजना/नौकरी: ${scheme.toUpperCase()}\n` +
            `• आपकी प्रभावी आयु: ${check.effectiveAge} वर्ष\n` +
            `• आयु सीमा: ${minAge} से ${check.maxAgeLimit} वर्ष (कैटेगरी छूट शामिल)\n\n` +
            `आप इस योजना/नौकरी के लिए आवेदन कर सकते हैं!`
          : `❌ *आप अपात्र हैं (Not Eligible)*\n\n` +
            `• योजना/नौकरी: ${scheme.toUpperCase()}\n` +
            `• आपकी प्रभावी आयु: ${check.effectiveAge} वर्ष\n` +
            `• आयु सीमा: ${minAge} से ${check.maxAgeLimit} वर्ष (कैटेगरी छूट शामिल)\n\n` +
            `अपात्रता का कारण: आयु सीमा से बाहर।`;

        return this._reply(resultText, { mode: 'eligibility_report', report });
      }

      return this._reply(`❌ पात्रता गणना करने में असमर्थ। कृपया पुनः प्रयास करें।`);
    } catch (e) {
      return this._reply(`⚠️ त्रुटि: ${e.message}`);
    }
  }

  _getSession(userId) {
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, { entities: {}, intent: null, createdAt: Date.now() });
    }
    return this.userSessions.get(userId);
  }

  _getMenu() {
    return `📋 *पात्रता जाँच (Eligibility Pre-Check)*\n\n` +
      `आप किसी भी सरकारी योजना या नौकरी के लिए अपनी पात्रता जाँच सकते हैं।\n\n` +
      `शुरू करने के लिए योजना/नौकरी का नाम बताएं:\n` +
      `• "SSC की eligibility check करो"\n` +
      `• "Mera yogyata check karo UP Police ke liye"`;
  }
}

module.exports = { EligibilitySkill };
