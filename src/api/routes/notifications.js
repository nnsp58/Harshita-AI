// src/api/routes/notifications.js — Notification Hub API Routes

const express = require('express');
const router = express.Router();

// Send notification to a specific recipient
router.post('/send', async (req, res) => {
  try {
    const hub = req.app.get('notificationHub');
    if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

    const { type, templateId, recipient, data, channels } = req.body;
    const result = await hub.send({ type, templateId, recipient, data, channels });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Broadcast to all operators
router.post('/broadcast', async (req, res) => {
  try {
    const hub = req.app.get('notificationHub');
    if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

    const { templateId, data, channels } = req.body;
    const result = await hub.broadcastToOperators(templateId, data, channels);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send promotional message to clients
router.post('/promotion', async (req, res) => {
  try {
    const hub = req.app.get('notificationHub');
    if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

    const { templateId, filters, data } = req.body;
    const result = await hub.sendPromotion(templateId, filters, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification stats
router.get('/stats', (req, res) => {
  const hub = req.app.get('notificationHub');
  if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

  res.json({ success: true, ...hub.getStats() });
});

// Unsubscribe
router.post('/unsubscribe', (req, res) => {
  const hub = req.app.get('notificationHub');
  if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

  const { identifier } = req.body;
  hub.unsubscribe(identifier);
  res.json({ success: true, message: 'Unsubscribed successfully' });
});

// Resubscribe
router.post('/resubscribe', (req, res) => {
  const hub = req.app.get('notificationHub');
  if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

  const { identifier } = req.body;
  hub.resubscribe(identifier);
  res.json({ success: true, message: 'Resubscribed successfully' });
});

// Process queued messages
router.post('/process-queue', async (req, res) => {
  try {
    const hub = req.app.get('notificationHub');
    if (!hub) return res.status(503).json({ error: 'NotificationHub not available' });

    await hub.processQueue();
    res.json({ success: true, message: 'Queue processed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger proactive agent manually
router.post('/proactive/run', async (req, res) => {
  try {
    const proactive = req.app.get('proactiveAgent');
    if (!proactive) return res.status(503).json({ error: 'ProactiveAgent not available' });

    const alerts = await proactive.runNow();
    res.json({ success: true, alertsGenerated: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
