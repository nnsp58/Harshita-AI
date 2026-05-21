/**
 * BulkImportSkill — बल्क डेटा इम्पोर्ट (Excel/CSV)
 */
const { BaseSkill } = require('./BaseSkill');

class BulkImportSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'bulk_import';
    this.displayName = 'बल्क इम्पोर्ट';
    this.displayNameEn = 'Bulk Data Import';
    this.description = 'Excel या CSV फाइल से डेटा बल्क में लोड करना';
    this.descriptionEn = 'Bulk load data from Excel or CSV files';
    this.version = '1.0.0';
    this.category = 'data';
    this.canRunOffline = false;
    this.priority = 7;
    this.intents = ['bulk_import', 'excel_upload', 'csv_import', 'batch_process'];
    this.keywords = {
      hi: ['इम्पोर्ट', 'बल्क', 'एक्सेल', 'फाइल', 'अपलोड', 'batch'],
      en: ['bulk', 'import', 'excel', 'csv', 'upload', 'batch'],
      hinglish: ['excel file upload karo', 'bulk me data dalo', 'csv import karo']
    };
    this.requiredAgents = ['bulkImportAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('excel') || text.includes('एक्सेल') || text.includes('csv')) {
      return this._reply('📊 बल्क इम्पोर्ट के लिए अपनी Excel (.xlsx) या CSV फाइल यहाँ ड्रॉप करें। क्या आपके पास फॉर्मेट रेडी है?', { action: 'await_file', type: 'spreadsheet' });
    }

    return this._reply('📁 बल्क इम्पोर्ट सेवा:\n• "Excel फाइल अपलोड करो"\n• "डेटा इम्पोर्ट करो"\n• "सैंपल फॉर्मेट डाउनलोड करो"\n\nक्या मैं आपकी मदद करूँ?', { mode: 'bulk_menu' });
  }
}

module.exports = { BulkImportSkill };
