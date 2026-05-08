/**
 * AgeCalculator - Handles complex age calculations and eligibility checks
 * 
 * Features:
 * - Actual age calculation
 * - EXM Net Age calculation (Age - Service)
 * - Relaxation rules for SC/ST, OBC, PH/PWD
 * - Multi-category support
 */

class AgeCalculator {
  /**
   * Calculate age in years, months, days
   * @param {string} dob - Date of Birth (YYYY-MM-DD)
   * @param {string} onDate - Reference date (usually closing date of job)
   */
  static calculateAge(dob, onDate = new Date().toISOString().split('T')[0]) {
    const birthDate = new Date(dob);
    const refDate = new Date(onDate);

    let years = refDate.getFullYear() - birthDate.getFullYear();
    let months = refDate.getMonth() - birthDate.getMonth();
    let days = refDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  /**
   * Calculate Effective Age for Ex-Servicemen (EXM)
   * Net Age = Actual Age - Service Period
   */
  static calculateExmNetAge(dob, serviceStartDate, serviceEndDate, onDate) {
    const actual = this.calculateAge(dob, onDate);
    const service = this.calculateAge(serviceStartDate, serviceEndDate);

    // Subtract service from actual age
    let netYears = actual.years - service.years;
    let netMonths = actual.months - service.months;
    let netDays = actual.days - service.days;

    if (netDays < 0) {
      netMonths--;
      netDays += 30; // Approx
    }
    if (netMonths < 0) {
      netYears--;
      netMonths += 12;
    }

    return { 
      actualAge: actual, 
      servicePeriod: service, 
      netAge: { years: netYears, months: netMonths, days: netDays } 
    };
  }

  /**
   * Check if candidate is eligible based on age and category
   */
  static isEligible(params) {
    const { 
      dob, 
      category, 
      isExm, 
      isPh,
      minAge, 
      maxAge, 
      onDate,
      serviceStart,
      serviceEnd,
      relaxations = { obc: 3, scst: 5, ph: 10, exm: 3 }
    } = params;

    let effectiveAge;
    let finalMaxAge = maxAge;

    // Apply basic relaxations to Max Age
    if (category === 'obc') finalMaxAge += (relaxations.obc || 0);
    if (category === 'sc' || category === 'st') finalMaxAge += (relaxations.scst || 0);
    if (isPh) finalMaxAge += (relaxations.ph || 0);

    if (isExm && serviceStart && serviceEnd) {
      const exmData = this.calculateExmNetAge(dob, serviceStart, serviceEnd, onDate);
      effectiveAge = exmData.netAge.years;
      // For EXM, usually they get (Max Age + 3 years) as the limit for their Net Age
      finalMaxAge += (relaxations.exm || 3);
    } else {
      effectiveAge = this.calculateAge(dob, onDate).years;
    }

    return {
      eligible: effectiveAge >= minAge && effectiveAge <= finalMaxAge,
      effectiveAge,
      maxAgeLimit: finalMaxAge,
      details: {
        actualAge: this.calculateAge(dob, onDate).years,
        category,
        isExm,
        isPh
      }
    };
  }
}

module.exports = { AgeCalculator };
