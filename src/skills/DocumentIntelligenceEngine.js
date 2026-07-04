/**
 * DocumentIntelligenceEngine — PRD-021 Indian Document Intelligence
 *
 * Central classification module that identifies which Indian document
 * the user is requesting before any AI call is made.
 *
 * Categories:
 *   1. Draft (मसौदा)
 *   2. Application (आवेदन पत्र)
 *   3. Prayer Letter (प्रार्थना पत्र)
 *   4. Complaint Letter (शिकायत पत्र)
 *   5. Representation (अभ्यावेदन)
 *   6. Notice (नोटिस)
 *   7. Affidavit (शपथ पत्र)
 *   8. Agreement (अनुबंध)
 *   9. Undertaking (वचनबद्धता)
 *  10. RTI (सूचना का अधिकार)
 *
 * Usage:
 *   const { documentIntelligence } = require('./DocumentIntelligenceEngine');
 *   const result = documentIntelligence.classify('SDO ko prarthna patra likho');
 *   // → { category: 'prayer_letter', subType: 'government_prayer', confidence: 0.95, ... }
 */

// ═══════════════════════════════════════════════════════════
//  DOCUMENT CATEGORIES (10 main categories from PRD-021)
// ═══════════════════════════════════════════════════════════

const DOCUMENT_CATEGORIES = {
  DRAFT: 'draft',
  APPLICATION: 'application',
  PRAYER_LETTER: 'prayer_letter',
  COMPLAINT: 'complaint',
  REPRESENTATION: 'representation',
  NOTICE: 'notice',
  AFFIDAVIT: 'affidavit',
  AGREEMENT: 'agreement',
  UNDERTAKING: 'undertaking',
  RTI: 'rti',
};

// ═══════════════════════════════════════════════════════════
//  AUTHORITY DATABASE — Indian Government Officers
// ═══════════════════════════════════════════════════════════

const AUTHORITY_MAP = {
  // District Level
  dm: { title: 'जिलाधिकारी', titleEn: 'District Magistrate', abbr: 'DM' },
  sdm: { title: 'उपजिलाधिकारी', titleEn: 'Sub Divisional Magistrate', abbr: 'SDM' },
  sdo: { title: 'उपखण्ड अधिकारी', titleEn: 'Sub Divisional Officer', abbr: 'SDO' },
  tehsildar: { title: 'तहसीलदार', titleEn: 'Tehsildar', abbr: 'Tehsildar' },
  naib_tehsildar: { title: 'नायब तहसीलदार', titleEn: 'Naib Tehsildar', abbr: 'Naib Tehsildar' },
  lekhpal: { title: 'लेखपाल', titleEn: 'Lekhpal', abbr: 'Lekhpal' },
  // Police
  sp: { title: 'पुलिस अधीक्षक', titleEn: 'Superintendent of Police', abbr: 'SP' },
  dsp: { title: 'उप पुलिस अधीक्षक', titleEn: 'Deputy SP', abbr: 'DSP' },
  co: { title: 'सर्कल ऑफिसर', titleEn: 'Circle Officer', abbr: 'CO' },
  sho: { title: 'थाना प्रभारी', titleEn: 'Station House Officer', abbr: 'SHO' },
  thana_prabhari: { title: 'थाना प्रभारी', titleEn: 'Station In-Charge', abbr: 'SHO' },
  // Block Level
  bdo: { title: 'खंड विकास अधिकारी', titleEn: 'Block Development Officer', abbr: 'BDO' },
  gram_pradhan: { title: 'ग्राम प्रधान', titleEn: 'Village Head', abbr: 'Gram Pradhan' },
  // Education
  principal: { title: 'प्रधानाचार्य', titleEn: 'Principal', abbr: 'Principal' },
  headmaster: { title: 'प्रधानाध्यापक', titleEn: 'Headmaster', abbr: 'HM' },
  registrar: { title: 'कुलसचिव', titleEn: 'Registrar', abbr: 'Registrar' },
  dean: { title: 'डीन', titleEn: 'Dean', abbr: 'Dean' },
  // Electricity / PWD / Water
  executive_engineer: { title: 'अधिशासी अभियंता', titleEn: 'Executive Engineer', abbr: 'XEN' },
  junior_engineer: { title: 'अवर अभियंता', titleEn: 'Junior Engineer', abbr: 'JE' },
  // Municipal
  nagar_palika: { title: 'नगर पालिका अध्यक्ष', titleEn: 'Municipal Chairman', abbr: 'Chairman' },
  nagar_nigam: { title: 'नगर निगम आयुक्त', titleEn: 'Municipal Commissioner', abbr: 'Commissioner' },
  // Welfare
  dswdo: { title: 'जिला समाज कल्याण अधिकारी', titleEn: 'District Social Welfare Officer', abbr: 'DSWO' },
  cdo: { title: 'मुख्य विकास अधिकारी', titleEn: 'Chief Development Officer', abbr: 'CDO' },
  // Banking
  bank_manager: { title: 'शाखा प्रबंधक', titleEn: 'Branch Manager', abbr: 'BM' },
  // General
  collector: { title: 'कलेक्टर', titleEn: 'Collector', abbr: 'Collector' },
  commissioner: { title: 'आयुक्त', titleEn: 'Commissioner', abbr: 'Commissioner' },
};

