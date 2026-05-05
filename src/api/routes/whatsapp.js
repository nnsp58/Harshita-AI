// src/api/routes/whatsapp.js
// WhatsApp Bot control routes — FREE (whatsapp-web.js)

const express = require('express');
const router = express.Router();

// GET /api/whatsapp/status — WhatsApp connection status
router.get('/status', (req, res) => {
  const whatsapp = req.app.get('whatsappAgent');
  if (!whatsapp) return res.json({ enabled: false, reason: 'WhatsApp agent not initialized' });
  res.json({ enabled: true, ...whatsapp.getStatus() });
});

// POST /api/whatsapp/start — Start WhatsApp (generates QR)
router.post('/start', async (req, res) => {
  const whatsapp = req.app.get('whatsappAgent');
  if (!whatsapp) return res.status(503).json({ error: 'WhatsApp agent not available' });
  if (whatsapp.isReady) return res.json({ status: 'already_connected' });

  // Non-blocking start — QR sent via WebSocket
  whatsapp.start().catch(err => console.error('[WhatsApp] Start error:', err));
  res.json({ status: 'starting', message: 'Scan the QR code from dashboard' });
});

// POST /api/whatsapp/send — Send a message (for testing / admin alerts)
router.post('/send', async (req, res) => {
  const whatsapp = req.app.get('whatsappAgent');
  const { phone, message } = req.body;
  if (!whatsapp?.isReady) return res.status(503).json({ error: 'WhatsApp not connected' });
  if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });

  try {
    await whatsapp._sendMessage(`${phone}@c.us`, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/whatsapp/sessions — Active VLE sessions
router.get('/sessions', (req, res) => {
  const whatsapp = req.app.get('whatsappAgent');
  if (!whatsapp) return res.json({ sessions: [] });
  const sessions = [...whatsapp.sessions.entries()].map(([phone, data]) => ({
    phone: phone.replace('@c.us', ''),
    documentsCollected: Object.keys(data.collectedData || {}).length,
    step: data.step || 'collecting'
  }));
  res.json({ sessions });
});

module.exports = router;
