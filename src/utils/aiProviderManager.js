/**
 * AIProviderManager - Manages multiple AI providers for different agents
 *
 * Supports:
 *   - Groq (Llama 3.3 70B) - Fast, FREE
 *   - Gemini Flash 2.0 - High quality, paid
 *   - OpenAI GPT-4 - Best reasoning, expensive
 *   - OpenAI GPT-3.5 - Balanced, cheap
 *   - Claude (Anthropic) - Advanced reasoning, paid
 *
 * Each agent can specify its preferred provider in config
 */

const OpenAI = require('openai');

class AIProviderManager {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'groq'; // Free & fast
    this._initializeProviders();
  }

  _initializeProviders() {
    // Initialize Groq (FREE - Primary)
    if (process.env.GROQ_API_KEY) {
      try {
        this.providers.set('groq', new OpenAI({
          apiKey: process.env.GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1'
        }));
        console.log('✅ AIProvider: Groq (Llama 3.3 70B) - FREE');
      } catch (e) {
        console.error('❌ Failed to init Groq:', e.message);
      }
    }

    // Initialize Gemini (Paid - High Quality)
    if (process.env.GEMINI_API_KEY) {
      try {
        this.providers.set('gemini', new OpenAI({
          apiKey: process.env.GEMINI_API_KEY,
          baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
        }));
        console.log('✅ AIProvider: Gemini Flash 2.0 - PAID');
      } catch (e) {
        console.error('❌ Failed to init Gemini:', e.message);
      }
    }

    // Initialize OpenAI (Paid - Expensive)
    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.providers.set('openai', this.openai);
        console.log('✅ AIProvider: OpenAI (GPT) - PAID');
      } catch (e) {
        console.error('❌ Failed to init OpenAI:', e.message);
      }
    }



    if (this.providers.size === 0) {
      console.warn('⚠️ AIProvider: NO AI PROVIDERS! Set at least one API key.');
    } else {
      console.log(`📊 AIProvider: ${this.providers.size} provider(s) ready`);
      console.log('   Priority order: Groq (free) → Gemini (paid) → OpenAI (expensive)');
    }
  }

  /**
   * Get AI client for specific agent
   * @param {string} agentName - Which agent is requesting
   * @param {string} preferredProvider - Optional override ('groq', 'gemini', 'openai')
   * @returns {OpenAI|null} - OpenAI-compatible client
   */
  getClient(agentName, preferredProvider = null) {
    // Agent-specific provider preferences (configurable via env too)
    const agentPrefs = {
      'DocumentAIAgent': process.env.AI_DOCUMENT_PROVIDER || 'groq',
      'LegalDraftAgent': process.env.AI_LEGAL_PROVIDER || 'gemini',
      'JobSearchAgent': process.env.AI_JOB_PROVIDER || 'openai',
      'MasterAgent': process.env.AI_CHAT_PROVIDER || 'groq',
      'default': 'groq'
    };

    const effectiveProvider = preferredProvider || agentPrefs[agentName] || agentPrefs.default;

    // Check if requested provider available
    if (this.providers.has(effectiveProvider)) {
      return this.providers.get(effectiveProvider);
    }

    // Fallback: Return any available provider
    console.warn(`[AIProvider] Provider '${effectiveProvider}' not available for ${agentName}. Using fallback.`);
    return this.providers.values().next().value || null;
  }

  /**
   * Get model name for agent + provider combination
   */
  getModel(agentName, provider = null) {
    const modelMap = {
      groq: {
        'DocumentAIAgent': 'llama-3.3-70b-versatile',
        'LegalDraftAgent': 'llama-3.3-70b-versatile',
        'JobSearchAgent': 'llama-3.3-70b-versatile',
        'UIBuilderAgent': 'llama-3.3-70b-versatile',
        'default': 'llama-3.3-70b-versatile'
      },
      gemini: {
        'LegalDraftAgent': 'gemini-2.0-flash',
        'DocumentAIAgent': 'gemini-2.0-flash-lite',
        'JobSearchAgent': 'gemini-2.0-flash',
        'UIBuilderAgent': 'gemini-2.0-flash',
        'default': 'gemini-2.0-flash'
      },
      openai: {
        'JobSearchAgent': 'gpt-4-turbo-preview',
        'DocumentAIAgent': 'gpt-3.5-turbo',
        'LegalDraftAgent': 'gpt-4',
        'UIBuilderAgent': 'gpt-4',
        'default': 'gpt-3.5-turbo'
      }
    };

    const effectiveProvider = provider || this.getEffectiveProvider(agentName);
    const agentModels = modelMap[effectiveProvider];
    return agentModels[agentName] || agentModels.default;
  }

  getEffectiveProvider(agentName) {
    const preferences = {
      'DocumentAIAgent': 'gemini',
      'LegalDraftAgent': 'gemini',
      'JobSearchAgent': 'openai',
      'UIBuilderAgent': 'groq',
      'default': 'groq'
    };
    return preferences[agentName] || preferences.default;
  }

  /**
   * Check if a provider is available
   */
  hasProvider(name) {
    return this.providers.has(name);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }

  /**
    * Create chat completion with automatic provider selection
    */
  async createChatCompletion(agentName, options = {}) {
    const provider = this.getEffectiveProvider(agentName);
    const client = this.getClient(agentName);
    if (!client) {
      throw new Error(`No AI provider available for ${agentName}`);
    }

    const model = this.getModel(agentName, provider);

    try {
      // OpenAI-compatible providers
      const response = await client.chat.completions.create({
        model,
        ...options,
        // Enforce JSON mode for structured outputs
        response_format: { type: 'json_object' }
      });

      return response;
    } catch (error) {
      console.error(`[AIProvider] Error for ${agentName}:`, error.message);
      throw error;
    }
  }
}

// Singleton instance
const aiProviderManager = new AIProviderManager();

module.exports = { AIProviderManager, aiProviderManager };
