/**
 * GeneralChatSkill — सामान्य बातचीत / ग्रीटिंग / हेल्प
 */
const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');

class GeneralChatSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'general_chat';
    this.displayName = 'सामान्य बातचीत';
    this.displayNameEn = 'General Chat';
    this.description = 'नमस्ते, मदद, परिचय, और सामान्य बातचीत';
    this.descriptionEn = 'Greetings, help, introduction, and general conversation';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 1; // सबसे कम — सिर्फ तब चले जब कोई और स्किल match न हो

    this.intents = ['general_chat', 'greeting', 'help', 'who_are_you', 'thanks'];

    this.keywords = {
      hi: ['नमस्ते', 'हेलो', 'कैसे हो', 'मदद', 'कौन हो', 'धन्यवाद', 'शुक्रिया'],
      en: ['hello', 'hi', 'help', 'who are you', 'thanks', 'thank you', 'what can you do'],
      hinglish: ['namaste', 'kaise ho', 'kaun ho', 'kya kar sakti ho', 'madad karo', 'shukriya']
    };
  }

  async execute(context) {
    const { message, userId } = context;
    const text = message.toLowerCase();

    // नमस्ते / Hello
    if (text.match(/^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हेलो)/)) {
      return this._reply(
        '🙏 नमस्ते! मैं *Harshita AI* हूँ — आपकी CSC सहायक।\n\nमैं ये सब कर सकती हूँ:\n• 📝 सरकारी फॉर्म भरना\n• 🔍 नौकरी खोजना\n• 📄 दस्तावेज़ से डेटा निकालना\n• 🧾 TA/DA प्रोसेस करना\n• ⚖️ कानूनी ड्राफ्ट बनाना\n\nबताइए क्या करना है!'
      );
    }

    // कौन हो / परिचय
    if (text.includes('kaun') || text.includes('कौन') || text.includes('who') || text.includes('about')) {
      return this._reply(
        '🤖 मैं *Harshita AI* हूँ!\n\n• CSC (Common Service Centre) के लिए बनाई गई AI सहायक\n• सरकारी फॉर्म ऑटो भरने में माहिर\n• हिंदी, English और 13+ भारतीय भाषाएँ समझती हूँ\n• आवाज़ (Voice) से भी काम कर सकती हूँ\n\nबताइए, आज क्या मदद करूँ?'
      );
    }

    // मदद / Help
    if (text.includes('help') || text.includes('मदद') || text.includes('madad')) {
      return this._reply(
        '❓ मदद चाहिए? ये बोलकर देखें:\n\n🔍 "SSC की नौकरी दिखाओ"\n📝 "Railway का फॉर्म भरो"\n📄 "आधार से डेटा निकालो"\n🧾 "TA/DA बनाओ"\n🍚 "राशन कार्ड बनवाओ"\n⚖️ "शपथपत्र बनाओ"\n🏞️ "खसरा खतौनी निकालो"\n\nआप हिंदी, English या Hinglish — कुछ भी बोल सकते हैं!'
      );
    }

    // धन्यवाद
    if (text.includes('thank') || text.includes('धन्यवाद') || text.includes('shukriya') || text.includes('शुक्रिया')) {
      return this._reply('🙏 आपका स्वागत है! कोई और मदद चाहिए तो बेझिझक पूछें।');
    }

    // AI Fallback — कोई भी random बात
    try {
      const client = aiProviderManager.getClient('MasterAgent');
      if (client) {
        const model = aiProviderManager.getModel('MasterAgent');
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are Harshita AI, a helpful CSC (Common Service Centre) assistant. Reply briefly in Hindi or Hinglish. You help with government forms, jobs, documents. Keep responses under 100 words.' },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 200
        });
        return this._reply(response.choices[0].message.content.trim());
      }
    } catch (e) {
      // AI not available — use static fallback
    }

    return this._reply(`क्षमा करें, मुझे यह कमांड समझ नहीं आई (Ambiguous/Unsupported Command): "${message}"\n\nक्या आप इनमें से कुछ करना चाहते हैं?\n• सरकारी फॉर्म भरना\n• नौकरी खोजना\n• दस्तावेज़ प्रोसेस करना\n\nकृपया साफ़ शब्दों में बताएं!`);
  }
}

module.exports = { GeneralChatSkill };
