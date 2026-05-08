const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const { PDFParse } = require('pdf-parse');
const os = require('os');
const { aiProviderManager } = require('../utils/aiProviderManager');

class DocumentAIAgent {
  constructor() {
    // Use provider manager - prefers Groq (free) by default
    console.log('[DocumentAIAgent] AI Provider Manager initialized');
    console.log('[DocumentAIAgent] Available providers:', aiProviderManager.getAvailableProviders());
    console.log('[DocumentAIAgent] Preferred provider for this agent:', aiProviderManager.getEffectiveProvider('DocumentAIAgent'));
    
    this.cache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
    this.aiAvailable = aiProviderManager.getAvailableProviders().length > 0;
  }

  // Preprocess image for better OCR
  async preprocessImage(filePath) {
    const processedPath = filePath + '.processed.png';
    try {
      await sharp(filePath)
        .resize({ width: 2000, withoutEnlargement: true })
        .grayscale()
        .modulate({ brightness: 1.2, saturation: 0 })
        .sharpen()
        .toFile(processedPath);
      return processedPath;
    } catch (error) {
      return filePath;
    }
  }

  // Extract text from image using Tesseract OCR
  async extractTextFromImage(filePath) {
    console.log(`🖼️ Processing Image: ${filePath} (real OCR)`);
    try {
      const processedPath = await this.preprocessImage(filePath);
      const { data: { text } } = await Tesseract.recognize(processedPath, 'eng', {
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r   OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });
      console.log(`\n   ✅ OCR extracted ${text.length} characters`);
      if (processedPath !== filePath) fs.unlinkSync(processedPath);
      return { text, confidence: 0.9 };
    } catch (error) {
      console.error(`   ❌ OCR failed: ${error.message}`);
      return { text: '', confidence: 0 };
    }
  }

  // Extract text from PDF using pdf-parse v2 API
  async extractTextFromPDF(filePath) {
    console.log(`📄 Processing PDF: ${filePath}`);

    // Try direct text extraction first (works for text-based PDFs)
    let parser;
    try {
      const dataBuffer = fs.readFileSync(filePath);
      parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      await parser.destroy();

      const text = result.text.trim();
      if (text.length > 100) {
        console.log(`   ✅ PDF text extraction: ${text.length} chars`);
        return { text, confidence: 0.95 };
      } else {
        console.log(`   ℹ️ Text too short (${text.length} chars), likely scanned PDF`);
      }
    } catch (err) {
      console.log(`   ℹ️ pdf-parse error: ${err.message}`);
      if (parser) await parser.destroy();
    }
    
    // Fallback: Convert PDF pages to images and OCR each page
    return await this.extractTextFromScannedPDF(filePath);
  }

  // Extract text from scanned PDF using pdf-parse screenshots + OCR
  async extractTextFromScannedPDF(filePath) {
    console.log(`   🔄 Scanned PDF detected, using OCR fallback...`);
    
    let parser;
    try {
      const dataBuffer = fs.readFileSync(filePath);
      parser = new PDFParse({ data: dataBuffer });
      
      // Get total pages
      const info = await parser.getInfo({ parsePageInfo: true });
      const totalPages = info.total;
      console.log(`   📄 PDF has ${totalPages} page(s)`);
      
      let fullText = '';
      for (let i = 1; i <= totalPages; i++) {
        console.log(`   🔎 Processing page ${i}/${totalPages} via screenshot OCR...`);
        
        // Render page as image (PNG buffer)
        const screenshot = await parser.getScreenshot({ 
          scale: 2,  // 2x resolution for better OCR
          imageBuffer: true,
          imageDataUrl: false
        });
        
        if (!screenshot || !screenshot.pages || screenshot.pages.length === 0) {
          console.log(`   ⚠️  No screenshot for page ${i}`);
          continue;
        }
        
        const imageBuffer = screenshot.pages[0].data;
        
        // Save to temp file for Tesseract OCR
        const tmpImgPath = path.join(os.tmpdir(), `pdfpage_${Date.now()}_${i}.png`);
        fs.writeFileSync(tmpImgPath, imageBuffer);
        
        // Preprocess and OCR
        const processedPath = await this.preprocessImage(tmpImgPath);
        const { data: { text } } = await Tesseract.recognize(processedPath, 'eng', {
          tessedit_pageseg_mode: Tesseract.PSM.AUTO
        });
        
        fullText += '\n\n' + text;
        
        // Cleanup temp files
        if (processedPath !== tmpImgPath) fs.unlinkSync(processedPath);
        fs.unlinkSync(tmpImgPath);
      }
      
      await parser.destroy();
      
      console.log(`   ✅ OCR extracted ${fullText.length} chars from ${totalPages} page(s)`);
      return { text: fullText.trim(), confidence: 0.85 };
    } catch (error) {
      console.error(`   ❌ Scanned PDF OCR failed: ${error.message}`);
      if (parser) await parser.destroy();
      return { text: '', confidence: 0 };
    }
  }

