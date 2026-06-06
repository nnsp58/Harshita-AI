/**
 * SkillRegistry — सभी Skills को ऑटो-लोड और मैनेज करने वाला सिस्टम
 * 
 * यह Registry:
 *   1. /src/skills/ फोल्डर से सभी *Skill.js फाइलें ऑटो-लोड करता है
 *   2. हर स्किल को intent से मैप करता है
 *   3. MasterAgent को बताता है कि कौन सी स्किल किस काम के लिए है
 * 
 * नई स्किल जोड़ने के लिए:
 *   1. src/skills/ में XxxSkill.js फाइल बनाओ
 *   2. BaseSkill extend करो
 *   3. सर्वर restart करो — बस! SkillRegistry खुद उठा लेगा
 */

const fs = require('fs');
const path = require('path');
const { BaseSkill } = require('./BaseSkill');

class SkillRegistry {
  constructor() {
    this.skills = new Map();       // name → skill instance
    this.intentMap = new Map();    // intent → skill name
    this.isLoaded = false;
  }

  // ═══════════════════════════════════════════════════════════
  //  Auto-Load: सभी स्किल्स को फोल्डर से उठाओ
  // ═══════════════════════════════════════════════════════════

  /**
   * /src/skills/ फोल्डर से सभी *Skill.js files ऑटो-लोड करो
   */
  async autoLoad(skillsDir = null) {
    const dir = skillsDir || __dirname;

    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║   🧠 HARSHITA AI — Skill System Loading...  ║');
    console.log('╚══════════════════════════════════════════════╝');

    try {
      const files = fs.readdirSync(dir).filter(f => 
        f.endsWith('Skill.js') && 
        f !== 'BaseSkill.js'
      );

      for (const file of files) {
        try {
          const filePath = path.join(dir, file);
          const module = require(filePath);
          
          // Find the exported Skill class
          const SkillClass = Object.values(module).find(
            v => typeof v === 'function' && v.prototype instanceof BaseSkill
          );

          if (!SkillClass) {
            console.warn(`   ⚠️ ${file}: कोई BaseSkill class नहीं मिली, skip कर रहे हैं`);
            continue;
          }

          const skill = new SkillClass();
          await this.register(skill);

        } catch (error) {
          console.error(`   ❌ ${file} लोड करने में एरर: ${error.message}`);
        }
      }

      this.isLoaded = true;
      console.log(`\n   📊 कुल ${this.skills.size} स्किल्स लोड हुईं | ${this.intentMap.size} intents mapped`);
      console.log('═══════════════════════════════════════════════\n');

    } catch (error) {
      console.error('[SkillRegistry] ❌ Auto-load failed:', error.message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  Register: एक स्किल रजिस्टर करो
  // ═══════════════════════════════════════════════════════════

  /**
   * एक स्किल को registry में जोड़ो
   * @param {BaseSkill} skill - स्किल instance
   */
  async register(skill) {
    if (!skill.name) {
      throw new Error('Skill का name ज़रूरी है!');
    }

    // Initialize the skill
    try {
      await skill.initialize();
    } catch (e) {
      console.warn(`   ⚠️ ${skill.name} initialize failed: ${e.message} — loading anyway`);
      skill.isLoaded = true; // Still register it
    }

    // Auto-wrap execute() with memory + learning (zero-change for skills)
    this._wrapWithMemory(skill);

    // Store the skill
    this.skills.set(skill.name, skill);

    // Map all its intents
    for (const intent of skill.intents) {
      // अगर intent पहले से किसी और स्किल पर mapped है,
      // तो higher priority वाली स्किल को रखो
      const existing = this.intentMap.get(intent);
      if (existing) {
        const existingSkill = this.skills.get(existing);
        if (existingSkill && existingSkill.priority >= skill.priority) {
          continue; // पुरानी स्किल की priority ज्यादा है, skip
        }
      }
      this.intentMap.set(intent, skill.name);
    }

    console.log(`   ✅ ${skill.displayName} (${skill.name}) — ${skill.intents.length} intents | ${skill.canRunOffline ? '🟢 Offline' : '🔵 Online'}`);
  }

  // ═══════════════════════════════════════════════════════════
  //  Auto-Wrap: Har skill ka execute() ko memory + learning ke saath wrap kar do
  //  Zero change for skill code — registry handles it automatically
  // ═══════════════════════════════════════════════════════════
  _wrapWithMemory(skill) {
    if (skill._wrapped) return; // Already wrapped
    const originalExecute = skill.execute.bind(skill);

    skill.execute = async function(context) {
      const userId = context.userId || 'anonymous';
      const userMessage = context.message || '';
      let response = null;
      let success = true;

      try {
        // Inject past context into the skill so it can use chat history
        if (!context.pastContext) {
          context.pastContext = skill._getContext ? skill._getContext(userId, 5) : '';
        }
        if (!context.similarPast) {
          context.similarPast = skill._findSimilarPast ? skill._findSimilarPast(userId, userMessage, 3) : [];
        }

        response = await originalExecute(context);

        // Determine success based on response type
        if (response?.type === 'error') success = false;
      } catch (err) {
        success = false;
        response = { type: 'error', message: `${skill.displayName}: ${err.message}`, skill: skill.name };
        console.error(`[Skill: ${skill.name}] execute error:`, err.message);
      }

      // Auto-record conversation + learning (non-blocking)
      try {
        if (skill._remember && userMessage) {
          const replyText = typeof response === 'string' ? response : (response?.message || JSON.stringify(response));
          skill._remember(userId, userMessage, replyText, success);
        }
      } catch (e) {
        // Silent — don't break skill if memory fails
      }

      return response;
    };

    skill._wrapped = true;
  }

  // ═══════════════════════════════════════════════════════════
  //  Find: Intent से सही स्किल खोजो
  // ═══════════════════════════════════════════════════════════

  /**
   * Intent से matching स्किल खोजो
   * @param {string} intent - detected intent
   * @returns {BaseSkill|null}
   */
  findByIntent(intent) {
    const skillName = this.intentMap.get(intent);
    if (skillName) {
      return this.skills.get(skillName) || null;
    }

    // Fuzzy match — अगर exact match न मिले
    for (const [name, skill] of this.skills) {
      if (skill.canHandle(intent)) {
        return skill;
      }
    }

    return null;
  }

  /**
   * नाम से स्किल खोजो
   */
  getSkill(name) {
    return this.skills.get(name) || null;
  }

  /**
   * सभी लोड हुई स्किल्स की लिस्ट
   */
  getAllSkills() {
    return Array.from(this.skills.values());
  }

  /**
   * Category के हिसाब से स्किल्स
   */
  getSkillsByCategory(category) {
    return this.getAllSkills().filter(s => s.category === category);
  }

  /**
   * Offline चल सकने वाली स्किल्स
   */
  getOfflineSkills() {
    return this.getAllSkills().filter(s => s.canRunOffline);
  }

  // ═══════════════════════════════════════════════════════════
  //  Stats & Info
  // ═══════════════════════════════════════════════════════════

  /**
   * रजिस्ट्री का स्टेटस
   */
  getStats() {
    const skills = this.getAllSkills();
    return {
      totalSkills: skills.length,
      totalIntents: this.intentMap.size,
      categories: [...new Set(skills.map(s => s.category))],
      offlineCapable: skills.filter(s => s.canRunOffline).length,
      onlineOnly: skills.filter(s => !s.canRunOffline).length,
      mostUsed: skills.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map(s => ({
        name: s.displayName,
        uses: s.usageCount
      }))
    };
  }

  /**
   * सभी स्किल्स की summary (Dashboard / API के लिए)
   */
  getSkillSummary() {
    return this.getAllSkills().map(skill => skill.getMetadata());
  }

  /**
   * Health check — सभी स्किल्स की
   */
  async healthCheckAll() {
    const results = [];
    for (const skill of this.getAllSkills()) {
      try {
        const health = await skill.healthCheck();
        results.push(health);
      } catch (e) {
        results.push({ name: skill.name, healthy: false, error: e.message });
      }
    }
    return results;
  }
}

module.exports = { SkillRegistry };