// ═══════════════════════════════════════════════════════════
//  DEPARTMENT DATABASE
// ═══════════════════════════════════════════════════════════

const DEPARTMENT_MAP = {
  electricity: { name: 'विद्युत विभाग', nameEn: 'Electricity Department' },
  water: { name: 'जल विभाग / जल निगम', nameEn: 'Water Department' },
  police: { name: 'पुलिस विभाग', nameEn: 'Police Department' },
  revenue: { name: 'राजस्व विभाग', nameEn: 'Revenue Department' },
  education: { name: 'शिक्षा विभाग', nameEn: 'Education Department' },
  panchayat: { name: 'ग्राम पंचायत', nameEn: 'Gram Panchayat' },
  municipal: { name: 'नगर पालिका / नगर निगम', nameEn: 'Municipal Corporation' },
  pwd: { name: 'लोक निर्माण विभाग', nameEn: 'Public Works Department' },
  health: { name: 'स्वास्थ्य विभाग', nameEn: 'Health Department' },
  agriculture: { name: 'कृषि विभाग', nameEn: 'Agriculture Department' },
  welfare: { name: 'समाज कल्याण विभाग', nameEn: 'Social Welfare Department' },
  bank: { name: 'बैंक', nameEn: 'Bank' },
  court: { name: 'न्यायालय', nameEn: 'Court' },
  transport: { name: 'परिवहन विभाग', nameEn: 'Transport Department' },
  telecom: { name: 'दूरसंचार विभाग', nameEn: 'Telecom Department' },
  forest: { name: 'वन विभाग', nameEn: 'Forest Department' },
  labour: { name: 'श्रम विभाग', nameEn: 'Labour Department' },
};

// ═══════════════════════════════════════════════════════════
//  CLASSIFICATION PATTERNS — Priority ordered (first match wins)
//  Each pattern: { regex, category, subType, authority?, department?, confidence }
// ═══════════════════════════════════════════════════════════

