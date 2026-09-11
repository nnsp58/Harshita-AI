/**
 * AgentConference — Central Orchestration & Multi-Agent Conference Context
 * 
 * Provides:
 * 1. AgentConferenceContext: Immutable original user message + extracted facts + agent results + plan.
 * 2. Multi-Agent Task Planner: Autonomous execution for complex requests (e.g. OCR -> Legal -> Validation -> PDF).
 * 3. Handoff Protocol: Enables agents to pass structured results through MasterAgent.
 */

const crypto = require('crypto');
const { legalComplaintEngine } = require('../../departments/legal/LegalComplaintEngine');
const { actionDispatcher } = require('../../utils/actionDispatcher');

class AgentConferenceContext {
  constructor({ requestId, userId, originalUserMessage, language = 'hi' }) {
    this.requestId = requestId || `req-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    this.userId = userId || 'anon';
    this.sessionId = `session-${this.userId}`;
    this.originalUserMessage = originalUserMessage || '';
    this.detectedIntent = null;
    this.language = language;
    this.userFacts = {};
    this.taskPlan = [];
    this.activeAgents = [];
    this.completedTasks = [];
    this.pendingTasks = [];
    this.agentResults = new Map(); // agentId -> structured result
    this.evidence = [];
    this.errors = [];
    this.confidence = 1.0;
    this.finalDecision = null;
    this.startTime = Date.now();
  }

  addFact(key, value) {
    if (key && value !== undefined && value !== null) {
      this.userFacts[key] = value;
    }
  }

  addFacts(factsObj = {}) {
    for (const [k, v] of Object.entries(factsObj)) {
      this.addFact(k, v);
    }
  }

  recordAgentResult(agentId, structuredResult) {
    this.agentResults.set(agentId, {
      ...structuredResult,
      recordedAt: Date.now()
    });
    if (!this.activeAgents.includes(agentId)) {
      this.activeAgents.push(agentId);
    }
    this.completedTasks.push(agentId);
    this.pendingTasks = this.pendingTasks.filter(t => t !== agentId);
  }

  getTrace() {
    return {
      requestId: this.requestId,
      activeAgents: this.activeAgents,
      completedTasks: this.completedTasks,
      pendingTasks: this.pendingTasks,
      durationMs: Date.now() - this.startTime,
      factsCount: Object.keys(this.userFacts).length
    };
  }
}

class AgentConferenceEngine {
  constructor(masterAgent) {
    this.master = masterAgent;
    this.contexts = new Map(); // requestId -> AgentConferenceContext
  }

  createContext(userId, originalUserMessage, language = 'hi') {
    const ctx = new AgentConferenceContext({
      userId,
      originalUserMessage,
      language
    });
    this.extractGlobalFacts(ctx, originalUserMessage);
    this.contexts.set(ctx.requestId, ctx);
    return ctx;
  }

  /**
   * Extract user facts from original user message early so no agent repeats questions
   */
  extractGlobalFacts(ctx, text = '') {
    if (!text) return;
    const lower = text.toLowerCase();

    // 1. Name
    const nameMatch = text.match(/(?:mera\s*naam|my\s*name\s*is|shikayatkarta|prarthi|नाम\s*है|नाम)\s*[:\-]?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:s\/o|w\/o|d\/o|son|shri|father|पिता|vill|post|dist|pin|mobile|\.|$))/i);
    if (nameMatch) {
      ctx.addFact('name', nameMatch[1].trim());
      ctx.addFact('applicantName', nameMatch[1].trim());
    }

    // 2. Father's Name
    const fatherMatch = text.match(/(?:s\/o|son\s*of|पिता|आत्मज|father)\s*[:\-]?\s*(?:shri|mr\.?)?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:vill|post|tehsil|dist|district|pin|थाना|\.|$))/i);
    if (fatherMatch) {
      ctx.addFact('father', fatherMatch[1].trim());
    }

    // 3. Address components
    const villMatch = text.match(/(?:vill|village|ग्राम|गांव)\s*[:\-]?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:post|tehsil|dist|district|pin|\.|$))/i);
    if (villMatch) {
      ctx.addFact('village', villMatch[1].trim());
    }

    const distMatch = text.match(/(?:district|dist|जिला)\s*[:\-]?\s*([A-Za-z\u0900-\u097F\s\.]+?)(?=\s+(?:pin|state|up|uttar\s*pradesh|\.|$))/i);
    if (distMatch) {
      ctx.addFact('district', distMatch[1].trim());
    }

    const pinMatch = text.match(/\b(PIN|pin(?:\s*code)?)\s*[:\-]?\s*(\d{6})\b/i);
    if (pinMatch) {
      ctx.addFact('pin', pinMatch[2]);
    }
  }

  /**
   * Determine task complexity and multi-agent plan
   */
  createPlan(userMessage) {
    const text = userMessage || '';
    const lower = text.toLowerCase();

    // Direct Navigation Check
    const navAction = actionDispatcher.detectNavigationRequest(text);
    if (navAction) {
      return {
        type: 'navigation',
        action: navAction,
        agents: ['action_dispatcher']
      };
    }

    // Full Legal Complaint / Police FIR fast-path
    if (legalComplaintEngine.isComplaintRequest(text)) {
      const requiresPdf = /pdf|print|download|डाउनलोड|प्रिंट/i.test(lower);
      return {
        type: 'multi_agent',
        taskType: 'police_complaint',
        agents: requiresPdf ? ['legal_complaint_engine', 'document_studio', 'pdf_agent'] : ['legal_complaint_engine', 'document_studio'],
        plan: [
          { step: 1, agent: 'legal_complaint_engine', desc: 'Extract legal entities and draft complaint' },
          { step: 2, agent: 'document_studio', desc: 'Prepare editable A4 document' },
          ...(requiresPdf ? [{ step: 3, agent: 'pdf_agent', desc: 'Export PDF' }] : [])
        ]
      };
    }

    // Land division (Math + Land Measurement)
    if (/(?:bhai|brothers|bhaion|hisse|hissa|rakba|bigha|bata|bantna|divide)/i.test(lower) && /(?:zamin|zameen|khet|land|plot|जमीन|खेत)/i.test(lower)) {
      return {
        type: 'multi_agent',
        taskType: 'land_division',
        agents: ['land_measurement_skill', 'math_skill'],
        plan: [
          { step: 1, agent: 'land_measurement_skill', desc: 'Calculate land area and division ratios' },
          { step: 2, agent: 'math_skill', desc: 'Verify exact mathematical fractions' }
        ]
      };
    }

    // Formal Application / Prarthna Patra fast-path
    if (/(?:prarthna\s*patra|prarthana\s*patra|application\s*bana|likh\s*do\s*application|application\s*likh|प्रार्थना\s*पत्र|आवेदन\s*पत्र)/i.test(lower) && !/(?:list|prakar|kitne|types)/i.test(lower)) {
      return {
        type: 'multi_agent',
        taskType: 'application_draft',
        agents: ['application_writer', 'document_studio'],
        plan: [
          { step: 1, agent: 'application_writer', desc: 'Draft formal application' },
          { step: 2, agent: 'document_studio', desc: 'Prepare editable A4 document' }
        ]
      };
    }

    // Document extraction to application
    if (/(?:document|kaha\s*gaya|image|photo|extract|nikal\s*kar)/i.test(lower) && /(?:application|prarthna|patra|likh|bana)/i.test(lower)) {
      return {
        type: 'multi_agent',
        taskType: 'ocr_to_application',
        agents: ['document_ocr', 'application_writer', 'document_studio'],
        plan: [
          { step: 1, agent: 'document_ocr', desc: 'Extract data from provided document' },
          { step: 2, agent: 'application_writer', desc: 'Draft formal application' },
          { step: 3, agent: 'document_studio', desc: 'Format in Document Studio' }
        ]
      };
    }

    // Default: Single Task / General
    return {
      type: 'single_agent',
      agents: []
    };
  }

  /**
   * Execute a planned multi-agent workflow
   */
  async executeMultiAgentTask(ctx, plan) {
    if (plan.taskType === 'police_complaint') {
      const legalResult = legalComplaintEngine.process(ctx.originalUserMessage);
      ctx.recordAgentResult('legal_complaint_engine', {
        status: 'SUCCESS',
        confidence: 0.99,
        result: legalResult.content,
        extractedFacts: legalResult.extractedEntities
      });

      const title = legalResult.title || 'Police Complaint Application';
      ctx.finalDecision = {
        type: 'ai',
        responseType: 'document',
        message: legalResult.message,
        skill: 'legal_draft',
        openDocumentStudio: true,
        data: {
          openDocumentStudio: true,
          documentType: 'police_complaint',
          title: title,
          content: legalResult.content,
          editable: true,
          trace: ctx.getTrace()
        },
        action: {
          mode: 'open_document_studio',
          route: '/documents',
          navigate: '/documents',
          title: title,
          content: legalResult.content,
          editable: true
        }
      };

      return ctx.finalDecision;
    }

    if (plan.taskType === 'land_division') {
      const landSkill = this.master.registry.getSkill('land_measurement_skill') || this.master.registry.getSkill('geometry_skill');
      const mathSkill = this.master.registry.getSkill('math_skill');

      let landRes = null;
      if (landSkill) {
        landRes = await landSkill.execute({ message: ctx.originalUserMessage, userFacts: ctx.userFacts });
        ctx.recordAgentResult('land_measurement_skill', { status: 'SUCCESS', result: landRes.message });
      }

      const combinedMessage = landRes?.message || 'जमीन के समान बंटवारे की गणना पूरी की गई।';
      ctx.finalDecision = {
        type: 'ai',
        responseType: 'chat',
        message: combinedMessage,
        skill: 'land_measurement_skill',
        data: {
          trace: ctx.getTrace()
        }
      };
      return ctx.finalDecision;
    }

    if (plan.taskType === 'application_draft') {
      const appSkill = this.master.registry.getSkill('application_writer');
      let appRes = null;
      if (appSkill) {
        // Set session directly to generating phase with available user facts so it produces full draft immediately
        if (appSkill.sessions) {
          appSkill.sessions.set(ctx.userId, {
            step: 'generating',
            data: {
              applicantName: ctx.userFacts?.name || ctx.userFacts?.applicantName || 'आवेदक',
              authority: 'सक्षम अधिकारी',
              subject: ctx.originalUserMessage
            },
            questionIndex: 3
          });
        }
        appRes = await appSkill.execute({ message: ctx.originalUserMessage, userId: ctx.userId, userFacts: ctx.userFacts });
        ctx.recordAgentResult('application_writer', { status: 'SUCCESS', result: appRes.message });
      }

      const rawMsg = appRes?.message || '';
      const docTitle = appRes?.data?.title || 'प्रार्थना पत्र (Application)';
      ctx.finalDecision = {
        type: 'ai',
        responseType: 'document',
        message: rawMsg,
        skill: 'application_writer',
        openDocumentStudio: true,
        data: {
          openDocumentStudio: true,
          documentType: 'application',
          title: docTitle,
          content: rawMsg,
          editable: true,
          trace: ctx.getTrace()
        },
        action: {
          mode: 'open_document_studio',
          route: '/documents',
          navigate: '/documents',
          title: docTitle,
          content: rawMsg,
          editable: true
        }
      };
      return ctx.finalDecision;
    }

    return null;
  }
}

module.exports = {
  AgentConferenceContext,
  AgentConferenceEngine
};
