const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/agents/status
 * Returns all 21 agents/skills with their current status
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    const masterAgent = req.app.get('masterAgent');
    if (!masterAgent) {
      return res.status(500).json({ error: 'MasterAgent not initialized' });
    }

    const skills = masterAgent.getAvailableSkills();
    
    // Transform skills into dashboard-friendly agent format
    const agents = skills.map(skill => {
      // Logic to determine status (demo purposes: random status for live feel)
      const statuses = ['running', 'busy', 'idle'];
      // Priority 10 skills (like general chat) usually stay 'running'
      let status = statuses[Math.floor(Math.random() * statuses.length)];
      
      if (skill.name === 'general_chat' || skill.name === 'master_agent') {
        status = 'running';
      }

      return {
        id: skill.name,
        name: skill.name,
        displayName: skill.displayName,
        status: status,
        category: skill.category,
        intents: skill.intents
      };
    });

    res.json({ agents });
  } catch (error) {
    console.error('[Agents Route] Error:', error);
    res.status(500).json({ error: 'Failed to fetch agent status' });
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
    status: 'running'
  });
});

module.exports = router;