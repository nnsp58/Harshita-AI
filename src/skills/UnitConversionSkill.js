const { BaseSkill } = require('./BaseSkill');
const { z } = require('zod');

class UnitConversionSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'unit_conversion_skill';
    this.displayName = 'यूनिट कनवर्टर (Unit Converter)';
    this.displayNameEn = 'Unit Conversion';
    this.category = 'conversion';
    this.description = 'जमीन, लम्बाई, और एरिया की यूनिट बदलता है (जैसे: Square Feet को Bigha में)।';
    this.descriptionEn = 'Converts area and length units (e.g., Sq Ft to Bigha, Acre).';
    
    this.intents = [
      'convert_area',
      'convert_length',
      'convert_land'
    ];
    
    this.keywords = {
      hi: ['कन्वर्ट', 'बदलो', 'बीघा', 'एकड़', 'स्क्वायर फीट', 'मीटर', 'गज', 'हेक्टेयर'],
      en: ['convert', 'bigha', 'acre', 'sq ft', 'sq meter', 'yard', 'hectare'],
      hinglish: ['badlo', 'bigha', 'acre', 'gaj', 'hactare']
    };

    this.canRunOffline = true;
    this.priority = 8;

    this.inputSchema = z.object({
      value: z.number().optional(),
      fromUnit: z.string().optional(),
      toUnit: z.string().optional(),
    });

    // Conversion rates relative to 1 Square Foot (Sq.Ft)
    this.areaRates = {
      'sqft': 1,
      'sqm': 0.092903,        // Square Meter
      'sqyard': 0.111111,     // Square Yard (Gaj)
      'acre': 0.0000229568,
      'hectare': 0.0000092903,
      // Note: Bigha varies by state. Using standard UP/MP Bigha (approx 27,000 sq ft)
      'bigha': 1 / 27000,     
    };
  }

  async execute(context) {
    const { message, history } = context;

    // Check if the user is replying to a previous geometry calculation
    let targetValue = null;
    
    // Look for numbers in the current message
    const numMatch = message.match(/\d+(?:\.\d+)?/);
    if (numMatch) {
      targetValue = parseFloat(numMatch[0]);
    } else if (history && history.length > 0) {
      // Look back in history to find an area calculation
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

    if (!targetValue) {
      return this._reply('कृपया वह संख्या बताएं जिसे आप कन्वर्ट करना चाहते हैं (जैसे: "2925 sq ft को bigha में")');
    }

    // Determine the 'to' unit from message
    const lower = message.toLowerCase();
    let toUnit = null;
    let unitNameHi = '';

    if (lower.includes('bigha') || lower.includes('बीघा')) { toUnit = 'bigha'; unitNameHi = 'बीघा'; }
    else if (lower.includes('acre') || lower.includes('एकड़')) { toUnit = 'acre'; unitNameHi = 'एकड़'; }
    else if (lower.includes('yard') || lower.includes('gaj') || lower.includes('गज')) { toUnit = 'sqyard'; unitNameHi = 'गज'; }
    else if (lower.includes('meter') || lower.includes('मीटर')) { toUnit = 'sqm'; unitNameHi = 'स्क्वायर मीटर'; }
    else if (lower.includes('hectare') || lower.includes('हेक्टेयर')) { toUnit = 'hectare'; unitNameHi = 'हेक्टेयर'; }

    if (toUnit) {
      // Calculate
      const result = targetValue * this.areaRates[toUnit];
      return this._reply(`**${targetValue} स्क्वायर फीट** = **${result.toFixed(4)} ${unitNameHi}**`);
    }

    // If no specific target unit is mentioned, show all conversions
    let reply = `**${targetValue} स्क्वायर फीट (Sq.Ft)** का कन्वर्शन:\n\n`;
    reply += `• **गज (Sq.Yard):** ${(targetValue * this.areaRates['sqyard']).toFixed(2)}\n`;
    reply += `• **मीटर (Sq.Meter):** ${(targetValue * this.areaRates['sqm']).toFixed(2)}\n`;
    reply += `• **बीघा (Bigha):** ${(targetValue * this.areaRates['bigha']).toFixed(4)}\n`;
    reply += `• **एकड़ (Acre):** ${(targetValue * this.areaRates['acre']).toFixed(4)}\n\n`;
    reply += `📝 क्या आप इसकी PDF रिपोर्ट चाहते हैं?`;

    return this._reply(reply, { value: targetValue, unit: 'sqft', conversions: this.areaRates });
  }
}

module.exports = { UnitConversionSkill };
