// src/api/server.js - Express Application Setup

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { setupSocketHandlers } = require('./middleware/socket');
const { ControllerAgent } = require('../agents/controllerAgent');
const { NetworkMonitorAgent } = require('../agents/networkMonitorAgent');
const { WhatsAppAgent } = require('../agents/whatsAppAgent');
const { prisma } = require('../models/database');
const path = require('path');
const quietStartup = process.env.QUIET_STARTUP === '1';

const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Make io accessible in requests
app.set('io', io);

// Initialize ControllerAgent singleton with Socket.IO
const controllerAgent = new ControllerAgent(io);
app.set('controllerAgent', controllerAgent);

// Initialize NetworkMonitorAgent (PRD: network-aware pause/resume)
const networkMonitor = new NetworkMonitorAgent(io);
networkMonitor.start();
app.set('networkMonitor', networkMonitor);

// Initialize WhatsAppAgent (PRD: Chat Agent) — lazy start, connects via QR on demand
// Cost: ₹0 — uses whatsapp-web.js (no Meta API needed)
let whatsappAgent = null;
try {
  whatsappAgent = new WhatsAppAgent(io);
  app.set('whatsappAgent', whatsappAgent);
  console.log('📱 WhatsApp Agent initialized (not started — use /api/whatsapp/start to connect)');
} catch (err) {
  console.warn('⚠️ WhatsApp Agent unavailable:', err.message);
}

// PRD 3: Initialize ProactiveAgent — Hermes-style proactive suggestions
// Sends alerts for: expiring documents, matching jobs, incomplete applications
const { ProactiveAgent } = require('../core/proactiveAgent');
try {
  const proactiveAgent = new ProactiveAgent({
    io,
    whatsAppAgent: whatsappAgent,
    checkIntervalMs: parseInt(process.env.PROACTIVE_CHECK_INTERVAL_MS) || 6 * 60 * 60 * 1000 // Default 6 hours
  });
  proactiveAgent.start();
  app.set('proactiveAgent', proactiveAgent);
  console.log('🧠 ProactiveAgent started — will scan for alerts every 6 hours');
} catch (err) {
  console.warn('⚠️ ProactiveAgent unavailable:', err.message);
}

// Initialize NotificationHub — Multi-channel push notifications
const { NotificationHub } = require('../core/notificationHub');
try {
  const notificationHub = new NotificationHub({
    io,
    whatsAppAgent: whatsappAgent
  });
  app.set('notificationHub', notificationHub);
  // Process queued notifications every 30 minutes
  setInterval(() => notificationHub.processQueue().catch(() => {}), 30 * 60 * 1000);
  console.log('📢 NotificationHub ready — WhatsApp + Email + Push');
} catch (err) {
  console.warn('⚠️ NotificationHub unavailable:', err.message);
}

// Initialize CommunityAgent — Video Conference + Operator Forum
const { CommunityAgent } = require('../core/communityAgent');
try {
  const communityAgent = new CommunityAgent({ io });
  app.set('communityAgent', communityAgent);
  console.log('👥 CommunityAgent ready — Video Conference + Forum');
} catch (err) {
  console.warn('⚠️ CommunityAgent unavailable:', err.message);
}

// Initialize RemoteAssistAgent — AI IT Support + Remote Control
const { RemoteAssistAgent } = require('../core/remoteAssistAgent');
try {
  const remoteAssistAgent = new RemoteAssistAgent({ io });
  app.set('remoteAssistAgent', remoteAssistAgent);
  console.log('🤖 RemoteAssistAgent ready — AI IT Support + Remote Control');
} catch (err) {
  console.warn('⚠️ RemoteAssistAgent unavailable:', err.message);
}

// Initialize EmailService — Custom domain email (username@n-dizi.in)
const { EmailService } = require('../core/emailService');
try {
  const emailService = new EmailService({ domain: process.env.EMAIL_DOMAIN || 'n-dizi.in' });
  app.set('emailService', emailService);
  console.log(`📧 EmailService ready — username@${emailService.domain}`);
} catch (err) {
  console.warn('⚠️ EmailService unavailable:', err.message);
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request correlation ID
app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  next();
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    network: networkMonitor.getStatus()
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  const controllerAgent = req.app.get('controllerAgent');
  let stats = {
    totalTransactions: Math.floor(Math.random() * 2000) + 1000,
    activeOperators: 12,
    centerRevenue: Math.floor(Math.random() * 50000) + 40000
  };
  if (controllerAgent) {
    const queueStats = await controllerAgent.getQueueStats();
    stats.queue = queueStats;
  }
  res.json(stats);
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.IO handlers
setupSocketHandlers(io);

// Create demo user for testing
const bcrypt = require('bcrypt');
const { inMemoryUsers } = require('./controllers/authController');

async function createDemoUser() {
  const demoEmail = 'demo@csc.com';
  if (!inMemoryUsers.get(demoEmail)) {
    const passwordHash = await bcrypt.hash('demo1234', 12);
    inMemoryUsers.set(demoEmail, {
      id: '1',
      email: demoEmail,
      password_hash: passwordHash,
      name: 'Demo User',
      role: 'csc_admin',
      is_active: true,
      csc_id: 'demo-csc',
      created_at: new Date()
    });
    console.log('📝 Demo user created: demo@csc.com / demo1234');
  }
}
createDemoUser();

// Start server
const PORT = process.env.PORT || 3000;

// Ensure database connection before starting
const ensureDatabaseConnection = async () => {
  if (prisma) {
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (e) {
      console.error('❌ Database connection failed:', e.message);
      process.exit(1);
    }
  }
};

ensureDatabaseConnection().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 CSC API Server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = { app, server, io };
