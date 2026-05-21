/**
 * WebLearningSkill — वेब लर्निंग और पोर्टल ट्रेनिंग
 */
const { BaseSkill } = require('./BaseSkill');

class WebLearningSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'web_learning';
    this.displayName = 'वेब लर्निंग';
    this.displayNameEn = 'Web Learning & Training';
    this.description = 'नये पोर्टल और वेबसाइट्स से डेटा निकालना और ट्रेनिंग लेना';
    this.descriptionEn = 'Extract data and learn from new portals/websites';
    this.version = '1.0.0';
    this.category = 'automation';
    this.canRunOffline = false;
    this.priority = 5;
    this.intents = ['learn_site', 'web_extract', 'train_bot', 'analyze_portal'];
    this.keywords = {
      hi: ['लर्निंग', 'वेबसाइट', 'सीखो', 'पोर्टल', 'ट्रेनिंग', 'analyze'],
      en: ['learn', 'extract', 'train', 'portal', 'analyze', 'scrape'],
      hinglish: ['website se seekho', 'portal analyze karo', 'naya site train karo']
    };
    this.requiredAgents = ['webLearningAgent', 'selectorDiscoveryAgent'];
  }

  async execute(context) {
    const { message } = context;
    
    return this._reply('🌐 वेब लर्निंग मोड ऑन है।\n\nकृपया उस वेबसाइट का URL दें जिसे आप मुझे सिखाना चाहते हैं। मैं उसके फॉर्म और बटन्स को ऑटोमैटिकली एनालाइज कर लूँगा।', { action: 'await_url' });
  }
}

module.exports = { WebLearningSkill };
