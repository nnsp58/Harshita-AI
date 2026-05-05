// src/api/controllers/documentController.js - Document Controller

const { prisma } = require('../../models/database');
const { ApiError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded');
    }

    const { document_type, candidate_id, job_id } = req.body;

    const document = await prisma.document.create({
      data: {
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        document_type: document_type || 'other',
        csc_id: req.user.cscId,
        candidate_id: candidate_id || null,
        job_id: job_id || null,
        user_id: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = { csc_id: req.user.cscId };
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          candidate: { select: { id: true, name: true } },
          job: { select: { id: true, status: true, service_type: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentsByCandidate = async (req, res, next) => {
  try {
    const { candidate_id } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidate_id,
        user_id: req.user.id
      }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const documents = await prisma.document.findMany({
      where: { candidate_id }
    });

    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

const processDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
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

    // Call DocumentAIAgent for OCR and AI parsing
    let ocrText = null;
    let structuredData = null;

    try {
      const { DocumentAIAgent } = require('../../agents/documentAIAgent');
      const agent = new DocumentAIAgent();
      
      // Determine document type from document_type field
      const docType = document.document_type || 'general';
      
      // Process the document (extract text + AI parsing)
      const result = await agent.processDocument(filePath, docType);
      
      ocrText = result.extractedText;
      structuredData = result.structuredData;
      
      console.log(`   Document ${id} processed: ${ocrText?.length || 0} chars extracted`);
    } catch (err) {
      console.error('Document processing error:', err);
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ocr_data: ocrText ? { text: ocrText } : null,
        ai_parsed: structuredData
      }
    });

    if (document.candidate_id && structuredData) {
      await prisma.candidate.update({
        where: { id: document.candidate_id },
        data: {
          extracted_data: structuredData,
          verification_status: 'needs_review'
        }
      }).catch(err => console.warn('Candidate verification draft update failed:', err.message));
    }

    res.json({
      success: true,
      data: updatedDocument
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!document) {
      throw ApiError.notFound('Document not found');
    }

    // Delete file from disk
    const filePath = path.resolve(document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.document.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  getDocument,
  getDocumentsByCandidate,
  processDocument,
  deleteDocument
};
