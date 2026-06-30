# PRD 06 — Video AI Engine

## Overview

The Video AI Engine generates short-form and educational videos automatically from text prompts. It handles the entire pipeline: story analysis → scene breakdown → storyboard → voiceover → rendering → subtitles → final export.

---

## Existing Implementation

### StoryVideoSkill
**File:** `src/skills/StoryVideoSkill.js` (37,518 bytes — fully implemented)

Already supports:
- Story analysis and scene breakdown
- Character and camera planning
- Subtitle generation
- Voiceover with TTS
- Background music selection
- Video clip assembly via FFmpeg
- Final MP4 export

---

## v2.0 Video Types

| Video Type | Duration | Aspect Ratio | Use Case |
|-----------|----------|--------------|----------|
| Instagram Reel | 15-60s | 9:16 | Social media marketing |
| YouTube Short | 15-60s | 9:16 | Short-form content |
| Educational Video | 1-10 min | 16:9 | Course content, tutorials |
| Kids Story | 1-5 min | 16:9 | Animated children's stories |
| Avatar Video | 30s-5 min | 16:9 | AI presenter videos |
| Course Video | 5-30 min | 16:9 | Full course modules |
| Explainer Video | 1-3 min | 16:9 | Product/service explanations |

---

## Pipeline Architecture

```
Text Prompt / Story
    ↓
Story Analyzer (AI)
    ↓
Scene Breakdown (scenes[], dialogues[], actions[])
    ↓
Storyboard Generator (visual descriptions per scene)
    ↓
Asset Generation
├── Image/Avatar Generation (per scene)
├── Voice Over (TTS per dialogue)
├── Background Music (mood-based selection)
└── Subtitle Generation (SRT/VTT)
    ↓
Video Renderer (FFmpeg)
├── Clip assembly
├── Transitions
├── Audio mixing
└── Subtitle overlay
    ↓
Quality Check (resolution, duration, audio sync)
    ↓
Export (MP4, WebM)
    ↓
Delivery (download link, streaming)
```

---

## Input Schema

```javascript
VideoInputSchema = z.object({
  type: z.enum(['reel', 'short', 'educational', 'kids_story', 'avatar', 'course', 'explainer']),
  prompt: z.string().min(10),                    // Story or topic
  language: z.enum(['hi', 'en', 'hinglish']).default('hi'),
  duration: z.number().min(15).max(1800).optional(), // seconds
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('9:16'),
  voiceGender: z.enum(['male', 'female']).default('female'),
  musicMood: z.enum(['happy', 'sad', 'energetic', 'calm', 'dramatic']).optional(),
  subtitles: z.boolean().default(true),
  watermark: z.boolean().default(false),
});
```

---

## Verification Rules

```javascript
validationRules: [
  'output_file_exists',          // MP4 file was generated
  'duration_within_range',       // Matches requested duration ±10%
  'audio_sync_check',            // Audio matches video timing
  'resolution_check',            // Minimum 720p
  'subtitle_timing_valid',       // Subtitles aligned with speech
  'file_size_reasonable',        // Not too large (< 100MB for shorts)
]
```

---

## Dependencies

- `ffmpeg-static` — Video processing (already installed)
- `fluent-ffmpeg` — FFmpeg wrapper (already installed)
- AI Image Generation API — Scene visuals
- TTS API — Voice generation
- Background music library — `data/music/`
