// src/bot/statefulBotRunner.js - Manages bot execution with pause/resume
// Supports CAPTCHA detection, manual approval, OTP verification

const { BaseBot } = require('./baseBot');
const { ResultGeneratorAgent } = require('../agents/resultGeneratorAgent');
const fs = require('fs');
const path = require('path');

class StatefulBotRunner {
  constructor(controllerAgent, io) {
    this.controllerAgent = controllerAgent;
    this.io = io;
    this.activeJobs = new Map();
    this.resultGenerator = new ResultGeneratorAgent();
  }

  // Main entry point
  async runJob(job) {
    const { jobId, candidateProfile, serviceType, options = {} } = job;

    console.log(`[StatefulRunner] 🚀 Starting job ${jobId} (${serviceType})`);

    try {
      const bot = this.controllerAgent.getBot(serviceType);
      await bot.initBrowser();

      const jobState = {
        bot,
        page: bot.page,
        browser: bot.browser,
        candidateProfile,
        serviceType,
        options,
        startedAt: Date.now(),
        screenshots: [],
        logs: []
      };

      this.activeJobs.set(jobId, jobState);
      jobState.state = 'running';
      await this.updateJobState(jobId, 'running');

      // Navigate
      await this.emitAndLog(jobId, 'Navigating to form', 'navigating');
      await bot.navigate();
      this.addScreenshot(jobId, await this.takeScreenshot(bot.page, jobId, 'form_loaded'));

      // Fill form
      await this.emitAndLog(jobId, 'Filling form fields', 'filling');
      await bot.fillForm(candidateProfile);
      this.addScreenshot(jobId, await this.takeScreenshot(bot.page, jobId, 'form_filled'));

      // Check CAPTCHA
      if (bot.config.hasCaptcha) {
        const hasCaptcha = await bot.detectCaptcha();
        if (hasCaptcha) {
          return await this.handleCaptchaPause(jobId, jobState);
        }
      }

      // Manual approval before submit
      if (options.autoSubmit === false) {
        return await this.handleApprovalPause(jobId, jobState);
      }

      // Auto-submit path
      return await this.submitAndContinue(jobId, jobState);

    } catch (error) {
      console.error(`[StatefulRunner] ❌ Job ${jobId} error:`, error);
      await this.failJob(jobId, error);
      throw error;
    }
  }

  // Pause for CAPTCHA
  async handleCaptchaPause(jobId, jobState) {
    const { bot } = jobState;
    const screenshot = await this.takeScreenshot(bot.page, jobId, 'captcha');
    this.addScreenshot(jobId, screenshot);

    jobState.state = 'paused_captcha';
    this.emitJobEvent(jobId, 'captcha_required', {
      jobId, message: 'CAPTCHA detected - manual intervention',
      screenshot, elapsedTime: Date.now() - jobState.startedAt, state: jobState.state
    });

    this.logJobEvent(jobId, '⏸️ Paused for CAPTCHA');
    return { status: 'paused', reason: 'captcha_required', jobId, state: jobState.state };
  }

  // Pause for manual approval
  async handleApprovalPause(jobId, jobState) {
    jobState.state = 'paused_approval';
    this.emitJobEvent(jobId, 'approval_required', {
      jobId, message: 'Manual approval required before submit',
      elapsedTime: Date.now() - jobState.startedAt, state: jobState.state
    });

    this.logJobEvent(jobId, '⏸️ Paused for manual approval');
    return { status: 'paused', reason: 'awaiting_approval', jobId, state: jobState.state };
  }

  // Continue after CAPTCHA solved (called by resume)
  async resumeFromCaptcha(jobState, resumeData) {
    const { jobId, bot, page, options } = jobState;

    // Fill CAPTCHA solution
    if (resumeData.captchaSolution) {
      try {
        const field = await page.$("input[name='captcha'], input[name='captchaInput'], input[id='captcha']");
        if (field) await field.fill(resumeData.captchaSolution);
      } catch (e) { console.warn('Fill CAPTCHA error:', e.message); }
    }

    this.logJobEvent(jobId, 'CAPTCHA solution applied');

    // After CAPTCHA, check if manual approval needed
    if (options.autoSubmit === false) {
      return await this.handleApprovalPause(jobId, jobState);
    }

    // Otherwise submit
    return await this.submitAndContinue(jobId, jobState);
  }

