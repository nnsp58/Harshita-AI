const express = require('express');
const router = express.Router();
const { analyticsEngine } = require('../../core/analyticsEngine');

router.get('/', (req, res) => {
  try {
    const stats = analyticsEngine.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/track', express.json(), (req, res) => {
  try {
    const { event, data } = req.body;
    if (event) {
      analyticsEngine.trackEvent(event, data);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
