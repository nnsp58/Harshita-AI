// scripts/test-realistic-video.js - Verify E2E realistic story video generation
require('dotenv').config();
const { storyVideoSkill } = require('../src/skills/StoryVideoSkill');
const { prisma } = require('../src/models/database');

const testStory = "एक छोटा बच्चा स्कूल जाते समय रास्ते में एक घायल पिल्ले को देखता है और उसकी मदद करता है।";

async function main() {
  console.log('🎬 Starting Realistic Story Video Pipeline verification...');
  console.log('Story:', testStory);

  let connectionValid = false;
  if (prisma) {
    try {
      await prisma.$connect();
      console.log('📦 Database connected successfully.');
      connectionValid = true;
    } catch (e) {
      console.warn('⚠️ SQLite connection warning:', e.message);
    }
  }

  const mockIo = {
    emit: (event, payload) => {
      console.log(`📡 [Socket Event: ${event}]`, payload.message || payload);
    }
  };

  try {
    const result = await storyVideoSkill.execute({
      story: testStory,
      language: 'Hindi',
      duration: 15,
      style: 'Realistic',
      voiceType: 'Hindi Male',
      io: mockIo
    });

    console.log('✅ Realistic Video generation task started. Record ID:', result.data.id);

    if (connectionValid) {
      const interval = setInterval(async () => {
        const record = await prisma.storyVideo.findUnique({
          where: { id: result.data.id }
        });
        console.log(`⏱️ Current DB Status: ${record.status}`);
        if (record.status === 'completed') {
          clearInterval(interval);
          console.log('🎉 Realistic Video Verification Success!');
          console.log('Video Path:', record.videoPath);
          console.log('SRT Path:', record.srtPath);
          console.log('Final Scene Prompts:');
          if (record.scenes && Array.isArray(record.scenes)) {
            record.scenes.forEach((s) => {
              console.log(`\nScene ${s.sceneNumber}:`);
              console.log(`- Narration: ${s.narration}`);
              console.log(`- Image Prompt: ${s.imagePrompt}`);
            });
          }
          process.exit(0);
        } else if (record.status === 'failed') {
          clearInterval(interval);
          console.error('❌ Verification Failed! Error:', record.error);
          process.exit(1);
        }
      }, 5000);
    } else {
      console.log('Running in memory fallback mode, waiting 40 seconds to complete...');
      setTimeout(() => {
        console.log('Completed waiting. Check logs above.');
        process.exit(0);
      }, 40000);
    }
  } catch (error) {
    console.error('❌ Pipeline test failed with error:', error);
    process.exit(1);
  }
}

main();
