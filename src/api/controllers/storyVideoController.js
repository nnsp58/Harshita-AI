// src/api/controllers/storyVideoController.js - Story To Cartoon Video Controller
const { prisma } = require('../../models/database');
const { storyVideoSkill } = require('../../skills/StoryVideoSkill');
const fs = require('fs');
const path = require('path');

/**
 * Generate a new Story Cartoon Video (Runs in the background)
 */
async function generateVideo(req, res) {
  try {
    const { story, language, duration, style, voiceType } = req.body;
    if (!story || story.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Story text is required.' });
    }

    const io = req.app.get('io');
    const userId = req.user?.id || null;
    const cscId = req.user?.csc_id || null;

    // Daily Adoption limit check: 5 free generations per 24 hours in Demo Mode
    if (prisma) {
      const systemSettings = await prisma.systemSetting.findMany({
        where: {
          key: {
            in: ['api_key_openai', 'api_key_fal', 'api_key_elevenlabs']
          }
        }
      });
      const hasPremiumKeys = systemSettings.some(setting => setting.value && setting.value.trim().length > 0);

      if (!hasPremiumKeys) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyCount = await prisma.storyVideo.count({
          where: {
            created_at: {
              gte: oneDayAgo
            }
          }
        });

        if (dailyCount >= 5) {
          return res.status(429).json({
            success: false,
            error: 'Daily adoption limit of 5 free demo video generations reached. Upgrade and connect your own API keys in Settings to unlock unlimited generations!'
          });
        }
      }
    }

    // Trigger execute from the skill
    const result = await storyVideoSkill.execute({
      story: story.trim(),
      language: language || 'Hindi',
      duration: duration || 30,
      style: style || 'Cartoon',
      voiceType: voiceType || 'Hindi Male',
      io,
      userId,
      cscId
    });

    return res.json({
      success: true,
      message: 'Video generation task queued successfully.',
      data: result.data // Contains the video record id
    });
  } catch (error) {
    console.error('[StoryVideoController] Error starting generation:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * List all generated / queued videos
 */
async function listVideos(req, res) {
  try {
    if (!prisma) {
      return res.json({ success: true, data: [], message: 'Running in in-memory mode.' });
    }

    const videos = await prisma.storyVideo.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('[StoryVideoController] Error listing videos:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get active status and logs of a single video
 */
async function getVideoStatus(req, res) {
  try {
    const { id } = req.params;
    if (!prisma) {
      return res.status(500).json({ success: false, error: 'Database not loaded.' });
    }

    const video = await prisma.storyVideo.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video record not found.' });
    }

    return res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('[StoryVideoController] Error getting status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Delete a video and clean up its files from the storage disk
 */
async function deleteVideo(req, res) {
  try {
    const { id } = req.params;
    if (!prisma) {
      return res.status(500).json({ success: false, error: 'Database not loaded.' });
    }

    // Delete record from DB
    const video = await prisma.storyVideo.delete({
      where: { id }
    });

    // Delete the local files from data/story-video/:id
    const projectDir = path.join(__dirname, `../../data/story-video/${id}`);
    if (fs.existsSync(projectDir)) {
      try {
        fs.rmSync(projectDir, { recursive: true, force: true });
        console.log(`[StoryVideoController] Cleaned up folder for video ${id}`);
      } catch (rmErr) {
        console.warn(`[StoryVideoController] Could not clean files for ${id}:`, rmErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Video deleted successfully and files cleaned up.'
    });
  } catch (error) {
    console.error('[StoryVideoController] Error deleting video:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Trigger regeneration of a previously created video
 */
async function regenerateVideo(req, res) {
  try {
    const { id } = req.params;
    if (!prisma) {
      return res.status(500).json({ success: false, error: 'Database not loaded.' });
    }

    const video = await prisma.storyVideo.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found.' });
    }

    // Reset status to pending
    await prisma.storyVideo.update({
      where: { id },
      data: {
        status: 'pending',
        error: null,
        videoPath: null,
        srtPath: null
      }
    });

    const io = req.app.get('io');

    // Run pipeline in background
    storyVideoSkill.runPipeline(id, video, io).catch(async (err) => {
      console.error('[StoryVideoSkill] Regeneration pipeline failed:', err);
      await prisma.storyVideo.update({
        where: { id },
        data: {
          status: 'failed',
          error: err.message
        }
      });
      if (io) {
        io.emit('story-video-progress', {
          id,
          stage: 'error',
          progress: 100,
          error: err.message
        });
      }
    });

    return res.json({
      success: true,
      message: 'Regeneration started in background.'
    });
  } catch (error) {
    console.error('[StoryVideoController] Error regenerating video:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  generateVideo,
  listVideos,
  getVideoStatus,
  deleteVideo,
  regenerateVideo
};
