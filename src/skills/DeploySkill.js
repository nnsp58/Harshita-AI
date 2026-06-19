/**
 * DeploySkill — Render Deployment Manager
 *
 * Automatically triggers deployments to Render via Deploy Hooks
 * when the user requests a server publish or deploy.
 */

const { BaseSkill } = require('./BaseSkill');
const axios = require('axios');

class DeploySkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'deploy_manager';
    this.displayName = 'रेंडर डिप्लॉयमेंट (Deploy Agent)';
    this.displayNameEn = 'Render Deploy Agent';
    this.description = 'Render सर्वर पर नया कोड डिप्लॉय / पब्लिश करें';
    this.descriptionEn = 'Trigger automated deployments to Render via Deploy Hooks';
    this.version = '1.0.0';
    this.category = 'utility';
    this.canRunOffline = false;
    this.priority = 8;
    
    this.intents = ['deploy', 'publish', 'render_deploy'];
    
    this.keywords = {
      hi: ['डिप्लॉय', 'पब्लिश', 'सर्वर अपडेट', 'लाइव करो', 'रेंडर'],
      en: ['deploy', 'publish', 'server update', 'render', 'go live'],
      hinglish: ['deploy karo', 'publish kardo', 'server update', 'live karo', 'render deploy']
    };
  }

  async execute(context) {
    const { message } = context;
    const deployHookUrl = process.env.RENDER_DEPLOY_HOOK_URL;

    // Check if user is providing a URL manually in the message
    const urlMatch = message.match(/https:\/\/api\.render\.com\/deploy\/[a-zA-Z0-9_-]+/i);
    const providedUrl = urlMatch ? urlMatch[0] : null;

    const finalHookUrl = providedUrl || deployHookUrl;

    if (!finalHookUrl) {
      return this._reply(
        '⚠️ मुझे Render Deploy Hook URL नहीं मिला। \n\n' +
        'सर्वर को ऑटो-डिप्लॉय करने के लिए, कृपया अपना Render Deploy Hook URL मुझे दें (यह `https://api.render.com/deploy/...` से शुरू होता है)।\n' +
        'या फिर इसे अपने `.env` फाइल में `RENDER_DEPLOY_HOOK_URL=...` के रूप में सेट करें।',
        { mode: 'missing_deploy_hook' }
      );
    }

    try {
      this._reply('🚀 Render पर डिप्लॉयमेंट (Deployment) स्टार्ट किया जा रहा है... कृपया प्रतीक्षा करें।', null, 'processing');
      
      const response = await axios.post(finalHookUrl);
      
      if (response.status >= 200 && response.status < 300) {
        return this._reply(
          '✅ **सफलतापूर्वक डिप्लॉयमेंट ट्रिगर हो गया!** \n\nRender आपके GitHub से नया कोड लेकर सर्वर को अपडेट कर रहा है। कुछ ही मिनटों में आपकी वेबसाइट/सर्वर नए बदलावों के साथ लाइव हो जाएगी।',
          { mode: 'deploy_success', status: response.status }
        );
      } else {
        return this._error('Render ने डिप्लॉय रिक्वेस्ट स्वीकार नहीं की। Status: ' + response.status);
      }
    } catch (error) {
      console.error('[DeploySkill] Error triggering deploy hook:', error.message);
      return this._error('डिप्लॉयमेंट स्टार्ट करने में समस्या आई: ' + error.message);
    }
  }
}

module.exports = { DeploySkill };
