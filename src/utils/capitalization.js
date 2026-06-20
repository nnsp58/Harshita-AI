/**
 * Capitalization Helper Utility
 * 
 * Automatically capitalizes names, villages, districts, states, and proper nouns.
 * E.g., "nar narayan singh" -> "Nar Narayan Singh"
 * "meer singh" -> "Meer Singh"
 * "sikhera" -> "Sikhera"
 * "bulandshahr" -> "Bulandshahr"
 */

function capitalizeWord(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function autoCapitalizeText(text) {
  if (!text || typeof text !== 'string') return text;

  // Pattern match names / village / city / state names and capitalize them
  // E.g., "nar narayan singh", "meer singh", "sikhera", "bulandshahr", "uttar pradesh"
  // Let's replace words in the string that match common name/location patterns
  const ignoreList = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'se', 'ko', 'me', 'ki', 'ke', 'ka', 'ne', 'hi', 'ho', 'h', 'hai', 'he', 'hu', 'hoon', 'tha', 'thi', 'the', 'bhi', 'kya', 'kuch', 'aur', 'par',
    'putra', 'putri', 'pita', 'naam', 'village', 'gram', 'post', 'district', 'dist', 'zila', 'state', 'pin', 'mobile', 'phone', 'email'
  ]);

  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token; // whitespace
    const cleanWord = token.replace(/[^a-zA-Z]/g, '');
    const suffixPrefix = token.replace(/[a-zA-Z]/g, '');
    
    if (cleanWord.length === 0) return token;
    
    const lowerWord = cleanWord.toLowerCase();
    if (ignoreList.has(lowerWord)) {
      return token;
    }
    
    // Capitalize if it starts a word or is part of a proper noun pattern
    const parts = token.split('-');
    const capitalizedParts = parts.map(p => {
      const w = p.replace(/[^a-zA-Z]/g, '');
      if (w.length === 0) return p;
      if (ignoreList.has(w.toLowerCase())) return p;
      const cap = capitalizeWord(w);
      return p.replace(w, cap);
    });
    return capitalizedParts.join('-');
  }).join('');
}

function eliminatePlaceholders(text) {
  if (!text || typeof text !== 'string') return text;
  return text
    .replace(/\[CLIENT\s*NAME\]/gi, '____________________')
    .replace(/\[RESPONDENT\s*NAME\]/gi, '____________________')
    .replace(/\[ADVOCATE\s*NAME\]/gi, '____________________')
    .replace(/\[SPECIFIC\s*ACTION\]/gi, '____________________')
    .replace(/\[ADDRESS\]/gi, '____________________')
    .replace(/\[FATHER\s*NAME\]/gi, '____________________')
    .replace(/\[NAME\]/gi, '____________________')
    .replace(/\[DATE\]/gi, '____________________')
    .replace(/\[AMOUNT\]/gi, '____________________')
    .replace(/\[[^\]]+\]/g, '____________________');
}

module.exports = {
  capitalizeWord,
  autoCapitalizeText,
  eliminatePlaceholders
};
