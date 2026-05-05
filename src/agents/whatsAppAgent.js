/**
 * WhatsAppAgent (PRD: Chat Agent)
 * 
 * Uses whatsapp-web.js — FREE, no Meta API key required.
 * Works by connecting to your existing WhatsApp account via QR code scan.
 * 
 * Cost: ₹0
 * 
 * Workflow:
 * VLE sends document image → Bot extracts data via DocumentAIAgent (Groq)
 *   → Saves to candidate profile → Triggers automation job
 */

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { DocumentAIAgent } = require('./documentAIAgent');
const path = require('path');
const fs = require('fs');

class WhatsAppAgent {
  constructor(io = null) {
    this.io = io;
    this.docAgent = new DocumentAIAgent();
    this.client = null;
    this.isReady = false;
    this.sessions = new Map(); // phone -> { step, collectedData }
  }

  // Initialize and start WhatsApp client
  async start() {
    console.log('📱 Starting WhatsApp Agent...');
    
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    // Show QR in terminal for VLE to scan
    this.client.on('qr', (qr) => {
      console.log('\n📱 Scan this QR code with WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      
      // Also send QR to frontend via WebSocket
      if (this.io) {
        this.io.emit('whatsapp_qr', { qr });
      }
    });

    this.client.on('ready', () => {
      this.isReady = true;
      console.log('✅ WhatsApp Agent is ready!');
      if (this.io) this.io.emit('whatsapp_ready', { status: 'connected' });
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      console.warn('⚠️ WhatsApp disconnected:', reason);
      if (this.io) this.io.emit('whatsapp_disconnected', { reason });
    });

    // Handle incoming messages
    this.client.on('message', async (msg) => {
      await this._handleMessage(msg);
    });

    await this.client.initialize();
  }

  async _handleMessage(msg) {
    const phone = msg.from; // e.g. "918765432100@c.us"
    const text = msg.body?.toLowerCase() || '';
    
    console.log(`[WhatsApp] Message from ${phone}: ${msg.hasMedia ? '[Media]' : text}`);
    
    // If media (photo/PDF), process it
    if (msg.hasMedia) {
      await this._handleDocument(msg, phone);
      return;
    }

    // Conversation flow
    if (text.match(/^(hi|hello|start|namaste|नमस्ते)/)) {
      await this._sendMessage(phone, `🙏 नमस्ते! मैं Rawan AI Assistant हूँ।

मैं CSC सेवाओं के लिए सरकारी फॉर्म भरने में आपकी *मुफ्त* मदद करता हूँ।

अपना *Aadhaar*, *PAN*, या *Marksheet* की फोटो भेजें।
मैं खुद डेटा निकालकर फॉर्म भर दूँगा।`);
      return;
    }

    if (text.includes('status')) {
      const session = this.sessions.get(phone);
      const count = Object.keys(session?.collectedData || {}).length;
      await this._sendMessage(phone, `📊 आपकी प्रोफाइल में अभी *${count}* दस्तावेज हैं।\n\nओर दस्तावेज भेजें या किसी सेवा के लिए *SSC* / *Army* / *Railway* लिखें।`);
      return;
    }

    if (text.includes('ssc') || text.includes('army') || text.includes('railway')) {
      const session = this.sessions.get(phone);
      if (!session || !session.collectedData?.aadhaar) {
        await this._sendMessage(phone, `⚠️ कृपया पहले अपना *Aadhaar कार्ड* भेजें।`);
      } else {
        const service = text.includes('ssc') ? 'SSC CGL' : text.includes('army') ? 'Indian Army' : 'Railway';
        await this._sendMessage(phone, `✅ *${service}* के लिए आवेदन शुरू किया जा रहा है...\n\nआपको एक OTP आ सकता है। उसे यहाँ भेज दें।`);
        // Emit event to backend to start job
        if (this.io) {
          this.io.emit('whatsapp_job_request', {
            phone,
            serviceType: text.includes('ssc') ? 'ssc' : text.includes('army') ? 'army' : 'railway',
            userData: session.collectedData
          });
        }
      }
      return;
    }

    // Default
    await this._sendMessage(phone, `कृपया अपने दस्तावेज की फोटो भेजें या *SSC*, *Army*, *Railway* में से कोई सेवा चुनें।`);
  }

  async _handleDocument(msg, phone) {
    await this._sendMessage(phone, `⏳ आपका दस्तावेज प्राप्त हो गया। AI प्रोसेस कर रहा है...`);
    
    try {
      const media = await msg.downloadMedia();
      
      // Save temp file
      const ext = media.mimetype.includes('pdf') ? '.pdf' : '.jpg';
      const tempPath = path.join(process.cwd(), 'uploads', `wa_${Date.now()}${ext}`);
      fs.writeFileSync(tempPath, Buffer.from(media.data, 'base64'));
      
      // Extract data using DocumentAIAgent (Groq - free)
      const result = await this.docAgent.processDocument(tempPath);
      const data = result.structuredData;
      
      // Update session
      if (!this.sessions.has(phone)) {
        this.sessions.set(phone, { collectedData: {} });
      }
      const session = this.sessions.get(phone);
      Object.assign(session.collectedData, data.personal || {}, data.contact || {}, data.address || {}, data.documents || {});
      
      const name = data.personal?.fullName || 'पहचान नहीं हुई';
      const aadhaar = data.documents?.aadhaar || '';
      
      await this._sendMessage(phone, `✅ दस्तावेज सफलतापूर्वक पढ़ा गया!

👤 *नाम:* ${name}
🆔 *Aadhaar:* ${aadhaar ? '****' + aadhaar.slice(-4) : 'नहीं मिला'}

अब *SSC*, *Army*, या *Railway* लिखकर आवेदन शुरू करें।`);
      
      // Cleanup temp file
      fs.unlinkSync(tempPath);
      
    } catch (error) {
      console.error('[WhatsApp] Document processing error:', error);
      await this._sendMessage(phone, `❌ दस्तावेज पढ़ने में समस्या। कृपया साफ फोटो भेजें।`);
    }
  }

  async _sendMessage(phone, text) {
    try {
      await this.client.sendMessage(phone, text);
    } catch (err) {
      console.error('[WhatsApp] Send failed:', err.message);
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      activeSessions: this.sessions.size
    };
  }
}

module.exports = { WhatsAppAgent };
