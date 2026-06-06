/**
 * VoiceAgentSkill — Dedicated Voice Assistant Skill
 * 
 * Harshita AI ko ek real "Voice Assistant" banata hai.
 * 
 * Features:
 *   - Voice mode ON/OFF (awaaz mode)
 *   - Spoken responses (TTS) request karna
 *   - Voice-specific commands handle karna
 *   - Natural Hindi/English/Hinglish voice experience
 * 
 * Intents:
 *   voice_mode, voice_on, voice_off, speak, bol, awaaz, tts, mute, suno, listen
 */

const { BaseSkill } = require('./BaseSkill');

class VoiceAgentSkill extends BaseSkill {
  constructor() {
    super();

    this.name = 'voice_agent';
    this.displayName = 'Voice Assistant';
    this.displayNameEn = 'Voice Agent';
    this.description = 'Voice mode control + spoken responses (awaaz mein baat karo)';
    this.descriptionEn = 'Voice mode + text-to-speech control';
    this.version = '1.0.0';
    this.category = 'utility';
    this.priority = 8; // High priority for voice

    // Voice ke liye intents
    this.intents = [
      'voice_mode',
      'voice_on',
      'voice_off',
      'voice_start',
      'voice_stop',
      'speak',
      'bol',
      'awaaz',
      'tts',
      'mute',
      'unmute',
      'suno',
      'listen',
      'microphone',
      'voice_band',
      'voice_chalu'
    ];

    // Keywords (Hindi + English + Hinglish)
    this.keywords = {
      hi: ['awaaz', 'bol', 'suno', 'sunao', 'voice', 'mic', 'microphone', 'tts', 'mute', 'unmute'],
      en: ['voice', 'speak', 'talk', 'listen', 'mic', 'tts', 'mute', 'unmute', 'sound'],
      hinglish: ['voice on', 'voice off', 'awaaz on', 'awaaz band', 'bol ke', 'suno', 'mic chalu']
    };

    this.canRunOffline = true;
    this.requiresAuth = false;

    // Per-user voice preference (in-memory for now)
    this.userVoiceMode = new Map(); // userId → true/false
  }

  async initialize() {
    await super.initialize();
    console.log('🎙️ VoiceAgentSkill loaded — Voice mode + TTS support ready');
  }

  /**
   * Main execute method
   */
  async execute(context) {
    const { userId, message, params } = context;
    const lowerMsg = (message || '').toLowerCase();

    // Detect what user wants
    const wantsOn = this._wantsVoiceOn(lowerMsg);
    const wantsOff = this._wantsVoiceOff(lowerMsg);

    if (wantsOn) {
      this.userVoiceMode.set(userId, true);
      return this._reply(
        '🎙️ Voice mode ON ho gaya!\n\nAb main aapko awaaz mein jawab dungi. Microphone button daba kar boliye.\n\nVoice band karne ke liye "voice off" ya "awaaz band" bolo.',
        { voiceMode: true },
        { speak: true, text: 'Voice mode on ho gaya. Ab main awaaz mein baat karungi.' }
      );
    }

    if (wantsOff) {
      this.userVoiceMode.set(userId, false);
      return this._reply(
        '🔇 Voice mode band kar diya.\n\nAb sirf text messages aayenge. Aap chahein to kabhi bhi "voice on" bol sakte ho.',
        { voiceMode: false }
      );
    }

    // Check current status
    if (lowerMsg.includes('status') || lowerMsg.includes('kaise') || lowerMsg.includes('kya hal')) {
      const isOn = this.userVoiceMode.get(userId) || false;
      return this._reply(
        isOn 
          ? '🎙️ Voice mode currently ON hai. Main awaaz mein jawab de rahi hoon.'
          : '🔇 Voice mode OFF hai. Text mode mein hoon. "Voice on" bolo to shuru karte hain.',
        { voiceMode: isOn }
      );
    }

    // Default: User is asking about voice or wants to use it
    const isCurrentlyOn = this.userVoiceMode.get(userId) || false;

    if (!isCurrentlyOn) {
      return this._reply(
        '🎙️ Voice Assistant yahan hai!\n\nAap "voice on" ya "awaaz chalu karo" bol kar voice mode start kar sakte ho.\n\nPhir microphone button daba kar Hindi/English mein boliye — main samajh kar jawab dungi (awaaz mein bhi).',
        { voiceMode: false },
        { speak: false }
      );
    }

    // Voice mode already on — confirm and invite to speak
    return this._reply(
      '🎤 Main sun rahi hoon! Microphone button daba kar kuch bhi bolo.\n\nMain aapki baat samajh kar awaaz mein jawab dungi.',
      { voiceMode: true },
      { speak: true, text: 'Main sun rahi hoon. Boliye.' }
    );
  }

  /**
   * Helper: User wants to turn voice ON?
   */
  _wantsVoiceOn(msg) {
    const onPhrases = [
      'voice on', 'voice mode on', 'voice chalu', 'voice start',
      'awaaz on', 'awaaz chalu', 'awaaz mode', 'bol ke sunao',
      'suno', 'mic on', 'microphone on', 'voice band mat', 'voice chalu karo'
    ];
    return onPhrases.some(p => msg.includes(p));
  }

  /**
   * Helper: User wants to turn voice OFF?
   */
  _wantsVoiceOff(msg) {
    const offPhrases = [
      'voice off', 'voice mode off', 'voice band', 'voice stop',
      'awaaz band', 'awaaz off', 'mute', 'chup', 'text mode', 'only text',
      'awaaz mat', 'bolna band'
    ];
    return offPhrases.some(p => msg.includes(p));
  }

  /**
   * Check if user has voice mode enabled
   */
  isVoiceModeEnabled(userId) {
    return this.userVoiceMode.get(userId) || false;
  }

  /**
   * Force set voice mode (can be called from other skills)
   */
  setVoiceMode(userId, enabled) {
    this.userVoiceMode.set(userId, !!enabled);
  }
}

module.exports = { VoiceAgentSkill };
