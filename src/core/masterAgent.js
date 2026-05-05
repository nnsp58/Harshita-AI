/**
 * MasterAgent - Central intelligent controller for n-dizi CSC Automation System
 * 
 * Responsibilities:
 *   - Intent detection from user messages
 *   - Subscription checking and access control
 *   - Task routing to appropriate sub-agents
 *   - Multi-agent orchestration
 *   - Error handling and user guidance
 */

const axios = require('axios');
const { SubscriptionManager } = require('./subscriptionManager');
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

// Intent keywords mapping - shortened for easier matching
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
  jobsearch: ['job', 'jobs', 'naukri', 'sarkari', 'government job', 'employment', 'vacancy', 'vacancies', 'recruitment', 'career']
};

class BrowserAgentWrapper {
  constructor() {
    this.name = 'BrowserAgent';
  }
  async execute(taskData) {
    return await runBrowserTask(taskData.formUrl || 'https://www.w3schools.com/html/html_forms.asp', taskData.userData);
  }
}

class MasterAgent {
  constructor() {
    // Initialize subscription manager
    this.subscriptionManager = new SubscriptionManager();

    // Initialize all sub-agents
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
      browser: new BrowserAgentWrapper()
    };

    // Active sessions (userId -> session data)
    this.sessions = new Map();

    // Chat history per user
    this.chatHistory = new Map();