  // Continue after manual approval
  async resumeFromApproval(jobState) {
    const { jobId } = jobState;
    this.logJobEvent(jobId, '✅ Manual approval received');
    return await this.submitAndContinue(jobId, jobState);
  }

  // Submit form and handle OTP
  async submitAndContinue(jobId, jobState) {
    const { bot } = jobState;

    await bot.submit();
    this.logJobEvent(jobId, 'Form submitted');
    await this.sleep(2000);
    this.addScreenshot(jobId, await this.takeScreenshot(bot.page, jobId, 'post_submit'));

    // Detect OTP
    const needsOtp = jobState.options.otp ? true : await bot.detectOtp();
    if (needsOtp) {
      jobState.state = 'paused_otp';
      this.emitJobEvent(jobId, 'otp_required', {
        jobId, message: 'OTP required',
        screenshot: jobState.screenshots[jobState.screenshots.length - 1],
        elapsedTime: Date.now() - jobState.startedAt, state: jobState.state
      });
      this.logJobEvent(jobId, '⏸️ Paused for OTP');
      return { status: 'paused', reason: 'otp_required', jobId, state: jobState.state };
    }

    // OTP already provided
    if (jobState.options.otp) {
      await bot.handleOtp(jobState.options.otp);
      this.logJobEvent(jobId, 'OTP entered');
      await this.sleep(2000);
    }

    // Verify final result
    const result = await bot.verifySubmission();
    const finalScreenshot = await this.takeScreenshot(bot.page, jobId, 'final');
    this.addScreenshot(jobId, finalScreenshot);
    await this.completeJob(jobId, result);
    return { status: 'completed', result };
  }

  // Resume from OTP
  async resumeFromOtp(jobState, resumeData) {
    const { jobId, bot } = jobState;

    if (resumeData.otp) {
      const otpField = await bot.page.$("input[name='otp'], input[name='Otp'], input[id='otp'], input[type='tel'][maxlength='6']");
      if (otpField) {
        await otpField.fill(resumeData.otp);
        await this.sleep(500);
      }

      const verifyBtn = await bot.page.$("button:has-text('Verify'), button:has-text('Submit'), button:has-text('Confirm')");
      if (verifyBtn) {
        await verifyBtn.click();
        await this.sleep(2000);
      }
      this.logJobEvent(jobId, 'OTP submitted');
    }

    // After OTP, verify
    const result = await bot.verifySubmission();
    const screenshot = await this.takeScreenshot(bot.page, jobId, 'result');
    this.addScreenshot(jobId, screenshot);
    await this.completeJob(jobId, result);
    return { status: 'completed', result };
  }

  // Generic pauser
  async pauseJob(jobId, reason) {
    const jobState = this.activeJobs.get(jobId);
    if (!jobState) throw new Error(`Job ${jobId} not found`);

    jobState.state = `paused_${reason}`;
    jobState.pausedAt = Date.now();
    jobState.pauseReason = reason;

    this.emitJobEvent(jobId, 'job_paused', {
      jobId, state: jobState.state, reason,
      pausedAt: jobState.pausedAt,
      elapsedTime: Date.now() - jobState.startedAt
    });
    this.logJobEvent(jobId, `⏸️ Paused: ${reason}`);
  }

  // Resume dispatcher
  async resumeJob(jobId, resumeData = {}) {
    const jobState = this.activeJobs.get(jobId);
    if (!jobState) throw new Error(`Job ${jobId} not found`);

    const prevState = jobState.state;
    console.log(`[StatefulRunner] ▶️ Resuming job ${jobId} from ${prevState}`);

    switch (prevState) {
      case 'paused_captcha':
        await this.resumeFromCaptcha(jobState, resumeData);
        break;
      case 'paused_approval':
        await this.resumeFromApproval(jobState);
        break;
      case 'paused_otp':
        await this.resumeFromOtp(jobState, resumeData);
        break;
      default:
        throw new Error(`Cannot resume from state: ${prevState}`);
    }
  }

