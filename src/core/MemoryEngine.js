const fs = require('fs');
const path = require('path');

class MemoryEngine {
  constructor() {
    this.memoryDir = path.join(process.cwd(), 'data', 'memory', 'users');
    this._init();
  }

  _init() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  _getUserFilePath(userId) {
    // Sanitize user ID to prevent path traversal
    const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
    return path.join(this.memoryDir, `${safeId}.json`);
  }

  _loadUserMemory(userId) {
    const filePath = this._getUserFilePath(userId);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        console.error(`[MemoryEngine] Error loading memory for ${userId}:`, e.message);
      }
    }
    return this._createEmptyProfile(userId);
  }

  _saveUserMemory(userId, data) {
    const filePath = this._getUserFilePath(userId);
    try {
      data.lastActive = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error(`[MemoryEngine] Error saving memory for ${userId}:`, e.message);
    }
  }

  _createEmptyProfile(userId) {
    return {
      userId,
      created: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      preferences: {
        language: 'hi',
        units: 'metric'
      },
      profile: {},
      skillUsage: {
        mostUsed: [],
        lastUsed: []
      },
      coding: {},
      custom: {}
    };
  }

  // --- Core API ---

  remember(userId, key, value) {
    const memory = this._loadUserMemory(userId);
    memory.custom[key] = value;
    this._saveUserMemory(userId, memory);
  }

  recall(userId, key) {
    const memory = this._loadUserMemory(userId);
    return memory.custom[key];
  }

  forget(userId, key) {
    const memory = this._loadUserMemory(userId);
    delete memory.custom[key];
    this._saveUserMemory(userId, memory);
  }

  getUserProfile(userId) {
    return this._loadUserMemory(userId);
  }

  updatePreference(userId, key, value) {
    const memory = this._loadUserMemory(userId);
    memory.preferences[key] = value;
    this._saveUserMemory(userId, memory);
  }

  getPreferredLanguage(userId) {
    const memory = this._loadUserMemory(userId);
    return memory.preferences.language || 'hi';
  }

  recordSkillUsage(userId, skill) {
    const memory = this._loadUserMemory(userId);
    
    // Update last used
    memory.skillUsage.lastUsed.unshift({ skill, timestamp: new Date().toISOString() });
    if (memory.skillUsage.lastUsed.length > 20) {
      memory.skillUsage.lastUsed.pop();
    }

    // Update most used
    const mostUsed = memory.skillUsage.mostUsed;
    const existing = mostUsed.find(s => s.skill === skill);
    if (existing) {
      existing.count += 1;
    } else {
      mostUsed.push({ skill, count: 1 });
    }
    memory.skillUsage.mostUsed = mostUsed.sort((a, b) => b.count - a.count).slice(0, 10);

    this._saveUserMemory(userId, memory);
  }
}

const memoryEngine = new MemoryEngine();
module.exports = { MemoryEngine, memoryEngine };
