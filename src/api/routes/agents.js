const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/agents/status
 * Returns only visible applications for standard dashboard compatibility
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    if (!masterAgent) {
      return res.status(500).json({ error: 'MasterAgent not initialized' });
    }

    const skills = masterAgent.getAvailableSkills();
    
    // Filter visible application/service skills
    const visibleSkills = skills.filter(skill => skill.visible === true);

    const agents = visibleSkills.map(skill => {
      let status = 'running';

      return {
        id: skill.name,
        name: skill.name,
        displayName: skill.displayName,
        status: status,
        category: skill.category,
        intents: skill.intents,
        route: skill.route
      };
    });

    res.json({ agents });
  } catch (error) {
    console.error('[Agents Route] Error:', error);
    res.status(500).json({ error: 'Failed to fetch agent status' });
  }
});

/**
 * GET /api/dashboard/apps
 * Returns ONLY Layer 2 Applications (visible = true)
 */
router.get('/dashboard/apps', authenticate, async (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    if (!masterAgent) {
      return res.status(500).json({ error: 'MasterAgent not initialized' });
    }

    const skills = masterAgent.getAvailableSkills();
    const apps = skills.filter(s => s.visible === true).map(s => ({
      id: s.name,
      name: s.name,
      displayName: s.displayName,
      displayNameEn: s.displayNameEn,
      description: s.description,
      descriptionEn: s.descriptionEn,
      category: s.category,
      route: s.route,
      status: 'running'
    }));

    res.json({ apps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/system/agents
 * Returns Layer 1 System Agents (visible = false) for Admin dashboard
 */
router.get('/system/agents', authenticate, async (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    if (!masterAgent) {
      return res.status(500).json({ error: 'MasterAgent not initialized' });
    }

    const skills = masterAgent.getAvailableSkills();
    const systemAgents = skills.filter(s => s.visible !== true).map(s => ({
      id: s.name,
      name: s.name,
      displayName: s.displayName,
      displayNameEn: s.displayNameEn,
      type: s.type || 'system',
      status: 'running'
    }));

    res.json({ agents: systemAgents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single agent status
router.get('/:id', authenticate, (req, res) => {
  const masterAgent = req.app.get('masterAgent');
  const skill = masterAgent.registry.getSkill(req.params.id);
  
  if (!skill) return res.status(404).json({ error: 'Agent not found' });
  
  res.json({
    id: skill.name,
    name: skill.name,
    displayName: skill.displayName,
    status: 'running',
    route: skill.route
  });
});

module.exports = router;