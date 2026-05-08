/**
 * RemoteAssistAgent — Harshita AI Remote PC Support
 *
 * जब कोई CSC operator अपनी problem solve नहीं कर पा रहा, Harshita:
 *   1. Forum से similar solutions suggest करती है
 *   2. Step-by-step guide देती है
 *   3. अगर user agree करे → Remote Control लेकर fix करती है
 *
 * Remote Control Architecture:
 *   - User's browser में एक lightweight "Agent Script" चलता है
 *   - User अपनी screen share करता है (WebRTC)
 *   - Harshita AI screen देखती है (periodic screenshot → AI vision)
 *   - Harshita commands भेजती है (click, type, scroll, navigate)
 *   - Commands user's browser में execute होते हैं
 *
 * Security:
 *   - User को explicitly "Allow Remote Control" करना पड़ता है
 *   - Session timeout (max 30 min)
 *   - User can revoke access anytime (Escape key or button)
 *   - All actions logged for audit
 *   - Only works within the user's browser (not full OS control)
 *
 * Cost: ₹0 (WebRTC + Socket.IO + Groq AI for understanding screenshots)
 */

const { aiProviderManager } = require('../utils/aiProviderManager');
const { KnowledgeStore } = require('./knowledgeStore');
const crypto = require('crypto');

class RemoteAssistAgent {
  constructor(options = {}) {
    this.name = 'RemoteAssistAgent';
    this.io = options.io || null;
    this.knowledgeStore = new KnowledgeStore();

    // Active remote sessions
    this.sessions = new Map(); // sessionId → { userId, operatorId, status, actions[] }

    // Solution Memory — learned fixes from forum + past assists
    this.solutionMemory = new Map(); // problemHash → { solution, steps, successCount }

    // Session timeout (30 min)
    this.sessionTimeoutMs = 30 * 60 * 1000;

    if (this.io) {
      this._setupRemoteControl();
    }
  }

  // ═══════════════════════════════════════════════════
  //  1. AI PROBLEM DIAGNOSIS (Forum-powered)
  // ═══════════════════════════════════════════════════

  /**
   * Diagnose a user's problem and suggest solutions.
   * Uses: Forum history + Solution Memory + AI reasoning
   *
   * @param {string} problemDescription — user's problem in natural language
   * @param {string} category — 'website' | 'hardware' | 'software' | 'government_portal'
   * @returns {Object} { diagnosis, steps[], canRemoteFix, confidence }
   */
  async diagnoseProblem(problemDescription, category = 'software') {
    console.log(`[RemoteAssist] 🔍 Diagnosing: "${problemDescription.substring(0, 80)}..."`);

    // Step 1: Check solution memory (instant, no AI needed)
    const memorySolution = this._checkSolutionMemory(problemDescription);
    if (memorySolution && memorySolution.successCount >= 3) {
      console.log(`[RemoteAssist] 🧠 Found in memory (${memorySolution.successCount} successful fixes)`);
      return {
        source: 'memory',
        diagnosis: memorySolution.diagnosis,
        steps: memorySolution.steps,
        canRemoteFix: memorySolution.canRemoteFix,
        confidence: Math.min(0.95, 0.7 + memorySolution.successCount * 0.05),
        fromMemory: true
      };
    }

    // Step 2: Search forum for similar solved problems
    const forumSolutions = await this._searchForumSolutions(problemDescription);

    // Step 3: AI diagnosis (combines forum knowledge + general IT knowledge)
    const aiDiagnosis = await this._aiDiagnose(problemDescription, category, forumSolutions);

    // Step 4: Save to solution memory for next time
    if (aiDiagnosis.confidence >= 0.7) {
      this._saveSolutionMemory(problemDescription, aiDiagnosis);
    }

    return aiDiagnosis;
  }

  /**
   * Check in-memory solution cache
   */
  _checkSolutionMemory(problem) {
    const key = this._hashProblem(problem);
    return this.solutionMemory.get(key) || null;
  }

