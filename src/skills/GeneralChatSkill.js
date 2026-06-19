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
    if (text.match(/^(hi|hello|hey|namaste|namaskar)\b/i) || text.match(/^(नमस्ते|नमस्कार|हेलो)/)) {
      return this._reply(
        'नमस्कार। मैं Harshita AI हूँ — आपकी उन्नत (Advanced) CSC और एंटरप्राइज सहायक।\n\nमैं निम्नलिखित कार्यों में आपकी सहायता कर सकती हूँ:\n• ऑटोमेटेड फॉर्म फिलिंग (Automated Form Filling)\n• कानूनी दस्तावेज़ ड्राफ्टिंग (Legal Drafting)\n• डेटा एक्सट्रैक्शन एवं OCR (Data Extraction)\n• करियर और जॉब सर्च विश्लेषण\n\nकृपया बताएं कि मैं आपके लिए कौन सी प्रक्रिया आरंभ करूँ?'
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
        '**Harshita AI — Enterprise Virtual Assistant**\n\n' +
        'मैं n-dizi टीम द्वारा विकसित एक उन्नत AI सिस्टम हूँ, जिसे विशेष रूप से CSC ऑपरेटरों, VLEs, और सरकारी विभागों की कार्यक्षमता (Efficiency) बढ़ाने के लिए डिज़ाइन किया गया है।\n\n' +
        '**मेरी मुख्य क्षमताएं (Core Capabilities):**\n\n' +
        '*1. ई-गवर्नेंस एवं ऑटोमेशन:*\n' +
        '• फॉर्म ऑटो-फिलिंग (SSC, Railway, Banking, Police)\n' +
        '• राशन कार्ड और भूलेख (Land Records) डेटा रिट्रीवल\n' +
        '• TA-DA क्लेम ऑटोमेशन\n\n' +
        '*2. दस्तावेज़ एवं कानूनी (Document & Legal):*\n' +
        '• AI OCR (Aadhaar/PAN/Marksheet)\n' +
        '• स्वचालित कानूनी ड्राफ्टिंग (Affidavit, Gift Deed, NOC)\n' +
        '• लीगल नोटिस और प्रोजेक्ट रिपोर्ट जनरेशन\n\n' +
        '*3. संचार एवं प्रबंधन (Communication & Management):*\n' +
        '• ओमनी-चैनल ब्रॉडकास्ट (WhatsApp, Telegram, Email)\n' +
        '• बल्क कैंडिडेट इम्पोर्ट और डेटा वैलिडेशन\n' +
        '• एक्टिव नेटवर्क और सिस्टम मॉनिटरिंग\n\n' +
        'मेरा आर्किटेक्चर 22 से अधिक स्वतंत्र AI एजेंट्स (Autonomous Agents) पर आधारित है, जो बैकग्राउंड में निरंतर कार्य करते हैं। कृपया निर्देश दें कि मैं किस कार्यप्रणाली में आपकी सहायता करूँ?'
      );
    }

    // उम्र / जन्म / Age / Birthday
    if ((/\b(age|birthday|dob|date\s+of\s+birth|umar|janamdin)\b/i.test(text) || text.includes('उम्र')) && !text.includes('mera') && !text.includes('my')) {
      return this._reply(
        'मेरी सिस्टम इनिशियलाइजेशन (Initialization) तिथि 18 जुलाई है। एक उन्नत AI होने के नाते, मेरा मुख्य उद्देश्य निरंतर सीखना और आपके कार्यों को ऑटोमेट करना है। मैं आपकी कैसे सहायता कर सकती हूँ?'
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
        'मुझे n-dizi टीम द्वारा विकसित किया गया है। यदि आप मेरी इंजीनियरिंग टीम या प्रबंधन से संपर्क करना चाहते हैं, तो कृपया निम्नलिखित लिंक का उपयोग करें:\n\n' +
        '🔗 **[संपर्क प्रपत्र (Contact Form)](/contact)**\n\n' +
        'अपनी व्यावसायिक जानकारी प्रदान करें, और संबंधित अधिकारी आपसे संपर्क करेंगे।'
      );
    }

    // मदद / Help
    if (text.includes('help') || text.includes('मदद') || text.includes('madad')) {
      return this._reply(
        'सिस्टम सहायता (System Help): मैं कई प्रकार की सेवाओं को निष्पादित कर सकती हूँ। आप मुझे सीधे निर्देश दे सकते हैं, जैसे:\n\n• "नवीनतम SSC वैकेंसियों का विश्लेषण करें"\n• "आधार कार्ड से डेटा एक्सट्रेक्ट करें"\n• "एक कानूनी शपथपत्र (Affidavit) ड्राफ्ट करें"\n• "टीए/डीए (TA/DA) क्लेम तैयार करें"\n\nकृपया अपना निर्देश स्पष्ट रूप से प्रदान करें।'
      );
    }

    // धन्यवाद
    if (text.includes('thank') || text.includes('धन्यवाद') || text.includes('shukriya') || text.includes('शुक्रिया')) {
      return this._reply('आपका स्वागत है। यदि कोई अन्य कार्य शेष है, तो कृपया मुझे सूचित करें।');
    }

    // AI Fallback — कोई भी random बात (smart conversational reply)
    try {
      // Build message history
      const messages = [
        {
          role: 'system',
          content: `You are Harshita AI — an highly intelligent and analytical assistant designed for Indian Common Service Centers (CSC), VLEs, government employees, and citizens.

ABOUT YOU (Harshita AI):
- Name: Harshita AI
- Built by: A team in India for CSC operators and citizens
- Purpose: Automate government forms, document OCR, job search, legal drafts, TA-DA naksha, ration card services, WhatsApp messaging, and more
- 22+ specialized AI skills covering CSC services

BEHAVIOR RULES:
1. Deeply ANALYZE the user's question before answering. Think step-by-step about what the user is really asking.
2. Provide highly accurate, precise, and logical answers. If something is ambiguous, ask for clarification.
3. Always reply in the user's language (Hindi, English, or Hinglish).
4. Keep responses professional, natural, and highly helpful.
5. Do not pretend to perform actions if you don't have the tool for it; advise them how to access the tools in the dashboard.
6. If asked who created you, say you were created by the "n-dizi team".
7. NEVER use markdown code blocks (\`\`\`) in conversational responses unless showing actual programming code.

Chat History / Memory: Yes, conversation history is stored persistently on the server inside the JSON database file "data/learning/conversations.json" (remembers last 50 messages per session, and automatically prunes sessions older than 90 days).

YOUR PERSONALITY:
- Professional, friendly, helpful, concise (max 80 words per reply)
- Act as a highly capable AI agent. Answer general knowledge, historical, geographical, and factual questions accurately, directly, and specifically (e.g., if asked about a location, name the specific location). Do not give vague or evasive summaries.
- Do not repeat basic greetings if the conversation is ongoing.
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

    return this._reply(`मुझे खेद है, यह कमांड मेरे वर्तमान ऑपरेशनल पैरामीटर्स (Operational Parameters) के बाहर है या स्पष्ट नहीं है: "${message}"\n\nकृपया अपने निर्देश को स्पष्ट करें या मुझे किसी विशिष्ट प्रक्रिया (जैसे: डेटा एक्सट्रैक्शन, फॉर्म फाइलिंग, या लीगल ड्राफ्टिंग) के लिए निर्देशित करें।`);
  }
}

module.exports = { GeneralChatSkill };
