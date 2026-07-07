const { BaseSkill } = require('../../skills/BaseSkill');
const { TaxMemoryEngine } = require('./TaxMemoryEngine');
const { TaxSecurityEngine } = require('./TaxSecurityEngine');
const { TaxRuleEngine } = require('./TaxRuleEngine');
const { TaxWorkspaceRouter } = require('./TaxWorkspaceRouter');
const { TaxAnalytics } = require('./TaxAnalytics');

class MasterTaxAgent extends BaseSkill {
  constructor() {
    super();
    this.name = 'master_tax_agent';
    this.displayName = 'Professional Tax Department';
    this.displayNameEn = 'Professional Tax Department';
    this.description = 'Central router for all Tax and ITR services (Phase 1)';
    this.descriptionEn = 'Central router for all Tax and ITR services (Phase 1)';
    this.version = '4.0.0';
    this.category = 'finance';
    this.canRunOffline = false;
    this.priority = 10;
    
    // Covering all tax-related intents to funnel through this master agent
    this.intents = [
      'itr_filing', 'file_itr', 'income_tax_return',
      'gst_return', 'gst_registration', 
      'pan_card', 'tds', 'ais', 'form16', '26as', 'refund_status'
    ];
    
    this.keywords = {
      hi: ['आईटीआर', 'टैक्स', 'रिटर्न', 'रिफंड', 'जीएसटी'],
      en: ['itr', 'tax', 'return', 'refund', 'gst', 'ais', '26as', 'form16'],
      hinglish: ['itr bhar do', 'tax file', 'refund check', 'gst']
    };
  }

  async execute(context) {
    const { message, userId } = context;
    const uid = userId || 'anon';
    const msg = message ? message.trim() : '';

    TaxAnalytics.trackEvent('master_tax_agent_invoked', { uid });

    // 1. Memory Engine: Fetch or Create Profile
    let profile = await TaxMemoryEngine.getProfile(uid);
    if (!profile) {
      // In-memory fallback if DB fails or anon
      profile = { pan: null, aadhaar: null };
    }

    // 2. Security Engine: Extract and Update Details (Regex)
    const panMatch = msg.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/i);
    const aadhaarMatch = msg.match(/\b\d{12}\b/);
    
    let updated = false;
    if (panMatch && !profile.pan) { profile.pan = panMatch[0].toUpperCase(); updated = true; }
    if (aadhaarMatch && !profile.aadhaar) { profile.aadhaar = aadhaarMatch[0]; updated = true; }

    if (updated && uid !== 'anon') {
      await TaxMemoryEngine.updateProfile(uid, { pan: profile.pan, aadhaar: profile.aadhaar });
      TaxMemoryEngine.logAudit(uid, 'UPDATE_PROFILE', 'Updated PAN/Aadhaar via chat extraction');
    }

    // 3. Check what's missing for basic routing
    if (!profile.pan) {
      return this._reply(`नमस्कार! मैं आपका **Professional Tax Agent** हूँ।\n\nमुझे आपका PAN नहीं मिला। कृपया अपना **PAN Number** दर्ज़ करें।`, { mode: 'chat' });
    }

    // 4. Rule Engine: Determine ITR Type
    const detectedType = TaxRuleEngine.determineItrType(profile);

    // 5. Workspace Router: Route to correct UI workspace
    const payload = TaxWorkspaceRouter.routeTo('dashboard', {
      pan: profile.pan,
      aadhaar: TaxSecurityEngine.maskAadhaar(profile.aadhaar),
      detectedType
    });

    return this._reply(`✅ आपका टैक्स प्रोफाइल लोड हो गया है।\n**PAN:** ${TaxSecurityEngine.maskPan(profile.pan)}\n\nहम Professional Tax Workspace ओपन कर रहे हैं...`, payload);
  }
}

module.exports = { MasterTaxAgent };
