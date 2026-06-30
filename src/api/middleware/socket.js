// src/api/middleware/socket.js - Socket.IO Real-time Updates

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    connectedUsers.set(socket.userId, socket.id);
    socket.join(`user_${socket.userId}`);

    socket.on('subscribe_job', async (jobId) => {
      // Verify job ownership before allowing subscription
      try {
        const { prisma } = require('../../models/database');
        if (prisma) {
          const job = await prisma.job.findFirst({
            where: { id: jobId, user_id: socket.userId }
          });
          if (job) {
            socket.join(`job_${jobId}`);
            console.log(`User ${socket.userId} subscribed to job ${jobId}`);
          } else {
            socket.emit('error', { message: 'Access denied to job' });
          }
        } else {
          // Fallback for in-memory mode
          socket.join(`job_${jobId}`);
          console.log(`User ${socket.userId} subscribed to job ${jobId} (fallback)`);
        }
      } catch (error) {
        console.error('Job subscription error:', error.message);
        socket.emit('error', { message: 'Failed to verify job access' });
      }
    });

    socket.on('unsubscribe_job', (jobId) => {
      socket.leave(`job_${jobId}`);
    });

    // Dashboard chat handlers — use shared MasterAgent singleton from app
    socket.on('userCommand', async (cmd) => {
      console.log(`[Socket] User command from ${socket.userId}: ${cmd}`);
      socket.emit('logUpdate', { type: 'user', message: cmd });

      try {
        // Get shared singleton MasterAgent (registered in server.js)
        const masterAgent = io._masterAgent || (() => {
          // Lazy fallback if not registered yet
          const { MasterAgent } = require('../../agents/masterAgent');
          if (!io._masterAgent) io._masterAgent = new MasterAgent(io);
          return io._masterAgent;
        })();

        // Wait for skill registry to be ready
        if (masterAgent.registry && !masterAgent.registry.isLoaded) {
          await new Promise(r => setTimeout(r, 1500));
        }

        const startTime = Date.now();
        
        // HASA: Search local RAG knowledge repository first to reduce API dependency
        const { localKnowledgeRag } = require('../../utils/LocalKnowledgeRag');
        const ragMatch = localKnowledgeRag.search(cmd);
        let response;
        
        if (process.env.FORCE_OFFLINE === 'true') {
          const lowerCmd = cmd.toLowerCase();
          const docType = lowerCmd.includes('notice') ? 'legal_notice' :
                          lowerCmd.includes('affidavit') || lowerCmd.includes('shapath') ? 'affidavit' :
                          lowerCmd.includes('agreement') || lowerCmd.includes('rent') ? 'rent_agreement' :
                          lowerCmd.includes('deed') || lowerCmd.includes('gift') ? 'gift_deed' :
                          lowerCmd.includes('noc') ? 'noc' :
                          lowerCmd.includes('complaint') || lowerCmd.includes('fir') ? 'complaint' : null;
                          
          if (docType) {
            const { templateEngine } = require('../../utils/TemplateEngine');
            const documentContent = templateEngine.generate(docType, { name: 'Advocate Ramesh', purpose: 'General Purpose' });
            response = {
              type: 'ai',
              message: `[रूटिंग सफल] ${documentContent}`,
              skill: `${docType}_generator`
            };
          }
        }
        
        if (!response) {
          if (ragMatch) {
            response = {
              type: 'ai',
              message: `[रूटिंग सफल] ${ragMatch}`,
              skill: 'local_rag'
            };
          } else {
            response = await masterAgent.processCommand(socket.userId, cmd, { userId: socket.userId, app: io._app });
          }
        }
        
        const responseTime = Date.now() - startTime;

        const skillName = response.skill || 'general_chat';
        let agentName = 'Research Agent';
        if (skillName.includes('notice') || skillName.includes('affidavit') || skillName.includes('agreement') || skillName.includes('deed') || skillName.includes('will') || skillName.includes('noc') || skillName.includes('legal') || skillName.includes('security') || skillName.includes('court') || skillName.includes('document')) {
          agentName = 'Legal Agent';
        } else if (skillName.includes('seo') || skillName.includes('blog') || skillName.includes('article') || skillName.includes('marketing')) {
          agentName = 'SEO Agent';
        } else if (skillName.includes('video') || skillName.includes('story') || skillName.includes('youtube')) {
          agentName = 'Video Agent';
        } else if (skillName.includes('website') || skillName.includes('portfolio') || skillName.includes('html') || skillName.includes('landing')) {
          agentName = 'Website Builder Agent';
        }

        // Save skill usage in DB
        try {
          const { prisma: dbClient } = require('../../models/database');
          if (dbClient) {
            await dbClient.skillUsage.create({
              data: {
                user_id: socket.userId,
                skill_name: skillName,
                agent_name: agentName,
                request_time: new Date(startTime),
                response_time: responseTime,
                success: !response.message.toLowerCase().includes('error') && !response.message.toLowerCase().includes('असमर्थ'),
                error_message: response.message.toLowerCase().includes('error') ? response.message.substring(0, 255) : null
              }
            });
          }
        } catch (dbErr) {
          console.error('[Socket DB Logging Error]:', dbErr.message);
        }

        // Emit AI reply to chat — include action data for navigation/UI actions
        socket.emit('logUpdate', {
          type: 'ai',
          message: response.message || response.text || 'Done!',
          skill: response.skill,
          data: response.data,
          action: response.action || response.data || null,
          interactionId: response.interactionId || null,
        });

      } catch (error) {
        console.error('[Socket] Command error:', error.message);
        
        // Log failure to DB
        try {
          const { prisma: dbClient } = require('../../models/database');
          if (dbClient) {
            await dbClient.skillUsage.create({
              data: {
                user_id: socket.userId,
                skill_name: 'unknown_command_error',
                agent_name: 'Research Agent',
                request_time: new Date(),
                response_time: 0,
                success: false,
                error_message: error.message.substring(0, 255)
              }
            });
          }
        } catch (dbErr) {}

        socket.emit('logUpdate', {
          type: 'ai',
          message: `⚠️ Error: ${error.message}. Try rephrasing.`,
        });
      }
    });

    socket.on('submitFeedback', async (data) => {
      try {
        const { interactionId, rating, comment } = data;
        console.log(`[Socket] Feedback received from user ${socket.userId} for interaction ${interactionId}: ${rating}`);
        const { learningEngine } = require('../../core/learningEngine');
        learningEngine.recordFeedback(interactionId, rating, comment || '');
        
        // If negative rating, trigger self-healing immediately
        if (rating === 'negative' || rating === 1 || rating === 'down') {
          const { SelfEvolutionAgent } = require('../../core/selfEvolutionAgent');
          const evolutionAgent = new SelfEvolutionAgent();
          evolutionAgent.analyzeAndEvolve().catch(err => {
            console.error('[SelfEvolution] Failed on negative feedback:', err.message);
          });
        }
      } catch (err) {
        console.error('[Socket] submitFeedback error:', err.message);
      }
    });

    socket.on('fileUpload', (data) => {
      console.log(`File upload from ${socket.userId}: ${data.name}`);
      socket.emit('logUpdate', { type: 'ai', message: `File "${data.name}" uploaded and processed.` });
    });

    socket.on('whatsapp_send_document', async (data) => {
      try {
        const { whatsappSuperEngine } = require('../../core/WhatsAppSuperEngine');
        const { recipient, base64Data, mimeType, filename } = data;
        
        console.log(`[Socket] WhatsApp Send Document request from ${socket.userId} to ${recipient}`);
        
        await whatsappSuperEngine.dispatchMessage(socket.userId, recipient, 'Here is the generated document.', base64Data, mimeType, filename);
        
        socket.emit('notification', { message: 'Document shared to WhatsApp successfully.' });
      } catch (err) {
        console.error('[Socket] whatsapp_send_document error:', err.message);
        socket.emit('notification', { message: `WhatsApp Error: ${err.message}` });
      }
    });

    socket.on('adminBroadcast', (msg) => {
      console.log(`Admin broadcast: ${msg}`);
      io.emit('broadcastReceived', msg);
    });

    socket.on('teamMessage', (msg) => {
      console.log(`Team message from ${socket.userId}: ${msg}`);
      // Broadcast to all connected users (simulate team chat)
      io.emit('teamUpdate', { userId: socket.userId, message: msg });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
    });
  });
};

const emitJobUpdate = (io, jobId, status, data) => {
  io.to(`job_${jobId}`).emit('job_update', {
    job_id: jobId,
    status,
    data,
    timestamp: new Date().toISOString()
  });
};

const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString()
  });
};

const emitProgress = (io, jobId, progress) => {
  io.to(`job_${jobId}`).emit('job_progress', {
    job_id: jobId,
    progress,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  setupSocketHandlers,
  emitJobUpdate,
  emitNotification,
  emitProgress,
  connectedUsers
};