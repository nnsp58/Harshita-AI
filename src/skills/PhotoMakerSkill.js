/**
 * PhotoMakerSkill — Passport & Joint Photo Generator
 * 
 * Handles user intents for creating passport size photos or joint photos.
 * Triggers the native PassportPhotoMaker component on the frontend.
 */
const { BaseSkill } = require('./BaseSkill');

class PhotoMakerSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'photo_maker';
    this.displayName = 'पासपोर्ट फोटो मेकर';
    this.displayNameEn = 'Passport Photo Maker';
    this.description = 'पासपोर्ट साइज़ और जॉइंट फोटो बनाना';
    this.descriptionEn = 'Create passport size and joint photos';
    this.version = '2.0.0';
    this.category = 'utility';
    this.canRunOffline = true;
    this.priority = 9; // Higher than DocumentOCR (8) to win passport photo routing
    
    this.intents = ['create_passport_photo', 'create_joint_photo'];

    this.visible = true;
    this.type = 'application';
    this.route = '/workspace/coming-soon?tool=Photo+Maker';
    this.keywords = {
      hi: ['पासपोर्ट फोटो', 'जॉइंट फोटो', 'फोटो बनाओ', 'पासपोर्ट साइज़', 'पासपोर्ट साइज', 'फोटो शीट'],
      en: ['passport photo', 'joint photo', 'passport size', 'photo sheet', 'passport photo maker', 'photo banao'],
      hinglish: ['passport photo banao', 'passport banao', 'joint photo chahiye', 'photo size karna hai',
                 'passport size photo', 'passport wali photo', 'photo banana hai', 'passport size photo banao']
    };
  }

  async execute(context) {
    const { message } = context;
    const text = (message || '').toLowerCase();

    const isJoint = /joint|जॉइंट/i.test(text);
    
    if (isJoint) {
      return this._reply(
        '📸 *Joint Photo Maker Mode*\n\nमैंने जॉइंट (Landscape) फोटो मेकर तैयार कर लिया है। कृपया अपनी फोटो अपलोड करें या कैमरे का इस्तेमाल करें।',
        { 
          mode: 'open_tool', 
          toolName: 'PassportPhotoMaker',
          toolProps: { defaultType: 'landscape' }
        }
      );
    }

    return this._reply(
      '📸 *Passport Photo Maker*\n\nमैंने पासपोर्ट फोटो टूल तैयार कर लिया है। आप यहाँ 4, 8, या ज़्यादा कॉपियां एक साथ बना सकते हैं।',
      { 
        mode: 'open_tool', 
        toolName: 'PassportPhotoMaker',
        toolProps: { defaultType: 'portrait' }
      }
    );
  }
}

module.exports = { PhotoMakerSkill };