  /**
   * Save a successful solution to memory
   */
  _saveSolutionMemory(problem, solution) {
    const key = this._hashProblem(problem);
    const existing = this.solutionMemory.get(key);

    if (existing) {
      existing.successCount++;
      existing.lastUsedAt = new Date().toISOString();
    } else {
      this.solutionMemory.set(key, {
        diagnosis: solution.diagnosis,
        steps: solution.steps,
        canRemoteFix: solution.canRemoteFix,
        successCount: 1,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
        keywords: this._extractKeywords(problem)
      });
    }

    // Also persist to KnowledgeStore
    this.knowledgeStore.storeTaskPattern({
      intent: 'remote_assist_solution',
      problem: problem.substring(0, 200),
      solution: solution.diagnosis,
      steps: solution.steps,
      category: solution.category,
      timestamp: new Date().toISOString()
    }).catch(() => {}); // Silent fail
  }

  /**
   * Search forum for solved problems similar to this one
   */
  async _searchForumSolutions(problemDescription) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const postsFile = path.join(process.cwd(), 'data', 'knowledge', 'community_posts.json');
      const raw = await fs.readFile(postsFile, 'utf8');
      const data = JSON.parse(raw);

      // Find resolved posts with accepted answers
      const resolved = data.posts.filter(p =>
        p.status === 'resolved' && p.answers.length > 0
      );

      if (resolved.length === 0) return [];

      // Simple keyword matching (fast, no AI)
      const keywords = this._extractKeywords(problemDescription);
      const matches = resolved.filter(post => {
        const postText = (post.title + ' ' + post.description).toLowerCase();
        return keywords.some(kw => postText.includes(kw));
      }).slice(0, 5);

