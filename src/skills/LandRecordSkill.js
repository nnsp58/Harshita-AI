/**
 * LandRecordSkill — भूलेख / ज़मीन रिकॉर्ड
 */
const { BaseSkill } = require('./BaseSkill');

class LandRecordSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'land_record';
    this.displayName = 'भूलेख / ज़मीन रिकॉर्ड';
    this.displayNameEn = 'Land Record / Bhulekh';
    this.description = 'खसरा, खतौनी, भूलेख और ज़मीन रजिस्ट्री जानकारी';
    this.descriptionEn = 'Khasra, Khatauni, Bhulekh and land registry information';
    this.version = '1.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.priority = 6;
    this.intents = ['land_record', 'bhulekh', 'khasra', 'khatauni', 'zameen'];
    this.keywords = {
      hi: ['भूलेख', 'खसरा', 'खतौनी', 'ज़मीन', 'जमीन', 'रजिस्ट्री', 'पट्टा', 'भूमि'],
      en: ['land', 'bhulekh', 'khasra', 'khatauni', 'plot', 'registry', 'property'],
      hinglish: ['zameen ka record', 'bhulekh nikalo', 'khasra khatauni', 'land record check']
    };
    this.requiredAgents = ['landRecordAgent'];
  }

  async execute(context) {
    const { message } = context;
    const text = message.toLowerCase();

    if (text.includes('khasra') || text.includes('खसरा') || text.includes('khatauni') || text.includes('खतौनी')) {
      return this._reply('🗺️ खसरा/खतौनी निकालने के लिए बताएं:\n1. जिला\n2. तहसील\n3. गाँव का नाम\n4. खाता संख्या (अगर पता हो)', { mode: 'khasra', step: 'collect' });
    }

    return this._reply('🏞️ भूलेख / ज़मीन सेवा:\n• "खसरा खतौनी निकालो"\n• "ज़मीन का रिकॉर्ड दिखाओ"\n• "रजिस्ट्री की जानकारी"\n\nक्या चाहिए?', { mode: 'land_menu' });
  }
}

module.exports = { LandRecordSkill };
