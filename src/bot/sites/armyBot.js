const { BaseBot } = require('../baseBot');

class ArmyBot extends BaseBot {
  constructor(config, browserAgent) {
    super(config, browserAgent);
  }

  async navigate() {
    console.log('[Army] Navigating to Indian Army recruitment portal...');
    await super.navigate();
    
    await this.page.waitForLoadState('networkidle');
    
    const acceptBtn = await this.page.$('button:has-text("Accept"), button:has-text("I Accept"), #acceptTerms');
    if (acceptBtn) {
      await acceptBtn.click();
      console.log('[Army] Accepted terms');
      await this.randomWait();
    }
    
    return true;
  }

  async fillForm(candidateProfile) {
    console.log('[Army] Filling Army GD/Clerk form...');
    
    const selectors = this.config.fieldSelectors;
    
    const priorityFields = ['fullName', 'firstName', 'lastName', 'dob', 'fatherName', 'gender'];
    
    for (const fieldName of priorityFields) {
      const selector = selectors[fieldName];
      if (!selector) continue;
      
      const value = this.getFieldValue(fieldName, candidateProfile);
      if (!value) continue;

      try {
        await this.fillField(selector, value, fieldName);
      } catch (e) {
        console.warn(`[Army] Priority field ${fieldName} failed: ${e.message}`);
      }
      
      await this.randomWait();
    }

    await super.fillForm(candidateProfile);
    
    return true;
  }

  async fillField(selector, value, fieldName) {
    const elements = await this.page.$$(selector);
    
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
          break;
        }
      } else {
        await el.fill(value);
      }
      
      console.log(`[Army] Filled: ${fieldName} = ${value}`);
      break;
    }
  }

  async handleCaptcha() {
    console.log('[Army] Handling captcha...');
    
    const captchaSelector = 'img[id="captcha"], img[class*="captcha"], #imgCaptcha';
    
    const captchaImg = await this.page.$(captchaSelector);
    
    if (captchaImg) {
      console.log('[Army] Captcha detected, waiting for manual solve...');
      await this.sleep(20000);
    } else {
      console.log('[Army] No captcha found, continuing...');
    }
    
    return true;
  }

  async handleOtp(otp) {
    console.log('[Army] Handling OTP verification...');
    
    const otpSelector = "input[name='Otp'], input[id='otp'], input[name='otp'], input[name='OTP']";
    
    try {
      const otpInput = await this.page.waitForSelector(otpSelector, { timeout: 5000 });
      if (otpInput && otp) {
        await otpInput.fill(otp);
        await this.randomWait();
        
        const verifyBtn = await this.page.$('button:has-text("Verify OTP"), button:has-text("Submit"), #btnVerify');
        if (verifyBtn) {
          await verifyBtn.click();
          await this.sleep(2000);
          console.log('[Army] OTP verified');
        }
      }
    } catch (error) {
      console.warn(`[Army] OTP input not found or already handled: ${error.message}`);
    }

    return true;
  }

  async verifySubmission() {
    console.log('[Army] Verifying Army application submission...');
    
    await this.sleep(3000);
    
    const successSelectors = [
      '.success-message',
      '.alert-success',
      '#successMessage',
      '.application-received',
      'div:has-text("Application Submitted")',
      'div:has-text("Registration Successful")',
      'div:has-text("Application Received")'
    ];

    for (const sel of successSelectors) {
      try {
        const el = await this.page.$(sel);
        if (el) {
          const text = await el.textContent();
          console.log(`[Army] Success: ${text.substring(0, 100)}`);
          return { success: true, message: text };
        }
      } catch (e) {
        continue;
      }
    }

    const regNumber = await this.page.$eval('body', body => {
      const text = body.textContent;
      const match = text.match(/(?:registration|application|ref|record)\s*(?:no|number|id)[:\s]*([A-Z0-9-]+)/i);
      return match ? match[1] : null;
    }).catch(() => null);

    if (regNumber) {
      return { success: true, message: `Application submitted. Ref: ${regNumber}`, reference: regNumber };
    }

    return { success: true, message: 'Army application submitted, manual verification needed' };
  }

  async run(candidateProfile, options = {}) {
    console.log('[Army] Starting Indian Army bot...');
    
    if (this.config.delayConfig) {
      this.config.delayConfig.minDelay = Math.max(this.config.delayConfig.minDelay, 2000);
      this.config.delayConfig.maxDelay = Math.max(this.config.delayConfig.maxDelay, 4000);
    }
    
    return super.run(candidateProfile, options);
  }
}

module.exports = { ArmyBot };