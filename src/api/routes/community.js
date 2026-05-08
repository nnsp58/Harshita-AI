// src/api/routes/community.js — Community + Video Conference API Routes

const express = require('express');
const router = express.Router();

// ═══════════════════════════════════════
//  VIDEO CONFERENCE ROUTES
// ═══════════════════════════════════════

// Create a new meeting room
router.post('/meet/create', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const { topic, maxParticipants } = req.body;
    const userId = req.body.userId || 'anonymous';
    const userName = req.body.userName || 'Operator';

    const result = community.createRoom({ hostId: userId, hostName: userName, topic, maxParticipants });
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active meeting rooms
router.get('/meet/rooms', (req, res) => {
  const community = req.app.get('communityAgent');
  if (!community) return res.status(503).json({ error: 'Community agent not available' });

  res.json({ success: true, rooms: community.getActiveRooms() });
});

// Join a meeting room
router.post('/meet/:roomId/join', (req, res) => {
  const community = req.app.get('communityAgent');
  if (!community) return res.status(503).json({ error: 'Community agent not available' });

  const { userId, userName } = req.body;
  const result = community.joinRoom(req.params.roomId, userId, userName);
  res.json(result);
});

// Leave a meeting room
router.post('/meet/:roomId/leave', (req, res) => {
  const community = req.app.get('communityAgent');
  if (!community) return res.status(503).json({ error: 'Community agent not available' });

  community.leaveRoom(req.params.roomId, req.body.userId);
  res.json({ success: true });
});

// ═══════════════════════════════════════
//  FORUM / PROBLEM SHARING ROUTES
// ═══════════════════════════════════════

// Create a post
router.post('/posts', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const { userId, userName, title, description, category, tags } = req.body;
    const result = await community.createPost({ userId, userName, title, description, category, tags });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts (with filters)
router.get('/posts', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const { category, status, search, limit, offset } = req.query;
    const result = await community.getPosts({
      category, status, search,
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add answer to a post
router.post('/posts/:postId/answers', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const { userId, userName, content } = req.body;
    const result = await community.addAnswer(req.params.postId, { userId, userName, content });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on post or answer
router.post('/posts/:postId/vote', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const { answerId, direction } = req.body;
    const result = await community.vote(req.params.postId, answerId, direction || 'up');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Community stats
router.get('/stats', async (req, res) => {
  try {
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'Community agent not available' });

    const stats = await community.getStats();
    res.json({ success: true, ...stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
//  REMOTE ASSIST ROUTES (Harshita AI IT Support)
// ═══════════════════════════════════════

// Diagnose a problem (AI-powered)
router.post('/assist/diagnose', async (req, res) => {
  try {
    const remoteAssist = req.app.get('remoteAssistAgent');
    if (!remoteAssist) return res.status(503).json({ error: 'RemoteAssistAgent not available' });

    const { problem, category } = req.body;
    const result = await remoteAssist.diagnoseProblem(problem, category);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a remote assist session (requests user consent)
router.post('/assist/start', (req, res) => {
  try {
    const remoteAssist = req.app.get('remoteAssistAgent');
    if (!remoteAssist) return res.status(503).json({ error: 'RemoteAssistAgent not available' });

    const { userId, problem } = req.body;
    const result = remoteAssist.startSession(userId, problem);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request Harshita Fix from a forum post answer
router.post('/assist/fix-from-post', async (req, res) => {
  try {
    const remoteAssist = req.app.get('remoteAssistAgent');
    if (!remoteAssist) return res.status(503).json({ error: 'RemoteAssistAgent not available' });

    const { userId, postId, answerId } = req.body;

    // Load the post to get the AI diagnosis
    const community = req.app.get('communityAgent');
    if (!community) return res.status(503).json({ error: 'CommunityAgent not available' });

    const postsData = await community.getPosts({ limit: 1000 });
    const post = postsData.posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const answer = post.answers.find(a => a.id === answerId);
    if (!answer || !answer.canRemoteFix) {
      return res.json({ success: false, error: 'This answer does not support remote fix' });
    }

    // Start remote session with the diagnosis from this answer
    const session = remoteAssist.startSession(userId, post.title + '. ' + post.description);
    res.json({ success: true, ...session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remote assist stats
router.get('/assist/stats', (req, res) => {
  const remoteAssist = req.app.get('remoteAssistAgent');
  if (!remoteAssist) return res.status(503).json({ error: 'RemoteAssistAgent not available' });

  res.json({ success: true, ...remoteAssist.getStats() });
});

module.exports = router;
