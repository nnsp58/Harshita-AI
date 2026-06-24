// src/api/routes/storyVideo.js - Story To Cartoon Video Routes
const express = require('express');
const router = express.Router();
const storyVideoController = require('../controllers/storyVideoController');
const { authenticate } = require('../middleware/auth');

router.post('/generate', authenticate, storyVideoController.generateVideo);
router.get('/list', authenticate, storyVideoController.listVideos);
router.get('/status/:id', authenticate, storyVideoController.getVideoStatus);
router.delete('/:id', authenticate, storyVideoController.deleteVideo);
router.post('/:id/regenerate', authenticate, storyVideoController.regenerateVideo);

module.exports = router;
