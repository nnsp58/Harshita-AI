/**
 * Advocate Profile Routes
 * GET  /api/advocate/profile      — Get current user's advocate profile
 * POST /api/advocate/profile      — Save/update advocate profile
 * DELETE /api/advocate/profile    — Clear profile
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// In-memory profile store (production should use DB)
const profiles = new Map(); // userId → profile

router.use(authenticate);

router.get('/profile', (req, res) => {
  const userId = req.user.id;
  const profile = profiles.get(userId) || null;
  res.json({ success: true, data: profile });
});

router.post('/profile', (req, res) => {
  const userId = req.user.id;
  const { name, enrollmentNumber, chamberAddress, phone, email, court, barAssociation } = req.body;

  if (!name || !enrollmentNumber) {
    return res.status(400).json({ success: false, error: 'Name and enrollment number are required' });
  }

  const profile = {
    name: String(name).trim(),
    enrollmentNumber: String(enrollmentNumber).trim(),
    chamberAddress: chamberAddress?.trim() || '',
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    court: court?.trim() || '',
    barAssociation: barAssociation?.trim() || '',
    updatedAt: new Date().toISOString(),
  };

  profiles.set(userId, profile);

  // Also sync with the LegalNoticeSkill memory if registry available
  try {
    const masterAgent = req.app.get('masterAgent');
    const skill = masterAgent?.registry?.getSkill?.('legal_notice');
    if (skill?.setProfile) skill.setProfile(userId, profile);
  } catch {}

  res.json({ success: true, data: profile });
});

router.delete('/profile', (req, res) => {
  profiles.delete(req.user.id);
  res.json({ success: true });
});

module.exports = router;
