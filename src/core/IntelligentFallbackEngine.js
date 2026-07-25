/**
 * Intelligent Fallback Engine - PRD-013
 * Multi-Model AI Routing with Automatic Failover
 *
 * Priority Flow:
 * 1. Offline Skills (100% local)
 * 2. Internal Agents (OCR, PDF, Browser, etc.)
 * 3. Gemini (20s timeout)
 * 4. OpenRouter (Gemma, Qwen, DeepSeek, Llama)
 * 5. OpenAI
 * 6. Claude
 * 7. Final Fallback (static message)
 */

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { aiProviderManager } = require('../utils/aiProviderManager');

const CACHE_DIR = path.join(__dirname, '../../data/cache');
const LOG_DIR = path.join(__dirname, '../../data/logs');

// Ensure directories exist
[LOG_DIR, CACHE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const CACHE_FILE = path.join(CACHE_DIR, 'query-cache.json');
const LOG_FILE = path.join(LOG_DIR, 'fallback-log.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

class IntelligentFallbackEngine {
  constructor() {
    this.name = 'IntelligentFallbackEngine';
    this.cache = new Map();
    this.providerStatus = {
      gemini: { healthy: true, failures: 0, disabled: false },
      openrouter: { healthy: true, failures: 0, disabled: false },
      openai: { healthy: true, failures: 0, disabled: false },
      claude: { healthy: true, failures: 0, disabled: false },
    };
    this._loadCache();
    console.log('[IFallback] Intelligent Fallback Engine initialized — Multi-Provider Support Active');
  }

  _loadCache() {
    try {
      if (fs.existsSync(CACHE_FILE)) {
        const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
        for (const [key, entry] of Object.entries(data)) {
          if (Date.now() - entry.timestamp < CACHE_TTL) {
            this.cache.set(key, entry);
          }
        }
        console.log(`[IFallback] Loaded ${this.cache.size} cached responses`);
      }
    } catch (e) {
      console.warn('[IFallback] Cache load failed:', e.message);
    }
  }

  _saveCache() {
    try {
      const data = {};
      for (const [key, entry] of this.cache.entries()) {
        data[key] = entry;
      }
      fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn('[IFallback] Cache save failed:', e.message);
    }
  }

  _getCacheKey(question) {
    return crypto.createHash('md5').update(question.toLowerCase().trim()).digest('hex');
  }

  _logQuery(query, intent, skill, provider, latency, success, retryCount = 0) {
    const logEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      question: query.substring(0, 500),
      intent,
      skill,
      provider,
      latency,
      success,
      retryCount,
    };

    try {
      const logs = fs.existsSync(LOG_FILE) 
        ? JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')) 
        : [];
      logs.push(logEntry);
      if (logs.length > 10000) logs.splice(0, logs.length - 10000);
      fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    } catch (e) {
      console.warn('[IFallback] Logging failed:', e.message);
    }
  }

  async processQuery(userId, question, context = {}) {
    const cacheKey = this._getCacheKey(question);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`[IFallback] Cache HIT for: "${question.substring(0, 50)}..."`);
      this._logQuery(question, cached.intent, cached.skill, cached.provider, 0, true, 0);
      return {
        type: 'ai',
        message: cached.answer,
        skill: cached.skill,
        provider: cached.provider,
        cached: true,
      };
    }

    // STEP 1: Offline Skills (handled by MasterAgent)
    // This step is handled upstream by MasterAgent's IntentDetector
    // Return null to signal that offline skills should be tried first
    return null;
  }

  async routeToAI(provider, model, messages, options = {}) {
    const startTime = Date.now();
    let lastError = null;
    const maxRetries = 1;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await aiProviderManager.createChatCompletion('GeneralChatAgent', {
          messages,
          model,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1500,
        });

        const latency = Date.now() - startTime;
        const answer = response.choices[0]?.message?.content || '';
        
        this.providerStatus[provider].healthy = true;
        this.providerStatus[provider].failures = 0;

        return { answer, provider, latency };
      } catch (err) {
        lastError = err;
        const statusCode = err.status || err.statusCode || 0;
        const errorMsg = err.message || '';

        console.warn(`[IFallback] ${provider} attempt ${attempt + 1} failed:`, errorMsg);

        if (statusCode === 429 || /quota/i.test(errorMsg) || /rate.?limit/i.test(errorMsg)) {
          this.providerStatus[provider].failures++;
          if (this.providerStatus[provider].failures >= 3) {
            this.providerStatus[provider].disabled = true;
            console.warn(`[IFallback] ${provider} disabled due to quota/rate limit`);
          }
          break;
        }

        if (statusCode >= 500 || /network|timeout/i.test(errorMsg)) {
          this.providerStatus[provider].failures++;
          continue;
        }

        if (/invalid.?key|unauthorized/i.test(errorMsg)) {
          this.providerStatus[provider].disabled = true;
          break;
        }

        if (attempt === maxRetries) {
          this.providerStatus[provider].failures++;
        }
      }
    }

    throw lastError;
  }

  async executeWithFailover(messages, options = {}) {
    const providers = [
      { name: 'gemini', model: 'gemini-1.5-flash', timeout: 20000 },
      { name: 'openrouter', model: 'qwen/qwen-2.5-72b-instruct', timeout: 30000 },
      { name: 'openai', model: 'gpt-4o-mini', timeout: 30000 },
      { name: 'claude', model: 'claude-3-5-sonnet-20241022', timeout: 30000 },
    ];

    let lastError = null;

    for (const { name, model, timeout } of providers) {
      const status = this.providerStatus[name];
      
      if (status?.disabled) {
        console.log(`[IFallback] Skipping disabled provider: ${name}`);
        continue;
      }

      try {
        const result = await Promise.race([
          this.routeToAI(name, model, messages, options),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          ),
        ]);

        return {
          answer: result.answer,
          provider: result.provider,
          latency: result.latency,
        };
      } catch (err) {
        lastError = err;
        this.providerStatus[name].failures = (this.providerStatus[name].failures || 0) + 1;
        if (this.providerStatus[name].failures >= 3) {
          this.providerStatus[name].disabled = true;
        }
        console.warn(`[IFallback] Provider ${name} failed:`, err.message);
      }
    }

    // All providers failed
    return {
      answer: null,
      error: lastError?.message || 'All AI providers unavailable',
    };
  }

  async cacheAndSet(question, answer, intent, skill, provider) {
    const cacheKey = this._getCacheKey(question);
    this.cache.set(cacheKey, {
      question,
      answer,
      intent,
      skill,
      provider,
      timestamp: Date.now(),
    });
    this._saveCache();
  }

  getFinalFallbackMessage() {
    return 'I am temporarily unable to contact AI servers. Offline services are still available.';
  }

  getProviderStatus() {
    return { ...this.providerStatus };
  }

  resetProviderStatus(providerName) {
    if (this.providerStatus[providerName]) {
      this.providerStatus[providerName] = { healthy: true, failures: 0, disabled: false };
    }
  }
}

const intelligentFallbackEngine = new IntelligentFallbackEngine();
module.exports = { IntelligentFallbackEngine, intelligentFallbackEngine };