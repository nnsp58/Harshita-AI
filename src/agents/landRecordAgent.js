/**
 * LandRecordAgent - Handles land record / bhulekh related tasks
 * 
 * Supported services:
 *   - Khatauni search by name/khasra number
 *   - Land map / naksha
 *   - Ownership verification
 * 
 * Supported states: UP, Bihar, Rajasthan, MP
 * Login required: No (public data)
 */

const { chromium } = require('playwright');

// State-wise bhulekh portal URLs
const STATE_PORTALS = {
  uttar_pradesh: {
    name: 'Uttar Pradesh',
    url: 'https://upbhulekh.gov.in/',
    khatauniUrl: 'https://upbhulekh.gov.in/public/Dashboard/(S(*))/DashboardMenu',
    searchMethods: ['name', 'khasra', 'khata']
  },
  bihar: {
    name: 'Bihar',
    url: 'http://biharbhumi.bihar.gov.in/Biharbhumi/',
    searchMethods: ['name', 'khasra', 'khata']
  },
  rajasthan: {
    name: 'Rajasthan',
    url: 'https://apnakhata.raj.nic.in/',
    searchMethods: ['name', 'khasra']
  },
  madhya_pradesh: {
    name: 'Madhya Pradesh',
    url: 'https://mpbhulekh.gov.in/',
    searchMethods: ['name', 'khasra', 'khata']
  }
};

class LandRecordAgent {
  constructor() {
    this.name = 'LandRecordAgent';
    this.requiresLogin = false;
    this.browser = null;
  }

  /**
   * Execute a land record task
   */
  async execute(taskData) {
    const { action, state, district, tehsil, village, searchBy, searchValue } = taskData;

    // Validate state
    const normalizedState = this._normalizeState(state);
    if (!normalizedState || !STATE_PORTALS[normalizedState]) {
      return {
        success: false,
        error: 'unsupported_state',
        message: `State "${state}" is not supported yet. Supported: ${Object.values(STATE_PORTALS).map(s => s.name).join(', ')}`,
        supportedStates: Object.keys(STATE_PORTALS)
      };
    }

    const portal = STATE_PORTALS[normalizedState];

    switch (action) {
      case 'search_khatauni':
        return await this._searchKhatauni(portal, { district, tehsil, village, searchBy, searchValue });
      case 'view_map':
        return await this._viewLandMap(portal, { district, tehsil, village, searchValue });
      case 'verify_ownership':
        return await this._verifyOwnership(portal, { district, tehsil, village, searchValue });
      default:
        return {
          success: false,
          error: 'unknown_action',
          message: `Unknown action: ${action}. Available: search_khatauni, view_map, verify_ownership`
        };
    }
  }

/**
   * Search khatauni records
   */
  async _searchKhatauni(portal, params) {
    console.log(`[LandRecordAgent] Searching khatauni on ${portal.name}...`);
    console.log(`  District: ${params.district || 'N/A'}`);

    // Skip browser - just return manual link
    return {
      success: true,
      agent: this.name,
      action: 'search_khatauni',
      portal: portal.name,
      params,
      message: `🌐 ${portal.name} Land Record\n📍 District: ${params.district}\n\n🔗 Open: https://upbhulekh.gov.in/\n\n📋 Steps:\n1. Select District → ${params.district}\n2. Select Tehsil → Village\n3. Enter Name/Khata/Khasra\n4. View Land Record`,
      requiresManualStep: true,
      manualStepReason: 'manual_search'
    };
  }

  /**
   * View land map / naksha
   */
  async _viewLandMap(portal, params) {
    console.log(`[LandRecordAgent] Opening land map on ${portal.name}...`);
    return {
      success: true,
      agent: this.name,
      action: 'view_map',
      portal: portal.name,
      params,
      message: `🗺️ Land Map: ${portal.name}\n🔗 Open: https://upbhulekh.gov.in/`,
      requiresManualStep: true,
      manualStepReason: 'manual_search'
    };
  }

  /**
   * Verify land ownership
   */
  async _verifyOwnership(portal, params) {
    console.log(`[LandRecordAgent] Verifying ownership on ${portal.name}...`);
    return {
      success: true,
      agent: this.name,
      action: 'verify_ownership',
      portal: portal.name,
      params,
      message: `✅ Ownership Verification: ${portal.name}\n🔗 Open: https://upbhulekh.gov.in/`,
      requiresManualStep: true,
      manualStepReason: 'manual_search'
    };
  }

  /**
   * Get supported states info
   */
  async _autoFillLocation(page, params) {
    // UP Bhulekh typically has dropdowns for District, Tehsil, Village
    // This is a simplified version - actual selectors would need verification
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    console.log(`[LandRecordAgent] Attempting auto-location fill...`);
    // In production, add actual selector logic here
  }

  /**
   * View land map / naksha
   */
  async _viewLandMap(portal, params) {
    console.log(`[LandRecordAgent] Opening land map on ${portal.name}...`);

    return {
      success: true,
      agent: this.name,
      action: 'view_map',
      portal: portal.name,
      params,
      message: `Land map service for ${portal.name}. Opening portal...`,
      requiresManualStep: true,
      manualStepReason: 'map_selection'
    };
  }

  /**
   * Verify land ownership
   */
  async _verifyOwnership(portal, params) {
    console.log(`[LandRecordAgent] Verifying ownership on ${portal.name}...`);

    return {
      success: true,
      agent: this.name,
      action: 'verify_ownership',
      portal: portal.name,
      params,
      message: `Ownership verification initiated on ${portal.name}.`,
      requiresManualStep: true,
      manualStepReason: 'document_verification'
    };
  }

  /**
   * Normalize state name to key
   */
  _normalizeState(state) {
    if (!state) return null;
    const s = state.toLowerCase().replace(/\s+/g, '_');

    const aliases = {
      'up': 'uttar_pradesh',
      'uttar_pradesh': 'uttar_pradesh',
      'uttarpradesh': 'uttar_pradesh',
      'bihar': 'bihar',
      'rajasthan': 'rajasthan',
      'mp': 'madhya_pradesh',
      'madhya_pradesh': 'madhya_pradesh',
      'madhyapradesh': 'madhya_pradesh'
    };

    return aliases[s] || null;
  }

  /**
   * Get supported states info
   */
  getSupportedStates() {
    return Object.entries(STATE_PORTALS).map(([key, val]) => ({
      key,
      name: val.name,
      searchMethods: val.searchMethods
    }));
  }

  /**
   * Cleanup browser
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { LandRecordAgent };
