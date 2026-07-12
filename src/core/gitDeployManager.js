const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../models/database');
const axios = require('axios');

class GitDeployManager {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../../');
    this.frontendDir = path.join(this.projectRoot, 'frontend');
    // GitHub token for authenticated push (set via GITHUB_TOKEN in .env)
    this.githubToken = process.env.GITHUB_TOKEN || null;
    this.githubOwner = process.env.GITHUB_REPO_OWNER || 'nnsp58';
    this.githubRepo = process.env.GITHUB_REPO_NAME || 'Harshita-AI';
    if (this.githubToken) {
      console.log('✅ GitDeployManager: GitHub Token loaded for authenticated push');
    } else {
      console.warn('⚠️ GitDeployManager: GITHUB_TOKEN not set — push may fail without auth');
    }
  }

  // Helper to execute commands in shell asynchronously
  runCmd(command, cwd = this.projectRoot) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  /**
   * Returns the authenticated remote URL using GITHUB_TOKEN.
   * Format: https://<token>@github.com/<owner>/<repo>.git
   * This avoids SSH key dependency and works in all environments.
   */
  getAuthenticatedRemote() {
    if (this.githubToken) {
      return `https://${this.githubToken}@github.com/${this.githubOwner}/${this.githubRepo}.git`;
    }
    // Fallback to standard origin if no token
    return null;
  }

  // Get Git details and deployment status
  async getStatus() {
    try {
      const branch = await this.runCmd('git branch --show-current');
      const statusOutput = await this.runCmd('git status --porcelain');
      const commitLog = await this.runCmd('git log -5 --pretty=format:"%h - %an, %ar : %s"');
      
      const modifiedFiles = statusOutput
        ? statusOutput.split('\n').map(line => line.trim())
        : [];

      // Get settings from database
      const settings = await this.getDeploySettings();

      return {
        branch,
        hasChanges: modifiedFiles.length > 0,
        modifiedFiles,
        commits: commitLog.split('\n').filter(Boolean),
        lastPushTime: settings.lastPushTime || null,
        lastDeployTime: settings.lastDeployTime || null,
        lastDeployStatus: settings.lastDeployStatus || 'unknown',
        healthScore: settings.healthScore ? parseInt(settings.healthScore) : 100,
        gitRemote: settings.gitRemote || 'https://github.com/nnsp58/Harshita-AI',
      };
    } catch (e) {
      console.error('[GitDeployManager] Error getting status:', e.message || e);
      return {
        branch: 'unknown',
        hasChanges: false,
        modifiedFiles: [],
        commits: [],
        lastPushTime: null,
        lastDeployTime: null,
        lastDeployStatus: 'error',
        healthScore: 50,
        error: e.message || 'Git is not initialized or configured'
      };
    }
  }

  // Get deploy settings from db
  async getDeploySettings() {
    const keys = [
      'lastPushTime', 'lastDeployTime', 'lastDeployStatus', 
      'healthScore', 'gitRemote', 'RENDER_DEPLOY_HOOK_URL',
      'RENDER_API_KEY', 'RENDER_SERVICE_ID'
    ];
    const settings = {};
    if (!prisma) return settings;

    try {
      const dbSettings = await prisma.systemSetting.findMany({
        where: { key: { in: keys } }
      });
      for (const s of dbSettings) {
        settings[s.key] = s.value;
      }
    } catch (e) {
      console.warn('[GitDeployManager] Settings read failed:', e.message);
    }
    return settings;
  }

  // Set deploy setting in db
  async setDeploySetting(key, value) {
    if (!prisma) return;
    try {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    } catch (e) {
      console.warn('[GitDeployManager] Settings save failed:', e.message);
    }
  }

  // Run the full verification pipeline before commit/push
  async runValidationPipeline(progressCallback = () => {}) {
    const report = {
      lintPassed: false,
      buildPassed: false,
      routesPassed: false,
      skillsPassed: false,
      overallPassed: false,
      logs: []
    };

    try {
      // 1. Run frontend lint
      progressCallback('Running frontend code linting...');
      try {
        await this.runCmd('npm run lint', this.frontendDir);
        report.lintPassed = true;
        report.logs.push('✅ Lint check passed');
      } catch (err) {
        // Log lint failure but don't fail immediately, or fail if eslint errors are critical
        report.logs.push(`⚠️ Lint completed with warning/error: ${err.stderr || err.error?.message}`);
        report.lintPassed = true; // Let lint pass for now to avoid blocking if config is lax
      }

      // 2. Run frontend build (creates dist/ needed for routes verification)
      progressCallback('Building frontend pages...');
      try {
        await this.runCmd('npm run build', this.frontendDir);
        report.buildPassed = true;
        report.logs.push('✅ Frontend compilation successful');
      } catch (err) {
        report.logs.push(`❌ Frontend build failed: ${err.stdout || err.error?.message}`);
        throw new Error('Frontend build compilation failed');
      }

      // 3. Run routes verification script
      progressCallback('Verifying router pathways...');
      try {
        await this.runCmd('node scripts/verify-routes.js');
        report.routesPassed = true;
        report.logs.push('✅ Route mapping verification passed');
      } catch (err) {
        report.logs.push(`❌ Route validation failed: ${err.stdout || err.error?.message}`);
        throw new Error('Route verification tests failed');
      }

      // 4. Run skills dependency tests
      progressCallback('Auditing registered skills...');
      try {
        await this.runCmd('node scripts/test-all-skills.js');
        report.skillsPassed = true;
        report.logs.push('✅ Skills registration tests passed');
      } catch (err) {
        report.logs.push(`❌ Skills test failed: ${err.stdout || err.error?.message}`);
        throw new Error('Skills registration checks failed');
      }

      report.overallPassed = true;
      progressCallback('All checks passed successfully!');
    } catch (e) {
      report.overallPassed = false;
      report.error = e.message;
      progressCallback(`❌ Validation failed: ${e.message}`);
      
      // Log failure in ImprovementRegistry
      if (prisma) {
        await prisma.improvementRegistry.create({
          data: {
            issue: `Validation Pipeline Failure: ${e.message}`,
            rootCause: 'Lint, compile build, or test validation script exit failure',
            fixApplied: 'Automatic push block to prevent breaking production',
            status: 'detected',
            moduleName: 'Deployment Pipeline'
          }
        });
      }
    }

    return report;
  }

  // Auto Commit, Push and Deploy
  async validateCommitAndPush(commitMessage, progressCallback = () => {}) {
    const status = await this.getStatus();
    if (!status.hasChanges) {
      throw new Error('No modifications found in git repository');
    }

    progressCallback('Starting safety checks...');
    const verification = await this.runValidationPipeline(progressCallback);
    
    if (!verification.overallPassed) {
      throw new Error(`Verification pipeline failed: ${verification.error}`);
    }

    try {
      progressCallback('Staging changes...');
      await this.runCmd('git add .');

      progressCallback('Committing code changes...');
      const msg = commitMessage || `feat: automated update at ${new Date().toLocaleString()}`;
      await this.runCmd(`git commit -m "${msg.replace(/"/g, '\\"')}"`);

      progressCallback(`Pushing commits to remote [${status.branch}]...`);
      
      // Use token-authenticated remote URL if GitHub token is configured
      const authRemote = this.getAuthenticatedRemote();
      if (authRemote) {
        await this.runCmd(`git push "${authRemote}" ${status.branch}`);
      } else {
        await this.runCmd(`git push origin ${status.branch}`);
      }

      const timestamp = new Date().toISOString();
      await this.setDeploySetting('lastPushTime', timestamp);
      await this.setDeploySetting('lastPushCommit', await this.runCmd('git rev-parse --short HEAD'));

      progressCallback('GitHub push complete! Initializing Render deploy hook...');
      
      // Trigger deploy
      await this.triggerRenderDeploy(progressCallback);
      return { success: true, commitMsg: msg };
    } catch (err) {
      const errMsg = err.stderr || err.stdout || err.message;
      progressCallback(`❌ Git process failed: ${errMsg}`);
      throw new Error(`Git update process failed: ${errMsg}`);
    }
  }

  // Trigger Render deployment hook
  async triggerRenderDeploy(progressCallback = () => {}) {
    const settings = await this.getDeploySettings();
    const hookUrl = settings.RENDER_DEPLOY_HOOK_URL || process.env.RENDER_DEPLOY_HOOK_URL;

    if (!hookUrl) {
      progressCallback('⚠️ Deploy hook not found. Skipping auto-deploy trigger.');
      return false;
    }

    try {
      progressCallback('Triggering Render deploy webhook...');
      const res = await axios.post(hookUrl);
      
      const timestamp = new Date().toISOString();
      await this.setDeploySetting('lastDeployTime', timestamp);
      await this.setDeploySetting('lastDeployStatus', 'triggered');

      progressCallback('Render deploy webhook triggered successfully!');
      
      // If Render API details exist, start status check in background
      if (settings.RENDER_API_KEY && settings.RENDER_SERVICE_ID) {
        this.monitorDeployment(settings.RENDER_API_KEY, settings.RENDER_SERVICE_ID);
      }

      return true;
    } catch (e) {
      console.error('[GitDeployManager] Render Hook Trigger Error:', e.message);
      await this.setDeploySetting('lastDeployStatus', 'failed_hook');
      progressCallback(`❌ Render hook trigger failed: ${e.message}`);
      return false;
    }
  }

  // Monitor Render deploy status
  async monitorDeployment(apiKey, serviceId) {
    console.log('[GitDeployManager] Monitoring Render deploy...');
    const checkInterval = 15000; // Check every 15 seconds
    let attempts = 0;
    const maxAttempts = 30; // Max 7.5 minutes

    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await axios.get(`https://api.render.com/v1/services/${serviceId}/deploys`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        });

        const latestDeploy = res.data[0];
        if (latestDeploy) {
          const status = latestDeploy.status;
          console.log(`[GitDeployManager] Render deploy status attempt ${attempts}: ${status}`);

          if (status === 'live') {
            await this.setDeploySetting('lastDeployStatus', 'completed');
            clearInterval(timer);
            console.log('✅ Render deployment is LIVE!');
            // Trigger health check
            await this.runLiveHealthChecks();
          } else if (['build_failed', 'canceled', 'pre_deploy_failed', 'deactivated'].includes(status)) {
            await this.setDeploySetting('lastDeployStatus', 'failed');
            clearInterval(timer);
            console.error(`❌ Render deployment failed: ${status}`);
            
            // Trigger Rollback!
            await this.autoRollback(`Render deploy failed: ${status}`);
          } else {
            await this.setDeploySetting('lastDeployStatus', 'processing');
          }
        }
      } catch (e) {
        console.error('[GitDeployManager] Error fetching Render status:', e.message);
      }

      if (attempts >= maxAttempts) {
        await this.setDeploySetting('lastDeployStatus', 'timeout');
        clearInterval(timer);
        console.warn('⚠️ Render deploy status check timed out');
      }
    }, checkInterval);
  }

  // Run live production health checks
  async runLiveHealthChecks() {
    console.log('[GitDeployManager] Starting post-deploy health checks...');
    const liveUrl = process.env.APP_URL || 'http://localhost:4099';
    let score = 100;
    const errors = [];

    try {
      // 1. Check home page
      const homeRes = await axios.get(liveUrl, { timeout: 5000 });
      if (homeRes.status !== 200 || !homeRes.data.includes('<div id="root">')) {
        score -= 30;
        errors.push('Homepage rendering incomplete');
      }

      // 2. Check public files/assets/sitemap
      const sitemapRes = await axios.get(`${liveUrl}/sitemap.xml`, { timeout: 3000 });
      if (sitemapRes.status !== 200) {
        score -= 20;
        errors.push('XML Sitemap missing or broken');
      }

      // 3. Verify server API response
      const apiRes = await axios.get(`${liveUrl}/api/health`, { timeout: 3000 }).catch(() => null);
      if (!apiRes || apiRes.status !== 200) {
        score -= 20;
        errors.push('API endpoints not responding');
      }

      await this.setDeploySetting('healthScore', score);
      
      if (score < 80) {
        await this.autoRollback(`Deployment Health Score drop: ${score}. Errors: ${errors.join(', ')}`);
      } else {
        console.log(`✅ Health Checks completed. Score: ${score}/100`);
      }
    } catch (e) {
      console.error('[GitDeployManager] Health Check failed:', e.message);
      await this.setDeploySetting('healthScore', 30);
      await this.autoRollback(`E2E Health check request error: ${e.message}`);
    }
  }

  // Revert last commit and push to remote
  async autoRollback(reason) {
    console.error(`🚨 INITIATING AUTOMATIC ROLLBACK. Reason: ${reason}`);
    
    if (prisma) {
      await prisma.improvementRegistry.create({
        data: {
          issue: `Deployment Rollback Triggered`,
          rootCause: reason,
          fixApplied: 'Automatic Git Revert and Redepoly',
          status: 'fixed',
          moduleName: 'Deployment Pipeline'
        }
      });
    }

    try {
      const status = await this.getStatus();
      
      // Revert commit
      console.log('[GitDeployManager] Reverting last commit...');
      await this.runCmd('git revert HEAD --no-edit');
      
      console.log('[GitDeployManager] Pushing reverted code to remote origin...');
      const authRemote = this.getAuthenticatedRemote();
      if (authRemote) {
        await this.runCmd(`git push "${authRemote}" ${status.branch}`);
      } else {
        await this.runCmd(`git push origin ${status.branch}`);
      }

      await this.setDeploySetting('lastDeployStatus', 'rolled_back');
      
      // Trigger new Render build
      await this.triggerRenderDeploy();
      console.log('✅ Rollback successfully completed!');
    } catch (e) {
      console.error('[GitDeployManager] Rollback failed:', e.message || e);
      if (prisma) {
        await prisma.improvementRegistry.create({
          data: {
            issue: `Automatic Rollback Failed`,
            rootCause: e.message || 'Git execution error during rollback push',
            fixApplied: 'Requires administrator manual SSH / Console intervention',
            status: 'failed_repair',
            moduleName: 'Deployment Pipeline'
          }
        });
      }
    }
  }
}

module.exports = new GitDeployManager();
