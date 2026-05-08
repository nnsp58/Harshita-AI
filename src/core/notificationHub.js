/**
 * NotificationHub — Centralized Multi-Channel Notification System
 *
 * Harshita AI का "Communication Center" — सभी users (clients + operators) को
 * हर channel पर connected रखता है।
 *
 * Channels:
 *   1. WhatsApp Push — clients को direct updates
 *   2. Email — operators को business reports + alerts
 *   3. WebSocket Push — dashboard पर real-time notifications
 *   4. SMS (future) — OTP + critical alerts
 *
 * Message Types:
 *   - transactional: form status, OTP, CAPTCHA, completion
 *   - promotional: new jobs, services, offers, tips
 *   - reminder: pending forms, expiring docs, follow-ups
 *   - community: video call invites, announcements, tips
 *
 * Smart Features:
 *   - Time-zone aware sending (no messages at 2 AM!)
 *   - Template-based messages (Hindi + English)
 *   - Unsubscribe management (TRAI compliance)
 *   - Analytics: open rates, delivery stats
 */

const nodemailer = require('nodemailer');
const { LanguageEngine } = require('../core/languageEngine');
const { KnowledgeStore } = require('../core/knowledgeStore');
const crypto = require('crypto');

class NotificationHub {
  constructor(options = {}) {
    this.name = 'NotificationHub';
    this.io = options.io || null;
    this.whatsAppAgent = options.whatsAppAgent || null;
    this.languageEngine = new LanguageEngine();
    this.knowledgeStore = new KnowledgeStore();

    // Email transporter
    this.emailTransporter = this._initEmail();

    // Message queue (in-memory, can be replaced with Redis/BullMQ)
    this.messageQueue = [];
    this.sentLog = [];
    this.maxLogSize = 1000;

    // Unsubscribe list (phone/email → true)
    this.unsubscribed = new Map();

    // Business hours (IST) — avoid sending outside these
    this.businessHours = { start: 8, end: 21 }; // 8 AM - 9 PM IST

    // Templates
    this.templates = this._loadTemplates();
  }

  // ─────────────────────────────────────────────────
  //  EMAIL SETUP
  // ─────────────────────────────────────────────────

  _initEmail() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';

    if (!user || !pass || user === 'your-email@gmail.com') {
      console.log('[NotificationHub] ⚠️ Email not configured — set EMAIL_USER and EMAIL_PASS in .env');
      return null;
    }

