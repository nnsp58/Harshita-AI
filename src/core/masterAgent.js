/**
 * MasterAgent - Central intelligent controller for Harshita AI Platform
 */

const axios = require('axios');
const { SubscriptionManager } = require('./subscriptionManager');
const { SelfEvolutionAgent } = require('./selfEvolutionAgent');
const { LandRecordAgent } = require('../agents/landRecordAgent');
const { RationCardAgent } = require('../agents/rationCardAgent');
const { TicketBookingAgent } = require('../agents/ticketBookingAgent');
const { CSCLoginAgent } = require('../agents/cscLoginAgent');
const { LegalDraftAgent } = require('../agents/legalDraftAgent');
const { DocumentAIAgent } = require('../agents/documentAIAgent');
const { ValidatorAgent } = require('../agents/validatorAgent');
const { NotifierAgent } = require('../agents/notifierAgent');
const { FileProcessorAgent } = require('../agents/fileProcessorAgent');
const { JobSearchAgent } = require('../agents/jobSearchAgent');
const { runBrowserTask } = require('../agents/browserAgent');
const { LearningCollector } = require('./learningCollector');
const { KnowledgeStore } = require('./knowledgeStore');
const { WebLearningAgent } = require('../agents/webLearningAgent');
const { EligibilityAgent } = require('../agents/eligibilityAgent');
const { UIBuilderAgent } = require('../agents/uiBuilderAgent');
const { LanguageEngine } = require('./languageEngine');

// Intent keywords mapping
const INTENT_KEYWORDS = {
  land: ['land', 'bhulekh', 'khatauni', 'zameen', 'plot', 'map'],
  ration: ['ration', 'food card'],
  ticket: ['ticket', 'railway', 'train', 'irctc', 'pnr'],
  login: ['login', 'csc', 'edistrict'],
  legal: ['legal', 'affidavit', 'sapath', 'draft', 'noc'],
  document: ['document', 'pdf', 'extract', 'aadhaar', 'marksheet'],
  file: ['file', 'compress', 'resize'],
  validate: ['validate', 'verify'],
  notify: ['notify', 'alert'],
  jobsearch: ['job', 'jobs', 'naukri', 'sarkari', 'government job', 'employment', 'vacancy', 'vacancies', 'recruitment', 'career'],
  eligibility: ['eligibility', 'check', 'eligible', 'age', 'qualification'],
  uibuilder: ['build', 'create', 'design', 'generate', 'page', 'website', 'dashboard', 'landing', 'component', 'code', 'html', 'css']
};

class BrowserAgentWrapper {
  constructor(master) {
    this.name = 'BrowserAgent';
    this.master = master;
  }
  async execute(taskData) {
    return await runBrowserTask(
      taskData.formUrl || 'https://www.w3schools.com/html/html_forms.asp', 
      taskData.userData,
      {
        onLog: (msg) => this.master._log(msg.message),
        onStatusUpdate: (status) => this.master._updateStatus(status.name, status.status)
      }
    );
  }
}

class MasterAgent {
  constructor(options = {}) {
    this.options = options;
    this.subscriptionManager = new SubscriptionManager();
    this.agents = {
      land: new LandRecordAgent(),
      ration: new RationCardAgent(),
      ticket: new TicketBookingAgent(),
      cscLogin: new CSCLoginAgent(),
      legal: new LegalDraftAgent(),
      document: new DocumentAIAgent(),
      validator: new ValidatorAgent(),
      notifier: new NotifierAgent(),
      fileProcessor: new FileProcessorAgent(),
      jobsearch: new JobSearchAgent(),
      browser: new BrowserAgentWrapper(this),
      eligibility: new EligibilityAgent(),
      uibuilder: new UIBuilderAgent(),
      evolution: new SelfEvolutionAgent()
    };
    this.sessions = new Map();
    this.chatHistory = new Map();
    this.learningCollector = new LearningCollector();
    this.knowledgeStore = new KnowledgeStore();
    this.webLearningAgent = new WebLearningAgent();
    // Multi-language + Voice I/O engine
    this.languageEngine = new LanguageEngine();

    setInterval(() => {
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for (const [userId, session] of this.sessions) {
        if (session.lastAccess && session.lastAccess < cutoff) {
          this.sessions.delete(userId);
        }
      }
    }, 3600000);
    this._log('🚀 Harshita AI Platform initialized successfully');
  }

  _log(msg) {
    console.log(msg);
    if (this.options.onLog) this.options.onLog({ type: 'ai', message: msg });
  }

  _updateStatus(taskName, status) {
    if (this.options.onStatusUpdate) this.options.onStatusUpdate({ name: taskName, status });
  }

  _suggest(suggestion) {
    if (this.options.onSupervisorSuggestion) this.options.onSupervisorSuggestion(suggestion);
  }

