/**
 * MasterTaxAgent — Harshita AI Enterprise Tax Department
 * 
 * PRD-075 STRICT RULES:
 *   - MasterTaxAgent NEVER guesses.
 *   - MasterTaxAgent NEVER calculates.
 *   - MasterTaxAgent ONLY routes.
 *   - Memory ALWAYS remembers.
 * 
 * This is the ORCHESTRATOR. It:
 *   1. Detects user intent
 *   2. Loads/creates user Tax Profile from Memory
 *   3. Extracts PAN/Aadhaar from chat (Security Engine)
 *   4. Routes to the correct Sub-Agent (ITRAgent, GSTAgent, etc.)
 *   5. Launches the Workspace
 */

const { BaseSkill } = require('../../skills/BaseSkill');
const { TaxMemoryEngine } = require('./TaxMemoryEngine');
const { TaxSecurityEngine } = require('./TaxSecurityEngine');
const { TaxWorkspaceRouter } = require('./TaxWorkspaceRouter');
const { TaxAnalytics } = require('./TaxAnalytics');
const { ITRAgent } = require('./agents/ITRAgent');

class MasterTaxAgent extends BaseSkill {
  constructor() {
    super();
    this.name = 'master_tax_agent';
    this.displayName = 'Professional Tax Department';
    this.displayNameEn = 'Professional Tax Department';
    this.description = 'AI Chartered Accountant — ITR, GST, Refund, TDS, और सभी Tax Services';
    this.descriptionEn = 'AI Chartered Accountant — ITR, GST, Refund, TDS, and all Tax Services';
    this.version = '5.0.0';
    this.category = 'finance';
    this.canRunOffline = false;
    this.priority = 10;
    
    this.intents = [
      'itr_filing', 'file_itr', 'income_tax_return',
      'gst_return', 'gst_registration', 
      'pan_card', 'tds', 'ais', 'form16', '26as', 'refund_status'
    ];
    
    this.keywords = {
      hi: ['आईटीआर', 'टैक्स', 'रिटर्न', 'रिफंड', 'जीएसटी', 'इनकम टैक्स', 'आयकर'],
      en: ['itr', 'tax', 'return', 'refund', 'gst', 'ais', '26as', 'form16', 'income tax'],
      hinglish: ['itr bhar do', 'tax file karo', 'refund check', 'gst bharo', 'mera itr bhar do']
    };

    // Sub-agents (only ITRAgent is implemented for now)
    this._itrAgent = new ITRAgent();
  }

  async execute(context) {
    const { message, userId } = context;
    const uid = userId || 'anon';
    const msg = message ? message.trim() : '';

    TaxAnalytics.trackEvent('master_tax_agent_invoked', { uid });

    // ═══════════════════════════════════════
    //  STEP 1: Memory — Load User Tax Profile
    // ═══════════════════════════════════════
    let profile = await TaxMemoryEngine.getProfile(uid);
    if (!profile) {
      profile = { pan: null, aadhaar: null };
    }

    // ═══════════════════════════════════════
    //  STEP 2: Security — Extract PAN/Aadhaar from chat
    // ═══════════════════════════════════════
    const panMatch = msg.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/i);
    const aadhaarMatch = msg.match(/\b\d{12}\b/);
    
    let updated = false;
    if (panMatch && !profile.pan) { profile.pan = panMatch[0].toUpperCase(); updated = true; }
    if (aadhaarMatch && !profile.aadhaar) { profile.aadhaar = aadhaarMatch[0]; updated = true; }

    if (updated && uid !== 'anon') {
      await TaxMemoryEngine.updateProfile(uid, { pan: profile.pan, aadhaar: profile.aadhaar });
      TaxMemoryEngine.logAudit(uid, 'UPDATE_PROFILE', 'PAN/Aadhaar extracted from chat message');
    }

    // ═══════════════════════════════════════
    //  STEP 3: Welcome — First-time user greeting
    // ═══════════════════════════════════════
    if (!profile.pan) {
      return this._reply(
        `🙏 **नमस्कार! मैं Harshita AI Chartered Accountant हूँ।**\n\n` +
        `मैं आपका Income Tax Return तैयार करूँगा।\n\n` +
        `सबसे पहले, कृपया अपना **PAN Number** दर्ज करें।\n` +
        `(जैसे: ABCDE1234F)`,
        { mode: 'chat' }
      );
    }

    // ═══════════════════════════════════════
    //  STEP 4: Route — Detect intent & delegate to Sub-Agent
    //  MasterTaxAgent NEVER processes. It ONLY routes.
    // ═══════════════════════════════════════

    // Document upload handling
    if (context.attachments && context.attachments.length > 0) {
      return this._reply(
        `📄 Document प्राप्त हुआ। कृपया Workspace में **Documents** tab पर जाएं — AI OCR Engine automatic extract करेगा।`,
        TaxWorkspaceRouter.routeTo('documents', {
          pan: TaxSecurityEngine.maskPan(profile.pan),
          attachments: context.attachments.length
        })
      );
    }

    // Conduct Interview via ITRAgent
    const interviewState = await this._itrAgent.conductInterview(context, profile);

    if (interviewState.status === 'INTERVIEW' || interviewState.status === 'HEALING') {
      return this._reply(interviewState.question, {
        mode: 'chat',
        options: interviewState.options,
        field: interviewState.field || interviewState.healingField
      });
    }

    // Interview complete — Prepare Return (delegated to ITRAgent)
    const summary = await this._itrAgent.prepareReturn(profile);

    // Route to Workspace with summary
    const payload = TaxWorkspaceRouter.routeTo('dashboard', {
      pan: TaxSecurityEngine.maskPan(profile.pan),
      aadhaar: TaxSecurityEngine.maskAadhaar(profile.aadhaar),
      summary
    });

    return this._reply(
      `✅ **आपका Tax Profile तैयार है।**\n\n` +
      `**PAN:** ${TaxSecurityEngine.maskPan(profile.pan)}\n\n` +
      `${summary.message || 'कृपया Workspace में review करें।'}`,
      payload
    );
  }
}

module.exports = { MasterTaxAgent };
