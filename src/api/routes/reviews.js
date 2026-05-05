// src/api/routes/reviews.js - Review & OTP/CAPTCHA Routes

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

router.post(
  '/otp/request',
  authenticate,
  [
    body('job_id').isUUID(),
    body('phone_number').matches(/^\d{10}$/)
  ],
  validate,
  reviewController.requestOtp
);

router.post(
  '/otp/verify',
  authenticate,
  [
    body('job_id').isUUID(),
    body('otp').matches(/^\d{6}$/)
  ],
  validate,
  reviewController.verifyOtp
);

router.post(
  '/captcha/solve',
  authenticate,
  [
    body('job_id').isUUID(),
    body('captcha_image').isBase64()
  ],
  validate,
  reviewController.solveCaptcha
);

router.post(
  '/manual',
  authenticate,
  [
    body('job_id').isUUID(),
    body('field_name').notEmpty(),
    body('field_value').notEmpty()
  ],
  validate,
  reviewController.submitManualInput
);

router.post(
  '/:job_id/approve',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  reviewController.approveJob
);

router.post(
  '/:job_id/reject',
  authenticate,
  [
    param('job_id').isUUID(),
    body('reason').notEmpty()
  ],
  validate,
  reviewController.rejectJob
);

router.get(
  '/:job_id/pending',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  reviewController.getPendingItems
);

router.get(
  '/active',
  authenticate,
  reviewController.getActiveJobs
);

router.post(
  '/:job_id/pause',
  authenticate,
  [param('job_id').isUUID()],
  validate,
  reviewController.pauseJob
);

module.exports = router;