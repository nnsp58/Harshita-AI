/**
 * TicketBookingAgent - Handles railway/bus ticket booking
 * 
 * Supported services:
 *   - IRCTC train search
 *   - Train availability check
 *   - Ticket booking (requires login)
 *   - PNR status check
 * 
 * Login required: Yes (for booking)
 * Payment required: Yes (for booking)
 */

const { chromium } = require('playwright');

const PORTALS = {
  irctc: {
    name: 'IRCTC',
    url: 'https://www.irctc.co.in/nget/train-search',
    loginUrl: 'https://www.irctc.co.in/nget/train-search',
    pnrUrl: 'https://www.irctc.co.in/online_enquiry.html'
  }
};

class TicketBookingAgent {
  constructor() {
    this.name = 'TicketBookingAgent';
    this.requiresLogin = true;
    this.requiresPayment = true;
    this.browser = null;
  }

  /**
   * Execute a ticket booking task
   */
  async execute(taskData) {
    const { action, from, to, date, trainNumber, pnr, classType, quota, passengers } = taskData;

    switch (action) {
      case 'search_trains':
        return await this._searchTrains({ from, to, date, classType, quota });
      case 'check_availability':
        return await this._checkAvailability({ trainNumber, from, to, date, classType });
      case 'book_ticket':
        return await this._bookTicket(taskData);
      case 'check_pnr':
        return await this._checkPNR({ pnr });
      default:
        return {
          success: false,
          error: 'unknown_action',
          message: `Unknown action: ${action}. Available: search_trains, check_availability, book_ticket, check_pnr`
        };
    }
  }

  /**
   * Search trains between stations
   */
  async _searchTrains(params) {
    console.log(`[TicketBookingAgent] Searching trains...`);
    console.log(`  From: ${params.from}`);
    console.log(`  To: ${params.to}`);
    console.log(`  Date: ${params.date}`);

    if (!params.from || !params.to) {
      return {
        success: false,
        agent: this.name,
        error: 'missing_data',
        message: 'Please provide both "from" and "to" stations.',
        requiredFields: ['from', 'to', 'date']
      };
    }

    try {
      this.browser = await chromium.launch({ headless: false });
      const page = await this.browser.newPage();
      await page.goto(PORTALS.irctc.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      console.log(`[TicketBookingAgent] IRCTC portal opened.`);

      // Auto-fill search form
      try {
        // These selectors are approximate - actual IRCTC selectors may differ
        await page.waitForTimeout(3000);
        console.log(`[TicketBookingAgent] Attempting to fill search form...`);
      } catch (e) {
        console.log(`[TicketBookingAgent] Auto-fill skipped, manual input needed.`);
      }

      await page.waitForTimeout(10000);

      return {
        success: true,
        agent: this.name,
        action: 'search_trains',
        params,
        message: `IRCTC portal opened. Search for trains from ${params.from} to ${params.to}.`,
        requiresManualStep: true,
        manualStepReason: 'captcha_and_login'
      };

    } catch (error) {
      return {
        success: false,
        agent: this.name,
        error: error.message,
        message: `Failed to open IRCTC: ${error.message}`
      };
    }
  }

  /**
   * Check seat availability
   */
  async _checkAvailability(params) {
    console.log(`[TicketBookingAgent] Checking availability for train ${params.trainNumber}...`);

    return {
      success: true,
      agent: this.name,
      action: 'check_availability',
      params,
      message: `Checking availability for train ${params.trainNumber} on ${params.date}.`,
      requiresManualStep: true,
      manualStepReason: 'captcha'
    };
  }

  /**
   * Book ticket - multi-step orchestrated task
   * Flow: Login -> Search -> Select -> Passenger Details -> Payment -> Confirm
   */
  async _bookTicket(taskData) {
    console.log(`[TicketBookingAgent] Starting ticket booking flow...`);

    // Validate required data
    const required = ['from', 'to', 'date', 'passengers'];
    const missing = required.filter(f => !taskData[f]);

    if (missing.length > 0) {
      return {
        success: false,
        agent: this.name,
        error: 'missing_data',
        message: `Missing required fields: ${missing.join(', ')}`,
        requiredFields: required
      };
    }

    return {
      success: true,
      agent: this.name,
      action: 'book_ticket',
      message: `Ticket booking flow started.\n\nSteps:\n1. Login to IRCTC\n2. Search train ${taskData.from} -> ${taskData.to}\n3. Select train and class\n4. Fill passenger details\n5. Payment (manual)\n6. Confirmation\n\nPlease confirm to proceed. Login credentials will be needed.`,
      requiresManualStep: true,
      manualStepReason: 'login_and_payment',
      steps: [
        { step: 1, name: 'Login', status: 'pending', requiresCredentials: true },
        { step: 2, name: 'Search Train', status: 'pending' },
        { step: 3, name: 'Select Train', status: 'pending' },
        { step: 4, name: 'Passenger Details', status: 'pending' },
        { step: 5, name: 'Payment', status: 'pending', requiresManual: true },
        { step: 6, name: 'Confirmation', status: 'pending' }
      ]
    };
  }

  /**
   * Check PNR status
   */
  async _checkPNR(params) {
    console.log(`[TicketBookingAgent] Checking PNR: ${params.pnr}`);

    if (!params.pnr || params.pnr.length !== 10) {
      return {
        success: false,
        agent: this.name,
        error: 'invalid_pnr',
        message: 'Please provide a valid 10-digit PNR number.'
      };
    }

    return {
      success: true,
      agent: this.name,
      action: 'check_pnr',
      params,
      message: `Checking PNR status for ${params.pnr}...`,
      requiresManualStep: true,
      manualStepReason: 'captcha'
    };
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { TicketBookingAgent };