    try {
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: { user, pass }
      });
      console.log('[NotificationHub] ✅ Email transporter ready');
      return transporter;
    } catch (e) {
      console.warn('[NotificationHub] ❌ Email init failed:', e.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────────
  //  SEND METHODS
  // ─────────────────────────────────────────────────

  /**
   * Send a notification via all appropriate channels
   *
   * @param {Object} opts
   * @param {string} opts.type — 'transactional' | 'promotional' | 'reminder' | 'community'
   * @param {string} opts.templateId — template key (e.g. 'form_completed', 'new_job_alert')
   * @param {Object} opts.recipient — { name, phone, email, userId, lang }
   * @param {Object} opts.data — template variables (e.g. { jobTitle, salary })
   * @param {Array}  opts.channels — ['whatsapp', 'email', 'push'] (default: all applicable)
   */
  async send(opts) {
    const { type = 'transactional', templateId, recipient, data = {}, channels } = opts;

    // Check unsubscribe
    if (type === 'promotional') {
      if (this.unsubscribed.get(recipient.phone) || this.unsubscribed.get(recipient.email)) {
        console.log(`[NotificationHub] ⏭️ Skipped (unsubscribed): ${recipient.name}`);
        return { sent: false, reason: 'unsubscribed' };
      }
    }

    // Business hours check for promotional messages
    if (type === 'promotional' && !this._isBusinessHours()) {
      // Queue for later
      this.messageQueue.push({ ...opts, scheduledAt: this._nextBusinessHour() });
      console.log(`[NotificationHub] ⏰ Queued for business hours: ${templateId}`);
      return { sent: false, reason: 'queued_for_business_hours' };
    }

    // Resolve template
    const lang = recipient.lang || 'hi';
    const message = this._resolveTemplate(templateId, data, lang);

    const results = {};
    const activeChannels = channels || this._getDefaultChannels(type);

    // WhatsApp
    if (activeChannels.includes('whatsapp') && recipient.phone) {
      results.whatsapp = await this._sendWhatsApp(recipient.phone, message.whatsapp, recipient.name);
    }

    // Email
    if (activeChannels.includes('email') && recipient.email) {
      results.email = await this._sendEmail(
        recipient.email,
        message.emailSubject,
        message.emailHtml,
        recipient.name
      );
    }

    // WebSocket Push
    if (activeChannels.includes('push') && recipient.userId) {
      results.push = this._sendWebSocketPush(recipient.userId, {
        type, templateId, message: message.push, data
      });
    }

    // Log
    this._logSent({ type, templateId, recipient: recipient.name, results, timestamp: new Date() });

    return { sent: true, results };
  }

  /**
   * Broadcast to all operators (CSC/Cyber café centers)
   */
  async broadcastToOperators(templateId, data = {}, channels = ['whatsapp', 'email', 'push']) {
    console.log(`[NotificationHub] 📢 Broadcasting "${templateId}" to all operators`);

    try {
      const { prisma } = require('../models/database');
      const operators = await prisma.user.findMany({
        where: { is_active: true }
      });

      const results = [];
      for (const op of operators) {
        const result = await this.send({
          type: 'community',
          templateId,
          recipient: {
            name: op.name,
            phone: op.phone,
            email: op.email,
            userId: op.id,
            lang: 'hi'
          },
          data,
          channels
        });
        results.push({ operatorId: op.id, ...result });
      }

      return { totalSent: results.filter(r => r.sent).length, total: operators.length, results };
    } catch (error) {
      console.error('[NotificationHub] Broadcast error:', error.message);
      return { totalSent: 0, error: error.message };
    }
  }

  /**
   * Send business promotion to clients
   */
  async sendPromotion(templateId, clientFilters = {}, data = {}) {
    console.log(`[NotificationHub] 🎯 Sending promotion: ${templateId}`);

    try {
      const { prisma } = require('../models/database');
      const candidates = await prisma.candidate.findMany({
        where: { status: 'active', ...clientFilters }
      });

      let sent = 0;
      for (const client of candidates) {
        if (this.unsubscribed.get(client.phone)) continue;

        await this.send({
          type: 'promotional',
          templateId,
          recipient: {
            name: client.fullName || client.firstName,
            phone: client.phone,
            email: client.email,
            lang: 'hi'
          },
          data: { ...data, clientName: client.fullName },
          channels: ['whatsapp']
        });
        sent++;

        // Rate limit: 1 message per second to avoid WhatsApp ban
        await this._sleep(1000);
      }

      return { totalSent: sent, totalClients: candidates.length };
    } catch (error) {
      console.error('[NotificationHub] Promotion error:', error.message);
      return { totalSent: 0, error: error.message };
    }
  }

  // ─────────────────────────────────────────────────
  //  CHANNEL IMPLEMENTATIONS
  // ─────────────────────────────────────────────────

  async _sendWhatsApp(phone, message, recipientName) {
    if (!this.whatsAppAgent || !this.whatsAppAgent.isReady) {
      return { success: false, reason: 'whatsapp_not_connected' };
    }

    try {
      let formattedPhone = String(phone).replace(/\D/g, '');
      if (formattedPhone.length === 10) formattedPhone = '91' + formattedPhone;
      if (!formattedPhone.endsWith('@c.us')) formattedPhone += '@c.us';

      await this.whatsAppAgent._sendMessage(formattedPhone, message);
      console.log(`[NotificationHub] 📱 WhatsApp → ${recipientName}`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async _sendEmail(to, subject, htmlBody, recipientName) {
    if (!this.emailTransporter) {
      return { success: false, reason: 'email_not_configured' };
    }

    try {
      const mailOptions = {
        from: `"Harshita AI" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: this._wrapEmailHtml(htmlBody, recipientName)
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`[NotificationHub] 📧 Email → ${recipientName} (${to})`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  _sendWebSocketPush(userId, data) {
    if (!this.io) return { success: false, reason: 'no_websocket' };

    this.io.to(`user_${userId}`).emit('notification', {
      ...data,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    });
    return { success: true };
  }

  // ─────────────────────────────────────────────────
  //  TEMPLATES
  // ─────────────────────────────────────────────────

  _loadTemplates() {
    return {
      // Transactional
      form_completed: {
        whatsapp: {
          hi: `✅ *फॉर्म सफलतापूर्वक भर दिया गया!*\n\n👤 नाम: {{clientName}}\n📋 सेवा: {{serviceType}}\n🕐 समय: {{timestamp}}\n\nकोई समस्या हो तो अपने CSC सेंटर से संपर्क करें।\n\n— Harshita AI 🤖`,
          en: `✅ *Form Submitted Successfully!*\n\n👤 Name: {{clientName}}\n📋 Service: {{serviceType}}\n🕐 Time: {{timestamp}}\n\nContact your CSC center for any issues.\n\n— Harshita AI 🤖`
        },
        emailSubject: { hi: '✅ आपका फॉर्म भर दिया गया — Harshita AI', en: '✅ Form Submitted — Harshita AI' },
        emailBody: {
          hi: `<h2>✅ फॉर्म सफलतापूर्वक भरा गया</h2><p>नाम: <strong>{{clientName}}</strong></p><p>सेवा: {{serviceType}}</p><p>समय: {{timestamp}}</p>`,
          en: `<h2>✅ Form Submitted Successfully</h2><p>Name: <strong>{{clientName}}</strong></p><p>Service: {{serviceType}}</p><p>Time: {{timestamp}}</p>`
        },
        push: { hi: '✅ {{clientName}} का {{serviceType}} फॉर्म भर दिया गया', en: '✅ {{clientName}} {{serviceType}} form submitted' }
      },

      // Promotional
      new_job_alert: {
        whatsapp: {
          hi: `🎯 *नई सरकारी भर्ती!*\n\n📋 {{jobTitle}}\n🏢 {{agency}}\n💰 सैलरी: {{salary}}\n📅 अंतिम तिथि: {{lastDate}}\n\nक्या मैं आपका फॉर्म भर दूँ?\n👉 "हाँ" लिखें या कॉल करें\n\n— Harshita AI`,
          en: `🎯 *New Government Job!*\n\n📋 {{jobTitle}}\n🏢 {{agency}}\n💰 Salary: {{salary}}\n📅 Last Date: {{lastDate}}\n\nShall I fill your form?\n👉 Reply "Yes"\n\n— Harshita AI`
        },
        emailSubject: { hi: '🎯 नई सरकारी भर्ती — {{jobTitle}}', en: '🎯 New Govt Job — {{jobTitle}}' },
        emailBody: {
          hi: `<h2>🎯 नई सरकारी भर्ती</h2><p><strong>{{jobTitle}}</strong> — {{agency}}</p><p>सैलरी: {{salary}}</p>`,
          en: `<h2>🎯 New Government Job</h2><p><strong>{{jobTitle}}</strong> — {{agency}}</p><p>Salary: {{salary}}</p>`
        },
        push: { hi: '🎯 नई भर्ती: {{jobTitle}} — {{agency}}', en: '🎯 New Job: {{jobTitle}} — {{agency}}' }
      },

      // Reminder
      pending_form: {
        whatsapp: {
          hi: `📋 *अधूरा फॉर्म!*\n\n{{clientName}} जी, आपका {{serviceType}} फॉर्म अभी अधूरा है।\n\nक्या मैं पूरा कर दूँ?\n👉 "हाँ" लिखें\n\n— Harshita AI`,
          en: `📋 *Pending Form!*\n\n{{clientName}}, your {{serviceType}} form is incomplete.\n\nShall I complete it?\n👉 Reply "Yes"\n\n— Harshita AI`
        },
        emailSubject: { hi: '📋 अधूरा फॉर्म — {{serviceType}}', en: '📋 Pending Form — {{serviceType}}' },
        emailBody: { hi: `<h2>📋 अधूरा फॉर्म</h2><p>{{clientName}} जी, आपका {{serviceType}} फॉर्म अभी अधूरा है।</p>`, en: `<h2>📋 Pending Form</h2><p>{{clientName}}, your {{serviceType}} form is incomplete.</p>` },
        push: { hi: '📋 {{clientName}} का {{serviceType}} फॉर्म अधूरा है', en: '📋 {{clientName}} {{serviceType}} form pending' }
      },

      // Community
      video_call_invite: {
        whatsapp: {
          hi: `📹 *Video Conference Invite!*\n\n{{hostName}} ने आपको बुलाया है:\n\n📋 विषय: {{topic}}\n🕐 समय: {{scheduledAt}}\n🔗 Link: {{meetingLink}}\n\nसभी CSC/Cyber Café संचालक जुड़ सकते हैं!\n\n— Harshita AI Community`,
          en: `📹 *Video Conference Invite!*\n\n{{hostName}} invited you:\n\n📋 Topic: {{topic}}\n🕐 Time: {{scheduledAt}}\n🔗 Link: {{meetingLink}}\n\nAll CSC/Cyber Café operators can join!\n\n— Harshita AI Community`
        },
        emailSubject: { hi: '📹 Video Call Invite — {{topic}}', en: '📹 Video Call — {{topic}}' },
        emailBody: { hi: `<h2>📹 Video Conference</h2><p>विषय: {{topic}}</p><p><a href="{{meetingLink}}">Join Now</a></p>`, en: `<h2>📹 Video Conference</h2><p>Topic: {{topic}}</p><p><a href="{{meetingLink}}">Join Now</a></p>` },
        push: { hi: '📹 Video Call: {{topic}} — अभी join करें!', en: '📹 Video Call: {{topic}} — Join now!' }
      },

      // Operator Business Report
      daily_report: {
        emailSubject: { hi: '📊 दैनिक रिपोर्ट — Harshita AI', en: '📊 Daily Report — Harshita AI' },
        emailBody: {
          hi: `<h2>📊 आज की रिपोर्ट</h2><p>फॉर्म भरे: <strong>{{formsFilled}}</strong></p><p>नए ग्राहक: <strong>{{newClients}}</strong></p><p>कमाई: <strong>₹{{revenue}}</strong></p>`,
          en: `<h2>📊 Daily Report</h2><p>Forms Filled: <strong>{{formsFilled}}</strong></p><p>New Clients: <strong>{{newClients}}</strong></p><p>Revenue: <strong>₹{{revenue}}</strong></p>`
        },
        whatsapp: { hi: `📊 *आज की रिपोर्ट*\n\n📋 फॉर्म भरे: {{formsFilled}}\n👤 नए ग्राहक: {{newClients}}\n💰 कमाई: ₹{{revenue}}\n\n— Harshita AI`, en: `📊 *Daily Report*\n\nForms: {{formsFilled}}\nNew Clients: {{newClients}}\nRevenue: ₹{{revenue}}` },
        push: { hi: '📊 आज {{formsFilled}} फॉर्म भरे — ₹{{revenue}} कमाई', en: '📊 {{formsFilled}} forms today — ₹{{revenue}} revenue' }
      }
    };
  }

  _resolveTemplate(templateId, data, lang) {
    const template = this.templates[templateId];
    if (!template) {
      return {
        whatsapp: data.message || 'Notification from Harshita AI',
        emailSubject: 'Harshita AI Notification',
        emailHtml: `<p>${data.message || 'You have a notification'}</p>`,
        push: data.message || 'New notification'
      };
    }

    const effectiveLang = (lang === 'hi' || lang === 'hi-Latn' || lang === 'mr') ? 'hi' : 'en';

    const resolve = (text) => {
      if (!text) return '';
      return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
    };

    return {
      whatsapp: resolve(template.whatsapp?.[effectiveLang] || template.whatsapp?.hi || ''),
      emailSubject: resolve(template.emailSubject?.[effectiveLang] || template.emailSubject?.hi || ''),
      emailHtml: resolve(template.emailBody?.[effectiveLang] || template.emailBody?.hi || ''),
      push: resolve(template.push?.[effectiveLang] || template.push?.hi || '')
    };
  }

  _wrapEmailHtml(body, recipientName) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🤖 Harshita AI</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Smart CSC Automation Platform</p>
    </div>
    <div style="padding: 24px;">
      <p style="color: #666;">नमस्ते <strong>${recipientName || ''}</strong>,</p>
      ${body}
    </div>
    <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #999;">
      <p>Powered by Harshita AI 🇮🇳 | <a href="#" style="color: #667eea;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
  }

  // ─────────────────────────────────────────────────
  //  UTILITIES
  // ─────────────────────────────────────────────────

  _isBusinessHours() {
    const now = new Date();
    const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 1 : 0);
    return istHour >= this.businessHours.start && istHour < this.businessHours.end;
  }

  _nextBusinessHour() {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(this.businessHours.start - 5, 30, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  _getDefaultChannels(type) {
    switch (type) {
      case 'transactional': return ['whatsapp', 'push'];
      case 'promotional': return ['whatsapp'];
      case 'reminder': return ['whatsapp', 'push'];
      case 'community': return ['whatsapp', 'email', 'push'];
      default: return ['push'];
    }
  }

  _logSent(entry) {
    this.sentLog.push(entry);
    if (this.sentLog.length > this.maxLogSize) {
      this.sentLog = this.sentLog.slice(-this.maxLogSize);
    }
  }

  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /**
   * Manage unsubscribe
   */
  unsubscribe(identifier) {
    this.unsubscribed.set(identifier, true);
    console.log(`[NotificationHub] 🚫 Unsubscribed: ${identifier}`);
  }

  resubscribe(identifier) {
    this.unsubscribed.delete(identifier);
    console.log(`[NotificationHub] ✅ Resubscribed: ${identifier}`);
  }

  /**
   * Process queued messages (call periodically)
   */
  async processQueue() {
    if (this.messageQueue.length === 0) return;
    if (!this._isBusinessHours()) return;

    console.log(`[NotificationHub] 📤 Processing ${this.messageQueue.length} queued messages`);
    const toProcess = [...this.messageQueue];
    this.messageQueue = [];

    for (const msg of toProcess) {
      await this.send(msg);
      await this._sleep(500);
    }
  }

  /**
   * Get notification stats
   */
  getStats() {
    const last24h = this.sentLog.filter(e => Date.now() - new Date(e.timestamp).getTime() < 86400000);
    return {
      totalSent: this.sentLog.length,
      last24Hours: last24h.length,
      queuedMessages: this.messageQueue.length,
      unsubscribedCount: this.unsubscribed.size,
      byChannel: {
        whatsapp: last24h.filter(e => e.results?.whatsapp?.success).length,
        email: last24h.filter(e => e.results?.email?.success).length,
        push: last24h.filter(e => e.results?.push?.success).length
      }
    };
  }
}

module.exports = { NotificationHub };
