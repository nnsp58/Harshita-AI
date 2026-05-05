const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const agents = [
  { id: 'banking', name: 'Banking Bot', status: 'running' },
  { id: 'ssc', name: 'SSC Bot', status: 'running' },
  { id: 'railway', name: 'Railway Bot', status: 'stopped' },
  { id: 'police', name: 'Police Bot', status: 'stopped' },
  { id: 'defence', name: 'Defence Bot', status: 'stopped' },
  { id: 'army', name: 'Army Bot', status: 'stopped' },
  { id: 'postal', name: 'Postal Bot', status: 'stopped' },
  { id: 'state-ssc', name: 'State SSC Bot', status: 'stopped' },
];

router.get('/status', authenticate, (req, res) => {
  res.json({ agents });
});

router.get('/:id', authenticate, (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

router.post('/:id/start', authenticate, (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  agent.status = 'running';
  res.json({ success: true, agent });
});

router.post('/:id/stop', authenticate, (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  agent.status = 'stopped';
  res.json({ success: true, agent });
});

router.post('/:id/restart', authenticate, (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  agent.status = 'running';
  res.json({ success: true, agent });
});

router.get('/stats/overview', authenticate, (req, res) => {
  const stats = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    stopped: agents.filter(a => a.status === 'stopped').length,
  };
  res.json(stats);
});

module.exports = router;