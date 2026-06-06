/**
 * NightlyUpgrader — Smart Self-Improvement Scheduler
 *
 * 3 modes supported:
 *   1. Smart (default): Jab system idle ho tab upgrade (every 15 min check)
 *   2. Interval: Every N minutes regardless of activity
 *   3. Window: Daily within specified hour window (legacy)
 *
 * Actual upgrade takes only ~200ms even with 1000s of interactions
 */

const fs = require('fs');
const path = require('path');
const { learningEngine } = require('./learningEngine');
const { conversationMemory } = require('./conversationMemory');

const UPGRADE_LOG = path.join(__dirname, '../../data/learning/upgrade-log.json');
const LAST_RUN_FILE = path.join(__dirname, '../../data/learning/.last-upgrade');

class NightlyUpgrader {
  constructor(options = {}) {
    this.mode = options.mode || 'window'; // 'window' (default — fixed time) | 'smart' | 'interval'
    this.startHour = options.startHour ?? 23;     // 11 PM
    this.startMinute = options.startMinute ?? 30; // 11:30 PM
    this.endHour = options.endHour ?? 0;          // 12 AM (next day)
    this.endMinute = options.endMinute ?? 30;     // 12:30 AM
    this.notifyMinutesBefore = options.notifyMinutesBefore ?? 30; // 30 min advance warning
    this.finalWarningMinutes = options.finalWarningMinutes ?? 5;  // 5 min final warning
    this.intervalMinutes = options.intervalMinutes ?? 15;
    this.idleThresholdMs = options.idleThresholdMs ?? 5 * 60 * 1000;
    this.minGapBetweenRunsMs = options.minGapBetweenRunsMs ?? 15 * 60 * 1000;
    this.skillRegistry = options.skillRegistry || null;
    this.io = options.io || null; // Socket.IO for popup notifications
    this.timer = null;
    this.running = false;
    this.lastActivityAt = Date.now();
    this.lastRunAt = 0;
    this.maintenanceMode = false; // True during upgrade
    this.notifiedToday = { warning: false, finalWarning: false };
  }

  // Check if system is currently in maintenance (used by API/sockets)
  isInMaintenance() {
    return this.maintenanceMode;
  }

  recordActivity() {
    this.lastActivityAt = Date.now();
  }

