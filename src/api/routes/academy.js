// src/api/routes/academy.js - AI Academy & Course Creator Routes
const express = require('express');
const router = express.Router();
const academyController = require('../controllers/academyController');
const { authenticate } = require('../middleware/auth');

router.post('/generate', authenticate, academyController.createCourse);
router.get('/list', authenticate, academyController.listCourses);

module.exports = router;
