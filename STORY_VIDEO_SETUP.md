# Story To Cartoon Video Generator — API Setup & Deployment Guide

This guide describes how to configure, test, and deploy the new Story To Cartoon Video Generator module inside Harshita AI.

---

## 🛠️ API Setup Guide

The module supports two modes: **Demo Mode** (using free resources) and **Premium Mode** (using client keys).

### 1. Demo Mode (Free Tier)
To run the system out-of-the-box without client keys:
- **LLM/Analysis**: Set `GROQ_API_KEY` in the server's `.env` file (Llama 3.3 will handle scene splitting and prompting). If a `GEMINI_API_KEY` is provided, Gemini 2.0 Flash will be used.
- **Images**: Pollinations AI (Flux) is used. It is completely free and requires no API key.
- **Voiceover**: Google Translate TTS is used. It is free and requires no registration.
- **Video Mixer**: FFmpeg compiles the scenes with background loops automatically.

### 2. Premium Mode (Client Keys)
Clients can connect their premium keys in **Settings → API Settings** directly in the UI. No code changes are required. The system will detect their presence and upgrade quality:
- **OpenAI API Key**: Used for better storyboard writing and character consistency.
- **ElevenLabs API Key**: Configures premium voice narrations.
- **Fal AI API Key**: Triggers Flux Schnell/Dev for high-end vertical cartoon image outputs.
- **Runway / Veo Keys**: Optional integrations for scene animation support.

---

## 🚀 Deployment Instructions

### 1. VPS / Server Deployment (PM2 / Node)
1. **System Dependencies**: Ensure FFmpeg is installed on your Linux VPS:
   ```bash
   sudo apt-get update
   sudo apt-get install -y ffmpeg
   ```
2. **Install Node Packages**:
   ```bash
   # From root folder
   npm install
   ```
3. **Database Migration**: Pushing the new SQLite models (`StoryVideo` and `SystemSetting`):
   ```bash
   npx prisma db push
   ```
4. **Start Server**:
   ```bash
   pm2 restart ecosystem.config.js
   ```

### 2. Docker Setup
We updated the [Dockerfile](file:///d:/Harshita-AI/Dockerfile) to install `ffmpeg` inside the container:
```dockerfile
# Installs system dependencies for video composition
RUN apk add --no-cache ffmpeg ...
```
No extra setup is required! Simply rebuild the container:
```bash
docker-compose up --build -d
```

---

## 📋 Production Checklist

- [x] **Database Backup**: Verify `dev.db` has read-write permissions for the `nodejs` Docker user.
- [x] **FFmpeg Pathing**: Ensure the `ffmpeg-static` library works by invoking the static binary at start.
- [x] **Data Folder Exposed**: Verify the `dataPath` is mounted statically in Express (`server.js`) so that `/data/...` paths are accessible in React.
- [x] **Disk Cleanup**: Configure a cron job or use the Admin tab's **Asset Cleanup** to prune the `data/story-video/*` temp scene frames after 24 hours.