    console.log('🎯 MasterAgent initialized with all sub-agents');
  }

  /**
   * Process user message - main entry point
   */
  async processMessage(userId, message) {
    console.log(`\n[MasterAgent] Processing message from user ${userId}: ${message}`);

    // Initialize session if needed
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        state: 'idle',
        context: {},
        currentTask: null,
        waitingForInput: null
      });
    }

    const session = this.sessions.get(userId);

    // Add to chat history
    this._addToHistory(userId, 'user', message);

    // Handle special commands
    if (this._isCommand(message)) {
      return await this._handleCommand(userId, message);
    }

    // Check if waiting for specific input
    if (session.waitingForInput) {
      return await this._handleWaitingInput(userId, message);
    }

    // Detect intent
    const intent = this._detectIntent(message);
    console.log(`[MasterAgent] Detected intent: ${intent}`);

    // Check subscription access
    const accessResult = this.subscriptionManager.checkAccess(userId, intent);
    if (!accessResult.allowed) {
      return {
        type: 'access_denied',
        ...accessResult
      };
    }

     // Route to appropriate agent
     try {
       const result = await this._routeToAgent(userId, intent, message, session);
       this.subscriptionManager.recordUsage(userId);
       return result;
     } catch (error) {
       // Provide user-friendly messages for known errors
       let friendlyMessage = error.message;
       if (error.message.includes('Cannot read image') || error.message.includes('model does not support image input')) {
         friendlyMessage = 'I cannot process images directly. Please upload your documents using the document upload feature, or describe the content in text.';
       }
       return {
         type: 'error',
         success: false,
         message: friendlyMessage
       };
     }
  }

  /**
   * Detect intent from user message
   */
  _detectIntent(message) {
    const msgLower = message.toLowerCase();

    // Special case: if message contains job keywords + agency names → force jobsearch
    const jobKeywords = ['job', 'jobs', 'naukri', 'sarkari', 'government job', 'employment', 'vacancy', 'vacancies', 'recruitment', 'career'];
    const agencyTerms = ['ssc', 'staff selection commission', 'railway', 'rrb', 'rail', 'bank', 'ibps', 'sbi', 'banking', 'bank po', 'army', 'navy', 'air force', 'defence', 'coast guard', 'army clerk', 'navy ssr', 'police', 'bsf', 'crpf', 'itbp', 'ssb', 'constable', 'postal', 'india post', 'post office', 'gds', 'post'];
    const hasJobTerm = jobKeywords.some(kw => msgLower.includes(kw));
    const hasAgencyTerm = agencyTerms.some(at => msgLower.includes(at));
    if (hasJobTerm && hasAgencyTerm) {
      return 'jobsearch';
    }

    let bestMatch = null;
    let maxScore = 0;

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (msgLower.includes(keyword)) {
          score += keyword.length;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = intent;
      }
    }

    // Default to browser agent for generic form filling
    return bestMatch || 'browser';
  }

  /**
   * Check if message is a command
   */
  _isCommand(message) {
    const commands = ['help', 'plan', 'status', 'subscribe', 'upgrade', 'renew', 'exit', 'quit', 'clear'];
    return commands.some(c => message.toLowerCase().startsWith(c));
  }

  /**
   * Handle special commands
   */
  async _handleCommand(userId, message) {
    const parts = message.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      case 'help':
        return this._showHelp();

      case 'plan':
      case 'plans':
        return {
          type: 'info',
          message: this.subscriptionManager.getPlansInfo()
        };

      case 'status':
        return {
          type: 'info',
          message: this.subscriptionManager.getUserStatus(userId)
        };

      case 'subscribe':
        return this._handleSubscribe(userId, args);

      case 'upgrade':
        return this._handleUpgrade(userId, args);

      case 'renew':
        return this._handleRenew(userId, args);

      case 'clear':
        this.chatHistory.delete(userId);
        return { type: 'info', message: 'Chat history cleared.' };

      default:
        return {
          type: 'error',
          message: `Unknown command: ${cmd}. Type 'help' for available commands.`
        };
    }
  }

  /**
   * Handle subscription commands
   */
  _handleSubscribe(userId, args) {
    // Parse args: "plan duration" or just "plan"
    const parts = args.split(' ');
    const plan = parts[0]?.toLowerCase();
    const duration = parts[1]?.toLowerCase() || 'monthly';

    const plans = ['free', 'basic', 'standard', 'pro'];
    const durations = ['monthly', 'quarterly', 'halfYearly', 'yearly', 'twoYearly', 'fourYearly'];

    if (!plan || !plans.includes(plan)) {
      return {
        type: 'info',
        message: `Please specify a valid plan: free, basic, standard, or pro.\nExample: subscribe free\n       subscribe pro yearly`
      };
    }

    if (plan === 'free') {
      const result = this.subscriptionManager.subscribe(userId, plan, null);
      if (result.success) {
        return {
          type: 'success',
          message: result.message
        };
      }
    }

    if (!durations.includes(duration)) {
      return {
        type: 'info',
        message: `Invalid duration. Available: ${durations.join(', ')}`
      };
    }

    const result = this.subscriptionManager.subscribe(userId, plan, duration);

    if (result.success) {
      return {
        type: 'success',
        message: `\n✅ ${result.message}\n\nTotal: Rs.${result.subscription.totalPrice}\nValid until: ${result.subscription.endDate.toLocaleDateString()}\n\nWelcome to n-dizi CSC Automation! 🎉\n\nType 'help' to see available services.`
      };
    } else {
      return {
        type: 'error',
        message: result.message
      };
    }
  }

  /**
   * Handle upgrade command
   */
  _handleUpgrade(userId, args) {
    return this._handleSubscribe(userId, args);
  }

  /**
   * Handle renew command
   */
  _handleRenew(userId, args) {
    const sub = this.subscriptionManager.getSubscription(userId);
    if (!sub) {
      return {
        type: 'error',
        message: 'No active subscription to renew. Type "plan" to see available plans.'
      };
    }

    const duration = args?.toLowerCase() || 'monthly';
    return this._handleSubscribe(userId, `${sub.plan} ${duration}`);
  }

  /**
   * Handle input when waiting for specific data
   */
  async _handleWaitingInput(userId, message) {
    const session = this.sessions.get(userId);
    const { waitingForInput, currentTask } = session;

    if (!currentTask || !currentTask.intent) {
      return {
        type: 'error',
        message: 'No active task. Please start a new request.'
      };
    }

    // Store the collected input in context
    session.context[waitingForInput] = message;
    session.waitingForInput = null;
    session.currentTask = null;
    session.state = 'idle';

    // Merge context into taskData for next execution
    const taskData = { ...currentTask.taskData, ...session.context };

    // Execute the task with collected input
    const result = await this._routeToAgent(userId, currentTask.intent, message, session, taskData);

    return result;
  }

  /**
   * Route message to appropriate sub-agent
   */
  async _routeToAgent(userId, intent, message, session, providedTaskData = null) {
    const agent = this.agents[intent];
    if (!agent) {
      return {
        type: 'error',
        message: `No agent available for intent: ${intent}`
      };
    }

    // Use provided taskData or parse from message
    const taskData = providedTaskData || this._parseTaskData(intent, message, session.context);

    // Check if we need more input
    const requiredFields = this._getRequiredFields(intent, taskData);
    if (requiredFields.length > 0) {
      session.waitingForInput = requiredFields[0];
      session.currentTask = { intent, taskData };
      session.state = 'waiting_input';

      return {
        type: 'collecting_input',
        field: requiredFields[0],
        message: this._getFieldPrompt(requiredFields[0])
      };
    }

    // Execute task
    console.log(`[MasterAgent] Routing to ${agent.name}...`);
    const result = await agent.execute(taskData);

    // Handle result
    if (result.requiresManualStep) {
      session.state = 'manual_step';
      session.currentTask = { intent, taskData, result };

      return {
        type: 'manual_required',
        ...result,
        instruction: this._getManualStepInstruction(result.manualStepReason)
      };
    }

    session.state = 'idle';

    // Call n8n webhook if task successful
    if (result.success) {
      this._callN8nWebhook(userId, intent, result);
    }

    return {
      type: 'result',
      success: result.success,
      message: result.message,
      data: result
    };
  }

  /**
   * Call n8n webhook for workflow automation
   */
  async _callN8nWebhook(userId, intent, result) {
    try {
      // Different webhooks for different intents
      const webhookMap = {
        jobsearch: 'job-search-complete',
        legal: 'legal-draft-complete',
        land: 'land-record-complete',
        document: 'document-process-complete',
        ration: 'ration-card-complete',
        ticket: 'ticket-booking-complete',
        default: 'csc-task-complete'
      };

      const path = webhookMap[intent] || webhookMap.default;
      const webhookUrl = `${process.env.N8N_BASE_URL || 'http://localhost:5678'}/webhook/${path}`;

      await axios.post(webhookUrl, {
        userId,
        intent,
        result,
        timestamp: new Date()
      });
      console.log(`[MasterAgent] n8n webhook triggered for ${intent}: ${path}`);
    } catch (error) {
      console.warn('[MasterAgent] n8n webhook failed:', error.message);
    }
  }

  /**
   * Parse task data from user message
   */
  _parseTaskData(intent, message, context) {
    const msgLower = message.toLowerCase();
    const data = {};

    // Common fields
    const locationMatch = message.match(/(?:in|at|from)\s+([A-Za-z\s]+?)(?:\s+on|\s+for|\s+to|$)/i);
    if (locationMatch) data.location = locationMatch[1].trim();

    // Intent-specific parsing
    switch (intent) {
      case 'land':
        data.action = msgLower.includes('map') ? 'view_map' : 'search_khatauni';
        data.state = this._extractState(msgLower) || 'uttar_pradesh';
        data.searchBy = msgLower.includes('khasra') ? 'khasra' : 
                       msgLower.includes('khata') ? 'khata' : 'name';
        // Don't set searchValue yet - will ask in conversation
        break;

      case 'ration':
        data.action = msgLower.includes('status') ? 'check_status' : 'search';
        data.state = this._extractState(msgLower) || 'uttar_pradesh';
        if (msgLower.match(/\d{10,}/)) {
          data.rationCardNumber = msgLower.match(/\d{10,}/)[0];
        }
        break;

      case 'ticket':
        if (msgLower.includes('pnr')) {
          data.action = 'check_pnr';
          data.pnr = message.match(/\d{10}/)?.[0];
        } else if (msgLower.includes('book') || msgLower.includes('reserve')) {
          data.action = 'book_ticket';
        } else {
          data.action = 'search_trains';
        }
        data.from = this._extractStation(message, 'from');
        data.to = this._extractStation(message, 'to');
        data.date = this._extractDate(message);
        break;

      case 'login':
        data.action = 'login';
        data.portal = msgLower.includes('csc') ? 'csc' :
          msgLower.includes('irctc') ? 'irctc' : 'edistrict_up';
        break;

      case 'legal':
        data.action = msgLower.includes('ai') ? 'ai_draft' : 'draft';
        data.documentType = msgLower.includes('affidavit') ? 'affidavit' :
          msgLower.includes('noc') ? 'noc' :
            msgLower.includes('rent') ? 'rent_agreement' : 'declaration';
        break;

      case 'document':
        data.action = 'process';
        break;

      case 'jobsearch':
        const msgLower = message.toLowerCase();
        // Check for "all" or "list" keywords
        if (/\ball\b|\ball jobs\b|\blist all\b|\bshow all\b/.test(msgLower)) {
          data.action = 'get_all_jobs';
          break;
        }

        // Detect agency/portal names
        const agencyKeywords = {
          ssc: ['ssc', 'staff selection commission'],
          railway: ['railway', 'rrb', 'rail'],
          banking: ['bank', 'ibps', 'sbi', 'banking', 'bank po'],
          defence: ['army', 'navy', 'air force', 'defence', 'coast guard', 'army clerk', 'navy ssr'],
          police: ['police', 'bsf', 'crpf', 'itbp', 'ssb', 'constable'],
          postal: ['postal', 'india post', 'post office', 'gds', 'post']
        };

        let detectedAgency = null;
        for (const [agency, keywords] of Object.entries(agencyKeywords)) {
          if (keywords.some(kw => msgLower.includes(kw))) {
            detectedAgency = agency;
            break;
          }
        }
        if (detectedAgency) {
          data.agency = detectedAgency;
        }

        // Try to extract qualification (whole word match)
        const qualMatch = message.match(/\b(10th|12th|graduate|postgraduate|pg|b\.?a\.?|b\.?sc\.?|b\.?com\.?|b\.?tech\.?|m\.?a\.?|m\.?sc\.?|m\.?com\.?|mba|iti|diploma)\b/i);
        if (qualMatch) {
          data.userQualification = qualMatch[0];
          data.action = 'search_jobs'; // Will use both qualification and agency (if any)
        } else if (msgLower.includes('aadhaar') || msgLower.includes('marksheet') || msgLower.includes('certificate')) {
          data.action = 'search_by_documents';
        } else if (detectedAgency) {
          // Agency mentioned but no qualification → list all jobs in that agency
          data.action = 'filter_by_agency';
        } else {
          // Default: ask for qualification
          data.action = 'search_jobs';
        }
        break;

      default:
        data.action = 'form_fill';
    }

    return data;
  }

  /**
   * Get required fields - use defaults when possible
   */
  _getRequiredFields(intent, taskData) {
    // Define required fields per intent
    const requiredFieldsMap = {
      land: ['state', 'district', 'tehsil', 'village', 'searchBy', 'searchValue'],
      ration: ['rationCardNumber'],
      ticket: ['from', 'to', 'date'],
      legal: ['documentType'],
      document: ['filePath'],
      jobsearch: ['userQualification'], // Needs qualification OR documents
      // Default: none required
      default: []
    };

    // Special case: jobsearch with get_all_jobs or filter_by_agency requires nothing
    if (intent === 'jobsearch' && (taskData.action === 'get_all_jobs' || taskData.action === 'filter_by_agency')) {
      return [];
    }

    const required = requiredFieldsMap[intent] || requiredFieldsMap.default;
    // Filter out fields already present in taskData
    const missing = required.filter(f => !taskData[f] || taskData[f] === '');
    
    // Special case: if jobsearch and documents provided, no need for qualification
    if (intent === 'jobsearch' && taskData.documents) {
      return [];
    }
    
    return missing;
  }

  /**
   * Get prompt for missing field
   */
  _getFieldPrompt(field) {
    const prompts = {
      state: 'Select state: UP, Bihar, MP, or Rajasthan',
      district: 'Enter district name (e.g., Bulandshahr):',
      tehsil: 'Enter tehsil name:',
      village: 'Enter village name:',
      searchBy: 'Search by: Name, Khata, or Khasra?',
      searchValue: 'Enter name/khata number/khasra number:',
      rationCardNumber: 'Enter your ration card number:',
      from: 'Enter departure station:',
      to: 'Enter destination station:',
      date: 'Enter travel date (DD-MM-YYYY):',
      username: 'Enter username:',
      password: 'Enter password:',
      documentType: 'Document type: affidavit, declaration, noc, rent_agreement?',
      filePath: 'Enter file path to process:',
      userQualification: 'Please specify your highest qualification (e.g., 10th pass, 12th pass, graduate, postgraduate, ITI, diploma):'
    };

    return prompts[field] || `Please provide: ${field}`;
  }

  /**
   * Get manual step instruction based on reason
   */
  _getManualStepInstruction(reason) {
    const instructions = {
      captcha: '⚠️ CAPTCHA detected! Please solve the captcha manually, then click Submit/Continue.',
      login: '🔐 Please complete login manually. Enter credentials and solve captcha if shown.',
      payment: '💳 Payment required. Please complete payment manually.',
      selection: '👆 Please select the appropriate option from the portal.',
      form_filling: '📝 Please verify and complete any remaining form fields.',
      verification: '✓ Please verify the displayed information.'
    };

    return instructions[reason] || 'Please complete this step manually.';
  }

  /**
   * Extract state from message
   */
  _extractState(msg) {
    const states = {
      'up': 'uttar_pradesh', 'uttar pradesh': 'uttar_pradesh',
      'bihar': 'bihar',
      'rajasthan': 'rajasthan', 'raj': 'rajasthan',
      'mp': 'madhya_pradesh', 'madhya pradesh': 'madhya_pradesh'
    };

    for (const [key, val] of Object.entries(states)) {
      if (msg.includes(key)) return val;
    }
    return null;
  }

  /**
   * Extract search value (khasra/name)
   */
  _extractSearchValue(message) {
    const khasraMatch = message.match(/khasra\s*[:\s]*([A-Z0-9]+)/i);
    if (khasraMatch) return khasraMatch[1];
    return null;
  }

  /**
   * Extract station name
   */
  _extractStation(message, type) {
    const regex = new RegExp(`${type}\\s+(?:station\\s+)?([A-Za-z]+)`, 'i');
    const match = message.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Extract date from message
   */
  _extractDate(message) {
    const dateMatch = message.match(/(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{2,4})/);
    if (dateMatch) {
      return `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    }
    return null;
  }

  /**
   * Add message to chat history
   */
  _addToHistory(userId, role, content) {
    if (!this.chatHistory.has(userId)) {
      this.chatHistory.set(userId, []);
    }
    this.chatHistory.get(userId).push({ role, content, timestamp: new Date() });

    // Keep only last 50 messages
    const history = this.chatHistory.get(userId);
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * Get chat history
   */
  getChatHistory(userId) {
    return this.chatHistory.get(userId) || [];
  }

  /**
   * Show help
   */
  _showHelp() {
    return {
      type: 'info',
      message: `
╔══════════════════════════════════════════════════════╗
║        N-DIZI CSC AUTOMATION SYSTEM - HELP            ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  COMMANDS:                                           ║
║    plan           - View subscription plans          ║
║    status         - View your subscription status    ║
║    subscribe <plan> [duration] - Subscribe to a plan ║
║    upgrade <plan> - Upgrade your subscription        ║
║    renew          - Renew current subscription      ║
║    clear          - Clear chat history               ║
║    help           - Show this help                   ║
║                                                      ║
║  SERVICES:                                           ║
║    🌍 Land Records  - Bhulekh/Khatauni search        ║
║    🍚 Ration Card  - Status check, new application  ║
║    🎫 Train Ticket - Search, book, PNR status        ║
║    🔐 CSC Login    - CSC/eDistrict portal login      ║
║    📄 Legal Draft  - Affidavit, Declaration, NOC     ║
║    📑 Document AI - Extract data from documents      ║
║    📁 File Process - Compress, resize images         ║
║    ✅ Validation   - Verify user data                ║
║    📢 Notifications - Send alerts and notifications  ║
║                                                      ║
║  EXAMPLES:                                           ║
║    "search land record in UP"                         ║
║    "check ration card status in Delhi"                ║
║    "book train from Lucknow to Delhi on 25-04-2026"  ║
║    "draft affidavit for passport"                    ║
║    "login to CSC portal"                              ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
      `.trim()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    for (const agent of Object.values(this.agents)) {
      if (agent.cleanup) {
        await agent.cleanup();
      }
    }
    console.log('MasterAgent cleanup completed.');
  }
}

module.exports = { MasterAgent, INTENT_KEYWORDS };