// frontend/src/utils/DocumentClassifier.js

export const OutputMode = {
  CHAT: 'CHAT',
  DOCUMENT: 'DOCUMENT',
  PDF: 'PDF',
  DOCX: 'DOCX',
  PRINT: 'PRINT'
};

const DOCUMENT_KEYWORDS = [
  'notice',
  'affidavit',
  'agreement',
  'deed',
  'will',
  'noc',
  'power of attorney',
  'application',
  'complaint',
  'declaration',
  'contract',
  'undertaking',
  'wasiyat',
  'napaas',
  'shapath'
];

/**
 * Classifies text (prompt or response) to determine if it relates to a document.
 * @param {string} text - The input text to analyze.
 * @returns {boolean} True if the text indicates a document.
 */
export function isDocumentType(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  // Check if any keyword matches
  return DOCUMENT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Classifies the prompt to determine target response mode.
 * @param {string} prompt - User input.
 * @returns {string} OutputMode.DOCUMENT or OutputMode.CHAT
 */
export function classifyPrompt(prompt) {
  return isDocumentType(prompt) ? OutputMode.DOCUMENT : OutputMode.CHAT;
}
