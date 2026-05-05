/**
 * CSCLoginAgent - Handles CSC portal and eDistrict login
 * 
 * Supported portals:
 *   - CSC Portal (csc.gov.in)
 *   - eDistrict Portal (state-wise)
 *   - IRCTC (for ticket booking)
 * 
 * Features:
 *   - Encrypted credential storage
 *   - Auto-login with captcha pause
 *   - Session management
 * 
 * Login required: Yes
 * Security: Credentials encrypted, captcha handled manually
 */

const { chromium } = require('playwright');
const crypto = require('crypto');

const LOGIN_PORTALS = {
  csc: {
    name: 'CSC Portal',
    url: 'https://register.csc.gov.in/login',
    fields: { username: '#username', password: '#password' },
    submitButton: '#loginBtn',
    captchaSelector: '#captcha',
    successIndicator: '.dashboard'
  },
  edistrict_up: {
    name: 'eDistrict UP',
    url: 'https://edistrict.up.gov.in/',
    fields: { username: '#txtUserName', password: '#txtPassword' },
    submitButton: '#btnLogin',
    captchaSelector: '#captchaImage',
    successIndicator: '.welcome'
  },
  irctc: {
    name: 'IRCTC',
    url: 'https://www.irctc.co.in/nget/train-search',
    fields: { username: '#userId', password: '#pwd' },
    submitButton: '.search_btn',
    captchaSelector: '.captcha-img',
    successIndicator: '.logged-in'
  }
};

// Simple encryption for credential storage (use proper vault in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'n-dizi-default-key-change-in-prod';

class CSCLoginAgent {
  constructor() {
    this.name = 'CSCLoginAgent';
    this.requiresLogin = true;
    this.browser = null;
    this.page = null;
    this.sessions = new Map(); // portalKey -> { page, loggedIn, lastActivity }
    this.storedCredentials = new Map(); // portalKey -> encrypted credentials
  }

  /**
   * Execute login task
   */
  async execute(taskData) {
    const { action, portal, username, password } = taskData;

    switch (action) {
      case 'login':
        return await this._login(portal, username, password);
      case 'logout':
        return await this._logout(portal);
      case 'check_session':
        return this._checkSession(portal);
      case 'store_credentials':
        return this._storeCredentials(portal, username, password);
      case 'auto_login':
        return await this._autoLogin(portal);
      default:
        return {
          success: false,
          error: 'unknown_action',
          message: `Unknown action: ${action}. Available: login, logout, check_session, store_credentials, auto_login`
        };
    }
  }

  /**
   * Login to a portal
   */
  async _login(portalKey, username, password) {
    const portal = LOGIN_PORTALS[portalKey];
    if (!portal) {
      return {
        success: false,
        agent: this.name,
        error: 'unknown_portal',
        message: `Unknown portal: ${portalKey}. Available: ${Object.keys(LOGIN_PORTALS).join(', ')}`
      };
    }

    if (!username || !password) {
      return {
        success: false,
        agent: this.name,
        error: 'missing_credentials',
        message: 'Username and password are required for login.',
        requiredFields: ['username', 'password']
      };
    }

    console.log(`[CSCLoginAgent] Logging into ${portal.name}...`);

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({ headless: false });
      }

