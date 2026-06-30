const { SkillRegistry } = require('../skills/SkillRegistry');

class VerificationEngine {
  constructor() {
    this.name = 'VerificationEngine';
  }

  /**
   * Verify the result of a skill execution.
   *
   * @param {Object} skill - The executed skill instance.
   * @param {Object} input - The input parameters provided to the skill.
   * @param {Object} result - The output result from the skill.
   * @returns {Object} - { verified: boolean, confidence: number, issues: [] }
   */
  async verify(skill, input, result) {
    if (!skill || !result) {
      return { verified: false, confidence: 0, issues: ['Missing skill or result for verification'] };
    }

    try {
      // 1. Generic output schema validation if present
      if (skill.outputSchema) {
        const schemaCheck = skill.outputSchema.safeParse(result);
        if (!schemaCheck.success) {
          return {
            verified: false,
            confidence: 0,
            issues: schemaCheck.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
          };
        }
      }

      // 2. Skill-specific custom verify logic
      if (typeof skill.verify === 'function') {
        const customVerification = await skill.verify(input, result);
        if (customVerification && !customVerification.verified) {
          return customVerification;
        }
      }

      // 3. Generic baseline verifications based on category
      const categoryVerification = await this._verifyByCategory(skill.category, input, result);
      
      return categoryVerification;
    } catch (e) {
      console.error(`[VerificationEngine] Error verifying ${skill.name}:`, e.message);
      return { verified: false, confidence: 0, issues: [`Verification error: ${e.message}`] };
    }
  }

  async _verifyByCategory(category, input, result) {
    const issues = [];
    let confidence = 1.0;
    
    switch (category) {
      case 'math':
      case 'geometry':
      case 'conversion':
        // Basic check: Result must not be empty or "error" if type is ai
        if (!result.message || result.message.trim() === '') {
          issues.push('Result message is empty');
        }
        if (result.type === 'error') {
          issues.push('Skill returned an error type result');
        }
        break;
        
      case 'legal':
      case 'document':
        if (result.message && result.message.includes('______')) {
          issues.push('Unfilled placeholders detected in legal document');
          confidence = 0.5;
        }
        break;
        
      default:
        // Generic fallback check
        if (!result.message) {
          issues.push('Missing result message');
          confidence = 0.8;
        }
        break;
    }

    return {
      verified: issues.length === 0,
      confidence: issues.length === 0 ? confidence : 0,
      issues
    };
  }
}

const verificationEngine = new VerificationEngine();

module.exports = { VerificationEngine, verificationEngine };
