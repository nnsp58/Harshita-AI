const BaseAgent = require('../agents/BaseAgent');
const agentRegistry = require('./AgentRegistry');

/**
 * DynamicWrapperFactory dynamically creates lightweight agent wrappers 
 * ONLY for skills that absolutely cannot be handled by an existing agent.
 */
class DynamicWrapperFactory {
  
  /**
   * Creates and registers a dynamic wrapper for a skill
   * @param {Object} skill 
   * @returns {BaseAgent} 
   */
  createWrapperForSkill(skill) {
    if (!skill || !skill.instance) {
      throw new Error("Cannot create wrapper: Invalid skill instance provided.");
    }

    const wrapperId = `${skill.id}WrapperAgent`;
    
    // Phase 6: Duplicate Detection
    // Check if a wrapper or agent with this ID already exists
    if (agentRegistry.getAgent(wrapperId)) {
      return agentRegistry.getAgent(wrapperId).instance;
    }

    // Phase 10: Wrapper Rules - No business logic, only routing/validation
    class DynamicWrapper extends BaseAgent {
      constructor() {
        super(wrapperId);
        this.skillInstance = skill.instance;
      }

      async execute(input, context) {
        // Transformation & Validation layer
        if (!input) {
          return this.createResponse({ status: 'error', confidenceScore: 0, warnings: ['Input is required.'] });
        }

        try {
          // Direct routing to the underlying skill logic
          const output = await this.skillInstance.execute({ message: input, ...context });
          
          return this.createResponse({
            status: 'success',
            confidenceScore: skill.confidenceThreshold || 95,
            output: output,
            requiredNextAgent: null // Terminate by default unless skill dictates otherwise
          });
        } catch (error) {
          return this.createResponse({ status: 'error', confidenceScore: 0, warnings: [error.message] });
        }
      }

      Capabilities() {
        return skill.capabilitiesRequired || [];
      }
    }

    const instance = new DynamicWrapper();

    // Register this new dynamic wrapper so it can be reused later
    agentRegistry.register({
      id: wrapperId,
      name: `${skill.name} Agent`,
      description: `Auto-generated lightweight wrapper for ${skill.name}`,
      capabilities: skill.capabilitiesRequired || [],
      supportedSkills: [skill.id],
      instance: instance
    });

    return instance;
  }
}

module.exports = new DynamicWrapperFactory();
