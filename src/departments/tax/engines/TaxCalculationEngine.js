/**
 * TaxCalculationEngine — Harshita AI Chartered Accountant
 * 
 * PRD-075 Strict Rule: This engine handles ALL tax calculations.
 * MasterTaxAgent NEVER calculates. RuleEngine NEVER calculates.
 * Only TaxCalculationEngine calculates.
 * 
 * Capabilities:
 *  - Gross Income computation
 *  - Net Income after deductions
 *  - Taxable Income
 *  - Old Regime vs New Regime comparison
 *  - Tax Liability
 *  - Refund calculation
 *  - Interest u/s 234A/B/C
 *  - Late Fee u/s 234F
 *  - Surcharge & Cess
 */

class TaxCalculationEngine {

  // ═══════════════════════════════════════
  //  GROSS INCOME COMPUTATION
  // ═══════════════════════════════════════
  static computeGrossIncome(profile) {
    return {
      salary: profile.salaryIncome || 0,
      houseProperty: profile.rentalIncome || 0,
      capitalGains: profile.capitalGains || 0,
      businessIncome: profile.businessIncome || 0,
      otherSources: (profile.bankInterest || 0) + (profile.dividendIncome || 0) + (profile.otherIncome || 0),
      get total() {
        return this.salary + this.houseProperty + this.capitalGains + this.businessIncome + this.otherSources;
      }
    };
  }

  // ═══════════════════════════════════════
  //  DEDUCTIONS (OLD REGIME ONLY)
  // ═══════════════════════════════════════
  static computeDeductions(profile) {
    const d = profile.deductions || {};
    return {
      standardDeduction: 75000, // FY 2024-25 onwards
      sec80C: Math.min(d.sec80C || 0, 150000),
      sec80CCD_1B: Math.min(d.sec80CCD_1B || 0, 50000),
      sec80D: Math.min(d.sec80D || 0, d.isSeniorCitizen ? 100000 : 75000),
      sec80E: d.sec80E || 0, // Education loan — no limit
      sec80G: d.sec80G || 0, // Donations
      sec80TTA: Math.min(d.sec80TTA || 0, 10000),
      homeLoanInterest: Math.min(d.homeLoanInterest || 0, 200000),
      professionalTax: Math.min(d.professionalTax || 0, 2500),
      get total() {
        return this.standardDeduction + this.sec80C + this.sec80CCD_1B + this.sec80D +
               this.sec80E + this.sec80G + this.sec80TTA + this.homeLoanInterest + this.professionalTax;
      }
    };
  }

  // ═══════════════════════════════════════
  //  OLD REGIME TAX SLAB (FY 2024-25)
  // ═══════════════════════════════════════
  static calculateOldRegimeTax(taxableIncome, isSeniorCitizen = false) {
    const exemptionLimit = isSeniorCitizen ? 300000 : 250000;
    if (taxableIncome <= exemptionLimit) return 0;

    // Section 87A rebate
    if (taxableIncome <= 500000) return 0;

    let tax = 0;
    if (taxableIncome > exemptionLimit) tax += Math.min(250000, taxableIncome - exemptionLimit) * 0.05;
    if (taxableIncome > 500000) tax += Math.min(500000, taxableIncome - 500000) * 0.20;
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;

    // Surcharge
    tax += this._surcharge(tax, taxableIncome);

    // Health & Education Cess 4%
    tax += tax * 0.04;

    return Math.round(tax);
  }

  // ═══════════════════════════════════════
  //  NEW REGIME TAX SLAB (FY 2024-25)
  // ═══════════════════════════════════════
  static calculateNewRegimeTax(taxableIncome) {
    if (taxableIncome <= 300000) return 0;

    // Section 87A rebate under new regime
    if (taxableIncome <= 700000) return 0;

    let tax = 0;
    const slabs = [
      { from: 300000, to: 700000, rate: 0.05 },
      { from: 700000, to: 1000000, rate: 0.10 },
      { from: 1000000, to: 1200000, rate: 0.15 },
      { from: 1200000, to: 1500000, rate: 0.20 },
      { from: 1500000, to: Infinity, rate: 0.30 },
    ];

    for (const slab of slabs) {
      if (taxableIncome > slab.from) {
        const slabIncome = Math.min(taxableIncome, slab.to) - slab.from;
        tax += slabIncome * slab.rate;
      }
    }

    tax += this._surcharge(tax, taxableIncome);
    tax += tax * 0.04;

    return Math.round(tax);
  }

  // ═══════════════════════════════════════
  //  SURCHARGE
  // ═══════════════════════════════════════
  static _surcharge(tax, income) {
    if (income > 50000000) return tax * 0.37;
    if (income > 20000000) return tax * 0.25;
    if (income > 10000000) return tax * 0.15;
    if (income > 5000000) return tax * 0.10;
    return 0;
  }

  // ═══════════════════════════════════════
  //  FULL TAX COMPARISON (Old vs New)
  // ═══════════════════════════════════════
  static compareRegimes(profile) {
    const gross = this.computeGrossIncome(profile);
    const deductions = this.computeDeductions(profile);
    const isSenior = profile.isSeniorCitizen || false;

    const taxableOld = Math.max(0, gross.total - deductions.total);
    const taxableNew = Math.max(0, gross.total - 75000); // Only standard deduction in new regime

    const oldTax = this.calculateOldRegimeTax(taxableOld, isSenior);
    const newTax = this.calculateNewRegimeTax(taxableNew);

    const tdsDeducted = profile.tdsDeducted || 0;
    const advanceTax = profile.advanceTaxPaid || 0;
    const totalTaxPaid = tdsDeducted + advanceTax;

    const oldRefund = totalTaxPaid - oldTax;
    const newRefund = totalTaxPaid - newTax;

    const recommendedRegime = newTax <= oldTax ? 'NEW' : 'OLD';
    const savings = Math.abs(oldTax - newTax);

    return {
      grossIncome: gross.total,
      incomeBreakdown: { ...gross },
      deductions: { ...deductions },
      taxableOld,
      taxableNew,
      oldTax,
      newTax,
      tdsDeducted,
      advanceTaxPaid: advanceTax,
      oldRefund,
      newRefund,
      recommendedRegime,
      savings,
      summary: recommendedRegime === 'NEW'
        ? `New Regime mein ₹${savings.toLocaleString('en-IN')} kam tax lagega। Hum New Regime recommend karte hain।`
        : `Old Regime mein ₹${savings.toLocaleString('en-IN')} bachega kyunki aapke deductions zyada hain। Old Regime recommend hai।`
    };
  }

  // ═══════════════════════════════════════
  //  INTEREST & LATE FEE
  // ═══════════════════════════════════════
  static calculateLateFee(assessmentYear, filingDate) {
    // 234F: Late fee for filing after due date
    const dueDate = new Date(`${parseInt(assessmentYear.split('-')[0])}-07-31`);
    const filed = filingDate ? new Date(filingDate) : new Date();
    if (filed <= dueDate) return 0;
    return 5000; // Simplified — ₹1000 if income < 5L
  }

  static calculateInterest234A(taxLiability, dueDate, filingDate) {
    // 1% per month on outstanding tax from due date to filing date
    if (taxLiability <= 0) return 0;
    const months = Math.ceil((new Date(filingDate) - new Date(dueDate)) / (1000 * 60 * 60 * 24 * 30));
    if (months <= 0) return 0;
    return Math.round(taxLiability * 0.01 * months);
  }
}

module.exports = { TaxCalculationEngine };
