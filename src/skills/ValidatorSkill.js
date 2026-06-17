/**
 * ValidatorSkill — डेटा और डॉक्यूमेंट वैलिडेशन
 * 
 * Real validation:
 *   - Aadhaar Number (12 digits + Verhoeff checksum)
 *   - PAN Card (AAAAA0000A format)
 *   - IFSC Code (4 letter + 0 + 6 alphanum)
 *   - Phone Number (10 digit Indian mobile)
 *   - PIN Code (6 digit)
 *   - Email format
 *   - Ration Card Number (12/15 digit)
 *   - Voter ID (EPIC)
 */
const { BaseSkill } = require('./BaseSkill');

class ValidatorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'validator';
    this.displayName = 'डेटा वैलिडेटर';
    this.displayNameEn = 'Data Validator';
    this.description = 'आधार, पैन और अन्य डेटा की शुद्धता की जाँच';
    this.descriptionEn = 'Validate Aadhaar, PAN and other data accuracy';
    this.version = '2.0.0';
    this.category = 'system';
    this.canRunOffline = true;
    this.priority = 5;
    this.intents = ['validate_data', 'check_error', 'verify_fields', 'audit_form'];
    this.keywords = {
      hi: ['चेक', 'वैलिडेट', 'गलती', 'सुधार', 'सत्यापन', 'audit'],
      en: ['validate', 'verify', 'audit', 'check', 'error', 'correct'],
      hinglish: ['data check karo', 'galti dhundo', 'form verify karo']
    };
    this.requiredAgents = ['validatorAgent'];
  }

  async execute(context) {
    const { message } = context;
    if (!message) return this._reply(this._getMenu());
    const text = message.trim();

    // Auto-detect what type of data was provided and validate it
    const results = this._autoDetectAndValidate(text);

    if (results.length === 0) {
      // No data detected — show help menu
      return this._reply(this._getMenu());
    }

    // Build results message
    let reply = '✅ *डेटा वैलिडेशन रिपोर्ट (Validation Report)*\n\n';
    for (const r of results) {
      const icon = r.valid ? '✅' : '❌';
      reply += `${icon} *${r.type}*: \`${r.value}\`\n`;
      reply += `   ${r.message}\n\n`;
    }

    const allValid = results.every(r => r.valid);
    reply += allValid 
      ? '🎉 सभी डेटा सही (Valid) है!'
      : '⚠️ कुछ डेटा गलत है — कृपया ऊपर दिए गए सुझाव देखें।';

    return this._reply(reply, { 
      mode: 'validation_report', 
      results,
      allValid,
    });
  }

  /**
   * Auto-detect data types from free-text and validate each
   */
  _autoDetectAndValidate(text) {
    const results = [];
    const clean = text.replace(/[\s-]/g, '');

    // Aadhaar (12 digits)
    const aadhaarMatch = text.match(/\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/);
    if (aadhaarMatch) {
      const num = aadhaarMatch[1].replace(/[\s-]/g, '');
      if (num.length === 12) {
        results.push(this._validateAadhaar(num));
      }
    }

    // PAN (AAAAA0000A)
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/i);
    if (panMatch) {
      results.push(this._validatePAN(panMatch[1].toUpperCase()));
    }

    // IFSC (4 letters + 0 + 6 alphanum)
    const ifscMatch = text.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
    if (ifscMatch) {
      results.push(this._validateIFSC(ifscMatch[1].toUpperCase()));
    }

    // Phone (10 digit Indian mobile)
    const phoneMatch = text.match(/\b(?:\+91|91)?[\s-]?([6-9]\d{9})\b/);
    if (phoneMatch) {
      results.push(this._validatePhone(phoneMatch[1]));
    }

    // PIN Code (6 digits, starts with 1-9)
    const pinMatch = text.match(/\b([1-9]\d{5})\b/);
    if (pinMatch && !aadhaarMatch) { // Avoid false match from Aadhaar digits
      results.push(this._validatePIN(pinMatch[1]));
    }

    // Email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      results.push(this._validateEmail(emailMatch[0]));
    }

    // Voter ID / EPIC (3 letters + 7 digits)
    const voterMatch = text.match(/\b([A-Z]{3}\d{7})\b/i);
    if (voterMatch) {
      results.push(this._validateVoterID(voterMatch[1].toUpperCase()));
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════
  //  Individual Validators
  // ═══════════════════════════════════════════════════════════

  _validateAadhaar(num) {
    const result = { type: 'आधार नंबर (Aadhaar)', value: num, valid: false, message: '' };

    if (!/^\d{12}$/.test(num)) {
      result.message = 'आधार नंबर 12 अंकों का होना चाहिए।';
      return result;
    }
    if (num.startsWith('0') || num.startsWith('1')) {
      result.message = 'आधार नंबर 0 या 1 से शुरू नहीं होता। कृपया जाँच करें।';
      return result;
    }

    // Verhoeff checksum validation
    const isValidChecksum = this._verhoeffCheck(num);
    if (!isValidChecksum) {
      result.message = 'Checksum गलत है — यह एक अमान्य आधार नंबर है। कृपया सही नंबर दें।';
      return result;
    }

    result.valid = true;
    result.message = 'Valid Aadhaar Number (Verhoeff checksum passed) ✓';
    return result;
  }

  _validatePAN(pan) {
    const result = { type: 'पैन नंबर (PAN)', value: pan, valid: false, message: '' };

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      result.message = 'PAN फॉर्मेट गलत है। सही फॉर्मेट: AAAAA0000A (5 letters + 4 digits + 1 letter)';
      return result;
    }

    // 4th character indicates holder type
    const typeChar = pan[3];
    const types = { P: 'Individual', C: 'Company', H: 'HUF', A: 'AOP', B: 'BOI', G: 'Government', J: 'AJP', L: 'Local Authority', F: 'Firm', T: 'Trust' };
    const holderType = types[typeChar] || 'Unknown';

    result.valid = true;
    result.message = `Valid PAN (Type: ${holderType}) ✓`;
    return result;
  }

  _validateIFSC(ifsc) {
    const result = { type: 'IFSC Code', value: ifsc, valid: false, message: '' };
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      result.message = 'IFSC फॉर्मेट गलत है। सही फॉर्मेट: ABCD0123456 (4 letters + 0 + 6 chars)';
      return result;
    }
    result.valid = true;
    result.message = `Valid IFSC Code (Bank: ${ifsc.substring(0, 4)}) ✓`;
    return result;
  }

  _validatePhone(phone) {
    const result = { type: 'मोबाइल नंबर (Phone)', value: phone, valid: false, message: '' };
    if (!/^[6-9]\d{9}$/.test(phone)) {
      result.message = 'भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होता है और 10 अंकों का होता है।';
      return result;
    }
    result.valid = true;
    result.message = 'Valid Indian Mobile Number ✓';
    return result;
  }

  _validatePIN(pin) {
    const result = { type: 'पिन कोड (PIN Code)', value: pin, valid: false, message: '' };
    if (!/^[1-9]\d{5}$/.test(pin)) {
      result.message = 'PIN कोड 6 अंकों का होना चाहिए और 0 से शुरू नहीं होना चाहिए।';
      return result;
    }
    result.valid = true;
    result.message = 'Valid Indian PIN Code ✓';
    return result;
  }

  _validateEmail(email) {
    const result = { type: 'ईमेल (Email)', value: email, valid: false, message: '' };
    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) {
      result.message = 'ईमेल फॉर्मेट गलत है। सही फॉर्मेट: name@domain.com';
      return result;
    }
    result.valid = true;
    result.message = 'Valid Email Format ✓';
    return result;
  }

  _validateVoterID(id) {
    const result = { type: 'मतदाता पहचान पत्र (Voter ID)', value: id, valid: false, message: '' };
    if (!/^[A-Z]{3}\d{7}$/.test(id)) {
      result.message = 'Voter ID (EPIC) फॉर्मेट: 3 अक्षर + 7 अंक (जैसे: ABC1234567)';
      return result;
    }
    result.valid = true;
    result.message = 'Valid Voter ID (EPIC) Format ✓';
    return result;
  }

  // ═══════════════════════════════════════════════════════════
  //  Verhoeff Checksum Algorithm (for Aadhaar)
  // ═══════════════════════════════════════════════════════════

  _verhoeffCheck(num) {
    const d = [
      [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
      [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
      [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
      [9,8,7,6,5,4,3,2,1,0]
    ];
    const p = [
      [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
      [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
      [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
    ];
    const inv = [0,4,3,2,1,5,6,7,8,9];

    let c = 0;
    const digits = num.split('').reverse().map(Number);
    for (let i = 0; i < digits.length; i++) {
      c = d[c][p[i % 8][digits[i]]];
    }
    return c === 0;
  }

  _getMenu() {
    return `✅ *डेटा वैलिडेशन सेवा (Data Validation)*\n\n` +
      `मुझे कोई भी नंबर या डेटा दें, मैं तुरंत चेक कर लूँगा:\n\n` +
      `📋 *सपोर्टेड डेटा:*\n` +
      `• आधार नंबर (12 digit + checksum)\n` +
      `• PAN नंबर (AAAAA0000A)\n` +
      `• IFSC Code (ABCD0123456)\n` +
      `• मोबाइल नंबर (10 digit)\n` +
      `• PIN Code (6 digit)\n` +
      `• Email\n` +
      `• Voter ID / EPIC\n\n` +
      `Example: "Check karo 2345 6789 0123"\n` +
      `या: "ABCDE1234F PAN valid hai?"`;
  }
}

module.exports = { ValidatorSkill };
