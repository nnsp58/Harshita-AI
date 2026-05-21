/**
 * NotepadSkill — नोटपैड / लिखावट / शायरी
 * 
 * यह स्किल वर्चुअल नोटपैड में लिखने, शायरी बनाने,
 * और डिक्टेशन (बोलकर लिखवाने) का काम करती है।
 */

const { BaseSkill } = require('./BaseSkill');

class NotepadSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'notepad';
    this.displayName = 'नोटपैड / लिखावट';
    this.displayNameEn = 'Notepad & Writing';
    this.description = 'नोटपैड खोलना, शायरी लिखना, डिक्टेशन';
    this.descriptionEn = 'Notepad, poetry writing, dictation';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 4;

    this.intents = ['notepad', 'write', 'shayari', 'dictation', 'letter_write'];

    this.keywords = {
      hi: ['नोटपैड', 'लिखो', 'शायरी', 'कविता', 'पत्र', 'टाइप', 'डिक्टेशन', 'लिखवाओ'],
      en: ['notepad', 'write', 'shayari', 'poem', 'letter', 'type', 'dictation', 'compose'],
      hinglish: ['likho', 'likhwao', 'notepad kholo', 'shayari sunao', 'letter likho', 'type karo']
    };

    // शायरी का भंडार
    this.shayaris = [
      "मंजिलें उन्हीं को मिलती हैं, जिनके सपनों में जान होती है,\nपंखों से कुछ नहीं होता, हौसलों से उड़ान होती है।",
      "राह संघर्ष की जो चलता है, वही संसार को बदलता है,\nजिसने रातों से जंग जीती है, सूर्य बनकर वही निकलता है।",
      "काम करो ऐसा कि एक पहचान बन जाए,\nहर कदम ऐसा चलो कि निशान बन जाए,\nयहां जिंदगी तो हर कोई काट लेता है,\nजिंदगी जियो इस कदर कि मिसाल बन जाए।",
      "हार कर बैठ जाना तो आसान होता है,\nलड़ने वालों का ही हर जगह सम्मान होता है,\nउठो और चल पड़ो अपनी मंजिल की ओर,\nक्योंकि चलने वालों को ही रास्ता मिलता है।",
      "सपने वो नहीं जो नींद में आएं,\nसपने वो हैं जो नींद ही न आने दें।"
    ];
  }

  async execute(context) {
    const { message, lang } = context;
    const text = message.toLowerCase();

    // शायरी का अनुरोध?
    if (text.includes('shayari') || text.includes('शायरी') || text.includes('कविता') || text.includes('poem')) {
      const selected = this.shayaris[Math.floor(Math.random() * this.shayaris.length)];
      return this._reply(
        'जी ज़रूर, आपके लिए एक बेहतरीन शायरी लिख रहा हूँ...',
        { content: selected },
        'typeInNotepad'
      );
    }

    // पत्र लिखने का अनुरोध?
    if (text.includes('letter') || text.includes('पत्र') || text.includes('application')) {
      return this._reply(
        'कृपया बताएं कि पत्र किसके लिए है और विषय क्या है? मैं आपके लिए ड्राफ्ट तैयार कर दूँगा।',
        { mode: 'letter_compose' }
      );
    }

    // डिक्टेशन मोड
    if (text.includes('dictation') || text.includes('डिक्टेशन') || text.includes('बोलकर')) {
      return this._reply(
        'डिक्टेशन मोड शुरू! अब आप जो बोलेंगे, मैं लिखता जाऊँगा। "रुको" बोलें रोकने के लिए।',
        { mode: 'dictation' },
        'startDictation'
      );
    }

    // सामान्य नोटपैड खोलो
    return this._reply(
      'वर्चुअल नोटपैड सक्रिय है। आप जो भी बोलेंगे मैं उसे डैशबोर्ड के केंद्र में टाइप करूँगा।',
      { mode: 'notepad' },
      'openNotepad'
    );
  }
}

module.exports = { NotepadSkill };
