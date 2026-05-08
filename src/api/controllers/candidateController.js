// src/api/controllers/candidateController.js - Candidate Controller

const { prisma } = require('../../models/database');
const { ApiError } = require('../middleware/errorHandler');
const { candidateSchema, updateCandidateSchema } = require('../validations/schemas');
const path = require('path');

// File upload security
const sanitizeFilename = (name) => {
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
};

const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

function buildCandidateProfile(candidate) {
  return {
    personal: {
      fullName: candidate.name || '',
      fatherName: candidate.father_name || '',
      motherName: candidate.mother_name || '',
      dob: candidate.dob ? candidate.dob.toISOString().split('T')[0] : '',
      gender: candidate.gender || '',
      category: candidate.category || ''
    },
    contact: {
      email: candidate.email || '',
      phone: candidate.mobile || ''
    },
    address: {
      line1: candidate.village || '',
      line2: candidate.tehsil || '',
      district: candidate.district || '',
      state: candidate.state || '',
      pincode: candidate.pincode || ''
    },
    documents: {
      aadhaar: candidate.aadhaar_number || ''
    },
    employment: {
      occupation: candidate.occupation || '',
      annualIncome: candidate.annual_income ? Number(candidate.annual_income) : null
    }
  };
}

function flattenVerifiedProfile(profile) {
  return {
    name: profile?.personal?.fullName,
    father_name: profile?.personal?.fatherName,
    mother_name: profile?.personal?.motherName,
    dob: profile?.personal?.dob ? new Date(profile.personal.dob) : undefined,
    gender: profile?.personal?.gender,
    category: profile?.personal?.category || null,
    email: profile?.contact?.email || null,
    mobile: profile?.contact?.phone,
    village: profile?.address?.line1,
    tehsil: profile?.address?.line2,
    district: profile?.address?.district,
    state: profile?.address?.state,
    pincode: profile?.address?.pincode,
    aadhaar_number: profile?.documents?.aadhaar,
    occupation: profile?.employment?.occupation || null,
    annual_income: profile?.employment?.annualIncome ?? undefined
  };
}

const uploadCandidate = async (req, res, next) => {
  try {
    const data = candidateSchema.parse(req.body);
    
    const existingAadhaar = await prisma.candidate.findUnique({
      where: { aadhaar_number: data.aadhaar_number }
    });

    if (existingAadhaar) {
      throw ApiError.conflict('Aadhaar number already registered');
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        dob: new Date(data.dob),
        csc_id: req.user.cscId,
        user_id: req.user.id,
        ...(data.annual_income && { annual_income: data.annual_income })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    let documents = [];

    if (req.files) {
      const documentPromises = Object.entries(req.files).map(async ([fieldName, files]) => {
        const file = files[0];

        // Validate MIME type
        if (!allowedMimes.includes(file.mimetype)) {
          throw new Error(`Invalid file type: ${file.mimetype}`);
        }

        return prisma.document.upsert({
          where: {
            id: `${candidate.id}_${fieldName}`
          },
          create: {
            filename: sanitizeFilename(file.filename),
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
            document_type: fieldName,
            csc_id: req.user.cscId,
            candidate_id: candidate.id,
            user_id: req.user.id
          },
          update: {
            filename: sanitizeFilename(file.filename),
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path
          }
        });
      });

      documents = await Promise.all(documentPromises);
    }

    res.status(201).json({
      success: true,
      data: candidate,
      documents: req.files ? documents : []
    });
  }
  catch (error) {
    next(error);
  }
};

const uploadPublicCandidate = async (req, res, next) => {
  try {
    const { cscId, ...data } = req.body;

    // Verify CSC exists
    const csc = await prisma.cSC.findUnique({
      where: { id: cscId },
      include: { users: { take: 1, orderBy: { created_at: 'asc' } } }
    });
    if (!csc) {
      throw ApiError.notFound('Invalid CSC ID');
    }

    const existingAadhaar = await prisma.candidate.findUnique({
      where: { aadhaar_number: data.aadhaar_number }
    });

    if (existingAadhaar) {
      throw ApiError.conflict('Aadhaar number already registered');
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        dob: new Date(data.dob),
        csc_id: cscId,
        user_id: csc.users[0]?.id
      }
    });

    if (req.files) {
      const documentPromises = Object.entries(req.files).map(async ([fieldName, files]) => {
        const file = files[0];

        // Validate MIME type
        if (!allowedMimes.includes(file.mimetype)) {
          throw new Error(`Invalid file type: ${file.mimetype}`);
        }

        return prisma.document.create({
          data: {
            filename: sanitizeFilename(file.filename),
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
            path: file.path,
            document_type: fieldName,
            candidate_id: candidate.id,
            csc_id: cscId,
            user_id: candidate.user_id
          }
        });
      });
      await Promise.all(documentPromises);
    }

    res.status(201).json({
      success: true,
      message: 'Candidate registered successfully',
      candidate: { id: candidate.id, name: candidate.name }
    });
  } catch (error) {
    next(error);
  }
};