const CLASSIFICATION_PATTERNS = [

  // ─── RTI (highest specificity) ───
  { regex: /rti|आरटीआई|सूचना\s*का\s*अधिकार|right\s*to\s*information|soochna\s*ka\s*adhikar|rti\s*lagao|rti\s*application/i, category: DOCUMENT_CATEGORIES.RTI, subType: 'rti_application', confidence: 0.95 },

  // ─── AFFIDAVIT (specific patterns) ───
  { regex: /शपथ\s*पत्र|एफिडेविट|affidavit|sworn\s*statement|shapath\s*patra|sapath\s*patra|notary|नोटरी|घोषणा\s*पत्र|declaration/i, category: DOCUMENT_CATEGORIES.AFFIDAVIT, subType: 'general_affidavit', confidence: 0.95 },
  { regex: /marksheet\s*gum|certificate\s*kho|गुम\s*हो\s*गय|खो\s*गय|lost\s*document|lost\s*certificate|lost\s*marksheet/i, category: DOCUMENT_CATEGORIES.AFFIDAVIT, subType: 'lost_document_affidavit', confidence: 0.95 },
  { regex: /naam\s*change|नाम\s*परिवर्तन|name\s*change|naam\s*badal/i, category: DOCUMENT_CATEGORIES.AFFIDAVIT, subType: 'name_change_affidavit', confidence: 0.95 },
  { regex: /date\s*of\s*birth.*(?:change|correction)|जन्म\s*तिथि.*(?:सुधार|बदल)/i, category: DOCUMENT_CATEGORIES.AFFIDAVIT, subType: 'dob_correction_affidavit', confidence: 0.90 },

  // ─── AGREEMENT (specific patterns) ───
  { regex: /rent\s*agreement|किराया\s*(?:अनुबंध|एग्रीमेंट)|kiraya.*agreement|lease\s*agreement|rental\s*agreement/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'rent_agreement', confidence: 0.95 },
  { regex: /gift\s*deed|दान\s*विलेख|sampatti.*(?:transfer|naam)|पत्नी\s*के\s*नाम|wife.*naam|husband.*naam|पति\s*के\s*नाम/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'gift_deed', confidence: 0.95 },
  { regex: /partition|बंटवारा|पार्टीशन|baantwara|property.*divide|sampatti.*baant/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'partition_deed', confidence: 0.95 },
  { regex: /noc|no\s*objection|अनापत्ति/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'noc', confidence: 0.90 },
  { regex: /will|वसीयत|wasiyat|testament/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'will', confidence: 0.90 },
  { regex: /power\s*of\s*attorney|मुख्तारनामा|poa\b|mukhtarnama/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'power_of_attorney', confidence: 0.90 },
  { regex: /(?:contract|अनुबंध|करार|agreement)(?!.*(?:rent|kiraya|किराया))/i, category: DOCUMENT_CATEGORIES.AGREEMENT, subType: 'general_agreement', confidence: 0.80 },

  // ─── NOTICE (specific patterns) ───
  { regex: /legal\s*notice|कानूनी\s*नोटिस|vakil.*notice|वकील.*नोटिस|advocate.*notice|lawyer.*notice/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'legal_notice', confidence: 0.95 },
  { regex: /cheque\s*bounce|चेक\s*बाउंस|section\s*138|dhara\s*138/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'cheque_bounce_notice', confidence: 0.95 },
  { regex: /eviction|बेदखली|kirayedar.*khali|tenant.*vacate/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'eviction_notice', confidence: 0.90 },
  { regex: /money\s*recovery|paisa\s*wapas|रकम\s*वसूली|vsooli/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'recovery_notice', confidence: 0.90 },
  { regex: /defamation|मानहानि|jhoothe\s*aarop|false\s*allegations/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'defamation_notice', confidence: 0.90 },
  { regex: /(?:नोटिस|notice)(?!.*(?:legal|कानूनी|vakil|वकील))/i, category: DOCUMENT_CATEGORIES.NOTICE, subType: 'general_notice', confidence: 0.80 },

  // ─── UNDERTAKING (specific) ───
  { regex: /undertaking|वचनबद्धता|वचन\s*पत्र|sworn\s*promise|commitment\s*letter|vachan\s*patra/i, category: DOCUMENT_CATEGORIES.UNDERTAKING, subType: 'general_undertaking', confidence: 0.90 },

  // ─── REPRESENTATION (specific) ───
  { regex: /representation|अभ्यावेदन|abhyavedan|ज्ञापन|memorandum/i, category: DOCUMENT_CATEGORIES.REPRESENTATION, subType: 'government_representation', confidence: 0.90 },

  // ─── COMPLAINT — with authority/department detection ───
  { regex: /(?:police|पुलिस|fir|एफआईआर|थाना|thana).*(?:complaint|शिकायत|report|रिपोर्ट|darj)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'police_complaint', authority: 'sho', department: 'police', confidence: 0.95 },
  { regex: /(?:complaint|शिकायत|report|रिपोर्ट|darj).*(?:police|पुलिस|fir|थाना|thana)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'police_complaint', authority: 'sho', department: 'police', confidence: 0.95 },
  { regex: /(?:bijli|बिजली|विद्युत|electricity|light|बत्ती).*(?:shikayat|शिकायत|complaint|problem|समस्या)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'electricity_complaint', authority: 'executive_engineer', department: 'electricity', confidence: 0.95 },
  { regex: /(?:shikayat|शिकायत|complaint|problem|समस्या).*(?:bijli|बिजली|विद्युत|electricity|light|बत्ती)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'electricity_complaint', authority: 'executive_engineer', department: 'electricity', confidence: 0.95 },
  { regex: /(?:paani|पानी|water|जल|nalkoop|नलकूप|handpump|हैंडपंप).*(?:shikayat|शिकायत|complaint|problem|समस्या)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'water_complaint', authority: 'executive_engineer', department: 'water', confidence: 0.90 },
  { regex: /(?:shikayat|शिकायत|complaint|problem|समस्या).*(?:paani|पानी|water|जल|nalkoop|नलकूप)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'water_complaint', authority: 'executive_engineer', department: 'water', confidence: 0.90 },
  { regex: /(?:sadak|सड़क|road|rasta|रास्ता).*(?:shikayat|शिकायत|complaint|kharab|खराब|toot|टूट)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'road_complaint', department: 'pwd', confidence: 0.90 },
  { regex: /(?:shikayat|शिकायत|complaint).*(?:sadak|सड़क|road|rasta|रास्ता)/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'road_complaint', department: 'pwd', confidence: 0.90 },
  { regex: /consumer.*complaint|उपभोक्ता.*शिकायत|ग्राहक.*शिकायत/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'consumer_complaint', confidence: 0.90 },
  { regex: /शिकायत\s*पत्र|shikayat\s*patra|complaint\s*letter/i, category: DOCUMENT_CATEGORIES.COMPLAINT, subType: 'general_complaint', confidence: 0.85 },

  // ─── PRAYER LETTER — Government authority patterns ───
  { regex: /(?:dm|डीएम|जिलाधिकारी|district\s*magistrate|collector|कलेक्टर)\s*(?:ko|को|ke\s*naam|sahab|साहब|sir)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'government_prayer', authority: 'dm', confidence: 0.95 },
  { regex: /(?:sdm|एसडीएम|उपजिलाधिकारी|sub\s*divisional\s*magistrate)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'government_prayer', authority: 'sdm', confidence: 0.95 },
  { regex: /(?:sdo|एसडीओ|उपखण्ड\s*अधिकारी)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'government_prayer', authority: 'sdo', confidence: 0.95 },
  { regex: /(?:bdo|बीडीओ|खंड\s*विकास\s*अधिकारी)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'government_prayer', authority: 'bdo', confidence: 0.95 },
  { regex: /(?:tehsildar|तहसीलदार|तहसील)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'revenue_prayer', authority: 'tehsildar', department: 'revenue', confidence: 0.95 },
  { regex: /(?:sp|एसपी|पुलिस\s*अधीक्षक)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'police_prayer', authority: 'sp', department: 'police', confidence: 0.95 },
  { regex: /(?:thana\s*prabhari|थाना\s*प्रभारी|sho)\s*(?:ko|को|ke\s*naam|sahab|साहब)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'police_prayer', authority: 'sho', department: 'police', confidence: 0.95 },
  { regex: /(?:nagar\s*palika|नगर\s*पालिका|नगर\s*निगम|municipal)\s*(?:ko|को|mein|में)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'municipal_prayer', department: 'municipal', confidence: 0.90 },
  { regex: /(?:gram\s*pradhan|ग्राम\s*प्रधान|sarpanch|सरपंच|panchayat|पंचायत)\s*(?:ko|को|mein|में)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'panchayat_prayer', authority: 'gram_pradhan', department: 'panchayat', confidence: 0.90 },
  { regex: /(?:bank\s*manager|शाखा\s*प्रबंधक|बैंक.*मैनेजर)\s*(?:ko|को|ke\s*naam)/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'bank_prayer', authority: 'bank_manager', department: 'bank', confidence: 0.90 },
  { regex: /प्रार्थना\s*पत्र|prarthna\s*patra|prathna\s*patra|prayer\s*letter/i, category: DOCUMENT_CATEGORIES.PRAYER_LETTER, subType: 'general_prayer', confidence: 0.90 },

  // ─── APPLICATION — Education/Institutional ───
  { regex: /(?:principal|प्रधानाचार्य|headmaster|प्रधानाध्यापक|sir|madam)\s*(?:ko|को)\s*(?:application|आवेदन|पत्र)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'school_application', authority: 'principal', department: 'education', confidence: 0.95 },
  { regex: /(?:leave|छुट्टी|chutti|अवकाश|avkash)\s*(?:application|आवेदन|ke\s*liye|का)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'leave_application', confidence: 0.95 },
  { regex: /(?:admission|दाखिला|प्रवेश|dakhila)\s*(?:application|आवेदन|ke\s*liye|form)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'admission_application', department: 'education', confidence: 0.90 },
  { regex: /(?:transfer\s*certificate|tc|टीसी|स्थानांतरण\s*प्रमाण)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'tc_application', department: 'education', confidence: 0.90 },
  { regex: /(?:scholarship|छात्रवृत्ति|chatravritti)\s*(?:application|आवेदन|ke\s*liye|form)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'scholarship_application', confidence: 0.90 },
  { regex: /(?:fee\s*concession|शुल्क\s*छूट|fees\s*maaf)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'fee_concession_application', department: 'education', confidence: 0.90 },
  // Government certificates
  { regex: /(?:income\s*certificate|आय\s*प्रमाण\s*पत्र|aay\s*praman)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'income_certificate_application', department: 'revenue', confidence: 0.90 },
  { regex: /(?:caste\s*certificate|जाति\s*प्रमाण\s*पत्र|jaati\s*praman)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'caste_certificate_application', department: 'revenue', confidence: 0.90 },
  { regex: /(?:residence\s*certificate|निवास\s*प्रमाण\s*पत्र|niwas\s*praman)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'residence_certificate_application', department: 'revenue', confidence: 0.90 },
  { regex: /(?:character\s*certificate|चरित्र\s*प्रमाण\s*पत्र|charitra\s*praman)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'character_certificate_application', confidence: 0.90 },
  // Employment
  { regex: /(?:job|naukri|नौकरी)\s*(?:application|आवेदन|ke\s*liye|ka\s*form)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'job_application', confidence: 0.85 },
  { regex: /(?:resign|इस्तीफा|istifa)\s*(?:letter|पत्र|application)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'resignation_letter', confidence: 0.90 },
  { regex: /(?:experience\s*certificate|अनुभव\s*प्रमाण)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'experience_certificate_application', confidence: 0.85 },
  // Pension
  { regex: /(?:pension|पेंशन|वृद्धावस्था|विधवा|divyang|दिव्यांग)\s*(?:application|आवेदन|ke\s*liye|hetu)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'pension_application', authority: 'dswdo', department: 'welfare', confidence: 0.90 },
  { regex: /(?:application|आवेदन)\s*(?:pension|पेंशन|वृद्धावस्था|विधवा)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'pension_application', authority: 'dswdo', department: 'welfare', confidence: 0.90 },
  // Generic application patterns
  { regex: /आवेदन\s*पत्र|aavedan\s*patra|application\s*(?:form|letter)/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'general_application', confidence: 0.85 },
  { regex: /application\s*likh|आवेदन\s*लिख|application\s*banao|आवेदन\s*बनाओ/i, category: DOCUMENT_CATEGORIES.APPLICATION, subType: 'general_application', confidence: 0.85 },

  // ─── DRAFT (generic catch-all for "draft/मसौदा") ───
  { regex: /ड्राफ्ट\s*बना|draft\s*bana|मसौदा\s*बना|draft\s*likh|ड्राफ्ट\s*लिख|मसौदा\s*लिख/i, category: DOCUMENT_CATEGORIES.DRAFT, subType: 'general_draft', confidence: 0.85 },
  { regex: /(?:^|\s)(?:draft|ड्राफ्ट|मसौदा)(?:\s|$)/i, category: DOCUMENT_CATEGORIES.DRAFT, subType: 'general_draft', confidence: 0.75 },
];

