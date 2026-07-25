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

    this.visible = true;
    this.type = 'application';
    this.route = '/service/land_record';
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
      return this._reply(
        '🗺️ *खसरा/खतौनी निकालने के लिए ये जानकारी बताएं:*\n\n' +
        '1. जिला / District: ____________________\n' +
        '2. तहसील / Tehsil: ____________________\n' +
        '3. गाँव का नाम / Village: ____________________\n' +
        '4. खाता संख्या / Khata No.: ____________________ (अगर पता हो)\n' +
        '5. खसरा/गाटा संख्या / Khasra No.: ____________________ (अगर पता हो)\n' +
        '6. मालिक का नाम / Owner Name: ____________________\n' +
        '7. आधार संख्या / Aadhaar No.: ____________________ (optional)\n\n' +
        '💡 राज्य-वार पोर्टल लिंक:\n' +
        '• [UP Bhulekh](https://upbhulekh.gov.in)\n' +
        '• [MP Bhulekh](https://mpbhulekh.gov.in)\n' +
        '• [Bihar Bhulekh](https://biharbhumi.bihar.gov.in)\n' +
        '• [Rajasthan Apna Khata](https://apnakhata.raj.nic.in)',
        { mode: 'khasra', step: 'collect' }
      );
    }

    if (text.includes('registry') || text.includes('रजिस्ट्री') || text.includes('registration')) {
      return this._reply(
        '🏛️ *ज़मीन रजिस्ट्री जानकारी*\n\n' +
        'रजिस्ट्री के लिए ये दस्तावेज़ ज़रूरी हैं:\n' +
        '• विक्रेता और क्रेता का आधार कार्ड / Aadhaar: ____________________\n' +
        '• पैन कार्ड / PAN: ____________________\n' +
        '• खसरा खतौनी की नकल\n' +
        '• स्टाम्प ड्यूटी (राज्य अनुसार)\n' +
        '• 2 पासपोर्ट साइज़ फोटो\n' +
        '• 2 गवाह + उनके आधार कार्ड\n\n' +
        '📍 नज़दीकी उप-निबंधक (Sub-Registrar) कार्यालय जाएं।',
        { mode: 'registry', step: 'info' }
      );
    }

    return this._reply(
      '🏞️ *भूलेख / ज़मीन सेवा (Land Record Service)*\n\n' +
      'मुझसे क्या काम है? बस बोलें:\n\n' +
      '📋 *उपलब्ध सेवाएँ:*\n' +
      '• "खसरा खतौनी निकालो" — भूलेख रिकॉर्ड\n' +
      '• "ज़मीन का रिकॉर्ड दिखाओ" — भू-नक्शा\n' +
      '• "रजिस्ट्री की जानकारी" — पंजीकरण प्रक्रिया\n' +
      '• "नामांतरण कैसे करें" — म्यूटेशन गाइड\n\n' +
      '🔗 *ज़रूरी पोर्टल:*\n' +
      '• [UP Bhulekh](https://upbhulekh.gov.in)\n' +
      '• [MP Bhulekh](https://mpbhulekh.gov.in)\n' +
      '• [Bihar Bhumi](https://biharbhumi.bihar.gov.in)\n\n' +
      'क्या चाहिए?',
      { mode: 'land_menu' }
    );
  }
}

module.exports = { LandRecordSkill };
