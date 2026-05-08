/**
 * LanguageEngine — Multi-Language Auto-Detection + Voice I/O
 *
 * Harshita AI अब हिंदी, अंग्रेज़ी, बंगाली, तमिल, तेलुगु, मराठी, गुजराती
 * और हिंग्लिश (Romanized Hindi) — सब समझती है।
 *
 * Features:
 *   1. AUTO-DETECT: Input text की भाषा खुद पहचानता है (regex + Unicode range)
 *   2. VOICE-TO-TEXT: Audio file (WhatsApp voice note / browser mic) → Text
 *   3. TEXT-TO-VOICE: AI response → Audio file (for WhatsApp / browser playback)
 *   4. TRANSLATE: AI-powered translation between any supported language pair
 *   5. RESPOND-IN-SAME: Detect user's language → respond in that same language
 *
 * Voice: Uses Groq/OpenAI Whisper API for STT, and browser Web Speech API for TTS.
 *        For server-side TTS (WhatsApp), uses Google TTS (free) or AI provider.
 *
 * Cost: ₹0 (Groq Whisper free tier) for voice, regex for detection (no API needed)
 */

const { aiProviderManager } = require('../utils/aiProviderManager');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// Unicode ranges for script detection
const SCRIPT_RANGES = {
  devanagari:  { regex: /[\u0900-\u097F]/, lang: 'hi', name: 'हिंदी', nameEn: 'Hindi' },
  bengali:     { regex: /[\u0980-\u09FF]/, lang: 'bn', name: 'বাংলা', nameEn: 'Bengali' },
  tamil:       { regex: /[\u0B80-\u0BFF]/, lang: 'ta', name: 'தமிழ்', nameEn: 'Tamil' },
  telugu:      { regex: /[\u0C00-\u0C7F]/, lang: 'te', name: 'తెలుగు', nameEn: 'Telugu' },
  gujarati:    { regex: /[\u0A80-\u0AFF]/, lang: 'gu', name: 'ગુજરાતી', nameEn: 'Gujarati' },
  kannada:     { regex: /[\u0C80-\u0CFF]/, lang: 'kn', name: 'ಕನ್ನಡ', nameEn: 'Kannada' },
  malayalam:   { regex: /[\u0D00-\u0D7F]/, lang: 'ml', name: 'മലയാളം', nameEn: 'Malayalam' },
  gurmukhi:    { regex: /[\u0A00-\u0A7F]/, lang: 'pa', name: 'ਪੰਜਾਬੀ', nameEn: 'Punjabi' },
  odia:        { regex: /[\u0B00-\u0B7F]/, lang: 'or', name: 'ଓଡ଼ିଆ', nameEn: 'Odia' },
  marathi:     { regex: /[\u0900-\u097F]/, lang: 'mr', name: 'मराठी', nameEn: 'Marathi' }, // Same script as Hindi
  urdu:        { regex: /[\u0600-\u06FF]/, lang: 'ur', name: 'اردو', nameEn: 'Urdu' },
};

// Hinglish / Romanized Hindi detection keywords
const HINGLISH_KEYWORDS = [
  'kya', 'kaise', 'kahan', 'kab', 'kyun', 'kaun', 'hai', 'hain', 'nahi',
  'mera', 'meri', 'tera', 'teri', 'aapka', 'aapki', 'hamara', 'humara',
  'karo', 'karna', 'chahiye', 'chahte', 'wala', 'wali', 'bhejo', 'dikhao',
  'batao', 'samjhao', 'bolo', 'suno', 'dekho', 'chalo', 'aao', 'jao',
  'bhai', 'yaar', 'accha', 'theek', 'sahi', 'galat', 'bahut', 'bohot',
  'abhi', 'pehle', 'baad', 'kal', 'aaj', 'parso', 'subah', 'raat',
  'paisa', 'rupiya', 'form', 'bharna', 'naukri', 'sarkari', 'aadhaar',
  'karwao', 'banwao', 'nikalo', 'lagao', 'dalo', 'uthao', 'girao',
  'mujhe', 'tumhe', 'unhe', 'isko', 'usko', 'sabko', 'kisiko',
  'lekin', 'kyunki', 'isliye', 'toh', 'phir', 'aur', 'ya', 'par'
];

class LanguageEngine {
  constructor() {
    this.name = 'LanguageEngine';
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'voice');
    this._ensureDir();

