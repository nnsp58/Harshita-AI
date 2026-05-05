// src/api/routes/stats.js
const express = require('express');
const router = express.Router();
const { getOverviewStats } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/overview', authenticate, getOverviewStats);

module.exports = router;
