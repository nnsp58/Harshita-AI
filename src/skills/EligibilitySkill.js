/**
 * EligibilitySkill — योग्यता / पात्रता जाँच
 */
const { BaseSkill } = require('./BaseSkill');

class EligibilitySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'eligibility_check';
    this.displayName = 'पात्रता जाँच';
    this.displayNameEn = 'Eligibility Check';
    this.description = 'सरकारी योजनाओं और नौकरियों की पात्रता जाँचना';
    this.descriptionEn = 'Check eligibility for government schemes and jobs';
    this.version = '1.0.0';
    this.category = 'government';
    this.canRunOffline = true;
    this.priority = 6;
    this.intents = ['eligibility_check', 'yogyata_check', 'am_i_eligible', 'qualification_check'];
    this.keywords = {
      hi: ['योग्य', 'योग्यता', 'पात्रता', 'उम्र सीमा', 'क्वालिफिकेशन', 'पात्र'],
      en: ['eligible', 'eligibility', 'qualification', 'age limit', 'criteria', 'qualify'],
      hinglish: ['yogya hu', 'eligibility check', 'qualification check', 'age limit kya hai', 'paatra hu']
    };
    this.requiredAgents = ['eligibilityAgent'];
  }

  async execute(context) {
    const { message, params } = context;
    const text = message.toLowerCase();

    // कोई specific service/scheme का नाम आया
    const service = params?.service || null;
    if (service) {
      return this._reply(
        `🔍 *${service}* की पात्रता जाँच:\n\nकृपया बताएं:\n1. आपकी उम्र\n2. शिक्षा (10th/12th/Graduate)\n3. कैटेगरी (General/OBC/SC/ST)\n\nमैं बता दूँगा कि आप पात्र हैं या नहीं।`,
        { mode: 'eligibility', service, step: 'collect_info' }
      );
    }

    return this._reply(
      '✅ पात्रता जाँच सेवा:\n\nबताएं किसकी पात्रता जाँचनी है:\n• "SSC के लिए eligible हूँ क्या?"\n• "Army की age limit क्या है?"\n• "PMEGP loan के लिए yogya हूँ?"\n\nकिस सर्विस/योजना की जाँच करनी है?',
      { mode: 'eligibility_menu' }
    );
  }
}

module.exports = { EligibilitySkill };
