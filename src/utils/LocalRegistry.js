/**
 * LocalRegistry - Holds models specifications for local LLM backups (Ollama / vLLM)
 */

const LOCAL_MODELS = [
  {
    name: 'deepseek-r1:8b',
    ramRequired: '8GB',
    performanceScore: 88,
    languageSupport: ['en', 'hi', 'zh'],
    purpose: 'Reasoning, Coding & Legal analysis'
  },
  {
    name: 'qwen2.5:7b',
    ramRequired: '8GB',
    performanceScore: 85,
    languageSupport: ['en', 'hi', 'ur', 'ta'],
    purpose: 'Multilingual tasks, Chat & General translations'
  },
  {
    name: 'llama3:8b',
    ramRequired: '8GB',
    performanceScore: 82,
    languageSupport: ['en'],
    purpose: 'General chat & instruction following'
  }
];

class LocalRegistry {
  constructor() {
    this.models = LOCAL_MODELS;
  }

  getModels() {
    return this.models;
  }

  findModel(name) {
    return this.models.find(m => m.name === name) || null;
  }
}

const localRegistry = new LocalRegistry();

module.exports = { LocalRegistry, localRegistry };
