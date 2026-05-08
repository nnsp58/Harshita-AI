/**
 * ProactiveAgent — Hermes-style Proactive Suggestion System
 *
 * Instead of waiting for the operator to ask, Harshita AI proactively:
 *   1. Scans candidate profiles for expiring documents
 *   2. Matches new job notifications to existing candidates
 *   3. Detects incomplete applications and reminds operators
 *   4. Sends WhatsApp alerts automatically
 *
 * Scheduler: Runs a periodic check (configurable interval, default: every 6 hours)
 *
 * This is the "Digital Employee" upgrade — Harshita doesn't just obey,
 * she FINDS WORK and brings it to you.
 */

const { JobSearchAgent } = require('../agents/jobSearchAgent');
const { KnowledgeStore } = require('./knowledgeStore');
const path = require('path');

class ProactiveAgent {
  constructor(options = {}) {
    this.name = 'ProactiveAgent';
    this.io = options.io || null;
    this.whatsAppAgent = options.whatsAppAgent || null;
    this.jobSearch = new JobSearchAgent();
    this.knowledgeStore = new KnowledgeStore();

    // Scheduler interval (default 6 hours)
    this.checkIntervalMs = options.checkIntervalMs || 6 * 60 * 60 * 1000;
    this.schedulerHandle = null;

    // In-memory alert tracker (prevent duplicate alerts)
    this.sentAlerts = new Map(); // key → timestamp
    this.alertCooldownMs = 24 * 60 * 60 * 1000; // Don't re-alert for 24h
  }

