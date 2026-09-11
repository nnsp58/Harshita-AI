/**
 * GeneralChatSkill — सामान्य बातचीत / ग्रीटिंग / हेल्प
 * PRD-013: Final Fallback returns static message when all providers fail
 */
const { BaseSkill } = require('./BaseSkill');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { LanguageEngine } = require('../core/languageEngine');

const languageEngine = new LanguageEngine();

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
    this.priority = 1;

    this.intents = ['general_chat', 'greeting', 'help', 'who_are_you', 'thanks'];

    this.visible = true;
    this.type = 'application';
    this.route = '/service/ai-assistant';

    this.keywords = {
      hi: ['नमस्ते', 'हेलो', 'कैसे हो', 'मदद', 'कौन हो', 'धन्यवाद', 'शुक्रिया'],
      en: ['hello', 'hi', 'help', 'who are you', 'thanks', 'thank you', 'what can you do'],
      hinglish: ['namaste', 'kaise ho', 'kaun ho', 'kya kar sakti ho', 'madad karo', 'shukriya']
    };
  }

  async execute(context) {
    const { message, userId, params } = context;
    const rawText = message || '';
    const text = rawText.toLowerCase().trim();

    // Detect language of the input
    const langInfo = languageEngine.detectLanguage(rawText);
    const isHindi = langInfo.lang === 'hi';
    const isHinglish = langInfo.isHinglish || langInfo.lang === 'hi-Latn';
    const isEnglish = !isHindi && !isHinglish;

    // PRD-013: Check if offline knowledge already provided answer
    if (params?.offlineAnswer) {
      return this._reply(params.offlineAnswer);
    }

    // Explicit Greetings: Language-matched natural greetings
    if (/^(hi|hello|hey)\b/i.test(text)) {
      if (isEnglish) {
        return this._reply('Hello! How can I help you?');
      }
      if (isHinglish) {
        return this._reply('Hello! Main aapki kya madad kar sakti hoon?');
      }
      return this._reply('नमस्ते! मैं आपकी कैसे सहायता कर सकती हूँ?');
    }

    if (/^(namaste|namaskar)\b/i.test(text) || /^(नमस्ते|नमस्कार)/.test(text)) {
      if (isEnglish) {
        return this._reply('Hello! How can I help you today?');
      }
      if (isHinglish) {
        return this._reply('Namaste! Main aapki kya madad kar sakti hoon?');
      }
      return this._reply('नमस्ते! मैं आपकी कैसे सहायता कर सकती हूँ?');
    }

    if (/^(good\s+(morning|afternoon|evening|night))/i.test(text)) {
      if (isEnglish) {
        return this._reply(`Good ${text.match(/morning|afternoon|evening|night/i)[0]}! How can I help you?`);
      }
      return this._reply('नमस्कार! मैं आपकी कैसे सहायता कर सकती हूँ?');
    }

    const mentionsBot = /\b(you|your|harshita|assistant|bot|aap|tumhare|tumhari|apni|apne)\b/i.test(text) ||
                        /\b(तुम|आप|हर्षिता|अपनी|अपने)\b/.test(text);
    const isBotIntroRequest = (
      /\b(who are you|who is this|who is harshita|what can you do|what do you do|your capabilities|your skills|about you|help menu)\b/i.test(text) ||
      /\b(kaun ho|kaun hai|kon ho|kon h|kaun h|kya kar sakti|kya kar sakte|kabiliyat|kya kaam|hunar|apni.*skill|skills.*batao)\b/i.test(text) ||
      (text.includes('कौन') && /\b(तुम|आप|हर्षिता)\b/.test(text)) ||
      (text.includes('क्या कर') && /\b(सकती|सकते|सकतीं|काम)\b/.test(text)) ||
      (/capabilit/i.test(text) && mentionsBot)
    );

    if (isBotIntroRequest) {
      return this._reply(
        '[रूटिंग सफल] 🤖 **Harshita AI — Platform Capabilities & Skill Discovery**\n\n' +
        '📊 **Total Skill Count:** 31 Active AI Skills\n\n' +
        '### 📁 Categories & Sub-Skills:\n\n' +
        '#### 1. ⚖️ Legal & Drafting Services\n' +
        '- **कानूनी ड्राफ्ट (legal_draft)**: Affidavit, Gift Deed, Partition Deed, Rent Agreement, NOC, Declaration, Power of Attorney, Will.\n' +
        '  *Example*: "Apni property wife ke naam gift karni hai"\n' +
        '- **कानूनी नोटिस (legal_notice)**: Money Recovery, Defamation, Property Dispute, Cheque Bounce, Eviction, Contract Breach, Consumer Complaint.\n' +
        '  *Example*: "Cheque bounce notice to Ramesh for 50000 INR"\n' +
        '- **प्रार्थना पत्र (application_writer)**: Government applications, leave/official letters, representations.\n' +
        '  *Example*: "Atal awasya school principal ko 7 din ki chutti ki application"\n\n' +
        '#### 2. 📝 Government Services\n' +
        '- **फॉर्म ऑटो-फिल (form_fill)**: SSC, Railway, Banking online form helper.\n' +
        '- **पात्रता जाँच (eligibility_check)**: Direct qualification checks.\n' +
        '- **राशन कार्ड (ration_card)**: BPL/APL card applications.\n' +
        '- **भूलेख (land_record)**: Khasra, Khatauni land records.\n' +
        '- **रिजल्ट ट्रैकर (result_generator)**: SSC, CBSE merit list / score checks.\n\n' +
        '#### 3. 🔍 Documents & Content Engines\n' +
        '- **दस्तावेज़ OCR (document_ocr)**: Text extraction from Aadhaar, PAN, marksheets.\n' +
        '- **फाइल प्रोसेसर (file_processor)**: PDF/Excel manipulation.\n' +
        '- **प्रोजेक्ट रिपोर्ट (project_report)**: PMEGP/Mudra business reports.\n' +
        '- **रिज्यूमे मेकर (resume_maker)**: Professional CV/biodata generation.\n' +
        '- **डेटा वैलिडेटर (validator)**: Automated CSV/Excel audits.\n' +
        '- **बल्क इम्पोर्ट (bulk_import)**: Direct batch processing.\n\n' +
        '#### 4. 🚗 Business & Media Utility\n' +
        '- **TA/DA प्रोसेसर (tada_process)**: Travel allowance calculations.\n' +
        '- **टिकट बुकिंग (ticket_booking)**: Train/Bus ticket booking aid.\n' +
        '- **पासपोर्ट फोटो मेकर (photo_maker)**: Passport size crop and print layout creation.\n' +
        '- **मीडिया कन्वर्टर (media_converter)**: Image compression and conversions.\n\n' +
        '#### 5. 🤖 Core Agent & Development\n' +
        '- **Voice Assistant (voice_agent)**: Multilingual TTS/STT.\n' +
        '- **वेब लर्निंग (web_learning)**: Real-time portal information scraper.\n' +
        '- **UI बिल्डर (ui_builder)**: Dynamic layout and widget builder.\n' +
        '- **सेल्फ हीलिंग (self_healing)**: Auto exception capture and bug fixes.\n' +
        '- **सुरक्षा गार्डरेल (security_guardrail)**: Block dangerous and illegal inputs.\n\n' +
        'Harshita AI displays all 31 skills under 5 categories with customized examples for Indian CSC centers.'
      );
    }

    if ((/\b(age|birthday|dob|date\s+of\s+birth|umar|janamdin)\b/i.test(text) || text.includes('उम्र')) && !text.includes('mera') && !text.includes('my')) {
      return this._reply(
        'मेरी सिस्टम इनिशियलाइजेशन (Initialization) तिथि 18 जुलाई है। एक उन्नत AI होने के नाते, मेरा मुख्य उद्देश्य निरंतर सीखना और आपके कार्यों को ऑटोमेट करना है। मैं आपकी कैसे सहायता कर सकती हूँ?'
      );
    }

    const isAboutMeCreator = (
      (/(?:tumhe|aap|you|harshita|app|bot|assistant|website|system|engine|here|this).*(?:banaya|बनाया|banane|created|developed|creator|father|founder|owner|maalik|मालिक|papa)/i.test(text)) ||
      (/(?:banaya|बनाया|banane|created|developed|creator|father|founder|owner|maalik|मालिक|papa).*(?:tumhe|aap|you|harshita|app|bot|assistant|website|system)/i.test(text)) ||
      /n-dizi|n dizi/i.test(text) ||
      ((/(?:who|kisne|कौन).*(?:creator|owner|maalik|father|maker)/i.test(text)) && /(?:you|your|aap|tum)/i.test(text))
    ) && !/(?:telephone|phone|computer|taj|bulb|electricity|aeroplane|america|india|gravity|steam|engine|radio|tv|television|camera|zero|math|gravity|force)/i.test(text);

    if (isAboutMeCreator) {
      return this._reply(
        'मुझे n-dizi टीम द्वारा विकसित किया गया है। यदि आप मेरी इंजीनियरिंग टीम या प्रबंधन से संपर्क करना चाहते हैं, तो कृपया निम्नलिखित लिंक का उपयोग करें:\n\n' +
        '🔗 **[संपर्क प्रपत्र (Contact Form)](/contact)**\n\n' +
        'अपनी व्यावसायिक जानकारी प्रदान करें, और संबंधित अधिकारी आपसे संपर्क करेंगे।'
      );
    }

    if (text.includes('help') || text.includes('मदद') || text.includes('madad')) {
      return this._reply(
        'सिस्टम सहायता (System Help): मैं कई प्रकार की सेवाओं को निष्पादित कर सकती हूँ। आप मुझे सीधे निर्देश दे सकते हैं, जैसे:\n\n• "नवीनतम SSC वैकेंसियों का विश्लेषण करें"\n• "आधार कार्ड से डेटा एक्सट्रेक्ट करें"\n• "एक कानूनी शपथपत्र (Affidavit) ड्राफ्ट करें"\n• "टीए/डीए (TA/DA) क्लेम तैयार करें"\n\nकृपया अपना निर्देश स्पष्ट रूप से प्रदान करें।'
      );
    }

    if (text.includes('thank') || text.includes('धन्यवाद') || text.includes('shukriya') || text.includes('शुक्रिया')) {
      return this._reply('आपका स्वागत है। यदि कोई अन्य कार्य शेष है, तो कृपया मुझे सूचित करें।');
    }

    // Acknowledgments (ok / theek hai / done / sure / acha)
    if (/^(ok|okay|thik hai|theek hai|thik h|theek h|accha|acha|sahi hai|done|sure|got it|hmm|haan|ha|yes|fine)\b/i.test(text.trim())) {
      return this._reply('जी बिल्कुल! कृपया बताएं कि मैं आपकी आगे किस कार्य में सहायता करूँ? आप फॉर्म भरने, कानूनी ड्राफ्ट, नोटिस या फाइल कन्वर्ट करने का निर्देश दे सकते हैं।');
    }

    try {
      const messages = [
        {
          role: 'system',
          content: `You are Harshita AI — an highly intelligent and analytical assistant designed for Indian Common Service Centers (CSC), VLEs, government employees, and citizens.

ABOUT YOU (Harshita AI):
- Name: Harshita AI
- Built by: A team in India for CSC operators and citizens
- Purpose: Automate government forms, document OCR, job search, legal drafts, TA-DA naksha, ration card services, WhatsApp messaging, and more
- 32+ specialized AI skills covering CSC services

BEHAVIOR RULES:
1. Deeply ANALYZE the user's question before answering. Think step-by-step about what the user is really asking.
2. Provide highly accurate, precise, and logical answers. If something is ambiguous, ask for clarification.
3. Always reply in the user's language (Hindi, English, or Hinglish).
4. Keep responses professional, natural, and highly helpful.
5. Do not pretend to perform actions if you don't have the tool for it; advise them how to access the tools in the dashboard.
6. If asked who created you, say you were created by the "n-dizi team".
7. NEVER use markdown code blocks (\\\`\\\`) in conversational responses unless showing actual programming code.

YOUR PERSONALITY:
- Professional, friendly, helpful, concise (max 80 words per reply)
- Act as a highly capable AI agent. Answer general knowledge, historical, geographical, and factual questions accurately, directly, and specifically.
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

      const response = await aiProviderManager.createChatCompletion('GeneralChatAgent', {
        messages: messages,
        temperature: 0.6,
        max_tokens: 250
      });

      let aiMessage = response.choices[0].message.content;
      let actionParams = {};

      const navMatch = aiMessage.match(/NAVIGATE_TO:\s*(https?:\/\/[^\s]+)/);
      if (navMatch) {
        actionParams.navigate = navMatch[1];
        aiMessage = aiMessage.replace(navMatch[0], '').trim();
      }

      return this._reply(aiMessage, actionParams);
    } catch (e) {
      console.error('[GeneralChatSkill] AI conversational fallback failed:', e.message);
    }

    // Check if user is asking to open the previous/recent action or workspace in a separate window
    if (/\b(separate|saprate|new)\s*(window|tab)\b/i.test(text) || /\b(alag|naye|dusre)\s*(window|tab)\b/i.test(text) || text.includes('अलग विंडो') || text.includes('नए टैब')) {
      // Look back in history to find the last route/page
      let targetRoute = '/tada-naksha';
      if (context.history && context.history.length > 0) {
        for (let i = context.history.length - 1; i >= 0; i--) {
          const h = context.history[i];
          const histText = (h.message || '').toLowerCase();
          if (histText.includes('tada') || histText.includes('नक्शा') || histText.includes('naksha')) {
            targetRoute = '/tada-naksha';
            break;
          }
          if (histText.includes('affidavit') || histText.includes('शपथपत्र')) {
            targetRoute = '/legal-drafting';
            break;
          }
        }
      }
      return this._reply(
        isEnglish 
          ? `Opening page in a separate window for you: ${targetRoute}` 
          : `पेज अलग विंडो में खोला जा रहा है: ${targetRoute}`,
        { mode: 'navigate', navigate: targetRoute, target: '_blank', route: targetRoute },
        { navigate: targetRoute, target: '_blank', route: targetRoute }
      );
    }

    // Questions about how to bring bot online or offline status
    if (/\b(how to online|bring online|make online|turn online|connect internet|online kaise|online ho jao)\b/i.test(text) || text.includes('ऑनलाइन कैसे')) {
      if (isEnglish) {
        return this._reply("I automatically connect to online AI services (Gemini/Groq) whenever API connectivity is active. When running offline or if servers are unreachable, I operate with local built-in offline templates and tools.");
      }
      if (isHinglish) {
        return this._reply("Main Gemini aur Groq AI se automatically connect rehti hoon. Agar AI connection me deri ya issue ho, toh main offline templates aur legal tools ke sath turant kaam karti hoon.");
      }
      return this._reply("जब भी AI API सक्रिय होता है, मैं स्वचालित रूप से ऑनलाइन सेवाओं से जुड़ जाती हूँ। इंटरनेट या सर्वर उपलब्ध न होने पर भी मैं स्थानीय ऑफलाइन टूल्स और कानूनी ड्राफ्टिंग के साथ कार्य करती हूँ।");
    }

    // Offline Smart Fallback: If AI servers are unavailable, provide a contextual offline response in user's language
    if (isEnglish) {
      if (/how are you/i.test(text)) {
        return this._reply("I'm doing well, thank you! How can I help you?");
      }
      if (/about your\s*self|who are you|tell me about/i.test(text)) {
        return this._reply("I am N-Dizi AI (Harshita AI), an intelligent assistant built to help with legal drafting, TA/DA naksha calculations, government forms, documents, and business automation. How can I assist you today?");
      }
      if (/what can you do/i.test(text) || /your capabilities/i.test(text)) {
        return this._reply("I can help you draft legal notices, police complaints, calculate taxes, convert documents to PDF, and automate government services. How can I assist you today?");
      }
      return this._reply("Hello! I am operating in offline mode right now. How can I assist you with legal drafting, calculations, or documents?");
    }

    if (isHinglish) {
      if (/haal|kaise ho|kya haal/i.test(text)) {
        return this._reply("Main bilkul badhiya hoon! Aap bataiye, main aapki kya madad kar sakti hoon?");
      }
      if (/about your\s*self|apne baare|kaun ho/i.test(text)) {
        return this._reply("Main N-Dizi AI (Harshita AI) hoon, aapki digital assistant. Main legal drafts, TA/DA naksha, sarkari forms aur document processing mein madad karti hoon.");
      }
      if (/kya kar sakti/i.test(text) || /kabiliyat/i.test(text)) {
        return this._reply("Main legal notices, affidavits, tax calculations, forms aur documents automate karne mein madad kar sakti hoon. Aap kya karna chahte hain?");
      }
      return this._reply("Namaste! Abhi offline mode active hai. Main legal documents, forms ya calculations mein aapki poori madad kar sakti hoon.");
    }

    // Default Hindi
    if (/कैसे हो|कैसे हैं|कैसी हो|हाल/i.test(text)) {
      return this._reply("मैं ठीक हूँ। मैं आपकी कैसे सहायता कर सकती हूँ?");
    }
    if (/क्या कर सकती/i.test(text) || /सहायता/i.test(text)) {
      return this._reply("मैं कानूनी ड्राफ्ट, पुलिस शिकायत, टैक्स गणना और सरकारी फॉर्म भरने में आपकी पूरी सहायता कर सकती हूँ।");
    }

    return this._reply("नमस्ते! अभी ऑफलाइन मोड सक्रिय है। आप कानूनी ड्राफ्ट, एफिडेविट या गणितीय गणनाओं के लिए निर्देश दे सकते हैं।");
  }
}

module.exports = { GeneralChatSkill };