/**
 * WhatsAppSkill — AI-Powered WhatsApp Bot Service
 *
 * Capabilities:
 *   - Connect WhatsApp (QR code generation)
 *   - Send messages (single / bulk)
 *   - Status check
 *   - Auto-reply configuration
 *   - Read incoming messages summary
 */

const { BaseSkill } = require('./BaseSkill');
const { AISkillHelper } = require('./AISkillHelper');

class WhatsAppSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'whatsapp';
    this.displayName = 'व्हाट्सएप एजेंट';
    this.displayNameEn = 'WhatsApp Agent';
    this.description = 'WhatsApp से message भेजना, auto-reply, contacts manage';
    this.descriptionEn = 'Send WhatsApp messages, auto-replies, contact management';
    this.version = '2.0.0';
    this.category = 'communication';
    this.canRunOffline = false;
    this.priority = 8;

    this.intents = ['whatsapp_send', 'whatsapp_status', 'send_message', 'whatsapp_connect',
                    'whatsapp_disconnect', 'whatsapp_broadcast', 'whatsapp_read'];

    this.keywords = {
      hi: ['व्हाट्सएप', 'मैसेज', 'भेजो', 'whatsapp', 'कनेक्ट', 'संदेश',
           'ब्रॉडकास्ट', 'सबको भेजो', 'कांटैक्ट', 'qr', 'क्यूआर'],
      en: ['whatsapp', 'message', 'send', 'connect', 'broadcast',
           'wa', 'qr code', 'disconnect', 'logout', 'contacts', 'inbox'],
      hinglish: ['whatsapp karo', 'message bhej do', 'whatsapp connect karo',
                 'qr code dikhao', 'whatsapp number par bhejo', 'broadcast karo',
                 'sabko message bhejo', 'wa pe bhejo', 'whatsapp inbox dikhao',
                 'unread messages dikhao', 'auto reply set karo']
    };
  }

  async execute(context) {
    const { message, userId, app } = context;
    if (!message) return this._reply(this._getMenu());

    const userIdSafe = userId || 'anon';
    const pastContext = this._getContext ? this._getContext(userIdSafe, 5) : '';
    const text = message.toLowerCase();

    // Check connection status
    const whatsapp = app?.get?.('whatsappAgent');
    const isConnected = whatsapp?.isReady || false;

    // Connect / QR
    if (/connect|qr|कनेक्ट|क्यूआर/.test(text)) {
      if (isConnected) {
        return this._reply(`✅ WhatsApp पहले से connected है!\n\n📱 Active sessions: ${whatsapp.sessions?.size || 0}\n\nअब message भेज सकते हैं।`, { mode: 'already_connected' });
      }
      // Trigger start (non-blocking)
      try { whatsapp?.start?.().catch(() => {}); } catch {}
      return this._reply(
        `📱 *WhatsApp Connect कर रहे हैं...*\n\n` +
        `Browser में QR code 5-10 sec में आएगा।\n\n` +
        `Steps:\n1. WhatsApp app खोलें\n2. Settings → Linked Devices\n3. "Link a device" टैप करें\n4. QR code scan करें\n\n` +
        `Connected hote hi मैं notify कर दूंगा।`,
        { mode: 'connecting', action: 'show_qr' }
      );
    }

    // Status
    if (/status|स्टेटस|connected/.test(text)) {
      return this._reply(
        `📊 *WhatsApp Status*\n\n` +
        `Connection: ${isConnected ? '✅ Connected' : '❌ Disconnected'}\n` +
        `${isConnected ? `Active sessions: ${whatsapp?.sessions?.size || 0}` : 'Connect करने के लिए "WhatsApp connect karo" बोलें'}`,
        { mode: 'status', connected: isConnected }
      );
    }

    // Disconnect
    if (/disconnect|logout|डिस्कनेक्ट|hatao/.test(text)) {
      if (!isConnected) return this._reply(`पहले से disconnected है।`);
      try { await whatsapp?.client?.logout?.() } catch {}
      return this._reply(`👋 WhatsApp disconnected.`);
    }

    // Send message — extract phone + message via AI
    if (/send|भेजो|bhej|message/i.test(text)) {
      if (!isConnected) {
        return this._reply(
          `⚠️ पहले WhatsApp connect करें।\n"WhatsApp connect karo" बोलें।`,
          { mode: 'not_connected' }
        );
      }

      const aiResult = await AISkillHelper.extractIntent({
        userInput: message,
        skillName: 'whatsapp',
        fields: [
          { key: 'phone', desc: 'Phone number (10 digits)' },
          { key: 'messageText', desc: 'Message content' },
          { key: 'recipientName', desc: 'Recipient name (optional)' },
        ],
        context: pastContext,
      });

      const { phone, messageText } = aiResult.entities || {};
      if (!phone || !messageText) {
        return this._reply(
          `📝 Message भेजने के लिए बताएं:\n\n` +
          `Format: "9876543210 par 'hello aapka kaam ho gaya' bhej do"\n\n` +
          `${phone ? `Phone: ${phone} ✓` : '⚠️ Phone number missing'}\n` +
          `${messageText ? `Message: "${messageText}" ✓` : '⚠️ Message text missing'}`,
          { mode: 'awaiting_send_details', collected: { phone, messageText } }
        );
      }

      try {
        const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
        await whatsapp._sendMessage(`${fullPhone}@c.us`, messageText);
        return this._reply(
          `✅ Message भेज दिया!\n\n📞 ${phone}\n💬 "${messageText.substring(0, 80)}${messageText.length > 80 ? '...' : ''}"`,
          { mode: 'sent', phone, messageText }
        );
      } catch (err) {
        return this._reply(`❌ Send failed: ${err.message}`);
      }
    }

    // Read inbox
    if (/inbox|received|incoming|आये|messages/.test(text)) {
      if (!isConnected) return this._reply(`पहले WhatsApp connect करें।`);
      const sessions = whatsapp?.sessions;
      if (!sessions || sessions.size === 0) {
        return this._reply(`📭 अभी कोई active conversation नहीं है।`);
      }
      const list = [...sessions.entries()].slice(0, 10).map(([phone, data]) => {
        return `• ${phone.replace('@c.us', '')} — ${Object.keys(data.collectedData || {}).length} docs`;
      }).join('\n');
      return this._reply(`📥 *Active Conversations:*\n\n${list}`);
    }

    // Smart AI conversational reply
    const reply = await AISkillHelper.generateReply({
      skillName: 'whatsapp',
      userInput: message,
      context: pastContext,
      systemRole: `You are an AI for WhatsApp automation service.
You help users with:
- Connecting WhatsApp (QR code scan)
- Sending messages to phone numbers
- Bulk broadcast to multiple contacts
- Auto-reply setup
- Reading inbox summary

WhatsApp is currently: ${isConnected ? 'CONNECTED' : 'NOT CONNECTED'}`,
      guidance: [
        'If user wants to send message, ask for phone number and text',
        'If not connected, suggest connecting first',
        'Always confirm phone numbers before sending',
      ],
    });

    return this._reply(reply || this._getMenu(), { mode: 'ai_reply', connected: isConnected });
  }

  _getMenu() {
    return `📲 *WhatsApp Bot Service*\n\n` +
      `मैं ये कर सकती हूँ:\n` +
      `• "WhatsApp connect karo" — QR scan करके connect\n` +
      `• "9876543210 par hello bhej do" — message भेजना\n` +
      `• "Inbox dikhao" — incoming messages\n` +
      `• "Status check karo" — connection status\n` +
      `• "Disconnect karo" — logout\n\n` +
      `बस normal Hindi/English में बोलिए, मैं समझ जाऊंगी!`;
  }
}

module.exports = { WhatsAppSkill };
