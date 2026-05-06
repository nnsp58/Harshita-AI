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