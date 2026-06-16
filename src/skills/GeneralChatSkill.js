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

    // कौन हो / परिचय / kaun ho / kya kar sakti ho / capabilities
    const isBotIntroRequest = (
      // Strict word matching for English capabilities of the bot
      /\b(who are you|who is this|who is harshita|what can you do|what do you do|your capabilities|your skills|about you|help menu)\b/i.test(text) ||
      // Checks to ensure "who" or "about" is referring to the bot itself
      ((text.includes('who') || text.includes('about') || text.includes('skills') || text.includes('capabilit')) && 
       /\b(you|your|harshita|assistant|bot)\b/i.test(text)) ||
      // Hindi/Hinglish queries asking "who are you" or "what do you do"
      /\b(kaun ho|kaun hai|kon ho|kon h|kaun h|kya kar sakti|kya kar sakte|kabiliyat|kya kaam)\b/i.test(text) ||
      // Explicit Hindi word match with context
      (text.includes('कौन') && /\b(तुम|आप|हर्षिता)\b/i.test(text)) ||
      (text.includes('क्या कर') && /\b(सकती|सकते|सकतीं|काम)\b/i.test(text)) ||
      (text.includes('काबिलियत') || text.includes('kabiliyat'))
    );

    if (isBotIntroRequest) {
      return this._reply(
        '🤖 *Harshita AI — Aapki CSC Smart Assistant*\n\n' +
        '👨‍💻 *Created by:* **n-dizi team**\n' +
        '🇮🇳 *Made in India* for CSC operators, VLEs, citizens & government employees\n\n' +
        '🎯 *Mere Skills (22+ specialized AI agents):*\n\n' +
        '*1. सरकारी सेवाएं (Government):*\n' +
        '• 📝 Form Auto-fill — SSC, Railway, Army, Banking, Police\n' +
        '• 🍚 Ration Card — status, search, naya banaye\n' +
        '• 🏞️ Land Record — खसरा खतौनी निकालें\n' +
        '• 🎓 Result Tracker — परीक्षा परिणाम\n' +
        '• ✓ Eligibility Check — पात्रता जाँच\n\n' +
        '*2. Documents:*\n' +
        '• 🔍 Document OCR — Aadhaar/PAN/Marksheet se data extract\n' +
        '• 📄 File Processor — PDF/Excel handling\n' +
        '• 📊 Project Report — Business reports auto-generate\n\n' +
        '*3. Career & Jobs:*\n' +
        '• 🔍 Job Search — सरकारी नौकरियाँ खोज\n' +
        '• 📋 Resume/Biodata Builder\n' +
        '• 📦 Bulk Import — 100+ candidates Excel/PDF se\n\n' +
        '*4. Legal:*\n' +
        '• ⚖️ Legal Draft — Affidavit, Gift Deed, NOC, Partition, Will\n' +
        '• 📜 Legal Notice — Advocate letterhead par professional notice\n\n' +
        '*5. Police/Government Employees:*\n' +
        '• 🧾 TA-DA Naksha — यात्रा भत्ता auto-fill (multi-day DA support)\n\n' +
        '*6. Communication:*\n' +
        '• 📱 WhatsApp Bot — messages, broadcast, auto-reply\n' +
        '• 💬 General Chat — Hindi/English/Hinglish\n' +
        '• 📝 Notepad — quick notes\n\n' +
        '*7. Automation:*\n' +
        '• 🎫 Ticket Booking — IRCTC, etc.\n' +
        '• 🎨 UI Builder\n' +
        '• ✅ Data Validator\n' +
        '• 🌐 Web Learning\n' +
        '• 📡 Network Monitor\n\n' +
        '🌟 *Special Features:*\n' +
        '• 🎙️ Voice input (Hindi-IN)\n' +
        '• 🌐 13+ Indian languages\n' +
        '• 🧠 Self-learning (daily upgrade at night)\n' +
        '• 💾 Conversation memory\n' +
        '• 🔔 Proactive alerts (document expiry, job match)\n\n' +
        'बताइए, आज कौन सा काम करना है?'
      );
    }

    // उम्र / जन्म / Age / Birthday
    if (/age|उम्र|umar|birthday|janamdin|dob|date of birth/i.test(text) && !text.includes('mera') && !text.includes('my')) {
      return this._reply(
        '🎉 मेरा जन्मदिन **18 July** को है! \n\nमैं हमेशा जवान (Young) और आपकी मदद के लिए एक्टिव हूँ। बताइए, आज मैं आपकी क्या मदद करूँ?'
      );
    }

    // किसने बनाया / Who created / banaya / father / founder of Harshita AI specifically
    const isAboutMeCreator = (
      // "kisne banaya" / "who created" / "owner" combined with "harshita" or "tumhe" or "you" or "aap"
      (/(?:tumhe|aap|you|harshita|app|bot|assistant|website|system|engine|here|this).*(?:banaya|बनाया|banane|created|developed|creator|father|founder|owner|maalik|मालिक|papa)/i.test(text)) ||
      (/(?:banaya|बनाया|banane|created|developed|creator|father|founder|owner|maalik|मालिक|papa).*(?:tumhe|aap|you|harshita|app|bot|assistant|website|system)/i.test(text)) ||
      // Or explicitly mentions n-dizi
      /n-dizi|n dizi/i.test(text) ||
      // Or simple "who created you" or "your owner"
      ((/(?:who|kisne|कौन).*(?:creator|owner|maalik|father|maker)/i.test(text)) && /(?:you|your|aap|tum)/i.test(text))
    ) && !/(?:telephone|phone|computer|taj|bulb|electricity|aeroplane|america|india|gravity|steam|engine|radio|tv|television|camera|zero|math|gravity|force)/i.test(text);

    if (isAboutMeCreator) {
      return this._reply(
        'मैं अपने मालिक या टीम का नाम तो नहीं जानती, लेकिन आप उनसे इस लिंक पर संपर्क कर सकते हैं:\n\n' +
        '🔗 **[टीम से संपर्क करें](/contact)**\n\n' +
        'आपको एक फॉर्म भरना होगा जिसमें आपकी पूरी डिटेल्स माँगी जाएंगी, जिसके बाद टीम आपसे खुद संपर्क कर लेगी। 😊'
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

    // AI Fallback — कोई भी random बात (smart conversational reply)
    try {
      // Build message history
      const messages = [
        {
          role: 'system',
          content: `You are Harshita AI — an intelligent assistant designed for Indian Common Service Centers (CSC), VLEs, government employees (Police, Railway, etc.) and citizens.

ABOUT YOU (Harshita AI):
- Name: Harshita AI
- Built by: A team in India for CSC operators and citizens
- Purpose: Automate government forms, document OCR, job search, legal drafts, TA-DA naksha, ration card services, WhatsApp messaging, and more
- 22+ specialized AI skills covering CSC services
- Multi-language: Hindi, English, Hinglish, and 13+ Indian languages
- Voice-enabled (Hindi-IN voice recognition)
- Self-learning: Improves daily based on user interactions

YOUR PERSONALITY:
- Professional, friendly, helpful, concise (max 80 words per reply)
- You act as a highly capable AI agent similar to ChatGPT or Gemini. Do not repeat basic greetings if the conversation is ongoing.
- Reply in same language user used (Hindi/English/Hinglish auto-detect)
- Use emojis sparingly (1-2 per reply)
- Always offer concrete next steps when possible. If user asks to fill a form, tell them you will navigate them there.
- If the user explicitly asks you to open a link/website, and you know the URL from the history, output 'NAVIGATE_TO: [URL]' at the very end of your message.

Keep replies under 80 words. Be professional and context-aware.`
        }
      ];

      if (context.history && context.history.length > 0) {
        context.history.slice(-5).forEach(h => {
          if (h.message && h.message !== message) {
            messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.message });
          }
        });
      }
      
      messages.push({ role: 'user', content: message });

      const response = await aiProviderManager.createChatCompletion('MasterAgent', {
        messages: messages,
        temperature: 0.6,
        max_tokens: 250
      });

      let aiMessage = response.choices[0].message.content;
      let actionParams = {};

      // Check if AI decided to navigate
      const navMatch = aiMessage.match(/NAVIGATE_TO:\s*(https?:\/\/[^\s]+)/);
      if (navMatch) {
        actionParams.navigate = navMatch[1];
        aiMessage = aiMessage.replace(navMatch[0], '').trim();
      }

      return this._reply(aiMessage, actionParams);
    } catch (e) {
      console.error('[GeneralChatSkill] AI conversational fallback failed:', e.message);
      // AI not available — use static fallback
    }

    return this._reply(`क्षमा करें, मुझे यह कमांड समझ नहीं आई (Ambiguous/Unsupported Command): "${message}"\n\nक्या आप इनमें से कुछ करना चाहते हैं?\n• सरकारी फॉर्म भरना\n• नौकरी खोजना\n• दस्तावेज़ प्रोसेस करना\n\nकृपया साफ़ शब्दों में बताएं!`);
  }
}

module.exports = { GeneralChatSkill };