  async executeTask(message, userId = 'default_user') {
    this._updateStatus('Analyzing Intent', 'In Progress');
    const result = await this.processMessage(userId, message);
    this._updateStatus('Task Completed', result.success ? 'Success' : 'Failed');
    return result.message || 'Task finished';
  }

  async processMessage(userId, message, audioPath = null) {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, { state: 'idle', context: {}, currentTask: null, waitingForInput: null });
    }
    const session = this.sessions.get(userId);

    // Multi-language + Voice: Process input (voice → text, detect language)
    let processedText = message;
    let inputLang = 'en';
    if (audioPath || message) {
      const inputResult = await this.languageEngine.processInput(userId, message, audioPath);
      if (inputResult.success) {
        processedText = inputResult.inputText;
        inputLang = inputResult.inputLang;
        if (inputLang !== 'en' && inputLang !== 'hi' && inputLang !== 'hi-Latn') {
          this._log(`🌐 Detected language: ${inputResult.inputLangName} — auto-translating`);
        }
      }
    }

    this._addToHistory(userId, 'user', processedText);

    if (this._isCommand(processedText)) return await this._handleCommand(userId, processedText);
    if (session.waitingForInput) return await this._handleWaitingInput(userId, processedText);

    const intent = this._detectIntent(processedText);
    const accessResult = this.subscriptionManager.checkAccess(userId, intent);
    if (!accessResult.allowed) return { type: 'access_denied', ...accessResult };

    try {
      const startTime = Date.now();
      const result = await this._routeToAgent(userId, intent, processedText, session);
      const executionTime = Date.now() - startTime;
      const agentUsed = this.agents[intent]?.name || 'unknown';
      await this.learningCollector.collect({ userId, userInput: processedText, taskResult: result, agentUsed, executionTime, success: result.success, intent, context: session.context });
      this.subscriptionManager.recordUsage(userId);
      
      // Multi-language: Wrap response in user's detected language
      if (result.message && inputLang !== 'en' && inputLang !== 'hi' && inputLang !== 'hi-Latn') {
        const wrapped = await this.languageEngine.wrapResponse(userId, result.message);
        result.message = wrapped.text;
        result.responseLang = wrapped.lang;
      }

      // Autonomous Evolution Trigger
      setTimeout(async () => {
          const evoResult = await this.agents.evolution.analyzeAndEvolve();
          if (evoResult.evolved) {
              this._log(`🌟 [EVOLUTION COMPLETE] Harshita AI has autonomously upgraded with: ${evoResult.name} Capability`);
          }
      }, 1000);

      return result;
    } catch (error) {
      return { type: 'error', success: false, message: error.message };
    }
  }

  _detectIntent(message) {
    const msgLower = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some(kw => msgLower.includes(kw))) return intent;
    }
    return 'browser';
  }

  _isCommand(message) {
    return ['help', 'plan', 'status', 'subscribe', 'upgrade', 'renew', 'clear'].some(c => message.toLowerCase().startsWith(c));
  }

  async _handleCommand(userId, message) {
    // Basic command handling implementation
    return { type: 'info', message: 'Command processed' };
  }

  async _handleWaitingInput(userId, message) {
    const session = this.sessions.get(userId);
    const field = session.waitingForInput;
    session.context[field] = message;
    session.waitingForInput = null;
    return await this._routeToAgent(userId, session.currentTask.intent, message, session, { ...session.currentTask.taskData, ...session.context });
  }

  async _routeToAgent(userId, intent, message, session, providedTaskData = null) {
    const agent = this.agents[intent];
    const taskData = providedTaskData || this._parseTaskData(intent, message, session.context);
    const requiredFields = this._getRequiredFields(intent, taskData);

    if (requiredFields.length > 0) {
      session.waitingForInput = requiredFields[0];
      session.currentTask = { intent, taskData };
      return { type: 'collecting_input', field: requiredFields[0], message: `Please provide ${requiredFields[0]}` };
    }

    const result = await agent.execute(taskData);
    if (result.requiresManualStep) {
      session.state = 'manual_step';
      session.currentTask = { intent, taskData, result };
      return { type: 'manual_required', ...result };
    }
    return { type: 'result', success: result.success, message: result.message, data: result };
  }

  _parseTaskData(intent, message, context) {
    // Simplified parsing for brevity, should be expanded in real use
    return { ...context };
  }

  _getRequiredFields(intent, taskData) {
    // Placeholder for required fields logic
    return [];
  }

  _addToHistory(userId, role, content) {
    if (!this.chatHistory.has(userId)) this.chatHistory.set(userId, []);
    this.chatHistory.get(userId).push({ role, content, timestamp: new Date() });
  }

  async cleanup() {
    for (const agent of Object.values(this.agents)) {
      if (agent.cleanup) await agent.cleanup();
    }
  }
}

module.exports = { MasterAgent, INTENT_KEYWORDS };