/**
 * RationCardSkill — राशन कार्ड आवेदन
 */
const { BaseSkill } = require('./BaseSkill');

class RationCardSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'ration_card';
    this.displayName = 'राशन कार्ड';
    this.displayNameEn = 'Ration Card Application';
    this.description = 'राशन कार्ड (BPL/APL) आवेदन और स्टेटस';
    this.descriptionEn = 'Ration card application and status';
    this.version = '1.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.priority = 7;
    this.intents = ['ration_card', 'rashan_card', 'bpl_card'];
    this.keywords = {
      hi: ['राशन', 'बीपीएल', 'खाद्य', 'राशन कार्ड'],
      en: ['ration', 'bpl', 'apl', 'nfsa', 'ration card'],
      hinglish: ['rashan card', 'ration card banwao', 'bpl card']
    };
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('status') || text.includes('स्टेटस')) {
      return this._reply('🔍 राशन कार्ड स्टेटस चेक — कृपया *आवेदन नंबर* या *आधार नंबर* बताएं।', { mode: 'ration_status' });
    }

    if (text.includes('नया') || text.includes('banwao') || text.includes('new')) {
      return this._reply('📝 नया राशन कार्ड — कृपया पहले *आधार कार्ड* की फोटो भेजें।', { mode: 'ration_apply' }, 'openUploader');
    }

    return this._reply('🍚 राशन कार्ड सेवा:\n• "नया राशन कार्ड बनवाओ"\n• "स्टेटस चेक करो"\n\nक्या करना है?', { mode: 'ration_menu' });
  }
}

module.exports = { RationCardSkill };