// ═══════════════════════════════════════════════════════════
//  SECONDARY AUTHORITY DETECTION (runs after main classification)
// ═══════════════════════════════════════════════════════════

const AUTHORITY_PATTERNS = [
  { regex: /dm\b|डीएम|जिलाधिकारी|district\s*magistrate|collector|कलेक्टर/i, authority: 'dm' },
  { regex: /sdm\b|एसडीएम|उपजिलाधिकारी|sub\s*divisional\s*magistrate/i, authority: 'sdm' },
  { regex: /sdo\b|एसडीओ|उपखण्ड\s*अधिकारी/i, authority: 'sdo' },
  { regex: /bdo\b|बीडीओ|खंड\s*विकास/i, authority: 'bdo' },
  { regex: /tehsildar|तहसीलदार|तहसील/i, authority: 'tehsildar' },
  { regex: /lekhpal|लेखपाल/i, authority: 'lekhpal' },
  { regex: /sp\b|एसपी|पुलिस\s*अधीक्षक/i, authority: 'sp' },
  { regex: /dsp\b|डीएसपी|उप\s*पुलिस/i, authority: 'dsp' },
  { regex: /sho\b|thana\s*prabhari|थाना\s*प्रभारी|थानाध्यक्ष/i, authority: 'sho' },
  { regex: /co\b|circle\s*officer|सर्कल/i, authority: 'co' },
  { regex: /principal|प्रधानाचार्य|headmaster|प्रधानाध्यापक/i, authority: 'principal' },
  { regex: /registrar|कुलसचिव/i, authority: 'registrar' },
  { regex: /executive\s*engineer|अधिशासी\s*अभियंता|xen\b/i, authority: 'executive_engineer' },
  { regex: /junior\s*engineer|अवर\s*अभियंता|je\b/i, authority: 'junior_engineer' },
  { regex: /gram\s*pradhan|ग्राम\s*प्रधान|sarpanch|सरपंच/i, authority: 'gram_pradhan' },
  { regex: /nagar\s*palika|नगर\s*पालिका/i, authority: 'nagar_palika' },
  { regex: /nagar\s*nigam|नगर\s*निगम/i, authority: 'nagar_nigam' },
  { regex: /bank\s*manager|शाखा\s*प्रबंधक|बैंक.*मैनेजर/i, authority: 'bank_manager' },
  { regex: /cdo|मुख्य\s*विकास\s*अधिकारी/i, authority: 'cdo' },
  { regex: /समाज\s*कल्याण|social\s*welfare/i, authority: 'dswdo' },
];

