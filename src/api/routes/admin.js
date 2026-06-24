/**
 * Admin API Routes — Role-based dashboards
 *
 * Roles:
 *   - superadmin: Full system control (you)
 *   - csc_admin: CSC owner — manage their operators
 *   - operator: VLE — own data only
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { prisma } = require('../../models/database');
const { learningEngine } = require('../../core/learningEngine');
const { conversationMemory } = require('../../core/conversationMemory');

// Role check middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Role required: ${roles.join(' or ')}` });
    }
    next();
  };
}

// All admin routes require authentication
router.use(authenticate);

// ═══════════════════════════════════════════════════════════
//  SUPERADMIN — Full system control
// ═══════════════════════════════════════════════════════════
router.get('/control/overview', requireRole('superadmin', 'csc_admin'), async (req, res) => {
  try {
    const [userCount, jobCount, candidateCount, completedJobs, failedJobs] = await Promise.all([
      prisma?.user?.count() ?? 0,
      prisma?.job?.count() ?? 0,
      prisma?.candidate?.count() ?? 0,
      prisma?.job?.count({ where: { status: 'completed' } }) ?? 0,
      prisma?.job?.count({ where: { status: 'failed' } }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    const learning = learningEngine.getStats();
    const conversations = conversationMemory.getStats();

    res.json({
      success: true,
      data: {
        users: { total: userCount },
        jobs: { total: jobCount, completed: completedJobs, failed: failedJobs },
        candidates: { total: candidateCount },
        learning,
        conversations,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// All users list (superadmin only)
router.get('/control/users', requireRole('superadmin'), async (req, res) => {
  try {
    const users = await prisma?.user?.findMany({
      select: { id: true, email: true, name: true, role: true, is_active: true, csc_id: true, created_at: true },
      orderBy: { created_at: 'desc' },
      take: 100,
    }) || [];
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Skills list with usage stats & status audit
router.get('/control/skills', requireRole('superadmin', 'csc_admin'), async (req, res) => {
  try {
    const { SelfEvolutionAgent } = require('../../core/selfEvolutionAgent');
    const agent = new SelfEvolutionAgent();
    const audit = await agent.checkSkills();

    const masterAgent = req.app.get('masterAgent');
    const registry = masterAgent?.registry;
    if (!registry) return res.json({ success: false, error: 'Skill registry not ready' });

    // Read files dynamically
    const fs = require('fs');
    const path = require('path');
    const skillsDir = path.join(__dirname, '../../skills');
    const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('Skill.js') && f !== 'BaseSkill.js');

    const skillsList = [];

    // Map of loaded skills
    const loadedSkills = new Map();
    for (const s of registry.getAllSkills()) {
      loadedSkills.set(s.name, s);
    }

    // Process files found in directory (including broken/disabled)
    const BaseSkillClass = require('../../skills/BaseSkill').BaseSkill;

    for (const file of files) {
      const filePath = path.join(skillsDir, file);
      let skillName = file.replace('.js', '');
      let displayName = file.replace('Skill.js', '');
      let category = 'general';
      let description = 'Unknown';
      let status = 'Active';
      let version = '1.0.0';
      let requiredAPIs = [];
      let inputType = 'Text';
      let outputType = 'Text';
      let canRunOffline = false;
      let usageCount = 0;
      let successRate = 100;
      let intentsCount = 0;
      let keywordsCount = 0;

      try {
        const module = require(filePath);
        const SkillClass = Object.values(module).find(
          v => typeof v === 'function' && v.prototype instanceof BaseSkillClass
        );
        if (SkillClass) {
          const instance = new SkillClass();
          skillName = instance.name || skillName;
          displayName = instance.displayName || instance.displayNameEn || displayName;
          category = instance.category || category;
          description = instance.description || instance.descriptionEn || description;
          version = instance.version || version;
          requiredAPIs = instance.requiredAPIs || [];
          inputType = instance.inputType || 'Text';
          outputType = instance.outputType || 'Text';
          canRunOffline = instance.canRunOffline || false;
          intentsCount = instance.intents ? instance.intents.length : 0;
          keywordsCount = instance.keywords ? (instance.keywords.hi?.length || 0) + (instance.keywords.en?.length || 0) + (instance.keywords.hinglish?.length || 0) : 0;

          // Check status
          if (instance.disabled) {
            status = 'Disabled';
          } else if (instance.inDevelopment || instance.in_development || instance.status === 'in_development') {
            status = 'In Development';
          } else if (instance.category === 'security' || instance.name === 'security_guardrail' || instance.hidden) {
            status = 'Hidden';
          } else {
            status = 'Active';
          }

          // usage info from live memory if active
          const activeInstance = loadedSkills.get(skillName);
          if (activeInstance) {
            usageCount = activeInstance.usageCount;
            const insights = learningEngine.getSkillInsights(skillName);
            successRate = insights.successRate;
          }
        } else {
          status = 'Broken';
          description = 'No BaseSkill subclass exported';
        }
      } catch (err) {
        status = 'Broken';
        description = `Broken / Syntax Error: ${err.message}`;
      }

      skillsList.push({
        name: skillName,
        displayName,
        category,
        description,
        status,
        version,
        requiredAPIs,
        inputType,
        outputType,
        canRunOffline,
        usageCount,
        successRate,
        intentsCount,
        keywordsCount
      });
    }

    // Add missing skills from audit list
    for (const missing of audit.missingList) {
      skillsList.push({
        name: missing.intent,
        displayName: `Missing: ${missing.intent}`,
        category: 'unknown',
        description: `This intent is mapped in overrides/keywords but its matching Skill file is missing.`,
        status: 'Missing',
        version: '0.0.0',
        requiredAPIs: [],
        inputType: 'Text',
        outputType: 'Text',
        canRunOffline: false,
        usageCount: 0,
        successRate: 0,
        intentsCount: 1,
        keywordsCount: 0
      });
    }

    res.json({
      success: true,
      data: skillsList,
      summary: {
        totalRegistered: audit.totalRegistered,
        totalActive: audit.activeCount,
        totalInDevelopment: audit.devCount,
        totalDisabled: audit.disabledCount,
        totalBroken: audit.brokenCount,
        totalHidden: audit.hiddenCount,
        totalMissing: audit.missingCount
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Self-Healing Status Overview
router.get('/control/self-healing', requireRole('superadmin'), async (req, res) => {
  try {
    const { SelfEvolutionAgent } = require('../../core/selfEvolutionAgent');
    const agent = new SelfEvolutionAgent();
    const report = await agent.getHealthReport();
    res.json({ success: true, data: report });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Run Manual Self-Healing Scan
router.post('/control/self-healing/scan', requireRole('superadmin'), async (req, res) => {
  try {
    const { SelfEvolutionAgent } = require('../../core/selfEvolutionAgent');
    const agent = new SelfEvolutionAgent();
    
    // Run scan async in background
    agent.scanProject()
      .then(rep => console.log('🧬 [SelfHealing] Manual scan completed.'))
      .catch(err => console.error('🧬 [SelfHealing] Manual scan failed:', err.message));
      
    res.json({ success: true, message: 'Self-healing diagnostic scan initiated in background.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Git status and deployment metrics
router.get('/control/git/status', requireRole('superadmin'), async (req, res) => {
  try {
    const manager = require('../../core/gitDeployManager');
    const status = await manager.getStatus();
    res.json({ success: true, data: status });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Commit and push safety checked pipeline
router.post('/control/git/commit-push', requireRole('superadmin'), async (req, res) => {
  try {
    const { commitMessage } = req.body;
    const manager = require('../../core/gitDeployManager');

    // Run in background and broadcast status via Socket.IO
    const io = req.app.get('io');
    const broadcastProgress = (progress) => {
      if (io) io.emit('git_progress', { progress });
    };

    manager.validateCommitAndPush(commitMessage, broadcastProgress)
      .then(result => {
        if (io) io.emit('git_complete', { success: true, commitMsg: result.commitMsg });
      })
      .catch(err => {
        if (io) io.emit('git_complete', { success: false, error: err.message });
      });

    res.json({ success: true, message: 'Deployment pipeline validation started.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Trigger Render deployment hook manually
router.post('/control/git/deploy', requireRole('superadmin'), async (req, res) => {
  try {
    const manager = require('../../core/gitDeployManager');
    const io = req.app.get('io');
    const broadcast = (msg) => {
      if (io) io.emit('git_progress', { progress: msg });
    };

    const triggered = await manager.triggerRenderDeploy(broadcast);
    res.json({ success: triggered, message: triggered ? 'Render deploy triggered!' : 'Hook trigger failed or URL not set.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Revert last commit
router.post('/control/git/rollback', requireRole('superadmin'), async (req, res) => {
  try {
    const manager = require('../../core/gitDeployManager');
    
    // run async
    manager.autoRollback('Manual administrator requested rollback')
      .then(() => console.log('🚨 Manual rollback complete'))
      .catch(e => console.error('🚨 Manual rollback failed:', e.message));

    res.json({ success: true, message: 'Rollback and redeployment process started.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Update Developer Credentials settings
router.post('/control/git/settings', requireRole('superadmin'), async (req, res) => {
  try {
    const { RENDER_DEPLOY_HOOK_URL, RENDER_API_KEY, RENDER_SERVICE_ID, gitRemote } = req.body;
    const manager = require('../../core/gitDeployManager');

    if (RENDER_DEPLOY_HOOK_URL !== undefined) await manager.setDeploySetting('RENDER_DEPLOY_HOOK_URL', RENDER_DEPLOY_HOOK_URL);
    if (RENDER_API_KEY !== undefined) await manager.setDeploySetting('RENDER_API_KEY', RENDER_API_KEY);
    if (RENDER_SERVICE_ID !== undefined) await manager.setDeploySetting('RENDER_SERVICE_ID', RENDER_SERVICE_ID);
    if (gitRemote !== undefined) await manager.setDeploySetting('gitRemote', gitRemote);

    res.json({ success: true, message: 'Settings saved successfully.' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});


// System health
router.get('/control/health', requireRole('superadmin'), (req, res) => {
  try {
    const memUsage = process.memoryUsage();
    const masterAgent = req.app.get('masterAgent');
    const upgrader = req.app.get('nightlyUpgrader');
    const networkMonitor = req.app.get('networkMonitor');

    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        },
        skillsLoaded: masterAgent?.registry?.skills?.size || 0,
        nightlyUpgrade: upgrader?.getSchedule() || null,
        network: networkMonitor?.getStatus() || null,
        node: process.version,
        platform: process.platform,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  CSC ADMIN — CSC owner dashboard
// ═══════════════════════════════════════════════════════════
router.get('/csc/overview', requireRole('csc_admin', 'superadmin'), async (req, res) => {
  try {
    const cscId = req.user.csc_id || req.user.cscId;
    const filter = cscId ? { csc_id: cscId } : {};

    const [operators, totalJobs, completedJobs, candidates] = await Promise.all([
      prisma?.user?.count({ where: { ...filter, role: 'operator' } }) ?? 0,
      prisma?.job?.count({ where: filter }) ?? 0,
      prisma?.job?.count({ where: { ...filter, status: 'completed' } }) ?? 0,
      prisma?.candidate?.count({ where: filter }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    res.json({
      success: true,
      data: {
        cscId,
        operators,
        jobs: { total: totalJobs, completed: completedJobs },
        candidates,
        revenue: completedJobs * 50, // Placeholder ₹50 per completed job
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Operators list (CSC admin sees their own, superadmin sees all)
router.get('/csc/operators', requireRole('csc_admin', 'superadmin'), async (req, res) => {
  try {
    const cscId = req.user.csc_id || req.user.cscId;
    const where = req.user.role === 'superadmin' ? {} : { csc_id: cscId };

    const operators = await prisma?.user?.findMany({
      where: { ...where, role: { in: ['operator', 'csc_admin'] } },
      select: { id: true, name: true, email: true, role: true, is_active: true, created_at: true },
    }) || [];

    res.json({ success: true, data: operators });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════
//  VLE / OPERATOR — Personal dashboard
// ═══════════════════════════════════════════════════════════
router.get('/vle/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    const [myJobs, myCompleted, myCandidates] = await Promise.all([
      prisma?.job?.count({ where: { user_id: userId } }) ?? 0,
      prisma?.job?.count({ where: { user_id: userId, status: 'completed' } }) ?? 0,
      prisma?.candidate?.count({ where: { user_id: userId } }) ?? 0,
    ].map(p => Promise.resolve(p).catch(() => 0)));

    // Get user's own conversation history
    const myConvos = conversationMemory.getUserSkills(userId);

    res.json({
      success: true,
      data: {
        userId,
        name: req.user.name,
        jobs: { total: myJobs, completed: myCompleted },
        candidates: myCandidates,
        skillsUsed: myConvos.length,
        recentSkills: myConvos.slice(0, 5),
        earnings: myCompleted * 30, // Placeholder ₹30 per completed job
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
