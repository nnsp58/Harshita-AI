/**
 * AIProviderManager - Manages multiple AI providers for different agents (HASA Sovereign Architecture)
 *
 * Supports:
 *   - Groq (Llama 3.3 70B) - Fast, FREE
 *   - Gemini Flash 2.0 - High quality, paid  [Key: gen-lang-client-0744666121]
 *   - OpenAI GPT-4 - Best reasoning, expensive

 *   - DeepSeek - Coding & reasoning
 *   - Qwen - Multilingual tasks & Hindi
 *   - HuggingFace - Hindi NLP, specialized models, embeddings
 *   - Local LLM (Ollama / vLLM) - Emergency offline backup
 */

const OpenAI = require('openai');
const https = require('https');

class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.providerStatus = new Map(); // name -> { healthy: true, latency: 0, failures: 0 }
    this.providerCosts = new Map(); // name -> daily cost
    this.defaultProvider = 'local_ollama'; // Local fallback
    this._initializeProviders();
  }

  _initializeProviders() {
    // 1. Local Ollama (Primary Emergency Fallback)
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';
    try {
      this.providers.set('local_ollama', new OpenAI({
        apiKey: 'ollama',
        baseURL: ollamaUrl,
        timeout: 5000 // Fail fast if Ollama is not installed locally
      }));
      this.providerStatus.set('local_ollama', { healthy: true, latency: 0, failures: 0 });
      console.log(`✅ HASA AIProvider: Local Ollama initialized at ${ollamaUrl}`);
    } catch (e) {
      console.warn('⚠️ Failed to init Local Ollama:', e.message);
    }

    // 2. Groq (FREE)
    if (process.env.GROQ_API_KEY) {
      try {
        this.providers.set('groq', new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1'
        }));
        this.providerStatus.set('groq', { healthy: true, latency: 0, failures: 0 });
        console.log('✅ HASA AIProvider: Groq (Llama 3.3 70B) - FREE');
      } catch (e) {
        console.error('❌ Failed to init Groq:', e.message);
      }
    }

    // 3. Gemini (Paid - High Quality)
    if (process.env.GEMINI_API_KEY) {
      try {
        this.providers.set('gemini', new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        }));
        this.providerStatus.set('gemini', { healthy: true, latency: 0, failures: 0 });
        console.log('✅ HASA AIProvider: Gemini Flash 2.0 - PAID');
      } catch (e) {
        console.error('❌ Failed to init Gemini:', e.message);
      }
    }

    // 4. OpenAI (Paid - Expensive)
    if (process.env.OPENAI_API_KEY) {
      try {
        this.providers.set('openai', new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
        this.providerStatus.set('openai', { healthy: true, latency: 0, failures: 0 });
        console.log('✅ HASA AIProvider: OpenAI (GPT) - PAID');
      } catch (e) {
        console.error('❌ Failed to init OpenAI:', e.message);
      }
    }



    // 6. DeepSeek
    if (process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY) {
      try {
        this.providers.set('deepseek', new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY,
          baseURL: process.env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com' : 'https://openrouter.ai/api/v1'
        }));
        this.providerStatus.set('deepseek', { healthy: true, latency: 0, failures: 0 });
        console.log('✅ HASA AIProvider: DeepSeek');
      } catch (e) {
        console.error('❌ Failed to init DeepSeek:', e.message);
      }
    }

    // 7. Qwen
    if (process.env.QWEN_API_KEY || process.env.OPENROUTER_API_KEY) {
      try {
        this.providers.set('qwen', new OpenAI({
          apiKey: process.env.QWEN_API_KEY || process.env.OPENROUTER_API_KEY,
          baseURL: process.env.QWEN_API_KEY ? 'https://dashscope.aliyuncs.com/compatible-mode/v1' : 'https://openrouter.ai/api/v1'
        }));
        this.providerStatus.set('qwen', { healthy: true, latency: 0, failures: 0 });
        console.log('✅ HASA AIProvider: Qwen');
      } catch (e) {
        console.error('❌ Failed to init Qwen:', e.message);
      }
    }

    // 8. HuggingFace (Hindi NLP, specialized models, embeddings)
    if (process.env.HUGGINGFACE_TOKEN) {
      // HuggingFace uses its own REST API, not OpenAI-compatible.
      // We store the token and handle calls in huggingFaceRequest().
      this.huggingFaceToken = process.env.HUGGINGFACE_TOKEN;
      this.providerStatus.set('huggingface', { healthy: true, latency: 0, failures: 0 });
      console.log('✅ HASA AIProvider: HuggingFace Inference API (fine-grained token)');
    }

    console.log(`📊 HASA AI Router: ${this.providers.size} provider(s) registered`);
  }

  getClient(agentName, preferredProvider = null) {
    const effectiveProvider = preferredProvider || this.getEffectiveProvider(agentName);
    if (this.providers.has(effectiveProvider) && this.providerStatus.get(effectiveProvider)?.healthy) {
      return this.providers.get(effectiveProvider);
    }
    // Failover fallback loop
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
      openai: {
        'default': 'gpt-4o-mini',
        'LegalDraftAgent': 'gpt-4o'
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
    // Smart cost routing: Cheap tasks route to Groq/Qwen/Ollama; Premium route to Gemini/OpenAI
    const preferences = {
      'DocumentAIAgent': process.env.AI_DOCUMENT_PROVIDER || 'groq',
      'LegalDraftAgent': process.env.AI_LEGAL_PROVIDER || 'gemini',
      'JobSearchAgent': process.env.AI_JOB_PROVIDER || 'openai',
      'UIBuilderAgent': 'groq',
      'IntentDetector': 'groq',
      'MasterAgent': process.env.AI_CHAT_PROVIDER || 'groq',
      'default': 'groq'
    };
    return preferences[agentName] || preferences.default;
  }

  getAvailableProviders() {
    const providers = Array.from(this.providers.keys()).map(name => ({
      name,
      ...this.providerStatus.get(name)
    }));
    // Also include huggingface if token is set
    if (this.huggingFaceToken) {
      providers.push({ name: 'huggingface', ...this.providerStatus.get('huggingface') });
    }
    return providers;
  }

  /**
   * HuggingFace Inference API request
   * Used for: Hindi NLP, text classification, embeddings, specialized models
   * @param {string} model - HuggingFace model ID e.g. 'ai4bharat/indic-bert'
   * @param {Object} payload - Request body
   */
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

  /**
   * Convenience method used by MasterAIOrchestrator and agents
   * that call aiProviderManager.generateResponse(prompt, options) directly.
   * Routes through the normal createChatCompletion failover logic.
   */
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

  /**
   * Create completion with robust auto failover logic
   */
  async createChatCompletion(agentName, options = {}) {
    const preferred = this.getEffectiveProvider(agentName);
    
    // Sort priority
    const priority = [preferred, 'groq', 'gemini', 'openai', 'deepseek', 'qwen', 'local_ollama'];
    const providersToTry = [...new Set(priority)].filter(name => this.providers.has(name));

    let lastError = null;
    for (const provider of providersToTry) {
      const status = this.providerStatus.get(provider);
      if (status && !status.healthy) {
        continue; // Skip temporarily offline providers
      }

      const client = this.providers.get(provider);
      const model = this.getModel(agentName, provider);
      const startTime = Date.now();

      try {
        console.log(`[HASA Router] Trying provider: ${provider} with model: ${model}`);
        
        const requestBody = {
          model,
          ...options,
        };

        if (options.json === true || options.responseFormat === 'json') {
          requestBody.response_format = { type: 'json_object' };
          delete requestBody.json;
          delete requestBody.responseFormat;
        }

        const response = await client.chat.completions.create(requestBody);
        
        // Update provider health latency
        const latency = Date.now() - startTime;
        this.providerStatus.set(provider, { healthy: true, latency, failures: 0 });

        // Calculate Cost (Rough estimation)
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

        // Record failure
        const currentFailures = (status?.failures || 0) + 1;
        this.providerStatus.set(provider, {
          healthy: currentFailures < 3, // Disable if it fails 3 times consecutively
          latency: 9999,
          failures: currentFailures
        });
      }
    }

    throw lastError || new Error('All AI providers failed in Sovereign router');
  }
}

const aiProviderManager = new AIProviderManager();

module.exports = { AIProviderManager, aiProviderManager };
