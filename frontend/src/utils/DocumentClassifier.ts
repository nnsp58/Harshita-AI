// frontend/src/utils/DocumentClassifier.ts

export enum OutputMode {
  CHAT = 'CHAT',
  DOCUMENT = 'DOCUMENT',
  PDF = 'PDF',
  DOCX = 'DOCX',
  PRINT = 'PRINT'
}

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
  'undertaking'
];

/**
 * Classifies text (prompt or response) to determine if it relates to a document.
 * @param text - The input text to analyze.
 * @returns True if the text indicates a document.
 */
export function isDocumentType(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  // Check if any keyword matches
  return DOCUMENT_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Classifies the prompt to determine target response mode.
 * @param prompt - User input.
 * @returns OutputMode.DOCUMENT or OutputMode.CHAT
 */
export function classifyPrompt(prompt: string): OutputMode {
  return isDocumentType(prompt) ? OutputMode.DOCUMENT : OutputMode.CHAT;
}
