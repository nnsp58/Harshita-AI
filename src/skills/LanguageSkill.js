/**
 * LanguageSkill — AI Universal Translator & Voice Assistant
 * 
 * Handles intents related to translation, languages, text-to-speech, and voice translation.
 * Triggers the native TranslatorTool on the frontend.
 */
const { BaseSkill } = require('./BaseSkill');

class LanguageSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'language_translator';
    this.displayName = 'यूनिवर्सल ट्रांसलेटर';
    this.displayNameEn = 'Universal Translator';
    this.description = '80+ भाषाओं में टेक्स्ट और वॉइस ट्रांसलेशन';
    this.descriptionEn = 'Translate text and voice across 80+ languages';
    this.version = '2.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 5;
    
    this.intents = ['translate_text', 'voice_translate', 'text_to_speech'];
    this.keywords = {
      hi: ['ट्रांसलेट करो', 'अनुवाद', 'अंग्रेजी में बताओ', 'स्पीकर', 'आवाज़ में पढ़ो'],
      en: ['translate', 'meaning in', 'how to say', 'voice translator', 'text to speech'],
      hinglish: ['translate karo', 'english me batao', 'kya bolte hai', 'speak this']
    };
  }

  async execute(context) {
    const { message } = context;
    const text = (message || '').toLowerCase();

    // Voice or TTS specific intro
    if (/voice|bol|aawaz|स्पीकर|आवाज़/i.test(text)) {
      return this._reply(
        '🗣️ *Voice Translator & AI Voice*\n\nमैंने ट्रांसलेटर टूल खोल दिया है। आप इसमें माइक 🎤 बटन दबाकर बोल सकते हैं या किसी भी टेक्स्ट को 🔊 बटन दबाकर सुन सकते हैं।',
        { mode: 'open_tool', toolName: 'TranslatorTool' }
      );
    }

    // Default Translator intro
    return this._reply(
      '🌍 *Universal AI Translator*\n\nमैंने ट्रांसलेटर टूल खोल दिया है। आप यहाँ 80 से ज़्यादा भाषाओं में कुछ भी ट्रांसलेट कर सकते हैं।',
      { mode: 'open_tool', toolName: 'TranslatorTool' }
    );
  }
}

module.exports = { LanguageSkill };
