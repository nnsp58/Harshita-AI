/**
 * EmailService — Custom Domain Email (username@n-dizi.in)
 *
 * Manages email accounts on custom domain for CSC operators & clients.
 *
 * Architecture:
 *   - Account CRUD: Create/delete/list mailboxes (stored in DB/JSON)
 *   - Send: Nodemailer SMTP (via domain's mail server)
 *   - Receive: IMAP (imapflow) for webmail reading
 *   - Webmail API: REST endpoints for inbox/compose/reply
 *
 * Mail Server Backend Options:
 *   1. Mailcow (Docker) — self-hosted, full-featured, FREE
 *   2. Zoho Mail API — free for 5 users, paid beyond
 *   3. cPanel/WHM — if hosting supports it
 *
 * Prerequisites:
 *   - Domain DNS: MX, SPF, DKIM, DMARC records configured
 *   - SMTP server running on the domain (Postfix/Mailcow/Zoho)
 *
 * Cost: ₹0 (self-hosted) or ₹50-200/user/month (Zoho/Google Workspace)
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor(options = {}) {
    this.name = 'EmailService';
    this.domain = options.domain || process.env.EMAIL_DOMAIN || 'n-dizi.in';
    this.accountsFile = path.join(process.cwd(), 'data', 'knowledge', 'email_accounts.json');

    // SMTP config for sending (domain's mail server)
    this.smtpConfig = {
      host: options.smtpHost || process.env.MAIL_SMTP_HOST || `mail.${this.domain}`,
      port: parseInt(process.env.MAIL_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_ADMIN_USER || `admin@${this.domain}`,
        pass: process.env.MAIL_ADMIN_PASS || ''
      }
    };

    // IMAP config for reading (domain's mail server)
    this.imapConfig = {
      host: options.imapHost || process.env.MAIL_IMAP_HOST || `mail.${this.domain}`,
      port: parseInt(process.env.MAIL_IMAP_PORT) || 993,
      secure: true
    };

    // Mailcow API (if using Mailcow as backend)
    this.mailcowApi = process.env.MAILCOW_API_URL || null;
    this.mailcowApiKey = process.env.MAILCOW_API_KEY || null;

    this._ensureFiles();
  }

  async _ensureFiles() {
    const dir = path.dirname(this.accountsFile);
    try {
      await fs.mkdir(dir, { recursive: true });
      try { await fs.access(this.accountsFile); } catch {
        await fs.writeFile(this.accountsFile, JSON.stringify({
          accounts: [], domain: this.domain, createdAt: new Date().toISOString()
        }, null, 2));
      }
    } catch (e) { console.warn('[EmailService] Init error:', e.message); }
  }

  // ═══════════════════════════════════════
  //  ACCOUNT MANAGEMENT
  // ═══════════════════════════════════════

  /**
   * Create a new email account: username@n-dizi.in
   */
  async createAccount(opts) {
    const { username, fullName, password, userId, role = 'user' } = opts;

    // Validate username
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return { success: false, error: 'Username must be 3-30 characters (letters, numbers, dots, hyphens)' };
    }

    const email = `${cleanUsername}@${this.domain}`;

    // Check if already exists
    const data = await this._loadAccounts();
    if (data.accounts.find(a => a.email === email)) {
      return { success: false, error: `Email ${email} already exists` };
    }

    // Check reserved usernames
    const reserved = ['admin', 'postmaster', 'abuse', 'webmaster', 'info', 'support', 'noreply', 'root', 'mail'];
    if (reserved.includes(cleanUsername)) {
      return { success: false, error: 'This username is reserved' };
    }

    // Create account in mail server backend
    const serverResult = await this._createMailboxOnServer(cleanUsername, password, fullName);

    const account = {
      id: crypto.randomUUID(),
      email,
      username: cleanUsername,
      fullName,
      userId,
      role, // 'admin' | 'operator' | 'user'
      quota: role === 'admin' ? '5G' : '1G',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      serverProvisioned: serverResult.success
    };

    data.accounts.push(account);
    await this._saveAccounts(data);

    console.log(`[EmailService] ✅ Created: ${email} for ${fullName}`);

    return {
      success: true,
      email,
      account: { id: account.id, email, fullName, role, quota: account.quota },
      serverProvisioned: serverResult.success,
      serverMessage: serverResult.message,
      smtpSettings: {
        server: this.smtpConfig.host,
        port: this.smtpConfig.port,
        username: email,
        security: 'STARTTLS'
      },
      imapSettings: {
        server: this.imapConfig.host,
        port: this.imapConfig.port,
        username: email,
        security: 'SSL/TLS'
      }
    };
  }

  /**
   * Provision mailbox on the actual mail server (Updated for Mailcow API Spec)
   */
  async _createMailboxOnServer(username, password, fullName) {
    const email = `${username}@${this.domain}`;

    if (this.mailcowApi && this.mailcowApiKey) {
      try {
        const axios = require('axios');
        
        // Ensure domain exists first
        await this.setupDomain();

        const response = await axios.post(`${this.mailcowApi}/api/v1/add/mailbox`, {
          local_part: username,
          domain: this.domain,
          name: fullName,
          password: password,
          password2: password,
          quota: "2048", // MB as string (per docs example)
          active: "1",   // as string
          force_pw_update: "0"
        }, {
          headers: { 'X-API-Key': this.mailcowApiKey, 'Content-Type': 'application/json' }
        });

        // Mailcow returns an array of response objects
        const result = Array.isArray(response.data) ? response.data[0] : response.data;
        
        if (result.type === 'success') {
          return { success: true, message: 'Mailbox created successfully' };
        } else {
          return { success: false, message: result.msg?.[0] || 'Mailcow error' };
        }
      } catch (e) {
        return { success: false, message: `Mailcow API error: ${e.response?.data?.[0]?.msg?.[0] || e.message}` };
      }
    }

    return {
      success: false,
      message: 'Account saved locally. No mail server backend configured.'
    };
  }

  /**
   * Ensure the domain is configured in Mailcow
   */
  async setupDomain() {
    if (!this.mailcowApi || !this.mailcowApiKey) return;
    
    try {
      const axios = require('axios');
      // Check if domain exists
      const check = await axios.get(`${this.mailcowApi}/api/v1/get/domain/${this.domain}`, {
        headers: { 'X-API-Key': this.mailcowApiKey }
      });

      if (!check.data || Object.keys(check.data).length === 0) {
        console.log(`[EmailService] 🌐 Adding domain ${this.domain} to Mailcow...`);
        await axios.post(`${this.mailcowApi}/api/v1/add/domain`, {
          domain: this.domain,
          description: "Harshita AI Managed Domain",
          active: "1",
          quota: "10240", // 10GB for domain
          mailboxes: "100",
          defquota: "1024"
        }, {
          headers: { 'X-API-Key': this.mailcowApiKey }
        });
      }
    } catch (e) {
      console.warn('[EmailService] Domain setup warning:', e.message);
    }
  }

  /**
   * Fetch DKIM Public Key for DNS setup
   */
  async getDkimKey() {
    if (!this.mailcowApi || !this.mailcowApiKey) return null;
    try {
      const axios = require('axios');
      const response = await axios.get(`${this.mailcowApi}/api/v1/get/dkim/${this.domain}`, {
        headers: { 'X-API-Key': this.mailcowApiKey }
      });
      return response.data?.dkim_txt || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Delete an email account
   */
  async deleteAccount(email) {
    const data = await this._loadAccounts();
    const idx = data.accounts.findIndex(a => a.email === email);
    if (idx === -1) return { success: false, error: 'Account not found' };

    data.accounts.splice(idx, 1);
    await this._saveAccounts(data);
    console.log(`[EmailService] 🗑️ Deleted: ${email}`);
    return { success: true };
  }

  /**
   * List all email accounts
   */
  async listAccounts(filters = {}) {
    const data = await this._loadAccounts();
    let accounts = data.accounts;
    if (filters.status) accounts = accounts.filter(a => a.status === filters.status);
    if (filters.role) accounts = accounts.filter(a => a.role === filters.role);
    return {
      domain: this.domain,
      total: accounts.length,
      accounts: accounts.map(a => ({
        id: a.id, email: a.email, fullName: a.fullName,
        role: a.role, status: a.status, createdAt: a.createdAt
      }))
    };
  }

  /**
   * Check if a username is available
   */
  async checkAvailability(username) {
    const clean = username.toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const email = `${clean}@${this.domain}`;
    const data = await this._loadAccounts();
    const taken = data.accounts.some(a => a.email === email);
    return { username: clean, email, available: !taken, domain: this.domain };
  }

  // ═══════════════════════════════════════
  //  SEND / RECEIVE (Webmail API)
  // ═══════════════════════════════════════

  /**
   * Send email from a user's account
   */
  async sendMail(opts) {
    const { from, to, subject, body, html, attachments } = opts;

    // Verify sender is a valid account
    const data = await this._loadAccounts();
    const account = data.accounts.find(a => a.email === from && a.status === 'active');
    if (!account) return { success: false, error: 'Sender account not found or inactive' };

    try {
      const transporter = nodemailer.createTransport({
        ...this.smtpConfig,
        auth: { user: from, pass: opts.password || this.smtpConfig.auth.pass }
      });

      const info = await transporter.sendMail({
        from: `"${account.fullName}" <${from}>`,
        to,
        subject,
        text: body,
        html: html || undefined,
        attachments: attachments || undefined
      });

      console.log(`[EmailService] 📧 Sent: ${from} → ${to} | ${subject}`);
      return { success: true, messageId: info.messageId };
    } catch (e) {
      return { success: false, error: `Send failed: ${e.message}` };
    }
  }

  /**
   * Read inbox via IMAP
   */
  async getInbox(email, password, limit = 20) {
    try {
      const { ImapFlow } = require('imapflow');
      const client = new ImapFlow({
        host: this.imapConfig.host,
        port: this.imapConfig.port,
        secure: this.imapConfig.secure,
        auth: { user: email, pass: password },
        logger: false
      });

      await client.connect();
      const lock = await client.getMailboxLock('INBOX');
      const messages = [];

      try {
        const totalMessages = client.mailbox.exists;
        const startSeq = Math.max(1, totalMessages - limit + 1);

        for await (const msg of client.fetch(`${startSeq}:*`, {
          envelope: true, flags: true, bodyStructure: true
        })) {
          messages.push({
            uid: msg.uid,
            subject: msg.envelope.subject,
            from: msg.envelope.from?.[0] || {},
            to: msg.envelope.to || [],
            date: msg.envelope.date,
            flags: Array.from(msg.flags),
            isRead: msg.flags.has('\\Seen'),
            isStarred: msg.flags.has('\\Flagged')
          });
        }
      } finally {
        lock.release();
      }

      await client.logout();
      return { success: true, total: messages.length, messages: messages.reverse() };
    } catch (e) {
      return { success: false, error: `IMAP error: ${e.message}`, messages: [] };
    }
  }

  // ═══════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════

  async _loadAccounts() {
    try {
      const raw = await fs.readFile(this.accountsFile, 'utf8');
      return JSON.parse(raw);
    } catch { return { accounts: [], domain: this.domain }; }
  }

  async _saveAccounts(data) {
    await fs.writeFile(this.accountsFile, JSON.stringify(data, null, 2));
  }

  /**
   * Get DNS records needed for email setup
   */
  async getDnsSetupGuide() {
    const dkimKey = await this.getDkimKey();
    
    return {
      domain: this.domain,
      records: [
        { type: 'MX', host: '@', value: `mail.${this.domain}`, priority: 10, purpose: 'Mail routing' },
        { type: 'A', host: 'mail', value: 'YOUR_SERVER_IP', purpose: 'Mail server IP' },
        { type: 'TXT', host: '@', value: `v=spf1 mx a ip4:YOUR_SERVER_IP ~all`, purpose: 'SPF (anti-spam)' },
        { type: 'TXT', host: '_dmarc', value: 'v=DMARC1; p=quarantine; rua=mailto:admin@' + this.domain, purpose: 'DMARC policy' },
        { type: 'TXT', host: 'dkim._domainkey', value: dkimKey || '(generated by mail server)', purpose: 'DKIM signing' },
        { type: 'CNAME', host: 'autoconfig', value: `mail.${this.domain}`, purpose: 'Auto-config for Thunderbird' },
        { type: 'SRV', host: '_autodiscover._tcp', value: `mail.${this.domain}`, purpose: 'Auto-discover for Outlook' }
      ],
      setup_steps: [
        '1. VPS पर Mailcow install करें (docker-compose)',
        '2. Mailcow UI में API key generate करें और Whitelist IP सेट करें',
        '3. .env में MAILCOW_API_URL और API_KEY डालें',
        '4. DNS records (ऊपर दिए गए) अपने domain provider में डालें',
        '5. Harshita AI अब automatically accounts बनाएगी और मैनेज करेगी'
      ]
    };
  }

  getStats() {
    return this._loadAccounts().then(data => ({
      domain: this.domain,
      totalAccounts: data.accounts.length,
      activeAccounts: data.accounts.filter(a => a.status === 'active').length,
      mailServerConfigured: !!(this.mailcowApi && this.mailcowApiKey)
    }));
  }
}

module.exports = { EmailService };
