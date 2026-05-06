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
try {
  const whatsappAgent = new WhatsAppAgent(io);
  app.set('whatsappAgent', whatsappAgent);
  console.log('📱 WhatsApp Agent initialized (not started — use /api/whatsapp/start to connect)');
} catch (err) {
  console.warn('⚠️ WhatsApp Agent unavailable:', err.message);
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
