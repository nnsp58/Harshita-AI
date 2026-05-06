/**
 * KnowledgeStore - Stores and retrieves learning data
 *
 * Stores:
 * - structured task patterns
 * - frequent workflows
 * - CSC services data
 * - web knowledge summaries
 *
 * Uses file-based storage with indexing for fast retrieval
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class KnowledgeStore {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'knowledge');
    this.files = {
      patterns: path.join(this.dataDir, 'task_patterns.json'),
      workflows: path.join(this.dataDir, 'workflows.json'),
      cscServices: path.join(this.dataDir, 'csc_services.json'),
      webKnowledge: path.join(this.dataDir, 'web_knowledge.json'),
      index: path.join(this.dataDir, 'index.json')
    };
    this._ensureDataDir();
  }

  async _ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      // Initialize empty files if they don't exist
      for (const [key, filePath] of Object.entries(this.files)) {
        try {
          await fs.access(filePath);
        } catch {
          await fs.writeFile(filePath, JSON.stringify([]));
        }
      }
    } catch (error) {
      console.warn('KnowledgeStore: Could not initialize data directory:', error.message);
    }
  }

  /**
   * Store task pattern
   */
  async storeTaskPattern(pattern) {
    const entry = {
      id: crypto.randomUUID(),
      type: 'task_pattern',
      ...pattern,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    await this._appendToFile('patterns', entry);
    await this._updateIndex(entry);
    console.log(`[KnowledgeStore] Stored task pattern: ${entry.id}`);
  }

  /**
   * Store workflow
   */
  async storeWorkflow(workflow) {
    const entry = {
      id: crypto.randomUUID(),
      type: 'workflow',
      ...workflow,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    await this._appendToFile('workflows', entry);
    await this._updateIndex(entry);
    console.log(`[KnowledgeStore] Stored workflow: ${entry.id}`);
  }

  /**
   * Store CSC service data
   */
  async storeCSCService(service) {
    const entry = {
      id: crypto.randomUUID(),
      type: 'csc_service',
      ...service,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    await this._appendToFile('cscServices', entry);
    await this._updateIndex(entry);
    console.log(`[KnowledgeStore] Stored CSC service: ${entry.id}`);
  }

  /**
   * Store web knowledge summary
   */
  async storeWebKnowledge(knowledge) {
    const entry = {
      id: crypto.randomUUID(),
      type: 'web_knowledge',
      ...knowledge,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    await this._appendToFile('webKnowledge', entry);
    await this._updateIndex(entry);
    console.log(`[KnowledgeStore] Stored web knowledge: ${entry.id}`);
  }

  /**
   * Append entry to specific file
   */
  async _appendToFile(fileKey, entry) {
    const filePath = this.files[fileKey];
    let data = [];
    try {
      const content = await fs.readFile(filePath, 'utf8');
      data = JSON.parse(content);
    } catch (error) {
      data = [];
    }

    data.push(entry);

    // Keep only last 500 entries per file
    if (data.length > 500) {
      data = data.slice(-500);
    }

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Update search index
   */
  async _updateIndex(entry) {
    const indexPath = this.files.index;
    let index = {};
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      index = JSON.parse(content);
    } catch (error) {
      index = {};
    }

    // Create searchable terms
    const searchableText = this._extractSearchableText(entry);
    const terms = searchableText.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    terms.forEach(term => {
      if (!index[term]) index[term] = [];
      index[term].push({
        id: entry.id,
        type: entry.type,
        timestamp: entry.timestamp
      });
    });

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Extract searchable text from entry
   */
  _extractSearchableText(entry) {
    let text = '';

    switch (entry.type) {
      case 'task_pattern':
        text = `${entry.intent} ${entry.agent} ${entry.description || ''} ${JSON.stringify(entry.parameters || {})}`;
        break;
      case 'workflow':
        text = `${entry.name} ${entry.description || ''} ${entry.steps?.join(' ') || ''}`;
        break;
      case 'csc_service':
        text = `${entry.serviceName} ${entry.description || ''} ${entry.category || ''}`;
        break;
      case 'web_knowledge':
        text = `${entry.topic} ${entry.summary} ${entry.source}`;
        break;
    }

    return text;
  }

  /**
   * Search knowledge base
   */
  async search(query, type = null, limit = 10) {
    const indexPath = this.files.index;
    let index = {};
    try {
      const content = await fs.readFile(indexPath, 'utf8');
      index = JSON.parse(content);
    } catch (error) {
      return [];
    }

    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
    const matches = new Map();

    // Find matching entries
    queryTerms.forEach(term => {
      if (index[term]) {
        index[term].forEach(match => {
          if (!type || match.type === type) {
            const key = match.id;
            if (!matches.has(key)) {
              matches.set(key, { ...match, score: 0 });
            }
            matches.get(key).score += 1;
          }
        });
      }
    });

    // Sort by score and recency
    const sorted = Array.from(matches.values())
      .sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, limit);

    // Fetch full entries
    const results = [];
    for (const match of sorted) {
      const entry = await this._getEntryById(match.id, match.type);
      if (entry) {
        results.push({ ...entry, searchScore: match.score });
      }
    }

    return results;
  }

  /**
   * Get entry by ID
   */
  async _getEntryById(id, type) {
    let fileKey;
    switch (type) {
      case 'task_pattern': fileKey = 'patterns'; break;
      case 'workflow': fileKey = 'workflows'; break;
      case 'csc_service': fileKey = 'cscServices'; break;
      case 'web_knowledge': fileKey = 'webKnowledge'; break;
      default: return null;
    }

    const filePath = this.files[fileKey];
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      return data.find(entry => entry.id === id);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all entries of a type
   */
  async getAll(type, limit = 100) {
    let fileKey;
    switch (type) {
      case 'task_pattern': fileKey = 'patterns'; break;
      case 'workflow': fileKey = 'workflows'; break;
      case 'csc_service': fileKey = 'cscServices'; break;
      case 'web_knowledge': fileKey = 'webKnowledge'; break;
      default: return [];
    }

    const filePath = this.files[fileKey];
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      return data.slice(-limit);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get knowledge statistics
   */
  async getStats() {
    const stats = {};

    for (const [type, filePath] of Object.entries(this.files)) {
      if (type === 'index') continue;
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        stats[type] = data.length;
      } catch (error) {
        stats[type] = 0;
      }
    }

    return stats;
  }
}

module.exports = { KnowledgeStore };