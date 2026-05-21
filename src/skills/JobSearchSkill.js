/**
 * JobSearchSkill — सरकारी नौकरी खोज
 * 
 * SSC, Railway, Army, Banking, Police, UPSC आदि की
 * नई भर्तियाँ खोजने और दिखाने का काम।
 * मौजूदा jobSearchAgent का उपयोग करती है।
 */

const { BaseSkill } = require('./BaseSkill');

class JobSearchSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'job_search';
    this.displayName = 'नौकरी खोज';
    this.displayNameEn = 'Government Job Search';
    this.description = 'सरकारी भर्तियाँ खोजना — SSC, Railway, Army, Banking, Police';
    this.descriptionEn = 'Search government jobs — SSC, Railway, Army, Banking, Police';
    this.version = '1.0.0';
    this.category = 'government';
    this.canRunOffline = false;
    this.requiresAuth = false;
    this.priority = 8;

    this.intents = ['job_search', 'find_vacancy', 'naukri_dhundho', 'latest_bharti', 'ssc_form'];

    this.keywords = {
      hi: ['नौकरी', 'भर्ती', 'वैकेंसी', 'सिपाही', 'फौज', 'रेलवे', 'बैंक', 'पुलिस',
           'परीक्षा', 'एसएससी', 'यूपीएससी', 'आर्मी'],
      en: ['job', 'vacancy', 'recruitment', 'ssc', 'railway', 'army', 'banking', 'police',
           'upsc', 'exam', 'notification', 'apply', 'form'],
      hinglish: ['naukri', 'bharti', 'sipahi', 'fauj', 'bank', 'railway job', 'ssc form',
                 'army bharti', 'police bharti', 'naya form', 'job dhundho', 'vacancy batao']
    };

    // जानी-पहचानी सर्विसेज़
    this.serviceTypes = {
      'ssc': { name: 'SSC CGL/CHSL', agency: 'Staff Selection Commission' },
      'railway': { name: 'Railway RRB', agency: 'Railway Recruitment Board' },
      'army': { name: 'Indian Army', agency: 'Join Indian Army' },
      'banking': { name: 'Banking IBPS/SBI', agency: 'IBPS' },
      'police': { name: 'Police Recruitment', agency: 'State Police' },
      'upsc': { name: 'UPSC Civil Services', agency: 'UPSC' },
      'state_ssc': { name: 'UPSSSC', agency: 'State SSC' }
    };
  }

  async execute(context) {
    const { message, params, userId, io } = context;
    const text = message.toLowerCase();

    // कौन सी सर्विस चाहिए detect करो
    let detectedService = params?.serviceType || null;
    if (!detectedService) {
      for (const [key, info] of Object.entries(this.serviceTypes)) {
        if (text.includes(key)) {
          detectedService = key;
          break;
        }
      }
    }

    // अगर specific service मिली
    if (detectedService && this.serviceTypes[detectedService]) {
      const service = this.serviceTypes[detectedService];
      return this._reply(
        `🔍 *${service.name}* की ताज़ा भर्तियाँ खोज रहा हूँ...\n\n📋 एजेंसी: ${service.agency}\n⏳ कृपया कुछ सेकंड रुकें, मैं डैशबोर्ड अपडेट करूँगा।`,
        { serviceType: detectedService, serviceName: service.name, action: 'search_jobs' },
        'searchJobs'
      );
    }

    // सामान्य job search
    return this._reply(
      '🔍 सरकारी नौकरियाँ खोज रहा हूँ...\n\nआप ये भी बोल सकते हैं:\n• "SSC की भर्ती दिखाओ"\n• "Railway में नौकरी चाहिए"\n• "Army bharti कब है"\n• "Banking exam कौन सा आ रहा है"',
      { action: 'search_all_jobs' },
      'searchJobs'
    );
  }
}

module.exports = { JobSearchSkill };
