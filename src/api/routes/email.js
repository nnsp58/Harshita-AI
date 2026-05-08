// src/api/routes/email.js — Custom Domain Email API Routes (username@n-dizi.in)

const express = require('express');
const router = express.Router();

// Check username availability
router.get('/check/:username', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const result = await emailService.checkAvailability(req.params.username);
    res.json({ success: true, ...result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Create email account
router.post('/create', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const { username, fullName, password, userId, role } = req.body;
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'username, fullName, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const result = await emailService.createAccount({ username, fullName, password, userId, role });
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Delete email account
router.delete('/:email', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const result = await emailService.deleteAccount(req.params.email);
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// List all accounts
router.get('/accounts', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const { status, role } = req.query;
    const result = await emailService.listAccounts({ status, role });
    res.json({ success: true, ...result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Send email
router.post('/send', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const { from, to, subject, body, html, password } = req.body;
    if (!from || !to || !subject) {
      return res.status(400).json({ error: 'from, to, and subject are required' });
    }
    const result = await emailService.sendMail({ from, to, subject, body, html, password });
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Read inbox (IMAP)
router.post('/inbox', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const { email, password, limit } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await emailService.getInbox(email, password, limit || 20);
    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DNS setup guide
router.get('/dns-guide', (req, res) => {
  const emailService = req.app.get('emailService');
  if (!emailService) return res.status(503).json({ error: 'Email service not available' });
  res.json({ success: true, ...emailService.getDnsSetupGuide() });
});

// Email service stats
router.get('/stats', async (req, res) => {
  try {
    const emailService = req.app.get('emailService');
    if (!emailService) return res.status(503).json({ error: 'Email service not available' });
    const stats = await emailService.getStats();
    res.json({ success: true, ...stats });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