      const page = await this.browser.newPage();
      await page.goto(portal.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      console.log(`[CSCLoginAgent] Portal opened: ${portal.name}`);

      // Try to fill credentials
      try {
        await page.waitForSelector(portal.fields.username, { timeout: 5000 });
        await page.fill(portal.fields.username, username);
        await page.fill(portal.fields.password, password);
        console.log(`[CSCLoginAgent] Credentials filled.`);
      } catch (e) {
        console.log(`[CSCLoginAgent] Auto-fill failed, manual input needed.`);
      }

      // Check for captcha
      let hasCaptcha = false;
      try {
        await page.waitForSelector(portal.captchaSelector, { timeout: 3000 });
        hasCaptcha = true;
        console.log(`[CSCLoginAgent] CAPTCHA detected! Please solve it manually.`);
      } catch (e) {
        // No captcha
      }

      // Store session
      this.sessions.set(portalKey, {
        page,
        loggedIn: false, // Will be true after captcha solved and submit
        lastActivity: new Date(),
        portal: portal.name
      });

      if (hasCaptcha) {
        return {
          success: true,
          agent: this.name,
          action: 'login',
          portal: portal.name,
          message: `Credentials filled on ${portal.name}.\n\nCAPTCHA DETECTED - Please solve the captcha manually and click Login.\n\nAfter login, type 'continue' to proceed.`,
          requiresManualStep: true,
          manualStepReason: 'captcha',
          status: 'waiting_for_captcha'
        };
      }

      // No captcha - try to submit
      try {
        await page.click(portal.submitButton);
        await page.waitForTimeout(3000);

        this.sessions.get(portalKey).loggedIn = true;

        return {
          success: true,
          agent: this.name,
          action: 'login',
          portal: portal.name,
          message: `Successfully logged into ${portal.name}.`,
          status: 'logged_in'
        };
      } catch (e) {
        return {
          success: true,
          agent: this.name,
          action: 'login',
          portal: portal.name,
          message: `Portal opened. Please complete login manually.`,
          requiresManualStep: true,
          manualStepReason: 'submit_failed'
        };
      }

    } catch (error) {
      return {
        success: false,
        agent: this.name,
        error: error.message,
        message: `Login failed: ${error.message}`
      };
    }
  }

  /**
   * Logout from portal
   */
  async _logout(portalKey) {
    const session = this.sessions.get(portalKey);
    if (!session) {
      return {
        success: false,
        agent: this.name,
        message: `No active session for ${portalKey}.`
      };
    }

    try {
      if (session.page && !session.page.isClosed()) {
        await session.page.close();
      }
      this.sessions.delete(portalKey);
      return {
        success: true,
        agent: this.name,
        message: `Logged out from ${session.portal}.`
      };
    } catch (error) {
      this.sessions.delete(portalKey);
      return {
        success: true,
        agent: this.name,
        message: `Session cleared for ${session.portal}.`
      };
    }
  }

  /**
   * Check session status
   */
  _checkSession(portalKey) {
    const session = this.sessions.get(portalKey);
    if (!session) {
      return {
        success: true,
        agent: this.name,
        loggedIn: false,
        message: `No active session for ${portalKey}.`
      };
    }

    return {
      success: true,
      agent: this.name,
      loggedIn: session.loggedIn,
      portal: session.portal,
      lastActivity: session.lastActivity,
      message: `Session ${session.loggedIn ? 'ACTIVE' : 'PENDING'} for ${session.portal}.`
    };
  }

  /**
   * Store encrypted credentials
   */
  _storeCredentials(portalKey, username, password) {
    if (!username || !password) {
      return { success: false, message: 'Username and password required.' };
    }

    const encrypted = this._encrypt(JSON.stringify({ username, password }));
    this.storedCredentials.set(portalKey, encrypted);

    return {
      success: true,
      agent: this.name,
      message: `Credentials stored securely for ${portalKey}. Use 'auto_login' to login automatically.`
    };
  }

  /**
   * Auto-login using stored credentials
   */
  async _autoLogin(portalKey) {
    const encrypted = this.storedCredentials.get(portalKey);
    if (!encrypted) {
      return {
        success: false,
        agent: this.name,
        message: `No stored credentials for ${portalKey}. Use 'store_credentials' first.`
      };
    }

    try {
      const decrypted = JSON.parse(this._decrypt(encrypted));
      return await this._login(portalKey, decrypted.username, decrypted.password);
    } catch (error) {
      return {
        success: false,
        agent: this.name,
        message: `Auto-login failed: ${error.message}`
      };
    }
  }

  /**
   * Get active page for a portal (used by other agents)
   */
  getActivePage(portalKey) {
    const session = this.sessions.get(portalKey);
    if (session && session.loggedIn && session.page && !session.page.isClosed()) {
      session.lastActivity = new Date();
      return session.page;
    }
    return null;
  }

  /**
   * Simple encryption (use proper vault in production)
   */
  _encrypt(text) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  _decrypt(encryptedText) {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async cleanup() {
    for (const [key, session] of this.sessions) {
      try {
        if (session.page && !session.page.isClosed()) {
          await session.page.close();
        }
      } catch (e) { /* ignore */ }
    }
    this.sessions.clear();

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = { CSCLoginAgent };
