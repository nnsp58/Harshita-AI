const { BaseSkill } = require('./BaseSkill');
const { z } = require('zod');

class GeometrySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'geometry_skill';
    this.displayName = 'जमीन और एरिया नापी (Geometry)';
    this.displayNameEn = 'Land & Area Measurement';
    this.category = 'geometry';
    this.description = 'जमीन, प्लाट, खेत का एरिया और मकान का नक्शा नापता है।';
    this.descriptionEn = 'Calculates area, volume, and irregular plot dimensions for land measurement.';
    
    this.intents = [
      'geo_rectangle',
      'geo_triangle',
      'geo_circle',
      'geo_trapezium',
      'geo_cylinder',
      'geo_cone',
      'geo_irregular',
      'geo_land',
      'geo_building',
      'geo_farm'
    ];
    
    this.keywords = {
      hi: ['एरिया', 'प्लाट', 'खेत', 'जमीन', 'नापी', 'चौड़ाई', 'लम्बाई', 'फ्रंट', 'बैक', 'वर्गफुट', 'स्क्वायर फीट'],
      en: ['area', 'volume', 'plot', 'land', 'measure', 'length', 'width', 'front', 'back', 'sq ft'],
      hinglish: ['zameen', 'naapi', 'plot', 'front', 'back', 'lambaai', 'chaudaai', 'sqft']
    };

    this.canRunOffline = true;
    this.priority = 8;

    this.inputSchema = z.object({
      shape: z.enum(['rectangle', 'triangle', 'circle', 'trapezium', 'cylinder', 'cone', 'irregular']).optional(),
      measurements: z.record(z.string(), z.number()).optional(),
      unit: z.enum(['ft', 'm', 'yard']).default('ft'),
    });
  }

  async execute(context) {
    const { message, params = {} } = context;

    // Detect the specific pattern: "X front Y back Z length" (Trapezium / Irregular quad approach)
    const frontMatch = message.match(/(?:front|फ्रंट)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:front|फ्रंट)/i);
    const backMatch = message.match(/(?:back|पीछे|बैक)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:back|पीछे|बैक)/i);
    const lengthMatch = message.match(/(?:length|लम्बाई|लेंथ|गहराई|depth)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:length|लम्बाई|लेंथ|गहराई|depth)/i);

    if (frontMatch && backMatch && lengthMatch) {
      const front = parseFloat(frontMatch[1] || frontMatch[2]);
      const back = parseFloat(backMatch[1] || backMatch[2]);
      const length = parseFloat(lengthMatch[1] || lengthMatch[2]);

      // Calculate area as a Trapezium: Area = (a+b)/2 * h
      const areaSqFt = ((front + back) / 2) * length;
      
      let reply = `आपके प्लाट का नाप:\n`;
      reply += `• सामने (Front): ${front} ft\n`;
      reply += `• पीछे (Back): ${back} ft\n`;
      reply += `• लम्बाई/गहराई (Length): ${length} ft\n\n`;
      reply += `✅ कुल क्षेत्रफल (Area): **${areaSqFt.toFixed(2)} स्क्वायर फीट (sq.ft)**\n\n`;
      
      // Auto-suggest conversion
      reply += `क्या आप इसे **गज (Sq.Yard)**, **मीटर (Sq.Meter)**, या **बीघा/एकड़** में बदलना चाहते हैं?`;

      return this._reply(reply, { area: areaSqFt, unit: 'sq.ft', shape: 'trapezium' });
    }

    // Basic rectangle detection
    const numbers = message.match(/\d+(?:\.\d+)?/g);
    if (numbers && numbers.length >= 2 && (message.includes('x') || message.toLowerCase().includes('by'))) {
      const l = parseFloat(numbers[0]);
      const w = parseFloat(numbers[1]);
      const area = l * w;
      return this._reply(`आपके प्लाट का क्षेत्रफल **${area.toFixed(2)} स्क्वायर फीट** है।`, { area, unit: 'sq.ft', shape: 'rectangle' });
    }

    return this._reply('प्लाट का एरिया निकालने के लिए मुझे लम्बाई और चौड़ाई (जैसे: "22 front, 43 back, 90 length" या "30x40") बताएं।');
  }
}

module.exports = { GeometrySkill };
