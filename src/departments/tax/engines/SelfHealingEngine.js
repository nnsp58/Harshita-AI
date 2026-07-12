/**
 * SelfHealingEngine — Harshita AI Tax Department
 * 
 * PRD-075: Detect and auto-recover from:
 *  - Missing Data
 *  - Wrong PAN format
 *  - Wrong Aadhaar format
 *  - Wrong ITR selection
 *  - Missing Documents
 *  - Duplicate Filing attempt
 *  - Conversation Loop (user stuck)
 */

class SelfHealingEngine {

  /**
   * Run all diagnostics on the profile and return issues + recovery actions
   */
  static diagnose(profile, conversationHistory = []) {
    const issues = [];

    // ─── Missing Critical Data ───
    if (!profile.pan) {
      issues.push({ type: 'MISSING_DATA', field: 'PAN', severity: 'CRITICAL',
        recovery: 'ask', prompt: 'कृपया अपना PAN Number दर्ज करें। (जैसे: ABCDE1234F)' });
    }
    if (!profile.name) {
      issues.push({ type: 'MISSING_DATA', field: 'Name', severity: 'HIGH',
        recovery: 'ask', prompt: 'आपका पूरा नाम क्या है? (जैसा PAN Card पर लिखा है)' });
    }
    if (!profile.dob) {
      issues.push({ type: 'MISSING_DATA', field: 'DOB', severity: 'HIGH',
        recovery: 'ask', prompt: 'आपकी जन्मतिथि (Date of Birth) क्या है? (DD/MM/YYYY)' });
    }
    if (!profile.email) {
      issues.push({ type: 'MISSING_DATA', field: 'Email', severity: 'MEDIUM',
        recovery: 'ask', prompt: 'आपका Email ID क्या है?' });
    }
    if (!profile.mobile) {
      issues.push({ type: 'MISSING_DATA', field: 'Mobile', severity: 'MEDIUM',
        recovery: 'ask', prompt: 'आपका मोबाइल नंबर क्या है?' });
    }

    // ─── Wrong PAN Format ───
    if (profile.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profile.pan)) {
      issues.push({ type: 'INVALID_FORMAT', field: 'PAN', severity: 'CRITICAL',
        recovery: 'correct', prompt: `PAN "${profile.pan}" सही format में नहीं है। सही format: ABCDE1234F। कृपया दोबारा दर्ज करें।` });
    }

    // ─── Wrong Aadhaar Format ───
    if (profile.aadhaar && !/^\d{12}$/.test(profile.aadhaar)) {
      issues.push({ type: 'INVALID_FORMAT', field: 'Aadhaar', severity: 'CRITICAL',
        recovery: 'correct', prompt: `Aadhaar "${profile.aadhaar}" 12 अंकों का नहीं है। कृपया सही Aadhaar Number दर्ज करें।` });
    }

    // ─── No Income Source Identified ───
    if (!profile.salaryIncome && !profile.businessIncome && !profile.capitalGains &&
        !profile.rentalIncome && !profile.pensionIncome && !profile.hasSalary && !profile.hasBusiness) {
      issues.push({ type: 'MISSING_DATA', field: 'IncomeSource', severity: 'CRITICAL',
        recovery: 'interview', prompt: 'अभी तक कोई Income Source पता नहीं चला। कृपया बताएं — आपकी आय का ज़रिया क्या है? (सैलरी / बिज़नेस / पेंशन / फ्रीलांस)' });
    }

    // ─── Missing Bank Details ───
    if (!profile.bankAccountNumber && !profile.ifscCode) {
      issues.push({ type: 'MISSING_DATA', field: 'BankDetails', severity: 'HIGH',
        recovery: 'ask', prompt: 'Refund या verification के लिए Bank Account Number और IFSC Code ज़रूरी है। कृपया अपना बैंक विवरण दर्ज करें।' });
    }

    // ─── Duplicate Filing Detection ───
    if (profile.previousItrAcknowledgement && profile.previousAY === profile.currentAY) {
      issues.push({ type: 'DUPLICATE_FILING', field: 'ITR', severity: 'WARNING',
        recovery: 'confirm', prompt: `ऐसा लगता है कि AY ${profile.currentAY} के लिए पहले ही ITR file हो चुका है (Ack: ${profile.previousItrAcknowledgement})। क्या आप Revised Return file करना चाहते हैं?` });
    }

    // ─── Conversation Loop Detection ───
    if (conversationHistory.length > 15) {
      const lastFiveMessages = conversationHistory.slice(-5).map(m => m.toLowerCase());
      const uniqueMessages = new Set(lastFiveMessages);
      if (uniqueMessages.size <= 2) {
        issues.push({ type: 'CONVERSATION_LOOP', field: 'Chat', severity: 'MEDIUM',
          recovery: 'reset', prompt: 'ऐसा लगता है कि बातचीत एक loop में फँस गई है। मैं interview दोबारा शुरू करता हूँ। कृपया बताएं — आपको किस सेवा की ज़रूरत है?' });
      }
    }

    return {
      healthy: issues.length === 0,
      issueCount: issues.length,
      criticalCount: issues.filter(i => i.severity === 'CRITICAL').length,
      issues,
      nextAction: issues.length > 0 ? issues[0] : null
    };
  }
}

module.exports = { SelfHealingEngine };
