const { chromium } = require('playwright');
const { aiProviderManager } = require('../utils/aiProviderManager');
const { SelectorMemory } = require('../core/selectorMemory');
const { ReasoningEngine } = require('../core/reasoningEngine');

class BaseBot {
  constructor(config, browserAgent) {
    this.config = config;
    this.browserAgent = browserAgent;
    this.page = null;
    this.browser = null;
    this.context = null;
    this.aiDiscoveryCache = new Map();
    // PRD 1: Permanent Skill Memory
    this.selectorMemory = new SelectorMemory();
    // PRD 2: Reasoning Engine
    this.reasoningEngine = new ReasoningEngine({ agentName: 'BaseBot', maxRetries: 3 });
    // Track which selectors actually worked during this run
    this._verifiedSelectors = {};
    this._failedFields = [];
  }

  async discoverSelectorsWithAI() {
    console.log(`[${this.config.id}] 🧠 AI is analyzing the page structure...`);
    
    // Extract interactive elements and their context (labels, placeholders, ids)
    const elements = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea, mat-select, [role="combobox"]'));
      return inputs.map(el => {
        // Get associated label
        let labelText = '';
        if (el.id) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label) labelText = label.innerText;
        }
        if (!labelText) {
          const parentLabel = el.closest('label');
          if (parentLabel) labelText = parentLabel.innerText;
        }
        if (!labelText) {
          // Try finding text before the element
          labelText = el.parentElement?.innerText?.split('\n')[0] || '';
        }

        return {
          id: el.id,
          name: el.name,
          placeholder: el.placeholder,
          tagName: el.tagName.toLowerCase(),
          type: el.type,
          labelText: labelText.trim().substring(0, 50),
          className: el.className
        };
      });
    });

    const prompt = `Page Content (Interactive Elements):
${JSON.stringify(elements, null, 2)}

Target Fields to Fill:
fullName, fatherName, motherName, dob, gender, category, email, phone, aadhaar, pan, address, state, district, pincode

For each target field, indentify the best matching element from the list. 
Return ONLY a JSON object mapping field_name to a CSS selector (prefer id if exists, then name, then specific attributes).
Example: {"fullName": "#candidateName", "gender": "select[name='gender']"}
If not found, skip the field.`;

    try {
      const client = aiProviderManager.getClient();
      const model = aiProviderManager.getModel();
      
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 1000
      });

      let content = response.choices[0].message.content.trim();
      content = content.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');
      let discovered = {};
      try {
        discovered = JSON.parse(content);
        console.log(`[${this.config.id}] ✅ AI discovered ${Object.keys(discovered).length} selectors dynamically`);
      } catch (e) {
        console.error(`[${this.config.id}] ❌ Failed to parse AI response as JSON:`, e.message);
      }

      this.aiDiscoveryCache.set(this.page.url(), discovered);
      return discovered;
    } catch (error) {
      console.error(`[${this.config.id}] ❌ AI Selector Discovery failed:`, error.message);
      return {};
    }
  }

  get randomDelay() {
    const { minDelay = 1000, maxDelay = 2000 } = this.config.delayConfig || {};
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
  }

  async randomWait() {
    const delay = this.randomDelay;
    await this.sleep(delay);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async initBrowser(userAgent = null) {
    const launchOptions = { headless: false };
    
    if (this.config.userAgentRotation && userAgent) {
      launchOptions.userAgent = userAgent;
    }

    this.browser = await chromium.launch(launchOptions);
    this.context = await this.browser.newContext(launchOptions);
    this.page = await this.context.newPage();
    
    return this.page;
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async navigate(url = null) {
    const targetUrl = url || this.config.formUrl;
    console.log(`[${this.config.id}] Navigating to: ${targetUrl}`);
    await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await this.randomWait();
  }

  async fillForm(candidateProfile) {
    console.log(`[${this.config.id}] Filling form for: ${candidateProfile.personal?.fullName || 'Unknown'}`);
    
    // PRD 1: Check permanent memory FIRST (skip AI if we already know selectors)
    const memorizedSelectors = await this.selectorMemory.getVerifiedSelectorsForSite(this.config.id);
    const memorizedCount = Object.keys(memorizedSelectors).length;
    if (memorizedCount > 0) {
      console.log(`[${this.config.id}] 🧠 MEMORY: Found ${memorizedCount} memorized selectors — skipping AI discovery`);
    }
    
    // Only call AI if memory doesn't have enough selectors
    let apiSelectors = {};
    if (memorizedCount < 5) {
      apiSelectors = await this.discoverSelectorsWithAI();
    }
    
    const configSelectors = this.config.fieldSelectors || {};
    
    // Merge priority: Config > Memory > AI Discovery
    const selectors = { ...apiSelectors, ...memorizedSelectors, ...configSelectors };
    
    // Reset tracking for this run
    this._verifiedSelectors = {};
    this._failedFields = [];
    this.reasoningEngine.reset();
    
    let filledCount = 0;
    const totalFields = Object.keys(selectors).length;
    
    for (const [fieldName, selector] of Object.entries(selectors)) {
      if (!selector) continue;
      
      const value = this.getFieldValue(fieldName, candidateProfile);
      if (!value) continue;

      // PRD 2: Wrap each field fill in the Reasoning Loop
      const context = { page: this.page, bot: this, siteId: this.config.id, fieldName };
      const result = await this.reasoningEngine.executeWithReasoning(
        context,
        async () => {
          // Special case for XPaths in Playwright (prefixed with xpath=)
          const effectiveSelector = selector.startsWith('//') ? `xpath=${selector}` : selector;
          const elements = await this.page.$$(effectiveSelector);
          
          if (!elements || elements.length === 0) {
            throw new Error(`Element not found for field "${fieldName}" with selector: ${selector}`);
          }
          
          let filled = false;
          for (const el of elements) {
            const isVisible = await el.isVisible().catch(() => false);
            if (!isVisible) continue;

            const tagName = await el.evaluate(e => e.tagName.toLowerCase());
            const inputType = await el.getAttribute('type');

            if (tagName === 'select') {
              await this.fillSelect(el, value);
            } else if (inputType === 'radio') {
              const elValue = await el.getAttribute('value');
              if (this.matchesOption(elValue, value)) {
                await el.check();
                filled = true;
                break;
              }
              continue;
            } else if (inputType === 'checkbox') {
              await el.check();
            } else {
              await el.fill(value);
            }
            
            filled = true;
            break;
          }
          
          if (!filled) {
            throw new Error(`All elements for "${fieldName}" were hidden or radio mismatch`);
          }
          
          return { fieldName, value, selector };
        },
        `Fill field: ${fieldName}`
      );

      if (result.success) {
        console.log(`[${this.config.id}] ✅ Filled: ${fieldName} = ${value} (using ${selector})`);
        this._verifiedSelectors[fieldName] = selector;
        filledCount++;
      } else {
        console.warn(`[${this.config.id}] ❌ Failed: ${fieldName} after ${result.retries} retries`);
        this._failedFields.push(fieldName);
        // PRD 1: Mark this selector as failed in memory
        await this.selectorMemory.markFailed(this.config.id, fieldName);
      }

      await this.randomWait();
    }

    // PRD 1: Commit all verified selectors to permanent memory
    const confidenceScore = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;
    if (filledCount > 0) {
      await this.selectorMemory.commitVerifiedSelectors(
        this.config.id,
        this.page.url(),
        this._verifiedSelectors,
        confidenceScore
      );
      console.log(`[${this.config.id}] 🧠 Memory updated: ${filledCount}/${totalFields} fields saved (${confidenceScore}% confidence)`);
    }

    return true;
  }

  getFieldValue(fieldName, profile) {
    const fieldMappings = {
      fullName: () => profile.personal?.fullName,
      firstName: () => profile.personal?.firstName,
      middleName: () => profile.personal?.middleName,
      lastName: () => profile.personal?.lastName,
      fatherName: () => profile.personal?.fatherName,
      motherName: () => profile.personal?.motherName,
      husbandName: () => profile.personal?.husbandName,
      dob: () => profile.personal?.dob,
      gender: () => this.normalizeGender(profile.personal?.gender),
      category: () => this.normalizeCategory(profile.personal?.category),
      maritalStatus: () => this.normalizeMarital(profile.personal?.maritalStatus),
      email: () => profile.contact?.email,
      phone: () => profile.contact?.phone,
      aadhaar: () => profile.documents?.aadhaar,
      pan: () => profile.documents?.pan,
      voterId: () => profile.documents?.voterId,
      addressLine1: () => profile.address?.line1,
      addressLine2: () => profile.address?.line2,
      city: () => profile.address?.city,
      district: () => profile.address?.district,
      state: () => profile.address?.state,
      pincode: () => profile.address?.pincode
    };

    const mapper = fieldMappings[fieldName];
    return mapper ? mapper() : null;
  }

  normalizeGender(gender) {
    if (!gender) return '';
    const g = String(gender).toLowerCase();
    if (g.includes('male')) return 'male';
    if (g.includes('female')) return 'female';
    if (g.includes('trans')) return 'transgender';
    return g;
  }

  normalizeCategory(category) {
    if (!category) return '';
    const c = String(category).toLowerCase();
    if (c.includes('gen')) return 'general';
    if (c.includes('obc')) return 'obc';
    if (c.includes('sc')) return 'sc';
    if (c.includes('st')) return 'st';
    return c;
  }

  normalizeMarital(marital) {
    if (!marital) return '';
    const m = String(marital).toLowerCase();
    if (m.includes('single')) return 'single';
    if (m.includes('married')) return 'married';
    if (m.includes('divorce')) return 'divorced';
    if (m.includes('widow')) return 'widowed';
    return m;
  }

  async fillSelect(element, value) {
    try {
      await element.selectOption({ label: new RegExp(value, 'i') });
    } catch {
      try {
        await element.selectOption(value);
      } catch (e) {
        console.warn(`Could not select option: ${value}`);
      }
    }
  }

  matchesOption(optionValue, expectedValue) {
    if (!optionValue || !expectedValue) return false;
    const ov = String(optionValue).toLowerCase();
    const ev = String(expectedValue).toLowerCase();
    return ov.includes(ev) || ev.includes(ov);
  }

  // Detect if CAPTCHA is present on the page
  async detectCaptcha() {
    if (!this.config.hasCaptcha) return false;

    const captchaSelectors = [
      "img[src*='captcha']",
      "img[src*='Captcha']",
      "div[id*='captcha']",
      "div[class*='captcha']",
      "input[name='captcha']",
      "input[name='captchaInput']",
      "input[id='captcha']",
      "div.g-recaptcha",
      "div[class*='recaptcha']"
    ];

    for (const selector of captchaSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        console.log(`[${this.config.id}] CAPTCHA detected: ${selector}`);
        return true;
      }
    }

    // Check page content for CAPTCHA-related text
    const content = await this.page.content();
    if (/captcha|कैप्चा| verification/i.test(content)) {
      console.log(`[${this.config.id}] CAPTCHA text detected`);
      return true;
    }

    return false;
  }

  async handleCaptcha(manualSolution = null) {
    if (!this.config.hasCaptcha) {
      console.log(`[${this.config.id}] No captcha required`);
      return true;
    }

    // If solution provided, fill it
    if (manualSolution) {
      try {
        const captchaSelector = "input[name='captcha'], input[name='captchaInput'], input[id='captcha']";
        const captchaField = await this.page.$(captchaSelector);
        if (captchaField) {
          await captchaField.fill(manualSolution);
          console.log(`[${this.config.id}] CAPTCHA filled with provided solution`);
          return true;
        }
      } catch (error) {
        console.warn(`Could not fill CAPTCHA: ${error.message}`);
      }
    }

    // Otherwise, just wait for manual intervention
    console.log(`[${this.config.id}] Waiting for manual CAPTCHA solution...`);
    await this.sleep(1000);
    return true;
  }

  // Detect if OTP is required
  async detectOtp() {
    if (!this.config.hasOtp) return false;

    const otpSelectors = [
      "input[name='otp']",
      "input[name='Otp']",
      "input[id='otp']",
      "input[name='verificationCode']",
      "input[type='tel'][maxlength='6']"
    ];

    for (const selector of otpSelectors) {
      const element = await this.page.$(selector);
      if (element) {
        console.log(`[${this.config.id}] OTP field detected: ${selector}`);
        return true;
      }
    }

    // Check for OTP-related text
    const content = await this.page.content();
    if (/otp|verify|वेरिफाई|one time password/i.test(content)) {
      console.log(`[${this.config.id}] OTP text detected`);
      return true;
    }

    return false;
  }

  async handleOtp(otp) {
    if (!this.config.hasOtp) {
      console.log(`[${this.config.id}] No OTP required`);
      return true;
    }

    console.log(`[${this.config.id}] Handling OTP: ${otp ? 'provided' : 'waiting for manual input'}`);
    
    const otpSelector = "input[name='otp'], input[name='Otp'], input[id='otp'], input[name='verificationCode'], input[type='tel'][maxlength='6']";
    
    try {
      if (otp) {
        // Auto-fill with provided OTP
        const otpField = await this.page.$(otpSelector);
        if (otpField) {
          await otpField.fill(otp);
          await this.randomWait();
          
          const verifyButton = await this.page.$("button:has-text('Verify'), button:has-text('Submit OTP'), button:has-text('Confirm')");
          if (verifyButton) {
            await verifyButton.click();
            await this.randomWait();
          }
          console.log(`[${this.config.id}] OTP filled and submitted`);
        }
      } else {
        // Manual OTP entry - just wait
        console.log(`[${this.config.id}] Waiting for manual OTP entry...`);
      }
    } catch (error) {
      console.warn(`[${this.config.id}] OTP handling error: ${error.message}`);
    }

    return true;
  }

  async submit() {
    const submitSelector = this.config.submitSelector;
    console.log(`[${this.config.id}] Submitting form with selector: ${submitSelector}`);

    try {
      const submitButton = await this.page.$(submitSelector);
      if (submitButton) {
        await submitButton.click();
        console.log(`[${this.config.id}] Form submitted`);
      } else {
        console.warn(`[${this.config.id}] Submit button not found`);
      }
    } catch (error) {
      console.error(`[${this.config.id}] Submit error: ${error.message}`);
    }

    await this.randomWait();
    return true;
  }

  async verifySubmission() {
    const indicator = this.config.successIndicator;
    
    if (!indicator) {
      console.log(`[${this.config.id}] No success indicator configured`);
      return { success: true, message: 'Submission verified' };
    }

    console.log(`[${this.config.id}] Verifying submission...`);

    try {
      if (indicator.selector) {
        const successElement = await this.page.$(indicator.selector);
        if (successElement) {
          const text = await successElement.textContent();
          console.log(`[${this.config.id}] Success indicator found: ${text}`);
          return { success: true, message: text };
        }
      }

      if (indicator.text && indicator.text.length > 0) {
        const pageContent = await this.page.content();
        for (const text of indicator.text) {
          if (pageContent.toLowerCase().includes(text.toLowerCase())) {
            console.log(`[${this.config.id}] Success text found: ${text}`);
            return { success: true, message: `Found: ${text}` };
          }
        }
      }
    } catch (error) {
      console.warn(`[${this.config.id}] Verification error: ${error.message}`);
    }

    console.log(`[${this.config.id}] Could not confirm submission status`);
    return { success: false, message: 'Submission status unclear' };
  }

  async run(candidateProfile, options = {}) {
    try {
      console.log(`[${this.config.id}] Starting bot for: ${this.config.name}`);
      
      await this.initBrowser();

      // PRD 2: Wrap navigation in reasoning loop
      const navContext = { page: this.page, bot: this, siteId: this.config.id };
      const navResult = await this.reasoningEngine.executeWithReasoning(
        navContext,
        async () => { await this.navigate(); },
        'Navigate to form page'
      );
      if (!navResult.success) {
        throw new Error(`Navigation failed after ${navResult.retries} retries: ${navResult.error?.message}`);
      }
      
      await this.fillForm(candidateProfile);
      
      if (this.config.hasCaptcha) {
        await this.handleCaptcha();
      }
      
      if (options.otp) {
        await this.handleOtp(options.otp);
      }

      if (options.autoSubmit !== false) {
        // PRD 2: Wrap submission in reasoning loop
        const submitResult = await this.reasoningEngine.executeWithReasoning(
          navContext,
          async () => { await this.submit(); },
          'Submit form'
        );
        if (!submitResult.success) {
          console.warn(`[${this.config.id}] ⚠️ Submit had issues but continuing to verify...`);
        }
      }

      const result = await this.verifySubmission();
      
      // Attach reasoning log to result
      result.reasoningLog = this.reasoningEngine.getLog();
      result.failedFields = this._failedFields;
      result.verifiedSelectors = Object.keys(this._verifiedSelectors).length;
      
      if (options.keepOpen) {
        console.log(`[${this.config.id}] Browser kept open for review`);
        await this.sleep(30000);
      }
      
      await this.closeBrowser();
      
      return result;
    } catch (error) {
      console.error(`[${this.config.id}] Bot error: ${error.message}`);
      await this.closeBrowser();
      throw error;
    }
  }
}

module.exports = { BaseBot };