const DEPARTMENT_PATTERNS = [
  { regex: /bijli|बिजली|विद्युत|electricity|meter|मीटर|transformer|ट्रांसफार्मर/i, department: 'electricity' },
  { regex: /paani|पानी|water|जल|nalkoop|नलकूप|handpump|हैंडपंप|jal\s*nigam/i, department: 'water' },
  { regex: /police|पुलिस|fir|थाना|thana/i, department: 'police' },
  { regex: /revenue|राजस्व|तहसील|खसरा|खतौनी/i, department: 'revenue' },
  { regex: /school|स्कूल|college|कॉलेज|university|विश्वविद्यालय|शिक्षा/i, department: 'education' },
  { regex: /panchayat|पंचायत|gram\s*sabha|ग्राम\s*सभा/i, department: 'panchayat' },
  { regex: /nagar\s*palika|नगर\s*पालिका|नगर\s*निगम|municipal|नगर/i, department: 'municipal' },
  { regex: /pwd|लोक\s*निर्माण|sadak|सड़क|road/i, department: 'pwd' },
  { regex: /pension|पेंशन|समाज\s*कल्याण|welfare|कल्याण/i, department: 'welfare' },
  { regex: /bank|बैंक|खाता|account/i, department: 'bank' },
  { regex: /court|न्यायालय|अदालत|कोर्ट/i, department: 'court' },
  { regex: /transport|परिवहन|driving\s*license|ड्राइविंग/i, department: 'transport' },
  { regex: /forest|वन\s*विभाग/i, department: 'forest' },
  { regex: /labour|श्रम|मजदूर/i, department: 'labour' },
];

