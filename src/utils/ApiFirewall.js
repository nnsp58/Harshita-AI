const fs = require('fs');
const path = require('path');

class AIFirewallRejection extends Error {
  constructor(message, localSkill) {
    super(message);
    this.name = 'AIFirewallRejection';
    this.localSkill = localSkill;
  }
}

class ApiFirewall {
  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'AI_EXECUTION_LOG.jsonl');
    this._ensureLogDirectory();
  }

  _ensureLogDirectory() {
    const dir = path.dirname(this.logFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Logs execution details strictly matching the CTO directive format.
   */
  logExecution(intent, matchedSkill, executionTimeMs, apiUsed, apiName, reason) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      intent: intent || 'UNKNOWN',
      matchedSkill: matchedSkill || 'NONE',
      executionTimeMs,
      apiUsed: apiUsed ? 'YES' : 'NO',
      apiName: apiName || 'N/A',
      reason: reason || 'N/A'
    };

    try {
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\\n', 'utf8');
    } catch (err) {
      console.error('[ApiFirewall] Failed to write log:', err.message);
    }
  }

  /**
   * Intercepts and validates if an API call is truly necessary.
   * Scans the prompt for tell-tale signs of local skill capabilities.
   * Throws an AIFirewallRejection if a local alternative exists.
   */
  validateOutboundApiCall(prompt, registry) {
    if (!prompt || typeof prompt !== 'string') return true;
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Prevent API calls for Application Writer
    if (/(application|prarthna patra|प्रार्थना पत्र|leave|शिकायत)/.test(lowerPrompt)) {
      throw new AIFirewallRejection('Architecture Violation: Application writing must execute locally.', 'application_writer');
    }

    // Prevent API calls for Legal/Tax
    if (/(legal|deed|affidavit|court|itr|tax|gst)/.test(lowerPrompt)) {
      throw new AIFirewallRejection('Architecture Violation: Legal/Tax drafting must execute locally.', 'legal_draft');
    }

    // Prevent API calls for Resume
    if (/(resume|cv|biodata|बायोडाटा)/.test(lowerPrompt)) {
      throw new AIFirewallRejection('Architecture Violation: Resume creation must execute locally.', 'resume_builder');
    }

    // Prevent API calls for Math/Calculator
    if (/(calculate|math|multiply|divide|add|subtract|%)/.test(lowerPrompt)) {
      throw new AIFirewallRejection('Architecture Violation: Calculations must execute locally.', 'math_solver');
    }

    // It passes the firewall. The Master Agent truly needs General Knowledge.
    return true;
  }
}

module.exports = {
  ApiFirewall: new ApiFirewall(),
  AIFirewallRejection
};
