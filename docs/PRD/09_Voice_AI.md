# PRD 09 — Voice AI Engine

## Overview

The Voice AI Engine provides speech-related capabilities — speech recognition, text-to-speech, voice translation, and interactive voice agents.

---

## Existing Implementation

### VoiceAgentSkill
**File:** `src/skills/VoiceAgentSkill.js` (5,372 bytes)
- Text-to-Speech (TTS) for responses
- Voice mode toggle per user
- Hindi and English voice support

---

## v2.0 Voice Skills

| Skill | Description | Offline | API Required |
|-------|-------------|---------|-------------|
| Speech To Text | Convert audio to text | ❌ | Whisper API / Google STT |
| Text To Speech | Convert text to natural speech | ❌ | Google TTS / ElevenLabs |
| Voice Translation | Speak in one language, output in another | ❌ | Translation + TTS |
| Voice Clone | Clone a voice from sample | ❌ | ElevenLabs |
| Phone Agent | Interactive voice-based AI assistant | ❌ | Twilio + STT + TTS |
| Voice Command | Control Harshita AI via voice | ❌ | STT + IntentDetector |

---

## Input Schema

```javascript
VoiceInputSchema = z.object({
  action: z.enum(['stt', 'tts', 'translate_voice', 'clone', 'phone_agent', 'command']),
  audioPath: z.string().optional(),          // For STT input
  text: z.string().optional(),               // For TTS input
  sourceLanguage: z.string().default('hi'),
  targetLanguage: z.string().optional(),
  voiceId: z.string().optional(),            // For voice clone
  gender: z.enum(['male', 'female']).default('female'),
  speed: z.number().min(0.5).max(2.0).default(1.0),
});
```

---

## Integration

- Voice responses auto-triggered when user has voice mode ON
- MasterAgent checks `voiceSkill.isVoiceModeEnabled(userId)` for every response
- Audio files stored in `uploads/voice/` directory
