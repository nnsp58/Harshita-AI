// src/api/routes/jobs.js - Job Management Routes

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const jobController = require('../controllers/jobController');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/',
  authenticate,
  [
    body('candidate_id').isUUID(),
    body('service_type').isIn([
      'ssc',
      'army',
      'railway',
      'banking',
      'police',
      'defence',
      'postal',
      'apprenticeship',
      'stateSsc',
      'aadhaar_update',
      'pan_card',
      'passport',
      'ration_card',
      'land_record',
      'Scholarship',
      'pension',
      'driving_license',
      'voter_id',
      'birth_certificate',
      'income_certificate',
      'caste_certificate',
      'other'
    ]),
    body('form_url').optional().isURL(),
    body('priority').optional().isInt({ min: 0, max: 10 })
  ],
  validate,
  jobController.createJob
);

router.get(
  '/stats/overview',
  authenticate,
  jobController.getJobStats
);

router.get(
  '/',
  authenticate,
  jobController.listJobs
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  jobController.getJob
);

router.post(
  '/:id/start',
  authenticate,
  [param('id').isUUID()],
  validate,
  jobController.startJob
);

router.post(
  '/:id/retry',
  authenticate,
  [param('id').isUUID()],
  validate,
  jobController.retryJob
);

router.post(
  '/:id/cancel',
  authenticate,
  [param('id').isUUID()],
  validate,
  jobController.cancelJob
);

router.delete(
  '/:id',
  authenticate,
  authorize('csc_admin', 'superadmin'),
  [param('id').isUUID()],
  validate,
  jobController.deleteJob
);

// Apply jobs for multiple candidates
router.post(
  '/apply',
  authenticate,
  [
    body('candidateIds').isArray({ min: 1 }),
    body('candidateIds.*').isUUID(),
    body('jobType').isIn(['ssc', 'army', 'railway', 'banking', 'police', 'defence', 'postal', 'apprenticeship', 'stateSsc']),
    body('numApplications').isInt({ min: 1, max: 10 })
  ],
  validate,
  jobController.applyJobsForCandidates
);

module.exports = router;
