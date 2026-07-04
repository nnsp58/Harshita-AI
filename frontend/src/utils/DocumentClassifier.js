// frontend/src/utils/DocumentClassifier.js
// PRD-021: Enhanced Indian Document Intelligence Classifier (Frontend)

export const OutputMode = {
  CHAT: 'CHAT',
  DOCUMENT: 'DOCUMENT',
  PDF: 'PDF',
  DOCX: 'DOCX',
  PRINT: 'PRINT'
};

// ═══════════════════════════════════════════════════════════
//  EXPANDED DOCUMENT KEYWORDS (80+ keywords, Hindi + English)
// ═══════════════════════════════════════════════════════════

const DOCUMENT_KEYWORDS_EN = [
  'notice', 'affidavit', 'agreement', 'deed', 'noc',
  'power of attorney', 'application', 'complaint', 'declaration',
  'contract', 'undertaking', 'representation', 'prayer letter',
  'memorandum', 'petition', 'will', 'testament', 'partition',
  'rent agreement', 'gift deed', 'rti', 'fir', 'complaint letter',
];

const DOCUMENT_KEYWORDS_HI = [
  'प्रार्थना पत्र', 'आवेदन पत्र', 'आवेदन', 'शिकायत पत्र', 'शिकायत',
  'शपथ पत्र', 'एफिडेविट', 'अनुबंध', 'विलेख', 'दान विलेख',
  'मसौदा', 'नोटिस', 'अभ्यावेदन', 'वचनबद्धता', 'ज्ञापन',
  'सूचना का अधिकार', 'आरटीआई', 'वसीयत', 'मुख्तारनामा',
  'अनापत्ति', 'बंटवारा', 'किराया', 'पेंशन', 'घोषणा पत्र',
  'प्रमाण पत्र', 'उपभोक्ता',
];

// Document STRUCTURAL markers (found inside generated documents)
const DOCUMENT_STRUCTURE_MARKERS = [
  'सेवा में', 'महोदय', 'भवदीय', 'प्रार्थी', 'हस्ताक्षर',
  'विषय:', 'दिनांक:', 'Subject:', 'Date:',
  'AFFIDAVIT', 'RENT AGREEMENT', 'LEGAL NOTICE', 'GIFT DEED',
  'APPLICATION', 'COMPLAINT', 'REPRESENTATION', 'UNDERTAKING',
  'DRAFT', 'NOTICE', 'RTI', 'NOC', 'WILL', 'PARTITION',
  'AGREEMENT', 'RESUME', 'INVOICE', 'REPORT',
  'सविनय निवेदन', 'अतः श्रीमान', 'कृपया',
  '═══', '___',
  'साक्षी', 'Witness',
  'WHEREAS', 'NOW THEREFORE',
  'शपथपूर्वक',
];

// Document CATEGORY names in responses
const DOCUMENT_CATEGORY_MARKERS = [
  'prayer_letter', 'application', 'complaint', 'affidavit',
  'draft', 'notice', 'representation', 'undertaking',
  'agreement', 'rti', 'gift_deed', 'partition_deed',
  'rent_agreement', 'noc', 'will', 'power_of_attorney',
  'police_complaint', 'electricity_complaint', 'revenue_application',
  'pension_application', 'consumer_complaint', 'court_draft',
];

// ═══════════════════════════════════════════════════════════
//  MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Classifies text (prompt or response) to determine if it relates to a document.
 * Enhanced for PRD-021 with 80+ Hindi/English keywords.
 * @param {string} text - The input text to analyze.
 * @returns {boolean} True if the text indicates a document.
 */
export function isDocumentType(text) {
  if (!text || text.length < 50) return false;
  const lowerText = text.toLowerCase();
  
  // Check English keywords
  if (DOCUMENT_KEYWORDS_EN.some(keyword => lowerText.includes(keyword))) return true;
  
  // Check Hindi keywords (case insensitive not needed for Devanagari, but check directly)
  if (DOCUMENT_KEYWORDS_HI.some(keyword => text.includes(keyword))) return true;
  
  // Check structural markers (found inside generated documents)
  const markerCount = DOCUMENT_STRUCTURE_MARKERS.filter(marker => text.includes(marker)).length;
  if (markerCount >= 2) return true; // At least 2 structural markers = document
  
  return false;
}

/**
 * PRD-021: Classify the document category from response text.
 * Returns detailed info for proper title extraction and type assignment.
 * @param {string} text - The AI response text
 * @returns {Object} { isDocument, category, title, type }
 */
