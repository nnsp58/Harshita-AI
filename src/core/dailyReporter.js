const cron = require('node-cron');
const { analyticsEngine } = require('./analyticsEngine');
const { TelegramAgent } = require('../agents/telegramAgent');
// Assuming WhatsAppAgent is initialized in server.js and we can get it or just rely on Telegram.
// We will export a setup function that takes agents.

class DailyReporter {
  /**
   * Initialize the Daily Reporter cron job
   * @param {Object} options - { telegramAgent, whatsappAgent, adminNumbers }
   */
  static init({ telegramAgent, whatsappAgent, adminNumbers = [] }) {
    console.log('⏰ Daily Reporter Initialized (Scheduled for 9:00 PM daily)');

    // Schedule task for 9:00 PM every day
    // "0 21 * * *" means "at minute 0 past hour 21 (9 PM)"
    cron.schedule('0 21 * * *', async () => {
      console.log('📊 Running Daily Analytics Report Job...');
      try {
        const stats = analyticsEngine.getDashboardStats();
        
        const reportMsg = 
          \`📊 *Harshita AI - Daily Report*\\n\\n\` +
          \`📅 Date: \${analyticsEngine.getTodayDateString()}\\n\\n\` +
          \`👥 *Today's Visitors:* \${stats.dailyActiveUsers}\\n\` +
          \`🚀 *Total Tasks Completed:* \${stats.totalTasks}\\n\` +
          \`✅ *Success Rate:* \${stats.successRate}\\n\\n\` +
          \`🏆 *Top Tools Used:*\\n\` +
          (stats.topTools.length > 0 
            ? stats.topTools.map((t, i) => \`\${i + 1}. \${t.id}: \${t.count} times\`).join('\\n')
            : 'No tools used today.');

        // Send via Telegram
        if (telegramAgent && telegramAgent.bot) {
          // Send to the master admin ID (we can retrieve it if stored, or broadcast to known admins)
          // For now, if we know the admin's chat ID we can send. 
          // If not stored, we log it.
          // Ideally, adminChatId is stored in .env
          const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
          if (adminTelegramId) {
            await telegramAgent.bot.sendMessage(adminTelegramId, reportMsg, { parse_mode: 'Markdown' });
            console.log('✅ Daily report sent via Telegram');
          }
        }

        // Send via WhatsApp
        if (whatsappAgent && whatsappAgent.client && adminNumbers.length > 0) {
          for (const number of adminNumbers) {
            const formattedNumber = number.includes('@c.us') ? number : \`91\${number}@c.us\`;
            await whatsappAgent.client.sendMessage(formattedNumber, reportMsg);
          }
          console.log('✅ Daily report sent via WhatsApp');
        }

      } catch (err) {
        console.error('❌ Error sending daily report:', err.message);
      }
    });
  }
}

module.exports = { DailyReporter };
