// src/api/routes/documents.js - Document Processing Routes

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { param } = require('express-validator');
const documentController = require('../controllers/documentController');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
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

const documentUpload = upload.single('document');

router.post(
  '/upload',
  authenticate,
  documentUpload,
  documentController.uploadDocument
);

router.get(
  '/',
  authenticate,
  documentController.listDocuments
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  documentController.getDocument
);

router.get(
  '/candidate/:candidate_id',
  authenticate,
  [param('candidate_id').isUUID()],
  validate,
  documentController.getDocumentsByCandidate
);

router.post(
  '/:id/process',
  authenticate,
  [param('id').isUUID()],
  validate,
  documentController.processDocument
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID()],
  validate,
  documentController.deleteDocument
);

module.exports = router;
