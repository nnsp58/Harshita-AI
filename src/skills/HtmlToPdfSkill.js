/**
 * HtmlToPdfSkill — HTML to PDF Converter
 * Converts HTML code, web templates, and files into print-ready A4 PDF documents.
 */
const { BaseSkill } = require('./BaseSkill');

class HtmlToPdfSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'html_to_pdf';
    this.displayName = 'HTML से PDF कनवर्टर';
    this.displayNameEn = 'HTML to PDF Converter';
    this.description = 'HTML कोड, वेब पेज और टेम्पलेट्स को A4 PDF में बदलें';
    this.descriptionEn = 'Convert HTML code, webpages, and templates to A4 PDF';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 2;

    this.intents = [
      'html_to_pdf',
      'convert_html',
      'html_pdf_converter',
      'webpage_to_pdf',
      'html_file_convert'
    ];

    this.visible = true;
    this.type = 'utility';
    this.route = '/workspace/utility/html-to-pdf';

    this.keywords = {
      hi: ['एचटीएमएल से पीडीएफ', 'html को pdf', 'html फाइल कन्वर्ट', 'वेब पेज पीडीएफ'],
      en: ['html to pdf', 'convert html to pdf', 'html to pdf converter', 'webpage to pdf', 'html file to pdf'],
      hinglish: ['html to pdf banao', 'html ko pdf me badlo', 'html pdf convert', 'html se pdf']
    };

    this.requiredAgents = ['HtmlToPdfAgent', 'pdfProcessorAgent'];
  }

  async execute(context) {
    const { message, params } = context;
    const text = (message || '').toLowerCase();

    // Direct conversion request with HTML tags provided
    if (text.includes('<html') || text.includes('<!doctype') || text.includes('<div') || text.includes('<table')) {
      return this._reply(
        '📄 **HTML to PDF Conversion Ready**\n\n' +
        '✅ आपका HTML कोड प्राप्त हो गया है।\n' +
        'मैं इसे A4 प्रिंटेबल PDF फ़ॉर्मेट में रेंडर कर रहा हूँ।\n\n' +
        '• पेज साइज: A4 (Standard)\n' +
        '• मार्जिन: 10mm\n' +
        '• फॉन्ट सपोर्ट: Unicode & Devanagari Hindi\n\n' +
        'नीचे दिए गए बटन से PDF डाउनलोड करें:',
        { mode: 'html_render_preview', rawHtml: message, action: 'render_pdf' },
        'openPdfPreview'
      );
    }

    // Standard guidance and tool launcher
    return this._reply(
      '🔄 **HTML to PDF Converter (Harshita AI)**\n\n' +
      'मैं आपके HTML कोड या वेब डिज़ाइन को तुरंत हाई-क्वालिटी PDF में बदल सकती हूँ:\n\n' +
      '• 📄 **Raw HTML Code:** अपना HTML/CSS कोड यहाँ पेस्ट करें\n' +
      '• 🌐 **Web Page / URL:** किसी भी वेब पेज का लिंक भेजें\n' +
      '• 📁 **HTML File Upload:** अपनी `.html` फ़ाइल अपलोड करें\n\n' +
      '💡 *टिप:* आप सीधे अपना HTML कोड चैट में भेज सकते हैं या फ़ाइल अपलोड कर सकते हैं।',
      { mode: 'html_to_pdf', action: 'open_converter', accept: '.html,.htm,.txt' },
      'openHtmlUploader'
    );
  }
}

module.exports = { HtmlToPdfSkill };
