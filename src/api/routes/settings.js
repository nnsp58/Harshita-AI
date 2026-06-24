// src/api/routes/settings.js - Secure API Key Settings Routing
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

router.get('/api-keys', authenticate, settingsController.getApiKeysStatus);
router.post('/api-keys', authenticate, settingsController.saveApiKeys);

module.exports = router;
