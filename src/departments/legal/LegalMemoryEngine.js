/**
 * LegalMemoryEngine
 * Persistently stores and recalls contextual details (Witnesses, Properties, etc.)
 */
class LegalMemoryEngine {
  constructor() {
    this.memory = {};
  }
  
  saveMemory(key, value) {
    this.memory[key] = value;
  }

  getMemory(key) {
    return this.memory[key];
  }
}

module.exports = { LegalMemoryEngine };
