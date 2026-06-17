/**
 * TelegramAgent (Omnichannel Support)
 * 
 * Uses node-telegram-bot-api
 * Connects to a Telegram Bot using a Bot Token.
 */

const TelegramBot = require('node-telegram-bot-api');
const { SpamFilter } = require('../core/spamFilter');

class TelegramAgent {
  constructor(token) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN;
    this.bot = null;
    this.isReady = false;
    this.spamFilter = new SpamFilter();
    this.sessions = new Map();
  }

  start() {
    if (!this.token) {
      console.log('⚠️ Telegram Bot Token not provided. TelegramAgent will not start.');
      return;
    }

    console.log('✈️ Starting Telegram Agent...');
    this.bot = new TelegramBot(this.token, { polling: true });

    this.bot.on('polling_error', (error) => {
      console.error('[Telegram] Polling error:', error.code, error.message);
    });

    this.bot.on('message', async (msg) => {
      await this._handleMessage(msg);
    });

    this.isReady = true;
    console.log('✅ Telegram Agent is ready!');
  }

  async _handleMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text || '';

    // Ignore empty messages or non-text messages for now
    if (!text) return;

    // Anti-Spam / Anti-Promo Filter
    const spamCheck = this.spamFilter.evaluate(text);
    if (spamCheck.isPromo) {
      console.log(`[Telegram] 🛑 Blocked Promotional Message from ${msg.from.username || chatId}. Reason: ${spamCheck.reason}`);
      return; // Ignore promotional message
    }

    console.log(`[Telegram] Message from ${msg.from.username || chatId}: ${text}`);

    // Simple interaction flow for Telegram (can be expanded to use DocumentAI like WhatsApp)
    if (text.toLowerCase().match(/^(hi|hello|start|namaste|नमस्ते|हेलो)/)) {
      const greeting = `🙏 नमस्ते! मैं Harshita AI Assistant हूँ।\n\nमैं CSC सेवाओं के लिए सरकारी फॉर्म भरने में आपकी मदद करती हूँ।\n\nआप मुझसे कोई भी सवाल पूछ सकते हैं!`;
      await this._sendMessage(chatId, greeting);
      return;
    }

    // Default reply
    await this._sendMessage(chatId, `मैं समझ गई! आपकी मदद के लिए मैं यहाँ हूँ।`);
  }

  async _sendMessage(chatId, text) {
    try {
      await this.bot.sendMessage(chatId, text);
    } catch (err) {
      console.error('[Telegram] Send failed:', err.message);
    }
  }

  getStatus() {
    return {
      isReady: this.isReady
    };
  }
}

module.exports = { TelegramAgent };
