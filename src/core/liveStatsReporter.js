/**
 * LiveStatsReporter — Every 5 minutes usage report
 *
 * Har 5 minute mein admin ko Telegram/WhatsApp par report bhejta hai:
 *   - Kitne users active hain
 *   - Kitne tasks complete hue
 *   - Kaun sa tool sabse zyada use hua
 *   - Success rate kya hai
 */

const cron = require('node-cron');
const { analyticsEngine } = require('./analyticsEngine');

class LiveStatsReporter {
  /**
   * Initialize the Live Stats Reporter (every 5 minutes)
   * @param {Object} options - { telegramAgent, whatsappAgent, adminNumbers }
   */
  static init({ telegramAgent, whatsappAgent, adminNumbers = [] }) {
    console.log('⏰ LiveStatsReporter Initialized (Every 5 minutes)');

    // "*/5 * * * *" = har 5 minute mein
    cron.schedule('*/5 * * * *', async () => {
      try {
        const stats = analyticsEngine.getDashboardStats();
        const now = new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' });

        const reportMsg =
          `📊 *Harshita AI — Live Update*\n\n` +
          `🕐 समय: ${now}\n\n` +
          `👥 आज के विज़िटर्स: *${stats.dailyActiveUsers}*\n` +
          `🚀 कुल टास्क: *${stats.totalTasks}*\n` +
          `✅ सफलता दर: *${stats.successRate}*\n\n` +
          `🏆 *टॉप टूल्स:*\n` +
          (stats.topTools.length > 0
            ? stats.topTools.map((t, i) => `${i + 1}. ${t.id}: ${t.count} बार`).join('\n')
            : '— कोई टूल अभी तक use नहीं हुआ') +
          `\n\n— Harshita AI 🤖`;

        // Send via Telegram
        if (telegramAgent && telegramAgent.bot) {
          const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
          if (adminTelegramId) {
            await telegramAgent.bot.sendMessage(adminTelegramId, reportMsg, { parse_mode: 'Markdown' });
          }
        }

        // Send via WhatsApp
        if (whatsappAgent && whatsappAgent.client && adminNumbers.length > 0) {
          for (const number of adminNumbers) {
            const formattedNumber = number.includes('@c.us') ? number : `91${number}@c.us`;
            await whatsappAgent.client.sendMessage(formattedNumber, reportMsg);
          }
        }

        // Console log (always)
        console.log(`[LiveStats] 📊 Visitors: ${stats.dailyActiveUsers} | Tasks: ${stats.totalTasks} | Success: ${stats.successRate}`);

      } catch (err) {
        console.error('[LiveStatsReporter] ❌ Error:', err.message);
      }
    });
  }
}

module.exports = { LiveStatsReporter };
