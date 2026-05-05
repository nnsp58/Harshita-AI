// src/api/controllers/downloadController.js - Download Controller

const { prisma } = require('../../models/database');
const { ApiError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const downloadJobFiles = async (req, res, next) => {
  try {
    const { job_id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      },
      include: {
        candidate: true,
        documents: true
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.documents.length === 0) {
      throw ApiError.notFound('No documents found for this job');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `job_${job_id}_${Date.now()}.zip`;

    res.attachment(filename);
    archive.pipe(res);

    for (const doc of job.documents) {
      const filePath = path.resolve(doc.path);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: doc.original_name });
      }
    }

    // Add job metadata
    const metadata = {
      job_id: job.id,
      service_type: job.service_type,
      status: job.status,
      candidate: {
        name: job.candidate.name,
        aadhaar: job.candidate.aadhaar_number,
        mobile: job.candidate.mobile
      },
      created_at: job.created_at,
      completed_at: job.completed_at
    };

    archive.append(JSON.stringify(metadata, null, 2), { name: 'job_metadata.json' });

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

const downloadCandidateFiles = async (req, res, next) => {
  try {
    const { candidate_id } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidate_id,
        user_id: req.user.id
      },
      include: {
        documents: true,
        jobs: {
          include: {
            documents: true
          }
        }
      }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const allDocuments = [
      ...candidate.documents,
      ...candidate.jobs.flatMap(j => j.documents)
    ];

    if (allDocuments.length === 0) {
      throw ApiError.notFound('No documents found for this candidate');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `candidate_${candidate_id}_${Date.now()}.zip`;

    res.attachment(filename);
    archive.pipe(res);

    for (const doc of allDocuments) {
      const filePath = path.resolve(doc.path);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: doc.original_name });
      }
    }

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

const downloadDocument = async (req, res, next) => {
  try {
    const { document_id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id: document_id,
        user_id: req.user.id
      }
    });

    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    const filePath = path.resolve(document.path);

    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('File not found on disk');
    }

    res.download(filePath, document.original_name);
  } catch (error) {
    next(error);
  }
};

const downloadProcessedForm = async (req, res, next) => {
  try {
    const { job_id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      },
      include: {
        documents: {
          where: {
            document_type: 'processed_form'
          }
        }
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const processedForm = job.documents.find(d => d.document_type === 'processed_form');

    if (!processedForm) {
      throw ApiError.notFound('Processed form not available');
    }

    const filePath = path.resolve(processedForm.path);

    if (!fs.existsSync(filePath)) {
      throw ApiError.notFound('Processed form file not found');
    }

    res.download(filePath, `processed_form_${job_id}.pdf`);
  } catch (error) {
    next(error);
  }
};

// Download complete job output bundle (screenshots, logs, results)
const downloadJobOutputs = async (req, res, next) => {
  try {
    const { job_id } = req.params;

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Output directory from stateful runner or on-disk
    const outputDir = path.join(process.cwd(), 'output', job_id);
    
    if (!fs.existsSync(outputDir)) {
      throw ApiError.notFound('No output files available for this job');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `job_${job_id}_outputs_${Date.now()}.zip`;

    res.attachment(filename);
    archive.pipe(res);

    // Recursively add all files in output directory
    const addDirectoryToArchive = (dir, basePath = '') => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirectoryToArchive(fullPath, path.join(basePath, file));
        } else {
          archive.file(fullPath, { name: path.join(basePath, file) });
        }
      }
    };

    addDirectoryToArchive(outputDir);

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadJobFiles,
  downloadCandidateFiles,
  downloadDocument,
  downloadProcessedForm,
  downloadJobOutputs
};