// ═══════════════════════════════════════════════════════════
//  SKILL ROUTING MAP — Which skill handles which category
// ═══════════════════════════════════════════════════════════

const CATEGORY_TO_SKILL_MAP = {
  [DOCUMENT_CATEGORIES.DRAFT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.APPLICATION]: 'application_writer',
  [DOCUMENT_CATEGORIES.PRAYER_LETTER]: 'application_writer',
  [DOCUMENT_CATEGORIES.COMPLAINT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.REPRESENTATION]: 'legal_draft',
  [DOCUMENT_CATEGORIES.NOTICE]: 'legal_notice',
  [DOCUMENT_CATEGORIES.AFFIDAVIT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.AGREEMENT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.UNDERTAKING]: 'legal_draft',
  [DOCUMENT_CATEGORIES.RTI]: 'legal_draft',
};

const CATEGORY_TO_INTENT_MAP = {
  [DOCUMENT_CATEGORIES.DRAFT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.APPLICATION]: 'application_writer',
  [DOCUMENT_CATEGORIES.PRAYER_LETTER]: 'application_writer',
  [DOCUMENT_CATEGORIES.COMPLAINT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.REPRESENTATION]: 'legal_draft',
  [DOCUMENT_CATEGORIES.NOTICE]: 'legal_notice',
  [DOCUMENT_CATEGORIES.AFFIDAVIT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.AGREEMENT]: 'legal_draft',
  [DOCUMENT_CATEGORIES.UNDERTAKING]: 'legal_draft',
  [DOCUMENT_CATEGORIES.RTI]: 'legal_draft',
};

