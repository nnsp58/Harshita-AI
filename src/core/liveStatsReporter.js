/**
 * LiveStatsReporter — Every 5 minutes usage report
 *
 * Har 5 minute mein admin ko Email + Telegram + WhatsApp par report bhejta hai:
 *   - Kitne users active hain
 *   - Kitne tasks complete hue
 *   - Kaun sa tool sabse zyada use hua
 *   - Success rate kya hai
 */

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { analyticsEngine } = require('./analyticsEngine');

class LiveStatsReporter {
  /**
   * Initialize the Live Stats Reporter (every 5 minutes)
   * @param {Object} options - { telegramAgent, whatsappAgent, adminNumbers, adminEmail }
   */
  static init({ telegramAgent, whatsappAgent, adminNumbers = [], adminEmail = null }) {
    const targetEmail = adminEmail || process.env.ADMIN_EMAIL || 'nnsp58@gmail.com';
    console.log(`⏰ LiveStatsReporter Initialized (Every 5 minutes → Email: ${targetEmail})`);

    // Email transporter setup
    let emailTransporter = null;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass && emailUser !== 'your-email@gmail.com') {
      try {
        emailTransporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false,
          auth: { user: emailUser, pass: emailPass }
        });
        console.log('[LiveStatsReporter] ✅ Email transporter ready');
      } catch (e) {
        console.warn('[LiveStatsReporter] ⚠️ Email setup failed:', e.message);
      }
    } else {
      console.warn('[LiveStatsReporter] ⚠️ EMAIL_USER / EMAIL_PASS not set — email reports disabled');
    }

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

        // ═══════════ EMAIL REPORT ═══════════
        if (emailTransporter && targetEmail) {
          try {
            const topToolsHtml = stats.topTools.length > 0
              ? stats.topTools.map((t, i) =>
                `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;">${i + 1}. ${t.id}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;">${t.count}</td></tr>`
              ).join('')
              : '<tr><td colspan="2" style="padding:12px;text-align:center;color:#999;">कोई टूल अभी तक use नहीं हुआ</td></tr>';

            const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f0f2f5;margin:0;padding:20px;">
  <div style="max-width:500px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:20px;">📊 Harshita AI — Live Update</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">🕐 ${now}</p>
    </div>
    <div style="padding:20px;">
      <div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:16px;">
        <div style="flex:1;padding:12px;background:#f8f9ff;border-radius:12px;margin:0 4px;">
          <div style="font-size:28px;font-weight:bold;color:#667eea;">${stats.dailyActiveUsers}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;">👥 विज़िटर्स</div>
        </div>
        <div style="flex:1;padding:12px;background:#f0fdf4;border-radius:12px;margin:0 4px;">
          <div style="font-size:28px;font-weight:bold;color:#22c55e;">${stats.totalTasks}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;">🚀 कुल टास्क</div>
        </div>
        <div style="flex:1;padding:12px;background:#fffbeb;border-radius:12px;margin:0 4px;">
          <div style="font-size:28px;font-weight:bold;color:#f59e0b;">${stats.successRate}</div>
          <div style="font-size:11px;color:#888;margin-top:4px;">✅ सफलता दर</div>
        </div>
      </div>
      <h3 style="margin:16px 0 8px;color:#333;font-size:14px;">🏆 टॉप टूल्स</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead><tr style="background:#f8f9fa;"><th style="padding:8px 12px;text-align:left;">टूल</th><th style="padding:8px 12px;text-align:center;">उपयोग</th></tr></thead>
        <tbody>${topToolsHtml}</tbody>
      </table>
    </div>
    <div style="background:#f8f9fa;padding:12px;text-align:center;font-size:11px;color:#999;">
      Harshita AI 🤖 — n-dizi.in | हर 5 मिनट ऑटो-रिपोर्ट
    </div>
  </div>
</body>
</html>`;

            await emailTransporter.sendMail({
              from: `"Harshita AI 📊" <${emailUser}>`,
              to: targetEmail,
              subject: `📊 Harshita AI Live — ${stats.dailyActiveUsers} विज़िटर्स | ${stats.totalTasks} टास्क | ${now}`,
              html: emailHtml
            });
            console.log(`[LiveStats] 📧 Email sent → ${targetEmail}`);
          } catch (emailErr) {
            console.error('[LiveStats] ❌ Email failed:', emailErr.message);
          }
        }

        // ═══════════ TELEGRAM ═══════════
        if (telegramAgent && telegramAgent.bot) {
          const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
          if (adminTelegramId) {
            await telegramAgent.bot.sendMessage(adminTelegramId, reportMsg, { parse_mode: 'Markdown' });
          }
        }

        // ═══════════ WHATSAPP ═══════════
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