  /**
   * Start the proactive scheduler
   */
  start() {
    console.log(`[ProactiveAgent] 🚀 Started — checking every ${this.checkIntervalMs / 3600000}h`);

    // Run once immediately
    this._runChecks().catch(e => console.error('[ProactiveAgent] Initial check error:', e.message));

    // Then schedule periodic runs
    this.schedulerHandle = setInterval(() => {
      this._runChecks().catch(e => console.error('[ProactiveAgent] Scheduled check error:', e.message));
    }, this.checkIntervalMs);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.schedulerHandle) {
      clearInterval(this.schedulerHandle);
      this.schedulerHandle = null;
      console.log('[ProactiveAgent] 🛑 Stopped');
    }
  }

  /**
   * Main check loop — runs all proactive checks
   */
  async _runChecks() {
    console.log(`[ProactiveAgent] 🔍 Running proactive checks at ${new Date().toISOString()}`);

    const alerts = [];

    // 1. Check for expiring documents
    const expiryAlerts = await this._checkDocumentExpiry();
    alerts.push(...expiryAlerts);

    // 2. Match candidates to new jobs
    const jobAlerts = await this._matchCandidatesToJobs();
    alerts.push(...jobAlerts);

    // 3. Check for incomplete applications
    const incompleteAlerts = await this._checkIncompleteApplications();
    alerts.push(...incompleteAlerts);

    // Send alerts
    for (const alert of alerts) {
      await this._sendAlert(alert);
    }

    console.log(`[ProactiveAgent] ✅ Check complete — ${alerts.length} new alerts generated`);
    return alerts;
  }

  /**
   * CHECK 1: Document Expiry Detection
   * Scans candidate profiles for Aadhaar/PAN/certificates nearing expiry.
   */
  async _checkDocumentExpiry() {
    const alerts = [];

    try {
      const { prisma } = require('../models/database');
      const candidates = await prisma.candidate.findMany({
        include: { documents: true }
      });

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      for (const candidate of candidates) {
        for (const doc of candidate.documents) {
          if (doc.expiryDate && new Date(doc.expiryDate) <= thirtyDaysFromNow) {
            const daysLeft = Math.ceil((new Date(doc.expiryDate) - now) / (24 * 60 * 60 * 1000));
            const alertKey = `expiry_${candidate.id}_${doc.id}`;

            if (!this._wasAlertedRecently(alertKey)) {
              alerts.push({
                type: 'document_expiry',
                priority: daysLeft <= 7 ? 'high' : 'medium',
                candidateId: candidate.id,
                candidateName: candidate.fullName || candidate.firstName,
                phone: candidate.phone,
                operatorId: candidate.userId,
                message: `⚠️ ${candidate.fullName || 'Candidate'} का ${doc.type || 'Document'} ${daysLeft} दिनों में एक्सपायर हो रहा है। कृपया नया डॉक्यूमेंट अपलोड करें।`,
                messageHindi: `${candidate.fullName} जी, आपका ${doc.type} ${daysLeft} दिनों में एक्सपायर हो जाएगा। कृपया अपने नजदीकी CSC सेंटर पर जाकर नया बनवाएं।`,
                data: { documentType: doc.type, expiryDate: doc.expiryDate, daysLeft },
                alertKey
              });
            }
          }
        }
      }
    } catch (error) {
      // Database might not be available in all environments
      console.warn('[ProactiveAgent] Document expiry check skipped:', error.message);
    }

    return alerts;
  }

  /**
   * CHECK 2: Job Matching
   * Matches candidate qualifications to available government jobs.
   */
  async _matchCandidatesToJobs() {
    const alerts = [];

    try {
      const { prisma } = require('../models/database');
      const candidates = await prisma.candidate.findMany({
        where: { verification_status: 'verified' }
      });

      for (const candidate of candidates) {
        const qualification = candidate.qualification || candidate.education;
        if (!qualification) continue;

        // Age check
        const age = candidate.dob ? this._calculateAge(candidate.dob) : null;

        // Search matching jobs
        const result = await this.jobSearch.searchJobsByQualification(qualification);

        if (result.success && result.jobs) {
          // Filter by age eligibility
          const eligibleJobs = result.jobs.filter(job => {
            if (!age) return true;
            return age >= job.minAge && age <= (parseInt(job.ageLimit) || job.maxAge || 100);
          });

          for (const job of eligibleJobs) {
            const alertKey = `job_${candidate.id}_${job.id}`;

            if (!this._wasAlertedRecently(alertKey)) {
              alerts.push({
                type: 'job_match',
                priority: 'medium',
                candidateId: candidate.id,
                candidateName: candidate.fullName || candidate.firstName,
                phone: candidate.phone,
                operatorId: candidate.userId,
                message: `🎯 ${candidate.fullName || 'Candidate'} के लिए नई भर्ती: *${job.title}* (${job.agency}) — सैलरी: ${job.salary}`,
                messageHindi: `नमस्ते ${candidate.fullName}! *${job.title}* में नई भर्ती आई है। योग्यता: ${job.qualification}, सैलरी: ${job.salary}। क्या मैं आपका फॉर्म भर दूँ? "हाँ" लिखें।`,
                data: {
                  jobId: job.id,
                  jobTitle: job.title,
                  agency: job.agency,
                  salary: job.salary,
                  lastDate: job.lastDate,
                  link: job.link
                },
                alertKey
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('[ProactiveAgent] Job matching check skipped:', error.message);
    }

    return alerts;
  }

  /**
   * CHECK 3: Incomplete Applications
   * Find jobs that were started but not completed.
   */
  async _checkIncompleteApplications() {
    const alerts = [];

    try {
      const { prisma } = require('../models/database');
      const incompleteJobs = await prisma.job.findMany({
        where: {
          status: { in: ['running', 'failed', 'queued'] },
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        },
        include: { candidate: true }
      });

      for (const job of incompleteJobs) {
        const alertKey = `incomplete_${job.id}`;

        if (!this._wasAlertedRecently(alertKey)) {
          const daysAgo = Math.ceil((Date.now() - new Date(job.created_at).getTime()) / (24 * 60 * 60 * 1000));

          alerts.push({
            type: 'incomplete_application',
            priority: job.status === 'failed' ? 'high' : 'low',
            candidateId: job.candidateId,
            candidateName: job.candidate?.fullName || 'Unknown',
            operatorId: job.userId,
            message: `📋 ${job.candidate?.fullName || 'Candidate'} का ${job.serviceType} फॉर्म ${daysAgo} दिन पहले "${job.status}" हो गया था। क्या दोबारा कोशिश करें?`,
            data: {
              jobId: job.id,
              serviceType: job.serviceType,
              status: job.status,
              daysAgo
            },
            alertKey
          });
        }
      }
    } catch (error) {
      console.warn('[ProactiveAgent] Incomplete applications check skipped:', error.message);
    }

    return alerts;
  }

  /**
   * Send alert via multiple channels
   */
  async _sendAlert(alert) {
    // Mark as sent
    this.sentAlerts.set(alert.alertKey, Date.now());

    console.log(`[ProactiveAgent] 📢 Alert [${alert.type}/${alert.priority}]: ${alert.message}`);

    // Channel 1: WebSocket (Dashboard)
    if (this.io) {
      this.io.emit('proactive_alert', {
        ...alert,
        timestamp: new Date().toISOString()
      });

      // Also emit to specific operator room
      if (alert.operatorId) {
        this.io.to(`user_${alert.operatorId}`).emit('proactive_alert', {
          ...alert,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Channel 2: WhatsApp (Candidate notification)
    if (this.whatsAppAgent && this.whatsAppAgent.isReady && alert.phone) {
      try {
        const whatsappNumber = this._formatPhoneForWhatsApp(alert.phone);
        if (whatsappNumber) {
          await this.whatsAppAgent._sendMessage(whatsappNumber, alert.messageHindi || alert.message);
          console.log(`[ProactiveAgent] 📱 WhatsApp sent to ${alert.phone}`);
        }
      } catch (e) {
        console.warn(`[ProactiveAgent] WhatsApp send failed: ${e.message}`);
      }
    }

    // Channel 3: Store in knowledge base for audit trail
    try {
      await this.knowledgeStore.storeTaskPattern({
        intent: 'proactive_alert',
        type: alert.type,
        priority: alert.priority,
        candidateId: alert.candidateId,
        message: alert.message,
        data: alert.data,
        sentAt: new Date().toISOString()
      });
    } catch (e) {
      // Silent fail — not critical
    }
  }

  /**
   * Check if an alert was sent recently (within cooldown period)
   */
  _wasAlertedRecently(alertKey) {
    const lastSent = this.sentAlerts.get(alertKey);
    if (!lastSent) return false;
    return (Date.now() - lastSent) < this.alertCooldownMs;
  }

  /**
   * Calculate age from DOB
   */
  _calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Format Indian phone number for WhatsApp
   */
  _formatPhoneForWhatsApp(phone) {
    if (!phone) return null;
    let cleaned = String(phone).replace(/\D/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned + '@c.us';
    }
    return null;
  }

  /**
   * Manual trigger — run all checks immediately (for API endpoint)
   */
  async runNow() {
    return await this._runChecks();
  }

  /**
   * Get proactive stats
   */
  getStats() {
    return {
      isRunning: !!this.schedulerHandle,
      checkIntervalHours: this.checkIntervalMs / 3600000,
      totalAlertsSent: this.sentAlerts.size,
      activeAlertKeys: Array.from(this.sentAlerts.keys()).slice(-20)
    };
  }
}

module.exports = { ProactiveAgent };
