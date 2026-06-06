/**
 * Data Export Route - GDPR "Right to Data Portability"
 * GET /api/export/my-data
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

router.get('/my-data', authenticate, async (req, res) => {
  const userId = req.user?.id || 'demo';

  try {
    // In real app: fetch from Prisma + other stores
    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: userId,
      profile: {
        email: req.user?.email || 'demo@harshita.ai',
        name: req.user?.name || 'Demo User',
        role: req.user?.role || 'csc_admin'
      },
      subscriptions: [],
      candidates: [],
      jobs: [],
      documents: [],
      chat_history: [],
      preferences: {}
    };

    res.setHeader('Content-Disposition', `attachment; filename="harshita-data-${userId}.json"`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
