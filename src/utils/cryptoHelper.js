// src/utils/cryptoHelper.js - Cryptography Helper for Secure Key Storage
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.JWT_SECRET || 'harshita-ai-fallback-secret-key-32chars';

/**
 * Encrypt a text string
 * @param {string} text 
 * @returns {string}
 */
function encrypt(text) {
  if (!text) return '';
  const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a text string
 * @param {string} text 
 * @returns {string}
 */
function decrypt(text) {
  if (!text) return '';
  try {
    const parts = text.split(':');
    if (parts.length < 2) return '';
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    console.error('Decryption failed:', e.message);
    return '';
  }
}

module.exports = { encrypt, decrypt };