  async parseWithAI(extractedText, documentType) {
    const prompt = `Parse the following document text (may contain Hindi + English) and extract structured information.
The document could be one of: Aadhaar, PAN, Caste Certificate, EWS, 10th/12th Marksheet, Graduation/PG Degree.

Return ONLY raw JSON, no markdown.

Text:
${extractedText}

JSON structure:
{
  "personal": {
    "fullName": "",
    "fatherName": "",
    "motherName": "",
    "gender": "",
    "dob": "",
    "category": "", // Extract: General/OBC/SC/ST from certificates
    "aadhaarNumber": "",
    "panNumber": ""
  },
  "contact": {"email": "", "phone": ""},
  "address": {"line1": "", "city": "", "state": "", "pincode": ""},
  "education": {
    "level": "", // 10th, 12th, Graduate, Post-Graduate
    "boardOrUniversity": "",
    "passingYear": "",
    "percentageOrCGPA": "",
    "rollNumber": ""
  },
  "certificateDetails": {
    "certificateNumber": "",
    "issueDate": "",
    "issuingAuthority": ""
  }
}`;

     try {
       const client = aiProviderManager.getClient('DocumentAIAgent');
       if (!client) {
         console.warn('DocumentAIAgent: No AI client, using regex fallback');
         return this.mockParseDocument(extractedText, documentType);
       }
       
       const model = aiProviderManager.getModel('DocumentAIAgent');
       const response = await client.chat.completions.create({
         model,
         messages: [{ role: 'user', content: prompt }],
         temperature: 0.1,
         max_tokens: 1000
       });
       let content = response.choices[0].message.content.trim();
       content = content.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');
       let parsedData = JSON.parse(content);
       if (!this._hasMeaningfulData(parsedData)) {
         return this.mockParseDocument(extractedText, documentType);
       }
       return parsedData;
    } catch (error) {
      console.error('❌ AI parse error:', error.message);
      // If image input not supported, inform user
      if (error.message.includes('does not support image input')) {
        console.warn('⚠️ AI model does not support images. Using OCR + text parsing.');
      }
      return this.mockParseDocument(extractedText, documentType);
    }
  }

