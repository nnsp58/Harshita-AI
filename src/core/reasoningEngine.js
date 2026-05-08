/**
 * ReasoningEngine — Hermes-style Thought → Action → Observation Loop
 *
 * Instead of crashing on errors, the bot now THINKS about what went wrong
 * and attempts corrective actions autonomously.
 *
 * Loop (max 3 iterations):
 *   1. OBSERVATION: Capture page state (screenshot + HTML snippet + error text)
 *   2. THOUGHT:     Ask AI — "What went wrong? What should I do?"
 *   3. ACTION:      Execute AI's suggested fix (close popup, re-find element, retry)
 *   4. VERIFY:      Check if the fix worked
 *
 * Self-Healing Actions Supported:
 *   - close_popup:  Dismiss unexpected modals/alerts/overlays
 *   - retry_fill:   Re-discover selector and try filling again
 *   - wait_and_retry: Wait for page to load and retry
 *   - scroll_into_view: Scroll to the element before interacting
 *   - refresh_page: Hard refresh and start over from navigation
 *   - accept_alert: Accept browser alert/confirm dialogs
 *   - skip_field:   Skip this field and continue with others
 */

const { aiProviderManager } = require('../utils/aiProviderManager');

class ReasoningEngine {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.agentName = options.agentName || 'ReasoningEngine';
    this.reasoningLog = [];
  }

  /**
   * Execute an action with reasoning-based retry loop.
   *
   * @param {Object}   context   — { page, bot, siteId, fieldName, ... }
   * @param {Function} actionFn  — async function to attempt (should throw on failure)
   * @param {string}   actionDesc — human-readable description for logs
   * @returns {Object} { success, retries, reasoningLog }
   */
  async executeWithReasoning(context, actionFn, actionDesc = 'action') {
    let lastError = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await actionFn();
        
        // Success! Log the win
        this.reasoningLog.push({
          attempt: attempt + 1,
          action: actionDesc,
          status: 'success',
          timestamp: new Date().toISOString()
        });

        return { success: true, result, retries: attempt, reasoningLog: this.reasoningLog };
      } catch (error) {
        lastError = error;
        console.warn(`[ReasoningEngine] ⚠️ Attempt ${attempt + 1}/${this.maxRetries} failed for "${actionDesc}": ${error.message}`);

        // Don't reason on the last attempt — just fail
        if (attempt >= this.maxRetries - 1) break;

        // === REASONING LOOP ===
        const observation = await this._observe(context, error);
        const thought = await this._think(observation, actionDesc, attempt);
        await this._act(context, thought);
      }
    }

    // All retries exhausted
    this.reasoningLog.push({
      attempt: this.maxRetries,
      action: actionDesc,
      status: 'failed',
      error: lastError?.message,
      timestamp: new Date().toISOString()
    });

    return { success: false, error: lastError, retries: this.maxRetries, reasoningLog: this.reasoningLog };
  }

  /**
   * STEP 1: OBSERVATION — Capture what's on the page right now
   */
  async _observe(context, error) {
    const { page } = context;
    const observation = {
      errorMessage: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString()
    };

    try {
      // Get page URL
      observation.url = page.url();

      // Get visible text near error (limited to prevent token overflow)
      observation.visibleText = await page.evaluate(() => {
        const body = document.body?.innerText || '';
        return body.substring(0, 2000);
      }).catch(() => '');

      // Check for common blockers
      observation.hasAlert = await page.evaluate(() => {
        // Check for modal/overlay elements
        const modals = document.querySelectorAll(
          '.modal.show, .overlay, [role="dialog"], .popup, .modal-backdrop, ' +
          '.alert-danger, .error-message, .toast, .notification'
        );
        return Array.from(modals).map(m => ({
          tag: m.tagName,
          text: m.innerText?.substring(0, 200),
          classes: m.className
        }));
      }).catch(() => []);

      // Check for error messages on page
      observation.pageErrors = await page.evaluate(() => {
        const errorEls = document.querySelectorAll(
          '.error, .alert-danger, .alert-warning, .validation-error, ' +
          '.field-error, .has-error, [class*="error"], [class*="invalid"]'
        );
        return Array.from(errorEls).slice(0, 5).map(el => ({
          text: el.innerText?.substring(0, 150),
          field: el.closest('[name], [id]')?.getAttribute('name') || el.closest('[name], [id]')?.id || ''
        }));
      }).catch(() => []);

    } catch (e) {
      observation.observationError = e.message;
    }

    return observation;
  }

  /**
   * STEP 2: THOUGHT — Ask AI what to do
   */
  async _think(observation, actionDesc, attemptNumber) {
    const defaultThought = {
      suggestedAction: 'wait_and_retry',
      reason: 'AI unavailable — defaulting to wait and retry',
      details: {}
    };

    try {
      const client = aiProviderManager.getClient(this.agentName);
      const model = aiProviderManager.getModel(this.agentName);

      if (!client) {
        console.log('[ReasoningEngine] No AI provider — using default heuristic');
        return this._heuristicThink(observation);
      }

      const prompt = `You are a browser automation debugging agent. The bot tried to perform: "${actionDesc}" but failed.

ERROR: ${observation.errorMessage}

PAGE URL: ${observation.url || 'unknown'}

VISIBLE ALERTS/MODALS: ${JSON.stringify(observation.hasAlert || [])}

PAGE ERRORS: ${JSON.stringify(observation.pageErrors || [])}

VISIBLE TEXT (truncated): ${(observation.visibleText || '').substring(0, 500)}

ATTEMPT: ${attemptNumber + 1}

Choose ONE corrective action from this list:
- close_popup: A modal, overlay, or popup is blocking interaction
- retry_fill: The element was not found but might exist with different selector
- wait_and_retry: The page is still loading or server is slow
- scroll_into_view: The element exists but is not in viewport
- refresh_page: The page is in a broken state, needs full reload
- accept_alert: A browser alert/confirm dialog is open
- skip_field: This field is optional and can be skipped

Return ONLY a JSON object:
{
  "suggestedAction": "action_name",
  "reason": "brief explanation in Hindi for operator",
  "details": { "selectorHint": "optional new selector to try", "waitMs": 2000 }
}`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 300
      });

      let content = response.choices[0].message.content.trim();
      content = content.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');

      const thought = JSON.parse(content);
      console.log(`[ReasoningEngine] 🧠 THOUGHT: "${thought.suggestedAction}" — ${thought.reason}`);

      this.reasoningLog.push({
        attempt: attemptNumber + 1,
        phase: 'thought',
        observation: { error: observation.errorMessage, alerts: observation.hasAlert?.length || 0 },
        thought,
        timestamp: new Date().toISOString()
      });

      return thought;
    } catch (e) {
      console.warn(`[ReasoningEngine] AI thinking failed: ${e.message} — using heuristic`);
      return this._heuristicThink(observation);
    }
  }

  /**
   * Fallback heuristic thinking (no AI needed)
   */
  _heuristicThink(observation) {
    const error = (observation.errorMessage || '').toLowerCase();
    const hasModals = (observation.hasAlert || []).length > 0;

    if (hasModals) {
      return {
        suggestedAction: 'close_popup',
        reason: 'पेज पर कोई पॉपअप दिख रहा है — बंद कर रहे हैं',
        details: {}
      };
    }

    if (error.includes('timeout') || error.includes('waiting')) {
      return {
        suggestedAction: 'wait_and_retry',
        reason: 'पेज लोड होने में समय लग रहा है — इंतज़ार कर रहे हैं',
        details: { waitMs: 3000 }
      };
    }

    if (error.includes('not found') || error.includes('no element') || error.includes('null')) {
      return {
        suggestedAction: 'retry_fill',
        reason: 'फील्ड नहीं मिला — दोबारा ढूँढ रहे हैं',
        details: {}
      };
    }

    if (error.includes('not visible') || error.includes('outside of viewport')) {
      return {
        suggestedAction: 'scroll_into_view',
        reason: 'फील्ड स्क्रीन पर नहीं दिख रहा — स्क्रॉल कर रहे हैं',
        details: {}
      };
    }

    if (error.includes('alert') || error.includes('dialog')) {
      return {
        suggestedAction: 'accept_alert',
        reason: 'ब्राउज़र अलर्ट आया है — OK दबा रहे हैं',
        details: {}
      };
    }

    // Default
    return {
      suggestedAction: 'wait_and_retry',
      reason: 'अज्ञात समस्या — दोबारा कोशिश कर रहे हैं',
      details: { waitMs: 2000 }
    };
  }

  /**
   * STEP 3: ACTION — Execute the suggested fix
   */
  async _act(context, thought) {
    const { page } = context;
    const action = thought.suggestedAction;
    const details = thought.details || {};

    console.log(`[ReasoningEngine] 🔧 ACTION: ${action}`);

    try {
      switch (action) {
        case 'close_popup':
          await this._actionClosePopup(page);
          break;

        case 'wait_and_retry':
          const waitMs = details.waitMs || 2000;
          console.log(`[ReasoningEngine] ⏳ Waiting ${waitMs}ms...`);
          await page.waitForTimeout(waitMs);
          break;

        case 'scroll_into_view':
          if (details.selectorHint) {
            await page.evaluate((sel) => {
              const el = document.querySelector(sel);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, details.selectorHint);
          }
          await page.waitForTimeout(500);
          break;

        case 'refresh_page':
          console.log('[ReasoningEngine] 🔄 Refreshing page...');
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(2000);
          break;

        case 'accept_alert':
          page.once('dialog', async dialog => {
            console.log(`[ReasoningEngine] 🔔 Accepting dialog: "${dialog.message()}"`);
            await dialog.accept();
          });
          await page.waitForTimeout(500);
          break;

        case 'retry_fill':
          // Nothing special — the next iteration's actionFn will re-attempt
          await page.waitForTimeout(1000);
          break;

        case 'skip_field':
          // Signal to caller to skip this field
          console.log('[ReasoningEngine] ⏭️ Skipping field as suggested');
          break;

        default:
          console.warn(`[ReasoningEngine] Unknown action: ${action}`);
          await page.waitForTimeout(1500);
      }
    } catch (e) {
      console.warn(`[ReasoningEngine] Action "${action}" failed: ${e.message}`);
    }
  }

  /**
   * Close common popups / modals / overlays
   */
  async _actionClosePopup(page) {
    // Strategy 1: Click common close buttons
    const closeSelectors = [
      'button.close', 'button.btn-close', '[aria-label="Close"]',
      '.modal .close', '.popup-close', '.overlay-close',
      'button:has-text("Close")', 'button:has-text("OK")',
      'button:has-text("बंद करें")', 'button:has-text("Cancel")',
      '.toast-close', '.notification-close'
    ];

    for (const selector of closeSelectors) {
      try {
        const btn = await page.$(selector);
        if (btn && await btn.isVisible()) {
          await btn.click();
          console.log(`[ReasoningEngine] ✅ Closed popup via: ${selector}`);
          await page.waitForTimeout(500);
          return;
        }
      } catch { /* ignore */ }
    }

    // Strategy 2: Press Escape
    try {
      await page.keyboard.press('Escape');
      console.log('[ReasoningEngine] ✅ Pressed Escape to dismiss popup');
      await page.waitForTimeout(500);
    } catch { /* ignore */ }

    // Strategy 3: Click outside modal (on the backdrop)
    try {
      const backdrop = await page.$('.modal-backdrop, .overlay');
      if (backdrop) {
        await backdrop.click();
        console.log('[ReasoningEngine] ✅ Clicked backdrop to dismiss');
      }
    } catch { /* ignore */ }
  }

  /**
   * Get the complete reasoning log for this session
   */
  getLog() {
    return this.reasoningLog;
  }

  /**
   * Reset the reasoning log (call between jobs)
   */
  reset() {
    this.reasoningLog = [];
  }
}

module.exports = { ReasoningEngine };
