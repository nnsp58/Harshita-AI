const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cron = require('node-cron');
const { prisma } = require('../models/database');
const { AISkillHelper } = require('../skills/AISkillHelper');

class WhatsAppSuperEngine {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.sessions = new Map(); // phone -> context
  }

  start() {
    if (this.client) return;
    
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', (qr) => {
      console.log('WhatsApp QR Code generated. Scan to connect.');
      // In a real frontend, we would push this QR to the user via Socket.IO
    });

    this.client.on('ready', () => {
      console.log('WhatsApp Super Engine is READY');
      this.isReady = true;
    });

    this.client.on('disconnected', () => {
      console.log('WhatsApp Super Engine DISCONNECTED');
      this.isReady = false;
      this.client = null;
    });

    // Smart Auto-Reply & Memory Engine hook
    this.client.on('message', async (msg) => {
      const chat = await msg.getChat();
      if (!chat.isGroup) {
        this.sessions.set(msg.from, { lastMsg: msg.body, timestamp: Date.now() });
        this.handleIncomingMessage(msg, chat).catch(err => console.error("Auto-reply error:", err));
      }
    });

    this.client.initialize();
    
    // Start automation polling after a short delay
    setTimeout(() => this.startCronJobs(), 10000);
  }

  /**
   * Handle incoming messages using AI and Memory
   */
  async handleIncomingMessage(msg, chat) {
    if (!prisma) return;
    
    try {
      const phone = msg.from.replace('@c.us', '');
      
      // Look up contact
      const contact = await prisma.contact.findFirst({
        where: { phone: { contains: phone } }
      });
      
      if (!contact) return; // Only auto-reply to known contacts for safety

      // Fetch conversation memory
      const memory = await prisma.conversationMemory.findFirst({
        where: { user_id: contact.user_id, context_key: 'whatsapp_preferences' }
      });

      const preferences = memory?.data || {};
      
      // Only auto-reply if enabled for this user/contact
      if (preferences.autoReplyEnabled) {
        const aiReply = await AISkillHelper.generateReply({
          skillName: 'whatsapp_auto_reply',
          userInput: msg.body,
          context: `Contact Name: ${contact.name}\nRelationship: ${contact.relationship || 'None'}`,
          systemRole: `You are an AI assistant managing WhatsApp for the user. Reply politely in Hindi/English on their behalf.`
        });

        if (aiReply) {
          await chat.sendMessage(aiReply);
          
          await prisma.messageLog.create({
            data: {
              user_id: contact.user_id,
              contact_id: contact.id,
              recipient: contact.phone,
              content: aiReply,
              direction: 'outbound',
              status: 'sent'
            }
          });
        }
      }
      
      // Log incoming message
      await prisma.messageLog.create({
        data: {
          user_id: contact.user_id,
          contact_id: contact.id,
          recipient: contact.phone,
          content: msg.body,
          direction: 'inbound',
          status: 'received'
        }
      });
    } catch (e) {
      console.error("Error handling incoming WA message:", e);
    }
  }

  /**
   * Start Cron Jobs for Scheduled Automations
   */
  async startCronJobs() {
    if (!prisma) return;
    console.log("WhatsApp Super Engine: Starting Automations...");
    
    // Run every minute to check for scheduled tasks
    cron.schedule('* * * * *', async () => {
      if (!this.isReady) return;
      
      try {
        const now = new Date();
        const pendingJobs = await prisma.scheduledAutomation.findMany({
          where: {
            status: 'active',
            schedule_time: { lte: now }
          }
        });

        for (const job of pendingJobs) {
          await this.executeAutomationJob(job);
        }
      } catch (e) {
        console.error("Cron Execution Error:", e);
      }
    });
  }

  /**
   * Execute a specific automation job (broadcast/reminder)
   */
  async executeAutomationJob(job) {
    try {
      const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
      
      if (job.job_type === 'reminder' || job.job_type === 'festival') {
        const { recipient, message } = payload;
        await this.dispatchMessage(job.user_id, recipient, message);
      } else if (job.job_type === 'broadcast') {
        const { groupId, message } = payload;
        // Lookup group contacts and broadcast (with delay to avoid spam)
        const contacts = await prisma.contact.findMany({
          where: { user_id: job.user_id } // Filter by group in real implementation
        });
        
        for (const contact of contacts) {
          await this.dispatchMessage(job.user_id, contact.phone, message);
          await new Promise(r => setTimeout(r, 2000)); // 2 sec delay
        }
      }

      // Mark as completed unless it has a cron expression (recurring)
      if (!job.cron_expression) {
        await prisma.scheduledAutomation.update({
          where: { id: job.id },
          data: { status: 'completed' }
        });
      } else {
        // Here you would calculate the next run based on cron-parser, 
        // For now we just leave it active (simplified for Phase 2 proof of concept)
      }
    } catch (e) {
      await prisma.scheduledAutomation.update({
        where: { id: job.id },
        data: { status: 'failed' }
      });
    }
  }

  /**
   * Intelligently resolves a contact by name or relationship.
   */
  async resolveContact(userId, query) {
    const q = query.toLowerCase();
    
    // 1. Direct phone number check
    if (/^[0-9]{10}$/.test(q) || /^\d{12}$/.test(q)) {
      return { phone: q.length === 10 ? `91${q}` : q, name: q };
    }

    // 2. Query the CRM database
    if (prisma) {
      // Try exact name or relationship
      const contacts = await prisma.contact.findMany({
        where: { user_id: userId }
      });

      const match = contacts.find(c => 
        c.name.toLowerCase().includes(q) || 
        (c.relationship && c.relationship.toLowerCase() === q)
      );

      if (match) {
        return { phone: match.phone, name: match.name, id: match.id };
      }
    }

    return null;
  }

  /**
   * Dispatches a message or document via WhatsApp Web Mode.
   */
  async dispatchMessage(userId, recipientQuery, text, mediaBase64 = null, mediaMimeType = null, mediaFilename = null) {
    if (!this.isReady) {
      throw new Error("WhatsApp is not connected. Please connect first.");
    }

    const contact = await this.resolveContact(userId, recipientQuery);
    if (!contact) {
      throw new Error(`Contact "${recipientQuery}" not found in CRM.`);
    }

    const chatId = `${contact.phone.replace(/[^0-9]/g, '')}@c.us`;

    try {
      if (mediaBase64 && mediaMimeType) {
        // Send Media (PDF from A4 Document Workspace)
        const media = new MessageMedia(mediaMimeType, mediaBase64, mediaFilename || 'document.pdf');
        await this.client.sendMessage(chatId, media, { caption: text || '' });
      } else {
        // Send plain text
        await this.client.sendMessage(chatId, text);
      }

      // Log delivery status
      if (prisma) {
        await prisma.messageLog.create({
          data: {
            user_id: userId,
            contact_id: contact.id,
            recipient: contact.phone,
            content: text || (mediaBase64 ? '[Media Attachment]' : ''),
            status: 'sent'
          }
        });
      }

      return { success: true, contact };
    } catch (error) {
      // Log failure
      if (prisma) {
        await prisma.messageLog.create({
          data: {
            user_id: userId,
            contact_id: contact.id,
            recipient: contact.phone,
            content: text || '[Media Attachment]',
            status: 'failed',
            error_msg: error.message.substring(0, 255)
          }
        });
      }
      throw error;
    }
  }
}

// Singleton export
const whatsappSuperEngine = new WhatsAppSuperEngine();
module.exports = { whatsappSuperEngine, WhatsAppSuperEngine };
