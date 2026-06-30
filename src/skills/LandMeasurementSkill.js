const { BaseSkill } = require('./BaseSkill');
const { z } = require('zod');

class LandMeasurementSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'land_measurement_skill';
    this.displayName = 'जमीन बंटवारा और पैमाइश';
    this.displayNameEn = 'Land Division & Measurement';
    this.category = 'geometry';
    this.description = 'जमीन का बंटवारा, प्लाट का हिस्सा और पैमाइश का हिसाब करता है।';
    this.descriptionEn = 'Calculates land division and plot shares.';
    
    this.intents = [
      'geo_plot_division',
      'geo_map_scale'
    ];
    
    this.keywords = {
      hi: ['बंटवारा', 'हिस्सा', 'पैमाइश', 'आधा', 'तिहाई', 'प्लॉट'],
      en: ['division', 'share', 'plot divide'],
      hinglish: ['batwara', 'hissa', 'paimaish']
    };

    this.canRunOffline = true;
    this.priority = 7;

    this.inputSchema = z.object({
      totalArea: z.number().optional(),
      parts: z.number().optional(),
    });
  }

  async execute(context) {
    const { message, history } = context;

    let targetValue = null;
    const numMatch = message.match(/\d+(?:\.\d+)?/);
    
    if (message.includes('बंटवारा') || message.includes('हिस्सा') || message.includes('divide')) {
        
        // Find total area from history
        if (history && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].role === 'ai' && history[i].message.includes('क्षेत्रफल (Area)')) {
                const histMatch = history[i].message.match(/(\d+(?:\.\d+)?)\s*स्क्वायर फीट/);
                if (histMatch) {
                    targetValue = parseFloat(histMatch[1]);
                    break;
                }
                }
            }
        }

        if (targetValue) {
             let parts = 2; // Default to half
             if (message.includes('3') || message.includes('तिहाई')) parts = 3;
             if (message.includes('4') || message.includes('चौथाई')) parts = 4;
             if (numMatch && !message.includes(targetValue.toString())) {
                 parts = parseInt(numMatch[0]);
             }

             const share = targetValue / parts;
             return this._reply(`कुल ${targetValue} स्क्वायर फीट का ${parts} हिस्सों में बंटवारा करने पर, हर व्यक्ति को **${share.toFixed(2)} स्क्वायर फीट** मिलेगा।`);
        }
    }
    
    return this._reply('जमीन का बंटवारा करने के लिए, पहले मुझे जमीन का एरिया बताएं (जैसे "22 front 43 back 90 length") और फिर पूछें "इसे 3 हिस्सों में बांटो"।');
  }
}

module.exports = { LandMeasurementSkill };
