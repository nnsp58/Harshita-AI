/**
 * TaxSavingEngine — Harshita AI Tax Advisor
 * 
 * PRD-075: Before filing, AI should suggest all applicable deductions.
 * This engine analyses the user's profile and identifies untapped savings.
 */

class TaxSavingEngine {

  static analyse(profile) {
    const suggestions = [];
    const d = profile.deductions || {};

    // ─── Section 80C (Max ₹1,50,000) ───
    const used80C = d.sec80C || 0;
    if (used80C < 150000) {
      const remaining = 150000 - used80C;
      suggestions.push({
        section: '80C',
        limit: 150000,
        used: used80C,
        remaining,
        hint: `₹${remaining.toLocaleString('en-IN')} और invest करें PPF, ELSS, LIC, NSC, या Sukanya Samriddhi में। पूरा ₹1.5 लाख का benefit लें।`,
        instruments: ['PPF', 'ELSS Mutual Fund', 'LIC Premium', 'NSC', 'Sukanya Samriddhi', 'Tax Saver FD', 'Tuition Fees']
      });
    }

    // ─── Section 80CCD(1B) — NPS (Max ₹50,000) ───
    const usedNPS = d.sec80CCD_1B || 0;
    if (usedNPS < 50000) {
      suggestions.push({
        section: '80CCD(1B)',
        limit: 50000,
        used: usedNPS,
        remaining: 50000 - usedNPS,
        hint: `NPS में ₹${(50000 - usedNPS).toLocaleString('en-IN')} और invest करके 80C के ऊपर additional deduction लें।`,
        instruments: ['National Pension System (NPS)']
      });
    }

    // ─── Section 80D — Health Insurance ───
    const used80D = d.sec80D || 0;
    const maxD = profile.isSeniorCitizen ? 50000 : 25000;
    const parentMax = d.parentSenior ? 50000 : 25000;
    const totalMaxD = maxD + parentMax;
    if (used80D < totalMaxD) {
      suggestions.push({
        section: '80D',
        limit: totalMaxD,
        used: used80D,
        remaining: totalMaxD - used80D,
        hint: `Health Insurance premium पर ₹${(totalMaxD - used80D).toLocaleString('en-IN')} का deduction बाकी है। Self + Family + Parents cover करें।`,
        instruments: ['Health Insurance (Self)', 'Health Insurance (Parents)', 'Preventive Health Checkup']
      });
    }

    // ─── Section 80E — Education Loan Interest ───
    if (!d.sec80E && profile.hasEducationLoan) {
      suggestions.push({
        section: '80E',
        limit: 'No Limit',
        used: 0,
        remaining: 'Unlimited',
        hint: `Education Loan पर interest की पूरी रकम deduct होती है। कोई limit नहीं है। 8 साल तक claim कर सकते हैं।`,
        instruments: ['Education Loan Interest']
      });
    }

    // ─── Section 80G — Donations ───
    if (!d.sec80G) {
      suggestions.push({
        section: '80G',
        limit: 'Variable',
        used: 0,
        remaining: 'Variable',
        hint: `PM CARES Fund, PM National Relief Fund, या approved NGO को donation दें। 50% या 100% deduction मिलता है।`,
        instruments: ['PM CARES', 'PM National Relief Fund', 'Approved NGO']
      });
    }

    // ─── Home Loan Interest — Section 24(b) ───
    const usedHL = d.homeLoanInterest || 0;
    if (usedHL > 0 && usedHL < 200000) {
      suggestions.push({
        section: '24(b)',
        limit: 200000,
        used: usedHL,
        remaining: 200000 - usedHL,
        hint: `Home Loan Interest पर ₹${(200000 - usedHL).toLocaleString('en-IN')} और claim कर सकते हैं।`,
        instruments: ['Home Loan Interest']
      });
    }

    // ─── HRA — Salaried Employees ───
    if (profile.salaryIncome > 0 && profile.payingRent && !d.hra) {
      suggestions.push({
        section: 'HRA',
        limit: 'Calculated',
        used: 0,
        remaining: 'Calculated',
        hint: `अगर आप किराये पर रहते हैं तो HRA exemption claim करें। Rent receipt और landlord PAN (₹1 लाख+ rent) ज़रूरी है।`,
        instruments: ['Rent Receipt', 'Landlord PAN']
      });
    }

    // ─── Senior Citizen Benefits ───
    if (profile.isSeniorCitizen) {
      suggestions.push({
        section: 'Senior Citizen',
        limit: 'Various',
        used: 0,
        remaining: 'Various',
        hint: `Senior Citizen (60+) को higher exemption limit (₹3 लाख), 80D limit (₹50,000) और 80TTB (₹50,000 bank interest) का benefit मिलता है।`,
        instruments: ['Higher Exemption', '80TTB', '80D Enhanced']
      });
    }

    return {
      totalSuggestions: suggestions.length,
      suggestions,
      summary: suggestions.length > 0
        ? `Harshita AI ने ${suggestions.length} tax-saving opportunities पाई हैं। इन्हें apply करके आप और tax बचा सकते हैं।`
        : `आपने सभी available deductions claim कर लिए हैं। बहुत अच्छा! ✅`
    };
  }
}

module.exports = { TaxSavingEngine };
