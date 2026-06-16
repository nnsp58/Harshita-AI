/**
 * UIBuilderSkill — डायनेमिक UI और कंपोनेंट जनरेशन
 */
const { BaseSkill } = require('./BaseSkill');
const { UIBuilderAgent } = require('../agents/uiBuilderAgent');

class UIBuilderSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'ui_builder';
    this.displayName = 'UI बिल्डर';
    this.displayNameEn = 'UI Builder';
    this.description = 'कस्टम डैशबोर्ड और इंटरफ़ेस कंपोनेंट्स बनाना';
    this.descriptionEn = 'Create custom dashboards and interface components';
    this.version = '1.0.0';
    this.category = 'system';
    this.canRunOffline = true;
    this.priority = 4;
    this.intents = ['build_ui', 'create_dashboard', 'ui_component', 'customize_view'];
    this.keywords = {
      hi: ['डैशबोर्ड', 'UI', 'बनाओ', 'डिज़ाइन', 'इंटरफ़ेस', 'बिल्डर'],
      en: ['ui', 'builder', 'dashboard', 'design', 'component', 'interface'],
      hinglish: ['naya dashboard banao', 'ui design karo', 'component add karo']
    };
    this.requiredAgents = ['uiBuilderAgent'];
    this.agent = new UIBuilderAgent();
  }

  async execute(context) {
    const { message } = context;
    const text = message || '';

    // Check if the query is a descriptive request or a generic question/capability check
    const hasStructuralKeywords = /(menu|sidebar|layout|theme|grid|panel|column|row|button|form|input|chart|table|visual|card|color|dark|light|blue|green|red|black|white|admin|list|ग्रिड|कार्ड|डार्क|थीम|पैनल|कलर|बटन|लेआउट|चार्ट|सूची)/i.test(text);
    const isQuestion = /(kya\s+aap|क्या\s+आप|sakte\s+ho|sakte\s+hai|sakte\s+ha|sakta\s+hu|can\s+you|how\s+to|how\s+do)/i.test(text);
    const isDescriptive = hasStructuralKeywords || (text.length > 25 && !isQuestion);

    if (!isDescriptive) {
      return this._reply('🎨 UI बिल्डर मोड सक्रिय है।\n\nआप मुझे बता सकते हैं कि आपको किस तरह का लेआउट चाहिए (जैसे: "3 कार्ड वाला ग्रिड" या "डार्क थीम चार्ट")।', { action: 'ui_design_start' });
    }

    try {
      // Determine pageType if possible
      let pageType = 'custom';
      if (/dashboard|डैशबोर्ड/i.test(text)) pageType = 'dashboard';
      else if (/form|फॉर्म/i.test(text)) pageType = 'form';
      else if (/report|रिपोर्ट/i.test(text)) pageType = 'report';
      else if (/portfolio/i.test(text)) pageType = 'portfolio';
      else if (/tool|कैलकुलेटर/i.test(text)) pageType = 'tool';
      else if (/landing|लैंडिंग/i.test(text)) pageType = 'landing';

      const result = await this.agent.generatePage(text, pageType, {}, { language: 'both' });

      if (result.success) {
        return this._reply(`[रूटिंग सफल] ${result.message}`, {
          action: 'ui_design_success',
          filePath: result.filePath,
          fileName: result.fileName
        });
      } else {
        return this._reply(`[रूटिंग सफल] ❌ UI generation failed: ${result.message}`);
      }
    } catch (err) {
      console.error('[UIBuilderSkill] Error generating UI page:', err.message);
      return this._reply(`[रूटिंग सफल] ❌ Error: UI builder task failed. Details: ${err.message}`);
    }
  }
}

module.exports = { UIBuilderSkill };
