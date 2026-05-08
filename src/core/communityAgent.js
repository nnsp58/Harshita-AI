/**
 * CommunityAgent — Operator Network + Video Conference System
 *
 * CSC/Computer/Cyber Café संचालकों का अपना "Network" जहाँ वे:
 *   1. Video Conference कर सकें
 *   2. अपनी Problems share कर सकें (Q&A Forum)
 *   3. Solutions ढूँढ सकें (AI-powered search in past discussions)
 *   4. Announcements/Tips पा सकें
 *
 * Video Conferencing — HYBRID ARCHITECTURE:
 *
 *   MODE 1: P2P Mesh (≤6 users)
 *     - Direct browser-to-browser WebRTC connections
 *     - Best quality, zero server load
 *     - Auto-selected when participants ≤ 6
 *
 *   MODE 2: SFU-Relay (7-50 users)
 *     - Each user sends stream once to server via Socket.IO binary
 *     - Server relays to all other participants
 *     - Auto video quality downgrade (720p→480p→360p→audio-only)
 *     - Handles 50+ concurrent participants
 *
 *   MODE 3: Webinar (50-200 viewers)
 *     - 1-4 presenters in full video
 *     - Everyone else is audio-only or view-only
 *     - Best for training/announcements
 *
 *   Features:
 *     - Screen sharing, in-call chat
 *     - Hand raise, mute/unmute controls
 *     - Auto quality adaptation based on participant count
 *     - Room types: video, audio_only, webinar
 *
 * Problem Sharing Forum:
 *   - Operators post questions about website issues, computer problems, etc.
 *   - AI suggests solutions from past discussions
 *   - Upvote/downvote system
 *   - Categorized: website, hardware, software, government portal, business
 *
 * Cost: ₹0 (WebRTC + Socket.IO relay — no external service needed)
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { aiProviderManager } = require('../utils/aiProviderManager');

class CommunityAgent {
  constructor(options = {}) {
    this.name = 'CommunityAgent';
    this.io = options.io || null;

    // Active video rooms
    this.videoRooms = new Map(); // roomId → { host, participants, topic, createdAt }

    // Community posts (file-backed)
    this.postsFile = path.join(process.cwd(), 'data', 'knowledge', 'community_posts.json');
    this._ensureFiles();

    // Setup Socket.IO signaling if io available
    if (this.io) {
      this._setupSignaling();
    }
  }

  async _ensureFiles() {
    const dir = path.dirname(this.postsFile);
    try {
      await fs.mkdir(dir, { recursive: true });
      try { await fs.access(this.postsFile); } catch {
        await fs.writeFile(this.postsFile, JSON.stringify({ posts: [], categories: ['website', 'hardware', 'software', 'government_portal', 'business', 'other'] }, null, 2));
      }
    } catch (e) { console.warn('[CommunityAgent] Init error:', e.message); }
  }

  // ═══════════════════════════════════════════════
  //  VIDEO CONFERENCING (WebRTC Signaling)
  // ═══════════════════════════════════════════════

  // Topology thresholds
  static P2P_MAX = 6;        // P2P mesh limit
  static RELAY_MAX = 50;     // SFU-relay limit
  static WEBINAR_MAX = 200;  // Webinar limit (presenters + viewers)

  // Video quality presets per participant count
  static QUALITY_PRESETS = {
    small:   { width: 1280, height: 720, frameRate: 30, label: '720p' },    // ≤4 users
    medium:  { width: 854,  height: 480, frameRate: 24, label: '480p' },    // 5-10 users
    large:   { width: 640,  height: 360, frameRate: 20, label: '360p' },    // 11-20 users
    xlarge:  { width: 426,  height: 240, frameRate: 15, label: '240p' },    // 21-50 users
    massive: { width: 0,    height: 0,   frameRate: 0,  label: 'audio-only' } // 50+ viewers
  };

  /**
   * Determine the optimal topology for a given participant count
   */
  _getTopology(participantCount, roomType) {
    if (roomType === 'webinar') return 'webinar';
    if (roomType === 'audio_only') return participantCount <= CommunityAgent.P2P_MAX ? 'p2p' : 'relay';
    if (participantCount <= CommunityAgent.P2P_MAX) return 'p2p';
    if (participantCount <= CommunityAgent.RELAY_MAX) return 'relay';
    return 'webinar'; // Auto-upgrade to webinar for massive rooms
  }

  /**
   * Get recommended video quality for current room state
   */
  _getQualityPreset(participantCount) {
    if (participantCount <= 4) return CommunityAgent.QUALITY_PRESETS.small;
    if (participantCount <= 10) return CommunityAgent.QUALITY_PRESETS.medium;
    if (participantCount <= 20) return CommunityAgent.QUALITY_PRESETS.large;
    if (participantCount <= 50) return CommunityAgent.QUALITY_PRESETS.xlarge;
    return CommunityAgent.QUALITY_PRESETS.massive;
  }

  /**
   * Create a new video conference room
   *
   * @param {Object} opts
   * @param {string} opts.hostId      — operator user ID
   * @param {string} opts.hostName    — operator display name
   * @param {string} opts.topic       — meeting subject
   * @param {number} opts.maxParticipants — max allowed (default: 50)
   * @param {string} opts.roomType    — 'video' | 'audio_only' | 'webinar' (default: 'video')
   * @returns {Object} — { roomId, meetingLink, topic, topology, quality }
   */
  createRoom(opts) {
    const {
      hostId,
      hostName,
      topic = 'General Discussion',
      maxParticipants = 50,
      roomType = 'video'
    } = opts;

    // Cap at topology limits
    const effectiveMax = roomType === 'webinar'
      ? Math.min(maxParticipants, CommunityAgent.WEBINAR_MAX)
      : Math.min(maxParticipants, CommunityAgent.RELAY_MAX);

    const roomId = `meet_${crypto.randomUUID().split('-')[0]}`;
    const topology = this._getTopology(1, roomType);

    const room = {
      roomId,
      hostId,
      hostName,
      topic,
      roomType,
      maxParticipants: effectiveMax,
      topology, // 'p2p' | 'relay' | 'webinar'
      participants: [{
        userId: hostId,
        name: hostName,
        joinedAt: new Date().toISOString(),
        role: 'host',        // host | presenter | participant
        isAudioMuted: false,
        isVideoOff: false,
        handRaised: false
      }],
      createdAt: new Date().toISOString(),
      status: 'active',
      chatMessages: [],
      qualityPreset: this._getQualityPreset(1)
    };

    this.videoRooms.set(roomId, room);

    const meetingLink = `/community/meet/${roomId}`;

    console.log(`[CommunityAgent] 📹 Room created: ${roomId} — "${topic}" [${roomType}/${topology}] by ${hostName} (max: ${effectiveMax})`);

    return {
      roomId,
      meetingLink,
      topic,
      host: hostName,
      maxParticipants: effectiveMax,
      roomType,
      topology,
      quality: room.qualityPreset
    };
  }

  /**
   * Join an existing video room (with dynamic topology switching)
   */
  joinRoom(roomId, userId, userName) {
    const room = this.videoRooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.status !== 'active') return { success: false, error: 'Room is closed' };
    if (room.participants.length >= room.maxParticipants) return { success: false, error: `Room is full (max ${room.maxParticipants})` };

    // Check if already in room
    if (!room.participants.find(p => p.userId === userId)) {
      const role = room.roomType === 'webinar' ? 'participant' : 'presenter';
      room.participants.push({
        userId,
        name: userName,
        joinedAt: new Date().toISOString(),
        role,
        isAudioMuted: room.roomType === 'webinar', // Auto-mute in webinar
        isVideoOff: room.roomType === 'webinar',   // Auto video-off in webinar
        handRaised: false
      });
    }

    const count = room.participants.length;

    // Dynamic topology switch check
    const oldTopology = room.topology;
    room.topology = this._getTopology(count, room.roomType);
    room.qualityPreset = this._getQualityPreset(count);

    const topologyChanged = oldTopology !== room.topology;

    // Notify other participants via Socket.IO
    if (this.io) {
      this.io.to(`meet_${roomId}`).emit('participant_joined', {
        userId,
        name: userName,
        totalParticipants: count,
        topology: room.topology,
        quality: room.qualityPreset
      });

      // If topology changed (e.g. 6→7 users: P2P→Relay), notify ALL to switch
      if (topologyChanged) {
        console.log(`[CommunityAgent] 🔄 Topology switch: ${oldTopology} → ${room.topology} (${count} users)`);
        this.io.to(`meet_${roomId}`).emit('topology_changed', {
          from: oldTopology,
          to: room.topology,
          quality: room.qualityPreset,
          reason: `${count} participants — switched to ${room.topology} mode`
        });
      }
    }

    console.log(`[CommunityAgent] 📹 ${userName} joined room ${roomId} [${room.topology}] (${count}/${room.maxParticipants})`);

    return {
      success: true,
      room: {
        roomId: room.roomId,
        topic: room.topic,
        host: room.hostName,
        roomType: room.roomType,
        topology: room.topology,
        quality: room.qualityPreset,
        participants: room.participants.map(p => ({
          name: p.name,
          role: p.role,
          joinedAt: p.joinedAt,
          isAudioMuted: p.isAudioMuted,
          isVideoOff: p.isVideoOff,
          handRaised: p.handRaised
        }))
      }
    };
  }

  /**
   * Leave a video room
   */
  leaveRoom(roomId, userId) {
    const room = this.videoRooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(p => p.userId !== userId);

    if (this.io) {
      this.io.to(`meet_${roomId}`).emit('participant_left', {
        userId, totalParticipants: room.participants.length
      });
    }

    // Close room if empty
    if (room.participants.length === 0) {
      room.status = 'closed';
      this.videoRooms.delete(roomId);
      console.log(`[CommunityAgent] 📹 Room ${roomId} closed (empty)`);
    }
  }

  /**
   * Get active rooms
   */
  getActiveRooms() {
    const rooms = [];
    for (const [id, room] of this.videoRooms) {
      if (room.status === 'active') {
        rooms.push({
          roomId: id,
          topic: room.topic,
          host: room.hostName,
          participants: room.participants.length,
          maxParticipants: room.maxParticipants,
          createdAt: room.createdAt
        });
      }
    }
    return rooms;
  }

  /**
   * Setup WebRTC signaling via Socket.IO
   */
  _setupSignaling() {
    this.io.on('connection', (socket) => {
      // Join meeting room
      socket.on('join_meeting', (data) => {
        const { roomId, userId, userName } = data;
        socket.join(`meet_${roomId}`);
        this.joinRoom(roomId, userId, userName);

        // Notify others to initiate peer connections
        socket.to(`meet_${roomId}`).emit('new_peer', { userId, userName, socketId: socket.id });
      });

      // WebRTC signaling: offer
      socket.on('webrtc_offer', (data) => {
        socket.to(data.targetSocketId).emit('webrtc_offer', {
          offer: data.offer,
          fromSocketId: socket.id,
          fromUserId: data.userId
        });
      });

      // WebRTC signaling: answer
      socket.on('webrtc_answer', (data) => {
        socket.to(data.targetSocketId).emit('webrtc_answer', {
          answer: data.answer,
          fromSocketId: socket.id
        });
      });

      // WebRTC signaling: ICE candidate
      socket.on('webrtc_ice_candidate', (data) => {
        socket.to(data.targetSocketId).emit('webrtc_ice_candidate', {
          candidate: data.candidate,
          fromSocketId: socket.id
        });
      });

      // In-call chat
      socket.on('meeting_chat', (data) => {
        const { roomId, message, userName } = data;
        const room = this.videoRooms.get(roomId);
        if (room) {
          const chatMsg = { userName, message, timestamp: new Date().toISOString() };
          room.chatMessages.push(chatMsg);
          this.io.to(`meet_${roomId}`).emit('meeting_chat', chatMsg);
        }
      });

      // Screen share toggle
      socket.on('screen_share_start', (data) => {
        socket.to(`meet_${data.roomId}`).emit('screen_share_start', { userId: data.userId, socketId: socket.id });
      });

      socket.on('screen_share_stop', (data) => {
        socket.to(`meet_${data.roomId}`).emit('screen_share_stop', { userId: data.userId });
      });

      // Leave meeting
      socket.on('leave_meeting', (data) => {
        const { roomId, userId } = data;
        socket.leave(`meet_${roomId}`);
        this.leaveRoom(roomId, userId);
      });

      // Disconnect cleanup
      socket.on('disconnect', () => {
        // Clean up from all rooms
        for (const [roomId, room] of this.videoRooms) {
          const participant = room.participants.find(p => p.socketId === socket.id);
          if (participant) {
            this.leaveRoom(roomId, participant.userId);
          }
        }
      });
    });

    console.log('[CommunityAgent] 📹 WebRTC signaling ready via Socket.IO');
  }

  // ═══════════════════════════════════════════════
  //  PROBLEM SHARING FORUM (Q&A)
  // ═══════════════════════════════════════════════

  /**
   * Create a new community post (question/problem)
   * Enhanced: Harshita AI auto-diagnoses and suggests solutions
   */
  async createPost(opts) {
    const { userId, userName, title, description, category = 'other', tags = [] } = opts;

    const post = {
      id: crypto.randomUUID(),
      userId,
      userName,
      title,
      description,
      category,
      tags,
      upvotes: 0,
      downvotes: 0,
      answers: [],
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      harshitaIntervened: false
    };

    // AI: Try to find similar past problems and suggest solutions
    const aiSuggestion = await this._findSimilarSolutions(title + ' ' + description);

    // NEW: Harshita AI auto-diagnosis via RemoteAssistAgent
    let harshitaDiagnosis = null;
    try {
      const { RemoteAssistAgent } = require('./remoteAssistAgent');
      const remoteAssist = new RemoteAssistAgent({ io: this.io });
      harshitaDiagnosis = await remoteAssist.diagnoseProblem(
        `${title}. ${description}`, category
      );

      // If Harshita has a confident solution, auto-post as answer
      if (harshitaDiagnosis && harshitaDiagnosis.confidence >= 0.7) {
        const harshitaAnswer = {
          id: crypto.randomUUID(),
          userId: 'harshita_ai',
          userName: '🤖 Harshita AI',
          content: `**AI Diagnosis:** ${harshitaDiagnosis.diagnosis}\n\n**Steps to fix:**\n${harshitaDiagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${harshitaDiagnosis.canRemoteFix ? '💡 _अगर आप चाहें तो मैं Remote Control लेकर खुद fix कर सकती हूँ। "Harshita Fix" बटन दबाएं।_' : ''}\n\n_Confidence: ${Math.round(harshitaDiagnosis.confidence * 100)}% | Source: ${harshitaDiagnosis.source}_`,
          upvotes: 0,
          isAccepted: false,
          isAiGenerated: true,
          canRemoteFix: harshitaDiagnosis.canRemoteFix,
          remoteFixActions: harshitaDiagnosis.remoteFixActions || [],
          createdAt: new Date().toISOString()
        };
        post.answers.push(harshitaAnswer);
        post.harshitaIntervened = true;
      }
    } catch (e) {
      // RemoteAssistAgent not available — continue without
    }

    const data = await this._loadPosts();
    data.posts.push(post);
    await this._savePosts(data);

    // Notify community via WebSocket
    if (this.io) {
      this.io.emit('community_new_post', {
        postId: post.id, title, userName, category,
        hasAiAnswer: post.harshitaIntervened,
        timestamp: post.createdAt
      });
    }

    // Auto-intervention timer: If no human answers in 30 min and AI didn't answer,
    // Harshita will try again with more context
    if (!post.harshitaIntervened) {
      setTimeout(async () => {
        await this._harshitaAutoIntervene(post.id);
      }, 30 * 60 * 1000);
    }

    console.log(`[CommunityAgent] 📝 New post by ${userName}: "${title}" ${post.harshitaIntervened ? '(🤖 AI answered)' : ''}`);

    return {
      success: true,
      post,
      aiSuggestion: aiSuggestion || null,
      harshitaDiagnosis: harshitaDiagnosis || null
    };
  }

  /**
   * Harshita auto-intervenes if no human has answered after 30 minutes
   */
  async _harshitaAutoIntervene(postId) {
    try {
      const data = await this._loadPosts();
      const post = data.posts.find(p => p.id === postId);
      if (!post || post.status !== 'open') return;

      // Check if anyone answered (excluding AI)
      const humanAnswers = post.answers.filter(a => a.userId !== 'harshita_ai');
      if (humanAnswers.length > 0) return; // Humans responded, no need

      console.log(`[CommunityAgent] 🤖 Auto-intervening on unanswered post: "${post.title}"`);

      const { RemoteAssistAgent } = require('./remoteAssistAgent');
      const remoteAssist = new RemoteAssistAgent({ io: this.io });
      const diagnosis = await remoteAssist.diagnoseProblem(
        `${post.title}. ${post.description}`, post.category
      );

      if (diagnosis && diagnosis.steps.length > 0) {
        await this.addAnswer(postId, {
          userId: 'harshita_ai',
          userName: '🤖 Harshita AI (Auto-Help)',
          content: `कोई जवाब नहीं आया, तो मैं कोशिश करती हूँ:\n\n**${diagnosis.diagnosis}**\n\n${diagnosis.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n${diagnosis.canRemoteFix ? '🔧 _मैं Remote Control लेकर fix भी कर सकती हूँ — बस "Harshita Fix" दबाएं!_' : ''}`
        });

        post.harshitaIntervened = true;
        await this._savePosts(data);
      }
    } catch (e) {
      console.warn('[CommunityAgent] Auto-intervene error:', e.message);
    }
  }

  /**
   * Add an answer to a post
   */
  async addAnswer(postId, opts) {
    const { userId, userName, content } = opts;

    const data = await this._loadPosts();
    const post = data.posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Post not found' };

    const answer = {
      id: crypto.randomUUID(),
      userId,
      userName,
      content,
      upvotes: 0,
      isAccepted: false,
      createdAt: new Date().toISOString()
    };

    post.answers.push(answer);
    post.updatedAt = new Date().toISOString();
    await this._savePosts(data);

    // Notify post author
    if (this.io) {
      this.io.to(`user_${post.userId}`).emit('community_new_answer', {
        postId, postTitle: post.title, answerBy: userName
      });
    }

    return { success: true, answer };
  }

  /**
   * Vote on a post or answer
   */
  async vote(postId, answerId = null, direction = 'up') {
    const data = await this._loadPosts();
    const post = data.posts.find(p => p.id === postId);
    if (!post) return { success: false };

    const target = answerId ? post.answers.find(a => a.id === answerId) : post;
    if (!target) return { success: false };

    if (direction === 'up') target.upvotes++;
    else target.downvotes = (target.downvotes || 0) + 1;

    await this._savePosts(data);
    return { success: true, upvotes: target.upvotes, downvotes: target.downvotes || 0 };
  }

  /**
   * Get posts (with filters)
   */
  async getPosts(filters = {}) {
    const data = await this._loadPosts();
    let posts = data.posts;

    if (filters.category) posts = posts.filter(p => p.category === filters.category);
    if (filters.status) posts = posts.filter(p => p.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      posts = posts.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    // Sort by recent first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    return {
      posts: posts.slice(offset, offset + limit),
      total: posts.length,
      categories: data.categories
    };
  }

  /**
   * AI-powered: Find similar past problems and their solutions
   */
  async _findSimilarSolutions(query) {
    try {
      const data = await this._loadPosts();
      const resolvedPosts = data.posts.filter(p =>
        p.status === 'resolved' && p.answers.some(a => a.isAccepted)
      ).slice(-50); // Last 50 resolved posts

      if (resolvedPosts.length === 0) return null;

      const client = aiProviderManager.getClient(this.name);
      const model = aiProviderManager.getModel(this.name);
      if (!client) return null;

      const pastProblems = resolvedPosts.map(p => ({
        title: p.title,
        solution: p.answers.find(a => a.isAccepted)?.content || p.answers[0]?.content
      })).slice(-20);

      const prompt = `A CSC/Cyber Café operator has this problem:
"${query}"

Here are previously solved similar problems:
${JSON.stringify(pastProblems, null, 2)}

If any past solution is relevant, return a brief suggestion in Hindi.
If nothing matches, return null.

Return JSON: { "found": true/false, "suggestion": "..." }`;

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      });

      const result = JSON.parse(response.choices[0].message.content.trim().replace(/^```[\w]*\s*/, '').replace(/\s*```$/, ''));
      return result.found ? result.suggestion : null;
    } catch (e) {
      return null;
    }
  }

  // File I/O
  async _loadPosts() {
    try {
      const raw = await fs.readFile(this.postsFile, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { posts: [], categories: ['website', 'hardware', 'software', 'government_portal', 'business', 'other'] };
    }
  }

  async _savePosts(data) {
    await fs.writeFile(this.postsFile, JSON.stringify(data, null, 2));
  }

  /**
   * Get community stats
   */
  async getStats() {
    const data = await this._loadPosts();
    return {
      totalPosts: data.posts.length,
      openPosts: data.posts.filter(p => p.status === 'open').length,
      resolvedPosts: data.posts.filter(p => p.status === 'resolved').length,
      totalAnswers: data.posts.reduce((sum, p) => sum + p.answers.length, 0),
      activeVideoRooms: this.getActiveRooms().length,
      categories: data.categories
    };
  }
}

module.exports = { CommunityAgent };
