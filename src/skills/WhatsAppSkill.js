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
const { whatsappSuperEngine } = require('../core/WhatsAppSuperEngine');

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
                    'whatsapp_disconnect', 'whatsapp_broadcast', 'whatsapp_read', 'whatsapp_schedule'];

    this.keywords = {
      hi: ['व्हाट्सएप', 'मैसेज', 'भेजो', 'whatsapp', 'कनेक्ट', 'संदेश',
           'ब्रॉडकास्ट', 'सबको भेजो', 'कांटैक्ट', 'qr', 'क्यूआर', 'रिमाइंडर', 'शेड्यूल'],
      en: ['whatsapp', 'message', 'send', 'connect', 'broadcast',
           'wa', 'qr code', 'disconnect', 'logout', 'contacts', 'inbox', 'schedule', 'remind'],
      hinglish: ['whatsapp karo', 'message bhej do', 'whatsapp connect karo',
                 'qr code dikhao', 'whatsapp number par bhejo', 'broadcast karo',
                 'sabko message bhejo', 'wa pe bhejo', 'whatsapp inbox dikhao',
                 'unread messages dikhao', 'auto reply set karo', 'kal bhej dena', 'reminder set karo']
    };
  }

  async execute(context) {
    const { message, userId, app } = context;
    if (!message) return this._reply(this._getMenu());

    const userIdSafe = userId || 'anon';
    const pastContext = this._getContext ? this._getContext(userIdSafe, 5) : '';
    const text = message.toLowerCase();

    // Check connection status
    const isConnected = whatsappSuperEngine.isReady || false;

    // Connect / QR
    if (/connect|qr|कनेक्ट|क्यूआर|जोड़ो/.test(text)) {
      if (isConnected) {
        return this._reply(
          `✅ WhatsApp पहले से connected है!\n\n📱 Active sessions: ${whatsapp?.sessions?.size || 0}\n\nअब message भेज सकते हैं।\n\n💡 *Harshita AI का प्रचार करना है?*\n"WhatsApp prachar karo" बोलें — मैं आपके group में professional message भेज दूंगी!`,
          { mode: 'already_connected' }
        );
      }
      // Trigger start (non-blocking)
      try { whatsappSuperEngine.start().catch(() => {}); } catch {}
      return this._reply(
        `📱 *WhatsApp Web खोल रहे हैं...*\n\n` +
        `🌐 Browser में WhatsApp Web open हो रहा है।\n\n` +
        `Steps:\n1. WhatsApp app खोलें\n2. Settings → Linked Devices\n3. "Link a device" टैप करें\n4. Browser में दिखा QR code scan करें\n\n` +
        `Connected hote hi मैं notify कर दूंगा।\n\n` +
        `💡 Connect होने के बाद "WhatsApp prachar karo" बोलें — मैं आपके group में Harshita AI का professional प्रचार कर दूंगी!`,
        { mode: 'connecting', action: 'show_qr', navigate: 'https://web.whatsapp.com' }
      );
    }

    // Promote / Prachar Harshita AI in WhatsApp groups
    if (/prachar|प्रचार|promote|marketing|promo|advertise/.test(text)) {
      if (!isConnected) {
        return this._reply(
          `⚠️ पहले WhatsApp connect करें।\n"WhatsApp connect karo" बोलें।`,
          { mode: 'not_connected' }
        );
      }

      // Check if user specified a group name
      const groupMatch = message.match(/(?:group|ग्रुप|समूह)\s*["']?([^"']+)["']?/i);
      
      if (groupMatch && groupMatch[1]) {
        // User specified a group — send promotional message
        const groupName = groupMatch[1].trim();
        const promoMsg = this._getPromoMessage();
        
        try {
          // Try to find and send to the group (using simple string match for phase 1 web mode fallback)
          const chats = await whatsappSuperEngine.client?.getChats?.() || [];
          const targetGroup = chats.find(c => c.isGroup && c.name.toLowerCase().includes(groupName.toLowerCase()));
          
          if (targetGroup) {
            await whatsappSuperEngine.client.sendMessage(targetGroup.id._serialized, promoMsg);
            return this._reply(
              `✅ *प्रचार सफल!*\n\n📱 Group: *${targetGroup.name}*\n💬 Professional message भेज दिया गया!\n\nGroup के सदस्य अब Harshita AI के बारे में जान पाएंगे। 🎉`,
              { mode: 'promo_sent', groupName: targetGroup.name }
            );
          } else {
            return this._reply(
              `⚠️ "${groupName}" नाम का group नहीं मिला।\n\nकृपया सही group का नाम बताएं या ये बोलें:\n"WhatsApp prachar karo group CSC Operators"`,
              { mode: 'group_not_found' }
            );
          }
        } catch (err) {
          return this._reply(`❌ Message भेजने में error: ${err.message}`);
        }
      }

      // No group specified — ask user which group
      let groupList = '';
      try {
        const chats = await whatsapp?.client?.getChats?.();
        const groups = chats?.filter(c => c.isGroup)?.slice(0, 10) || [];
        if (groups.length > 0) {
          groupList = `\n\n📋 *आपके WhatsApp Groups:*\n` + 
            groups.map((g, i) => `${i + 1}. ${g.name}`).join('\n') +
            `\n\n👆 ऊपर से group का नाम बोलें:\nExample: "WhatsApp prachar karo group ${groups[0]?.name || 'CSC Operators'}"`;
        }
      } catch {}

      return this._reply(
        `📢 *Harshita AI प्रचार (Promotion)*\n\n` +
        `किस WhatsApp group में प्रचार करना है?${groupList}\n\n` +
        `बस group का नाम बताएं, मैं एक professional message लिखकर भेज दूंगी!`,
        { mode: 'awaiting_group_selection' }
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
      try { await whatsappSuperEngine.client?.logout?.() } catch {}
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
          { key: 'recipient', desc: 'Phone number, contact name, or relationship (e.g. Papa, SDO, 9876543210)' },
          { key: 'messageText', desc: 'Message content' }
        ],
        context: pastContext,
      });

      const { recipient, messageText } = aiResult.entities || {};
      if (!recipient || !messageText) {
        return this._reply(
          `📝 Message भेजने के लिए बताएं:\n\n` +
          `Format: "Papa ko 'hello' bhej do" या "9876543210 par message bhejo"\n\n` +
          `${recipient ? `Recipient: ${recipient} ✓` : '⚠️ Recipient missing'}\n` +
          `${messageText ? `Message: "${messageText}" ✓` : '⚠️ Message text missing'}`,
          { mode: 'awaiting_send_details', collected: { recipient, messageText } }
        );
      }

      // Check if it's a scheduled message or reminder
      const isScheduled = /kal|parso|baad|baje|tomorrow|schedule|remind|रिमाइंडर/i.test(text);

      if (isScheduled) {
        // Simple Phase 2 scheduling implementation
        const scheduleTime = new Date();
        scheduleTime.setMinutes(scheduleTime.getMinutes() + 5); // Default 5 mins for proof of concept
        
        try {
          const { prisma } = require('../models/database');
          await prisma.scheduledAutomation.create({
            data: {
              user_id: userIdSafe,
              job_type: 'reminder',
              schedule_time: scheduleTime,
              payload: JSON.stringify({ recipient, message: messageText })
            }
          });
          return this._reply(
            `⏰ Scheduled!\n\nMessage "${messageText.substring(0,20)}..." scheduled for ${recipient}.`
          );
        } catch(e) {
          return this._reply(`❌ Schedule failed: ${e.message}`);
        }
      }

      // Normal immediate send
      try {
        const result = await whatsappSuperEngine.dispatchMessage(userIdSafe, recipient, messageText);
        return this._reply(
          `✅ Message भेज दिया!\n\n📞 ${result.contact.name || result.contact.phone}\n💬 "${messageText.substring(0, 80)}${messageText.length > 80 ? '...' : ''}"`,
          { mode: 'sent', phone: result.contact.phone, messageText }
        );
      } catch (err) {
        return this._reply(`❌ Send failed: ${err.message}`);
      }
    }

    // Read inbox
    if (/inbox|received|incoming|आये|messages/.test(text)) {
      if (!isConnected) return this._reply(`पहले WhatsApp connect करें।`);
      const sessions = whatsappSuperEngine.sessions;
      if (!sessions || sessions.size === 0) {
        return this._reply(`📭 अभी कोई active conversation नहीं है।`);
      }
      const list = [...sessions.entries()].slice(0, 10).map(([phone, data]) => {
        return `• ${phone.replace('@c.us', '')} — ${data.lastMsg.substring(0, 20)}`;
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
      `• "WhatsApp connect karo" — QR scan करके connect + WhatsApp Web open\n` +
      `• "WhatsApp prachar karo" — 📢 Groups में Harshita AI का प्रचार\n` +
      `• "9876543210 par hello bhej do" — message भेजना\n` +
      `• "Inbox dikhao" — incoming messages\n` +
      `• "Status check karo" — connection status\n` +
      `• "Disconnect karo" — logout\n\n` +
      `बस normal Hindi/English में बोलिए, मैं समझ जाऊंगी!`;
  }

  _getPromoMessage() {
    return `🌟 *Harshita AI — आपका AI सहायक* 🌟

━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 *Harshita AI* एक advanced AI platform है जो CSC ऑपरेटर्स, VLEs, सरकारी कर्मचारियों और आम नागरिकों के लिए बनाया गया है।

✅ *ये काम कर सकती है Harshita AI:*

📝 सरकारी फॉर्म ऑटो-भरना (SSC, Railway, Army, Police)
⚖️ कानूनी दस्तावेज़ बनाना (शपथ पत्र, दान विलेख, NOC, किराया अनुबंध)
📄 आधार/PAN/मार्कशीट से OCR डेटा निकालना
🔍 SarkariResult से ताज़ा नौकरियाँ खोजना
🧾 TA/DA नक्शा बनाना
🍚 राशन कार्ड स्टेटस चेक
🏞️ भूलेख / खसरा-खतौनी निकालना
📊 रिज्यूमे / बायोडाटा बनाना
🎙️ Hindi Voice Command Support

🌐 *अभी आज़माएं:* https://n-dizi.in

💡 _22+ AI Agents | Hindi + English | Voice Enabled | 100% Free_

━━━━━━━━━━━━━━━━━━━━━━━━━
🙏 *Harshita AI — हर काम आसान!*`;
  }
}

module.exports = { WhatsAppSkill };
