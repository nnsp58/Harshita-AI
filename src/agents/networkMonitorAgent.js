/**
 * NetworkMonitorAgent — PRD Required Agent
 * 
 * Network aware pause/resume — job ko network failure par pause karta hai
 * aur connection wapas aane par automatic resume karta hai.
 * Cost: ₹0 (Node.js built-in dns module)
 */
const dns = require('dns').promises;

class NetworkMonitorAgent {
  constructor(io = null) {
    this.io = io;
    this.isOnline = true;
    this.checkInterval = null;
    this.pausedJobs = new Map(); // jobId -> { pauseCallback, status }
    this.CHECK_INTERVAL_MS = 5000; // Check every 5s
    this.DNS_CHECK_HOST = 'google.com';
  }

  // Start monitoring
  start() {
    if (this.checkInterval) return;
    console.log('📡 NetworkMonitorAgent started');
    this.checkInterval = setInterval(() => this._checkConnectivity(), this.CHECK_INTERVAL_MS);
    this._checkConnectivity(); // Immediate first check
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('📡 NetworkMonitorAgent stopped');
  }

  // Internal connectivity check using DNS (free, no API key)
  async _checkConnectivity() {
    try {
      await dns.lookup(this.DNS_CHECK_HOST);
      
      if (!this.isOnline) {
        // Just came back online!
        this.isOnline = true;
        console.log('🟢 Network restored! Resuming paused jobs...');
        this._notifyClients('network_restored', { status: 'online' });
        await this._resumeAllPausedJobs();
      }
    } catch {
      if (this.isOnline) {
        // Just went offline!
        this.isOnline = false;
        console.warn('🔴 Network lost! Pausing active jobs...');
        this._notifyClients('network_lost', { status: 'offline' });
      }
    }
  }

  // Register a running job so it can be paused on network failure
  registerJob(jobId, { onPause, onResume }) {
    this.pausedJobs.set(jobId, { onPause, onResume, paused: false });
    console.log(`📡 NetworkMonitor watching job: ${jobId}`);
  }

  unregisterJob(jobId) {
    this.pausedJobs.delete(jobId);
  }

  // Pause a specific job
  async pauseJob(jobId) {
    const job = this.pausedJobs.get(jobId);
    if (job && !job.paused) {
      job.paused = true;
      if (job.onPause) await job.onPause();
      console.log(`⏸️ Job ${jobId} paused (network lost)`);
    }
  }

  // Resume all paused jobs when network restores
  async _resumeAllPausedJobs() {
    for (const [jobId, job] of this.pausedJobs.entries()) {
      if (job.paused) {
        job.paused = false;
        if (job.onResume) {
          try {
            await job.onResume();
            console.log(`▶️ Job ${jobId} resumed (network restored)`);
          } catch (err) {
            console.error(`❌ Failed to resume job ${jobId}:`, err.message);
          }
        }
      }
    }
  }

  // Notify VLE dashboard via WebSocket
  _notifyClients(event, data) {
    if (this.io) {
      this.io.emit(event, { ...data, timestamp: new Date() });
    }
  }

  // Get current status
  getStatus() {
    return {
      online: this.isOnline,
      monitoringJobs: this.pausedJobs.size,
      pausedJobs: [...this.pausedJobs.entries()]
        .filter(([, j]) => j.paused)
        .map(([id]) => id)
    };
  }
}

module.exports = { NetworkMonitorAgent };
