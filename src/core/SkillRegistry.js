class SkillRegistry {
  constructor() {
    this.skills = new Map();
  }

  /**
   * Registers a skill in the system
   * @param {Object} skillConfig 
   */
  register(skillConfig) {
    if (!skillConfig || !skillConfig.id) {
      throw new Error("Skill ID is required for registration.");
    }

    this.skills.set(skillConfig.id, {
      id: skillConfig.id,
      name: skillConfig.name || skillConfig.id,
      intentKeywords: skillConfig.intentKeywords || [],
      requiredAgent: skillConfig.requiredAgent || null,
      alternativeAgent: skillConfig.alternativeAgent || null,
      outputType: skillConfig.outputType || 'text',
      priority: skillConfig.priority || 5,
      confidenceThreshold: skillConfig.confidenceThreshold || 90,
      capabilitiesRequired: skillConfig.capabilitiesRequired || [],
      instance: skillConfig.instance // The actual skill instance if needed
    });
  }

  getSkill(skillId) {
    return this.skills.get(skillId);
  }

  getAllSkills() {
    return Array.from(this.skills.values());
  }

  /**
   * Matches a text input to the best skill based on intent keywords
   */
  matchIntentToSkill(userInput) {
    const inputStr = userInput.toLowerCase();
    
    for (const skill of this.skills.values()) {
      for (const keyword of skill.intentKeywords) {
        if (inputStr.includes(keyword.toLowerCase())) {
          return skill;
        }
      }
    }
    return null;
  }
}

module.exports = new SkillRegistry();
