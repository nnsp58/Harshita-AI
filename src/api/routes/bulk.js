// src/api/routes/bulk.js
// Bulk Excel import routes

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BulkImportAgent } = require('../../agents/bulkImportAgent');

const bulkAgent = new BulkImportAgent();

// Configure multer for Excel uploads
const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'bulk'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`Only Excel (.xlsx, .xls) or CSV files allowed`));
  }
});

// GET /api/bulk/template — Download sample Excel template
router.get('/template', (req, res) => {
  try {
    const templatePath = bulkAgent.generateTemplate(
      path.join(process.cwd(), 'uploads', 'bulk')
    );
    res.download(templatePath, 'rawan_candidate_template.xlsx');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bulk/preview — Upload Excel and preview parsed data (no jobs created)
router.post('/preview', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const result = bulkAgent.parseExcel(req.file.path);
    // Don't delete file yet — needed for /import
    res.json({
      success: true,
      total: result.total,
      valid: result.candidates.length,
      errors: result.errors,
      preview: result.candidates.slice(0, 5), // Show first 5 rows
      fileId: path.basename(req.file.path), // Pass back for /import
      sheet: result.sheet,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/bulk/import — Parse Excel and create automation jobs
router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { serviceType, autoSubmit } = req.body;
  const controllerAgent = req.app.get('controllerAgent');
  const io = req.app.get('io');
  const userId = req.user?.id || 'bulk-import';

  try {
    const result = bulkAgent.parseExcel(req.file.path);
    const { candidates, errors } = result;

    if (candidates.length === 0) {
      return res.status(400).json({ error: 'No valid candidates found', errors });
    }

    // Queue a job for each candidate
    const jobs = [];
    const batchId = `batch_${Date.now()}`;

    for (const candidate of candidates) {
      const svcType = serviceType || candidate.serviceType || 'ssc'; // fallback
      const taskId = await controllerAgent.addTask(userId, {
        serviceType: svcType,
        userData: candidate,
        autoSubmit: autoSubmit !== 'false',
        metadata: { batchId, rowNum: candidate.rowNum }
      });
      jobs.push({ taskId, candidateName: candidate.personal.fullName, serviceType: svcType });
    }

    // Notify dashboard via WebSocket
    if (io) {
      io.emit('bulk_import_started', {
        batchId,
        total: candidates.length,
        jobs: jobs.length,
        timestamp: new Date()
      });
    }

    // Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    res.json({
      success: true,
      batchId,
      queued: jobs.length,
      skipped: errors.length,
      errors: errors.slice(0, 10),
      jobs,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bulk/status/:batchId — Get status of all jobs in a batch
router.get('/status/:batchId', (req, res) => {
  const controllerAgent = req.app.get('controllerAgent');
  const { batchId } = req.params;

  const allTasks = Array.from(controllerAgent.tasks.values());
  const batchTasks = allTasks.filter(t => t.metadata?.batchId === batchId);

  const summary = batchTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    batchId,
    total: batchTasks.length,
    summary,
    tasks: batchTasks.map(t => ({
      taskId: t.id,
      status: t.status,
      candidate: t.userData?.personal?.fullName,
      serviceType: t.serviceType,
      error: t.error || null
    }))
  });
});

module.exports = router;
