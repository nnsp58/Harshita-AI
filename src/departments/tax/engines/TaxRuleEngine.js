/**
 * TaxRuleEngine — ITR Form Determination ONLY
 * 
 * PRD-075 Strict Rule: "LLM NEVER selects ITR. Rule Engine decides."
 * This engine contains ZERO calculations.
 * It ONLY determines which ITR form applies based on income sources.
 */

class TaxRuleEngine {

  /**
   * Determine the correct ITR Form based on income sources.
   * NEVER guess. NEVER calculate. ONLY classify.
   * 
   * ITR-1 (Sahaj):  Salary + One House Property + Other Sources (up to ₹50L)
   * ITR-2:          Salary + Capital Gains + Multiple House Property + Foreign Income
   * ITR-3:          Business / Profession Income
   * ITR-4 (Sugam):  Presumptive Business Income (Sec 44AD/44ADA/44AE)
   */
  static determineItrType(profile) {
    if (!profile) return { itr: 'UNKNOWN', reason: 'No profile data provided.' };

    // ─── ITR-4: Presumptive Business ───
    if (profile.presumptiveIncome > 0 || profile.hasPresumptiveBusiness) {
      return { itr: 'ITR-4', reason: 'Presumptive Business Income detected (Sec 44AD/44ADA/44AE).' };
    }

    // ─── ITR-3: General Business / Profession ───
    if (profile.businessIncome > 0 || profile.hasBusiness || profile.hasFreelance) {
      return { itr: 'ITR-3', reason: 'Business or Professional Income detected.' };
    }

    // ─── ITR-2: Capital Gains / Foreign Income / Multiple House Property ───
    if (profile.capitalGains > 0 || profile.hasCapitalGains ||
        profile.foreignIncome > 0 || profile.hasForeignIncome ||
        profile.multipleHouseProperty || profile.hasMultipleHouseProperty ||
        (profile.salaryIncome > 0 && profile.salaryIncome > 5000000) ||
        profile.agriculturalIncome > 5000) {
      return { itr: 'ITR-2', reason: 'Capital Gains, Foreign Income, or Multiple House Property detected, or salary exceeds ₹50L.' };
    }

    // ─── ITR-1: Default Salaried / Pension / Single House Property ───
    if (profile.salaryIncome > 0 || profile.hasSalary ||
        profile.pensionIncome > 0 || profile.hasPension ||
        profile.employer) {
      return { itr: 'ITR-1', reason: 'Salary / Pension / Single House Property only. Total income under ₹50L.' };
    }

    return { itr: 'UNKNOWN', reason: 'Income source could not be determined. More information needed.' };
  }
}

module.exports = { TaxRuleEngine };
