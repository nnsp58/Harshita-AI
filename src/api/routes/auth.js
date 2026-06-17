// src/api/routes/auth.js - Authentication Routes

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty(),
    body('role').optional().isIn(['operator', 'csc_admin', 'superadmin'])
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  authController.login
);

router.post(
  '/google',
  [body('token').notEmpty()],
  validate,
  authController.googleLogin
);

router.post(
  '/refresh',
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 })
  ],
  validate,
  authController.resetPassword
);

router.get(
  '/chat/history',
  authenticate,
  (req, res) => {
    try {
      const { conversationMemory } = require('../../core/conversationMemory');
      const userId = req.userId || req.user?.id || 'demo';
      
      const sessions = Object.keys(conversationMemory.memory)
        .filter(key => key.startsWith(`${userId}:`));

      let allMessages = [];
      for (const key of sessions) {
        const skill = key.split(':')[1];
        const session = conversationMemory.memory[key];
        const messages = session.messages || [];
        
        allMessages.push(...messages.map((m, idx) => ({
          id: `${key}_${idx}_${m.timestamp}`,
          type: m.role === 'assistant' ? 'ai' : m.role,
          message: m.content,
          timestamp: m.timestamp,
          skill: skill,
          success: m.success
        })));
      }

      allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      res.json({
        success: true,
        data: allMessages
      });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

module.exports = router;
