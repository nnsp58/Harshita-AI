// scripts/test-video-generation.js - Story To Cartoon Video Pipeline Test
require('dotenv').config();
const { storyVideoSkill } = require('../src/skills/StoryVideoSkill');
const { prisma } = require('../src/models/database');
const path = require('path');
const fs = require('fs');

const testStory = "एक गरीब किसान को रास्ते में सोने का सिक्का मिला। वह खुश हुआ और उसने उसे भगवान का आशीर्वाद माना।";

async function main() {
  console.log('🎬 Starting backend video pipeline verification test...');
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
      style: 'Cartoon',
      voiceType: 'Hindi Male',
      io: mockIo
    });

    console.log('✅ Generation task started. Record ID:', result.data.id);

    if (connectionValid) {
      const interval = setInterval(async () => {
        const record = await prisma.storyVideo.findUnique({
          where: { id: result.data.id }
        });
        console.log(`⏱️ Current DB Status: ${record.status}`);
        if (record.status === 'completed') {
          clearInterval(interval);
          console.log('🎉 Verification Success!');
          console.log('Video URL Path:', record.videoPath);
          console.log('SRT URL Path:', record.srtPath);
          process.exit(0);
        } else if (record.status === 'failed') {
          clearInterval(interval);
          console.error('❌ Verification Failed! Error:', record.error);
          process.exit(1);
        }
      }, 40000);
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
