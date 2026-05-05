// src/api/routes/index.js - Main Router Configuration

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const candidateRoutes = require('./candidates');
const jobRoutes = require('./jobs');
const documentRoutes = require('./documents');
const reviewRoutes = require('./reviews');
const downloadRoutes = require('./downloads');
const agentRoutes = require('./agents');
const whatsappRoutes = require('./whatsapp');
const bulkRoutes = require('./bulk');
const statsRoutes = require('./stats');
const cscRoutes = require('./csc');

router.use('/auth', authRoutes);
router.use('/candidate', candidateRoutes);
router.use('/job', jobRoutes);
router.use('/document', documentRoutes);
router.use('/review', reviewRoutes);
router.use('/download', downloadRoutes);
router.use('/agents', agentRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/bulk', bulkRoutes);
router.use('/stats', statsRoutes);
router.use('/csc', cscRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'CSC Automation API',
    version: '1.0.0',
    description: 'REST API for CSC Automation System',
    endpoints: {
      auth: '/api/auth',
      candidates: '/api/candidate',
      jobs: '/api/job',
      documents: '/api/document',
      reviews: '/api/review',
      downloads: '/api/download'
    }
  });
});

module.exports = router;