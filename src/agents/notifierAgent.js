const axios = require('axios');

class NotifierAgent {
  constructor() {
    this.notifications = [];
    this.webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    this.emailService = process.env.EMAIL_SERVICE_URL;
  }

  // Send notification
  async sendNotification(type, message, data = {}) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      data,
      timestamp: new Date(),
      status: 'pending'
    };

    this.notifications.push(notification);

    try {
      await this.deliverNotification(notification);
      notification.status = 'sent';
      console.log(`📢 Notification sent: ${type} - ${message}`);
    } catch (error) {
      notification.status = 'failed';
      notification.error = error.message;
      console.error(`❌ Notification failed: ${type}`, error);
    }

    return notification;
  }

  // Deliver notification based on type
  async deliverNotification(notification) {
    switch (notification.type) {
      case 'captcha':
        return await this.sendCaptchaAlert(notification);
      case 'validation_error':
        return await this.sendValidationAlert(notification);
      case 'task_completed':
        return await this.sendTaskAlert(notification);
      case 'manual_review':
        return await this.sendReviewAlert(notification);
      case 'system_error':
        return await this.sendErrorAlert(notification);
      default:
        return await this.sendGenericAlert(notification);
    }
  }

  // Captcha detection alert
  async sendCaptchaAlert(notification) {
    const message = `🤖 CAPTCHA Detected!\n\n${notification.message}\n\nPlease solve the captcha manually.`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        data: notification.data
      });
    }

    // Also send desktop notification (if supported)
    console.log('\n🚨 CAPTCHA ALERT 🚨');
    console.log(message);
    console.log('Press Enter to continue after solving...');
  }

  // Validation error alert
  async sendValidationAlert(notification) {
    const { errors, warnings } = notification.data;
    const message = `⚠️ Validation Issues Found\n\nErrors: ${errors?.length || 0}\nWarnings: ${warnings?.length || 0}\n\n${notification.message}`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        attachments: [
          {
            title: 'Validation Details',
            text: `Errors: ${JSON.stringify(errors, null, 2)}\nWarnings: ${JSON.stringify(warnings, null, 2)}`
          }
        ]
      });
    }

    console.log('\n⚠️ VALIDATION ALERT ⚠️');
    console.log(message);
  }

  // Task completion alert
  async sendTaskAlert(notification) {
    const message = `✅ Task Completed\n\n${notification.message}`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        data: notification.data
      });
    }

    console.log('\n✅ TASK COMPLETED ✅');
    console.log(message);
  }

  // Manual review alert
  async sendReviewAlert(notification) {
    const message = `👀 Manual Review Required\n\n${notification.message}\n\nPlease review and approve before submission.`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        data: notification.data
      });
    }

    console.log('\n👀 MANUAL REVIEW REQUIRED 👀');
    console.log(message);
    console.log('Form is filled and ready for your approval.');
  }

  // System error alert
  async sendErrorAlert(notification) {
    const message = `💥 System Error\n\n${notification.message}\n\nPlease check the system logs.`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        color: 'danger',
        data: notification.data
      });
    }

    console.error('\n💥 SYSTEM ERROR 💥');
    console.error(message);
  }

  // Generic alert
  async sendGenericAlert(notification) {
    const message = `📢 ${notification.type.toUpperCase()}\n\n${notification.message}`;

    if (this.webhookUrl) {
      await axios.post(this.webhookUrl, {
        text: message,
        data: notification.data
      });
    }

    console.log(`\n📢 ${notification.type.toUpperCase()} 📢`);
    console.log(message);
  }

  // Send email notification
  async sendEmail(to, subject, body, data = {}) {
    if (!this.emailService) {
      console.log('Email service not configured, skipping email notification');
      return;
    }

    try {
      await axios.post(this.emailService, {
        to,
        subject,
        body,
        data
      });

      console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Get notification history
  getNotificationHistory(limit = 50) {
    return this.notifications.slice(-limit);
  }

  // Get notifications by type
  getNotificationsByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Clear old notifications
  clearOldNotifications(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
    console.log(`🧹 Cleared notifications older than ${days} days`);
  }

  // Send bulk notifications
  async sendBulkNotifications(notifications) {
    const results = [];

    for (const notif of notifications) {
      try {
        const result = await this.sendNotification(notif.type, notif.message, notif.data);
        results.push({ success: true, notification: result });
      } catch (error) {
        results.push({ success: false, error: error.message, notification: notif });
      }
    }

    return results;
  }

  // Integration with WhatsApp (future feature)
  async sendWhatsAppMessage(phone, message) {
    // Placeholder for WhatsApp integration
    console.log(`📱 WhatsApp message to ${phone}: ${message}`);
    // Implement WhatsApp Business API integration here
  }

  // Integration with SMS (future feature)
  async sendSMS(phone, message) {
    // Placeholder for SMS integration
    console.log(`📱 SMS to ${phone}: ${message}`);
    // Implement SMS gateway integration here
  }
}

module.exports = { NotifierAgent };