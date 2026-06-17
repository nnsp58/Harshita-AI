/**
 * MediaSkill — Video & Audio Converter
 * 
 * Handles intents related to video/audio format conversion and triggers MediaConverter.
 */
const { BaseSkill } = require('./BaseSkill');

class MediaSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'media_converter';
    this.displayName = 'मीडिया कन्वर्टर';
    this.displayNameEn = 'Media Converter';
    this.description = 'वीडियो और ऑडियो फॉर्मेट बदलें';
    this.descriptionEn = 'Convert Video and Audio formats securely';
    this.version = '2.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 4;
    
    this.intents = ['convert_video', 'convert_audio', 'media_format'];
    this.keywords = {
      hi: ['वीडियो कन्वर्ट', 'ऑडियो बदलें', 'mp4 बनाओ', 'mp3 में बदलो'],
      en: ['video converter', 'audio converter', 'convert to mp4', 'convert to mp3'],
      hinglish: ['video convert', 'audio change karo', 'mp4 banao', 'mp3 chahiye']
    };
  }

  async execute(context) {
    return this._reply(
      '🎬 *Media Converter*\n\nमैंने मीडिया कन्वर्टर टूल खोल दिया है। यहाँ से आप किसी भी **Video** को MP4, AVI, MKV आदि में और **Audio** को MP3, WAV आदि में बदल सकते हैं।',
      { mode: 'open_tool', toolName: 'MediaConverter' }
    );
  }
}

module.exports = { MediaSkill };
