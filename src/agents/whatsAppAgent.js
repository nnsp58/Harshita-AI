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
const { LanguageEngine } = require('../core/languageEngine');
const { CommunityAgent } = require('../core/communityAgent');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

class WhatsAppAgent {
  constructor(io = null) {
    this.io = io;
    this.docAgent = new DocumentAIAgent();
    this.isInitialized = false;
    this.whitelistedGroups = process.env.WHATSAPP_GROUPS ? process.env.WHATSAPP_GROUPS.split(',') : [];
    this.languageEngine = new LanguageEngine();
    this.client = null;
    this.isReady = false;
    this.sessions = new Map(); // phone -> { step, collectedData, lang }
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
    // 1. Strict Privacy Filter: Only process Whitelisted Groups
    if (msg.from.endsWith('@g.us')) {
      const isWhitelisted = this.whitelistedGroups.includes(msg.from) || this.whitelistedGroups.includes('all');
      
      if (!isWhitelisted) {
        // console.log(`[WhatsAppAgent] 🛡️ Ignoring non-whitelisted group: ${msg.from}`);
        return;
      }
      
      // 2. Technical Intent Filter (Ignore personal talk in group)
      const text = msg.body?.toLowerCase() || '';
      const isTechnical = this._isTechnicalMessage(text);
      if (!isTechnical) return;

      await this._handleGroupMessage(msg);
      return;
    }

    // 3. Ignore all private messages unless they are specifically to the bot
    // (This ensures personal chats stay private)
    const phone = msg.from; // e.g. "918765432100@c.us"
    const text = msg.body?.toLowerCase() || '';
    
    console.log(`[WhatsApp] Message from ${phone}: ${msg.hasMedia ? '[Media]' : text}`);
    
    // If media (photo/PDF), process it
    if (msg.hasMedia) {
      // Check if it's a voice note
      if (msg.type === 'ptt' || msg.type === 'audio') {
        await this._handleVoiceNote(msg, phone);
        return;
      }
      await this._handleDocument(msg, phone);
      return;
    }

    // Detect user language and remember it
    const detection = this.languageEngine.detectLanguage(text);
    if (!this.sessions.has(phone)) {
      this.sessions.set(phone, { collectedData: {}, lang: detection.lang });
    } else {
      this.sessions.get(phone).lang = detection.lang;
    }

    // Conversation flow
    if (text.match(/^(hi|hello|start|namaste|नमस्ते|हेलो)/)) {
      const lang = detection.lang;
      let greeting = `🙏 नमस्ते! मैं Harshita AI Assistant हूँ।\n\nमैं CSC सेवाओं के लिए सरकारी फॉर्म भरने में आपकी *मुफ्त* मदद करती हूँ।\n\nअपना *Aadhaar*, *PAN*, या *Marksheet* की फोटो भेजें।\nमैं खुद डेटा निकालकर फॉर्म भर दूँगी।\n\n🌐 _आप हिंदी, English, या कोई भी भाषा में बात कर सकते हैं। Voice note भी भेज सकते हैं!_`;

      // Translate greeting if user speaks a non-Hindi/English language
      if (lang !== 'hi' && lang !== 'hi-Latn' && lang !== 'en') {
        const translated = await this.languageEngine.translate(greeting, 'hi', lang);
        if (translated.success) greeting = translated.translatedText;
      }

      await this._sendMessage(phone, greeting);
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

  /**
   * Handle messages from WhatsApp Groups (Sentinel Mode)
   */
  async _handleGroupMessage(message) {
    const text = message.body.toLowerCase();
    const groupChat = await message.getChat();
    
    console.log(`[WhatsAppAgent] 👥 Group Msg in "${groupChat.name}": ${text.substring(0, 50)}...`);

    // 1. Detect "Site Status" queries
    // Keywords: "site chal rahi", "down hai", "slow hai", "portal working"
    const statusKeywords = ['chal rahi', 'working', 'down', 'slow', 'portal', 'server'];
    const isAskingStatus = statusKeywords.some(kw => text.includes(kw));

    if (isAskingStatus) {
      // Extract site name (e.g., "ssc", "edistrict", "pmkisan")
      const siteMatch = text.match(/(ssc|army|railway|pmkisan|edistrict|pan|aadhar|ayushman)/i);
      if (siteMatch) {
        const site = siteMatch[1].toLowerCase();
        console.log(`[WhatsAppAgent] 🔍 Auto-checking status for: ${site}`);
        
        // Simple ping/check (In a real scenario, use actual browser visit)
        const status = await this._checkSiteStatus(site);
        
        if (status.isResponding) {
          message.reply(`🤖 *Harshita AI Status Report:* \n\n✅ *${site.toUpperCase()}* portal अभी काम कर रहा है। \n⚡ Speed: ${status.responseTime}ms\n\nआप काम शुरू कर सकते हैं!`);
        } else {
          message.reply(`🤖 *Harshita AI Status Report:* \n\n⚠️ *${site.toUpperCase()}* portal अभी slow है या down लग रहा है। \n❌ Error: ${status.error}\n\nथोड़ी देर बाद कोशिश करें।`);
        }
      }
    }

    // 2. Detect "Solutions" for learning
    // Keywords: "solution", "theek ho gaya", "aise karo", "setting badlo"
    if (text.includes('aise karo') || text.includes('solution') || text.includes('fix')) {
      const community = new CommunityAgent();
      await community.createPost({
        userId: 'whatsapp_group',
        userName: `Group User: ${message.author || message.from}`,
        title: `Solution reported in WhatsApp Group: ${groupChat.name}`,
        description: text,
        category: 'whatsapp_learned',
        tags: ['whatsapp', 'crowdsourced']
      });
      console.log(`[WhatsAppAgent] 🧠 Learned a potential solution from Group!`);
    }
  }

  /**
   * Determine if a message is technical/CSC related
   */
  _isTechnicalMessage(text) {
    const techKeywords = [
      'site', 'server', 'portal', 'error', 'slow', 'down', 'chal raha', 'working',
      'biometric', 'fingerprint', 'scanner', 'driver', 'update', 'csc', 'link',
      'id', 'password', 'login', 'otp', 'payment', 'failed', 'success', 'fix'
    ];
    
    // Only return true if at least one tech keyword is present
    return techKeywords.some(kw => text.includes(kw));
  }

  async _checkSiteStatus(site) {
    // Mapping keywords to URLs
    const urls = {
      ssc: 'https://ssc.nic.in',
      pmkisan: 'https://pmkisan.gov.in',
      edistrict: 'https://edistrict.up.gov.in',
      pan: 'https://www.utiitsl.com'
    };

    const url = urls[site] || `https://www.google.com/search?q=${site}+portal`;
    
    try {
      const start = Date.now();
      await axios.get(url, { timeout: 5000 });
      return { isResponding: true, responseTime: Date.now() - start };
    } catch (e) {
      return { isResponding: false, error: e.message };
    }
  }

  // Handle voice notes — transcribe and process as text
  async _handleVoiceNote(msg, phone) {
    await this._sendMessage(phone, `🎤 Voice note मिला। सुन रहे हैं...`);

    try {
      const result = await this.languageEngine.processWhatsAppVoiceNote(msg);

      if (!result.success || !result.text) {
        await this._sendMessage(phone, `❌ Voice note समझ नहीं आया। कृपया साफ आवाज़ में दोबारा भेजें।`);
        return;
      }

      const transcribedText = result.text;
      const lang = result.detectedLanguage || 'hi';

      console.log(`[WhatsApp] 🎤 Voice transcribed (${lang}): "${transcribedText}"`);
      await this._sendMessage(phone, `✅ आपने कहा: _"${transcribedText}"_\n\nProcessing...`);

      // Update session language
      if (!this.sessions.has(phone)) {
        this.sessions.set(phone, { collectedData: {}, lang });
      } else {
        this.sessions.get(phone).lang = lang;
      }

      // Re-process as text message by simulating msg.body
      const fakeMsg = { ...msg, body: transcribedText, hasMedia: false };
      await this._handleMessage(fakeMsg);
    } catch (error) {
      console.error('[WhatsApp] Voice note error:', error);
      await this._sendMessage(phone, `❌ Voice processing में समस्या। कृपया text में लिखें।`);
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
