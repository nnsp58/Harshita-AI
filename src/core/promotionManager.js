/**
 * PromotionManager
 * 
 * Handles broadcasting promotional messages for Harshita AI via available channels
 * (WhatsApp, Telegram, Email).
 */

class PromotionManager {
  constructor(whatsappAgent, telegramAgent, emailService) {
    this.whatsappAgent = whatsappAgent;
    this.telegramAgent = telegramAgent;
    this.emailService = emailService;
    
    this.promoMessageText = `🌟 *Harshita AI — आपका AI सहायक* 🌟

━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 *Harshita AI* एक advanced AI platform है जो CSC ऑपरेटर्स, VLEs, सरकारी कर्मचारियों और आम नागरिकों के लिए बनाया गया है।

✅ *ये काम कर सकती है Harshita AI:*
📝 सरकारी फॉर्म ऑटो-भरना
⚖️ कानूनी दस्तावेज़ बनाना 
📄 आधार/PAN से OCR डेटा निकालना
🔍 ताज़ा नौकरियाँ खोजना
🧾 TA/DA नक्शा बनाना

🌐 *अभी आज़माएं:* https://n-dizi.in

💡 _22+ AI Agents | Hindi + English | Voice Enabled | 100% Free_
━━━━━━━━━━━━━━━━━━━━━━━━━
🙏 *Harshita AI — हर काम आसान!*`;
  }

  /**
   * Broadcast promotional message on WhatsApp
   * @param {Array<string>} phoneNumbers - Array of phone numbers
   */
  async promoteOnWhatsApp(phoneNumbers) {
    if (!this.whatsappAgent || !this.whatsappAgent.isReady) {
      return { success: false, message: 'WhatsApp agent is not ready.' };
    }

    const results = [];
    for (const phone of phoneNumbers) {
      try {
        const targetId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        await this.whatsappAgent.client.sendMessage(targetId, this.promoMessageText);
        results.push({ target: phone, status: 'success' });
      } catch (err) {
        results.push({ target: phone, status: 'failed', error: err.message });
      }
    }
    return { success: true, channel: 'whatsapp', results };
  }

  /**
   * Broadcast promotional message on Telegram
   * @param {Array<string|number>} chatIds - Array of Telegram chat IDs
   */
  async promoteOnTelegram(chatIds) {
    if (!this.telegramAgent || !this.telegramAgent.bot) {
      return { success: false, message: 'Telegram agent is not initialized.' };
    }

    const results = [];
    for (const chatId of chatIds) {
      try {
        await this.telegramAgent.bot.sendMessage(chatId, this.promoMessageText, { parse_mode: 'Markdown' });
        results.push({ target: chatId, status: 'success' });
      } catch (err) {
        results.push({ target: chatId, status: 'failed', error: err.message });
      }
    }
    return { success: true, channel: 'telegram', results };
  }

  /**
   * Broadcast promotional message via Email
   * @param {Array<string>} emailAddresses - Array of email addresses
   */
  async promoteOnEmail(emailAddresses) {
    if (!this.emailService) {
      return { success: false, message: 'Email service is not available.' };
    }

    const htmlBody = this.promoMessageText.replace(/\n/g, '<br/>');
    const results = [];

    for (const email of emailAddresses) {
      try {
        await this.emailService.sendMail({
          from: \`admin@\${this.emailService.domain}\`,
          to: email,
          subject: 'Harshita AI — आपका नया AI सहायक',
          body: this.promoMessageText,
          html: htmlBody
        });
        results.push({ target: email, status: 'success' });
      } catch (err) {
        results.push({ target: email, status: 'failed', error: err.message });
      }
    }
    return { success: true, channel: 'email', results };
  }
}

module.exports = { PromotionManager };
