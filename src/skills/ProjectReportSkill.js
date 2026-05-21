/**
 * ProjectReportSkill — बिजनेस प्रोजेक्ट रिपोर्ट (PMEGP/मुद्रा)
 */
const { BaseSkill } = require('./BaseSkill');

class ProjectReportSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'project_report';
    this.displayName = 'प्रोजेक्ट रिपोर्ट';
    this.displayNameEn = 'Business Project Report';
    this.description = 'PMEGP/मुद्रा लोन के लिए बिजनेस प्रोजेक्ट रिपोर्ट बनाना';
    this.descriptionEn = 'Generate business project reports for PMEGP/Mudra loans';
    this.version = '1.0.0';
    this.category = 'document';
    this.canRunOffline = false;
    this.priority = 6;
    this.intents = ['project_report', 'business_plan', 'pmegp_report', 'mudra_loan'];
    this.keywords = {
      hi: ['प्रोजेक्ट रिपोर्ट', 'बिजनेस प्लान', 'लोन', 'मुद्रा', 'उद्योग', 'व्यापार'],
      en: ['project report', 'business plan', 'pmegp', 'mudra', 'loan', 'enterprise'],
      hinglish: ['project report banao', 'business plan chahiye', 'mudra loan', 'pmegp form']
    };
    this.requiredAgents = ['projectReportAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('pmegp')) {
      return this._reply('📊 PMEGP प्रोजेक्ट रिपोर्ट बनाने के लिए बताएं:\n1. बिजनेस का नाम\n2. किस तरह का बिजनेस\n3. कितना लोन चाहिए\n4. आवेदक का नाम', { mode: 'pmegp_report', step: 'collect' });
    }

    if (text.includes('mudra') || text.includes('मुद्रा')) {
      return this._reply('🏦 मुद्रा लोन रिपोर्ट — बताएं:\n1. शिशु/किशोर/तरुण कौन सा लोन\n2. बिजनेस का प्रकार\n3. लोन राशि', { mode: 'mudra_report', step: 'collect' });
    }

    return this._reply('📊 प्रोजेक्ट रिपोर्ट सेवा:\n• "PMEGP रिपोर्ट बनाओ"\n• "मुद्रा लोन रिपोर्ट"\n• "बिजनेस प्लान बनाओ"\n\nकिस scheme के लिए?', { mode: 'report_menu' });
  }
}

module.exports = { ProjectReportSkill };
