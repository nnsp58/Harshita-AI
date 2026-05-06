/**
 * LearningCollector - Collects and stores learning data from user interactions
 *
 * Collects:
 * - user_input: User's message/query
 * - task_result: Result of task execution
 * - agent_used: Which agent handled the task
 * - execution_time: How long it took
 * - success_or_failure: Whether task succeeded
 */

const fs = require('fs').promises;
const path = require('path');

class LearningCollector {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'learning');
    this.dataFile = path.join(this.dataDir, 'interactions.json');
    this._ensureDataDir();
  }

  async _ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.warn('LearningCollector: Could not create data directory:', error.message);
    }
  }

  /**
   * Collect learning data from a user interaction
   */
  async collect(data) {
    const {
      userId,
      userInput,
      taskResult,
      agentUsed,
      executionTime,
      success,
      timestamp = new Date().toISOString(),
      intent,
      context
    } = data;

    const learningEntry = {
      id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userInput,
      taskResult: this._sanitizeResult(taskResult),
      agentUsed,
      executionTime,
      success,
      timestamp,
      intent,
      context: this._sanitizeContext(context),
      metadata: {
        version: '1.0',
        collectedAt: new Date().toISOString()
      }
    };

    try {
      await this._saveEntry(learningEntry);
      console.log(`[LearningCollector] Collected interaction: ${learningEntry.id}`);
    } catch (error) {
      console.error('[LearningCollector] Failed to save entry:', error.message);
    }
  }

  /**
   * Sanitize task result to remove sensitive data
   */
  _sanitizeResult(result) {
    if (!result) return null;

    // Remove sensitive fields
    const sanitized = { ...result };
    delete sanitized.apiKey;
    delete sanitized.password;
    delete sanitized.token;

    // Limit result size
    if (JSON.stringify(sanitized).length > 10000) {
      return {
        ...sanitized,
        message: sanitized.message?.substring(0, 500) + '... (truncated)',
        data: sanitized.data ? '[DATA_TRUNCATED]' : undefined
      };
    }

    return sanitized;
  }

  /**
   * Sanitize context to remove sensitive data
   */
  _sanitizeContext(context) {
    if (!context) return null;

    const sanitized = { ...context };
    // Remove sensitive fields
    ['password', 'token', 'apiKey', 'secret'].forEach(field => {
      delete sanitized[field];
    });

    return sanitized;
  }

  /**
   * Save entry to storage
   */
  async _saveEntry(entry) {
    try {
      let existingData = [];
      try {
        const content = await fs.readFile(this.dataFile, 'utf8');
        existingData = JSON.parse(content);
        if (!Array.isArray(existingData)) existingData = [];
      } catch (error) {
        // File doesn't exist or invalid, start fresh
        existingData = [];
      }

      existingData.push(entry);

      // Keep only last 1000 entries to prevent file from growing too large
      if (existingData.length > 1000) {
        existingData = existingData.slice(-1000);
      }

      await fs.writeFile(this.dataFile, JSON.stringify(existingData, null, 2));
    } catch (error) {
      throw new Error(`Failed to save learning data: ${error.message}`);
    }
  }

  /**
   * Get learning statistics
   */
  async getStats() {
    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      const data = JSON.parse(content);

      const stats = {
        totalInteractions: data.length,
        successRate: data.filter(d => d.success).length / data.length,
        agentUsage: {},
        averageExecutionTime: 0,
        lastUpdated: data.length > 0 ? data[data.length - 1].timestamp : null
      };

      let totalTime = 0;
      data.forEach(entry => {
        if (entry.agentUsed) {
          stats.agentUsage[entry.agentUsed] = (stats.agentUsage[entry.agentUsed] || 0) + 1;
        }
        if (entry.executionTime) {
          totalTime += entry.executionTime;
        }
      });

      stats.averageExecutionTime = data.length > 0 ? totalTime / data.length : 0;

      return stats;
    } catch (error) {
      console.warn('[LearningCollector] Could not read stats:', error.message);
      return { totalInteractions: 0, successRate: 0, agentUsage: {}, averageExecutionTime: 0 };
    }
  }

  /**
   * Get recent interactions for analysis
   */
  async getRecentInteractions(limit = 50) {
    try {
      const content = await fs.readFile(this.dataFile, 'utf8');
      const data = JSON.parse(content);
      return data.slice(-limit);
    } catch (error) {
      console.warn('[LearningCollector] Could not read interactions:', error.message);
      return [];
    }
  }
}

module.exports = { LearningCollector };