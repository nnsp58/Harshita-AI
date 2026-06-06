/**
 * ConversationMemory — Per-user, per-skill conversation history
 *
 * Har skill aur har user ki chat history yaad rakhta hai:
 *   - Last 50 messages per (userId × skill) combo
 *   - Persistent storage (data/learning/conversations.json)
 *   - Context retrieval for skill execution
 *   - Auto-prune old conversations
 */

const fs = require('fs');
const path = require('path');

const CONV_FILE = path.join(__dirname, '../../data/learning/conversations.json');
const MAX_MESSAGES_PER_SESSION = 50;
const MAX_AGE_DAYS = 90; // Auto-delete conversations older than 90 days

class ConversationMemory {
  constructor() {
    this.memory = this._load();
    this.dirty = false;
    this.saveTimer = null;
    console.log(`💬 ConversationMemory initialized — ${Object.keys(this.memory).length} sessions loaded`);
  }

  _load() {
    try {
      if (fs.existsSync(CONV_FILE)) {
        return JSON.parse(fs.readFileSync(CONV_FILE, 'utf8'));
      }
    } catch (e) {
      console.warn('[ConversationMemory] Load failed:', e.message);
    }
    return {};
  }

  _save() {
    try {
      const dir = path.dirname(CONV_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CONV_FILE, JSON.stringify(this.memory, null, 2));
      this.dirty = false;
    } catch (e) {
      console.warn('[ConversationMemory] Save failed:', e.message);
    }
  }

  _scheduleSave() {
    this.dirty = true;
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this._save();
      this.saveTimer = null;
    }, 5000);
  }

  // Key format: userId:skillName
  _key(userId, skill) {
    return `${userId || 'anon'}:${skill || 'general'}`;
  }

  // ═══════════════════════════════════════════════════════════
  //  Add message to conversation
  // ═══════════════════════════════════════════════════════════
  addMessage(userId, skill, role, content, metadata = {}) {
    const key = this._key(userId, skill);
    if (!this.memory[key]) {
      this.memory[key] = {
        userId,
        skill,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };
    }

    this.memory[key].messages.push({
      role, // 'user' | 'assistant' | 'system'
      content: typeof content === 'string' ? content.substring(0, 2000) : JSON.stringify(content).substring(0, 2000),
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    // Keep only last N messages
    if (this.memory[key].messages.length > MAX_MESSAGES_PER_SESSION) {
      this.memory[key].messages = this.memory[key].messages.slice(-MAX_MESSAGES_PER_SESSION);
    }

    this.memory[key].lastActive = new Date().toISOString();
    this._scheduleSave();
  }

  // ═══════════════════════════════════════════════════════════
  //  Get conversation history
  // ═══════════════════════════════════════════════════════════
  getHistory(userId, skill, limit = 10) {
    const key = this._key(userId, skill);
    const session = this.memory[key];
    if (!session) return [];
    return session.messages.slice(-limit);
  }

  // Get all skills used by a user
  getUserSkills(userId) {
    return Object.keys(this.memory)
      .filter(k => k.startsWith(`${userId}:`))
      .map(k => ({
        skill: k.split(':')[1],
        messageCount: this.memory[k].messages.length,
        lastActive: this.memory[k].lastActive,
      }));
  }

  // Get formatted context string for AI prompts
  getContextString(userId, skill, lastN = 5) {
    const history = this.getHistory(userId, skill, lastN);
    if (history.length === 0) return '';
    return history
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
      .join('\n');
  }

  // ═══════════════════════════════════════════════════════════
  //  Clear / Maintenance
  // ═══════════════════════════════════════════════════════════
  clearSession(userId, skill) {
    const key = this._key(userId, skill);
    delete this.memory[key];
    this._scheduleSave();
  }

  // Auto-prune old conversations (called nightly)
  pruneOld() {
    const cutoff = Date.now() - (MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    let removed = 0;
    for (const key of Object.keys(this.memory)) {
      const lastActive = new Date(this.memory[key].lastActive).getTime();
      if (lastActive < cutoff) {
        delete this.memory[key];
        removed++;
      }
    }
    if (removed > 0) {
      this._save();
      console.log(`🧹 ConversationMemory pruned ${removed} old sessions`);
    }
    return removed;
  }

  getStats() {
    const sessions = Object.values(this.memory);
    return {
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((s, x) => s + x.messages.length, 0),
      uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      uniqueSkills: new Set(sessions.map(s => s.skill)).size,
    };
  }

  flush() {
    if (this.dirty) this._save();
  }
}

const conversationMemory = new ConversationMemory();
module.exports = { ConversationMemory, conversationMemory };
