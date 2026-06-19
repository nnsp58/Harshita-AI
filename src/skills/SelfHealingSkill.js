/**
 * SelfHealingSkill — Manually triggers the SelfEvolutionAgent
 * 
 * When the user says "self healing karo" or "fix yourself",
 * this skill will invoke the cognitive audit and patching process.
 */

const { BaseSkill } = require('./BaseSkill');
const { SelfEvolutionAgent } = require('../core/selfEvolutionAgent');

class SelfHealingSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'self_healing';
    this.displayName = 'सेल्फ हीलिंग (स्व-सुधार)';
    this.displayNameEn = 'Self Healing & Evolution';
    this.description = 'AI को अपनी पिछली गलतियों से सीखने और खुद को सुधारने का निर्देश देना';
    this.descriptionEn = 'Triggers the AI to analyze its failure logs and evolve its prompt rules';
    this.version = '1.0.0';
    this.category = 'system';
    this.canRunOffline = false;
    this.priority = 9; // High priority so it doesn't get mistaken for general chat

    this.intents = ['self_healing', 'evolve', 'fix_errors', 'self_repair'];

    this.keywords = {
      hi: ['सेल्फ हीलिंग', 'हीलिंग', 'गलतियां सुधारो', 'खुद को ठीक करो', 'इवोल्व'],
      en: ['self healing', 'self repair', 'fix errors', 'learn from mistakes', 'evolve'],
      hinglish: ['self healing', 'healing karo', 'theek karo', 'repair karo', 'galtiyan sudharo']
    };
  }

  async execute(context) {
    const { userId } = context;

    // Send an immediate acknowledgement
    // Note: To return a response immediately and run evolution in background,
    // we start the evolution async and return the reply.
    
    setTimeout(async () => {
      try {
        console.log(`[SelfHealingSkill] 🧬 User ${userId} requested manual self-healing.`);
        const evolutionAgent = new SelfEvolutionAgent();
        const result = await evolutionAgent.analyzeAndEvolve();
        
        if (result && result.evolved) {
          console.log(`[SelfHealingSkill] ✅ Self-healing complete. ${result.reason || ''}`);
        } else {
          console.log(`[SelfHealingSkill] ℹ️ No new errors found to heal.`);
        }
      } catch (err) {
        console.error('[SelfHealingSkill] ❌ Self-healing failed:', err.message);
      }
    }, 500);

    return this._reply(
      '🧬 **Self-Healing Process Initiated...**\n\nमैंने अपनी पिछली सभी इंटरेक्शन्स और गलतियों (Failure Logs) का विश्लेषण शुरू कर दिया है। मैं अपनी प्रॉम्प्टिंग और कॉग्निटिव स्किल्स को ऑटोमैटिक रूप से अपडेट कर रही हूँ।\n\nयह प्रक्रिया बैकग्राउंड में चलती रहेगी। क्या आप किसी अन्य सेवा का उपयोग करना चाहेंगे?'
    );
  }
}

module.exports = { SelfHealingSkill };
