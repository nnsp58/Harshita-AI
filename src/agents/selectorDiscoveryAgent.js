/**
 * SelectorDiscoveryAgent - Autonomous UI element identification for unknown portals
 */
const { AIProviderManager } = require('../utils/aiProviderManager');

class SelectorDiscoveryAgent {
  constructor() {
    this.name = 'SelectorDiscoveryAgent';
    this.aiManager = new AIProviderManager();
  }

  /**
   * Scans a page's metadata and elements to discover mapping for required fields
   * @param {Array} elements - List of interactive elements from BrowserAgent
   * @param {Array} requiredFields - Fields we need to find (e.g., ['firstName', 'dob'])
   */
  async discoverSelectors(elements, requiredFields) {
    console.log(`[SelectorDiscoveryAgent] Discovering selectors for: ${requiredFields.join(', ')}`);
    
    // 1. Initial Heuristic Mapping (Fast)
    let mappings = this._heuristicDiscovery(elements, requiredFields);
    
    // 2. Identify missing fields
    const foundFields = Object.keys(mappings);
    const missingFields = requiredFields.filter(f => !foundFields.includes(f));
    
    // 3. Use AI for complex/ambiguous fields
    if (missingFields.length > 0) {
      console.log(`[SelectorDiscoveryAgent] Using AI to find missing fields: ${missingFields.join(', ')}`);
      const aiMappings = await this._aiDiscovery(elements, missingFields);
      mappings = { ...mappings, ...aiMappings };
    }

    return mappings;
  }

  /**
   * Fast discovery using string matching on labels, placeholders, and IDs
   */
  _heuristicDiscovery(elements, requiredFields) {
    const mappings = {};
    const fieldKeywords = {
      firstName: ['first name', 'given name', 'नाम', 'first_name', 'fname'],
      lastName: ['last name', 'surname', 'उपनाम', 'last_name', 'lname'],
      fullName: ['full name', 'name', 'पूरा नाम', 'candidate name'],
      dob: ['date of birth', 'dob', 'जन्म तिथि', 'birth_date', 'd_o_b'],
      gender: ['gender', 'sex', 'लिंग'],
      aadhaar: ['aadhaar', 'aadhar', 'uid', 'आधार'],
      mobile: ['mobile', 'phone', 'contact', 'मोबाइल', 'दूरभाष'],
      email: ['email', 'e-mail', 'ईमेल'],
      fatherName: ['father', 'पिता', 'parent name']
    };

    requiredFields.forEach(field => {
      const keywords = fieldKeywords[field] || [field.toLowerCase()];
      
      // Look for the best match among elements
      const match = elements.find(el => {
        const textToSearch = `
          ${el.label || ''} 
          ${el.placeholder || ''} 
          ${el.id || ''} 
          ${el.name || ''} 
          ${el.ariaLabel || ''}
        `.toLowerCase();

        return keywords.some(key => textToSearch.includes(key.toLowerCase()));
      });

      if (match) {
        mappings[field] = match.selector;
      }
    });

    return mappings;
  }

  /**
   * Deep discovery using LLM to analyze element context
   */
  async _aiDiscovery(elements, missingFields) {
    // We send a simplified version of elements to the AI to save tokens
    const elementSnapshots = elements.map(el => ({
      id: el.id,
      name: el.name,
      label: el.label,
      placeholder: el.placeholder,
      type: el.type,
      selector: el.selector
    })).slice(0, 50); // Limit to first 50 elements for context window

    const prompt = `
      I am trying to automate a form. I need to find the CSS selectors for the following fields: ${missingFields.join(', ')}.
      Below is a list of interactive elements found on the page:
      ${JSON.stringify(elementSnapshots, null, 2)}

      Task: Match each missing field to the most likely selector. 
      Return ONLY a JSON object where keys are the field names and values are the selectors.
      If a field cannot be found, do not include it.
    `;

    try {
      const response = await this.aiManager.getCompletion(prompt, 'selector_discovery');
      // Extract JSON from response
      const jsonStr = response.match(/\{[\s\S]*\}/)?.[0] || '{}';
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('[SelectorDiscoveryAgent] AI discovery failed:', e.message);
      return {};
    }
  }
}

module.exports = { SelectorDiscoveryAgent };
