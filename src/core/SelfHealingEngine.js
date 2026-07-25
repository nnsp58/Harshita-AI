const { learningEngine } = require('./learningEngine');

class SelfHealingEngine {
  constructor() {
    this.name = 'SelfHealingEngine';
    this.maxRetries = 3;
  }

  /**
   * Execute a skill with structured self-healing.
   * Pipeline: Try -> Retry (x3) -> Fallback Agent -> Error -> Store Learning
   * 
   * @param {Object} skill - The skill instance to execute.
   * @param {Object} context - The execution context.
   * @param {Object} registry - The skill registry to find fallback tools.
   */
  async executeWithHealing(skill, context, registry) {
    let lastError = null;
    let attempt = 0;

    // Phase 1: Retry loop with exponential backoff
    while (attempt < this.maxRetries) {
      try {
        const result = await skill.execute(context);
        
        // Also verify the result if verification engine is available
        // Note: VerificationEngine is usually called by MasterAgent, 
        // but self healing can also validate output type.
        if (result && result.type !== 'error') {
          return result;
        } else {
          lastError = new Error(result?.message || 'Skill returned an error');
        }
      } catch (e) {
        lastError = e;
        console.warn(`[SelfHealingEngine] Attempt ${attempt + 1} failed for ${skill.name}:`, e.message);
      }
      
      attempt++;
      if (attempt < this.maxRetries) {
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt))); // Exponential backoff: 2s, 4s
      }
    }

    console.warn(`[SelfHealingEngine] All retries failed for ${skill.name}. Attempting fallback...`);

    // Phase 2: Switch Tool/Agent (Fallback)
    // Agar skill ne apna khud ka fallbackAgent nahi diya, to LLM (general_chat) ko default
    // fallback maano — taaki user ko static error ki jagah ek asli, sahi jawab mile.
    const fallbackAgentName = skill.fallbackAgent || (skill.name !== 'general_chat' ? 'general_chat' : null);
    if (fallbackAgentName && registry) {
      const fallbackSkill = registry.getSkill(fallbackAgentName);
      if (fallbackSkill) {
        try {
          console.log(`[SelfHealingEngine] Executing fallback skill: ${fallbackSkill.name}`);
          const fallbackResult = await fallbackSkill.execute(context);
          if (fallbackResult && fallbackResult.type !== 'error') {
            return fallbackResult;
          }
        } catch (e) {
          console.warn(`[SelfHealingEngine] Fallback ${fallbackSkill.name} also failed:`, e.message);
        }
      }
    }

    // Phase 3: Record Error & Learn
    const errorMessage = lastError ? lastError.message : 'Unknown execution failure';
    console.error(`[SelfHealingEngine] Critical failure in ${skill.name}: ${errorMessage}`);
    
    // Store failure in learning engine for later analysis
    learningEngine._trackFailure(skill.name, context.message || '', { message: errorMessage });

    return skill._error(`क्षमा करें, ${skill.displayName} में कुछ तकनीकी समस्या आ रही है। (Error: ${errorMessage})`);
  }
}

const selfHealingEngine = new SelfHealingEngine();
module.exports = { SelfHealingEngine, selfHealingEngine };
