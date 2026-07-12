/**
 * ITRAgent — Harshita AI Chartered Accountant
 * 
 * PRD-075: "AI NEVER generates return immediately. AI starts conversation."
 * 
 * This agent conducts the tax interview in Hindi/Hinglish,
 * collects all mandatory information, determines ITR type,
 * and prepares the return for user review.
 */

const { TaxRuleEngine } = require('../engines/TaxRuleEngine');
const { TaxCalculationEngine } = require('../engines/TaxCalculationEngine');
const { TaxSavingEngine } = require('../engines/TaxSavingEngine');
const { TaxValidationEngine } = require('../engines/TaxValidationEngine');
const { SelfHealingEngine } = require('../engines/SelfHealingEngine');

class ITRAgent {

  constructor() {
    this.interviewQuestions = [
      {
        id: 'q_income_source',
        field: 'incomeSource',
        text: '📋 **सवाल 1: आय का स्रोत (Income Source)**\n\nआपकी आय का मुख्य ज़रिया क्या है?',
        options: ['Salary (नौकरी)', 'Business (व्यापार)', 'Pension (पेंशन)', 'Rental Income (किराया)', 'Capital Gains (शेयर/प्रॉपर्टी बिक्री)', 'Agriculture (खेती)', 'Freelancing (फ्रीलांस)'],
        multi: true
      },
      {
        id: 'q_assessment_year',
        field: 'assessmentYear',
        text: '📅 **सवाल 2: Assessment Year**\n\nकिस Assessment Year के लिए ITR file करना है?',
        options: ['2025-26 (FY 2024-25)', '2024-25 (FY 2023-24)'],
      },
      {
        id: 'q_already_filed',
        field: 'alreadyFiled',
        text: '📝 **सवाल 3: पहले से filed?**\n\nक्या इस AY के लिए पहले से ITR file हो चुका है? (Revised Return)',
        options: ['नहीं, पहली बार', 'हाँ, Revised Return चाहिए'],
      },
      {
        id: 'q_form16',
        field: 'hasForm16',
        text: '📄 **सवाल 4: Form 16**\n\nक्या आपके पास Form 16 (Employer TDS Certificate) है?',
        options: ['हाँ, है', 'नहीं, नहीं है', 'Upload करना चाहता/चाहती हूँ'],
      },
      {
        id: 'q_ais',
        field: 'hasAIS',
        text: '📊 **सवाल 5: AIS (Annual Information Statement)**\n\nक्या आपने Income Tax Portal से AIS download किया है?',
        options: ['हाँ', 'नहीं', 'AIS क्या होता है?'],
      },
      {
        id: 'q_26as',
        field: 'has26AS',
        text: '📋 **सवाल 6: 26AS**\n\nक्या आपके पास Form 26AS (TDS details) है?',
        options: ['हाँ', 'नहीं'],
      },
      {
        id: 'q_salary_details',
        field: 'salaryDetailsCollected',
        text: '💰 **सवाल 7: Salary Details**\n\nकृपया अपनी वार्षिक सैलरी (Gross Salary) बताएं। अगर Form 16 upload करेंगे तो AI अपने आप निकाल लेगा।',
        options: ['Form 16 से निकालो', 'मैं बताता/बताती हूँ'],
        conditional: (profile) => profile.incomeSource && profile.incomeSource.includes('Salary')
      }
    ];
  }

  /**
   * Conduct the tax interview — stateful, one question at a time
   */
  async conductInterview(context, profile) {
    // First, run self-healing diagnostics
    const diagnosis = SelfHealingEngine.diagnose(profile, context.conversationHistory || []);
    
    // If critical issue found, address it first
    if (diagnosis.criticalCount > 0 && diagnosis.nextAction) {
      const issue = diagnosis.nextAction;
      return {
        status: 'HEALING',
        question: `⚠️ ${issue.prompt}`,
        options: issue.type === 'DUPLICATE_FILING' ? ['हाँ, Revised Return', 'नहीं, Cancel'] : undefined,
        healingField: issue.field
      };
    }

    // Proceed with interview questions
    for (const q of this.interviewQuestions) {
      // Skip conditional questions that don't apply
      if (q.conditional && !q.conditional(profile)) continue;
      
      // If this field is not yet answered
      if (profile[q.field] === undefined || profile[q.field] === null) {
        return {
          status: 'INTERVIEW',
          questionId: q.id,
          question: q.text,
          options: q.options,
          field: q.field
        };
      }
    }

    // All questions answered
    return { status: 'COMPLETE' };
  }

  /**
   * Prepare the Tax Return Summary
   * Called ONLY after interview is COMPLETE
   */
  async prepareReturn(profile) {
    // 1. AI Safety Check
    const safetyCheck = TaxValidationEngine.ensureNoGuesses(profile);
    if (!safetyCheck.safe) {
      return { status: 'SAFETY_BLOCKED', message: '🚫 AI Safety Block: ' + safetyCheck.errors.join('\n'), errors: safetyCheck.errors };
    }

    // 2. Validate all profile data
    const validation = TaxValidationEngine.validateProfile(profile);
    if (!validation.valid) {
      return { status: 'VALIDATION_FAILED', message: 'कुछ details सही नहीं हैं:\n' + validation.errors.join('\n'), errors: validation.errors };
    }

    // 3. Rule Engine determines ITR Type (NEVER guess)
    const itrResult = TaxRuleEngine.determineItrType(profile);

    // 4. Tax Calculation Engine compares regimes
    const taxComparison = TaxCalculationEngine.compareRegimes(profile);

    // 5. Tax Saving Engine suggests deductions
    const taxSavings = TaxSavingEngine.analyse(profile);

    // 6. Late Fee check
    const lateFee = TaxCalculationEngine.calculateLateFee(
      profile.assessmentYear || '2025-26',
      profile.filingDate
    );

    return {
      status: 'READY_FOR_REVIEW',
      itrType: itrResult.itr,
      itrReason: itrResult.reason,
      taxComparison,
      taxSavings,
      lateFee,
      message: `✅ आपका ${itrResult.itr} तैयार है।\n\n` +
               `📊 **ITR Type:** ${itrResult.itr} — ${itrResult.reason}\n` +
               `💰 **Recommended Regime:** ${taxComparison.recommendedRegime}\n` +
               `📉 **Tax Savings:** ₹${taxComparison.savings.toLocaleString('en-IN')}\n` +
               `💡 **Suggestions:** ${taxSavings.totalSuggestions} tax-saving tips\n\n` +
               `कृपया Preview tab में सब कुछ verify करें और Filing Assistance tab से confirm करें।`
    };
  }

  /**
   * Final filing step — ONLY with explicit user confirmation
   * PRD Rule: "Submission ALWAYS requires explicit user confirmation."
   */
  async fileReturn(profile, userConfirmation) {
    if (!userConfirmation) {
      return { status: 'BLOCKED', message: '🚫 Filing blocked। User confirmation ज़रूरी है। कृपया Filing Assistance tab में checkboxes check करें।' };
    }

    try {
      const taxAutomation = require('../../../agents/TaxAutomationAgent');
      const result = await taxAutomation.fileSingleReturn(profile);
      return { status: 'FILED', result };
    } catch (e) {
      return { status: 'FAILED', message: `Filing Error: ${e.message}` };
    }
  }
}

module.exports = { ITRAgent };
