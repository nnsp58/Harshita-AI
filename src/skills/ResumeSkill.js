/**
 * ResumeSkill — प्रोफेशनल रिज्यूमे / बायोडाटा बनाने की स्किल
 */
const { BaseSkill } = require('./BaseSkill');
const { generateResumePDF } = require('../utils/pdf/resumeGenerator');
const fs = require('fs');
const path = require('path');

class ResumeSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'resume_maker';
    this.displayName = 'रिज्यूमे / बायोडाटा मेकर';
    this.displayNameEn = 'Resume Builder';
    this.description = 'प्रोफेशनल रिज्यूमे और बायोडाटा बनाना (ATS फ्रेंडली)';
    this.descriptionEn = 'Create professional and ATS-friendly resumes/CVs';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = true;

    this.intents = ['create_resume', 'update_resume', 'resume_status'];

    this.keywords = {
      hi: ['रिज्यूमे', 'बायोडाटा', 'सीवी', 'नौकरी के लिए पर्चा', 'resume बनाओ', 'biodata बनाओ'],
      en: ['resume', 'cv', 'biodata', 'curriculum vitae', 'create resume', 'make cv'],
      hinglish: ['resume banao', 'cv banao', 'biodata chahiye', 'naukri ke liye resume']
    };
  }

  async execute(context) {
    const { message, params, userId } = context;
    const text = message.toLowerCase();

    // अगर यूज़र ने अपना नाम बताया है (Simulated data for now)
    if (text.includes('मेरा नाम') || text.includes('my name is')) {
      const name = text.split('नाम')[1] || text.split('is')[1] || 'User';
      
      try {
        const data = {
          personalInfo: { name: name.trim(), email: `${userId}@csc.in`, phone: '99999-XXXXX' },
          summary: { text: 'एक मेहनती और पेशेवर व्यक्ति जो नई चुनौतियों के लिए तैयार है।' },
          skills: [{ name: 'Computer Basics' }, { name: 'Data Entry' }],
          experience: [{ company: 'Local CSC Center', role: 'Operator', duration: '2023-Present', description: ['Form filling', 'Customer support'] }]
        };

        const buffer = await generateResumePDF(data);
        const fileName = `resume_${userId}_${Date.now()}.pdf`;
        const filePath = path.join(process.cwd(), 'exports', 'resumes', fileName);
        
        fs.writeFileSync(filePath, buffer);

        return this._reply(
          `✅ बधाई हो! आपका रिज्यूमे ड्राफ्ट तैयार हो गया है।\n\n📂 फाइल: *${fileName}*\n📍 पाथ: \`exports/resumes/\`\n\nक्या आप इसमें कुछ और जोड़ना चाहते हैं? (जैसे Experience या Education)`
        );
      } catch (error) {
        return this._reply('❌ रिज्यूमे बनाने में कुछ दिक्कत आई। कृपया फिर से कोशिश करें।');
      }
    }

    return this._reply(
      '📄 *Harshita AI रिज्यूमे बिल्डर* में आपका स्वागत है!\n\nमैं आपका प्रोफेशनल रिज्यूमे बना सकती हूँ।\n\nशुरू करने के लिए अपना *पूरा नाम* बताएं!\n(उदाहरण: "मेरा नाम राहुल कुमार है")'
    );
  }
}

module.exports = { ResumeSkill };
