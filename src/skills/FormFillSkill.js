/**
 * FormFillSkill — सरकारी फॉर्म ऑटो-भरना (Browser Automation)
 * 
 * Playwright से सरकारी पोर्टल्स पर जाकर फॉर्म भरती है।
 * SSC, Railway, Army, Banking, Police आदि के फॉर्म।
 * मौजूदा browserAgent और controllerAgent का उपयोग।
 */

const { BaseSkill } = require('./BaseSkill');

class FormFillSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'form_fill';
    this.displayName = 'फॉर्म ऑटो-भरना';
    this.displayNameEn = 'Auto Form Filling';
    this.description = 'सरकारी पोर्टल पर ऑनलाइन फॉर्म ऑटोमैटिक भरना';
    this.descriptionEn = 'Automatically fill government portal online forms';
    this.version = '1.0.0';
    this.category = 'automation';
    this.canRunOffline = false;
    this.requiresAuth = true;
    this.priority = 9; // सबसे ज्यादा ज़रूरी

    this.intents = ['form_fill', 'apply_online', 'fill_form', 'form_bharo', 'registration'];

    this.keywords = {
      hi: ['फॉर्म', 'भरो', 'भरना', 'भरवाओ', 'आवेदन', 'अप्लाई', 'रजिस्ट्रेशन', 'ऑनलाइन'],
      en: ['form', 'fill', 'apply', 'application', 'registration', 'register', 'submit', 'online'],
      hinglish: ['form bharo', 'form bharwao', 'apply karo', 'registration karo', 'online form',
                 'form fill karo', 'bharna hai', 'application dalo']
    };

    this.requiredAgents = ['controllerAgent', 'browserAgent'];

    // उपलब्ध सेवाएँ
    this.services = {
      ssc: { name: 'SSC CGL/CHSL', portal: 'ssc.gov.in' },
      army: { name: 'Indian Army', portal: 'joinindianarmy.nic.in' },
      railway: { name: 'Railway RRB', portal: 'rrbcdg.gov.in' },
      banking: { name: 'Banking IBPS/SBI', portal: 'ibps.in' },
      police: { name: 'Police Recruitment', portal: 'police.gov.in' },
      defence: { name: 'Navy/Air Force', portal: 'joinindiannavy.gov.in' },
      postal: { name: 'India Post', portal: 'ippbonline.com' },
      apprenticeship: { name: 'Apprenticeship', portal: 'apprenticeship.gov.in' },
      stateSsc: { name: 'UPSSSC', portal: 'upsssc.gov.in' },
      ration: { name: 'Ration Card', portal: 'nfsa.gov.in' }
    };
  }

  async execute(context) {
    const { message, params } = context;
    const text = message.toLowerCase();

    // कौन सी सर्विस चाहिए
    let serviceType = params?.serviceType || null;
    if (!serviceType) {
      for (const key of Object.keys(this.services)) {
        if (text.includes(key)) {
          serviceType = key;
          break;
        }
      }
    }

    // Specific service मिली
    if (serviceType && this.services[serviceType]) {
      const service = this.services[serviceType];
      return this._reply(
        `📝 *${service.name}* का फॉर्म भरने की तैयारी!\n\n🌐 पोर्टल: ${service.portal}\n\nमैंने आपके लिए फॉर्म भरने वाला डैशबोर्ड खोल दिया है। यहाँ आप अपनी प्रोफाइल डालकर फॉर्म भरना शुरू कर सकते हैं!`,
        { serviceType, serviceName: service.name, step: 'confirm_profile', navigate: '/service/form-filling' },
        'prepareFormFill'
      );
    }

    // कौन सी सर्विस चाहिए पूछो
    const serviceList = Object.entries(this.services)
      .map(([key, info]) => `• *${info.name}* — [${info.portal}](https://${info.portal})`)
      .join('\n');

    return this._reply(
      `📋 फॉर्म ऑटो-फिलिंग सिस्टम तैयार!\n\nउपलब्ध सेवाएँ:\n${serviceList}\n\nकौन सा फॉर्म भरना है बताइए!\nउदाहरण: "SSC का फॉर्म भरो" या "Railway में अप्लाई करो"`,
      { mode: 'service_select', availableServices: Object.keys(this.services) }
    );
  }
}

module.exports = { FormFillSkill };
