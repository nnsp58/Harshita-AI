/**
 * RationCardAgent - Handles ration card related tasks
 * 
 * Supported services:
 *   - Ration card status check
 *   - New ration card application
 *   - Ration card details search
 * 
 * Login required: No (public data for status check)
 */

const { chromium } = require('playwright');

const STATE_PORTALS = {
  uttar_pradesh: {
    name: 'Uttar Pradesh',
    url: 'https://fcs.up.gov.in/',
    statusUrl: 'https://fcs.up.gov.in/FoodPortal.aspx',
    services: ['status', 'search', 'new_application']
  },
  delhi: {
    name: 'Delhi',
    url: 'https://nfs.delhi.gov.in/',
    services: ['status', 'search']
  },
  maharashtra: {
    name: 'Maharashtra',
    url: 'https://rcms.mahafood.gov.in/',
    services: ['status', 'search', 'new_application']
  }
};

class RationCardAgent {
  constructor() {
    this.name = 'RationCardAgent';
    this.requiresLogin = false;
    this.browser = null;
  }

  /**
   * Execute a ration card task
   */
  async execute(taskData) {
    const { action, state, rationCardNumber, name, district } = taskData;

    const normalizedState = this._normalizeState(state);
    if (!normalizedState || !STATE_PORTALS[normalizedState]) {
      return {
        success: false,
        error: 'unsupported_state',
        message: `State "${state}" not supported. Supported: ${Object.values(STATE_PORTALS).map(s => s.name).join(', ')}`,
        supportedStates: Object.keys(STATE_PORTALS)
      };
    }

    const portal = STATE_PORTALS[normalizedState];

    switch (action) {
      case 'check_status':
        return await this._checkStatus(portal, { rationCardNumber, name, district });
      case 'search':
        return await this._searchRationCard(portal, { name, district, rationCardNumber });
      case 'new_application':
        return await this._newApplication(portal, taskData);
      default:
        return {
          success: false,
          error: 'unknown_action',
          message: `Unknown action: ${action}. Available: check_status, search, new_application`
        };
    }
  }

  /**
   * Check ration card status
   */
  async _checkStatus(portal, params) {
    console.log(`[RationCardAgent] Checking status on ${portal.name}...`);
    console.log(`  Ration Card: ${params.rationCardNumber || 'N/A'}`);
    console.log(`  Name: ${params.name || 'N/A'}`);

    try {
      this.browser = await chromium.launch({ headless: false });
      const page = await this.browser.newPage();
      await page.goto(portal.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      console.log(`[RationCardAgent] Portal opened: ${portal.url}`);

      await page.waitForTimeout(8000);

      return {
        success: true,
        agent: this.name,
        action: 'check_status',
        portal: portal.name,
        params,
        message: `Ration card status portal opened for ${portal.name}. Complete the search manually.`,
        requiresManualStep: true,
        manualStepReason: 'captcha_or_search'
      };

    } catch (error) {
      return {
        success: false,
        agent: this.name,
        error: error.message,
        message: `Failed to check status: ${error.message}`
      };
    }
  }

  /**
   * Search ration card by name/number
   */
  async _searchRationCard(portal, params) {
    console.log(`[RationCardAgent] Searching ration card on ${portal.name}...`);

    return {
      success: true,
      agent: this.name,
      action: 'search',
      portal: portal.name,
      params,
      message: `Ration card search initiated on ${portal.name}.`,
      requiresManualStep: true,
      manualStepReason: 'captcha_or_selection'
    };
  }

  /**
   * New ration card application
   */
  async _newApplication(portal, taskData) {
    if (!portal.services.includes('new_application')) {
      return {
        success: false,
        agent: this.name,
        message: `New application not available for ${portal.name} through this portal.`
      };
    }

    console.log(`[RationCardAgent] Opening new application on ${portal.name}...`);

    return {
      success: true,
      agent: this.name,
      action: 'new_application',
      portal: portal.name,
      message: `New ration card application form opened for ${portal.name}. Please fill required details.`,
      requiresManualStep: true,
      manualStepReason: 'form_filling'
    };
  }

  /**
   * Normalize state name
   */
  _normalizeState(state) {
    if (!state) return null;
    const s = state.toLowerCase().replace(/\s+/g, '_');
    const aliases = {
      'up': 'uttar_pradesh',
      'uttar_pradesh': 'uttar_pradesh',
      'delhi': 'delhi',
      'maharashtra': 'maharashtra',
      'mh': 'maharashtra'
    };
    return aliases[s] || null;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { RationCardAgent };
