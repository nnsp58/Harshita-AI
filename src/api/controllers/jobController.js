// src/api/controllers/jobController.js - Job Controller

const { prisma } = require('../../models/database');
const { ApiError } = require('../middleware/errorHandler');
const { jobSchema } = require('../validations/schemas');

// const controllerAgent = require('../../agents/controllerAgent'); // Don't use module directly

const createJob = async (req, res, next) => {
  try {
    const data = jobSchema.parse(req.body);

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: data.candidate_id,
        csc_id: req.user.cscId
      }
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found');
    }

    const job = await prisma.job.create({
      data: {
        service_type: data.service_type,
        form_url: data.form_url || 'https://example.com/form',
        priority: data.priority || 0,
        notes: data.notes,
        candidate_id: data.candidate_id,
        csc_id: req.user.cscId,
        user_id: req.user.id
      },
      include: {
        candidate: true
      }
    });

    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('job_created', {
      job_id: job.id,
      status: job.status
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        candidate: true,
        documents: true,
        otps: {
          orderBy: { created_at: 'desc' },
          take: 5
        },
        reviews: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

const listJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const where = {
      csc_id: req.user.cscId
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { candidate: { name: { contains: search, mode: 'insensitive' } } },
        { candidate: { aadhaar_number: { contains: search } } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    let jobs = []
    let total = 0
    try {
      if (prisma) {
        [jobs, total] = await Promise.all([
          prisma.job.findMany({
            where,
            include: {
              candidate: { select: { id: true, name: true, aadhaar_number: true, mobile: true } },
              _count: { select: { reviews: true, documents: true } }
            },
            orderBy: [{ priority: 'desc' }, { created_at: 'desc' }],
            skip,
            take: limit
          }),
          prisma.job.count({ where })
        ]);
      }
    } catch (e) {
      console.warn('DB job list failed:', e.message)
    }

    res.json({
      success: true,
      data: jobs,
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

const startJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        candidate: true
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (!['pending', 'failed', 'cancelled'].includes(job.status)) {
      throw ApiError.badRequest(`Cannot start job with status: ${job.status}`);
    }

    if (job.candidate.verification_status !== 'verified' || !job.candidate.verified_profile) {
      throw ApiError.badRequest('Candidate profile must be verified before starting a job');
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'queued',
        started_at: new Date()
      }
    });

    try {
      const c = job.candidate;
      const userData = c.verified_profile || {
        personal: {
          fullName: c.name,
          fatherName: c.father_name || '',
          motherName: c.mother_name || '',
          dob: c.dob ? c.dob.toISOString().split('T')[0] : '',
          gender: c.gender,
          category: c.category || ''
        },
        contact: {
          email: c.email || '',
          phone: c.mobile
        },
        address: {
          line1: c.village || '',
          line2: c.tehsil || '',
          district: c.district || '',
          state: c.state || '',
          pincode: c.pincode || ''
        },
        documents: {
          aadhaar: c.aadhaar_number
        },
        employment: {
          status: c.occupation ? 'employed' : 'unemployed'
        }
      };

      const controller = req.app.get('controllerAgent');
      const taskId = await controller.addTask(req.user.id, {
        formUrl: job.form_url,
        userData,
        jobId: job.id,
        serviceType: job.service_type,
        autoSubmit: false // Wait for manual review/CAPTCHA
      });

      await prisma.job.update({
        where: { id },
        data: { notes: `${job.notes || ''}\nTask ID: ${taskId}`.trim() }
      });
    } catch (err) {
      console.error('Error adding task to queue:', err);
    }

    const io = req.app.get('io');
    io.to(`job_${id}`).emit('job_update', {
      job_id: id,
      status: 'queued'
    });

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

const retryJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.status !== 'failed') {
      throw ApiError.badRequest('Can only retry failed jobs');
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'pending',
        error_message: null
      }
    });

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

const cancelJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (!['pending', 'queued'].includes(job.status)) {
      throw ApiError.badRequest(`Cannot cancel job with status: ${job.status}`);
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'cancelled'
      }
    });

    const io = req.app.get('io');
    io.to(`job_${id}`).emit('job_update', {
      job_id: id,
      status: 'cancelled'
    });

    res.json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    await prisma.job.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getJobStats = async (req, res, next) => {
  try {
    // Check if database is available
    let stats = [];
    let totalJobs = 0;
    try {
      if (prisma) {
        await prisma.$connect();
        stats = await prisma.job.groupBy({
          by: ['status'],
          where: { user_id: req.user.id },
          _count: true
        });

        totalJobs = await prisma.job.count({
          where: { user_id: req.user.id }
        });
      }
    } catch (dbError) {
      // Database not available, return mock data
    }

    // If no stats, return zeroed data
    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          total: 0,
          pending: 0,
          queued: 0,
          running: 0,
          completed: 0,
          failed: 0,
          cancelled: 0,
          recent_jobs: []
        }
      });
    }

    const statusCounts = stats.reduce((acc, s) => {
      acc[s.status] = s._count;
      return acc;
    }, {});

    const recentJobs = await prisma.job.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: 'desc' },
      take: 5,
      include: {
        candidate: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalJobs,
        pending: statusCounts.pending || 0,
        queued: statusCounts.queued || 0,
        running: statusCounts.running || 0,
        completed: statusCounts.completed || 0,
        failed: statusCounts.failed || 0,
        cancelled: statusCounts.cancelled || 0,
        recent_jobs: recentJobs
      }
    });
  } catch (error) {
    next(error);
  }
};

const applyJobsForCandidates = async (req, res, next) => {
  try {
    const { candidateIds, jobType, numApplications } = req.body;
    const cscId = req.user.cscId;

    // Validate candidates belong to CSC
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        csc_id: cscId
      }
    });

    if (candidates.length !== candidateIds.length) {
      throw ApiError.badRequest('Some candidates not found or not accessible');
    }

    const jobs = [];
    const serviceTypeMap = {
      ssc: 'ssc',
      army: 'army',
      railway: 'railway',
      banking: 'banking',
      police: 'police',
      defence: 'defence',
      postal: 'postal',
      apprenticeship: 'apprenticeship',
      stateSsc: 'stateSsc'
    };

    for (const candidate of candidates) {
      for (let i = 0; i < numApplications; i++) {
        const job = await prisma.job.create({
          data: {
            service_type: serviceTypeMap[jobType] || jobType,
            form_url: 'https://example.com/form',
            candidate_id: candidate.id,
            csc_id: cscId,
            user_id: req.user.id
          }
        });
        jobs.push(job);
      }
    }

    // Trigger MasterAgent to process these jobs
    const { MasterAgent } = require('../../core/masterAgent');
    const masterAgent = new MasterAgent();

    for (const job of jobs) {
      // Simulate job application trigger
      await masterAgent.processMessage(req.user.id, `apply ${job.service_type} job for candidate ${job.candidate_id}`);
    }

    res.json({
      success: true,
      message: `Job applications created for ${candidates.length} candidates`,
      jobsCreated: jobs.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJob,
  listJobs,
  startJob,
  retryJob,
  cancelJob,
  deleteJob,
  getJobStats,
  applyJobsForCandidates
};