  // Check if data has any non-empty fields
  _hasMeaningfulData(data) {
    const sections = ['personal', 'contact', 'address', 'documents', 'education', 'employment'];
    for (const section of sections) {
      if (data[section]) {
        for (const value of Object.values(data[section])) {
          if (value && (typeof value === 'string' ? value.trim() !== '' : value.length > 0)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Mock parser with English + Hindi regex
  mockParseDocument(extractedText, documentType) {
    const mockData = { personal: {}, contact: {}, address: {}, documents: {}, education: {}, employment: {} };
    const text = extractedText.toLowerCase();

    // Name
    const nameMatch = extractedText.match(/name:?\s*([A-Za-z\s]+?)(?:\n|$)/i) ||
                      extractedText.match(/नाम\s*\/?\s*name:?\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (nameMatch) mockData.personal.fullName = nameMatch[1].trim();

    // Father
    const fatherMatch = extractedText.match(/father'?s?\s*name:?\s*([A-Za-z\s]+?)(?:\n|$)/i) ||
                        extractedText.match(/पिता\s*का\s*नाम:?\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (fatherMatch) mockData.personal.fatherName = fatherMatch[1].trim();

    // Mother
    const motherMatch = extractedText.match(/mother'?s?\s*name:?\s*([A-Za-z\s]+?)(?:\n|$)/i) ||
                        extractedText.match(/माता\s*का\s*नाम:?\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (motherMatch) mockData.personal.motherName = motherMatch[1].trim();

    // DOB
    const dobMatch = extractedText.match(/(?:date\s*of\s*birth|dob|d\.o\.b|जन्म\s*तिथि):?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dobMatch) mockData.personal.dob = dobMatch[1].trim();

    // Gender
    if (/\b(?:male|पुरुष|mali)\b/i.test(extractedText)) mockData.personal.gender = 'male';
    else if (/\b(?:female|महिला|femal)\b/i.test(extractedText)) mockData.personal.gender = 'female';

    // Aadhaar (12 digits)
    const aadhaarMatch = extractedText.match(/(\d{4}\s*\d{4}\s*\d{4})/) || extractedText.match(/(\d{12})/);
    if (aadhaarMatch) mockData.documents.aadhaar = aadhaarMatch[1].replace(/\s/g, '');

    // PAN
    const panMatch = extractedText.match(/([A-Z]{5}\d{4}[A-Z])/i);
    if (panMatch) mockData.documents.pan = panMatch[1].toUpperCase();

    // Phone (10 digits)
    const phoneMatch = extractedText.match(/(\d{10})/);
    if (phoneMatch) mockData.contact.phone = phoneMatch[1];

    // Email
    const emailMatch = extractedText.match(/[^\s\n]+@[^\s\n]+\.[^\s\n]+/i);
    if (emailMatch) mockData.contact.email = emailMatch[0].toLowerCase();

    // Address line
    const addrMatch = extractedText.match(/address:?\s*([^\n]+)/i);
    if (addrMatch) mockData.address.line1 = addrMatch[1].trim();

    // City
    const cityMatch = extractedText.match(/(?:city|शहर):?\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (cityMatch) mockData.address.city = cityMatch[1].trim();

    // State
    const stateMatch = extractedText.match(/(?:state|राज्य):?\s*([A-Za-z\s]+?)(?:\n|$)/i);
    if (stateMatch) mockData.address.state = stateMatch[1].trim();

    // Pincode
    const pinMatch = extractedText.match(/(?:pin|pincode|पिन|zip):?\s*(\d{5,6})/i);
    if (pinMatch) mockData.address.pincode = pinMatch[1];

    // Education
    const qualMatch = extractedText.match(/(?:qualification|degree|education):?\s*([^\n]+)/i);
    if (qualMatch) mockData.education.qualification = qualMatch[1].trim();

    const boardMatch = extractedText.match(/(?:board|university):?\s*([^\n]+)/i);
    if (boardMatch) mockData.education.board = boardMatch[1].trim();

    const yearMatch = extractedText.match(/(?:year|पास):?\s*(\d{4})/i);
    if (yearMatch) mockData.education.year = yearMatch[1];

    const percentMatch = extractedText.match(/(?:percentage|percent|marks):?\s*([\d.]+)\s*%/i);
    if (percentMatch) mockData.education.percentage = percentMatch[1];

    // Employment
    if (/\b(?:employed|job|working|नौकरी)\b/i.test(extractedText)) mockData.employment.status = 'employed';
    else if (/\b(?:unemployed|housewife|student|बेरोजगार)\b/i.test(extractedText)) mockData.employment.status = 'unemployed';

    console.log('🔄 Mock parsed (Hindi+English regex)');
    return mockData;
  }

  // Process a document file
  async processDocument(filePath, documentType = 'general') {
    const ext = path.extname(filePath).toLowerCase();
    const cacheKey = `${filePath}_${documentType}_${ext}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      console.log(`📦 Cache hit for ${filePath}`);
      return cached.data;
    }

    let extractedText = '';
    if (ext === '.pdf') {
      const result = await this.extractTextFromPDF(filePath);
      extractedText = result.text;
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const result = await this.extractTextFromImage(filePath);
      extractedText = result.text;
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    let structuredData;
    if (this.aiAvailable) {
      structuredData = await this.parseWithAI(extractedText, documentType);
      if (!structuredData || !this._hasMeaningfulData(structuredData)) {
        console.log('⚠️ AI empty, using regex fallback');
        structuredData = this.mockParseDocument(extractedText, documentType);
      }
    } else {
      structuredData = this.mockParseDocument(extractedText, documentType);
    }

    const result = { filePath, documentType, extractedText, structuredData, processedAt: new Date() };
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  // Process multiple documents
  async processUserDocuments(userId, documentPaths) {
    const results = [];
    for (const [type, filePath] of Object.entries(documentPaths)) {
      try {
        const result = await this.processDocument(filePath, type);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${type}:`, error);
        results.push({ filePath, documentType: type, error: error.message });
      }
    }
    const mergedData = this.mergeStructuredData(results);
    return { userId, documents: results, mergedData, processedAt: new Date() };
  }

  // Merge structured data from multiple documents
  mergeStructuredData(documentResults) {
    const merged = { personal: {}, contact: {}, address: {}, documents: {}, education: {}, employment: {} };
    for (const result of documentResults) {
      if (result.structuredData) {
        Object.keys(merged).forEach(section => {
          if (result.structuredData[section]) {
            Object.assign(merged[section], result.structuredData[section]);
          }
        });
      }
    }
    return merged;
  }
}

module.exports = { DocumentAIAgent };
