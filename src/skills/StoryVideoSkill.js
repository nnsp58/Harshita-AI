// src/skills/StoryVideoSkill.js - Story To Cartoon Video Generator Core Pipeline
const { BaseSkill } = require('./BaseSkill');
const { prisma } = require('../models/database');
const { decrypt } = require('../utils/cryptoHelper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegStaticPath = require('ffmpeg-static');
const musicMetadata = require('music-metadata');

class StoryVideoSkill extends BaseSkill {
  constructor() {
    super();
    this.name = 'story_video';
    this.displayName = 'कहानी से कार्टून वीडियो';
    this.displayNameEn = 'Story To Cartoon Video';
    this.description = 'कहानी या विचार से सीधे कार्टून वीडियो (YouTube Shorts / Reels) बनाना';
    this.descriptionEn = 'Convert any story or idea into a short cartoon video';
    this.version = '1.0.0';
    this.category = 'automation';
    this.priority = 8;
    this.intents = ['story_video', 'generate_video', 'cartoon_video'];
  }

  /**
   * Helper to retrieve API key securely (from database or fallback to .env)
   */
  async getApiKey(provider) {
    if (!prisma) return process.env[`${provider.toUpperCase()}_API_KEY`] || null;
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: `api_key_${provider}` }
      });
      if (setting && setting.value) {
        return decrypt(setting.value);
      }
    } catch (e) {
      console.warn(`[StoryVideoSkill] Error reading key ${provider} from DB:`, e.message);
    }
    return process.env[`${provider.toUpperCase()}_API_KEY`] || null;
  }

  /**
   * Main Execution Entry Point
   */
  async execute(context) {
    const { story, language, duration, style, voiceType, io } = context;
    
    // Create new record in DB as pending
    const videoRecord = await prisma.storyVideo.create({
      data: {
        title: 'Analyzing story...',
        story: story,
        language: language,
        duration: parseInt(duration) || 30,
        style: style || 'Cartoon',
        voiceType: voiceType || 'Hindi Male',
        status: 'pending'
      }
    });

    // Run E2E pipeline in background so it doesn't block the HTTP request
    this.runPipeline(videoRecord.id, context, io).catch(async (err) => {
      console.error('[StoryVideoSkill] Pipeline failed:', err);
      await prisma.storyVideo.update({
        where: { id: videoRecord.id },
        data: {
          status: 'failed',
          error: err.message
        }
      });
      if (io) {
        io.emit('story-video-progress', {
          id: videoRecord.id,
          stage: 'error',
          progress: 100,
          error: err.message
        });
      }
    });

    return this._reply('Video generation started in background.', { id: videoRecord.id });
  }

  /**
   * E2E Generation Pipeline
   */
  /**
   * Helper to run an operation with automatic retries and root-cause error parsing
   */
  async retryOperation(operation, name, retries = 3, delay = 2000) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await operation();
      } catch (err) {
        attempt++;
        console.warn(`[StoryVideoSkill] Attempt ${attempt} for "${name}" failed: ${err.message}`);
        if (attempt >= retries) {
          let rootCause = err.message;
          let suggestion = 'Please check backend logs and verify network configuration.';
          
          if (err.response) {
            const status = err.response.status;
            const data = err.response.data;
            if (status === 401) {
              suggestion = `Invalid or unauthorized API key used for ${name}. Verify key configuration in Settings.`;
            } else if (status === 429) {
              suggestion = `Rate limit reached or quota exhausted for ${name}. Try again later.`;
            } else if (data && data.error && data.error.message) {
              rootCause = data.error.message;
            }
          } else if (err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
            suggestion = 'Network timeout or DNS failure. Check internet connection or API endpoint accessibility.';
          } else if (err.message.includes('FFmpeg')) {
            suggestion = 'FFmpeg binary execution failed. Ensure system dependencies are correctly loaded.';
          }
          
          const finalErr = new Error(`${name} failed after ${retries} attempts. Root Cause: ${rootCause}. Suggestion: ${suggestion}`);
          finalErr.rootCause = rootCause;
          finalErr.suggestion = suggestion;
          throw finalErr;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * E2E Generation Pipeline
   */
  async runPipeline(id, data, io) {
    const updateProgress = async (stage, progress, message, extra = {}) => {
      console.log(`[StoryVideoSkill] Video ${id} - ${stage} (${progress}%): ${message}`);
      if (io) {
        io.emit('story-video-progress', { id, stage, progress, message, ...extra });
      }
    };

    const projectDir = path.join(__dirname, `../../data/story-video/${id}`);
    fs.mkdirSync(projectDir, { recursive: true });

    // Step 1: Story analysis
    await updateProgress('analysis', 10, 'Analyzing Story...');
    
    // Step 2: Generating Scenes
    await updateProgress('scenes', 20, 'Generating Scenes...');
    
    // Step 3: Creating Characters
    await updateProgress('characters', 30, 'Creating Characters...');
    
    const scenes = await this.retryOperation(async () => {
      return await this.generateSceneBreakdown(data.story, data.language, data.duration, data.style);
    }, 'Story Analysis & Scene Breakdown');
    
    await prisma.storyVideo.update({
      where: { id },
      data: {
        title: scenes.title || 'Untitled Cartoon',
        metadata: {
          title: scenes.title,
          moral: scenes.moral,
          characters: scenes.characters,
          locations: scenes.locations,
          category: scenes.category,
          theme: scenes.theme,
          backgroundMusic: scenes.backgroundMusic,
          thumbnailPrompt: scenes.thumbnailPrompt,
          youtubeTitle: scenes.youtubeTitle,
          youtubeDescription: scenes.youtubeDescription,
          hashtags: scenes.hashtags
        }
      }
    });

    const sceneAssets = [];
    const totalScenes = scenes.scenes.length;

    // Step 4: Generating Video
    await updateProgress('video', 50, 'Generating Video...');
    
    for (let i = 0; i < totalScenes; i++) {
      const scene = scenes.scenes[i];
      const sceneNum = scene.sceneNumber || (i + 1);
      
      await updateProgress('video', 50 + Math.floor((i / totalScenes) * 10), `Generating Video: Scene ${sceneNum}/${totalScenes}...`);

      const imgPath = path.join(projectDir, `scene_${sceneNum}.jpg`);
      await this.retryOperation(async () => {
        await this.generateSceneImage(scene.imagePrompt, data.style, imgPath);
      }, `Image Generation for Scene ${sceneNum}`);

      // Step 5: Generating Voice
      await updateProgress('voice', 70, `Generating Voice: Scene ${sceneNum}/${totalScenes}...`);
      const audioPath = path.join(projectDir, `scene_${sceneNum}.mp3`);
      await this.retryOperation(async () => {
        await this.generateNarration(scene.narration, data.voiceType, audioPath);
      }, `Voice Narration for Scene ${sceneNum}`);

      // Get exact audio duration
      let audioDuration = 5.0; // fallback
      try {
        const metadata = await musicMetadata.parseFile(audioPath);
        audioDuration = metadata.format.duration || 5.0;
      } catch (err) {
        console.warn(`[StoryVideoSkill] Could not read duration of scene_${sceneNum}.mp3, using fallback 5s:`, err.message);
      }

      sceneAssets.push({
        sceneNumber: sceneNum,
        narration: scene.narration,
        subtitle: scene.subtitle || scene.narration,
        imagePrompt: scene.imagePrompt,
        cameraDirection: scene.cameraDirection || 'Zoom in',
        visualDescription: scene.visualDescription || '',
        characterDescription: scene.characterDescription || '',
        characterActions: scene.characterActions || '',
        facialExpressions: scene.facialExpressions || '',
        cameraAngle: scene.cameraAngle || '',
        cameraMovement: scene.cameraDirection || 'Zoom in',
        environmentDetails: scene.environmentDetails || '',
        lightingStyle: scene.lightingStyle || '',
        imgPath,
        audioPath,
        duration: audioDuration
      });
    }

    // Save scenes assets details to db
    await prisma.storyVideo.update({
      where: { id },
      data: {
        scenes: sceneAssets.map(s => ({
          sceneNumber: s.sceneNumber,
          narration: s.narration,
          subtitle: s.subtitle,
          imagePrompt: s.imagePrompt,
          cameraDirection: s.cameraDirection,
          visualDescription: s.visualDescription,
          characterDescription: s.characterDescription,
          characterActions: s.characterActions,
          facialExpressions: s.facialExpressions,
          cameraAngle: s.cameraAngle,
          cameraMovement: s.cameraMovement,
          environmentDetails: s.environmentDetails,
          lightingStyle: s.lightingStyle,
          duration: s.duration,
          imageFile: `/data/story-video/${id}/scene_${s.sceneNumber}.jpg`,
          audioFile: `/data/story-video/${id}/scene_${s.sceneNumber}.mp3`
        }))
      }
    });

    // Step 6: Creating Subtitles
    await updateProgress('subtitles', 80, 'Creating Subtitles...');
    const srtPath = path.join(projectDir, 'subtitles.srt');
    this.createSRTFile(sceneAssets, srtPath);

    // Step 7: Rendering Video
    await updateProgress('rendering', 90, 'Rendering Video...');
    const finalMp4Path = path.join(projectDir, 'final.mp4');
    
    // Step 8: Finalizing
    await updateProgress('finalizing', 95, 'Finalizing...');
    await this.retryOperation(async () => {
      await this.compileVideoFFmpeg(sceneAssets, srtPath, finalMp4Path, projectDir);
    }, 'FFmpeg Video Composition & Audio Mixing');

    // Save final status
    await prisma.storyVideo.update({
      where: { id },
      data: {
        status: 'completed',
        videoPath: `/data/story-video/${id}/final.mp4`,
        srtPath: `/data/story-video/${id}/subtitles.srt`
      }
    });

    await updateProgress('completed', 100, 'Video generated successfully!', {
      videoUrl: `/data/story-video/${id}/final.mp4`
    });
  }

  /**
   * 1. Scene planning with Gemini/OpenAI/Groq fallback
   */
  async generateSceneBreakdown(story, language, targetDuration, style) {
    const openaiKey = await this.getApiKey('openai');
    const geminiKey = await this.getApiKey('gemini') || process.env.GEMINI_API_KEY;
    const groqKey = await this.getApiKey('groq') || process.env.GROQ_API_KEY;

    const isRealistic = style && style.toLowerCase() === 'realistic';
    const persona = 'expert AI Story-to-Video Director, Screenwriter, Animator, Cinematographer, Voiceover Writer, and Video Producer';
      
    const imagePromptInstruction = isRealistic
      ? `For each scene's 'imagePrompt', write a highly detailed realistic photo prompt in English. Describe:
         1. Scene Description
         2. Character Description (MUST describe realistic humans, specify exact age, gender, clothes, expressions, and emotions: e.g. Child, Boy, Girl, Man, Woman, Student, Farmer, Teacher)
         3. Camera Angle (e.g. cinematic camera movement, medium shot, extreme close up, panning shot, tracking shot)
         4. Character Action (natural human motion)
         5. Environment Details (realistic environment, natural lighting, time of day)
         Example imagePrompt: "A realistic 8-year-old boy wearing a school uniform walking slowly on a village road during morning sunlight, looking curious, cinematic camera movement, natural human motion, realistic environment, vertical video format."`
      : `Detailed prompt for generating the image of this scene in English. Describe the characters, locations, actions, lighting, and specify the style '${style}' cartoon style. Make it extremely visual and descriptive. Always keep it in English.`;

    const prompt = `You are an ${persona}.
Your task is to convert the user story into a complete short-form video production package suitable for YouTube Shorts, Instagram Reels, and Facebook Reels.

Story:
"${story}"

Requested Language: ${language}
Requested Image Style: ${style}

If the story is in Hindi, you MUST generate all textual content (descriptions, scripts, titles, notes) in Hindi, EXCEPT that 'imagePrompt' values MUST always be written in English.
If the story is in English, you MUST generate everything in English.

Target video duration is ${targetDuration} seconds. Generate exactly ${Math.round(targetDuration / 5) || 3} scenes.
Maintain strict character consistency across all scenes (appearance, clothing, age, and features).

Output MUST be a valid JSON object matching the following schema EXACTLY (do NOT add markdown code block wraps, output raw JSON):
{
  "title": "An engaging title for the video production",
  "category": "Kids, Adventure, Fable, Moral, Real Life, Drama, etc.",
  "theme": "The core story theme",
  "moral": "The moral or takeaway of the story in the requested language",
  "backgroundMusic": "Suggested background music style (e.g. Uplifting cinematic acoustic, emotional piano loop)",
  "thumbnailPrompt": "A detailed English image generation prompt for the video thumbnail",
  "youtubeTitle": "Engaging title for YouTube Shorts / Reels",
  "youtubeDescription": "Description for the video post including core hook and outline",
  "hashtags": ["#Tag1", "#Tag2", "#Tag3"],
  "characters": [
    {
      "name": "Character Name",
      "age": "Character Age (e.g. 8 years old, 45 years old)",
      "gender": "Gender",
      "emotions": "Main emotions displayed",
      "description": "Visual appearance description for character consistency"
    }
  ],
  "locations": ["List of core locations"],
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 5.0,
      "visualDescription": "Detailed visual description of the scene",
      "characterDescription": "Appearance details of character in this scene",
      "characterActions": "Actions performed by characters in this scene",
      "facialExpressions": "Expressions on characters' faces",
      "cameraAngle": "Cinematography camera angle (e.g. Medium shot, Extreme close up)",
      "cameraDirection": "A brief camera direction (e.g. 'Zoom in', 'Pan left', 'Static close up', 'Tilt down')",
      "environmentDetails": "Environment settings details",
      "lightingStyle": "Lighting style (e.g. Cinematic natural sunlight, warm interior lighting)",
      "imagePrompt": "${imagePromptInstruction}",
      "narration": "Narration text for this scene (this is what the voiceover will speak. Write it in the requested language ${language}!). Keep it short and under 120 characters.",
      "subtitle": "Subtitle text for captions (matches narration exactly, written in ${language})"
    }
  ]
}`;

    let jsonResponseText = '';

    let success = false;

    // 1. OpenAI
    if (openaiKey && !success) {
      try {
        console.log('[StoryVideoSkill] Using Premium OpenAI for scene breakdown...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }, {
          headers: { Authorization: `Bearer ${openaiKey}` }
        });
        jsonResponseText = response.data.choices[0].message.content.trim();
        success = true;
      } catch (err) {
        console.warn(`[StoryVideoSkill] OpenAI failed: ${err.message}. Trying next fallback...`);
      }
    }

    // 2. Gemini
    if (geminiKey && !success) {
      try {
        console.log('[StoryVideoSkill] Using Gemini for scene breakdown...');
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });
        jsonResponseText = response.data.candidates[0].content.parts[0].text.trim();
        success = true;
      } catch (err) {
        console.warn(`[StoryVideoSkill] Gemini failed: ${err.message}. Trying next fallback...`);
      }
    }

    // 3. Groq
    if (groqKey && !success) {
      try {
        console.log('[StoryVideoSkill] Using Groq (Llama 3.3) for scene breakdown...');
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }, {
          headers: { Authorization: `Bearer ${groqKey}` }
        });
        jsonResponseText = response.data.choices[0].message.content.trim();
        success = true;
      } catch (err) {
        console.warn(`[StoryVideoSkill] Groq failed: ${err.message}.`);
      }
    }

    if (!success) {
      throw new Error('All configured AI analysis providers failed (keys may be invalid, rate-limited, or blocked). Please verify settings.');
    }

    try {
      // Clean up markdown markers if any
      jsonResponseText = jsonResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonResponseText);
    } catch (e) {
      console.error('[StoryVideoSkill] Failed to parse AI JSON response:', jsonResponseText);
      throw new Error('Failed to plan scenes. The AI output was not valid JSON.');
    }
  }

  /**
   * 2. Image generation using Pollinations AI (Free) or Fal AI (Premium)
   */
  async generateSceneImage(prompt, style, outputPath) {
    const falKey = await this.getApiKey('fal');
    const isRealistic = style && style.toLowerCase() === 'realistic';
    
    const fullPrompt = isRealistic
      ? `${prompt}, photorealistic, hyperrealistic, cinematic lighting, 8k resolution, highly detailed, real human details, smooth human skin texture, natural expressions, 1080x1920 vertical format`
      : `${prompt}, beautiful digital art style, high quality ${style} style, cartoon illustration, bright color palette, 1080x1920 portrait aspect ratio`;

    if (falKey) {
      // Premium mode - Fal AI Flux
      console.log('[StoryVideoSkill] Generating image using Fal AI...');
      try {
        const response = await axios.post('https://queue.fal.run/fal-ai/flux/schnell', {
          prompt: fullPrompt,
          image_size: { width: 1080, height: 1920 }
        }, {
          headers: {
            Authorization: `Key ${falKey}`,
            'Content-Type': 'application/json'
          }
        });

        // Wait for generation
        const resultUrl = response.data.image?.url || response.data.images?.[0]?.url;
        if (resultUrl) {
          const imageRes = await axios.get(resultUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(outputPath, imageRes.data);
          return;
        }
      } catch (err) {
        console.error('[StoryVideoSkill] Fal AI failed, falling back to Pollinations:', err.message);
      }
    }

    // Demo Mode fallback - Pollinations AI
    console.log('[StoryVideoSkill] Generating image using Pollinations AI...');
    let retries = 3;
    let imgSuccess = false;
    let lastError = null;
    const pollinationsKey = await this.getApiKey('pollinations');

    while (retries > 0 && !imgSuccess) {
      try {
        const seed = Math.floor(Math.random() * 1000000);
        const pollinationsUrl = pollinationsKey
          ? `https://gen.pollinations.ai/image/${encodeURIComponent(fullPrompt)}?width=1080&height=1920&model=flux&nologo=true&seed=${seed}&key=${pollinationsKey}`
          : `https://gen.pollinations.ai/image/${encodeURIComponent(fullPrompt)}?width=1080&height=1920&model=flux&nologo=true&seed=${seed}`;
        const response = await axios.get(pollinationsUrl, { responseType: 'arraybuffer', timeout: 25000 });
        fs.writeFileSync(outputPath, response.data);
        imgSuccess = true;
      } catch (e) {
        lastError = e;
        retries--;
        console.warn(`[StoryVideoSkill] Pollinations AI failed (${e.message}). Retries left: ${retries}`);
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    if (!imgSuccess) {
      console.warn(`[StoryVideoSkill] Free image generation failed completely: ${lastError.message}. Using local sharp fallback...`);
      await this.createFallbackImage(prompt, style, outputPath);
    }
  }


  /**
   * 3. TTS Narration Generation
   */
  async generateNarration(text, voiceType, outputPath) {
    const elevenlabsKey = await this.getApiKey('elevenlabs');
    
    if (elevenlabsKey) {
      // Premium Mode - ElevenLabs
      console.log('[StoryVideoSkill] Generating voiceover using ElevenLabs...');
      // Map voices
      const voiceIds = {
        'Hindi Male': 'pNInz6obpgDQGcFmaJgB', // Adam fallback
        'Hindi Female': '21m00Tcm4TlvDq8ikWAM', // Rachel
        'English Male': 'pNInz6obpgDQGcFmaJgB',
        'English Female': '21m00Tcm4TlvDq8ikWAM'
      };
      const voiceId = voiceIds[voiceType] || voiceIds['English Male'];

      try {
        const response = await axios.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        }, {
          headers: {
            'xi-api-key': elevenlabsKey,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer'
        });
        fs.writeFileSync(outputPath, response.data);
        return;
      } catch (err) {
        console.error('[StoryVideoSkill] ElevenLabs failed, falling back to Google TTS:', err.message);
      }
    }

    // Demo Mode - Google Translate TTS fallback
    console.log('[StoryVideoSkill] Generating voiceover using Google Translate TTS...');
    const lang = voiceType.startsWith('Hindi') ? 'hi' : 'en';
    
    // Google Translate TTS url
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    
    try {
      const response = await axios.get(ttsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        responseType: 'arraybuffer'
      });
      fs.writeFileSync(outputPath, response.data);
    } catch (e) {
      console.warn(`[StoryVideoSkill] Google Translate TTS failed: ${e.message}. Using silent audio fallback...`);
      const duration = Math.max(3.0, Math.min(10.0, text.length / 15.0));
      await this.createSilentAudioFallback(outputPath, duration);
    }
  }

  /**
   * Helper: Generate a beautiful visual fallback using sharp
   */
  async createFallbackImage(prompt, style, outputPath) {
    console.log('[StoryVideoSkill] Generating fallback image using sharp...');
    try {
      const sharp = require('sharp');
      const colors = [
        ['#0f172a', '#1e293b'],
        ['#1e1b4b', '#312e81'],
        ['#130f26', '#261b5c'],
        ['#020617', '#0f172a']
      ];
      const selected = colors[Math.floor(Math.random() * colors.length)];
      
      const width = 1080;
      const height = 1920;
      
      const svgString = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${selected[0]};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${selected[1]};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
          <circle cx="${width/2}" cy="${height/2}" r="300" fill="white" opacity="0.03" />
        </svg>
      `;

      await sharp(Buffer.from(svgString))
        .jpeg()
        .toFile(outputPath);
      console.log(`[StoryVideoSkill] Fallback image saved at: ${outputPath}`);
    } catch (err) {
      console.error('[StoryVideoSkill] Sharp fallback image generation failed:', err.message);
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }

  /**
   * Helper: Generate silent audio fallback using FFmpeg
   */
  async createSilentAudioFallback(outputPath, duration = 5.0) {
    console.log(`[StoryVideoSkill] Generating silent audio fallback (${duration}s)...`);
    try {
      const args = [
        '-f', 'lavfi',
        '-i', 'anullsrc=r=44100:cl=stereo',
        '-t', String(duration),
        '-c:a', 'libmp3lame',
        '-y',
        outputPath
      ];
      await this.runFFmpeg(args);
      console.log(`[StoryVideoSkill] Silent audio fallback saved at: ${outputPath}`);
    } catch (err) {
      console.error('[StoryVideoSkill] Silent audio generation failed:', err.message);
      fs.writeFileSync(outputPath, Buffer.alloc(0));
    }
  }

  /**
   * 4. Synchronized SRT file builder
   */
  createSRTFile(sceneAssets, srtPath) {
    let srtContent = '';
    let cumulativeTime = 0.0;

    const formatSRTTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);

      const pad = (n, width = 2) => String(n).padStart(width, '0');
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
    };

    sceneAssets.forEach((scene, index) => {
      const startTime = cumulativeTime;
      const endTime = cumulativeTime + scene.duration;

      srtContent += `${index + 1}\n`;
      srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
      srtContent += `${scene.subtitle || scene.narration}\n\n`;

      cumulativeTime = endTime;
    });

    fs.writeFileSync(srtPath, srtContent, 'utf8');
  }

  /**
   * 5. Video Compile via FFmpeg
   */
  compileVideoFFmpeg(sceneAssets, srtPath, finalMp4Path, projectDir) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!ffmpegStaticPath) {
          throw new Error('Static FFmpeg binary could not be loaded via ffmpeg-static npm package.');
        }

        // Render individual scene video clips first
        const sceneClips = [];
        for (let i = 0; i < sceneAssets.length; i++) {
          const scene = sceneAssets[i];
          const clipPath = path.join(projectDir, `clip_${scene.sceneNumber}.mp4`);
          
          await this.renderSceneClip(scene, clipPath);
          sceneClips.push(clipPath);
        }

        // Create list file for concatenation
        const listFilePath = path.join(projectDir, 'concat_list.txt');
        const fileContent = sceneClips.map(p => `file '${path.resolve(p).replace(/\\/g, '/')}'`).join('\n');
        fs.writeFileSync(listFilePath, fileContent, 'utf8');

        // Step A: Concat scene clips into one video
        const mergedTempPath = path.join(projectDir, 'merged_temp.mp4');
        await this.runFFmpeg([
          '-f', 'concat',
          '-safe', '0',
          '-i', listFilePath,
          '-c', 'copy',
          '-y',
          mergedTempPath
        ]);

        // Check if default background music is present in data/assets/bg_music.mp3
        const defaultBgMusicPath = path.join(__dirname, '../../data/assets/bg_music.mp3');
        fs.mkdirSync(path.dirname(defaultBgMusicPath), { recursive: true });
        
        let hasMusic = fs.existsSync(defaultBgMusicPath);
        if (!hasMusic) {
          // Attempt to download a lightweight royalty-free loop if not present
          console.log('[StoryVideoSkill] Downloading default background music...');
          try {
            // Promise race to force a hard 8-second timeout on download (prevents infinite hanging on offline DNS)
            const downloadPromise = axios.get('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', { 
              responseType: 'arraybuffer', 
              timeout: 8000 
            });
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('DNS or connection timeout')), 8000)
            );
            
            const musicRes = await Promise.race([downloadPromise, timeoutPromise]);
            fs.writeFileSync(defaultBgMusicPath, musicRes.data);
            hasMusic = true;
          } catch (e) {
            console.warn('[StoryVideoSkill] Could not download background music, generating video with voiceover only:', e.message);
          }
        }

        // Step B: Mix background music and add subtitles (soft embedded subtitles or burn-in)
        // We will do a burn-in style using drawtext filter as it does not rely on libass build flag, 
        // or just overlay subtitles as soft subtitles. Burning subtitles with standard subfilter is the cleanest.
        // Let's copy subtitles to a local relative directory to prevent Windows path escaping errors in FFmpeg subtitles filter.
        const srtRelative = 'subtitles.srt'; // running FFmpeg in projectDir
        
        const ffmpegArgs = [];
        ffmpegArgs.push('-i', mergedTempPath);

        if (hasMusic) {
          ffmpegArgs.push('-stream_loop', '-1', '-i', defaultBgMusicPath);
          // Audio mixing filter: voice at 100% volume, background music at 8% volume
          ffmpegArgs.push('-filter_complex', '[1:a]volume=0.08[bg];[0:a][bg]amix=inputs=2:duration=first[a]');
        }

        // Apply subtitles burn-in. If subtitles burn-in fails because of absolute path issues in windows,
        // we'll run a fallback command.
        // Windows subtitle filter argument format: -vf "subtitles='C\\:/path/to/sub.srt'"
        const srtEscaped = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');
        let filterString = `subtitles='${srtEscaped}'`;

        // Check if premium credentials exist
        const openaiKey = await this.getApiKey('openai');
        const falKey = await this.getApiKey('fal');
        const elevenlabsKey = await this.getApiKey('elevenlabs');
        const hasPremium = !!(openaiKey || falKey || elevenlabsKey);

        if (!hasPremium) {
          console.log('[StoryVideoSkill] Demo Mode: Burning "Harshita AI" watermark into video stream.');
          filterString += `,drawtext=text='Harshita AI':x=w-tw-40:y=40:fontsize=32:fontcolor=white@0.6:box=1:boxcolor=black@0.3:boxborderw=8`;
        }

        ffmpegArgs.push('-vf', filterString);

        if (hasMusic) {
          ffmpegArgs.push('-map', '0:v', '-map', '[a]');
        } else {
          ffmpegArgs.push('-map', '0:v', '-map', '0:a');
        }

        ffmpegArgs.push('-c:v', 'libx264', '-c:a', 'aac', '-shortest', '-y', finalMp4Path);

        console.log('[StoryVideoSkill] Mixing audio and burning subtitles...');
        try {
          await this.runFFmpeg(ffmpegArgs); // run in root or relative Cwd
        } catch (subError) {
          console.warn('[StoryVideoSkill] Subtitles burn-in failed. Trying to render with only watermark:', subError.message);
          // Try rendering with just watermark
          try {
            const watermarkArgs = ['-i', mergedTempPath];
            if (hasMusic) {
              watermarkArgs.push('-stream_loop', '-1', '-i', defaultBgMusicPath);
              watermarkArgs.push('-filter_complex', '[1:a]volume=0.08[bg];[0:a][bg]amix=inputs=2:duration=first[a]');
            }
            if (!hasPremium) {
              watermarkArgs.push('-vf', `drawtext=text='Harshita AI':x=w-tw-40:y=40:fontsize=32:fontcolor=white@0.6:box=1:boxcolor=black@0.3:boxborderw=8`);
            }
            if (hasMusic) {
              watermarkArgs.push('-map', '0:v', '-map', '[a]');
            } else {
              watermarkArgs.push('-map', '0:v', '-map', '0:a');
            }
            watermarkArgs.push('-c:v', 'libx264', '-c:a', 'aac', '-y', finalMp4Path);
            await this.runFFmpeg(watermarkArgs);
          } catch (wmError) {
            console.warn('[StoryVideoSkill] Watermark compile failed. Rendering clean video:', wmError.message);
            // Absolute clean fallback
            const cleanArgs = ['-i', mergedTempPath];
            if (hasMusic) {
              cleanArgs.push('-stream_loop', '-1', '-i', defaultBgMusicPath);
              cleanArgs.push('-filter_complex', '[1:a]volume=0.08[bg];[0:a][bg]amix=inputs=2:duration=first[a]');
              cleanArgs.push('-map', '0:v', '-map', '[a]');
            } else {
              cleanArgs.push('-map', '0:v', '-map', '0:a');
            }
            cleanArgs.push('-c:v', 'libx264', '-c:a', 'aac', '-y', finalMp4Path);
            await this.runFFmpeg(cleanArgs);
          }
        }

        // Clean up temporary scene clips
        try {
          fs.unlinkSync(mergedTempPath);
          fs.unlinkSync(listFilePath);
          sceneClips.forEach(p => fs.unlinkSync(p));
        } catch (e) {}

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Helper: Render single scene clip with dynamic zoom/pan motion effect
   */
  async renderSceneClip(scene, outputPath) {
    const duration = scene.duration;
    const pollinationsKey = await this.getApiKey('pollinations');

    if (pollinationsKey) {
      console.log(`[StoryVideoSkill] Attempting to generate video clip from Pollinations for Scene ${scene.sceneNumber}...`);
      try {
        const videoDuration = Math.max(3, Math.min(10, Math.ceil(duration)));
        const videoPrompt = scene.imagePrompt;
        const videoUrl = `https://gen.pollinations.ai/video/${encodeURIComponent(videoPrompt)}?model=wan-fast&duration=${videoDuration}`;
        
        const response = await axios.get(videoUrl, {
          headers: {
            Authorization: `Bearer ${pollinationsKey}`
          },
          responseType: 'arraybuffer',
          timeout: 45000
        });

        const tempVideoPath = outputPath.replace('.mp4', '_temp.mp4');
        fs.writeFileSync(tempVideoPath, response.data);

        console.log(`[StoryVideoSkill] Mixing scene audio with Pollinations video clip...`);
        await this.runFFmpeg([
          '-i', tempVideoPath,
          '-i', scene.audioPath,
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-map', '0:v',
          '-map', '1:a',
          '-shortest',
          '-y',
          outputPath
        ]);

        fs.unlinkSync(tempVideoPath);
        console.log(`[StoryVideoSkill] Successfully generated and compiled realistic video clip for Scene ${scene.sceneNumber}!`);
        return;
      } catch (err) {
        console.warn(`[StoryVideoSkill] Pollinations AI video generation failed (${err.message}). Falling back to slideshow compilation...`);
      }
    }

    const fps = 25;
    const totalFrames = Math.ceil(duration * fps);
    
    // Zoom filter: Starts at zoom=1.0 and increases by 0.001 per frame up to 1.3
    // zoompan formula: z='min(zoom+0.001,1.25)'
    // Standard FFmpeg parameters:
    const args = [
      '-loop', '1',
      '-i', scene.imgPath,
      '-i', scene.audioPath,
      '-vf', `scale=1080:1920,zoompan=z='min(zoom+0.001,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=1080x1920`,
      '-c:v', 'libx264',
      '-t', String(duration),
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-y',
      outputPath
    ];

    console.log(`[StoryVideoSkill] Rendering Scene Clip ${scene.sceneNumber} (${duration.toFixed(1)}s)...`);
    try {
      await this.runFFmpeg(args);
    } catch (e) {
      console.warn(`[StoryVideoSkill] Zoompan filter failed for Scene ${scene.sceneNumber}. Falling back to static image loop:`, e.message);
      // Fallback: Static loop
      const fallbackArgs = [
        '-loop', '1',
        '-i', scene.imgPath,
        '-i', scene.audioPath,
        '-c:v', 'libx264',
        '-t', String(duration),
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=1080:1920',
        '-c:a', 'aac',
        '-y',
        outputPath
      ];
      await this.runFFmpeg(fallbackArgs);
    }
  }

  /**
   * Spawn FFmpeg child process
   */
  runFFmpeg(args, workingDir = undefined) {
    return new Promise((resolve, reject) => {
      const ffmpegPath = ffmpegStaticPath;
      console.log(`[StoryVideoSkill] Spawning FFmpeg with args: ${args.join(' ')}`);
      
      const process = spawn(ffmpegPath, args, {
        cwd: workingDir
      });

      let stderrLog = '';
      process.stderr.on('data', (data) => {
        stderrLog += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.error('[StoryVideoSkill] FFmpeg error output:', stderrLog);
          reject(new Error(`FFmpeg exited with code ${code}. Stderr: ${stderrLog.slice(-300)}`));
        }
      });

      process.on('error', (err) => {
        reject(err);
      });
    });
  }
}

const storyVideoSkill = new StoryVideoSkill();

module.exports = { StoryVideoSkill, storyVideoSkill };