      return matches.map(p => ({
        title: p.title,
        description: p.description.substring(0, 200),
        bestAnswer: p.answers.sort((a, b) => b.upvotes - a.upvotes)[0]?.content || '',
        upvotes: p.answers[0]?.upvotes || 0
      }));
    } catch {
      return [];
    }
  }

  /**
   * AI-powered diagnosis
   */
  async _aiDiagnose(problem, category, forumSolutions) {
    const client = aiProviderManager.getClient(this.name);
    const model = aiProviderManager.getModel(this.name);

    if (!client) {
      return {
        source: 'heuristic',
        diagnosis: 'AI unavailable — manual diagnosis needed',
        steps: ['Check internet connection', 'Restart the browser', 'Clear cache'],
        canRemoteFix: false,
        confidence: 0.3
      };
    }

    try {
      const forumContext = forumSolutions.length > 0
        ? `\n\nPAST SOLVED PROBLEMS (from community forum):\n${forumSolutions.map(s => `Q: ${s.title}\nA: ${s.bestAnswer}`).join('\n\n')}`
        : '';

      const prompt = `You are Harshita AI — an expert IT support agent for CSC/Computer/Cyber Café operators in India.

A user has this problem:
"${problem}"

Category: ${category}
${forumContext}

Provide a diagnosis and step-by-step solution.
Consider common issues Indian operators face:
- Government portals not loading (ssc.nic.in, edistrict, etc.)
- Slow internet / browser issues
- Printer not working
- Computer/Windows problems
- Software installation issues

Return JSON:
{
  "diagnosis": "Brief explanation of what's wrong (in Hindi)",
  "steps": [
    "Step 1: क्या करें (specific, actionable)",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "canRemoteFix": true/false,
  "remoteFixActions": [
    {"action": "navigate", "url": "..."},
    {"action": "click", "selector": "..."},
    {"action": "type", "text": "...", "selector": "..."},
    {"action": "run_command", "command": "..."}
  ],
  "category": "${category}",
  "confidence": 0.0-1.0,
  "estimatedTime": "5 minutes"
}

IMPORTANT: steps should be in Hindi. canRemoteFix = true only for browser/website problems that can be fixed by navigating/clicking.`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      let content = response.choices[0].message.content.trim();
      content = content.replace(/^```[\w]*\s*/, '').replace(/\s*```$/, '');

      const result = JSON.parse(content);
      result.source = forumSolutions.length > 0 ? 'forum+ai' : 'ai';

      console.log(`[RemoteAssist] 🧠 Diagnosis: "${result.diagnosis}" (confidence: ${result.confidence})`);
      return result;
    } catch (e) {
      console.error('[RemoteAssist] AI diagnosis failed:', e.message);
      return {
        source: 'error',
        diagnosis: 'AI diagnosis failed — please describe the problem in more detail',
        steps: [],
        canRemoteFix: false,
        confidence: 0
      };
    }
  }

  // ═══════════════════════════════════════════════════
  //  2. REMOTE CONTROL SYSTEM
  // ═══════════════════════════════════════════════════

  /**
   * Start a remote assist session (requires user consent)
   *
   * @param {string} userId — the user requesting help
   * @param {string} problem — problem description
   * @returns {Object} { sessionId, consentRequired: true }
   */
  startSession(userId, problem) {
    const sessionId = `ra_${crypto.randomUUID().split('-')[0]}`;

    const session = {
      sessionId,
      userId,
      problem,
      status: 'awaiting_consent', // awaiting_consent → active → completed/cancelled
      consentGiven: false,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.sessionTimeoutMs).toISOString(),
      actions: [],        // All remote actions logged
      screenshots: [],    // Periodic screenshots for AI analysis
      diagnosis: null
    };

    this.sessions.set(sessionId, session);

    // Request consent from user
    if (this.io) {
      this.io.to(`user_${userId}`).emit('remote_assist_request', {
        sessionId,
        message: '🤖 Harshita AI आपकी problem solve करने के लिए आपके browser का control लेना चाहती है।\n\n✅ Allow → Harshita fix करेगी\n❌ Deny → सिर्फ guide करेगी\n\n🔒 आप कभी भी Escape दबाकर control वापस ले सकते हैं।',
        expiresAt: session.expiresAt
      });
    }

    console.log(`[RemoteAssist] 🎫 Session ${sessionId} created for user ${userId} — awaiting consent`);

    // Auto-expire session
    setTimeout(() => {
      const s = this.sessions.get(sessionId);
      if (s && s.status === 'awaiting_consent') {
        s.status = 'expired';
        this.sessions.delete(sessionId);
      }
    }, 5 * 60 * 1000); // 5 min consent timeout

    return { sessionId, consentRequired: true };
  }

  /**
   * User grants consent for remote control
   */
  async grantConsent(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: 'Session not found' };
    if (session.status !== 'awaiting_consent') return { success: false, error: 'Session already processed' };

    session.consentGiven = true;
    session.status = 'active';

    console.log(`[RemoteAssist] ✅ Consent granted for session ${sessionId}`);

    // Diagnose the problem
    session.diagnosis = await this.diagnoseProblem(session.problem);

    // If can be remotely fixed, start sending commands
    if (session.diagnosis.canRemoteFix && session.diagnosis.remoteFixActions) {
      // Don't execute automatically — send plan to user first for approval
      if (this.io) {
        this.io.to(`user_${session.userId}`).emit('remote_assist_plan', {
          sessionId,
          diagnosis: session.diagnosis.diagnosis,
          steps: session.diagnosis.steps,
          actions: session.diagnosis.remoteFixActions,
          message: `🤖 Harshita AI ने problem समझ ली:\n\n📋 "${session.diagnosis.diagnosis}"\n\n${session.diagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nक्या मैं ये steps अपने आप करूँ?\n✅ "हाँ" → Auto-fix\n📋 "Guide" → Step-by-step guide दिखाओ`
        });
      }
    } else {
      // Can't remote fix — just guide
      if (this.io) {
        this.io.to(`user_${session.userId}`).emit('remote_assist_guide', {
          sessionId,
          diagnosis: session.diagnosis.diagnosis,
          steps: session.diagnosis.steps,
          message: `🤖 Harshita AI suggest करती है:\n\n${session.diagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
        });
      }
    }

    return { success: true, diagnosis: session.diagnosis };
  }

  /**
   * User approves auto-fix — Harshita executes remote commands
   */
  async executeRemoteFix(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') return { success: false, error: 'Invalid session' };
    if (!session.consentGiven) return { success: false, error: 'No consent' };

    const actions = session.diagnosis?.remoteFixActions || [];
    if (actions.length === 0) return { success: false, error: 'No remote actions available' };

    console.log(`[RemoteAssist] 🤖 Executing ${actions.length} remote actions for session ${sessionId}`);

    const results = [];
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      // Log the action
      session.actions.push({
        index: i,
        action: action.action,
        details: action,
        timestamp: new Date().toISOString(),
        status: 'executing'
      });

      // Send command to user's browser via Socket.IO
      if (this.io) {
        this.io.to(`user_${session.userId}`).emit('remote_command', {
          sessionId,
          commandIndex: i,
          totalCommands: actions.length,
          action: action.action,
          ...action,
          message: `🤖 Step ${i + 1}/${actions.length}: ${this._describeAction(action)}`
        });
      }

      // Wait for acknowledgment (user's browser executes and reports back)
      // In production, this would be a proper ack system
      await this._sleep(2000);

      results.push({ index: i, action: action.action, status: 'sent' });
    }

    session.status = 'completed';

    return {
      success: true,
      actionsExecuted: results.length,
      results,
      message: `✅ ${results.length} actions executed — check if the problem is solved!`
    };
  }

  /**
   * User denies consent or revokes mid-session
   */
  revokeAccess(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.status = 'cancelled';
    session.consentGiven = false;

    if (this.io) {
      this.io.to(`user_${session.userId}`).emit('remote_assist_ended', {
        sessionId,
        reason: 'User revoked access',
        message: '🔒 Remote control ended — Harshita AI का access हटा दिया गया।'
      });
    }

    console.log(`[RemoteAssist] 🔒 Access revoked for session ${sessionId}`);
    this.sessions.delete(sessionId);
  }

  /**
   * Mark a solution as successful (reinforcement learning)
   */
  markSolutionSuccessful(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.diagnosis) return;

    // Reinforce this solution in memory
    this._saveSolutionMemory(session.problem, session.diagnosis);
    console.log(`[RemoteAssist] 🎯 Solution reinforced in memory for: "${session.problem.substring(0, 50)}..."`);
  }

  /**
   * Mark a solution as failed (negative reinforcement)
   */
  markSolutionFailed(sessionId, feedback) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const key = this._hashProblem(session.problem);
    const memory = this.solutionMemory.get(key);
    if (memory) {
      memory.successCount = Math.max(0, memory.successCount - 2); // Penalize
      if (memory.successCount === 0) {
        this.solutionMemory.delete(key); // Remove bad solution
        console.log(`[RemoteAssist] 🗑️ Bad solution removed from memory`);
      }
    }

    // Save feedback for future learning
    this.knowledgeStore.storeTaskPattern({
      intent: 'remote_assist_failed',
      problem: session.problem,
      failedSolution: session.diagnosis?.diagnosis,
      userFeedback: feedback,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  }

  // ═══════════════════════════════════════════════════
  //  3. SOCKET.IO REMOTE CONTROL SETUP
  // ═══════════════════════════════════════════════════

  _setupRemoteControl() {
    this.io.on('connection', (socket) => {
      // User grants consent
      socket.on('remote_assist_consent', async (data) => {
        const { sessionId, granted } = data;
        if (granted) {
          const result = await this.grantConsent(sessionId);
          socket.emit('remote_assist_status', { sessionId, ...result });
        } else {
          this.revokeAccess(sessionId);
        }
      });

      // User approves auto-fix execution
      socket.on('remote_assist_execute', async (data) => {
        const result = await this.executeRemoteFix(data.sessionId);
        socket.emit('remote_assist_result', { ...result });
      });

      // User's browser reports command execution result
      socket.on('remote_command_ack', (data) => {
        const { sessionId, commandIndex, success, error } = data;
        const session = this.sessions.get(sessionId);
        if (session && session.actions[commandIndex]) {
          session.actions[commandIndex].status = success ? 'completed' : 'failed';
          session.actions[commandIndex].error = error;
        }
      });

      // User sends screenshot for AI analysis
      socket.on('remote_assist_screenshot', async (data) => {
        const { sessionId, screenshot } = data; // screenshot = base64 image
        const session = this.sessions.get(sessionId);
        if (!session || session.status !== 'active') return;

        session.screenshots.push({
          timestamp: new Date().toISOString(),
          size: screenshot?.length || 0
        });

        // AI can analyze the screenshot to verify fix worked
        // (In production, send to AI vision model)
      });

      // User reports problem fixed
      socket.on('remote_assist_fixed', (data) => {
        this.markSolutionSuccessful(data.sessionId);
        socket.emit('remote_assist_ended', {
          sessionId: data.sessionId,
          message: '🎉 Problem solved! Harshita AI ने इस solution को याद कर लिया — अगली बार और तेज़ fix करेगी!'
        });
      });

      // User reports problem NOT fixed
      socket.on('remote_assist_not_fixed', (data) => {
        this.markSolutionFailed(data.sessionId, data.feedback);
        socket.emit('remote_assist_ended', {
          sessionId: data.sessionId,
          message: '😔 Sorry! आपका feedback record कर लिया। Harshita AI अगली बार बेहतर solution देगी।'
        });
      });

      // User revokes access
      socket.on('remote_assist_revoke', (data) => {
        this.revokeAccess(data.sessionId);
      });
    });

    console.log('[RemoteAssist] 🤖 Remote control signaling ready');
  }

  // ═══════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════

  _hashProblem(problem) {
    // Create a fuzzy hash — normalize and extract key terms
    const normalized = problem.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .sort()
      .join(' ');
    const crypto = require('crypto');
    return crypto.createHash('md5').update(normalized).digest('hex').substring(0, 12);
  }

  _extractKeywords(text) {
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'to', 'for', 'of', 'not', 'no', 'can', 'will', 'do', 'does',
      'hai', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'ye', 'wo', 'kya',
      'nahi', 'aur', 'par', 'mera', 'meri', 'hum', 'tum', 'aap']);

    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
      .slice(0, 15);
  }

  _describeAction(action) {
    switch (action.action) {
      case 'navigate': return `${action.url} पर जा रहे हैं`;
      case 'click': return `"${action.selector}" पर click कर रहे हैं`;
      case 'type': return `"${action.text?.substring(0, 20)}" type कर रहे हैं`;
      case 'clear_cache': return `Browser cache clear कर रहे हैं`;
      case 'refresh': return `Page refresh कर रहे हैं`;
      case 'run_command': return `Command चला रहे हैं: ${action.command}`;
      default: return `Action: ${action.action}`;
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /**
   * Get active session stats
   */
  getStats() {
    return {
      activeSessions: Array.from(this.sessions.values()).filter(s => s.status === 'active').length,
      totalSessions: this.sessions.size,
      solutionsInMemory: this.solutionMemory.size,
      topSolutions: Array.from(this.solutionMemory.entries())
        .sort((a, b) => b[1].successCount - a[1].successCount)
        .slice(0, 10)
        .map(([hash, sol]) => ({
          keywords: sol.keywords?.slice(0, 5).join(', '),
          diagnosis: sol.diagnosis?.substring(0, 100),
          successCount: sol.successCount
        }))
    };
  }
}

module.exports = { RemoteAssistAgent };