const bulkUploadCandidates = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Excel file required');
    }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1); // First worksheet
    const data = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const headerCell = worksheet.getCell(1, colNumber);
          if (headerCell.value) {
            rowData[headerCell.value.toString()] = cell.value;
          }
        });
        data.push(rowData);
      }
    });

    const cscId = req.user.cscId;
    const results = { success: 0, failed: 0, errors: [] };

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.name || !row.father_name || !row.aadhaar_number || !row.mobile || !row.village) {
          throw new Error('Missing required fields');
        }

        const candidateData = {
          name: row.name,
          father_name: row.father_name,
          mother_name: row.mother_name || '',
          dob: new Date(row.dob),
          gender: (row.gender || '').toLowerCase(),
          aadhaar_number: String(row.aadhaar_number).padStart(12, '0'),
          mobile: String(row.mobile),
          email: row.email || '',
          village: row.village,
          tehsil: row.tehsil || '',
          district: row.district || '',
          state: row.state || '',
          pincode: String(row.pincode || ''),
          category: (row.category || '').toLowerCase() || null
        };

        // Check duplicate
        const existing = await prisma.candidate.findUnique({
          where: { aadhaar_number: candidateData.aadhaar_number }
        });

        if (existing) {
          throw new Error('Aadhaar already exists');
        }

        await prisma.candidate.create({
          data: {
            ...candidateData,
            csc_id: cscId,
            user_id: req.user.id
          }
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({ row: row.__rowNum__ || 'unknown', error: error.message });
      }
    }

    // Cleanup uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Bulk upload completed: ${results.success} success, ${results.failed} failed`,
      results
    });
  } catch (error) {
    next(error);
  }
};

const getVerification = async (req, res, next) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, csc_id: req.user.cscId },
      include: { documents: true }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const profile = candidate.verified_profile || candidate.extracted_data || buildCandidateProfile(candidate);

    res.json({
      success: true,
      data: {
        candidate_id: candidate.id,
        verification_status: candidate.verification_status,
        verified_at: candidate.verified_at,
        verified_by: candidate.verified_by,
        profile,
        extracted_data: candidate.extracted_data,
        corrections: candidate.corrections,
        documents: candidate.documents
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyCandidate = async (req, res, next) => {
  try {
    const { profile, corrections } = req.body;
    if (!profile) {
      throw ApiError.badRequest('Verified profile is required');
    }

    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, csc_id: req.user.cscId }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const updates = flattenVerifiedProfile(profile);
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        ...updates,
        verified_profile: profile,
        corrections: corrections || {},
        verification_status: 'verified',
        verified_at: new Date(),
        verified_by: req.user.id
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Candidate profile verified and saved for future jobs'
    });
  } catch (error) {
    next(error);
  }
};

const rejectVerification = async (req, res, next) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, csc_id: req.user.cscId }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        verification_status: 'rejected',
        corrections: { reason: req.body?.reason || 'Rejected by VLE' }
      }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadCandidate,
  uploadPublicCandidate,
  bulkUploadCandidates,
  getVerification,
  verifyCandidate,
  rejectVerification,
  buildCandidateProfile
};