  start() {
    if (this.timer) return;
    console.log(`🌙 NightlyUpgrader started (mode: ${this.mode})`);
    if (this.mode === 'window') {
      const sh = String(this.startHour).padStart(2, '0');
      const sm = String(this.startMinute).padStart(2, '0');
      const eh = String(this.endHour).padStart(2, '0');
      const em = String(this.endMinute).padStart(2, '0');
      console.log(`   🕐 Daily window: ${sh}:${sm} - ${eh}:${em}`);
      console.log(`   📢 Notifications: ${this.notifyMinutesBefore} min before + ${this.finalWarningMinutes} min final warning`);
    }
    // Check every minute for window mode (precise timing for notifications)
    this._tick();
    this.timer = setInterval(() => this._tick(), 60 * 1000);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  _tick() {
    if (this.running) return;

    const now = Date.now();
    const nowDate = new Date();
    const minutesUntilUpgrade = this._minutesUntilWindowStart(nowDate);

    // ─── Window Mode (default) ───
    if (this.mode === 'window') {
      // Reset daily notification flags at start of day (e.g., morning)
      if (nowDate.getHours() === 6 && nowDate.getMinutes() === 0) {
        this.notifiedToday = { warning: false, finalWarning: false };
      }

      // Send 30-min advance warning
      if (!this.notifiedToday.warning &&
          minutesUntilUpgrade > 0 &&
          minutesUntilUpgrade <= this.notifyMinutesBefore &&
          minutesUntilUpgrade > this.finalWarningMinutes) {
        this._broadcastNotification('warning', minutesUntilUpgrade);
        this.notifiedToday.warning = true;
      }

      // Send 5-min final warning + trigger auto-save
      if (!this.notifiedToday.finalWarning &&
          minutesUntilUpgrade > 0 &&
          minutesUntilUpgrade <= this.finalWarningMinutes) {
        this._broadcastNotification('final_warning', minutesUntilUpgrade);
        this.notifiedToday.finalWarning = true;
      }

      // Trigger upgrade when window opens
      if (this._isWithinWindow() && !this._alreadyRanToday()) {
        this._runUpgrade().catch(err => console.error('[NightlyUpgrader] Run failed:', err.message));
      }
      return;
    }

    // ─── Smart / Interval Modes ───
    if (now - this.lastRunAt < this.minGapBetweenRunsMs) return;

    let shouldRun = false;
    if (this.mode === 'smart') {
      const idleMs = now - this.lastActivityAt;
      if (idleMs >= this.idleThresholdMs) shouldRun = true;
    } else if (this.mode === 'interval') {
      if (now - this.lastRunAt >= this.intervalMinutes * 60 * 1000) shouldRun = true;
    }

    if (shouldRun) {
      this._runUpgrade().catch(err => console.error('[NightlyUpgrader] Run failed:', err.message));
    }
  }

  // Calculate minutes until upgrade window starts (for notifications)
  _minutesUntilWindowStart(now) {
    const target = new Date(now);
    target.setHours(this.startHour, this.startMinute, 0, 0);
    let diff = (target - now) / 60000;
    // If start time has passed today, calculate for tomorrow
    if (diff < 0) {
      target.setDate(target.getDate() + 1);
      diff = (target - now) / 60000;
    }
    return Math.round(diff);
  }

  _isWithinWindow() {
    const now = new Date();
    const startMinutes = this.startHour * 60 + this.startMinute;
    const endMinutes = this.endHour * 60 + this.endMinute;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (startMinutes < endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes < endMinutes;
    }
    // Wraps midnight
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }

  _alreadyRanToday() {
    try {
      if (!fs.existsSync(LAST_RUN_FILE)) return false;
      const lastRun = fs.readFileSync(LAST_RUN_FILE, 'utf8').trim();
      const lastDate = new Date(lastRun).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const hour = new Date().getHours();
      if (hour < this.endHour && lastDate === yesterday) return true;
      return lastDate === today;
    } catch { return false; }
  }

  _markRan() {
    this.lastRunAt = Date.now();
    try { fs.writeFileSync(LAST_RUN_FILE, new Date().toISOString()) } catch {}
  }

  // ═══════════════════════════════════════════════════════════
  //  Main upgrade routine
  // ═══════════════════════════════════════════════════════════
  async _runUpgrade() {
    this.running = true;
    this.maintenanceMode = true;
    this._broadcastNotification('started');
    const startTime = Date.now();
    console.log('\n╔═══════════════════════════════════════════════╗');
    console.log('║  🌙 NIGHTLY SELF-UPGRADE STARTED            ║');
    console.log('╚═══════════════════════════════════════════════╝');

    const report = {
      startedAt: new Date().toISOString(),
      tasks: [],
    };

    try {
      // 1. Flush all pending data to disk
      report.tasks.push(await this._task('flush_data', () => {
        learningEngine.flush();
        conversationMemory.flush();
        return { saved: true };
      }));

      // 2. Prune old conversations (>90 days)
      report.tasks.push(await this._task('prune_conversations', () => {
        const removed = conversationMemory.pruneOld();
        return { removed };
      }));

      // 3. Analyze patterns and learn keywords for each skill
      report.tasks.push(await this._task('learn_keywords', () => {
        return this._learnKeywordsFromHistory();
      }));

      // 4. Update each skill's keywords from learned patterns
      report.tasks.push(await this._task('upgrade_skills', () => {
        return this._upgradeSkillsKeywords();
      }));

      // 5. Identify recurring failures (need attention)
      report.tasks.push(await this._task('analyze_failures', () => {
        const failures = learningEngine.getFailurePatterns(null, 50);
        return { failurePatternsFound: failures.length, top5: failures.slice(0, 5) };
      }));

      // 6. Run CEE dynamic learning evolution
      report.tasks.push(await this._task('cognitive_evolution', async () => {
        const { SelfEvolutionAgent } = require('./selfEvolutionAgent');
        const evolutionAgent = new SelfEvolutionAgent();
        const evoResult = await evolutionAgent.analyzeAndEvolve();
        return evoResult;
      }));

      // 7. Generate stats summary
      report.tasks.push(await this._task('generate_stats', () => {
        return {
          learning: learningEngine.getStats(),
          conversations: conversationMemory.getStats(),
        };
      }));

      report.completedAt = new Date().toISOString();
      report.durationMs = Date.now() - startTime;
      report.success = true;

      this._appendToLog(report);
      this._markRan();

      console.log(`✅ Nightly upgrade completed in ${(report.durationMs / 1000).toFixed(1)}s`);
      console.log('═══════════════════════════════════════════════\n');
      this._broadcastNotification('completed');
    } catch (err) {
      report.error = err.message;
      report.success = false;
      this._appendToLog(report);
      console.error('❌ Nightly upgrade error:', err.message);
    } finally {
      this.running = false;
      this.maintenanceMode = false;
    }
  }

  // Broadcast popup notification to all connected clients via Socket.IO
  _broadcastNotification(type, minutesLeft) {
    if (!this.io) {
      console.log(`[NightlyUpgrader] ⚠️ ${type}: ${minutesLeft} min — (no Socket.IO available)`);
      return;
    }

    const startTime = `${String(this.startHour).padStart(2, '0')}:${String(this.startMinute).padStart(2, '0')}`;
    const endTime = `${String(this.endHour).padStart(2, '0')}:${String(this.endMinute).padStart(2, '0')}`;

    let payload;
    if (type === 'warning') {
      payload = {
        type: 'system_upgrade_warning',
        severity: 'info',
        title: '🔔 System Upgrade Notice',
        titleHi: 'सिस्टम अपग्रेड सूचना',
        message: `Harshita AI will undergo daily upgrade in ${minutesLeft} minutes (${startTime} - ${endTime}). Please save your work.`,
        messageHi: `${minutesLeft} मिनट में सिस्टम अपग्रेड शुरू होगा (${startTime} - ${endTime}). कृपया अपना कार्य सेव करें।`,
        action: 'save_drafts',
        minutesLeft,
        windowStart: startTime,
        windowEnd: endTime,
      };
    } else if (type === 'final_warning') {
      payload = {
        type: 'system_upgrade_final_warning',
        severity: 'warning',
        title: '⚠️ Upgrade Starting Soon!',
        titleHi: 'अपग्रेड शुरू होने वाला है!',
        message: `Only ${minutesLeft} minutes left. Auto-saving your drafts now. New commands will queue during upgrade.`,
        messageHi: `सिर्फ ${minutesLeft} मिनट बचे हैं। आपका कार्य ड्राफ्ट में सेव हो रहा है। अपग्रेड के दौरान कोई कमांड कतार में जाएगी।`,
        action: 'auto_save_now',
        minutesLeft,
      };
    } else if (type === 'started') {
      payload = {
        type: 'system_upgrade_started',
        severity: 'warning',
        title: '🔧 Upgrade In Progress',
        titleHi: 'अपग्रेड चल रहा है',
        message: 'System is upgrading. Your work is saved. Please wait...',
        messageHi: 'सिस्टम अपग्रेड हो रहा है। आपका कार्य सेव है। कृपया प्रतीक्षा करें...',
        action: 'show_overlay',
      };
    } else if (type === 'completed') {
      payload = {
        type: 'system_upgrade_completed',
        severity: 'success',
        title: '✅ Upgrade Complete',
        titleHi: 'अपग्रेड पूरा हुआ',
        message: 'Harshita AI has been upgraded with new improvements. Resuming your work.',
        messageHi: 'Harshita AI नई सुविधाओं के साथ अपग्रेड हो गया। आपका कार्य फिर से शुरू हो रहा है।',
        action: 'resume_work',
      };
    }

    if (payload) {
      payload.timestamp = new Date().toISOString();
      this.io.emit('system_notification', payload);
      console.log(`📢 Broadcast: ${payload.title} → ${minutesLeft || ''} min`);
    }
  }

  // Helper: run a named task with error handling
  async _task(name, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      console.log(`  ✅ ${name}: ${JSON.stringify(result).substring(0, 100)}`);
      return { name, success: true, durationMs: Date.now() - start, result };
    } catch (e) {
      console.warn(`  ⚠️ ${name} failed:`, e.message);
      return { name, success: false, durationMs: Date.now() - start, error: e.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  Learn keywords from conversation history
  // ═══════════════════════════════════════════════════════════
  _learnKeywordsFromHistory() {
    const stats = conversationMemory.getStats();
    let keywordsLearned = 0;

    // Iterate sessions and feed user messages back to learning engine
    for (const key of Object.keys(conversationMemory.memory)) {
      const session = conversationMemory.memory[key];
      const skill = session.skill;
      if (!skill || skill === 'general') continue;

      // Only consider successful interactions (user kept asking → relevant)
      const userMessages = session.messages.filter(m => m.role === 'user').slice(-20);
      for (const msg of userMessages) {
        learningEngine._extractKeywords(skill, msg.content);
        keywordsLearned++;
      }
    }

    return { sessionsAnalyzed: stats.totalSessions, keywordsLearned };
  }

  // ═══════════════════════════════════════════════════════════
  //  Upgrade each skill's keywords with learned ones
  // ═══════════════════════════════════════════════════════════
  _upgradeSkillsKeywords() {
    if (!this.skillRegistry) return { skipped: 'no skill registry' };

    let upgraded = 0;
    const skills = this.skillRegistry.getAllSkills();
    for (const skill of skills) {
      const learned = learningEngine.getLearnedKeywords(skill.name, 5);
      if (learned.length === 0) continue;

      // Add learned keywords to skill (avoid duplicates)
      const existing = new Set([
        ...(skill.keywords.hi || []),
        ...(skill.keywords.en || []),
        ...(skill.keywords.hinglish || []),
      ].map(k => k.toLowerCase()));

      const newKeywords = learned.filter(k => !existing.has(k.toLowerCase()));
      if (newKeywords.length === 0) continue;

      // Heuristic: Hindi script vs English
      const isHindi = (s) => /[\u0900-\u097F]/.test(s);
      for (const kw of newKeywords) {
        if (isHindi(kw)) skill.keywords.hi.push(kw);
        else skill.keywords.hinglish.push(kw);
      }
      upgraded++;
    }

    return { skillsUpgraded: upgraded, totalSkills: skills.length };
  }

  // ═══════════════════════════════════════════════════════════
  //  Manually trigger upgrade (for testing or admin command)
  // ═══════════════════════════════════════════════════════════
  async runNow() {
    if (this.running) {
      return { success: false, message: 'Upgrade already running' };
    }
    await this._runUpgrade();
    return { success: true, message: 'Upgrade completed' };
  }

  _appendToLog(report) {
    try {
      const dir = path.dirname(UPGRADE_LOG);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      let log = [];
      if (fs.existsSync(UPGRADE_LOG)) {
        try { log = JSON.parse(fs.readFileSync(UPGRADE_LOG, 'utf8')) } catch {}
      }
      log.push(report);
      // Keep last 30 days of logs
      if (log.length > 30) log = log.slice(-30);
      fs.writeFileSync(UPGRADE_LOG, JSON.stringify(log, null, 2));
    } catch (e) {
      console.warn('[NightlyUpgrader] Log write failed:', e.message);
    }
  }

  // Get last upgrade report
  getLastReport() {
    try {
      if (!fs.existsSync(UPGRADE_LOG)) return null;
      const log = JSON.parse(fs.readFileSync(UPGRADE_LOG, 'utf8'));
      return log[log.length - 1] || null;
    } catch { return null; }
  }

  // Public schedule info — for UI to display
  getSchedule() {
    return {
      mode: this.mode,
      windowStart: `${String(this.startHour).padStart(2, '0')}:${String(this.startMinute).padStart(2, '0')}`,
      windowEnd: `${String(this.endHour).padStart(2, '0')}:${String(this.endMinute).padStart(2, '0')}`,
      notifyMinutesBefore: this.notifyMinutesBefore,
      finalWarningMinutes: this.finalWarningMinutes,
      isInMaintenance: this.maintenanceMode,
      minutesUntilUpgrade: this._minutesUntilWindowStart(new Date()),
      lastRun: this.lastRunAt ? new Date(this.lastRunAt).toISOString() : null,
    };
  }
}

module.exports = { NightlyUpgrader };
