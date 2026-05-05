// src/api/routes/downloads.js - File Download Routes

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const downloadController = require('../controllers/downloadController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.get(
  '/job/:job_id',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  downloadController.downloadJobFiles
);

router.get(
  '/candidate/:candidate_id',
  authenticate,
  [param('candidate_id').isUUID()],
  validate,
  downloadController.downloadCandidateFiles
);

router.get(
  '/document/:document_id',
  authenticate,
  [param('document_id').isUUID()],
  validate,
  downloadController.downloadDocument
);

router.get(
  '/processed/:job_id',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  downloadController.downloadProcessedForm
);

router.get(
  '/output/:job_id',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  downloadController.downloadJobOutputs
);

module.exports = router;