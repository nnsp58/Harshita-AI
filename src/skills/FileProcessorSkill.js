/**
 * FileProcessorSkill — फाइल प्रोसेसिंग और ऑप्टिमाइजेशन
 * 
 * Capabilities:
 *   - Image compress (resize using sharp or jimp if available)
 *   - Image to PDF conversion guidance
 *   - File size check
 *   - Format detection and guidance
 * 
 * Note: Actual heavy processing (sharp/jimp) happens via the FileProcessorAgent.
 * This skill handles the conversational flow, guides the user, and routes
 * uploaded files to the agent.
 */
const { BaseSkill } = require('./BaseSkill');
const path = require('path');
const fs = require('fs');

class FileProcessorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'file_processor';
    this.displayName = 'फाइल प्रोसेसर';
    this.displayNameEn = 'File Processor';
    this.description = 'PDF छोटा करना, फोटो कन्वर्ट करना और फाइल मैनेज करना';
    this.descriptionEn = 'Compress PDF, convert photos and manage files';
    this.version = '2.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 4;

    // Refined intents — more specific to avoid false-positive routing
    this.intents = ['compress_file', 'convert_file', 'image_to_pdf', 'resize_photo', 'file_processor'];

    // Refined keywords — use multi-word phrases to avoid broad matches
    this.keywords = {
      hi: ['फाइल छोटी करो', 'कंप्रेस करो', 'फाइल कन्वर्ट करो', 'पीडीएफ बनाओ', 'फाइल साइज कम करो'],
      en: ['compress file', 'convert file', 'reduce file size', 'image to pdf', 'compress pdf'],
      hinglish: ['file chhoti karo', 'pdf me badlo', 'file size kam karo', 'file compress karo',
                 'photo ko pdf banao']
    };
    this.requiredAgents = ['fileProcessorAgent', 'pdfProcessorAgent'];

    // Supported formats
    this.supportedFormats = {
      image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
      document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'],
    };
  }

  async execute(context) {
    const { message, params } = context;
    const text = (message || '').toLowerCase();

    // If user uploaded a file (via params or context)
    if (params?.filePath || params?.fileName) {
      return this._handleUploadedFile(params);
    }

    // If the request explicitly asks for passport or joint photo, it was misrouted.
    // Advise the user to open the tools hub or route internally.
    if (/passport|पासपोर्ट|joint|जॉइंट/i.test(text)) {
      return this._reply(
        '📸 *Passport Photo Maker*\n\nमैंने पासपोर्ट/जॉइंट फोटो टूल खोल दिया है।',
        { mode: 'open_tool', toolName: 'PassportPhotoMaker', toolProps: { defaultType: 'portrait' } }
      );
    }

    // Compress request
    if (/compress|छोटी|छोटा|chhoti|chhota|reduce.*size|size.*kam|साइज.*कम|कम.*साइज/i.test(text)) {
      const isImage = /photo|image|फोटो|तस्वीर|jpg|jpeg|png/i.test(text);
      const isPDF = /pdf|पीडीएफ/i.test(text);

      if (isImage) {
        return this._reply(
          '📸 *Image Compress Mode*\n\n' +
          'अपनी फोटो अपलोड करें (JPG/PNG/WebP)\n\n' +
          '🎯 Compression Options:\n' +
          '• *Low* — 80% quality (थोड़ा कम साइज)\n' +
          '• *Medium* — 60% quality (अच्छा कम साइज) ← Default\n' +
          '• *High* — 40% quality (बहुत कम साइज, quality loss)\n\n' +
          '📏 Max upload size: 10MB\n' +
          '📁 Supported: JPG, PNG, WebP, GIF, BMP',
          { mode: 'compress_image', action: 'upload_document' },
          'openUploader'
        );
      }

      if (isPDF) {
        return this._reply(
          '📄 *PDF Compress Mode*\n\n' +
          'अपनी PDF फाइल अपलोड करें\n\n' +
          'मैं PDF में:\n' +
          '• Images optimize करूँगा\n' +
          '• Unused objects हटाऊंगा\n' +
          '• File size कम करूँगा\n\n' +
          '📏 Max upload size: 10MB',
          { mode: 'compress_pdf', action: 'upload_document' },
          'openUploader'
        );
      }

      // PDF to Word & Image to PDF logic
      if (/word|docx|extract|image to pdf/i.test(text)) {
        return this._reply(
          '📄 *Document Converter*\n\nमैंने डॉक्यूमेंट कन्वर्टर टूल खोल दिया है। यहाँ से आप PDF से Word निकाल सकते हैं या Images को PDF में बदल सकते हैं।',
          { mode: 'open_tool', toolName: 'DocumentConverter' }
        );
      }

      // Generic compress
      return this._reply(
        '📦 *File Compress Mode*\n\nमैंने File Compressor टूल खोल दिया है। यहाँ आप कितनी भी फाइल्स को बल्क में छोटी (compress) कर सकते हैं।',
        { mode: 'open_tool', toolName: 'FileCompressor' }
      );
    }

    // Convert request
    if (/convert|बदलो|badlo|image.*to.*pdf|photo.*to.*pdf|jpg.*to.*pdf|png.*to.*pdf|फोटो.*पीडीएफ/i.test(text)) {
      return this._reply(
        '🔄 *File Converter*\n\n' +
        'मैं ये conversions कर सकता हूँ:\n\n' +
        '📸 → 📄 *Image to PDF*\n' +
        '• JPG/PNG/WebP photos → single PDF\n\n' +
        '📄 → 📸 *PDF to Image*\n' +
        '• PDF pages → individual JPG images\n\n' +
        'कृपया अपनी file upload करें:',
        { mode: 'convert', action: 'upload_document' },
        'openUploader'
      );
    }

    // Resize request
    if (/resize|साइज|dimensions|pixel|100kb|50kb|20kb|200kb/i.test(text)) {
      // Extract target size if mentioned
      const sizeMatch = text.match(/(\d+)\s*(?:kb|KB)/);
      const targetSizeKB = sizeMatch ? parseInt(sizeMatch[1]) : null;

      return this._reply(
        `📏 *Image Resize Mode*\n\n` +
        `${targetSizeKB ? `🎯 Target size: ${targetSizeKB}KB\n\n` : ''}` +
        `अपनी फोटो upload करें, मैं resize कर दूँगा।\n\n` +
        `सरकारी फॉर्म के लिए common sizes:\n` +
        `• Passport Photo: 200KB (3.5x4.5 cm)\n` +
        `• SSC Photo: 100KB (3.5x4.5 cm)\n` +
        `• Signature: 50KB (3.5x1.5 cm)\n` +
        `• General: 20KB-50KB`,
        { mode: 'resize', targetSizeKB, action: 'upload_document' },
        'openUploader'
      );
    }

    // Default menu
    return this._reply(
      '📁 *फाइल प्रोसेसिंग सेवा (File Processor)*\n\n' +
      'मैं ये काम कर सकता हूँ:\n\n' +
      '📸 *Image:*\n' +
      '• \"Photo compress karo\" — फोटो साइज कम\n' +
      '• \"Photo resize 100KB\" — exact साइज बनाओ\n' +
      '• \"Photo to PDF\" — फोटो → PDF\n\n' +
      '📄 *PDF:*\n' +
      '• \"PDF compress karo\" — PDF साइज कम\n' +
      '• \"PDF to image\" — PDF → Photos\n\n' +
      'या सीधे file upload करें!',
      { mode: 'file_menu' }
    );
  }

  /**
   * Handle an uploaded file — detect type and process
   */
  _handleUploadedFile(params) {
    const { filePath, fileName, fileSize } = params;
    const ext = path.extname(fileName || '').toLowerCase();
    const sizeMB = fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : 'Unknown';

    if (this.supportedFormats.image.includes(ext)) {
      return this._reply(
        `📸 *${fileName}* received! (${sizeMB} MB)\n\n` +
        `File type: Image (${ext.toUpperCase()})\n\n` +
        `क्या करना है?\n` +
        `• \"Compress karo\" — साइज कम\n` +
        `• \"100KB resize\" — exact size\n` +
        `• \"PDF banao\" — image → PDF\n\n` +
        `बस बोलिए!`,
        { mode: 'file_received', fileType: 'image', filePath, fileName }
      );
    }

    if (ext === '.pdf') {
      return this._reply(
        `📄 *${fileName}* received! (${sizeMB} MB)\n\n` +
        `File type: PDF\n\n` +
        `क्या करना है?\n` +
        `• \"Compress karo\" — PDF साइज कम\n` +
        `• \"Image banao\" — PDF → photos\n\n` +
        `बस बोलिए!`,
        { mode: 'file_received', fileType: 'pdf', filePath, fileName }
      );
    }

    return this._reply(
      `📂 *${fileName}* received! (${sizeMB} MB)\n\n` +
      `File type: ${ext.toUpperCase() || 'Unknown'}\n\n` +
      `⚠️ यह format अभी supported नहीं है।\n\n` +
      `Supported formats:\n` +
      `• Images: JPG, PNG, WebP, GIF, BMP\n` +
      `• Documents: PDF`,
      { mode: 'unsupported_format', fileType: ext }
    );
  }
}

module.exports = { FileProcessorSkill };
