const { BaseBot } = require('../baseBot');

class SSCBot extends BaseBot {
  constructor(config, browserAgent) {
    super(config, browserAgent);
  }

  async navigate() {
    console.log('[SSC] Navigating to SSC portal...');
    await super.navigate();
    
    await this.page.waitForLoadState('networkidle');
    
    const noticePopup = await this.page.$('.close, .popup-close, #closeBtn');
    if (noticePopup) {
      await noticePopup.click();
      console.log('[SSC] Closed popup');
    }
    
    return true;
  }

  async handleCaptcha() {
    console.log('[SSC] Handling captcha...');
    
    const captchaImg = await this.page.$('img[alt="Captcha"], img[id="captchaImage"], #captcha_img');
    
    if (captchaImg) {
      console.log('[SSC] Captcha image found, waiting for manual entry...');
      await this.sleep(15000);
      
      const captchaInput = await this.page.$('input[name="captcha"], input[name="captchaCode"], input[id="captcha"]');
      if (captchaInput) {
        await this.sleep(2000);
      }
    }
    
    return true;
  }

  async fillForm(candidateProfile) {
    console.log('[SSC] Filling SSC CGL form...');
    
    const selectors = this.config.fieldSelectors;
    
    const priorityFields = ['fullName', 'dob', 'email', 'phone', 'category', 'gender'];
    
    for (const fieldName of priorityFields) {
      const selector = selectors[fieldName];
      if (!selector) continue;
      
      const value = this.getFieldValue(fieldName, candidateProfile);
      if (!value) continue;

      try {
        await this.fillField(selector, value, fieldName);
      } catch (e) {
        console.warn(`[SSC] Priority field ${fieldName} failed: ${e.message}`);
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
      const className = await el.getAttribute('class') || '';

      if (tagName === 'select') {
        await this.fillSelect(el, value);
      } else if (tagName === 'mat-select' || className.includes('Select') || className.includes('mat-mdc-select')) {
        // Handle mat-select or custom div-based select
        console.log(`[SSC] Handling mat-select/custom dropdown for ${fieldName}`);
        await el.click();
        await this.sleep(1000);
        
        // Find option within the overlay
        const options = await this.page.$$('mat-option, .mat-option, [role="option"]');
        for (const opt of options) {
          const text = await opt.textContent();
          if (this.matchesOption(text, value)) {
            await opt.click();
            console.log(`[SSC] Selected option: ${text}`);
            break;
          }
        }
      } else if (inputType === 'radio') {
        const elValue = await el.getAttribute('value');
        if (this.matchesOption(elValue, value)) {
          await el.check();
          break;
        }
      } else {
        await el.fill(value);
      }
      
      console.log(`[SSC] Filled: ${fieldName} = ${value}`);
      break;
    }
  }

  async verifySubmission() {
    console.log('[SSC] Verifying submission...');
    
    await this.sleep(3000);
    
    const successSelectors = [
      '.success-message',
      '.alert-success',
      '#successMessage',
      '.application-submitted',
      'div:has-text("submitted successfully")',
      'div:has-text("Registration Successful")'
    ];

    for (const sel of successSelectors) {
      try {
        const el = await this.page.$(sel);
        if (el) {
          const text = await el.textContent();
          console.log(`[SSC] Success: ${text.substring(0, 100)}`);
          return { success: true, message: text };
        }
      } catch (e) {
        continue;
      }
    }

    const confirmationNumber = await this.page.$eval('body', body => {
      const text = body.textContent;
      const match = text.match(/(?:application|registration|reference)\s*(?:no|number|id)[:\s]*([A-Z0-9]+)/i);
      return match ? match[1] : null;
    }).catch(() => null);

    if (confirmationNumber) {
      return { success: true, message: `Application submitted. Ref: ${confirmationNumber}`, reference: confirmationNumber };
    }

    return { success: true, message: 'Form submitted, manual verification needed' };
  }

  async run(candidateProfile, options = {}) {
    console.log('[SSC] Starting SSC bot...');
    return super.run(candidateProfile, options);
  }
}

module.exports = { SSCBot };