  // Job completion
  async completeJob(jobId, result, screenshot = null) {
    const jobState = this.activeJobs.get(jobId);
    if (!jobState) return;

    try {
      await this.updateJobState(jobId, 'completed', { completed_at: new Date() });
      this.saveJobOutputs(jobId);

      // Generate HTML result report (PRD: Result Generator)
      try {
        await this.resultGenerator.generateReport(
          { id: jobId, serviceType: jobState.serviceType, formUrl: jobState.bot?.config?.formUrl },
          jobState.candidateProfile,
          { ...result, screenshots: jobState.screenshots.map(p => ({ path: p, step: 'automation' })), logs: jobState.logs }
        );
      } catch (e) { console.warn('Report generation skipped:', e.message); }

      this.emitJobEvent(jobId, 'job_completed', {
        jobId, result,
        screenshots: jobState.screenshots,
        executionTime: Date.now() - jobState.startedAt
      });
      this.logJobEvent(jobId, '✅ Job completed');
    } finally {
      await this.cleanupJob(jobId);
    }
  }

  // Job failure
  async failJob(jobId, error, screenshot = null) {
    try {
      await this.updateJobState(jobId, 'failed', {
        error_message: error.message || error,
        completed_at: new Date()
      });
      this.emitJobEvent(jobId, 'job_failed', { jobId, error: error.message });
      this.logJobEvent(jobId, `❌ Failed: ${error.message}`);
    } finally {
      await this.cleanupJob(jobId);
    }
  }

  // Take screenshot
  async takeScreenshot(page, jobId, label) {
    try {
      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

      const filename = `${jobId}_${label}_${Date.now()}.png`;
      const filepath = path.join(screenshotsDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });
      return filepath;
    } catch (e) {
      console.error('Screenshot error:', e);
      return null;
    }
  }

  addScreenshot(jobId, path) {
    if (!path) return;
    const jobState = this.activeJobs.get(jobId);
    if (jobState) jobState.screenshots.push(path);
  }

  logJobEvent(jobId, message) {
    const jobState = this.activeJobs.get(jobId);
    if (jobState) {
      jobState.logs.push({ timestamp: new Date().toISOString(), message });
    }
    this.emitJobEvent(jobId, 'job_log', { jobId, message, timestamp: new Date().toISOString() });
  }

  emitJobEvent(jobId, event, data) {
    if (this.io) {
      this.io.to(`job_${jobId}`).emit(event, data);
    }
  }

  async updateJobState(jobId, status, extra = {}) {
    try {
      const { prisma } = require('../models/database');
      await prisma.job.update({
        where: { id: jobId },
        data: { status, ...extra, updated_at: new Date() }
      });
    } catch (e) {
      console.error('DB update error:', e.message);
    }
  }

  saveJobOutputs(jobId) {
    const jobState = this.activeJobs.get(jobId);
    if (!jobState) return;

    const outputDir = path.join(process.cwd(), 'output', jobId);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const manifest = {
      jobId,
      serviceType: jobState.serviceType,
      candidate: jobState.candidateProfile,
      startedAt: new Date(jobState.startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      executionTimeMs: Date.now() - jobState.startedAt,
      screenshots: jobState.screenshots,
      logs: jobState.logs
    };

    fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  async cleanupJob(jobId) {
    const jobState = this.activeJobs.get(jobId);
    if (jobState) {
      try {
        if (jobState.bot) await jobState.bot.closeBrowser();
      } catch (e) { console.error('Cleanup error:', e.message); }
      this.activeJobs.delete(jobId);
    }
  }

  getJobState(jobId) {
    const s = this.activeJobs.get(jobId);
    if (!s) return null;
    return {
      jobId,
      state: s.state,
      startedAt: s.startedAt,
      elapsedMs: Date.now() - s.startedAt,
      serviceType: s.serviceType,
      options: s.options,
      screenshots: s.screenshots,
      logs: s.logs.slice(-10)
    };
  }

  getUserTasks(userId) {
    // tasks are stored by controllerAgent; filter by userId from there
    // but not used internally much
    return [];
  }

  async generateJobZip(jobId) {
    // Generate ZIP from output directory
    const outputDir = path.join(process.cwd(), 'output', jobId);
    if (!fs.existsSync(outputDir)) throw new Error('No output for job');

    const archiver = require('archiver');
    const zipPath = path.join(process.cwd(), 'output', `${jobId}_${Date.now()}.zip`);

    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      out.on('close', () => resolve(zipPath));
      archive.on('error', reject);
      archive.pipe(out);
      archive.directory(outputDir, false);
      archive.finalize();
    });
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async emitAndLog(jobId, msg, state) {
    this.emitJobEvent(jobId, 'state_change', { state, message: msg });
    this.logJobEvent(jobId, msg);
  }
}

module.exports = { StatefulBotRunner };
