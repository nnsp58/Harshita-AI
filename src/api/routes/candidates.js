// src/api/routes/candidates.js - Candidate Management Routes

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, param } = require('express-validator');
const candidateController = require('../controllers/candidateController');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const excelUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files allowed'));
    }
  }
});

const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'marksheet', maxCount: 1 },
  { name: 'income_certificate', maxCount: 1 },
  { name: 'ration_card', maxCount: 1 },
  { name: 'other_documents', maxCount: 10 }
]);

router.post(
  '/upload',
  authenticate,
  uploadFields,
  [
    body('name').trim().notEmpty(),
    body('father_name').trim().notEmpty(),
    body('dob').isISO8601(),
    body('gender').isIn(['male', 'female', 'other']),
    body('aadhaar_number').matches(/^\d{12}$/),
    body('mobile').matches(/^\d{10}$/),
    body('village').trim().notEmpty(),
    body('tehsil').trim().notEmpty(),
    body('district').trim().notEmpty(),
    body('state').trim().notEmpty(),
    body('pincode').matches(/^\d{6}$/)
  ],
  validate,
  candidateController.uploadCandidate
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  candidateController.getCandidate
);

router.get(
  '/',
  authenticate,
  candidateController.listCandidates
);

router.get(
  '/:id/verification',
  authenticate,
  [param('id').isUUID()],
  validate,
  candidateController.getVerification
);

router.put(
  '/:id/verification',
  authenticate,
  [param('id').isUUID()],
  validate,
  candidateController.verifyCandidate
);

router.post(
  '/:id/verification/reject',
  authenticate,
  [param('id').isUUID()],
  validate,
  candidateController.rejectVerification
);

router.put(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  candidateController.updateCandidate
);

router.delete(
  '/:id',
  authenticate,
  authorize('csc_admin', 'superadmin'),
  [param('id').isUUID()],
  validate,
  candidateController.deleteCandidate
);

router.post(
  '/:id/documents',
  authenticate,
  [param('id').isUUID()],
  validate,
  uploadFields,
  candidateController.uploadDocuments
);

// Public candidate submission (no auth required)
router.post(
  '/public',
  uploadFields,
  [
    body('cscId').isUUID(),
    body('name').trim().notEmpty(),
    body('fatherName').trim().notEmpty(),
    body('dob').isISO8601(),
    body('gender').isIn(['male', 'female', 'other']),
    body('aadhaar').matches(/^\d{12}$/),
    body('mobile').matches(/^\d{10}$/),
    body('village').trim().notEmpty(),
    body('tehsil').trim().notEmpty(),
    body('district').trim().notEmpty(),
    body('state').trim().notEmpty(),
    body('pincode').matches(/^\d{6}$/)
  ],
  validate,
  candidateController.uploadPublicCandidate
);

// Bulk upload candidates
router.post(
  '/bulk-upload',
  authenticate,
  excelUpload.single('excelFile'),
  candidateController.bulkUploadCandidates
);

module.exports = router;
