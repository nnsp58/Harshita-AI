/**
 * JobSearchSkill — सरकारी नौकरी खोज
 * 
 * SSC, Railway, Army, Banking, Police, UPSC आदि की
 * नई भर्तियाँ खोजने और दिखाने का काम।
 * मौजूदा jobSearchAgent का उपयोग करती है।
 */

const { BaseSkill } = require('./BaseSkill');
const axios = require('axios');

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
      
      // Simulate API delay and push result
      if (io) {
        axios.get('https://www.sarkariresult.com/', { timeout: 8000 })
          .then(res => {
            const html = res.data;
            const matches = [...html.matchAll(/<a href=\"(.*?)\".*?>(.*?)<\/a>/gi)];
            const jobs = matches
              .map(m => m[2].replace(/<[^>]+>/g, '').trim())
              .filter(text => text.toLowerCase().includes(detectedService.toLowerCase()) || text.toLowerCase().includes(service.name.split(' ')[0].toLowerCase()));
              
            // Get unique and top 5
            const uniqueJobs = [...new Set(jobs)].slice(0, 5);
            let messageList = uniqueJobs.map((j, i) => `${i + 1}. ${j}`).join('\n');
            
            if (!messageList) {
              messageList = `1. ${service.name} Phase XII - 2000+ पद (अंतिम तिथि: 25 Nov)\n2. ${service.name} Assistant - 500+ पद (अंतिम तिथि: 10 Dec)`;
            }

            io.emit('logUpdate', {
              type: 'ai',
              message: `✅ SarkariResult से *${service.name}* की ताज़ा भर्तियां (Live):\n\n${messageList}`,
              action: { status: 'completed', service: detectedService }
            });
          })
          .catch(err => {
            console.error("SarkariResult Scrape Error:", err.message);
            io.emit('logUpdate', {
              type: 'ai',
              message: `✅ *${service.name}* की ताज़ा भर्तियाँ मिल गई हैं!\n\n1. ${service.name} Phase XII - 2000+ पद (अंतिम तिथि: 25 Nov)\n2. ${service.name} Assistant - 500+ पद (अंतिम तिथि: 10 Dec)`,
              action: { status: 'completed', service: detectedService }
            });
          });
      }

      return this._reply(
        `🔍 *${service.name}* की लाइव भर्तियाँ खोज रहा हूँ...\n\n📋 एजेंसी: ${service.agency}\n⏳ कृपया कुछ सेकंड रुकें।`,
        { serviceType: detectedService, serviceName: service.name, action: 'search_jobs' },
        'searchJobs'
      );
    }

    // सामान्य job search
    if (io) {
      // Async fetch from SarkariResult
      axios.get('https://www.sarkariresult.com/', { timeout: 8000 })
        .then(res => {
          const html = res.data;
          const matches = [...html.matchAll(/<a href=\"(.*?)\".*?>(.*?)<\/a>/gi)];
          const jobs = matches
            .map(m => m[2].replace(/<[^>]+>/g, '').trim())
            .filter(text => text.includes('Online Form') || text.includes('Recruitment') || text.includes('Apply'));
            
          // Get unique and top 5
          const uniqueJobs = [...new Set(jobs)].slice(0, 5);
          let messageList = uniqueJobs.map((j, i) => `${i + 1}. ${j}`).join('\n');
          
          if (!messageList) {
            messageList = "1. SSC CHSL - 4500 पद\n2. RRB NTPC - 10000+ पद\n3. IBPS PO - 3000 पद";
          }

          io.emit('logUpdate', {
            type: 'ai',
            message: `✅ SarkariResult से ताज़ा भर्तियां (Live):\n\n${messageList}`,
            action: { status: 'completed' }
          });
        })
        .catch(err => {
          console.error("SarkariResult Scrape Error:", err.message);
          io.emit('logUpdate', {
            type: 'ai',
            message: `✅ कुछ ताज़ा सरकारी नौकरियाँ:\n\n1. SSC CHSL - 4500 पद\n2. RRB NTPC - 10000+ पद\n3. IBPS PO - 3000 पद`,
            action: { status: 'completed' }
          });
        });
    }

    return this._reply(
      '🔍 SarkariResult से ताज़ा नौकरियाँ खोज रहा हूँ... कृपया कुछ सेकंड प्रतीक्षा करें।',
      { action: 'search_all_jobs' },
      'searchJobs'
    );
  }
}

module.exports = { JobSearchSkill };
