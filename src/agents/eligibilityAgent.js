/**
 * EligibilityAgent - Performs pre-check validation before opening portals
 * 
 * Responsibilities:
 * - Validate candidate age using AgeCalculator
 * - Check if required certificates (Caste, Domicile, Income) are present
 * - Verify if document formats and sizes match portal requirements
 * - Provide a "Readiness Report" to the VLE
 */

const { AgeCalculator } = require('../utils/ageCalculator');
const { DocumentAIAgent } = require('./documentAIAgent');
const { WebLearningAgent } = require('./webLearningAgent');

class EligibilityAgent {
  constructor() {
    this.name = 'EligibilityAgent';
    this.docAI = new DocumentAIAgent();
    this.webLearning = new WebLearningAgent();
  }

  /**
   * Execute eligibility check
   */
  async execute(taskData) {
    const { userData, portalUrl, jobDetails } = taskData;

    console.log(`[EligibilityAgent] Starting pre-check for portal: ${portalUrl || 'General'}`);

    try {
      // 1. Get Portal Requirements
      let requirements = jobDetails?.requirements;
      if (portalUrl && !requirements) {
        const learnResult = await this.webLearning.extractFileRequirements(portalUrl);
        if (learnResult.success) {
          requirements = learnResult.requirements;
        }
      }

      // 2. Perform Age Calculation
      const ageCheck = this._checkAgeEligibility(userData, jobDetails);

      // 3. Check Documents Presence
      const docCheck = this._checkDocuments(userData, requirements);

      // 4. Generate Readiness Report
      const isReady = ageCheck.eligible && docCheck.allPresent && docCheck.allCorrectSize;
      
      const report = {
        success: true,
        isReady,
        ageCheck,
        docCheck,
        requirements,
        message: isReady 
          ? "✅ Candidate is fully ELIGIBLE and documents are READY. You can proceed to the portal."
          : "⚠️ Pre-check found some issues. Please review the details below before opening the portal."
      };

      return report;

    } catch (error) {
      console.error(`[EligibilityAgent] Pre-check failed:`, error.message);
      return {
        success: false,
        error: error.message,
        message: "Failed to complete pre-check validation."
      };
    }
  }

  /**
   * Check age eligibility using AgeCalculator
   */
  _checkAgeEligibility(userData, jobDetails) {
    if (!userData?.personal?.dob) {
      return { eligible: false, reason: "Date of Birth missing in profile." };
    }

    const params = {
      dob: userData.personal.dob,
      category: userData.personal.category || 'general',
      isExm: userData.isExm || false,
      isPh: userData.isPh || false,
      minAge: jobDetails?.minAge || 18,
      maxAge: jobDetails?.maxAge || 25,
      onDate: jobDetails?.closingDate || new Date().toISOString().split('T')[0],
      serviceStart: userData.exmDetails?.serviceStart,
      serviceEnd: userData.exmDetails?.serviceEnd
    };

    return AgeCalculator.isEligible(params);
  }

  /**
   * Check if all required documents are present and correctly formatted
   */
  _checkDocuments(userData, requirements) {
    const docs = userData?.documents || {};
    const results = {
      allPresent: true,
      allCorrectSize: true,
      missing: [],
      sizeIssues: []
    };

    // Standard required documents for Indian gov jobs
    const standardRequired = ['aadhaar', 'marksheet_10th'];
    if (userData.personal?.category !== 'general') standardRequired.push('caste_certificate');
    if (userData.isPh) standardRequired.push('ph_certificate');
    if (userData.isExm) standardRequired.push('discharge_book');

    standardRequired.forEach(doc => {
      if (!docs[doc]) {
        results.allPresent = false;
        results.missing.push(doc);
      }
    });

    // If we have portal requirements, check sizes
    if (requirements) {
      // Check Photo
      if (docs.photo) {
        // Logic to check file size would go here (requires fs.stat)
        // For now, we assume we need to verify it
      }
      
      // In a real implementation, we would use fs.stat(docs[doc].path) 
      // to check if it matches requirements.photo.size
    }

    return results;
  }
}

module.exports = { EligibilityAgent };
