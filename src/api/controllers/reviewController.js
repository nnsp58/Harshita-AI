// src/api/controllers/reviewController.js - Review Controller (OTP/CAPTCHA)

const { prisma } = require('../../models/database');
const { ApiError } = require('../middleware/errorHandler');
const { otpRequestSchema, otpVerifySchema, captchaSolveSchema, manualInputSchema } = require('../validations/schemas');

// Helper to get controllerAgent from app
const getController = (req) => req.app.get('controllerAgent');

const requestOtp = async (req, res, next) => {
  try {
    const data = otpRequestSchema.parse(req.body);

    const job = await prisma.job.findFirst({
      where: {
        id: data.job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const otp = await prisma.otp.create({
      data: {
        phone_number: data.phone_number,
        otp_code: otpCode,
        status: 'sent',
        job_id: data.job_id,
        expires_at: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // TODO: Integrate with SMS provider (Twilio, etc.)
    console.log(`OTP for job ${data.job_id}: ${otpCode}`);

    const io = req.app.get('io');
    io.to(`job_${data.job_id}`).emit('otp_sent', {
      job_id: data.job_id,
      phone_number: data.phone_number
    });

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        otp_id: otp.id,
        expires_in: 300
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const data = otpVerifySchema.parse(req.body);

    const job = await prisma.job.findFirst({
      where: {
        id: data.job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const otp = await prisma.otp.findFirst({
      where: {
        job_id: data.job_id,
        status: 'sent'
      },
      orderBy: { created_at: 'desc' }
    });

    if (!otp) {
      throw ApiError.badRequest('No OTP sent for this job');
    }

    if (otp.expires_at < new Date()) {
      await prisma.otp.update({
        where: { id: otp.id },
        data: { status: 'expired' }
      });
      throw ApiError.badRequest('OTP has expired');
    }

    if (otp.otp_code !== data.otp) {
      await prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 }
      });
      throw ApiError.badRequest('Invalid OTP');
    }

    // OTP verified - mark as verified
    await prisma.otp.update({
      where: { id: otp.id },
      data: { status: 'verified' }
    });

    // Check if job is paused for OTP and resume it
    const jobState = getController(req).getJobState(data.job_id);
    if (jobState && jobState.state === 'awaiting_otp') {
      console.log(`Resuming job ${data.job_id} with OTP`);
      const resumeResult = await getController(req).resumeJob(data.job_id, { otp: data.otp });
      
      const io = req.app.get('io');
      io.to(`job_${data.job_id}`).emit('otp_verified_and_resumed', {
        job_id: data.job_id,
        status: resumeResult.status
      });

      res.json({
        success: true,
        message: 'OTP verified, job resumed',
        data: resumeResult
      });
      return;
    }

    const io = req.app.get('io');
    io.to(`job_${data.job_id}`).emit('otp_verified', {
      job_id: data.job_id
    });

    res.json({
      success: true,
      message: 'OTP verified successfully (job not awaiting OTP)',
      data: { verified: true }
    });
  } catch (error) {
    next(error);
  }
};

const solveCaptcha = async (req, res, next) => {
  try {
    const data = captchaSolveSchema.parse(req.body);

    const job = await prisma.job.findFirst({
      where: {
        id: data.job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Provide CAPTCHA solution and resume job
    const jobState = getController(req).getJobState(data.job_id);
    if (jobState && jobState.state === 'awaiting_captcha') {
      console.log(`Resuming job ${data.job_id} with CAPTCHA solution`);
      const resumeResult = await getController(req).resumeJob(data.job_id, {
        captchaSolution: data.solution
      });

      const io = req.app.get('io');
      io.to(`job_${data.job_id}`).emit('captcha_solved_and_resumed', {
        job_id: data.job_id,
        status: resumeResult.status
      });

      res.json({
        success: true,
        message: 'CAPTCHA solved, job resumed',
        data: resumeResult
      });
      return;
    }

    // No waiting CAPTCHA, just acknowledge
    res.json({
      success: true,
      message: 'CAPTCHA solution received',
      requires_manual_input: false
    });
  } catch (error) {
    next(error);
  }
};

const submitManualInput = async (req, res, next) => {
  try {
    const data = manualInputSchema.parse(req.body);

    const job = await prisma.job.findFirst({
      where: {
        id: data.job_id,
        user_id: req.user.id
      },
      include: { candidate: true }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const review = await prisma.review.create({
      data: {
        job_id: data.job_id,
        candidate_id: job.candidate_id,
        user_id: req.user.id,
        field_name: data.field_name,
        field_value: data.field_value,
        status: 'completed'
      }
    });

    const io = req.app.get('io');
    io.to(`job_${data.job_id}`).emit('manual_input_received', {
      job_id: data.job_id,
      field_name: data.field_name
    });

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

const approveJob = async (req, res, next) => {
  try {
    const { job_id } = req.params;
    const controller = getController(req);

    // Check if job is waiting for manual approval
    const jobState = controller.getJobState(job_id);
    if (jobState && jobState.state === 'paused_approval') {
      // Resume job after manual approval
      await controller.resumeJob(job_id);
      
      const io = req.app.get('io');
      io.to(`job_${job_id}`).emit('job_approved', { job_id });
      
      res.json({
        success: true,
        message: 'Job resumed after manual approval',
        data: { jobId: job_id, status: 'resumed' }
      });
      return;
    }

    // Fallback: Mark as completed (for manually handled jobs)
    const updatedJob = await prisma.job.update({
      where: { id: job_id },
      data: {
        status: 'completed',
        completed_at: new Date()
      }
    });

    const io = req.app.get('io');
    io.to(`job_${job_id}`).emit('job_approved', { job_id });

    res.json({
      success: true,
      message: 'Job approved successfully',
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

const rejectJob = async (req, res, next) => {
  try {
    const { job_id } = req.params;
    const { reason } = req.body;

    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const updatedJob = await prisma.job.update({
      where: { id: job_id },
      data: {
        status: 'failed',
        error_message: reason
      }
    });

    const io = req.app.get('io');
    io.to(`job_${job_id}`).emit('job_rejected', {
      job_id,
      reason
    });

    res.json({
      success: true,
      message: 'Job rejected',
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

const getPendingItems = async (req, res, next) => {
  try {
    const { job_id } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const pendingReviews = await prisma.review.findMany({
      where: {
        job_id,
        status: 'pending'
      }
    });

    const pendingOtps = await prisma.otp.findMany({
      where: {
        job_id,
        status: { in: ['sent', 'pending'] }
      }
    });

    // Also get job state from runner
    const jobState = getController(req).getJobState(job_id);

    res.json({
      success: true,
      data: {
        pending_reviews: pendingReviews,
        pending_otps: pendingOtps,
        job_state: jobState
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get active/in-progress jobs for user
const getActiveJobs = async (req, res, next) => {
  try {
    const controller = getController(req);
    const tasks = controller.getUserTasks(req.user.id);
    
    const jobsWithState = tasks.map(task => ({
      jobId: task.id,
      status: task.status,
      state: controller.getJobState(task.id)?.state,
      serviceType: task.serviceType,
      createdAt: task.createdAt
    }));

    res.json({
      success: true,
      data: jobsWithState
    });
  } catch (error) {
    next(error);
  }
};

// Manually pause a job
const pauseJob = async (req, res, next) => {
  try {
    const { job_id } = req.params;
    const { reason } = req.body;

    const job = await prisma.job.findFirst({
      where: {
        id: job_id,
        user_id: req.user.id
      }
    });

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Get job state and pause via runner
    const jobState = controllerAgent.getJobState(job_id);
    if (jobState && jobState.state === 'running') {
      // Note: For now, we don't have graceful pause from outside
      // Could close browser, etc.
      // We'll just mark for manual intervention
      res.json({
        success: true,
        message: 'Job pause requested (browser will close)'
      });
    } else {
      res.json({
        success: false,
        message: `Job not in running state: ${jobState?.state}`
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  solveCaptcha,
  submitManualInput,
  approveJob,
  rejectJob,
  getPendingItems,
  getActiveJobs,
  pauseJob
};