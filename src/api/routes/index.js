// src/api/routes/index.js - Main Router Configuration

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const candidateRoutes = require('./candidates');
const jobRoutes = require('./jobs');
const documentRoutes = require('./documents');
const reviewRoutes = require('./reviews');
const downloadRoutes = require('./downloads');
const agentRoutes = require('./agents');
const whatsappRoutes = require('./whatsapp');
const bulkRoutes = require('./bulk');
const statsRoutes = require('./stats');
const cscRoutes = require('./csc');
const communityRoutes = require('./community');
const notificationRoutes = require('./notifications');
const emailRoutes = require('./email');
const contactRoutes = require('./contact');
const analyticsRoutes = require('./analytics');
const settingRoutes = require('./settings');
const storyVideoRoutes = require('./storyVideo');
const academyRoutes = require('./academy');
const selfHealingRoutes = require('./selfHealing');
const utilitiesRoutes = require('./utilities');

router.use('/auth', authRoutes);
router.use('/self-healing', selfHealingRoutes);
router.use('/candidate', candidateRoutes);
router.use('/job', jobRoutes);
// /api/jobs alias for standard REST convention and QA test compatibility
router.use('/jobs', jobRoutes);
router.use('/document', documentRoutes);
router.use('/review', reviewRoutes);
router.use('/download', downloadRoutes);

router.get('/agents', (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    if (!masterAgent || !masterAgent.registry) {
      return res.json({ agents: [], total: 0 });
    }
    const skills = masterAgent.registry.getAllSkills ? masterAgent.registry.getAllSkills() : [];
    const visibleSkills = skills.filter(s => s.visible === true);
    res.json({
      agents: visibleSkills.map(s => ({
        id: s.name,
        displayName: s.displayName || s.name,
        category: s.category || 'general',
        status: 'running',
        canRunOffline: s.canRunOffline || false,
        intentsCount: (s.intents || []).length,
        route: s.route
      })),
      total: visibleSkills.length
    });
  } catch (e) {
    res.json({ agents: [], total: 0, error: e.message });
  }
});

router.use('/agents', agentRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/bulk', bulkRoutes);
router.use('/stats', statsRoutes);
router.use('/csc', cscRoutes);
router.use('/community', communityRoutes);
router.use('/notifications', notificationRoutes);
router.use('/email', emailRoutes);
router.use('/contact', contactRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingRoutes);
router.use('/story-video', storyVideoRoutes);
router.use('/academy', academyRoutes);
router.use('/utilities', utilitiesRoutes);



// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Harshita AI API',
    version: '2.0.0',
    description: 'Harshita AI Enterprise AI Operating System REST API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      agents: '/api/agents',
      jobs: '/api/jobs',
      documents: '/api/document',
      command: '/api/command',
      dashboard: '/api/dashboard/stats'
    }
  });
});

module.exports = router;