    // User language preferences (userId → langCode)
    this.userLangPrefs = new Map();
  }

  _ensureDir() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  // ─────────────────────────────────────────────────────────
  //  1. LANGUAGE AUTO-DETECTION (Zero-cost, regex-based)
  // ─────────────────────────────────────────────────────────

  /**
   * Detect the language of input text.
   * Returns: { lang: 'hi', name: 'हिंदी', nameEn: 'Hindi', confidence: 0.95, isHinglish: false }
   */
  detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return { lang: 'en', name: 'English', nameEn: 'English', confidence: 0, isHinglish: false };
    }

    const cleaned = text.trim();

    // Step 1: Check for Indic scripts via Unicode ranges
    for (const [script, info] of Object.entries(SCRIPT_RANGES)) {
      const matches = (cleaned.match(info.regex) || []).length;
      const totalChars = cleaned.replace(/\s/g, '').length;

      if (totalChars > 0 && matches / totalChars > 0.3) {
        // Special case: Devanagari can be Hindi OR Marathi
        // Marathi-specific markers
        if (script === 'devanagari' || script === 'marathi') {
          const marathiMarkers = /\bआहे\b|\bनाही\b|\bतुम्ही\b|\bमला\b|\bकरा\b|\bहोय\b/;
          if (marathiMarkers.test(cleaned)) {
            return { lang: 'mr', name: 'मराठी', nameEn: 'Marathi', confidence: 0.85, isHinglish: false };
          }
        }

        return {
          lang: info.lang,
          name: info.name,
          nameEn: info.nameEn,
          confidence: Math.min(matches / totalChars + 0.3, 1.0),
          isHinglish: false
        };
      }
    }

    // Step 2: Check for Hinglish (Romanized Hindi in Latin script)
    const words = cleaned.toLowerCase().split(/\s+/);
    const hinglishMatches = words.filter(w => HINGLISH_KEYWORDS.includes(w)).length;
    const hinglishRatio = words.length > 0 ? hinglishMatches / words.length : 0;

    if (hinglishRatio >= 0.2 || hinglishMatches >= 2) {
      return {
        lang: 'hi-Latn',
        name: 'हिंग्लिश',
        nameEn: 'Hinglish',
        confidence: Math.min(hinglishRatio + 0.4, 0.95),
        isHinglish: true
      };
    }

    // Step 3: Default to English
    return { lang: 'en', name: 'English', nameEn: 'English', confidence: 0.7, isHinglish: false };
  }

  /**
   * Remember user's language preference for a session
   */
  setUserLanguage(userId, langCode) {
    this.userLangPrefs.set(userId, langCode);
  }

  getUserLanguage(userId) {
    return this.userLangPrefs.get(userId) || 'hi-Latn'; // Default Hinglish
  }

  // ─────────────────────────────────────────────────────────
  //  2. VOICE-TO-TEXT (Speech Recognition)
  // ─────────────────────────────────────────────────────────

  /**
   * Convert audio file to text using Groq Whisper API (free) or OpenAI Whisper.
   *
   * @param {string} audioFilePath — absolute path to audio file (mp3/ogg/wav/webm)
   * @param {string} languageHint — optional ISO language code hint (e.g. 'hi')
   * @returns {Object} { text, detectedLanguage, duration }
   */
  async voiceToText(audioFilePath, languageHint = null) {
    console.log(`[LanguageEngine] 🎤 Voice→Text: ${path.basename(audioFilePath)}`);

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    // Try Groq Whisper first (free), then OpenAI
    const providers = ['groq', 'openai'];

    for (const providerName of providers) {
      const client = aiProviderManager.getClient(this.name, providerName);
      if (!client) continue;

      try {
        const fileStream = fs.createReadStream(audioFilePath);

        const transcription = await client.audio.transcriptions.create({
          file: fileStream,
          model: providerName === 'groq' ? 'whisper-large-v3' : 'whisper-1',
          language: languageHint || undefined,
          response_format: 'verbose_json'
        });

        const text = transcription.text || '';
        const detectedLang = transcription.language || languageHint || this.detectLanguage(text).lang;

        console.log(`[LanguageEngine] ✅ Transcribed (${providerName}): "${text.substring(0, 80)}..." [${detectedLang}]`);

        return {
          success: true,
          text,
          detectedLanguage: detectedLang,
          duration: transcription.duration || null,
          provider: providerName,
          segments: transcription.segments || []
        };
      } catch (error) {
        console.warn(`[LanguageEngine] ${providerName} Whisper failed: ${error.message}`);
        continue;
      }
    }

    return {
      success: false,
      text: '',
      error: 'No voice provider available. Set GROQ_API_KEY or OPENAI_API_KEY.',
      detectedLanguage: null
    };
  }

  /**
   * Process WhatsApp voice note: download media → transcribe → return text
   * Designed to plug directly into WhatsAppAgent._handleMessage()
   */
  async processWhatsAppVoiceNote(msg) {
    try {
      const media = await msg.downloadMedia();
      if (!media) throw new Error('Could not download voice note');

      // Save temp file
      const ext = media.mimetype?.includes('ogg') ? '.ogg' : '.mp3';
      const tempPath = path.join(this.uploadsDir, `voice_${Date.now()}${ext}`);
      fs.writeFileSync(tempPath, Buffer.from(media.data, 'base64'));

      // Transcribe
      const result = await this.voiceToText(tempPath);

      // Cleanup
      try { fs.unlinkSync(tempPath); } catch { /* ignore */ }

      return result;
    } catch (error) {
      console.error('[LanguageEngine] WhatsApp voice processing error:', error.message);
      return { success: false, text: '', error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────
  //  3. TEXT-TO-VOICE (Speech Synthesis)
  // ─────────────────────────────────────────────────────────

  /**
   * Convert text to speech audio file.
   * Uses OpenAI TTS or generates browser-ready TTS config.
   *
   * @param {string} text — text to speak
   * @param {string} lang — language code (hi, en, bn, ta, etc.)
   * @param {string} voice — voice name (alloy, echo, fable, onyx, nova, shimmer)
   * @returns {Object} { audioPath, duration } or { browserTTS config }
   */
  async textToVoice(text, lang = 'hi', voice = 'nova') {
    console.log(`[LanguageEngine] 🔊 Text→Voice: "${text.substring(0, 50)}..." [${lang}]`);

    // Try OpenAI TTS first (best quality)
    const client = aiProviderManager.getClient(this.name, 'openai');

    if (client) {
      try {
        const response = await client.audio.speech.create({
          model: 'tts-1',
          voice: voice,
          input: text,
          speed: lang === 'hi' ? 0.95 : 1.0 // Slightly slower for Hindi
        });

        const audioPath = path.join(this.uploadsDir, `tts_${Date.now()}.mp3`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await fsPromises.writeFile(audioPath, buffer);

        console.log(`[LanguageEngine] ✅ TTS saved: ${path.basename(audioPath)}`);
        return { success: true, audioPath, format: 'mp3', provider: 'openai' };
      } catch (error) {
        console.warn(`[LanguageEngine] OpenAI TTS failed: ${error.message}`);
      }
    }

    // Fallback: Return browser-ready Web Speech API config
    // The frontend will use the browser's built-in TTS
    return {
      success: true,
      useBrowserTTS: true,
      text,
      lang: this._toBCP47(lang),
      rate: lang === 'hi' ? 0.9 : 1.0,
      pitch: 1.0,
      provider: 'browser'
    };
  }

  /**
   * Convert internal lang codes to BCP-47 for browser TTS
   */
  _toBCP47(lang) {
    const map = {
      'hi': 'hi-IN', 'hi-Latn': 'hi-IN', 'en': 'en-IN',
      'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN',
      'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
      'pa': 'pa-IN', 'or': 'or-IN', 'mr': 'mr-IN',
      'ur': 'ur-PK'
    };
    return map[lang] || 'hi-IN';
  }

  // ─────────────────────────────────────────────────────────
  //  4. AI TRANSLATION
  // ─────────────────────────────────────────────────────────

  /**
   * Translate text between any two supported languages using AI.
   *
   * @param {string} text — source text
   * @param {string} fromLang — source language code (or 'auto')
   * @param {string} toLang — target language code
   * @returns {Object} { translatedText, fromLang, toLang }
   */
  async translate(text, fromLang = 'auto', toLang = 'hi') {
    // Auto-detect source language if needed
    if (fromLang === 'auto') {
      const detected = this.detectLanguage(text);
      fromLang = detected.lang;
    }

    // No translation needed if same language
    if (fromLang === toLang) {
      return { success: true, translatedText: text, fromLang, toLang, translated: false };
    }

    const langNames = {
      'hi': 'Hindi', 'hi-Latn': 'Hinglish (Romanized Hindi)', 'en': 'English',
      'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu', 'gu': 'Gujarati',
      'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'or': 'Odia',
      'mr': 'Marathi', 'ur': 'Urdu'
    };

    try {
      const client = aiProviderManager.getClient(this.name);
      const model = aiProviderManager.getModel(this.name);

      if (!client) {
        return { success: false, error: 'No AI provider available for translation' };
      }

      const prompt = `Translate the following text from ${langNames[fromLang] || fromLang} to ${langNames[toLang] || toLang}.
Keep it natural and conversational. Do not add explanations.
If the target is "Hinglish", write in Roman Hindi (e.g. "Aapka form submit ho gaya hai").

Text: "${text}"

Translation:`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const translatedText = response.choices[0].message.content.trim()
        .replace(/^["']|["']$/g, ''); // Remove surrounding quotes if any

      return { success: true, translatedText, fromLang, toLang, translated: true };
    } catch (error) {
      console.error(`[LanguageEngine] Translation error: ${error.message}`);
      return { success: false, translatedText: text, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────────────
  //  5. SMART RESPONSE WRAPPER
  // ─────────────────────────────────────────────────────────

  /**
   * Process any input (text or voice) and prepare a response in the user's language.
   * This is the main entry point for integrating with MasterAgent / WhatsApp.
   *
   * @param {string} userId
   * @param {string|null} textInput — text message (if text input)
   * @param {string|null} audioPath — audio file path (if voice input)
   * @returns {Object} { inputText, inputLang, processReady: true }
   */
  async processInput(userId, textInput = null, audioPath = null) {
    let finalText = '';
    let detectedLang = null;

    // Voice input → convert to text first
    if (audioPath) {
      const voiceResult = await this.voiceToText(audioPath);
      if (voiceResult.success) {
        finalText = voiceResult.text;
        detectedLang = voiceResult.detectedLanguage;
      } else {
        return { success: false, error: 'Voice transcription failed: ' + voiceResult.error };
      }
    } else if (textInput) {
      finalText = textInput;
    } else {
      return { success: false, error: 'No input provided' };
    }

    // Detect language if not already detected by voice
    if (!detectedLang) {
      const detection = this.detectLanguage(finalText);
      detectedLang = detection.lang;
    }

    // Remember user's language preference
    this.setUserLanguage(userId, detectedLang);

    return {
      success: true,
      inputText: finalText,
      inputLang: detectedLang,
      inputLangName: this._getLangName(detectedLang),
      processReady: true
    };
  }

  /**
   * Wrap an AI response to match the user's detected language.
   * Call this AFTER MasterAgent generates a response.
   *
   * @param {string} userId
   * @param {string} responseText — the English/Hindi response from MasterAgent
   * @param {boolean} includeVoice — whether to also generate audio
   * @returns {Object} { text, lang, voice? }
   */
  async wrapResponse(userId, responseText, includeVoice = false) {
    const userLang = this.getUserLanguage(userId);

    // Translate response to user's language if needed
    let finalText = responseText;
    if (userLang !== 'en' && userLang !== 'hi' && userLang !== 'hi-Latn') {
      const translated = await this.translate(responseText, 'auto', userLang);
      if (translated.success && translated.translated) {
        finalText = translated.translatedText;
      }
    }

    const result = {
      text: finalText,
      lang: userLang,
      langName: this._getLangName(userLang)
    };

    // Generate voice if requested
    if (includeVoice) {
      const voice = await this.textToVoice(finalText, userLang);
      result.voice = voice;
    }

    return result;
  }

  _getLangName(langCode) {
    const names = {
      'hi': 'हिंदी', 'hi-Latn': 'हिंग्लिश', 'en': 'English',
      'bn': 'বাংলা', 'ta': 'தமிழ்', 'te': 'తెలుగు', 'gu': 'ગુજરાતી',
      'kn': 'ಕನ್ನಡ', 'ml': 'മലയാളം', 'pa': 'ਪੰਜਾਬੀ', 'or': 'ଓଡ଼ିଆ',
      'mr': 'मराठी', 'ur': 'اردو'
    };
    return names[langCode] || 'Unknown';
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'hi', name: 'हिंदी', nameEn: 'Hindi' },
      { code: 'hi-Latn', name: 'हिंग्लिश', nameEn: 'Hinglish' },
      { code: 'en', name: 'English', nameEn: 'English' },
      { code: 'bn', name: 'বাংলা', nameEn: 'Bengali' },
      { code: 'ta', name: 'தமிழ்', nameEn: 'Tamil' },
      { code: 'te', name: 'తెలుగు', nameEn: 'Telugu' },
      { code: 'gu', name: 'ગુજરાતી', nameEn: 'Gujarati' },
      { code: 'kn', name: 'ಕನ್ನಡ', nameEn: 'Kannada' },
      { code: 'ml', name: 'മലയാളം', nameEn: 'Malayalam' },
      { code: 'pa', name: 'ਪੰਜਾਬੀ', nameEn: 'Punjabi' },
      { code: 'mr', name: 'मराठी', nameEn: 'Marathi' },
      { code: 'ur', name: 'اردو', nameEn: 'Urdu' },
      { code: 'or', name: 'ଓଡ଼ିଆ', nameEn: 'Odia' }
    ];
  }
}

module.exports = { LanguageEngine };
