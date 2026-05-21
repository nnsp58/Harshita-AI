/**
 * FileProcessorSkill — फाइल प्रोसेसिंग और ऑप्टिमाइजेशन
 */
const { BaseSkill } = require('./BaseSkill');

class FileProcessorSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'file_processor';
    this.displayName = 'फाइल प्रोसेसर';
    this.displayNameEn = 'File Processor';
    this.description = 'PDF छोटा करना, फोटो कन्वर्ट करना और फाइल मैनेज करना';
    this.descriptionEn = 'Compress PDF, convert photos and manage files';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 4;
    this.intents = ['compress_file', 'convert_pdf', 'image_to_pdf', 'resize_photo'];
    this.keywords = {
      hi: ['छोटा', 'साइज', 'कन्वर्ट', 'फोटो', 'पीडीएफ', 'कंप्रेस'],
      en: ['compress', 'convert', 'resize', 'optimize', 'pdf', 'image'],
      hinglish: ['file chhoti karo', 'pdf me badlo', 'photo size kam karo']
    };
    this.requiredAgents = ['fileProcessorAgent', 'pdfProcessorAgent'];
  }

  async execute(context) {
    return this._reply('📁 फाइल प्रोसेसर:\n\nकृपया वो फाइल अपलोड करें जिसे आप कंप्रेस या कन्वर्ट करना चाहते हैं। (Max: 10MB)', { action: 'await_file_upload' });
  }
}

module.exports = { FileProcessorSkill };
