/**
 * SpamFilter Engine
 * 
 * Detects incoming promotional and spam messages to block them or handle them appropriately.
 */

class SpamFilter {
  constructor() {
    this.promoKeywords = [
      'buy now', 'discount', 'offer', 'sale', 'click here', 
      'subscribe now', 'free gift', 'claim your', 'limited time',
      'promo', 'investment', 'crypto', 'bitcoin', 'earn money',
      'घर बैठे पैसे कमाएं', 'लॉटरी', 'ऑफर', 'जीतें', 'मुफ्त'
    ];
    this.linkPattern = /(https?:\/\/[^\s]+)/i;
  }

  /**
   * Evaluates if a message is a promotional/spam message.
   * @param {string} text - The incoming message text.
   * @returns {Object} - { isPromo: boolean, reason: string }
   */
  evaluate(text) {
    if (!text) return { isPromo: false, reason: '' };
    
    const lowerText = text.toLowerCase();
    
    // Check for promotional keywords
    let matchCount = 0;
    for (const kw of this.promoKeywords) {
      if (lowerText.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }

    // Heuristics for spam
    const hasLink = this.linkPattern.test(text);

    // If there's a link AND promotional keywords, it's highly likely to be promo
    if (hasLink && matchCount > 0) {
      return { isPromo: true, reason: 'Contains link and promotional keywords' };
    }

    // If there are multiple promotional keywords (2 or more)
    if (matchCount >= 2) {
      return { isPromo: true, reason: 'Contains multiple promotional keywords' };
    }

    return { isPromo: false, reason: '' };
  }
}

module.exports = { SpamFilter };
