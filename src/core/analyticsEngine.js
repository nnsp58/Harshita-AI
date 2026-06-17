const fs = require('fs');
const path = require('path');

class AnalyticsEngine {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'analytics');
    this.filePath = path.join(this.dataDir, 'stats.json');
    this.stats = {
      totalTasks: 0,
      successTasks: 0,
      toolsUsed: {},
      dailyActiveUsers: {}, // YYYY-MM-DD -> count
    };

    this._init();
  }

  _init() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        if (raw) {
          this.stats = { ...this.stats, ...JSON.parse(raw) };
        }
      } else {
        this._save();
      }
      console.log('📊 Analytics Engine Initialized');
    } catch (err) {
      console.error('❌ Failed to init AnalyticsEngine:', err.message);
    }
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.stats, null, 2));
    } catch (err) {
      console.error('❌ Failed to save analytics:', err.message);
    }
  }

  getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Track an event
   * @param {string} eventName - e.g. "tool_used" or "task_completed"
   * @param {Object} data - e.g. { toolId: "PassportPhotoMaker", success: true }
   */
  trackEvent(eventName, data = {}) {
    const today = this.getTodayDateString();

    if (eventName === 'dashboard_visit') {
      // Mark DAU (Daily Active User - simplified)
      this.stats.dailyActiveUsers[today] = (this.stats.dailyActiveUsers[today] || 0) + 1;
    }

    if (eventName === 'tool_used') {
      this.stats.totalTasks += 1;
      if (data.success) {
        this.stats.successTasks += 1;
      }
      
      const toolId = data.toolId || 'unknown_tool';
      this.stats.toolsUsed[toolId] = (this.stats.toolsUsed[toolId] || 0) + 1;
    }

    this._save();
  }

  /**
   * Return formatted stats for the frontend dashboard
   */
  getDashboardStats() {
    const today = this.getTodayDateString();
    const dau = this.stats.dailyActiveUsers[today] || 0;
    const successRate = this.stats.totalTasks > 0 
      ? Math.round((this.stats.successTasks / this.stats.totalTasks) * 100) 
      : 100;
      
    // Sort top tools
    const sortedTools = Object.entries(this.stats.toolsUsed)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    return {
      totalTasks: this.stats.totalTasks,
      successRate: \`\${successRate}%\`,
      dailyActiveUsers: dau,
      topTools: sortedTools,
    };
  }
}

// Export as singleton
const analyticsEngine = new AnalyticsEngine();
module.exports = { analyticsEngine };
