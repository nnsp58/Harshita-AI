const crypto = require('crypto');

// The encryption key must be 32 bytes for AES-256-CBC.
// In production, this should come from process.env.TAX_SECRET_KEY
const ENCRYPTION_KEY = process.env.TAX_SECRET_KEY || 'default_32_byte_secret_key_for_tax!'; 
const IV_LENGTH = 16; 

class TaxSecurityEngine {
  
  static encrypt(text) {
    if (!text) return null;
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
      console.error('[TaxSecurityEngine] Encryption error:', e.message);
      return null;
    }
  }

  static decrypt(text) {
    if (!text) return null;
    try {
      const textParts = text.split(':');
      if (textParts.length !== 2) return text; // Probably not encrypted
      
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = Buffer.from(textParts.join(':'), 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (e) {
      console.error('[TaxSecurityEngine] Decryption error:', e.message);
      return null;
    }
  }

  static maskPan(pan) {
    if (!pan || pan.length !== 10) return pan;
    return pan.substring(0, 2) + '*****' + pan.substring(7);
  }

  static maskAadhaar(aadhaar) {
    if (!aadhaar || aadhaar.length !== 12) return aadhaar;
    return '********' + aadhaar.substring(8);
  }
  
  static maskBankAccount(accountStr) {
    if (!accountStr || accountStr.length < 4) return accountStr;
    return '*'.repeat(accountStr.length - 4) + accountStr.slice(-4);
  }

}

module.exports = { TaxSecurityEngine };
