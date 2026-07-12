/**
 * SystemMonitor - Health checks and cost protector for HASA Sovereign Architecture
 */

const { prisma } = require('../models/database');
const { aiProviderManager } = require('./aiProviderManager');
const fs = require('fs');
const path = require('path');

class SystemMonitor {
  constructor() {
    this.interval = null;
  }

  start() {
    // Check every 5 minutes
    this.interval = setInterval(() => this.runHealthChecks(), 5 * 60 * 1000);
    console.log('🩺 HASA SystemMonitor: API health tracker active (runs every 5 mins)');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  async runHealthChecks() {
    console.log('[SystemMonitor] Running API health checks...');
    const providers = ['openai', 'gemini', 'groq', 'deepseek', 'qwen', 'local_ollama'];

    for (const provider of providers) {
      if (!aiProviderManager.providers.has(provider)) {
        continue;
      }

      const client = aiProviderManager.providers.get(provider);
      const model = aiProviderManager.getModel('default', provider);
      const startTime = Date.now();
      let healthy = true;
      let latency = 9999;
      let error = null;

      try {
        // Run a simple lightweight request
        await client.chat.completions.create({
          model,
          messages: [{ role: 'user', content: 'health check' }],
          max_tokens: 5
        });
        latency = Date.now() - startTime;
      } catch (err) {
        healthy = false;
        error = err.message;
      }

      // Update provider status
      aiProviderManager.providerStatus.set(provider, {
        healthy,
        latency,
        failures: healthy ? 0 : 3 // instantly mark down if health check fails
      });

      // Write logs to DB (if prisma is ready)
      try {
        if (prisma) {
          await prisma.improvementRegistry.create({
            data: {
              issue: `Provider ${provider} is ${healthy ? 'ONLINE' : 'OFFLINE'}`,
              severity: healthy ? 'info' : 'critical',
              moduleName: 'HASA_Sovereign_Infrastructure',
              rootCause: error || `Latency: ${latency}ms`,
              status: healthy ? 'fixed' : 'detected',
              fixApplied: `Traffic rerouted away from ${provider}`
            }
          });
        }
      } catch (dbErr) {
        console.error('[SystemMonitor] Failed to write logs to DB:', dbErr.message);
      }
    }
  }

  /**
   * Daily Sovereign Database Backup
   */
  async performBackup() {
    try {
      const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
      const backupDir = path.resolve(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      if (fs.existsSync(dbPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
        fs.copyFileSync(dbPath, backupPath);
        console.log(`💾 HASA Backup: Database saved successfully to ${backupPath}`);
        return true;
      }
    } catch (err) {
      console.error('❌ HASA Backup failed:', err.message);
    }
    return false;
  }
}

const systemMonitor = new SystemMonitor();

module.exports = { SystemMonitor, systemMonitor };
