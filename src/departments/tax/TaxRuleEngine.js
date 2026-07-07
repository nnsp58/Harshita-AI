class TaxRuleEngine {
  /**
   * Deterministically determine ITR Type based on user income sources.
   * Do NOT guess.
   */
  static determineItrType(profile) {
    if (!profile) return 'UNKNOWN';

    // Parse income sources from profile
    const hasBusiness = profile.business === true || (profile.occupation && profile.occupation.toLowerCase().includes('business'));
    const hasCapitalGain = profile.capital_gain === true;
    const isPresumptive = profile.presumptive_business === true;
    
    // ITR-4: Presumptive Business
    if (isPresumptive) return 'ITR-4';
    
    // ITR-3: General Business
    if (hasBusiness) return 'ITR-3';

    // ITR-2: Salary + Capital Gain
    if (hasCapitalGain) return 'ITR-2';

    // ITR-1: Default Salary/Other sources (up to 50L)
    // Basic fallback for standard employees
    if (profile.occupation === 'salary' || profile.employer) return 'ITR-1';

    return 'UNKNOWN';
  }
}

module.exports = { TaxRuleEngine };