// ═══════════════════════════════════════════════════════════
//  MAIN CLASS
// ═══════════════════════════════════════════════════════════

class DocumentIntelligenceEngine {
  constructor() {
    this.name = 'DocumentIntelligenceEngine';
    this.version = '1.0.0';
    this.classificationCount = 0;
  }

  /**
   * Classify a user message into a document category.
   *
   * @param {string} message - User input (Hindi/English/Hinglish)
   * @returns {Object|null} Classification result or null if not a document request
   *   { category, subType, confidence, authority, authorityInfo, department, departmentInfo, skill, intent, language }
   */
  classify(message) {
    if (!message || typeof message !== 'string' || message.trim().length < 2) {
      return null;
    }

    const text = message.trim();
    const lower = text.toLowerCase();

    // Step 1: Try pattern-based classification (fast, deterministic)
    let result = this._classifyByPattern(lower);

    // Step 2: If no pattern match, check if it contains any document-related word
    if (!result) {
      result = this._classifyByKeywordFallback(lower);
    }

    // Not a document request
    if (!result) {
      return null;
    }

    // Step 3: Detect authority (if not already detected)
    if (!result.authority) {
      result.authority = this._detectAuthority(lower);
    }

    // Step 4: Detect department (if not already detected)
    if (!result.department) {
      result.department = this._detectDepartment(lower);
    }

    // Step 5: Enrich with authority/department info
    if (result.authority && AUTHORITY_MAP[result.authority]) {
      result.authorityInfo = AUTHORITY_MAP[result.authority];
    }
    if (result.department && DEPARTMENT_MAP[result.department]) {
      result.departmentInfo = DEPARTMENT_MAP[result.department];
    }

    // Step 6: Map to skill and intent
    result.skill = CATEGORY_TO_SKILL_MAP[result.category] || 'legal_draft';
    result.intent = CATEGORY_TO_INTENT_MAP[result.category] || 'legal_draft';

    // Step 7: Detect language
    result.language = this._detectLanguage(text);

    this.classificationCount++;
    return result;
  }

  /**
   * Pattern-based classification — priority ordered, first match wins
   */
  _classifyByPattern(lowerMessage) {
    for (const pattern of CLASSIFICATION_PATTERNS) {
      if (pattern.regex.test(lowerMessage)) {
        return {
          category: pattern.category,
          subType: pattern.subType,
          confidence: pattern.confidence,
          authority: pattern.authority || null,
          department: pattern.department || null,
          method: 'pattern',
        };
      }
    }
    return null;
  }

