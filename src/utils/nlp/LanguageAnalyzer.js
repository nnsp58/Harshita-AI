class LanguageAnalyzer {
  constructor() {
    // Basic mapping of Hinglish/Hindi slangs to standard technical terms
    this.dictionary = {
      // Geometry/Math Mapping
      'ganatv': 'ghanatv',
      'ghanatvv': 'ghanatv',
      'ghnatv': 'ghanatv',
      'ghantv': 'ghanatv',
      'formule': 'formula',
      'frm': 'formula',
      'frmla': 'formula',
      'sutr': 'formula',
      'shutra': 'formula',
      'bhuja': 'side',
      'bhujayen': 'side',
      'kheto': 'plot',
      'khet': 'plot',
      'samne': 'front',
      'pichhe': 'back',
      'piche': 'back',
      'lambaai': 'length',
      'lambai': 'length',
      'chaudaai': 'width',
      'chaudai': 'width',
      'aaytan': 'volume',
      'ayatan': 'volume',
      'jod': 'add',
      'jodo': 'add',
      'guna': 'multiply',
      'bhag': 'divide',
      'ghatao': 'subtract',
      'vritt': 'circle',
      'vrit': 'circle',
      'gola': 'sphere',
      'ayat': 'rectangle',
      
      // Form/Portal Mapping
      'frmm': 'form',
      'bharna': 'fill',
      'bhari': 'fill'
    };

    // Contextual rules: if X is present, change meaning of Y
    this.contextRules = [
      {
        // If query has math-related terms, 'form' inside 'formula' should not be confused.
        // Also if the exact word is "formula", ensure it's not replaced or cut.
        condition: (text) => /(math|geometry|gole|sphere|ghanatv|volume|area|kshetrafal)/i.test(text),
        action: (text) => {
          // If the word "form" appears as an isolated word but the context is math, it might mean formula.
          return text.replace(/\bform\b/gi, 'formula');
        }
      }
    ];
  }

  /**
   * Pre-process natural language text.
   * Fixes typos, applies contextual rules, and normalizes hinglish to standard intents.
   * @param {string} rawText 
   * @returns {string} cleanedText
   */
  analyzeAndClean(rawText) {
    if (!rawText) return '';
    
    let text = rawText.toLowerCase().trim();

    // 1. Contextual Rules (must run before simple dictionary to catch context)
    for (const rule of this.contextRules) {
      if (rule.condition(text)) {
        text = rule.action(text);
      }
    }

    // 2. Dictionary Substitution (Token by token mapping)
    // We split by space to avoid replacing inside words.
    let tokens = text.split(/\s+/);
    tokens = tokens.map(token => {
      // Remove punctuation for matching
      const cleanToken = token.replace(/[^a-z0-9]/gi, '');
      if (this.dictionary[cleanToken]) {
        return token.replace(cleanToken, this.dictionary[cleanToken]);
      }
      return token;
    });

    text = tokens.join(' ');

    return text;
  }
}

// Export as singleton
const languageAnalyzer = new LanguageAnalyzer();
module.exports = { languageAnalyzer, LanguageAnalyzer };