export function classifyDocumentCategory(text) {
  if (!text || text.length < 50) {
    return { isDocument: false, category: null, title: null, type: 'chat' };
  }

  // Category detection order: most specific first
  const categoryPatterns = [
    { category: 'rti', title: 'RTI Application / सूचना का अधिकार', regex: /rti|सूचना\s*का\s*अधिकार|आरटीआई|right\s*to\s*information/i },
    { category: 'affidavit', title: 'शपथ पत्र / Affidavit', regex: /affidavit|शपथ\s*पत्र|एफिडेविट|शपथपूर्वक|sworn/i },
    { category: 'gift_deed', title: 'दान विलेख / Gift Deed', regex: /gift\s*deed|दान\s*विलेख/i },
    { category: 'partition_deed', title: 'बंटवारा विलेख / Partition Deed', regex: /partition|बंटवारा/i },
    { category: 'rent_agreement', title: 'किराया अनुबंध / Rent Agreement', regex: /rent\s*agreement|किराया\s*अनुबंध/i },
    { category: 'noc', title: 'अनापत्ति प्रमाण पत्र / NOC', regex: /\bNOC\b|no\s*objection|अनापत्ति/i },
    { category: 'will', title: 'वसीयत / Will', regex: /\bwill\b|वसीयत|testament/i },
    { category: 'power_of_attorney', title: 'मुख्तारनामा / Power of Attorney', regex: /power\s*of\s*attorney|मुख्तारनामा/i },
    { category: 'legal_notice', title: 'कानूनी नोटिस / Legal Notice', regex: /legal\s*notice|कानूनी\s*नोटिस/i },
    { category: 'police_complaint', title: 'पुलिस शिकायत / Police Complaint', regex: /police.*complaint|पुलिस.*शिकायत|थाना\s*प्रभारी|FIR/i },
    { category: 'electricity_complaint', title: 'विद्युत शिकायत / Electricity Complaint', regex: /electricity.*complaint|विद्युत.*शिकायत|बिजली.*शिकायत|अधिशासी\s*अभियंता/i },
    { category: 'consumer_complaint', title: 'उपभोक्ता शिकायत / Consumer Complaint', regex: /consumer.*complaint|उपभोक्ता.*शिकायत/i },
    { category: 'pension_application', title: 'पेंशन आवेदन / Pension Application', regex: /pension|पेंशन/i },
    { category: 'revenue_application', title: 'राजस्व आवेदन / Revenue Application', regex: /revenue|राजस्व|तहसीलदार/i },
    { category: 'court_draft', title: 'न्यायालय मसौदा / Court Draft', regex: /court|न्यायालय|IN THE COURT/i },
    { category: 'undertaking', title: 'वचनबद्धता / Undertaking', regex: /undertaking|वचनबद्धता/i },
    { category: 'representation', title: 'अभ्यावेदन / Representation', regex: /representation|अभ्यावेदन/i },
    { category: 'complaint', title: 'शिकायत पत्र / Complaint Letter', regex: /complaint|शिकायत\s*पत्र/i },
    { category: 'prayer_letter', title: 'प्रार्थना पत्र / Prayer Letter', regex: /prayer\s*letter|प्रार्थना\s*पत्र/i },
    { category: 'application', title: 'आवेदन पत्र / Application', regex: /application|आवेदन\s*पत्र|सेवा\s*में/i },
    { category: 'notice', title: 'नोटिस / Notice', regex: /notice|नोटिस/i },
    { category: 'draft', title: 'मसौदा / Draft', regex: /draft|मसौदा/i },
    { category: 'agreement', title: 'अनुबंध / Agreement', regex: /agreement|अनुबंध|करार/i },
  ];

  for (const { category, title, regex } of categoryPatterns) {
    if (regex.test(text)) {
      return {
        isDocument: true,
        category,
        title,
        type: 'document',
      };
    }
  }

  // Check if it has document structural markers (fallback)
  const markerCount = DOCUMENT_STRUCTURE_MARKERS.filter(m => text.includes(m)).length;
  if (markerCount >= 3) {
    return {
      isDocument: true,
      category: 'document',
      title: 'Generated Document',
      type: 'document',
    };
  }

  return { isDocument: false, category: null, title: null, type: 'chat' };
}

/**
 * Extract a clean document title from response text.
 * @param {string} text - The AI response text
 * @returns {string} Clean title for the document
 */
export function getDocumentTitle(text) {
  if (!text) return 'Document';
  
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return 'Document';

  // Try first non-empty line, cleaned up
  let title = lines[0].replace(/[#*=_═─]/g, '').trim();
  
  // If title is too short or is just "सेवा में,", try category detection
  if (title.length < 5 || /^सेवा\s*में/.test(title)) {
    const classification = classifyDocumentCategory(text);
    if (classification.title) return classification.title;
  }
  
  return title.substring(0, 60) || 'Generated Document';
}

/**
 * Classifies the prompt to determine target response mode.
 * @param {string} prompt - User input.
 * @returns {string} OutputMode.DOCUMENT or OutputMode.CHAT
 */
export function classifyPrompt(prompt) {
  return isDocumentType(prompt) ? OutputMode.DOCUMENT : OutputMode.CHAT;
}