  /**
   * Keyword fallback — looser matching for generic document requests
   */
  _classifyByKeywordFallback(lowerMessage) {
    // Generic document action words
    const documentActionWords = /(?:लिख|लिखो|लिखना|बना|बनाओ|बनाना|तैयार|generate|write|create|prepare|bana|likho|likho|taiyar)\s*(?:do|दो|karo|करो|dena|देना|dijiye|दीजिए)?/i;
    const documentTypeWords = /(?:patra|पत्र|patti|पत्ती|form|फॉर्म|letter|document|दस्तावेज़|kagaz|कागज|chithi|चिट्ठी)/i;

    if (documentActionWords.test(lowerMessage) && documentTypeWords.test(lowerMessage)) {
      return {
        category: DOCUMENT_CATEGORIES.DRAFT,
        subType: 'general_draft',
        confidence: 0.60,
        authority: null,
        department: null,
        method: 'keyword_fallback',
      };
    }

    return null;
  }

  /**
   * Detect the target authority from message
   */
  _detectAuthority(lowerMessage) {
    for (const pattern of AUTHORITY_PATTERNS) {
      if (pattern.regex.test(lowerMessage)) {
        return pattern.authority;
      }
    }
    return null;
  }

  /**
   * Detect the target department from message
   */
  _detectDepartment(lowerMessage) {
    for (const pattern of DEPARTMENT_PATTERNS) {
      if (pattern.regex.test(lowerMessage)) {
        return pattern.department;
      }
    }
    return null;
  }

  /**
   * Detect input language
   */
  _detectLanguage(text) {
    const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
    const total = hindiChars + englishChars;
    if (total === 0) return 'unknown';
    if (hindiChars > englishChars * 2) return 'hi';
    if (englishChars > hindiChars * 2) return 'en';
    return 'hinglish';
  }

  /**
   * Get human-readable category name
   */
  getCategoryDisplayName(category, language = 'hi') {
    const names = {
      [DOCUMENT_CATEGORIES.DRAFT]: { hi: 'मसौदा', en: 'Draft' },
      [DOCUMENT_CATEGORIES.APPLICATION]: { hi: 'आवेदन पत्र', en: 'Application' },
      [DOCUMENT_CATEGORIES.PRAYER_LETTER]: { hi: 'प्रार्थना पत्र', en: 'Prayer Letter' },
      [DOCUMENT_CATEGORIES.COMPLAINT]: { hi: 'शिकायत पत्र', en: 'Complaint Letter' },
      [DOCUMENT_CATEGORIES.REPRESENTATION]: { hi: 'अभ्यावेदन', en: 'Representation' },
      [DOCUMENT_CATEGORIES.NOTICE]: { hi: 'नोटिस', en: 'Notice' },
      [DOCUMENT_CATEGORIES.AFFIDAVIT]: { hi: 'शपथ पत्र', en: 'Affidavit' },
      [DOCUMENT_CATEGORIES.AGREEMENT]: { hi: 'अनुबंध / विलेख', en: 'Agreement / Deed' },
      [DOCUMENT_CATEGORIES.UNDERTAKING]: { hi: 'वचनबद्धता', en: 'Undertaking' },
      [DOCUMENT_CATEGORIES.RTI]: { hi: 'सूचना का अधिकार', en: 'RTI Application' },
    };
    return names[category]?.[language] || category;
  }

  /**
   * Check if a given category is a legal document (opens in A4 workspace)
   */
  isLegalDocument(category) {
    return Object.values(DOCUMENT_CATEGORIES).includes(category);
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalPatterns: CLASSIFICATION_PATTERNS.length,
      totalAuthorities: Object.keys(AUTHORITY_MAP).length,
      totalDepartments: Object.keys(DEPARTMENT_MAP).length,
      classificationsPerformed: this.classificationCount,
    };
  }
}

// Singleton instance
const documentIntelligence = new DocumentIntelligenceEngine();

module.exports = {
  DocumentIntelligenceEngine,
  documentIntelligence,
  DOCUMENT_CATEGORIES,
  AUTHORITY_MAP,
  DEPARTMENT_MAP,
  CATEGORY_TO_SKILL_MAP,
  CATEGORY_TO_INTENT_MAP,
};
