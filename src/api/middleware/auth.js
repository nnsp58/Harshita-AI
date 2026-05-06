// src/api/middleware/auth.js - JWT Authentication Middleware

const jwt = require('jsonwebtoken');
const { prisma } = require('../../models/database');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable required');
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('🔓 Token verified for userId:', decoded.userId);
    } catch (e) {
      console.error('❌ Token verification failed:', e.message);
      throw e;
    }
    
    // Try database first
    let user = null;
    try {
      if (prisma) {
        user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, name: true, role: true, is_active: true, csc_id: true }
        });
      }
    } catch (dbError) {
      console.warn('⚠️ DB lookup error in auth:', dbError.message);
    }
    
    // Fallback to demo user for SaaS trials/testing
    if (!user) {
      const { getInMemoryUsers } = require('../controllers/authController');
      const inMemoryUsers = getInMemoryUsers();
      console.log('🔍 Checking in-memory users for ID:', decoded.userId);

      // Check ID '1' specifically
      if (decoded.userId === '1') {
        user = { id: '1', email: 'demo@csc.com', name: 'Demo User', role: 'csc_admin', is_active: true, csc_id: 'demo-csc' };
      } else {
        // Search in map
        for (const [email, memUser] of inMemoryUsers) {
          if (memUser.id === decoded.userId) {
            user = memUser;
            break;
          }
        }
      }
    }

    if (!user || !user.is_active) {
      console.error('❌ Authentication failed: User not found or inactive', { userId: decoded.userId });
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive user'
      });
    }

    console.log('✅ Auth successful for:', user.email);
    req.user = user;
    req.user.cscId = user.csc_id;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('🚫 Auth Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  authenticate,
  authorize,
  generateToken,
  generateRefreshToken,
  JWT_SECRET
};
