/**
 * AIProviderManager - PRD-013 Multi-Model Intelligent Fallback Engine
 *
 * Priority Flow (per PRD-013):
 *   1. Offline Skills (handled by IntentDetector/SkillRegistry)
 *   2. Internal Agents (OCR, PDF, Browser, etc.)
 *   3. Gemini (20s timeout)
 *   4. OpenRouter (Gemma, Qwen, DeepSeek, Llama)
 *   5. OpenAI
 *   6. Claude
 *   7. Local Ollama (final emergency fallback)
 */

const OpenAI = require('openai');
const https = require('https');

class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.providerStatus = new Map();
    this.providerCosts = new Map();
    this.defaultProvider = 'local_ollama';
    this._initializeProviders();
  }

  _initializeProviders() {
    // 1. Local Ollama (Emergency Fallback - FINAL)
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    try {
      this.providers.set('local_ollama', new OpenAI({
        apiKey: 'ollama',
        baseURL: ollamaUrl,
        timeout: 5000
      }));
      this.providerStatus.set('local_ollama', { healthy: true, latency: 0, failures: 0 });
      console.log(`HASA AIProvider: Local Ollama initialized at ${ollamaUrl}`);
    } catch (e) {
      console.warn('Failed to init Local Ollama:', e.message);
    }

    // 2. Groq (FREE) - Internal agent support
    if (process.env.GROQ_API_KEY) {
      try {
        this.providers.set('groq', new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1'
        }));
        this.providerStatus.set('groq', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: Groq (Llama 3.3 70B) - FREE');
      } catch (e) {
        console.error('Failed to init Groq:', e.message);
      }
    }

    // 3. Gemini (PRD-013 Step 3 - 20s timeout)
    if (process.env.GEMINI_API_KEY) {
      try {
        this.providers.set('gemini', new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        }));
        this.providerStatus.set('gemini', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: Gemini Flash 2.0 - PAID');
      } catch (e) {
        console.error('Failed to init Gemini:', e.message);
      }
    }

    // 4. OpenRouter (PRD-013 Step 4 - Gemma, Qwen, DeepSeek, Llama)
    if (process.env.OPENROUTER_API_KEY) {
      try {
        this.providers.set('openrouter', new OpenAI({
          apiKey: process.env.OPENROUTER_API_KEY,
          baseURL: 'https://openrouter.ai/api/v1'
        }));
        this.providerStatus.set('openrouter', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: OpenRouter (Gemma, Qwen, DeepSeek, Llama)');
      } catch (e) {
        console.error('Failed to init OpenRouter:', e.message);
      }
    }

    // 5. OpenAI (PRD-013 Step 5)
    if (process.env.OPENAI_API_KEY) {
      try {
        this.providers.set('openai', new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
        this.providerStatus.set('openai', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: OpenAI (GPT) - PAID');
      } catch (e) {
        console.error('Failed to init OpenAI:', e.message);
      }
    }

    // 6. Claude (PRD-013 Step 6 - Anthropic)
    if (process.env.CLAUDE_API_KEY) {
      try {
        this.providers.set('claude', new OpenAI({
          apiKey: process.env.CLAUDE_API_KEY,
          baseURL: 'https://api.anthropic.com/v1'
        }));
        this.providerStatus.set('claude', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: Claude (Anthropic) - PAID');
      } catch (e) {
        console.error('Failed to init Claude:', e.message);
      }
    }

    // Legacy: DeepSeek (if standalone key provided)
    if (process.env.DEEPSEEK_API_KEY && !process.env.OPENROUTER_API_KEY) {
      try {
        this.providers.set('deepseek', new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com'
        }));
        this.providerStatus.set('deepseek', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: DeepSeek');
      } catch (e) {
        console.error('Failed to init DeepSeek:', e.message);
      }
    }

    // Legacy: Qwen (if standalone key provided)
    if (process.env.QWEN_API_KEY && !process.env.OPENROUTER_API_KEY) {
      try {
        this.providers.set('qwen', new OpenAI({
          apiKey: process.env.QWEN_API_KEY,
          baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
        }));
        this.providerStatus.set('qwen', { healthy: true, latency: 0, failures: 0 });
        console.log('HASA AIProvider: Qwen');
      } catch (e) {
        console.error('Failed to init Qwen:', e.message);
      }
    }

    // 8. HuggingFace (Hindi NLP, specialized models, embeddings)
    if (process.env.HUGGINGFACE_TOKEN) {
      this.huggingFaceToken = process.env.HUGGINGFACE_TOKEN;
      this.providerStatus.set('huggingface', { healthy: true, latency: 0, failures: 0 });
      console.log('HASA AIProvider: HuggingFace Inference API (fine-grained token)');
    }

    console.log(`HASA AI Router: ${this.providers.size} provider(s) registered`);
  }

  getClient(agentName, preferredProvider = null) {
    const effectiveProvider = preferredProvider || this.getEffectiveProvider(agentName);
    if (this.providers.has(effectiveProvider) && this.providerStatus.get(effectiveProvider)?.healthy) {
      return this.providers.get(effectiveProvider);
    }
    for (const [name, client] of this.providers.entries()) {
      if (this.providerStatus.get(name)?.healthy) {
        return client;
      }
    }
    return this.providers.get('local_ollama') || null;
  }

  getModel(agentName, provider = null) {
    const modelMap = {
      local_ollama: {
        'default': 'qwen2.5:7b',
        'LegalDraftAgent': 'qwen2.5:7b',
        'DocumentAIAgent': 'deepseek-r1:8b'
      },
      groq: {
        'default': 'llama-3.3-70b-versatile'
      },
      gemini: {
        'default': 'gemini-1.5-flash',
        'LegalDraftAgent': 'gemini-1.5-flash'
      },
      openrouter: {
        'default': 'gemma-2-27b-it',
        'LegalDraftAgent': 'anthropic/claude-3-5-sonnet'
      },
      openai: {
        'default': 'gpt-4o-mini',
        'LegalDraftAgent': 'gpt-4o'
      },
      claude: {
        'default': 'claude-3-5-sonnet-20241022',
        'LegalDraftAgent': 'claude-3-opus-20240229'
      },
      deepseek: {
        'default': 'deepseek/deepseek-chat',
        'LegalDraftAgent': 'deepseek/deepseek-r1'
      },
      qwen: {
        'default': 'qwen/qwen-2.5-72b-instruct'
      }
    };

    const effectiveProvider = provider || this.getEffectiveProvider(agentName);
    const agentModels = modelMap[effectiveProvider] || modelMap.local_ollama;
    return agentModels[agentName] || agentModels.default;
  }

  getEffectiveProvider(agentName) {
    // PRD-013 Priority Flow: Offline Skills -> Internal Agents -> Gemini -> OpenRouter -> OpenAI -> Claude
    const preferences = {
      'DocumentAIAgent': process.env.AI_DOCUMENT_PROVIDER || 'groq',
      'LegalDraftAgent': process.env.AI_LEGAL_PROVIDER || 'gemini',
      'JobSearchAgent': process.env.AI_JOB_PROVIDER || 'openai',
      'UIBuilderAgent': 'groq',
      'IntentDetector': 'groq',
      'MasterAgent': process.env.AI_CHAT_PROVIDER || 'groq',
      'default': 'gemini' // PRD-013: Default to Gemini per priority
    };
    return preferences[agentName] || preferences.default;
  }

  getAvailableProviders() {
    const providers = Array.from(this.providers.keys()).map(name => ({
      name,
      ...this.providerStatus.get(name)
    }));
    if (this.huggingFaceToken) {
      providers.push({ name: 'huggingface', ...this.providerStatus.get('huggingface') });
    }
    return providers;
  }

  async huggingFaceRequest(model, payload) {
    if (!this.huggingFaceToken) {
      throw new Error('HuggingFace token not configured. Set HUGGINGFACE_TOKEN in .env');
    }
    const url = `https://api-inference.huggingface.co/models/${model}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.huggingFaceToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HuggingFace API error (${response.status}): ${err}`);
    }
    return response.json();
  }

  async generateResponse(prompt, options = {}) {
    const agentName = options.agentName || 'MasterAgent';
    const model = options.model || null;
    const provider = options.provider || null;

    const response = await this.createChatCompletion(agentName, {
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1500,
      ...(model ? { model } : {})
    });

    return response.choices[0]?.message?.content || '';
  }

  async createChatCompletion(agentName, options = {}) {
    const preferred = this.getEffectiveProvider(agentName);

    // PRD-013 Priority Order: Gemini -> OpenRouter -> OpenAI -> Claude -> Groq
    const priority = [preferred, 'gemini', 'openrouter', 'openai', 'claude', 'groq', 'local_ollama'];
    const providersToTry = [...new Set(priority)].filter(name => this.providers.has(name));

    let lastError = null;
    for (const provider of providersToTry) {
      const status = this.providerStatus.get(provider);
      if (status && !status.healthy) {
        continue;
      }
      if (status?.disabled) {
        continue;
      }

      const client = this.providers.get(provider);
      const model = this.getModel(agentName, provider);
      const startTime = Date.now();

      try {
        console.log(`[HASA Router] Trying provider: ${provider} with model: ${model}`);

        // PRD-013 Step 3: 20 second timeout for Gemini
        const timeout = provider === 'gemini' ? 20000 : 30000;

        const requestBody = {
          model,
          ...options,
        };

        if (options.json === true || options.responseFormat === 'json') {
          requestBody.response_format = { type: 'json_object' };
          delete requestBody.json;
          delete requestBody.responseFormat;
        }

        const response = await Promise.race([
          client.chat.completions.create(requestBody),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
        ]);

        const latency = Date.now() - startTime;
        this.providerStatus.set(provider, { healthy: true, latency, failures: 0 });

        const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };
        const promptCost = (usage.prompt_tokens / 1000) * (provider === 'openai' ? 0.005 : provider === 'gemini' ? 0.00015 : 0.0);
        const completionCost = (usage.completion_tokens / 1000) * (provider === 'openai' ? 0.015 : provider === 'gemini' ? 0.0006 : 0.0);
        const totalCost = promptCost + completionCost;

        const currentCost = this.providerCosts.get(provider) || 0;
        this.providerCosts.set(provider, currentCost + totalCost);

        return response;
      } catch (err) {
        console.warn(`[HASA Router] Provider ${provider} failed: ${err.message}`);
        lastError = err;

        const errorMsg = err.message || '';
        const statusCode = err.status || err.statusCode || 0;

        // 429 / Quota Exceeded -> Next Provider, Disable if persistent
        if (statusCode === 429 || /quota|rate.?limit/i.test(errorMsg)) {
          const failures = (status?.failures || 0) + 1;
          const disabled = failures >= 3;
          this.providerStatus.set(provider, { healthy: !disabled, failures, disabled });
          if (disabled) console.warn(`[HASA Router] Provider ${provider} disabled due to quota/rate limit`);
          continue;
        }

        // 500 / Network Error / Timeout -> Next Provider
        if (statusCode >= 500 || /network|timeout/i.test(errorMsg)) {
          const failures = (status?.failures || 0) + 1;
          this.providerStatus.set(provider, { healthy: failures < 3, failures });
          continue;
        }

        // Invalid Key -> Disable Provider
        if (/invalid.?key|unauthorized/i.test(errorMsg)) {
          this.providerStatus.set(provider, { healthy: false, failures: 999, disabled: true });
          console.warn(`[HASA Router] Provider ${provider} disabled due to invalid key`);
          continue;
        }

        const currentFailures = (status?.failures || 0) + 1;
        this.providerStatus.set(provider, {
          healthy: currentFailures < 3,
          latency: 9999,
          failures: currentFailures
        });
      }
    }

    const finalError = lastError || new Error('All AI providers failed');
    console.error(`[HASA Router] All providers exhausted. Last error: ${finalError.message}`);
    throw finalError;
  }
}

const aiProviderManager = new AIProviderManager();

module.exports = { AIProviderManager, aiProviderManager };