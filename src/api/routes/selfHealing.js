// src/api/routes/selfHealing.js - Route mappings for Self-Healing diagnostic audits

const express = require('express');
const router = express.Router();
const selfHealingController = require('../controllers/selfHealingController');
const { authenticate } = require('../middleware/auth');

router.get('/audit', authenticate, selfHealingController.getAudit);

module.exports = router;
