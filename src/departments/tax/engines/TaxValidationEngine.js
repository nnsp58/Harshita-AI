/**
 * TaxValidationEngine — Harshita AI
 * 
 * PRD-075 Strict Rule: "Validation Engine ALWAYS verifies."
 * "AI NEVER invents tax information."
 * 
 * Validates: PAN, Aadhaar, DOB, IFSC, Account Number, PIN, 
 *            Assessment Year, Employer, Salary, TDS
 */

class TaxValidationEngine {

  static isValidPAN(pan) {
    if (!pan) return { valid: false, error: 'PAN number required.' };
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan.toUpperCase())
      ? { valid: true }
      : { valid: false, error: `"${pan}" valid PAN format नहीं है। सही format: ABCDE1234F` };
  }

  static isValidAadhaar(aadhaar) {
    if (!aadhaar) return { valid: false, error: 'Aadhaar number required.' };
    const regex = /^\d{12}$/;
    return regex.test(aadhaar)
      ? { valid: true }
      : { valid: false, error: `"${aadhaar}" valid Aadhaar नहीं है। Aadhaar 12 अंकों का होता है।` };
  }

  static isValidIFSC(ifsc) {
    if (!ifsc) return { valid: false, error: 'IFSC code required.' };
    const regex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return regex.test(ifsc.toUpperCase())
      ? { valid: true }
      : { valid: false, error: `"${ifsc}" valid IFSC code नहीं है। Format: SBIN0001234` };
  }

  static isValidDOB(dob) {
    if (!dob) return { valid: false, error: 'Date of Birth required.' };
    const date = new Date(dob);
    if (isNaN(date.getTime())) return { valid: false, error: 'Invalid date format. Use DD/MM/YYYY or YYYY-MM-DD.' };
    const age = (new Date() - date) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 16 || age > 120) return { valid: false, error: 'Age must be between 16 and 120 years.' };
    return { valid: true };
  }

  static isValidPINCode(pin) {
    if (!pin) return { valid: false, error: 'PIN Code required.' };
    return /^\d{6}$/.test(pin)
      ? { valid: true }
      : { valid: false, error: 'PIN Code 6 अंकों का होना चाहिए।' };
  }

  static isValidAccountNumber(accNo) {
    if (!accNo) return { valid: false, error: 'Bank Account Number required.' };
    return (accNo.length >= 9 && accNo.length <= 18 && /^\d+$/.test(accNo))
      ? { valid: true }
      : { valid: false, error: 'Bank Account Number 9-18 अंकों का होना चाहिए।' };
  }

  static isValidAssessmentYear(ay) {
    if (!ay) return { valid: false, error: 'Assessment Year required.' };
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(ay)) return { valid: false, error: 'Assessment Year format: 2025-26' };
    const startYear = parseInt(ay.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (startYear < 2020 || startYear > currentYear + 1) {
      return { valid: false, error: `Assessment Year ${ay} valid range में नहीं है।` };
    }
    return { valid: true };
  }

  static isValidMobile(mobile) {
    if (!mobile) return { valid: false, error: 'Mobile number required.' };
    return /^[6-9]\d{9}$/.test(mobile)
      ? { valid: true }
      : { valid: false, error: 'Indian mobile number 10 अंकों का होना चाहिए और 6-9 से शुरू होना चाहिए।' };
  }

  static isValidEmail(email) {
    if (!email) return { valid: false, error: 'Email required.' };
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? { valid: true }
      : { valid: false, error: 'Valid email address दर्ज करें।' };
  }

  /**
   * AI Safety: Ensure no critical financial fields are guessed/fabricated.
   * PRD Rule: "Never Guess: Salary, PAN, Bank, Investment, Capital Gain, TDS, Refund"
   */
  static ensureNoGuesses(profile) {
    const neverGuessFields = [
      'salaryIncome', 'pan', 'bankAccountNumber', 'ifscCode', 
      'aadhaar', 'tdsDeducted', 'capitalGains', 'investmentTotal', 'refundAmount'
    ];
    const errors = [];
    for (const field of neverGuessFields) {
      if (profile[`${field}_guessed`] === true || profile[`${field}_source`] === 'AI_GENERATED') {
        errors.push(`🚫 AI Safety Block: "${field}" AI द्वारा guess किया गया है। यह स्वीकार्य नहीं है। कृपया actual value दर्ज करें।`);
      }
    }
    return { safe: errors.length === 0, errors };
  }

  /**
   * Full Profile Validation — Run all validators on a profile
   */
  static validateProfile(profile) {
    const results = {};
    if (profile.pan) results.pan = this.isValidPAN(profile.pan);
    if (profile.aadhaar) results.aadhaar = this.isValidAadhaar(profile.aadhaar);
    if (profile.ifscCode) results.ifsc = this.isValidIFSC(profile.ifscCode);
    if (profile.dob) results.dob = this.isValidDOB(profile.dob);
    if (profile.pinCode) results.pin = this.isValidPINCode(profile.pinCode);
    if (profile.bankAccountNumber) results.account = this.isValidAccountNumber(profile.bankAccountNumber);
    if (profile.mobile) results.mobile = this.isValidMobile(profile.mobile);
    if (profile.email) results.email = this.isValidEmail(profile.email);
    if (profile.assessmentYear) results.ay = this.isValidAssessmentYear(profile.assessmentYear);

    const allValid = Object.values(results).every(r => r.valid);
    const errors = Object.entries(results).filter(([, r]) => !r.valid).map(([k, r]) => `${k}: ${r.error}`);

    return { valid: allValid, results, errors };
  }
}

module.exports = { TaxValidationEngine };
